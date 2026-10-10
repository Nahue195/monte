"use client";

import { useLayoutEffect, useRef } from "react";

// FLIP: when the order of `keys` changes, each element glides from its old spot.
export function useFlip(keys: string[]) {
  const nodes = useRef(new Map<string, HTMLElement>());
  const rects = useRef(new Map<string, DOMRect>());
  const signature = keys.join("|");

  useLayoutEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    for (const [key, el] of nodes.current) {
      const next = el.getBoundingClientRect();
      const prev = rects.current.get(key);
      if (prev && !reduce) {
        const dx = prev.left - next.left;
        const dy = prev.top - next.top;
        if (dx || dy) {
          el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "none" }], {
            duration: 280,
            easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          });
        }
      }
      rects.current.set(key, next);
    }
  }, [signature]);

  return (key: string) => (el: HTMLElement | null) => {
    if (el) nodes.current.set(key, el);
    else nodes.current.delete(key);
  };
}
