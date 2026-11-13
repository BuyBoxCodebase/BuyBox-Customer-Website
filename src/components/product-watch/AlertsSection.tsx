"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BellOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/toast/use-toast";
import {
  cancelAllWatches,
  cancelWatch,
  getWatchSettings,
  listWatches,
  savePhoneNumber,
  watchError,
  WatchSettings,
  WatchSubscription,
} from "@/lib/product-watch";

function safeReturnTo(value: string | null): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return null;
  return value;
}

function watchLink(watch: WatchSubscription): string | null {
  return watch.sourceVariantId ? `/product/${watch.sourceVariantId}` : null;
}

export default function AlertsSection() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = safeReturnTo(searchParams.get("returnTo"));

  const [settings, setSettings] = useState<WatchSettings | null>(null);
  const [watches, setWatches] = useState<WatchSubscription[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [phone, setPhone] = useState("");
  const [savingPhone, setSavingPhone] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [loadedSettings, loadedWatches] = await Promise.all([getWatchSettings(), listWatches()]);
      setSettings(loadedSettings);
      setWatches(loadedWatches);
      setPhone((current) => current || loadedSettings.phoneNumber || "");
    } catch {
      setLoadFailed(true);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSavePhone = async (event: React.FormEvent) => {
    event.preventDefault();
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 9 || digits.length > 15) {
      toast({ title: "Enter a valid WhatsApp number", description: "For example 0771234567 or +263771234567.", variant: "destructive" });
      return;
    }
    setSavingPhone(true);
    try {
      await savePhoneNumber(phone.trim());
      const refreshed = await getWatchSettings();
      if (!refreshed.hasValidPhone) {
        toast({ title: "That number doesn't look right", description: "Check it and try again.", variant: "destructive" });
        return;
      }
      setSettings(refreshed);
      toast({ title: "WhatsApp number saved" });
      // They came here from a Notify me button: send them back so it can finish.
      if (returnTo) router.push(returnTo);
    } catch (error) {
      toast({ title: "Couldn't save your number", description: watchError(error).message, variant: "destructive" });
    } finally {
      setSavingPhone(false);
    }
  };

  const handleCancel = async (id: string) => {
    setBusyId(id);
    try {
      await cancelWatch(id);
      setWatches((current) => current?.filter((watch) => watch.id !== id) ?? current);
      toast({ title: "Alert cancelled" });
    } catch (error) {
      toast({ title: "Couldn't cancel the alert", description: watchError(error).message, variant: "destructive" });
    } finally {
      setBusyId(null);
    }
  };

  const handleCancelAll = async () => {
    setBusyId("all");
    try {
      await cancelAllWatches();
      setWatches([]);
      toast({ title: "All alerts cancelled" });
    } catch (error) {
      toast({ title: "Couldn't cancel your alerts", description: watchError(error).message, variant: "destructive" });
    } finally {
      setBusyId(null);
    }
  };

  if (loadFailed) {
    return <p className="text-sm text-red-500">Couldn&apos;t load your alerts. Refresh to try again.</p>;
  }
  if (!settings || !watches) return <Loader2 className="h-6 w-6 animate-spin text-gray-400" />;

  return (
    <div className="space-y-8">
      {/* Where alerts are sent */}
      <form onSubmit={handleSavePhone} className="max-w-md space-y-2">
        <label htmlFor="alert-phone" className="text-sm font-medium">
          WhatsApp number
        </label>
        {!settings.hasValidPhone && (
          <p className="rounded-lg bg-yellow-50 px-3 py-2 text-sm text-yellow-800">
            Add your WhatsApp number so we can message you when something you want is available.
          </p>
        )}
        <div className="flex gap-2">
          <Input
            id="alert-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            data-track-ignore
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="0771234567"
            className="h-11 rounded-lg bg-white"
          />
          <Button type="submit" disabled={savingPhone} className="h-11 rounded-lg bg-black px-5 text-white hover:bg-black/85">
            {savingPhone ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
          </Button>
        </div>
        <p className="text-xs text-gray-500">This is also the number on your account.</p>
      </form>

      {/* What they're waiting for */}
      <div>
        <div className="mb-2 flex items-center justify-between gap-3">
          <h3 className="font-medium">Waiting for ({watches.length})</h3>
          {watches.length > 1 && (
            <button
              type="button"
              onClick={handleCancelAll}
              disabled={busyId === "all"}
              className="text-sm text-gray-600 underline disabled:opacity-50"
            >
              Cancel all
            </button>
          )}
        </div>

        {watches.length === 0 ? (
          <div className="py-8 text-center">
            <BellOff className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-3 text-sm text-gray-500">
              No alerts yet. When something you want isn&apos;t available, tap &ldquo;Notify me&rdquo; and we&apos;ll message you the moment it is.
            </p>
          </div>
        ) : (
          <ul className="-mx-2 divide-y divide-black/5">
            {watches.map((watch) => {
              const href = watchLink(watch);
              const details = [watch.sizeLabel && `Size ${watch.sizeLabel}`, watch.colourLabel].filter(Boolean).join(" · ");
              return (
                <li key={watch.id} className="flex items-center gap-3 px-2 py-3">
                  {watch.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={watch.image} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover" />
                  )}
                  <div className="min-w-0 flex-1">
                    {href ? (
                      <Link href={href} className="block truncate font-medium hover:underline">
                        {watch.displayName}
                      </Link>
                    ) : (
                      <p className="truncate font-medium">{watch.displayName}</p>
                    )}
                    {details && <p className="truncate text-sm text-gray-600">{details}</p>}
                    <p className="text-xs text-gray-500">
                      Set up {new Date(watch.createdAt).toLocaleDateString()} · expires {new Date(watch.expiresAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={busyId === watch.id || busyId === "all"}
                    onClick={() => handleCancel(watch.id)}
                    className="shrink-0 rounded-lg"
                  >
                    Cancel
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
