"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useGetAllOrders from "@/hooks/order/useGetAllOrders";
import { motion } from "framer-motion";
import { Loader2, Package, Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { usePageTracking } from "@/hooks/analytics";

function ProfilePageContent() {
  const { orders, loading, error } = useGetAllOrders();
  const { user, logout } = useAuth();
  usePageTracking();
  const [isMounted, setIsMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [inviteLink, setInviteLink] = useState("");

  useEffect(() => {
    setIsMounted(true);
    if (user?.id) {
      // setInviteLink(`${window.location.origin}/register?ref=${user.id}`);
      setInviteLink(`${window.location.origin}`);
    }
  }, [user]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (!isMounted) {
    return (
      <div className='container mx-auto px-4 py-8 flex justify-center'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    );
  }
  
  return (
    <div className='container mx-auto px-4 py-8 space-y-8'>
      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className='max-w-2xl mx-auto'>
          <CardHeader>
            <CardTitle className='text-2xl font-bold text-center'>
              User Account
            </CardTitle>
          </CardHeader>
          <CardContent className='flex flex-col items-center space-y-6'>
            <Avatar className='w-32 h-32'>
              <AvatarImage
                src={user?.profilePic}
                alt={user?.name}
              />
              <AvatarFallback>
                {user?.name?.slice(0, 2).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className='text-center'>
              <h2 className='text-xl font-semibold'>
                {user?.name}
              </h2>
              <p className='text-muted-foreground'>
                {user?.email}
              </p>
            </div>

            {/* Invite Link Section */}
            <div className='w-full max-w-md space-y-2'>
              <div className='flex items-center space-x-2'>
                <LinkIcon className='w-4 h-4 text-muted-foreground' />
                <p className='text-sm font-medium'>Invite Friends</p>
              </div>
              <div className='flex space-x-2'>
                <Input
                  value={inviteLink}
                  readOnly
                  className='text-sm'
                />
                <Button
                  onClick={handleCopyLink}
                  variant="secondary"
                  className='whitespace-nowrap'
                >
                  {copied ? 'Copied!' : 'Copy Link'}
                </Button>
              </div>
              <p className='text-xs text-muted-foreground text-center'>
                Invite a friend, get free delivery.
              </p>
            </div>
            {/* Logout Button */}
            <Button onClick={handleLogout} variant="orange" className='w-full'>
              Logout
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Orders Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className='max-w-2xl mx-auto'>
          <CardHeader>
            <CardTitle className='text-2xl font-bold text-center'>
              Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className='flex justify-center py-8'>
                <Loader2 className='h-8 w-8 animate-spin' />
              </div>
            ) : error ? (
              <div className='text-center py-8 text-red-500'>
                Error loading orders
              </div>
            ) : !orders || orders.length === 0 ? (
              <div className='text-center py-8 space-y-4'>
                <Package className='h-12 w-12 mx-auto text-gray-400' />
                <p className='text-muted-foreground'>No orders placed yet</p>
              </div>
            ) : (
              <div className='space-y-4'>
                {orders.map((order, index) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <Link href={`/order/${order.id}`}>
                      <div className='border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer'>
                        <div className='flex justify-between items-start'>
                          <div className='space-y-1'>
                            <p className='font-medium'>
                              Order #{order.id.slice(-8)}
                            </p>
                            <p className='text-sm text-muted-foreground'>
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className='text-right'>
                            <p className='font-semibold'>
                              ${order.totalAmount.toFixed(2)}
                            </p>
                            <span
                              className={`text-sm px-2 py-1 rounded-full ${order.status === "COMPLETED"
                                  ? "bg-green-100 text-green-800"
                                  : order.status === "PENDING"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                            >
                              {order.status.toLowerCase()}
                            </span>
                          </div>
                        </div>
                        <div className='mt-2 text-sm text-muted-foreground'>
                          <p>Delivery to: {order.address}</p>
                          <p>
                            Payment:{" "}
                            {order.paymentMode.replace(/_/g, " ").toLowerCase()}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProfilePageContent />
    </Suspense>
  );
}