"use client";
import { useMemo, useState } from "react";
import Image from "next/image";
import type { ContentItem, ContentType } from "@/lib/content";
import Card from "@/components/Card";
import Reveal from "@/components/Reveal";
import useProgressiveList from "@/components/useProgressiveList";

const tabs: { label: string; value: ContentType | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Projects", value: "projects" },
  { label: "Notes", value: "notes" },
  { label: "Life", value: "life" },
];

export default function ExploreClient({ items }: { items: ContentItem[] }) {
  const [active, setActive] = useState<ContentType | "all">("all");

  const filtered = useMemo(
    () => (active === "all" ? items : items.filter((i) => i.type === active)),
    [active, items],
  );

  const { visible, hasMore, sentinelRef } = useProgressiveList(filtered, {
    initial: 12,
    step: 9,
    rootMargin: "800px 0px",
  });

  const sections =
    active === "all"
      ? (["projects", "notes", "life"] as ContentType[]).map((type) => ({
          type,
          label: type.charAt(0).toUpperCase() + type.slice(1),
          items: items.filter((i) => i.type === type),
        })).filter((s) => s.items.length > 0)
      : null;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px" }}>

      {/* Explore banner */}
      <div className="blog-banner">
        <Image
          src="/images/explore-banner.png"
          alt="Explore banner"
          fill
          priority
          style={{ objectFit: "cover", objectPosition: "center 40%" }}
        />
        <div className="blog-banner__fade" />
      </div>

      <section style={{ padding: "32px 0 32px" }}>
        <h1 style={{ fontSize: "2.2rem", fontWeight: 700, letterSpacing: "-0.025em", color: "var(--fg)", marginBottom: 8 }}>
          发现
        </h1>
        <p style={{ fontSize: 15.4, color: "var(--fg-m)", marginBottom: 24 }}>
          生活瞬间，笔记，和工作相关
        </p>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActive(tab.value)}
              style={{
                fontSize: 13.2,
                padding: "5px 16px",
                borderRadius: 20,
                border: "1px solid",
                borderColor: active === tab.value ? "var(--accent-hex)" : "var(--border)",
                background: active === tab.value ? "var(--accent-hex)" : "var(--bg-s)",
                color: active === tab.value ? "#fff" : "var(--fg-m)",
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {/* All view: grouped by type */}
      {sections ? (
        sections.map((sec) => (
          <section key={sec.type} style={{ marginBottom: 48 }}>
            <div style={{ fontSize: 12.1, fontWeight: 700, color: "var(--fg-sub)", textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 16 }}>
              {sec.label}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
              {sec.items.map((item, idx) => (
                <Reveal key={item.slug} style={{ transitionDelay: `${Math.min(idx, 8) * 22}ms` }}>
                  <Card item={item} />
                </Reveal>
              ))}
            </div>
          </section>
        ))
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12, marginBottom: 56 }}>
            {visible.map((item, idx) => (
              <Reveal key={item.slug} style={{ transitionDelay: `${Math.min(idx, 10) * 18}ms` }}>
                <Card item={item} />
              </Reveal>
            ))}
          </div>
          {hasMore && <div ref={sentinelRef} style={{ height: 1 }} />}
        </>
      )}
    </div>
  );
}
