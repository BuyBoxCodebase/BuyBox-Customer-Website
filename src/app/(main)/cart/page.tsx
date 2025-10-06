"use client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CartTable from "@/components/cart/CartTable";
import OrderSummary from "@/components/cart/OrderSummary";
import { usePageTracking } from "@/hooks/analytics";
import { Suspense } from "react";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

function CartPageContent() {
  usePageTracking();
  return (
    <div className='min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-6xl mx-auto'>
        {/* Back to Shopping link */}
        <Link
          href='/'
          className='items-center text-gray-600 hover:text-gray-900 mb-6 hidden md:inline-flex'
        >
          <ArrowLeft className='w-5 h-5 mr-2' />
          Back to Shopping
        </Link>

        <h1 className='text-2xl font-bold mb-6'>Shopping Cart</h1>

        {/* Two-column layout on large screens */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Cart Items (spans 2 columns on large screens) */}
          <div className='lg:col-span-2'>
            <CartTable />
          </div>

          {/* Order Summary (1 column on large screens) */}
          <div>
            <OrderSummary />
          </div>
        </div>
      </div>
    </div>
  );
}
export default function CartPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <CartPageContent />
    </Suspense>
  );
}
