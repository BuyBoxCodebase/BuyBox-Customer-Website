"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { usePageTracking } from "@/hooks/analytics";
import Cookies from "js-cookie";
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
   const refreshToken = searchParams.get("refreshToken");
    if (token) {
      localStorage.setItem("token", token);
      //localStorage.setItem("refreshToken", refreshToken);
       Cookies.set("token", token, {
          expires: 7,
          path: "/",
          sameSite: "strict",
        });
    }
    window.location.href = "/";
  }, [router, searchParams]);

  return null;
}