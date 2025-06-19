import React from "react";
import GoogleSignInButton from "../auth/GoogleSignInButton";
import { useAuth } from "@/context/AuthContext";

const Signin = () => {
  const { isAuthenticated } = useAuth();
  return (
    !isAuthenticated && (
      <div className="container w-full py-4 px-2 mx-auto md:px-4 lg:px-8">
        <p className="font-bold pb-4 ml-2 sm:text-2xl text-xl">
          Sign in for the best experience
        </p>
        <GoogleSignInButton />
      </div>
    )
  );
};

export default Signin;
