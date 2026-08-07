'use client';
import { Suspense } from "react";
import { motion } from "framer-motion";
import Hero from "@/components/Landing/Hero";
import LandingPage from "@/components/Landing/LandingPage";
import { usePageTracking } from "../hooks/analytics";
import Signin from "@/components/Landing/Signin";
import WelcomeBackModal from "@/components/ui/WelcomeBackModal";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";

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

function PageContent() {
  usePageTracking();
  const { showWelcomeModal, hideWelcomeModal, user } = useAuth();
  return (
    <>
      <Navbar />
      <Hero />
      <Signin />
      <LandingPage />
      <WelcomeBackModal
        isOpen={showWelcomeModal}
        onClose={hideWelcomeModal}
        userName={user?.name}
      />
      <Footer />
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<LoadingAnimation />}>
      <PageContent />
    </Suspense>
  );
}