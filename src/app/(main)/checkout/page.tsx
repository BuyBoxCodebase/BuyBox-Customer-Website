"use client";

import { useState, FormEvent, Suspense, useEffect } from "react";
import {
  ArrowLeft,
  Check,
  MapPin,
  ShoppingBag,
  Clock,
  Navigation,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCartContext } from "../../../context/CartContext";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/toast/use-toast";
import useCreateOrder from "@/hooks/order/useCreateOrder";
import useCartStore from "@/zustand/cartStore";
import { useEventTracking, usePageTracking } from "@/hooks/analytics";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import type { PaymentMode as BackendPaymentMode } from "@/types/order/get_order_details";
import axios from "axios";
import { Coordinates, useDeliveryQuote, useHubs } from "@/hooks/checkout/useDelivery";

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
    address: "",
    city: "",
    state: "",
  });

  const [fulfillmentType, setFulfillmentType] = useState<"PICKUP" | "DELIVERY">("PICKUP");
  // The hub the customer picks up from, or that delivers to them
  const [hubId, setHubId] = useState<string | null>(null);
  const [deliveryCoordinates, setDeliveryCoordinates] = useState<Coordinates | null>(null);
  const [isLocationLoading, setIsLocationLoading] = useState(false);

  const { hubs, loading: hubsLoading, error: hubsError, retry: retryHubs } = useHubs();
  const { quote, loading: quoteLoading, error: quoteError } = useDeliveryQuote({
    productIds: cart.map((item) => item.productId),
    method: fulfillmentType,
    hubId,
    coordinates: deliveryCoordinates,
  });
  const selectedHub = hubs.find((hub) => hub.id === hubId);

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

  const subtotal = cart.reduce((acc, item) => acc + item.totalPrice, 0);
  const total = subtotal + (quote?.totalFee ?? 0);

  // Why Place Order can't be used yet, in the order the customer should fix things. null = ready.
  const placeOrderBlocker =
    cart.length === 0 ? "Your cart is empty."
    : hubsLoading ? "Hubs are still loading. Please wait a moment."
    : hubsError ? "We couldn't load the hubs. Please tap Try again."
    : !hubId
      ? fulfillmentType === "PICKUP"
        ? "Please choose a pickup hub."
        : "Please choose the hub to deliver from."
    : fulfillmentType === "DELIVERY" && !deliveryCoordinates ? "Please share your delivery location."
    : quoteError ? quoteError
    : !quote ? "Delivery fees are still being calculated. Please wait a moment."
    : null;

  const handlePlaceOrderClick = (e: FormEvent) => {
    if (placeOrderBlocker) {
      e.preventDefault();
      toast({
        title: "Can't place order yet",
        description: placeOrderBlocker,
        variant: "destructive",
        className: "top-[4rem]",
      });
      return;
    }
    handleSubmit(e);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleCurrentLocation = async () => {
    setIsLocationLoading(true);
    try {
      if ("geolocation" in navigator) {
        const position = await new Promise<GeolocationPosition>(
          (resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          }
        );
        setDeliveryCoordinates({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      } else {
        alert("Geolocation is not supported by your browser");
      }
    } catch (error) {
      alert("Error getting location");
    } finally {
      setIsLocationLoading(false);
    }
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

    (errors as any).hub = "";
    if (!hubId) {
      (errors as any).hub = "Please choose a hub";
      isValid = false;
    }

    if (fulfillmentType === "DELIVERY") {
      (errors as any).location = "";
      (errors as any).address = "";
      (errors as any).city = "";
      // The delivery fee is worked out from the shared location; the address guides the rider
      if (!deliveryCoordinates) {
        (errors as any).location = "Please share your delivery location";
        isValid = false;
      }
      if (!formData.address) {
        (errors as any).address = "Address is required";
        isValid = false;
      }
      if (!formData.city) {
        (errors as any).city = "City is required";
        isValid = false;
      }
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

    if (!quote || !selectedHub) {
      toast({
        title: "Delivery fees not ready",
        description: quoteError || "Please wait for the delivery fees to be calculated.",
        variant: "destructive",
        className: "top-[4rem]",
      });
      return;
    }

    try {
      const completeAddress = fulfillmentType === "DELIVERY"
        ? [formData.address, formData.city, formData.state].filter(Boolean).join(", ")
        : `${selectedHub.name} hub, ${selectedHub.address}`;

      const orderData = {
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        address: completeAddress,
        cartId: cartId!,
        paymentMode,
        fulfillmentType,
        pickupLocationId: selectedHub.id,
        pickupDate: pickupData.pickupDate,
        deliveryCoordinates: fulfillmentType === "DELIVERY" ? deliveryCoordinates! : undefined,
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
        <div className="grid lg:grid-cols-3 gap-8">
          <motion.div className="lg:col-span-2" variants={slideUp}>
            <motion.div
              whileHover={{ boxShadow: "0 8px 30px rgba(0, 0, 0, 0.12)" }}
              transition={{ duration: 0.3 }}>
              <Card className="p-6">
                <motion.h1
                  className="text-2xl font-bold mb-6 flex items-center gap-2"
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.1 }}>
                  <Link
                    href="/cart"
                    aria-label="Back to cart"
                    className="-ml-1 rounded-md p-1 text-gray-600 hover:bg-gray-100 hover:text-gray-900">
                    <ArrowLeft className="w-5 h-5" />
                  </Link>
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
                        name="email"
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
                        name="phoneNumber"
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

                  {/* Fulfillment Method */}
                  <motion.div className="space-y-4" variants={slideUp}>
                    <h3 className="font-medium flex items-center gap-2">
                      <Truck className="w-5 h-5 text-gray-800" />
                      Fulfillment Method
                    </h3>
                    <RadioGroup
                      name="fulfillmentType"
                      value={fulfillmentType}
                      onValueChange={(val: any) => setFulfillmentType(val)}
                      className="grid grid-cols-2 gap-4">
                      <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
                        <RadioGroupItem aria-label="Pickup" value="PICKUP" id="PICKUP" className="peer sr-only" />
                        <Label
                          htmlFor="PICKUP"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-4 hover:bg-gray-50 peer-data-[state=checked]:border-gray-800 [&:has([data-state=checked])]:border-gray-800 cursor-pointer h-full">
                          <span className="font-semibold text-center">Pickup</span>
                          <span className="text-sm text-muted-foreground mt-1 text-center">Collect from a Treides hub</span>
                        </Label>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
                        <RadioGroupItem aria-label="Delivery" value="DELIVERY" id="DELIVERY" className="peer sr-only" />
                        <Label
                          htmlFor="DELIVERY"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-4 hover:bg-gray-50 peer-data-[state=checked]:border-gray-800 [&:has([data-state=checked])]:border-gray-800 cursor-pointer h-full">
                          <span className="font-semibold text-center">Home Delivery</span>
                          <span className="text-sm text-muted-foreground mt-1 text-center">Delivered from your nearest hub</span>
                        </Label>
                      </motion.div>
                    </RadioGroup>
                  </motion.div>

                  {/* Hub */}
                  <motion.div className="space-y-3" variants={slideUp}>
                    <h3 className="font-medium flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-gray-800" />
                      {fulfillmentType === "PICKUP" ? "Pickup hub" : "Deliver from hub"}
                    </h3>
                    {fulfillmentType === "DELIVERY" && (
                      <p className="text-sm text-gray-600">Choose the hub closest to your delivery address.</p>
                    )}
                    {hubsLoading ? (
                      <div className="grid sm:grid-cols-3 gap-4" aria-busy="true" aria-label="Loading hubs">
                        {[0, 1, 2].map((i) => (
                          <div key={i} className="rounded-md border-2 border-muted bg-white p-4 flex flex-col items-center gap-2">
                            <div className="h-4 w-20 rounded bg-gray-200 animate-pulse" />
                            <div className="h-3 w-28 rounded bg-gray-100 animate-pulse" />
                          </div>
                        ))}
                      </div>
                    ) : hubsError ? (
                      <div className="flex items-center justify-between gap-4 rounded-md border border-red-200 bg-red-50 p-4">
                        <p className="text-sm text-red-700">We couldn&apos;t load the hubs. Check your connection and try again.</p>
                        <Button type="button" variant="outline" size="sm" onClick={retryHubs}>
                          Try again
                        </Button>
                      </div>
                    ) : hubs.length === 0 ? (
                      <p className="text-sm text-gray-600">No hubs are available right now. Please try again later.</p>
                    ) : (
                      <RadioGroup
                        name="hub"
                        value={hubId ?? ""}
                        onValueChange={(val: string) => setHubId(val)}
                        className="grid sm:grid-cols-3 gap-4">
                        {hubs.map((hub) => (
                          <div key={hub.id}>
                            <RadioGroupItem aria-label={hub.name} value={hub.id} id={`hub-${hub.id}`} className="peer sr-only" />
                            <Label
                              htmlFor={`hub-${hub.id}`}
                              className="flex flex-col items-center rounded-md border-2 border-muted bg-white p-4 hover:bg-gray-50 peer-data-[state=checked]:border-gray-800 [&:has([data-state=checked])]:border-gray-800 cursor-pointer h-full">
                              <span className="font-semibold text-center">{hub.name}</span>
                              <span className="text-sm text-muted-foreground mt-1 text-center">{hub.address}</span>
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    )}
                    {(formErrors as any).hub && <p className="text-sm text-red-500 mt-1">{(formErrors as any).hub}</p>}
                  </motion.div>

                  <AnimatePresence mode="wait">
                    {fulfillmentType === "PICKUP" ? (
                      selectedHub && (
                      <motion.div key="pickup" className="space-y-4" variants={slideUp} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold text-lg">{selectedHub.name}</h4>
                              <p className="text-gray-600 text-sm mt-1">{selectedHub.address}</p>

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
                            {selectedHub.coordinates && (
                            <a
                                href={`https://maps.google.com/?q=${selectedHub.coordinates.latitude},${selectedHub.coordinates.longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
                            >
                              <Navigation className="w-4 h-4 mr-2" />
                              Directions
                            </a>
                            )}
                          </div>
                        </div>
                      </motion.div>
                      )
                    ) : (
                      <motion.div key="delivery" className="space-y-4" variants={slideUp} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                          <h4 className="font-semibold text-lg mb-4">Delivery Address</h4>

                          <div className="space-y-4">
                            <div>
                              <Label>Delivery location</Label>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-1">
                                <Button type="button" onClick={handleCurrentLocation} disabled={isLocationLoading}>
                                  {isLocationLoading ? "Getting location..." : (
                                    <>
                                      <MapPin className="w-4 h-4 mr-2" />
                                      {deliveryCoordinates ? "Update my location" : "Use my current location"}
                                    </>
                                  )}
                                </Button>
                                {deliveryCoordinates && (
                                  <span className="text-sm text-gray-600 flex items-center">
                                    <Check className="w-4 h-4 mr-1 text-green-600" />
                                    Location shared ({deliveryCoordinates.latitude.toFixed(5)}, {deliveryCoordinates.longitude.toFixed(5)})
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 mt-1">Your delivery fee is based on the distance from the hub to this location.</p>
                              {(formErrors as any).location && <p className="text-sm text-red-500 mt-1">{(formErrors as any).location}</p>}
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                              <div className="md:col-span-2">
                                <Label htmlFor="address">Address</Label>
                                <Input name="address" id="address" type="text" placeholder="House number, street, suburb" value={formData.address} onChange={handleInputChange} className={(formErrors as any).address ? "border-red-500" : ""} />
                                {(formErrors as any).address && <p className="text-sm text-red-500 mt-1">{(formErrors as any).address}</p>}
                              </div>
                              <div>
                                <Label htmlFor="city">City</Label>
                                <Input name="city" id="city" type="text" value={formData.city} onChange={handleInputChange} className={(formErrors as any).city ? "border-red-500" : ""} />
                                {(formErrors as any).city && <p className="text-sm text-red-500 mt-1">{(formErrors as any).city}</p>}
                              </div>
                              <div>
                                <Label htmlFor="state">Province</Label>
                                <Input name="state" id="state" type="text" value={formData.state} onChange={handleInputChange} />
                              </div>
                            </div>
                          </div>

                          <div className="mt-6 pt-4 border-t space-y-2">
                            <div className="flex items-center text-sm text-gray-700">
                                <Clock className="w-4 h-4 mr-2" />
                                <span><strong>Delivery Days:</strong> Tuesday, Thursday, Saturday</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-700">
                                <Check className="w-4 h-4 mr-2 text-green-600" />
                                <span>
                                    <strong>Est. Delivery Date:</strong> {pickupData ? new Date(pickupData.pickupDate).toLocaleDateString() : 'Calculating...'}
                                </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Payment */}
                  <motion.div className="space-y-2" variants={slideUp}>
                    <h3 className="font-medium">Payment mode</h3>
                    <div className="space-y-2">
                      <motion.div
                        className="flex items-center space-x-2"
                        whileHover={{ x: 2 }}
                        transition={{ type: "spring", stiffness: 400 }}>
                        <Checkbox
                          aria-label="Cash on Delivery"
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
                          aria-label="Online Payment"
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
                    {quote ? (
                      <>
                        {quote.transferFee > 0 && (
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>Inter-hub transfer</span>
                            <span>${quote.transferFee.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Handling ({quote.hubName})</span>
                          <span>${quote.handlingFee.toFixed(2)}</span>
                        </div>
                        {fulfillmentType === "DELIVERY" && (
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>
                              Home delivery
                              {quote.deliveryDistanceKm !== null && ` (${quote.deliveryDistanceKm.toFixed(1)} km)`}
                            </span>
                            <span>${quote.deliveryFee.toFixed(2)}</span>
                          </div>
                        )}
                      </>
                    ) : quoteLoading ? (
                      <div className="space-y-2" aria-busy="true" aria-label="Calculating delivery fees">
                        {[0, 1].map((i) => (
                          <div key={i} className="flex justify-between">
                            <div className="h-4 w-28 rounded bg-gray-200 animate-pulse" />
                            <div className="h-4 w-12 rounded bg-gray-200 animate-pulse" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Delivery fees</span>
                        <span className={quoteError ? "text-red-500 text-right" : "text-right"}>
                          {quoteError
                            ? quoteError
                            : !hubId
                              ? "Choose a hub"
                              : "Share your location"}
                        </span>
                      </div>
                    )}
                    <motion.div
                      className="flex justify-between font-medium text-lg border-t pt-2"
                      variants={fadeIn}>
                      <span>Total</span>
                      {/* Never show a total without the delivery fees, it would understate the price */}
                      {quote ? (
                        <motion.span
                          key={total}
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring" }}>
                          ${total.toFixed(2)}
                        </motion.span>
                      ) : quoteLoading ? (
                        <span className="h-6 w-20 rounded bg-gray-200 animate-pulse" aria-label="Calculating total" />
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
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
                      className={`w-full bg-gray-950 text-white hover:bg-black ${placeOrderBlocker ? "opacity-50 cursor-not-allowed" : ""}`}
                      onClick={handlePlaceOrderClick}
                      // Not truly disabled for blockers, so a click can explain what's missing
                      aria-disabled={!!placeOrderBlocker}
                      disabled={loading}>
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
