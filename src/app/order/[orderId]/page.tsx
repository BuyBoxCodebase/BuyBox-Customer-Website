"use client";

import { useParams } from "next/navigation";
import useGetOrderDetails from "@/hooks/order/useGetOrderDetails";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { usePageTracking } from "@/hooks/analytics";
import Image from "next/image";
import Link from "next/link";

function OrderConfirmationPage() {
  const params = useParams();
  usePageTracking();
  const orderId = Array.isArray(params.orderId)
    ? params.orderId[0]
    : params.orderId;

  const { orderDetails, loading, error } = useGetOrderDetails(orderId);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !orderDetails) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold text-red-600">Error</h2>
          <p className="text-gray-600">Unable to load order details</p>
        </div>
      </motion.div>
    );
  }

  // Format date to a readable format
  const formattedDate = new Date(orderDetails.createdAt).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto pt-4 pb-16 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-lg shadow-lg p-6 space-y-8">
        {/* Order ID Section */}
        <div className="text-center border-b pb-4">
          <h1 className="text-2xl font-bold">Order Details</h1>
          <p className="text-gray-600 mt-1">Order #{orderId}</p>
          <div
            className="mt-2 inline-block px-3 py-1 rounded-full text-sm font-medium capitalize"
            style={{
              backgroundColor:
                orderDetails.status === "PENDING"
                  ? "#FEF3C7"
                  : orderDetails.status === "COMPLETED"
                  ? "#D1FAE5"
                  : orderDetails.status === "PROCESSING"
                  ? "#DBEAFE"
                  : "#FEE2E2",
              color:
                orderDetails.status === "PENDING"
                  ? "#92400E"
                  : orderDetails.status === "COMPLETED"
                  ? "#065F46"
                  : orderDetails.status === "PROCESSING"
                  ? "#1E40AF"
                  : "#B91C1C",
            }}>
            {orderDetails.status?.toLowerCase()}
          </div>
          <p className="text-gray-500 mt-2 text-sm">{formattedDate}</p>
        </div>

        {/* Delivery Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4">
          <h2 className="text-xl font-semibold">Delivery Information</h2>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <p className="text-gray-600">Email</p>
              <p className="font-medium">{orderDetails.email}</p>
            </div>
            <div className="space-y-1">
              <p className="text-gray-600">Phone</p>
              <p className="font-medium">{orderDetails.phoneNumber}</p>
            </div>
            <div className="sm:col-span-2 space-y-1">
              <p className="text-gray-600">Address</p>
              <p className="font-medium">{orderDetails.address}</p>
            </div>
            <div className="sm:col-span-2 space-y-1">
              <p className="text-gray-600">Payment Method</p>
              <p className="font-medium">
                {orderDetails.paymentMode === "CASH_ON_DELIVERY"
                  ? "Cash on Delivery"
                  : "Online Payment"}
              </p>
            </div>
            {orderDetails.deliveryAgent && (
              <div className="sm:col-span-2 space-y-1">
                <p className="text-gray-600">Delivery Agent</p>
                <p className="font-medium">{orderDetails.deliveryAgent.name}</p>
                {orderDetails.deliveryAgent.contactInfo && (
                  <p className="text-sm text-gray-500">
                    {orderDetails.deliveryAgent.contactInfo}
                  </p>
                )}
              </div>
            )}
            {orderDetails.deliveryTime && (
              <div className="sm:col-span-2 space-y-1">
                <p className="text-gray-600">Estimated Delivery Time</p>
                <p className="font-medium">
                  {new Date(orderDetails.deliveryTime).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Order Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4">
          <h2 className="text-xl font-semibold">Order Summary</h2>
          <div className="space-y-4">
            {orderDetails.products &&
              orderDetails.products.map((item, index) => (
                <motion.div
                  key={`${item.variant?.id || index}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex flex-col sm:flex-row justify-between border border-gray-100 rounded-lg overflow-hidden">
                  <div className="flex flex-1 p-4">
                    {item.variant &&
                    item.variant.images &&
                    item.variant.images.length > 0 ? (
                      <div className="h-24 w-24 relative flex-shrink-0 mr-4 bg-gray-50 rounded-md overflow-hidden">
                        <Image
                          src={item.variant.images[0]}
                          alt={item.product.name}
                          fill
                          style={{ objectFit: "contain" }}
                        />
                      </div>
                    ) : item.product.images &&
                      item.product.images.length > 0 ? (
                      <div className="h-24 w-24 relative flex-shrink-0 mr-4 bg-gray-50 rounded-md overflow-hidden">
                        <Image
                          src={item.product.images[0]}
                          alt={item.product.name}
                          fill
                          style={{ objectFit: "contain" }}
                        />
                      </div>
                    ) : null}
                    <div className="space-y-2">
                      <p className="font-medium">
                        {item.variant ? item.variant.name : item.product.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {item.variant
                          ? item.variant.description
                          : item.product.description}
                      </p>
                      {item.variant && item.variant.formattedOptions && (
                        <div className="flex flex-wrap gap-2">
                          {item.variant.formattedOptions.map((option, i) => (
                            <span
                              key={i}
                              className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                              {option.name}: {option.value}
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="text-sm text-gray-600">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                  </div>
                  <div className="flex-shrink-0 bg-gray-50 p-4 flex items-center justify-center">
                    <p className="font-medium">${item.totalPrice.toFixed(2)}</p>
                  </div>
                </motion.div>
              ))}
          </div>

          {/* Order Totals */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="border-t pt-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">
                ${orderDetails.totalAmount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Shipping</span>
              <span className="font-medium">$0.00</span>
            </div>
            <div className="flex justify-between items-center border-t pt-3 mt-3">
              <span className="text-gray-800 font-medium">Total Amount</span>
              <span className="font-bold text-lg">
                ${orderDetails.totalAmount.toFixed(2)}
              </span>
            </div>
          </motion.div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Status</span>
            <span
              className={`capitalize font-medium ${
                orderDetails.status === "COMPLETED"
                  ? "text-green-600"
                  : orderDetails.status === "PENDING"
                  ? "text-yellow-600"
                  : orderDetails.status === "PROCESSING"
                  ? "text-blue-600"
                  : "text-red-600"
              }`}>
              {orderDetails.status ? orderDetails.status.toLowerCase() : ""}
            </span>
          </div>
        </motion.div>

        {/* Customer support section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-blue-50 p-4 rounded-lg text-center">
          <p className="text-blue-800">Need help with your order?</p>
          <Link
            href="https://wa.me/263785618666"
            className="text-blue-600 text-sm mt-1">
            Contact our customer support at our WHATSAPP
          </Link>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default OrderConfirmationPage;
