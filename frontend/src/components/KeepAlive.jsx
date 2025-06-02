import React, { useEffect, useRef } from 'react';
import { API_BASE_URL } from '../config/environment.js';

/**
 * KeepAlive Component
 * 
 * 15min no request, Render free service will sleep
 * ping every 10 minutes
 */
const KeepAlive = () => {
  const intervalRef = useRef(null);
  const lastPingRef = useRef(null);

  const pingServer = async () => {
    try {
      const startTime = Date.now();
      console.log('🔄 KeepAlive: Pinging server to prevent sleep...');
      
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      if (response.ok) {
        const data = await response.json();
        lastPingRef.current = new Date().toLocaleTimeString();
        console.log(`✅ KeepAlive: Server is healthy (${responseTime}ms)`, data);
      } else {
        console.warn('⚠️ KeepAlive: Server health check failed:', response.status);
      }
    } catch (error) {
      console.error('❌ KeepAlive: Failed to ping server:', error.message);
    }
  };

  useEffect(() => {
    // immediately ping once
    pingServer();
    
    // set timer, ping every 10 minutes (600,000 milliseconds)
    // Render will sleep after 15 minutes of no request, so 10 minutes is a safe interval
    intervalRef.current = setInterval(pingServer, 10 * 60 * 1000);
    
    console.log('🚀 KeepAlive: Service started - will ping every 10 minutes');

    // cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        console.log('🛑 KeepAlive: Service stopped');
      }
    };
  }, []);

  // show status indicator in development environment
  if (process.env.NODE_ENV === 'development') {
    return (
      <div 
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '20px',
          fontSize: '12px',
          zIndex: 9999,
          fontFamily: 'monospace'
        }}
        title="KeepAlive service to prevent Render from sleeping"
      >
        🔄 KeepAlive: {lastPingRef.current || 'Starting...'}
      </div>
    );
  }

  // don't show any UI in production environment
  return null;
};

export default KeepAlive; 