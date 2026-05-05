"use client";

import { useEffect, useRef, useState } from "react";

export default function Reveal({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || shown) return;

    const io = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (!first) return;
        if (first.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: "120px 0px -10% 0px", threshold: 0.01 },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [shown]);

  return (
    <div
      ref={ref}
      className={className ?? "reveal"}
      data-revealed={shown ? "true" : "false"}
      style={style}
    >
      {children}
    </div>
  );
}

