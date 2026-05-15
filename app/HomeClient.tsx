"use client";

import Link from "next/link";
import type { ContentItem } from "@/lib/content";
import Card from "@/components/Card";
import Reveal from "@/components/Reveal";
import useProgressiveList from "@/components/useProgressiveList";
import { formatDate } from "@/lib/formatDate";

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
          <div style={{ display: "flex", flexDirection: "column" }}>
            {postsPaging.visible.map((post, idx) => (
              <Reveal key={post.slug} style={{ transitionDelay: `${Math.min(idx, 10) * 18}ms` }}>
                <Link href={`/blog/${post.slug}`} style={{ textDecoration: "none" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "14px 0",
                      borderBottom: "1px solid var(--sep)",
                      cursor: "pointer",
                      transition: "opacity 0.15s",
                    }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.opacity = "0.7")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.opacity = "1")}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 15.4,
                          color: "var(--fg)",
                          marginBottom: 6,
                          lineHeight: 1.4,
                        }}
                      >
                        {post.title}
                      </div>
                      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                        {post.tags?.map((tag) => (
                          <span
                            key={tag}
                            style={{
                              fontSize: 12.1,
                              padding: "2px 8px",
                              borderRadius: 4,
                              background: "var(--tag-bg)",
                              color: "var(--tag-fg)",
                              fontWeight: 600,
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        flexShrink: 0,
                        paddingLeft: 16,
                      }}
                    >
                      <span style={{ fontSize: 13.2, color: "var(--fg-sub)", whiteSpace: "nowrap" }}>
                        {formatDate(post.date)}
                      </span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
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
