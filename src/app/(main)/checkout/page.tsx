"use client";

import { useState, FormEvent, Suspense, useEffect } from "react";
import {
  ArrowLeft,
  Check,
  MapPin,
  ShoppingBag,
  Clock,
  Navigation,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useCartContext } from "../../../context/CartContext";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/toast/use-toast";
import useCreateOrder from "@/hooks/order/useCreateOrder";
import useCartStore from "@/zustand/cartStore";
import { motion } from "framer-motion";
import { useEventTracking, usePageTracking } from "@/hooks/analytics";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import type { PaymentMode as BackendPaymentMode } from "@/types/order/get_order_details";
import axios from "axios";

type PaymentMode = BackendPaymentMode | "ONLINE";

type FormErrors = {
  email: string;
  phoneNumber: string;
  paymentMode: string;
};

// Animation variants
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
};

const slideUp = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

function CheckoutPageContent() {
  const router = useRouter();
  usePageTracking();
  const { trackOrder } = useEventTracking();
  const { toast } = useToast();
  const { cart, cartId } = useCartContext();
  const { createOrder, loading } = useCreateOrder();
  const { deleteCart } = useCartStore();

  const [formErrors, setFormErrors] = useState<FormErrors>({
    email: "",
    phoneNumber: "",
    paymentMode: "",
  });

  const [formData, setFormData] = useState({
    email: "",
    phoneNumber: "",
    paymentMode: "CASH_ON_DELIVERY" as PaymentMode,
  });

  const [pickupData, setPickupData] = useState<{ pickupDate: string; availableFrom: string; availableUntil: string; timezone: string } | null>(null);

  useEffect(() => {
    // Fetch pickup date on mount
    const fetchPickupDate = async () => {
      try {
        const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/checkout/calculate-pickup-date`, {
          orderTimestamp: new Date().toISOString()
        });
        setPickupData(response.data);
      } catch (error) {
        console.error("Error calculating pickup date:", error);
      }
    };
    fetchPickupDate();
  }, []);

  const pickupFee = cart.length > 0 ? 4 : 0;
  const subtotal = cart.reduce((acc, item) => acc + item.totalPrice, 0);
  const total = subtotal + pickupFee;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handlePaymentModeChange = (mode: PaymentMode) => {
    setFormData((prev) => ({
      ...prev,
      paymentMode: mode,
    }));
  };

  const validateForm = () => {
    let isValid = true;
    const errors = { ...formErrors };

    if (!formData.email) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email";
      isValid = false;
    }

    if (!formData.phoneNumber) {
      errors.phoneNumber = "Phone number is required";
      isValid = false;
    }

    if (!formData.paymentMode) {
      errors.paymentMode = "Please select a payment mode";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
        className: "top-[4rem]",
      });
      return;
    }

    if (cart.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart before placing an order.",
        variant: "destructive",
        className: "top-[4rem]",
      });
      return;
    }

    const paymentMode = formData.paymentMode;
    if (paymentMode === "ONLINE") {
      setFormErrors((prev) => ({
        ...prev,
        paymentMode: "Online payment is not available yet",
      }));
      return;
    }

    if (!pickupData) {
        toast({
            title: "Error",
            description: "Pickup details are not ready yet.",
            variant: "destructive",
            className: "top-[4rem]",
        });
        return;
    }

    try {
      const orderData = {
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        address: "Eastgate Mall, Harare, Zimbabwe", // Default for pickup
        cartId: cartId!,
        paymentMode,
        fulfillmentType: "PICKUP",
        pickupLocationId: "6aa812cfdfe683e883ae0965", // Eastgate Mall DB ID
        pickupDate: pickupData.pickupDate,
        pickupFee: 4,
      };
      
      const response = await createOrder(orderData);
      trackOrder(response.id, total, "USD", formData.phoneNumber);

      toast({
        title: "Order placed successfully!",
        description: `Order ID: ${response.id}`,
        className: "top-[4rem]",
      });
      deleteCart();
      router.push(`/order/${response.id}`);
    } catch (error) {
      toast({
        title: "Failed to place order",
        description:
          error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
        className: "top-[4rem]",
      });
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-gray-50"
      initial="hidden"
      animate="visible"
      variants={fadeIn}>
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <motion.div
          className="mb-6"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}>
          <Link
            href="/cart"
            className="items-center text-gray-600 hover:text-gray-900 hidden md:inline-flex">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Link>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          <motion.div className="lg:col-span-2" variants={slideUp}>
            <motion.div
              whileHover={{ boxShadow: "0 8px 30px rgba(0, 0, 0, 0.12)" }}
              transition={{ duration: 0.3 }}>
              <Card className="p-6">
                <motion.h1
                  className="text-2xl font-bold mb-6"
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.1 }}>
                  Checkout
                </motion.h1>

                <motion.form
                  className="space-y-8"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible">
                  
                  {/* Contact Info */}
                  <motion.div
                    className="grid md:grid-cols-2 gap-4"
                    variants={slideUp}>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className={formErrors.email ? "border-red-500" : ""}
                      />
                      {formErrors.email && (
                        <motion.p
                          className="text-sm text-red-500 mt-1"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}>
                          {formErrors.email}
                        </motion.p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="phoneNumber">Phone number</Label>
                      <Input
                        id="phoneNumber"
                        type="tel"
                        required
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        className={
                          formErrors.phoneNumber ? "border-red-500" : ""
                        }
                      />
                      {formErrors.phoneNumber && (
                        <motion.p
                          className="text-sm text-red-500 mt-1"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}>
                          {formErrors.phoneNumber}
                        </motion.p>
                      )}
                    </div>
                  </motion.div>

                  {/* Pickup Details Card */}
                  <motion.div className="space-y-4" variants={slideUp}>
                    <h3 className="font-medium flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-gray-800" />
                      Pickup Details
                    </h3>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-lg">Eastgate Mall</h4>
                          <p className="text-gray-600 text-sm mt-1">Coordinates: -17.831819, 31.053124</p>
                          
                          <div className="mt-4 space-y-2">
                            <div className="flex items-center text-sm text-gray-700">
                                <Clock className="w-4 h-4 mr-2" />
                                <span><strong>Operating Hours:</strong> 9am - 4pm daily (Closed Sundays)</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-700">
                                <Check className="w-4 h-4 mr-2 text-green-600" />
                                <span>
                                    <strong>Pickup Date:</strong> {pickupData ? new Date(pickupData.pickupDate).toLocaleDateString() : 'Calculating...'}
                                </span>
                            </div>
                          </div>
                        </div>
                        <a 
                            href="https://maps.google.com/?q=-17.831819,31.053124" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
                        >
                          <Navigation className="w-4 h-4 mr-2" />
                          Directions
                        </a>
                      </div>
                    </div>
                  </motion.div>

                  {/* Payment */}
                  <motion.div className="space-y-2" variants={slideUp}>
                    <h3 className="font-medium">Payment mode</h3>
                    <div className="space-y-2">
                      <motion.div
                        className="flex items-center space-x-2"
                        whileHover={{ x: 2 }}
                        transition={{ type: "spring", stiffness: 400 }}>
                        <Checkbox
                          id="CASH_ON_DELIVERY"
                          checked={formData.paymentMode === "CASH_ON_DELIVERY"}
                          onCheckedChange={() =>
                            handlePaymentModeChange("CASH_ON_DELIVERY")
                          }
                        />
                        <Label htmlFor="CASH_ON_DELIVERY">
                          Cash on Delivery
                        </Label>
                      </motion.div>
                      <motion.div
                        className="flex items-center space-x-2"
                        whileHover={{ x: 2 }}
                        transition={{ type: "spring", stiffness: 400 }}>
                        <Checkbox
                          id="ONLINE"
                          checked={formData.paymentMode === "ONLINE"}
                          onCheckedChange={() =>
                            handlePaymentModeChange("ONLINE")
                          }
                          disabled
                        />
                        <Label
                          htmlFor="ONLINE"
                          className="pointer-events-none opacity-50">
                          Online Payment
                        </Label>
                      </motion.div>
                      {formErrors.paymentMode && (
                        <motion.p
                          className="text-sm text-red-500 mt-1"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}>
                          {formErrors.paymentMode}
                        </motion.p>
                      )}
                    </div>
                  </motion.div>
                </motion.form>
              </Card>
            </motion.div>
          </motion.div>

          {/* Order Summary */}
          <motion.div
            className="lg:col-span-1"
            variants={slideUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.3 }}>
            <motion.div
              whileHover={{ boxShadow: "0 8px 30px rgba(0, 0, 0, 0.12)" }}
              transition={{ duration: 0.3 }}>
              <Card className="p-6 sticky top-20">
                <div className="space-y-6">
                  <motion.h2
                    className="text-xl font-semibold flex items-center gap-2"
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.4 }}>
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 10,
                      }}>
                      <ShoppingBag className="w-5 h-5" />
                    </motion.div>
                    Order Summary
                  </motion.h2>

                  <motion.div
                    key={`abcd`}
                    className="space-y-4"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible">
                    {cart.length === 0 ? (
                      <motion.p
                        className="text-gray-500 text-center"
                        variants={fadeIn}>
                        Your cart is empty.
                      </motion.p>
                    ) : (
                      cart.map((item, index) => (
                        <motion.div
                          key={index}
                          className="flex justify-between items-center py-2 border-b"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{
                            x: 2,
                            backgroundColor: "rgba(249, 250, 251, 0.5)",
                          }}>
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-gray-600">
                              Quantity: {item.quantity}
                            </p>
                          </div>
                          <p className="font-medium">
                            ${item.totalPrice.toFixed(2)}
                          </p>
                        </motion.div>
                      ))
                    )}
                  </motion.div>

                  <motion.div
                    className="space-y-2"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    transition={{ delayChildren: 0.5, staggerChildren: 0.1 }}>
                    <motion.div
                      className="flex justify-between text-sm text-gray-600"
                      variants={fadeIn}>
                      <span>Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </motion.div>
                    <motion.div
                      className="flex justify-between text-sm text-gray-600"
                      variants={fadeIn}>
                      <span>Pickup Fee</span>
                      <span>${pickupFee.toFixed(2)}</span>
                    </motion.div>
                    <motion.div
                      className="flex justify-between font-medium text-lg border-t pt-2"
                      variants={fadeIn}>
                      <span>Total</span>
                      <motion.span
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.8, type: "spring" }}>
                        ${total.toFixed(2)}
                      </motion.span>
                    </motion.div>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 10,
                    }}>
                    <Button
                      type="submit"
                      className="w-full bg-gray-950 text-white hover:bg-black"
                      onClick={handleSubmit}
                      disabled={loading || cart.length === 0}>
                      {loading ? (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ repeat: Infinity, repeatType: "reverse", duration: 0.8 }}>
                          Placing Order...
                        </motion.span>
                      ) : (
                        <>
                          <motion.span initial={{ x: -5 }} animate={{ x: 0 }}>
                            Place Order
                          </motion.span>
                        </>
                      )}
                    </Button>
                  </motion.div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <CheckoutPageContent />
    </Suspense>
  );
}
