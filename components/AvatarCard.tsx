"use client";
import { useRef, useEffect } from "react";

export default function AvatarCard() {
  const cardRef = useRef<HTMLDivElement>(null);
  const glossRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const card = cardRef.current;
    const gloss = glossRef.current;
    if (!card || !gloss) return;
    const cardEl = card;
    const glossEl = gloss;

    function lerp(a: number, b: number, t: number) {
      return a + (b - a) * t;
    }

    function tick() {
      current.current.x = lerp(current.current.x, target.current.x, 0.12);
      current.current.y = lerp(current.current.y, target.current.y, 0.12);
      const { x, y } = current.current;
      cardEl.style.transform = `rotateX(${y}deg) rotateY(${x}deg)`;
      glossEl.style.background = `radial-gradient(circle at ${50 + x * 2}% ${50 - y * 2}%, rgba(255,255,255,0.20), transparent 65%)`;
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);

    const scene = card.parentElement!;

    function onMove(e: MouseEvent) {
      const r = scene.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      target.current.x = x * 22;
      target.current.y = -y * 22;
    }

    function onLeave() {
      target.current.x = 0;
      target.current.y = 0;
    }

    scene.addEventListener("mousemove", onMove);
    scene.addEventListener("mouseleave", onLeave);

    // Mobile gyroscope support
    function onOrientation(e: DeviceOrientationEvent) {
      if (e.beta == null) return;
      target.current.x = Math.max(-15, Math.min(15, (e.gamma ?? 0) * 0.4));
      target.current.y = Math.max(-15, Math.min(15, ((e.beta ?? 0) - 45) * 0.4));
    }
    window.addEventListener("deviceorientation", onOrientation);

    return () => {
      cancelAnimationFrame(rafRef.current);
      scene.removeEventListener("mousemove", onMove);
      scene.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("deviceorientation", onOrientation);
    };
  }, []);

  return (
    <div
      style={{
        width: 96,
        height: 96,
        perspective: 600,
        flexShrink: 0,
        cursor: "default",
      }}
    >
      <div
        ref={cardRef}
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          transformStyle: "preserve-3d",
          position: "relative",
          overflow: "hidden",
          border: "2px solid var(--border)",
        }}
      >
        {/* Avatar image */}
        <img
          src="/images/avatar.jpg"
          alt="Leo avatar"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            borderRadius: "50%",
            pointerEvents: "none",
            userSelect: "none",
          }}
        />
        {/* Gloss layer */}
        <div
          ref={glossRef}
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.20), transparent 65%)",
            pointerEvents: "none",
          }}
        />
      </div>
    </div>
  );
}
