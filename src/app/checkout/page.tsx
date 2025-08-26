"use client";

import { useState, FormEvent, Suspense } from "react";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  MapPin,
  ShoppingBag,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCartContext } from "../../context/CartContext";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/toast/use-toast";
import useCreateOrder from "@/hooks/order/useCreateOrder";
import useCartStore from "@/zustand/cartStore";
import { motion, AnimatePresence } from "framer-motion";
import { useEventTracking, usePageTracking } from "@/hooks/analytics";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

type LocationMode = "none" | "manual" | "current";
type PaymentMode = "CASH_ON_DELIVERY" | "ONLINE";
type DeliveryTime = "24hr" /* | "5hr" | "3hr" */;

type FormErrors = {
  email: string;
  phoneNumber: string;
  address: string;
  city: string;
  state: string;
  paymentMode: string;
  location: string;
  deliveryTime: string;
};

const DELIVERY_COSTS: Record<DeliveryTime, number> = {
  "24hr": 3,
  /* "5hr": 3,
  "3hr": 5 */
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
  const { createOrder, error, loading, orderData } = useCreateOrder();
  const { deleteCart } = useCartStore();

  const [formErrors, setFormErrors] = useState<FormErrors>({
    email: "",
    phoneNumber: "",
    address: "",
    city: "",
    state: "",
    paymentMode: "",
    location: "",
    deliveryTime: "",
  });

  // Form state
  const [formData, setFormData] = useState({
    email: "",
    phoneNumber: "",
    address: "",
    city: "",
    state: "",
    paymentMode: "" as PaymentMode,
    deliveryTime: "24hr" as DeliveryTime,
  });

  const [locationMode, setLocationMode] = useState<LocationMode>("none");
  const [currentLocation, setCurrentLocation] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Calculate pricing
  const subtotal = cart.reduce((acc, item) => acc + item.totalPrice, 0);
  const shippingCost =
    cart.length > 0 ? DELIVERY_COSTS[formData.deliveryTime] : 0;
  const total = subtotal + shippingCost;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleDeliveryTimeChange = (value: DeliveryTime) => {
    setFormData((prev) => ({
      ...prev,
      deliveryTime: value,
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

    if (locationMode === "manual") {
      if (!formData.address) {
        errors.address = "Address is required";
        isValid = false;
      }
      if (!formData.city) {
        errors.city = "City is required";
        isValid = false;
      }
      if (!formData.state) {
        errors.state = "State is required";
        isValid = false;
      }
    } else if (locationMode === "current") {
      if (!currentLocation) {
        errors.location = "Location is required";
        isValid = false;
      }
    } else {
      errors.location = "Please select a delivery location";
      isValid = false;
    }

    if (!formData.paymentMode) {
      errors.paymentMode = "Please select a payment mode";
      isValid = false;
    }

    if (!formData.deliveryTime) {
      errors.deliveryTime = "Please select a delivery time";
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

    const completeAddress =
      locationMode === "current"
        ? currentLocation
        : `${formData.address}, ${formData.city}, ${formData.state}`;

    try {
      // console.log(cart);
      const orderData = {
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        address: completeAddress,
        cartId: cartId!,
        paymentMode: formData.paymentMode,
        deliveryTime: formData.deliveryTime,
      };
      // console.log(orderData);
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

  const handleCurrentLocation = async () => {
    setIsLoading(true);
    try {
      if ("geolocation" in navigator) {
        const position = await new Promise<GeolocationPosition>(
          (resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          }
        );
        const location = `${position.coords.latitude}, ${position.coords.longitude}`;
        setCurrentLocation(location);
        setLocationMode("current");
      } else {
        alert("Geolocation is not supported by your browser");
      }
    } catch (error) {
      alert("Error getting location");
    } finally {
      setIsLoading(false);
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
                  className="space-y-6"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible">
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

                  {/* Delivery Time Selection */}
                  <motion.div className="space-y-2" variants={slideUp}>
                    <h3 className="font-medium flex items-center gap-2">
                      <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}>
                        <Clock className="w-4 h-4" />
                      </motion.div>
                      Delivery Time
                    </h3>
                    <RadioGroup
                      value={formData.deliveryTime}
                      onValueChange={(value) =>
                        handleDeliveryTimeChange(value as DeliveryTime)
                      }
                      className="grid grid-cols-1 gap-4">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 10,
                        }}>
                        <RadioGroupItem
                          value="24hr"
                          id="24hr"
                          className="peer sr-only"
                          checked
                        />
                        <Label
                          htmlFor="24hr"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-4 hover:bg-gray-50 peer-data-[state=checked]:border-gray-800 [&:has([data-state=checked])]:border-gray-800 cursor-pointer">
                          <span className="font-semibold">24 Hours</span>
                          <span className="text-sm text-muted-foreground">
                            $3.00
                          </span>
                        </Label>
                      </motion.div>
                      {/* 
                      <div>
                        <RadioGroupItem
                          value="5hr"
                          id="5hr"
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor="5hr"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-4 hover:bg-gray-50 peer-data-[state=checked]:border-orange-500 [&:has([data-state=checked])]:border-orange-500 cursor-pointer">
                          <span className="font-semibold">5 Hours</span>
                          <span className="text-sm text-muted-foreground">$3.00</span>
                        </Label>
                      </div>
                      <div>
                        <RadioGroupItem
                          value="3hr"
                          id="3hr"
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor="3hr"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-4 hover:bg-gray-50 peer-data-[state=checked]:border-orange-500 [&:has([data-state=checked])]:border-orange-500 cursor-pointer">
                          <span className="font-semibold">3 Hours</span>
                          <span className="text-sm text-muted-foreground">$5.00</span>
                        </Label>
                      </div>
                      */}
                    </RadioGroup>
                  </motion.div>

                  <AnimatePresence mode="wait">
                    {locationMode === "manual" ? (
                      <motion.div
                        key="manual"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}>
                        <div className="space-y-4">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                              <Label htmlFor="address">Address</Label>
                              <Input
                                id="address"
                                type="text"
                                required
                                value={formData.address}
                                onChange={handleInputChange}
                                className={
                                  formErrors.address ? "border-red-500" : ""
                                }
                              />
                              {formErrors.address && (
                                <motion.p
                                  className="text-sm text-red-500 mt-1"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}>
                                  {formErrors.address}
                                </motion.p>
                              )}
                            </div>

                            <div>
                              <Label htmlFor="city">City</Label>
                              <Input
                                id="city"
                                type="text"
                                required
                                value={formData.city}
                                onChange={handleInputChange}
                                className={
                                  formErrors.city ? "border-red-500" : ""
                                }
                              />
                              {formErrors.city && (
                                <motion.p
                                  className="text-sm text-red-500 mt-1"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}>
                                  {formErrors.city}
                                </motion.p>
                              )}
                            </div>

                            <div>
                              <Label htmlFor="state">State</Label>
                              <Input
                                id="state"
                                type="text"
                                required
                                value={formData.state}
                                onChange={handleInputChange}
                                className={
                                  formErrors.state ? "border-red-500" : ""
                                }
                              />
                              {formErrors.state && (
                                <motion.p
                                  className="text-sm text-red-500 mt-1"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}>
                                  {formErrors.state}
                                </motion.p>
                              )}
                            </div>
                          </div>
                        </div>

                        <motion.div
                          className="mt-4"
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.98 }}>
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full justify-between"
                            onClick={() => setLocationMode("none")}>
                            <span className="flex items-center">
                              <MapPin className="w-4 h-4 mr-2 text-gray-800" />
                              Choose current location
                            </span>
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </motion.div>
                      </motion.div>
                    ) : locationMode === "current" ? (
                      <motion.div
                        key="current"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}>
                        <div>
                          <Label htmlFor="location">Delivery location</Label>
                          <Input
                            id="location"
                            value={currentLocation}
                            disabled
                            className="bg-gray-100"
                            placeholder="autofilled"
                          />
                          <motion.div
                            whileHover={{ x: 2 }}
                            transition={{ type: "spring", stiffness: 400 }}>
                            <Button
                              type="button"
                              variant="link"
                              className="mt-2 p-0 h-auto font-normal text-gray-800"
                              onClick={() => setLocationMode("manual")}>
                              Enter address manually
                            </Button>
                          </motion.div>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="none"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-2">
                        <motion.div
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.98 }}>
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full justify-between"
                            onClick={handleCurrentLocation}
                            disabled={isLoading}>
                            <span className="flex items-center">
                              <MapPin className="w-4 h-4 mr-2 text-gray-800" />
                              Choose current location
                            </span>
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </motion.div>

                        <motion.div
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.98 }}>
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full justify-between"
                            onClick={() => setLocationMode("manual")}>
                            <span className="flex items-center">
                              <MapPin className="w-4 h-4 mr-2 text-gray-800" />
                              Enter address manually
                            </span>
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>

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
                      <span>Shipping cost</span>
                      <span>${shippingCost.toFixed(2)}</span>
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
