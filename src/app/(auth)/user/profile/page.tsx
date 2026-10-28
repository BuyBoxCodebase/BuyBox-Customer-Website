"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import useGetAllOrders from "@/hooks/order/useGetAllOrders";
import { ArrowLeft, ChevronRight, Gift, KeyRound, Loader2, Package } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useAuth } from "../../../../context/AuthContext";
import { usePageTracking } from "@/hooks/analytics";
import PasswordSection from "@/components/auth/PasswordSection";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { id: "orders", label: "Orders", icon: Package, description: "Track and review what you've bought." },
  { id: "password", label: "Password", icon: KeyRound, description: "How you log in with your email." },
  { id: "invite", label: "Invite friends", icon: Gift, description: "Invite a friend, get free delivery." },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

const statusStyles: Record<string, string> = {
  COMPLETED: "bg-green-50 text-green-700",
  PENDING: "bg-yellow-50 text-yellow-700",
};

function OrdersSection() {
  const { orders, loading, error } = useGetAllOrders();

  if (loading) return <Loader2 className="h-6 w-6 animate-spin text-gray-400" />;
  if (error) return <p className="text-sm text-red-500">Couldn&apos;t load your orders. Refresh to try again.</p>;

  if (!orders || orders.length === 0) {
    return (
      <div className="py-10 text-center">
        <Package className="mx-auto h-10 w-10 text-gray-300" />
        <p className="mt-3 text-sm text-gray-500">No orders yet.</p>
        <Button asChild variant="outline" className="mt-4 rounded-lg">
          <Link href="/">Start shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <ul className="-mx-2 divide-y divide-black/5">
      {orders.map((order) => (
        <li key={order.id}>
          <Link
            href={`/order/${order.id}`}
            className="flex items-center gap-4 rounded-lg px-2 py-4 transition-colors hover:bg-black/5"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium">Order #{order.id.slice(-8)}</p>
                <span
                  className={cn(
                    "rounded-md px-2 py-0.5 text-xs font-medium capitalize",
                    statusStyles[order.status] ?? "bg-red-50 text-red-700"
                  )}
                >
                  {order.status.toLowerCase()}
                </span>
              </div>
              <p className="mt-1 truncate text-sm text-gray-500">
                {new Date(order.createdAt).toLocaleDateString()} · {order.address}
              </p>
            </div>
            <p className="font-semibold">${order.totalAmount.toFixed(2)}</p>
            <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" />
          </Link>
        </li>
      ))}
    </ul>
  );
}

function InviteSection() {
  const [inviteLink, setInviteLink] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setInviteLink(window.location.origin);
  }, []);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="max-w-md space-y-3">
      <p className="text-sm text-gray-600">Share this link with your friends.</p>
      <div className="flex gap-2">
        <div className="flex h-11 min-w-0 flex-1 items-center rounded-lg border bg-white px-4 text-sm text-gray-700">
          <span className="truncate">{inviteLink}</span>
        </div>
        <Button
          onClick={handleCopyLink}
          className="h-11 rounded-lg px-5 bg-black text-white hover:bg-black/85"
        >
          {copied ? "Copied!" : "Copy link"}
        </Button>
      </div>
    </div>
  );
}

function ProfilePageContent() {
  const { user } = useAuth();
  usePageTracking();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isMounted, setIsMounted] = useState(false);

  // Section lives in the URL (?tab=password) so it survives refresh and can be linked to
  const requested = searchParams.get("tab");
  const active: SectionId = SECTIONS.some((s) => s.id === requested) ? (requested as SectionId) : "orders";
  const activeSection = SECTIONS.find((s) => s.id === active)!;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const selectSection = (id: SectionId) => {
    router.replace(`/user/profile?tab=${id}`, { scroll: false });
  };

  if (!isMounted) {
    return (
      <div className="container mx-auto flex justify-center px-4 py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      {/* /user pages sit outside the main layout, so there's no navbar back arrow here */}
      <Link href="/" className="mb-6 inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Shopping
      </Link>

      {/* Who's logged in */}
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={user?.profilePic} alt={user?.name} />
          <AvatarFallback>{user?.name?.slice(0, 2).toUpperCase() || "U"}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold">{user?.name}</h1>
          <p className="truncate text-sm text-gray-500">{user?.email}</p>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        {/* Section tabs; scroll sideways if they don't fit on small screens */}
        <nav className="-mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => selectSection(id)}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
                active === id ? "bg-card text-black" : "text-gray-600 hover:bg-black/5"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>

        {/* Active section */}
        <section className="min-w-0 rounded-xl bg-card p-5 text-card-foreground md:p-6">
          <h2 className="text-lg font-semibold">{activeSection.label}</h2>
          <p className="mb-6 text-sm text-gray-500">{activeSection.description}</p>
          {active === "orders" && <OrdersSection />}
          {active === "password" && <PasswordSection />}
          {active === "invite" && <InviteSection />}
        </section>
      </div>
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
