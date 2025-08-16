import { UIConfig } from '@/types/ui-config';

export class ConfigService {
  private static instance: ConfigService;
  private config: UIConfig | null = null;
  private lastFetchTime: number = 0;
  private fetchInterval: number = 30000; // 30 seconds
  private listeners: Set<(config: UIConfig) => void> = new Set();

  private constructor() {}

  static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  // Subscribe to config updates
  subscribe(callback: (config: UIConfig) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // Notify all listeners of config changes
  private notifyListeners(config: UIConfig) {
    this.listeners.forEach(callback => callback(config));
  }

  // Fetch the latest configuration
  async fetchLatestConfig(): Promise<UIConfig | null> {
    try {
      // Add cache busting parameter
      const cacheBuster = Date.now();
      const response = await fetch('/.netlify/functions/get-ui-config?v=' + cacheBuster);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newConfig: UIConfig = await response.json();
      
      // Check if config has actually changed
      if (!this.config || this.config.version !== newConfig.version || 
          this.config.lastUpdated !== newConfig.lastUpdated) {
        
        console.log('🎨 New UI config detected, applying changes...');
        this.config = newConfig;
        this.applyConfigInstantly(newConfig);
        this.notifyListeners(newConfig);
        
        // Store in localStorage for offline access
        localStorage.setItem('ui-config', JSON.stringify(newConfig));
        localStorage.setItem('ui-config-timestamp', Date.now().toString());
      }

      this.lastFetchTime = Date.now();
      return newConfig;
    } catch (error) {
      console.warn('Failed to fetch UI config, using cached version:', error);
      return this.loadCachedConfig();
    }
  }

  // Load cached configuration from localStorage
  private loadCachedConfig(): UIConfig | null {
    try {
      const cachedConfig = localStorage.getItem('ui-config');
      if (cachedConfig) {
        const config = JSON.parse(cachedConfig);
        this.config = config;
        this.applyConfigInstantly(config);
        return config;
      }
    } catch (error) {
      console.warn('Failed to load cached config:', error);
    }
    return null;
  }

  // Apply configuration instantly to the DOM
  applyConfigInstantly(config: UIConfig) {
    const root = document.documentElement;

    // Apply theme colors
    root.style.setProperty('--config-primary', config.theme.primaryColor);
    root.style.setProperty('--config-secondary', config.theme.secondaryColor);
    root.style.setProperty('--config-background', config.theme.backgroundColor);
    root.style.setProperty('--config-surface', config.theme.surfaceColor);
    root.style.setProperty('--config-text', config.theme.textColor);
    root.style.setProperty('--config-text-secondary', config.theme.textSecondaryColor);
    root.style.setProperty('--config-border', config.theme.borderColor);
    root.style.setProperty('--config-accent', config.theme.accentColor);
    root.style.setProperty('--config-success', config.theme.successColor);
    root.style.setProperty('--config-error', config.theme.errorColor);
    root.style.setProperty('--config-warning', config.theme.warningColor);

    // Apply typography
    root.style.setProperty('--config-font-family', config.typography.fontFamily);
    root.style.setProperty('--config-font-size-xs', config.typography.fontSize.xs);
    root.style.setProperty('--config-font-size-sm', config.typography.fontSize.sm);
    root.style.setProperty('--config-font-size-base', config.typography.fontSize.base);
    root.style.setProperty('--config-font-size-lg', config.typography.fontSize.lg);
    root.style.setProperty('--config-font-size-xl', config.typography.fontSize.xl);
    root.style.setProperty('--config-font-size-2xl', config.typography.fontSize['2xl']);
    root.style.setProperty('--config-font-size-3xl', config.typography.fontSize['3xl']);

    // Apply layout
    root.style.setProperty('--config-sidebar-width', config.layout.sidebarWidth);
    root.style.setProperty('--config-border-radius-sm', config.layout.borderRadius.sm);
    root.style.setProperty('--config-border-radius-md', config.layout.borderRadius.md);
    root.style.setProperty('--config-border-radius-lg', config.layout.borderRadius.lg);
    root.style.setProperty('--config-border-radius-xl', config.layout.borderRadius.xl);
    root.style.setProperty('--config-spacing-xs', config.layout.spacing.xs);
    root.style.setProperty('--config-spacing-sm', config.layout.spacing.sm);
    root.style.setProperty('--config-spacing-md', config.layout.spacing.md);
    root.style.setProperty('--config-spacing-lg', config.layout.spacing.lg);
    root.style.setProperty('--config-spacing-xl', config.layout.spacing.xl);
    root.style.setProperty('--config-message-spacing', config.layout.messageSpacing);

    // Apply animations
    root.style.setProperty('--config-duration-fast', config.animations.duration.fast);
    root.style.setProperty('--config-duration-normal', config.animations.duration.normal);
    root.style.setProperty('--config-duration-slow', config.animations.duration.slow);
    root.style.setProperty('--config-easing', config.animations.easing);

    // Apply feature flags as CSS classes
    root.classList.toggle('config-compact-mode', config.features.compactMode);
    root.classList.toggle('config-animations-disabled', !config.features.enableAnimations);
    root.classList.toggle('config-timestamps-hidden', !config.features.showTimestamps);

    console.log('✅ UI configuration applied successfully');
  }

  // Start auto-refresh
  startAutoRefresh() {
    // Initial fetch
    this.fetchLatestConfig();

    // Set up interval for periodic checks
    setInterval(() => {
      this.fetchLatestConfig();
    }, this.fetchInterval);

    console.log('🔄 Auto-refresh started for UI config');
  }

  // Get current configuration
  getCurrentConfig(): UIConfig | null {
    return this.config;
  }

  // Force refresh configuration
  async forceRefresh(): Promise<UIConfig | null> {
    this.lastFetchTime = 0; // Reset to force fetch
    return await this.fetchLatestConfig();
  }

  // Update fetch interval
  setFetchInterval(interval: number) {
    this.fetchInterval = interval;
  }

  // Check if config is stale
  isConfigStale(): boolean {
    return Date.now() - this.lastFetchTime > this.fetchInterval;
  }

  // Get config age in seconds
  getConfigAge(): number {
    return Math.floor((Date.now() - this.lastFetchTime) / 1000);
  }
}

// Export singleton instance
export const configService = ConfigService.getInstance();
