"use client";

import { useState } from "react";

export const EMOJIS: Record<number, { face: string; code: string; label: string }> = {
  1: { face: "😡", code: "1f621", label: "Terrible" },
  2: { face: "😕", code: "1f615", label: "Poor" },
  3: { face: "😐", code: "1f610", label: "Okay" },
  4: { face: "🙂", code: "1f642", label: "Good" },
  5: { face: "😍", code: "1f60d", label: "Love it" },
};

export const emojiFor = (value: number) =>
  EMOJIS[Math.min(5, Math.max(1, Math.round(value)))];

export function AnimatedEmoji({
  emoji,
  size,
}: {
  emoji: { face: string; code: string; label: string };
  size: number;
}) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <span role="img" aria-label={emoji.label} style={{ fontSize: size * 0.85, lineHeight: 1 }}>
        {emoji.face}
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://fonts.gstatic.com/s/e/notoemoji/latest/${emoji.code}/512.gif`}
      alt={emoji.label}
      width={size}
      height={size}
      loading="lazy"
      onError={() => setFailed(true)}
      style={{ width: size, height: size }}
    />
  );
}

export function Face({ value, size = 16 }: { value: number; size?: number }) {
  return <AnimatedEmoji emoji={emojiFor(value)} size={size} />;
}
