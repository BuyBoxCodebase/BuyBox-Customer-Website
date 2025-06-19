"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { usePageTracking } from "@/hooks/analytics";
import Cookies from "js-cookie";

export default function () {
  return (
    <Suspense>
      <CustomerPageContent />
    </Suspense>
  );
}

function CustomerPageContent() {
  usePageTracking();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const success = searchParams.get("auth");
    if (success == "success" ) {
      window.location.href = "/";
    }
    else if (success == "pending") {
      window.location.href = "/user/onboarding";
    }
    else{
      window.location.href = "/";
    }
  }, [router, searchParams]);

  return null;
}
