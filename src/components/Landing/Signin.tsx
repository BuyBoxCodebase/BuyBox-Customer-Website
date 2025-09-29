import React from "react";
import GoogleSignInButton from "../auth/GoogleSignInButton";
import { useAuth } from "@/context/AuthContext";
import { useEventTracking } from "@/hooks/analytics";
import { Button } from "../ui/button";

const Signin = () => {
    const handleGoogleSignIn = async () => {
      window.location.href = `/user/login`;
    };
  const { isAuthenticated } = useAuth();
  return (
    !isAuthenticated && (
      <div className="container w-full py-4 px-2 mx-auto md:px-4 lg:px-8">
        <p className="font-bold pb-4 ml-2 sm:text-2xl text-xl">
          Sign in for the best experience
        </p>
        <Button
      variant="yellow"
      className="w-full h-11 rounded-full"
      onClick={handleGoogleSignIn}>
      <div className="flex items-center justify-center gap-2 h-full">
       
        Sign in directly
      </div>
    </Button>
      </div>
    )
  );
};

export default Signin;
