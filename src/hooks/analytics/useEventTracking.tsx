// src/hooks/analytics/useEventTracking.tsx
import { useAnalytics } from './useAnalytics';
import { trackEvent as trackBackendEvent } from '@/lib/analytics/core';
import { UserEventType } from '@/lib/analytics/constants';

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

  const trackProductView = (productId: string) => {
    trackBackendEvent({
      type: UserEventType.VIEW,
      productId,
    });
  };

  const trackAddtoCart = (productId: string, quantity: number, price: number) => {
    trackEvent('add_to_cart', {
      product_id: productId,
      quantity,
      price
    });
    trackBackendEvent({
      type: UserEventType.CART_ADD,
      productId,
      metadata: { quantity, price }
    });
  }

  const trackOrder = (orderId: string, total: number, currency: string,phoneNumber:string) => {
    trackEvent('order', {
      order_id: orderId,
      total,
      currency,
      phoneNumber
    });
    trackBackendEvent({
      type: UserEventType.PURCHASE,
      metadata: { orderId, total, currency, phoneNumber }
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
    trackOrder,
    trackProductView
  };
};