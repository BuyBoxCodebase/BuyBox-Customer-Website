"use client";

import { Check, ChevronDown, MapPin } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCity } from "@/hooks/city/useCity";
import { CITIES, CITY_CONFIG } from "@/lib/city";

export function CitySwitcher({ className = "" }: { className?: string }) {
  const { city, cityName, setCity } = useCity();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`Delivering to ${cityName}. Change city`}
          className={`flex items-center gap-1.5 rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm font-medium text-gray-900 whitespace-nowrap hover:bg-gray-50 outline-none ${className}`}>
          <MapPin className="w-4 h-4 shrink-0 text-orange-500" />
          <span>{cityName}</span>
          <ChevronDown className="w-4 h-4 shrink-0 text-gray-500" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" sideOffset={8} className="z-[1000] w-64 p-2 rounded-xl">
        <p className="px-2 pt-1 pb-2 text-sm font-semibold text-gray-900">Choose your city</p>
        {CITIES.map((option) => {
          const selected = option === city;
          return (
            <DropdownMenuItem
              key={option}
              onSelect={() => setCity(option)}
              className={`flex items-center gap-3 rounded-lg px-2 py-2.5 cursor-pointer ${selected ? "bg-orange-50" : ""}`}>
              <MapPin className={`w-4 h-4 shrink-0 ${selected ? "text-orange-500" : "text-gray-400"}`} />
              <span className={`flex-1 text-sm ${selected ? "font-semibold text-gray-900" : "text-gray-700"}`}>
                {CITY_CONFIG[option].name}
              </span>
              {selected && <Check className="w-4 h-4 text-orange-500" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
