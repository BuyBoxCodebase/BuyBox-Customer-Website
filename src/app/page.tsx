"use client";

import { Suspense } from "react";
import { motion } from "framer-motion";
import Hero from "@/components/Landing/Hero";
import LandingPage from "@/components/Landing/LandingPage";
import { usePageTracking } from "../hooks/analytics";
import AdBanner from "@/components/ad/ad-banner";
import Signin from "@/components/Landing/Signin";
import WelcomeBackModal from "@/components/ui/WelcomeBackModal";
import { useAuth } from "@/context/AuthContext";
// Animated fallback using Framer Motion
const LoadingAnimation = () => (
  <motion.div
    className="flex items-center justify-center min-h-screen"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.5 }}>
    <div className="text-2xl font-bold">Loading...</div>
  </motion.div>
);

// A separate component that uses the hook and renders page content
function PageContent() {
  usePageTracking();
  const { showWelcomeModal, hideWelcomeModal, user } = useAuth();
  
  return (
    <>
      <Hero />
      <Signin />
      {/* <AdBanner /> */}
      <LandingPage />
      <WelcomeBackModal 
        isOpen={showWelcomeModal}
        onClose={hideWelcomeModal}
        userName={user?.name}
      />
    </>
  );
}

// Home component wraps PageContent with Suspense
export default function Home() {
  return (
    <Suspense fallback={<LoadingAnimation />}>
      <PageContent />
    </Suspense>
  );
}
