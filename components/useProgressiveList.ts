"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Options = {
  initial?: number;
  step?: number;
  rootMargin?: string;
};

export default function useProgressiveList<T>(items: T[], options?: Options) {
  const initial = options?.initial ?? 10;
  const step = options?.step ?? 8;
  const rootMargin = options?.rootMargin ?? "900px 0px";

  const [count, setCount] = useState(() => Math.min(initial, items.length));
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Reset when the list identity changes.
  useEffect(() => {
    setCount(Math.min(initial, items.length));
  }, [items, initial]);

  const visible = useMemo(() => items.slice(0, count), [items, count]);
  const hasMore = count < items.length;

  useEffect(() => {
    if (!hasMore) return;
    const el = sentinelRef.current;
    if (!el) return;

    let locked = false;
    const io = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (!first?.isIntersecting) return;
        if (locked) return;
        locked = true;
        setCount((c) => Math.min(c + step, items.length));
        // allow subsequent triggers after state settles
        setTimeout(() => {
          locked = false;
        }, 120);
      },
      { rootMargin, threshold: 0.01 },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, items.length, rootMargin, step]);

  return { visible, hasMore, sentinelRef, count };
}

