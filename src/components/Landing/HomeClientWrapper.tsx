'use client';

import { useEffect } from 'react';
import { usePageTracking } from "@/hooks/analytics";
import WelcomeBackModal from "@/components/ui/WelcomeBackModal";
import { useAuth } from "@/context/AuthContext";
import { trackEvent } from "@/lib/analytics/core";
import { ProductEventType } from "@/lib/analytics/constants";

export default function HomeClientWrapper() {
  usePageTracking();
  const { showWelcomeModal, hideWelcomeModal, user } = useAuth();

  useEffect(() => {
    trackEvent({ type: ProductEventType.HOME_VIEWED });
  }, []);


  return (
    <WelcomeBackModal
      isOpen={showWelcomeModal}
      onClose={hideWelcomeModal}
      userName={user?.name}
    />
  );
}
