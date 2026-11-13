"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, BellRing, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/toast/use-toast";
import {
  cancelWatch,
  createWatch,
  getToken,
  getWatchStatus,
  rememberPending,
  takePending,
  targetKey,
  WatchTarget,
  watchError,
} from "@/lib/product-watch";
import { cn } from "@/lib/utils";

export default function NotifyMeButton({
  target,
  label = "Notify me when available",
  className,
  display = "full",
}: {
  target: WatchTarget;
  label?: string;
  className?: string;
  // full: button with a short explanation (product page). inline: small button (cart rows).
  display?: "full" | "inline";
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [state, setState] = useState<"idle" | "saving" | "subscribed">("idle");
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const key = targetKey(target);
  const targetRef = useRef(target);
  targetRef.current = target;

  const comeBackHere = () => `${window.location.pathname}${window.location.search}`;

  const subscribe = useCallback(
    async () => {
      setState("saving");
      try {
        const { created, subscription } = await createWatch(targetRef.current);
        setSubscriptionId(subscription.id);
        setState("subscribed");
        toast({
          title: created ? "Added to your watch list" : "Already on your watch list",
          description: "We'll message you on WhatsApp as soon as it's available on Treides, from any seller.",
          className: "top-[4rem]",
        });
      } catch (error) {
        setState("idle");
        const { code, message } = watchError(error);
        if (code === "PHONE_REQUIRED") {
          // Needs a WhatsApp number first. Come back and finish after they've added it.
          rememberPending(targetRef.current);
          router.push(`/user/profile?tab=alerts&addPhone=1&returnTo=${encodeURIComponent(comeBackHere())}`);
          return;
        }
        toast({ title: "Couldn't set up the alert", description: message, variant: "destructive", className: "top-[4rem]" });
      }
    },
    [router, toast],
  );

  useEffect(() => {
    setState("idle");
    setSubscriptionId(null);
    if (!getToken()) return;

    const pending = takePending(key);
    if (pending) {
      void subscribe();
      return;
    }

    let cancelled = false;
    getWatchStatus(targetRef.current)
      .then((status) => {
        if (cancelled || !status.subscribed) return;
        setSubscriptionId(status.subscriptionId);
        setState("subscribed");
      })
      .catch(() => {
        // Not knowing is fine: the button just stays "Notify me".
      });
    return () => {
      cancelled = true;
    };
  }, [key, subscribe]);

  const handleClick = () => {
    if (!getToken()) {
      rememberPending(target);
      router.push(`/user/login?redirect=${encodeURIComponent(comeBackHere())}`);
      return;
    }
    void subscribe();
  };

  const handleCancel = async () => {
    if (!subscriptionId) return;
    setState("saving");
    try {
      await cancelWatch(subscriptionId);
      setSubscriptionId(null);
      setState("idle");
      toast({ title: "Alert cancelled", className: "top-[4rem]" });
    } catch (error) {
      setState("subscribed");
      toast({ title: "Couldn't cancel the alert", description: watchError(error).message, variant: "destructive", className: "top-[4rem]" });
    }
  };

  if (display === "inline") {
    if (state === "subscribed") {
      return (
        <p className={cn("flex items-center gap-1.5 text-xs font-medium text-green-700", className)}>
          <BellRing className="h-3.5 w-3.5" /> On your watch list
          <button type="button" onClick={handleCancel} className="font-normal underline">
            Cancel
          </button>
        </p>
      );
    }
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={cn("h-8 border-black text-xs", className)}
        onClick={handleClick}
        disabled={state === "saving"}
      >
        {state === "saving" ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Bell className="mr-1.5 h-3.5 w-3.5" />}
        {label}
      </Button>
    );
  }

  if (state === "subscribed") {
    return (
      <div className={cn("rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm", className)}>
        <p className="flex items-center gap-2 font-medium text-green-800">
          <BellRing className="h-4 w-4" /> You&apos;ll be notified on WhatsApp
        </p>
        <button type="button" onClick={handleCancel} className="mt-1 text-xs text-green-700 underline">
          Cancel alert
        </button>
      </div>
    );
  }

  return (
    <div className={className}>
      <Button
        type="button"
        variant="outline"
        className="w-full border-black"
        onClick={handleClick}
        disabled={state === "saving"}
      >
        {state === "saving" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bell className="mr-2 h-4 w-4" />}
        {label}
      </Button>
      <p className="mt-1.5 text-xs text-gray-500">We&apos;ll WhatsApp you when it&apos;s available from any seller on Treides.</p>
    </div>
  );
}
