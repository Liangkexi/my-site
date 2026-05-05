"use client";
import { useMemo, useState } from "react";
import Image from "next/image";
import type { ContentItem } from "@/lib/content";
import PostList from "@/components/PostList";
import Reveal from "@/components/Reveal";
import useProgressiveList from "@/components/useProgressiveList";

export default function BlogClient({ posts }: { posts: ContentItem[] }) {
  const allTags = ["All", ...Array.from(new Set(posts.flatMap((p) => p.tags ?? [])))];
  const [activeTag, setActiveTag] = useState("All");
  const filtered = useMemo(
    () => (activeTag === "All" ? posts : posts.filter((p) => p.tags?.includes(activeTag))),
    [activeTag, posts],
  );

  const { visible, hasMore, sentinelRef } = useProgressiveList(filtered, {
    initial: 4,
    step: 5,
    rootMargin: "50px 0px",
  });

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px" }}>

      {/* Blog banner */}
      <div className="blog-banner">
        <Image
          src="/images/blog-banner.png"
          alt="Blog banner"
          fill
          priority
          style={{ objectFit: "cover", objectPosition: "center 30%" }}
        />
        {/* Bottom fade into page background */}
        <div className="blog-banner__fade" />
      </div>

      <section style={{ padding: "32px 0 32px" }}>
        <h1 style={{ fontSize: "2.2rem", fontWeight: 700, letterSpacing: "-0.025em", color: "var(--fg)", marginBottom: 8 }}>
          博客
        </h1>
        <p style={{ fontSize: 15.4, color: "var(--fg-m)", marginBottom: 24 }}>
          记录日常中的一些零碎想法
        </p>
        {/* Tag filter */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              style={{
                fontSize: 13.2,
                padding: "5px 14px",
                borderRadius: 20,
                border: "1px solid",
                borderColor: activeTag === tag ? "var(--accent-hex)" : "var(--border)",
                background: activeTag === tag ? "var(--accent-hex)" : "var(--bg-s)",
                color: activeTag === tag ? "#fff" : "var(--fg-m)",
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {tag}
            </button>
          ))}
        </div>
      </section>

      <Reveal>
        <PostList posts={visible} />
      </Reveal>
      {hasMore && <div ref={sentinelRef} style={{ height: 1 }} />}
    </div>
  );
}
