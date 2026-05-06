"use client";

import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="hero-section">

      {/*
        hero-video-wrap:
          Desktop → position: absolute; inset: 0  (zero footprint in flex layout)
          Mobile  → position: relative; width: 100%; aspect-ratio: 750/600
                    (sets section height = full video content, no CSS crop)
      */}
      <div className="hero-video-wrap">

        {/* Responsive video */}
        <video
          className="hero-video"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
        >
          <source media="(min-width: 641px)" src="/video/hero.mp4"            type="video/mp4" />
          <source                             src="/video/hero_mobile_web.mp4" type="video/mp4" />
        </video>

        {/*
          SVG is inside hero-video-wrap (left: 30%, right: 0).
          viewBox 0 0 100 100 maps to the 70% video area.
          x=0 = 30% of viewport (left edge of video).

          Gradient x1=0→x2=26: solid bg at x 0–9, fades to transparent by x=26.
          Path curves to x≈30–33 around the monitors — their screens sit in
          the near-transparent tail and remain clearly visible.
        */}
        <svg
          className="hero-overlay-svg"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient
              id="hero-overlay-grad"
              x1="0" y1="0" x2="0" y2="0"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0"    stopColor="var(--bg)" stopOpacity="1" />
              <stop offset="0.35" stopColor="var(--bg)" stopOpacity="1" />
              <stop offset="1"    stopColor="var(--bg)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M 0,0
               L 10,0
               C 15,8  26,17 30,28
               C 33,37 33,46 30,55
               C 25,64 16,74 10,83
               L 8,100 L 0,100 Z"
            fill="url(#hero-overlay-grad)"
          />
        </svg>

        {/* Mobile: bottom gradient — fades video into glass card */}
        <div className="hero-bottom-fade" aria-hidden="true" />

      </div>{/* /hero-video-wrap */}

      {/* Desktop: text sits on left gradient area */}
      <div className="hero-content">
        <span className="hero-tag">
          <span className="hero-tag-dot" />
          Product · Web3 · Life
        </span>
        <h1 className="hero-title">
          Hi, 我是 <span className="hero-title-accent">Liang</span>
        </h1>
        <p className="hero-subtitle">
          在这里发现和记录一些有趣的事，关于生活，关于工作，也关于自己。
        </p>
        <div className="hero-actions">
          <Link href="/blog" className="hero-btn hero-btn--primary">查看博客</Link>
          <Link href="/explore" className="hero-btn hero-btn--secondary">发现更多</Link>
        </div>
      </div>

      {/* Mobile: frosted glass card — in-flow after video wrap */}
      <div className="hero-mobile-card">
        <span className="hero-tag">
          <span className="hero-tag-dot" />
          Product · Web3 · Life
        </span>
        <h2 className="hero-title">
          Hi, 我是 <span className="hero-title-accent">Liang</span>
        </h2>
        <p className="hero-subtitle">
          在这里发现和记录一些有趣的事，关于生活，关于工作，也关于自己。
        </p>
        <div className="hero-actions-mobile">
          <Link href="/blog" className="hero-btn hero-btn--primary hero-btn--full">
            <BookIcon />
            查看博客
          </Link>
          <Link href="/explore" className="hero-btn hero-btn--ghost hero-btn--full">
            发现更多 →
          </Link>
        </div>
      </div>

    </section>
  );
}

function BookIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}
