"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { usePageTracking } from "@/hooks/analytics";

export default function () {
  
  return(
    <Suspense>
      <CustomerPageContent />
    </Suspense>
  )
}

function CustomerPageContent(){
  usePageTracking();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      localStorage.setItem("token", token);
    }
    window.location.href = "/";
  }, [router, searchParams]);

  return null;
}