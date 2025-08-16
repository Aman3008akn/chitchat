export interface UIConfig {
  version: string;
  lastUpdated: string;
  theme: ThemeConfig;
  typography: TypographyConfig;
  layout: LayoutConfig;
  animations: AnimationConfig;
  features: FeatureConfig;
  branding: BrandingConfig;
}

export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  textSecondaryColor: string;
  borderColor: string;
  accentColor: string;
  successColor: string;
  errorColor: string;
  warningColor: string;
}

export interface TypographyConfig {
  fontFamily: string;
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
  };
  fontWeight: {
    normal: string;
    medium: string;
    semibold: string;
    bold: string;
  };
}

export interface LayoutConfig {
  sidebarWidth: string;
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  messageSpacing: string;
  maxChatWidth: string;
}

export interface AnimationConfig {
  duration: {
    fast: string;
    normal: string;
    slow: string;
  };
  easing: string;
}

export interface FeatureConfig {
  showWelcomeScreen: boolean;
  enableAnimations: boolean;
  showTypingIndicator: boolean;
  enableSoundEffects: boolean;
  compactMode: boolean;
  showTimestamps: boolean;
  enableMarkdown: boolean;
}

export interface BrandingConfig {
  appName: string;
  tagline: string;
  showBranding: boolean;
  customLogo: string | null;
}

export interface ConfigUpdateEvent {
  type: 'config-update';
  config: UIConfig;
  timestamp: string;
}
