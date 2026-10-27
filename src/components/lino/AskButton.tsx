"use client";

import { Sparkles } from "lucide-react";

interface AskButtonProps {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

export const AskButton = ({ onClick, disabled, className = "" }: AskButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-label="Ask Treides"
    className={`flex items-center gap-1.5 rounded-full bg-gray-100 px-3 text-sm font-medium text-black hover:bg-gray-200 disabled:opacity-40 transition-colors ${className}`}
  >
    <Sparkles className="h-4 w-4 text-fuchsia-500" />
    Ask
  </button>
);
