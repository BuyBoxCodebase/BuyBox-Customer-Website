import { Suspense } from "react";
import Hero from "@/components/Landing/Hero";
import HomeCategories from "@/components/Landing/HomeCategories";
import HomePagePopularProducts from "@/components/Landing/HomePagePopularProducts";
import Signin from "@/components/Landing/Signin";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";
import HomeClientWrapper from "@/components/Landing/HomeClientWrapper";
import { getCategories } from "@/lib/get-category";
import LandingPageSkeleton  from "@/components/Skeleton/LandingSkeleton";
import HomeRecommendations from "@/components/recommendation/HomeRecommendations";

export default async function Home() {
  const categories = await getCategories();

  return (
    <>
      <Navbar />
      <Hero />
      <Signin />
      <Suspense fallback={<div className="container mx-auto px-4 pt-8"><LandingPageSkeleton /></div>}>
        <HomeCategories />
      </Suspense>
      
      <HomePagePopularProducts />

      <HomeRecommendations categories={categories} />
      <Suspense fallback={null}>
        <HomeClientWrapper />
      </Suspense>
      <Footer />
    </>
  );
}