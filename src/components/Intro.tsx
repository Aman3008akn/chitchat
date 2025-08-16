import React from 'react';
import './Intro.css';
import { useUIConfig } from '@/hooks/useUIConfig';
import { Skeleton } from './ui/skeleton';

const Intro: React.FC<{ show: boolean }> = ({ show }) => {
  const { config, isLoading } = useUIConfig();

  return (
    <div className={`intro-container ${!show ? 'fade-out' : ''}`}>
      <div className="particles"></div>
      <div className="content">
        {isLoading ? (
          <>
            <Skeleton className="h-16 w-64 mb-4" />
            <Skeleton className="h-6 w-48" />
          </>
        ) : (
          <>
            <h1 className="title">{config?.branding.appName || 'ChitChat'}</h1>
            {config?.branding.showBranding && (
              <p className="subtitle">{config?.branding.tagline || '(By Aman Shukla)'}</p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Intro;
