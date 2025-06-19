// src/hooks/analytics/useEventTracking.tsx
import { useAnalytics } from './useAnalytics';

export const useEventTracking = () => {
  const { trackEvent } = useAnalytics();

  const trackClick = (elementName: string, additionalParams?: Record<string, any>) => {
    trackEvent('click', {
      element_name: elementName,
      ...additionalParams
    });
  };

  const trackFormSubmit = (formName: string, success: boolean, additionalParams?: Record<string, any>) => {
    trackEvent('form_submit', {
      form_name: formName,
      success,
      ...additionalParams
    });
  };

  const trackSearch = (searchTerm: string, resultCount?: number) => {
    trackEvent('search', {
      search_term: searchTerm,
      result_count: resultCount
    });
  };

  const trackAddtoCart = (productId: string, quantity: number, price: number) => {
    trackEvent('add_to_cart', {
      product_id: productId,
      quantity,
      price
    });
  }

  const trackOrder = (orderId: string, total: number, currency: string,phoneNumber:string) => {
    trackEvent('order', {
      order_id: orderId,
      total,
      currency,
      phoneNumber
    });
  }


  const trackCustomEvent = (eventName: string, params?: Record<string, any>) => {
    trackEvent(eventName, params);
  };

  return {
    trackClick,
    trackFormSubmit,
    trackSearch,
    trackCustomEvent,
    trackAddtoCart,
    trackOrder
  };
};