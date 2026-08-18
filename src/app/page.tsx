import { Suspense } from "react";
import Hero from "@/components/Landing/Hero";
import LandingPage from "@/components/Landing/LandingPage";
import Signin from "@/components/Landing/Signin";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";
import HomeClientWrapper from "@/components/Landing/HomeClientWrapper";
import { getCategories } from "@/lib/get-category";
import LandingPageSkeleton from "@/components/Skeleton/LandingSkeleton";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Signin />
      
      <Suspense fallback={<div className="container mx-auto px-4 pt-8"><LandingPageSkeleton /></div>}>
        <LandingPage />
      </Suspense>

      <Suspense fallback={null}>
        <HomeClientWrapper />
      </Suspense>
      <Footer />
    </>
  );
}