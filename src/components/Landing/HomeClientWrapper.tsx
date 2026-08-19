'use client';

import { usePageTracking } from "@/hooks/analytics";
import WelcomeBackModal from "@/components/ui/WelcomeBackModal";
import { useAuth } from "@/context/AuthContext";

export default function HomeClientWrapper() {
  usePageTracking();
  const { showWelcomeModal, hideWelcomeModal, user } = useAuth();

  return (
    <WelcomeBackModal
      isOpen={showWelcomeModal}
      onClose={hideWelcomeModal}
      userName={user?.name}
    />
  );
}
