"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { headers } from "next/headers";
import { usePageTracking } from "@/hooks/analytics";

function VerifyPageContent() {
  const router = useRouter();
  usePageTracking();
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(30);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const { verify, error } = useAuth();

  // console.log(localStorage.getItem("activationToken"));

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0 && isResendDisabled) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setIsResendDisabled(false);
    }
    return () => clearInterval(interval);
  }, [timer, isResendDisabled]);

  useEffect(() => {
    if (verificationStatus === "success") {
      // Add a small delay before redirect to show the success message
      const redirectTimeout = setTimeout(() => {
        router.push("/");
      }, 1500);

      return () => clearTimeout(redirectTimeout);
    }
  }, [verificationStatus, router]);

  const handleComplete = async (completedOtp: string) => {
    // console.log(completedOtp);
    setOtp(completedOtp);
    setIsVerifying(true);

    try {
      // Simulate API call
      // await new Promise((resolve) => setTimeout(resolve, 1500));
      await verify({
        activationCode: otp,
        activationToken: localStorage.getItem("activationToken") || "",
      });
      setVerificationStatus("success");

      // For demo purposes, let's consider "123456" as the correct OTP
      // if (completedOtp === "123456") {
      //   setVerificationStatus("success");
      // } else {
      //   throw new Error("Invalid verification code");
      // }
    } catch (err) {
      error;
      setVerificationStatus("error");
      setOtp(""); // Clear the OTP input on error
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setIsResendDisabled(true);
    setTimer(30);
    setVerificationStatus("idle");
    setOtp("");

    try {
      // Simulate API call
      await verify({
        activationCode: otp,
        activationToken: localStorage.getItem("activationToken") || "",
      });
      // Add actual resend logic here
    } catch (err) {
      console.error("Error resending code:", err);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50'>
      <div className='w-full max-w-md bg-white shadow-lg rounded-lg p-6 sm:p-8 m-4'>
        <div className='space-y-6'>
          <div className='text-center'>
            <h2 className='text-2xl font-bold'>OTP Verification</h2>
            <p className='text-gray-600 mt-2'>
              Please enter the 6-digit code sent to your email or phone.
            </p>
          </div>

          {verificationStatus === "error" && error && (
            <Alert variant='destructive'>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {verificationStatus === "success" && (
            <Alert className='bg-green-50 border-green-200'>
              <AlertDescription className='text-green-800'>
                Verification successful! Redirecting you to the homepage...
              </AlertDescription>
            </Alert>
          )}

          <div className='space-y-4'>
            <div className='flex justify-center'>
              <InputOTP
                value={otp}
                onChange={setOtp}
                onComplete={handleComplete}
                maxLength={6}
                containerClassName='flex justify-center gap-2'
                disabled={isVerifying || verificationStatus === "success"}
              >
                <InputOTPGroup>
                  {Array.from({ length: 6 }).map((_, index) => (
                    <InputOTPSlot
                      key={index}
                      index={index}
                      className='w-10 h-10 sm:w-12 sm:h-12 text-center text-lg'
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>

            <div className='flex flex-col items-center gap-4'>
              {isVerifying && (
                <div className='flex items-center gap-2 text-sm text-gray-600'>
                  <Loader2 className='h-4 w-4 animate-spin' />
                  Verifying...
                </div>
              )}

              <div className='flex items-center gap-2'>
                <Button
                  variant='ghost'
                  onClick={handleResend}
                  disabled={
                    isResendDisabled ||
                    isVerifying ||
                    verificationStatus === "success"
                  }
                  className='text-sm'
                >
                  {isResendDisabled ? (
                    <span>Resend code in {timer}s</span>
                  ) : (
                    "Resend code"
                  )}
                </Button>
              </div>
            </div>
          </div>

          <div className='text-center text-sm text-gray-500'>
            <p>
              Didn't receive the code?{" "}
              <a
                target='__blank'
                href='mailto:buyboxsupp0rt@yahoo.com'
                className='text-blue-600 hover:underline'
              >
                Contact Support
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyPageContent />
    </Suspense>
  );
}
