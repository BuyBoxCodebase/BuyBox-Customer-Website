"use client";

import { useEffect, useState } from "react";

const TYPE_MS = 55;
const DELETE_MS = 25;
const HOLD_MS = 1800; // a finished phrase stays up this long
const GAP_MS = 350; // pause on the empty box before the next phrase
const STATIC_ROTATE_MS = 3000; // reduced motion: swap whole phrases instead

/**
 * Types each phrase out, holds it, deletes it and moves on to the next, looping while
 * `active`. Returns the text to show. With reduced motion it swaps whole phrases instead.
 */
export function useTypewriter(phrases: readonly string[], active: boolean): string {
  const [text, setText] = useState("");

  useEffect(() => {
    if (!active || phrases.length === 0) return;

    let index = 0;
    let timer: ReturnType<typeof setTimeout>;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setText(phrases[0]);
      const interval = setInterval(() => {
        index = (index + 1) % phrases.length;
        setText(phrases[index]);
      }, STATIC_ROTATE_MS);
      return () => clearInterval(interval);
    }

    let length = 0;
    let deleting = false;
    const step = () => {
      const phrase = phrases[index];
      if (!deleting) {
        length += 1;
        setText(phrase.slice(0, length));
        if (length >= phrase.length) {
          deleting = true;
          timer = setTimeout(step, HOLD_MS);
          return;
        }
        timer = setTimeout(step, TYPE_MS);
      } else {
        length -= 1;
        setText(phrase.slice(0, length));
        if (length <= 0) {
          deleting = false;
          index = (index + 1) % phrases.length;
          timer = setTimeout(step, GAP_MS);
          return;
        }
        timer = setTimeout(step, DELETE_MS);
      }
    };
    setText("");
    timer = setTimeout(step, GAP_MS);
    return () => clearTimeout(timer);
  }, [active, phrases]);

  return text;
}
