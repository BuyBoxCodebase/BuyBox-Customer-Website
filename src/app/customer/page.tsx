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
    const token = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");
    if (token && refreshToken) {
      localStorage.setItem("accessToken", token);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("token", token); 
      
      Cookies.set("accessToken", token, {
        expires: 7,
        path: "/",
        sameSite: "strict",
      });
      Cookies.set("refreshToken", refreshToken, {
        expires: 7,
        path: "/",
        sameSite: "strict",
      });
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