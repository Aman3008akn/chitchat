import React from 'react';
import { Wrench } from 'lucide-react';

interface MaintenanceProps {
  message: string;
}

export const Maintenance: React.FC<MaintenanceProps> = ({ message }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#1a1a2e',
      color: '#e0e0e0',
      fontFamily: 'Arial, sans-serif',
      textAlign: 'center',
      padding: '20px'
    }}>
      <Wrench size={64} color="#8e2de2" style={{ marginBottom: '20px' }} />
      <h1 style={{ fontSize: '2.5em', marginBottom: '10px' }}>Under Maintenance</h1>
      <p style={{ fontSize: '1.2em', maxWidth: '600px' }}>{message}</p>
      <p style={{ fontSize: '0.9em', marginTop: '20px', color: '#a0a0a0' }}>
        We apologize for any inconvenience. Please check back soon!
      </p>
    </div>
  );
};
