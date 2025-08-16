import { useState, useEffect } from 'react';
import { configService } from '@/services/configService';
import { UIConfig } from '@/types/ui-config';

export const useUIConfig = () => {
  const [config, setConfig] = useState<UIConfig | null>(configService.getCurrentConfig());
  const [isLoading, setIsLoading] = useState<boolean>(!config);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleConfigUpdate = (newConfig: UIConfig) => {
      setConfig(newConfig);
      setIsLoading(false);
    };

    // Subscribe to updates
    const unsubscribe = configService.subscribe(handleConfigUpdate);

    // Initial fetch
    if (!config) {
      configService.fetchLatestConfig().catch(err => {
        setError(err.message);
        setIsLoading(false);
      });
    }

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, [config]);

  return { config, isLoading, error };
};
