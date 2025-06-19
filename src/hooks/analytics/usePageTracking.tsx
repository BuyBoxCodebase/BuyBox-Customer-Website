// src/hooks/analytics/usePageTracking.tsx
'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useAnalytics } from './useAnalytics';

export const usePageTracking = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { trackEvent } = useAnalytics();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    const trackPageView = () => {
      trackEvent('page_view', {
        page_path: url,
        page_title: document.title,
        page_location: window.location.href
      });
    };
    // console.log('Page view tracked:', url);

    trackPageView();
  }, [pathname, searchParams, trackEvent, mounted]);
};