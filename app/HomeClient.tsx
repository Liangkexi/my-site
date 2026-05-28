"use client";

import Link from "next/link";
import type { ContentItem } from "@/lib/content";
import Card from "@/components/Card";
import PostList from "@/components/PostList";
import Reveal from "@/components/Reveal";
import useProgressiveList from "@/components/useProgressiveList";

export default function HomeClient({
  highlights,
  latestPosts,
}: {
  highlights: ContentItem[];
  latestPosts: ContentItem[];
}) {
  const highlightsPaging = useProgressiveList(highlights, {
    initial: 4,
    step: 4,
    rootMargin: "600px 0px",
  });

  const postsPaging = useProgressiveList(latestPosts, {
    initial: 4,
    step: 4,
    rootMargin: "600px 0px",
  });

  return (
    <>
      {/* Highlights */}
      {highlights.length > 0 && (
        <section style={{ marginBottom: 56 }}>
          <SectionHeader label="一些摘录" link={{ href: "/explore", text: "查看所有 →" }} />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: 12,
            }}
          >
            {highlightsPaging.visible.map((item, idx) => (
              <Reveal key={item.slug} style={{ transitionDelay: `${Math.min(idx, 8) * 22}ms` }}>
                <Card item={item} />
              </Reveal>
            ))}
          </div>
          {highlightsPaging.hasMore && <div ref={highlightsPaging.sentinelRef} style={{ height: 1 }} />}
        </section>
      )}

      {/* Latest Posts */}
      {latestPosts.length > 0 && (
        <section style={{ marginBottom: 56 }}>
          <SectionHeader label="最近博客" link={{ href: "/blog", text: "查看所有 →" }} />
          <Reveal>
            <PostList posts={postsPaging.visible} />
          </Reveal>
          {postsPaging.hasMore && <div ref={postsPaging.sentinelRef} style={{ height: 1 }} />}
        </section>
      )}
    </>
  );
}

function SectionHeader({
  label,
  link,
}: {
  label: string;
  link?: { href: string; text: string };
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 18,
      }}
    >
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: "var(--fg-sub)",
          textTransform: "uppercase",
          letterSpacing: "0.09em",
        }}
      >
        {label}
      </span>
      {link && (
        <Link href={link.href} style={{ fontSize: 12, color: "var(--accent-l-hex)", fontWeight: 500 }}>
          {link.text}
        </Link>
      )}
    </div>
  );
}
