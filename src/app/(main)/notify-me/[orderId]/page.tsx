"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { BellRing, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import useGetOrderDetails from "@/hooks/order/useGetOrderDetails";
import { createWatch, watchError } from "@/lib/product-watch";

// Landing page for the "Notify me" button in the out-of-stock WhatsApp message (/notify-me/{orderId}).
// Logged-out customers are sent through login by the middleware and come back here; once they are
// here, every item of the order is put on their watch list without any further tap.

type Item = { variantId: string; label: string };
type Phase = "working" | "done" | "not-applicable" | "failed";

// Only orders the seller couldn't fulfil (or that were cancelled for it) are worth watching.
const WATCHABLE_STATUSES = ["OUT_OF_STOCK", "CANCELED"];

export default function NotifyMePage() {
  const params = useParams();
  const router = useRouter();
  const orderId = Array.isArray(params.orderId) ? params.orderId[0] : params.orderId;
  const { orderDetails, error } = useGetOrderDetails(orderId);

  const [phase, setPhase] = useState<Phase>("working");
  const [items, setItems] = useState<Item[]>([]);
  const [failure, setFailure] = useState<string | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (!orderDetails || started.current) return;
    started.current = true;

    if (!WATCHABLE_STATUSES.includes(orderDetails.status)) {
      setPhase("not-applicable");
      return;
    }

    const targets: Item[] = [];
    const seen = new Set<string>();
    for (const line of orderDetails.products ?? []) {
      const variantId = line.variant?.id;
      if (!variantId || seen.has(variantId)) continue;
      seen.add(variantId);
      const options = (line.variant?.formattedOptions ?? []).map((o) => `${o.name}: ${o.value}`).join(" · ");
      const name = line.variant?.name || line.product.name;
      targets.push({ variantId, label: options ? `${name} (${options})` : name });
    }
    setItems(targets);

    (async () => {
      try {
        // One by one: the server treats a repeat as "already on your list", so reopening this link is safe.
        for (const target of targets) {
          await createWatch({ variantId: target.variantId });
        }
        setPhase("done");
      } catch (err) {
        const { code, message } = watchError(err);
        if (code === "PHONE_REQUIRED") {
          // Needs a WhatsApp number first. Coming back to this page finishes the job.
          const back = encodeURIComponent(`/notify-me/${orderId}`);
          router.replace(`/user/profile?tab=alerts&addPhone=1&returnTo=${back}`);
          return;
        }
        setFailure(message);
        setPhase("failed");
      }
    })();
  }, [orderDetails, orderId, router]);

  // The order couldn't be loaded (wrong account, bad link, network).
  if (error && !orderDetails) {
    return (
      <Shell>
        <h1 className="text-xl font-semibold">We couldn&apos;t find this order</h1>
        <p className="mt-2 text-sm text-gray-600">
          Please make sure you are signed in to the account that placed it, or open it from your orders.
        </p>
        <Button asChild className="mt-6 w-full">
          <Link href="/">Continue shopping</Link>
        </Button>
      </Shell>
    );
  }

  if (!orderDetails || phase === "working") {
    return (
      <Shell>
        <Loader2 className="mx-auto h-7 w-7 animate-spin" />
        <p className="mt-3 text-sm text-gray-600">Setting up your alert…</p>
      </Shell>
    );
  }

  if (phase === "not-applicable") {
    return (
      <Shell>
        <h1 className="text-xl font-semibold">No alert needed</h1>
        <p className="mt-2 text-sm text-gray-600">This order is still being handled, so there is nothing to be notified about.</p>
        <Button asChild className="mt-6 w-full">
          <Link href={`/order/${orderId}`}>View order</Link>
        </Button>
      </Shell>
    );
  }

  if (phase === "failed") {
    return (
      <Shell>
        <h1 className="text-xl font-semibold text-red-600">Couldn&apos;t set up the alert</h1>
        <p className="mt-2 text-sm text-gray-600">{failure}</p>
        <Button className="mt-6 w-full" onClick={() => window.location.reload()}>
          Try again
        </Button>
        <Button asChild variant="outline" className="mt-2 w-full">
          <Link href={`/order/${orderId}`}>View order</Link>
        </Button>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
        <BellRing className="h-6 w-6 text-green-700" />
      </div>
      <h1 className="mt-4 text-xl font-semibold">You&apos;re on the list</h1>
      <p className="mt-2 text-sm text-gray-600">
        We&apos;ll message you on WhatsApp as soon as {items.length > 1 ? "these items are" : "this item is"} available again on
        Treides, from any seller.
      </p>
      {items.length > 0 && (
        <ul className="mt-4 space-y-2 text-left">
          {items.map((item) => (
            <li key={item.variantId} className="rounded-md border p-3 text-sm">
              {item.label}
            </li>
          ))}
        </ul>
      )}
      <Button asChild className="mt-6 w-full">
        <Link href="/">Continue shopping</Link>
      </Button>
      <Button asChild variant="outline" className="mt-2 w-full">
        <Link href="/user/profile?tab=alerts">Manage my alerts</Link>
      </Button>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md items-center justify-center px-4 py-10">
      <div className="w-full rounded-lg bg-white p-6 text-center shadow-lg">{children}</div>
    </div>
  );
}
