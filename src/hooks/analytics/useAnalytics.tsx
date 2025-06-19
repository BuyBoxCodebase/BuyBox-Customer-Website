
import { useEffect, useState } from 'react';
import { getAnalytics, logEvent, Analytics, setUserId, setUserProperties } from 'firebase/analytics';
import { app } from '../../firebase/FirebaseConfig';

export const useAnalytics = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const analyticsInstance = getAnalytics(app);
        setAnalytics(analyticsInstance);
      } catch (error) {
        console.error('Failed to initialize analytics:', error);
      }
    }
  }, []);

  const trackEvent = (eventName: string, eventParams?: Record<string, any>) => {
    if (!analytics) return;
    
    try {
     // console.log(`Tracking event "${eventName}" with params:`, eventParams);
      logEvent(analytics, eventName, eventParams);
    } catch (error) {
      console.error(`Failed to track event "${eventName}":`, error);
    }
  };

  const setAnalyticsUserId = (userId: string | null) => {
    if (!analytics) return;
    
    try {
      setUserId(analytics, userId);
    } catch (error) {
      console.error('Failed to set user ID:', error);
    }
  };

  const setAnalyticsUserProperties = (properties: Record<string, any>) => {
    if (!analytics) return;
    
    try {
      setUserProperties(analytics, properties);
    } catch (error) {
      console.error('Failed to set user properties:', error);
    }
  };

  return {
    analytics,
    trackEvent,
    setUserId: setAnalyticsUserId,
    setUserProperties: setAnalyticsUserProperties
  };
};