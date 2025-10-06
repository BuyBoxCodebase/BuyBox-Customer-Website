"use client";

// import { AdBanner } from "@/components/ad/ad-banner";
import ComingSoon from "@/components/comming-soon/comming-soon";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { usePageTracking } from "@/hooks/analytics";
import { Suspense } from "react";
function ComingSoonPageContent() {
  usePageTracking();
  return <ComingSoon />;
}

export default function ComingSoonPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <ComingSoonPageContent />
    </Suspense>
  );
}
