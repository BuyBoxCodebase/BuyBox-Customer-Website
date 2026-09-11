"use client";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { usePageTracking } from "@/hooks/analytics";
import useForYouProducts from "@/hooks/products/useForYouProducts";
import { Suspense } from "react";
import { useAuth } from "@/context/AuthContext";
import { MasonryGrid } from "@/components/ui/MasonryGrid";
import { MasonryProductCard } from "@/components/ui/MasonryProductCard";
import { Product } from "@/types/product";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 24,
    },
  },
};

function ForYouPageContent() {
  const { products, loading } = useForYouProducts(50);
  const { isAuthenticated } = useAuth();
  usePageTracking();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
        <h1 className="text-3xl font-bold mb-4">Personalized Recommendations</h1>
        <p className="text-gray-600 mb-8 max-w-md">
          Sign in to see products tailored just for you based on your interests and browsing history.
        </p>
        <Link href="/login">
          <Button size="lg" className="px-8">
            Sign In
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      className="container mx-auto px-2 md:px-4 lg:px-4 py-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="mb-8 pl-2 md:pl-4" variants={itemVariants}>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
          More for You
        </h1>
        <p className="text-gray-600 text-sm mt-2">
          Curated just for you based on your unique style and interests.
        </p>
      </motion.div>

      {products.length > 0 ? (
        <MasonryGrid
          items={products}
          distributeLeftToRight={true}
          renderItem={(product: Product) => (
            <motion.div key={product.id} variants={itemVariants} className="w-full relative group">
              <MasonryProductCard product={product} dynamicBackground={false}  hideBadge showAddToCart/>
            </motion.div>
          )}
          placeholders={[
            "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80",
            "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80",
            "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80",
            "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80"
          ]}
        />
      ) : (
        <div className="text-center py-16">
          <h2 className="text-2xl font-semibold mb-2">Nothing to show yet</h2>
          <p className="text-gray-600">
            Keep browsing and interacting with products to get personalized recommendations!
          </p>
          <Link href="/market" className="mt-6 inline-block text-blue-600 hover:underline">
            Explore Trending Products &rarr;
          </Link>
        </div>
      )}
    </motion.div>
  );
}

export default function ForYouPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <ForYouPageContent />
    </Suspense>
  );
}
