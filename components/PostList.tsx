"use client";
import Link from "next/link";
import type { ContentItem } from "@/lib/content";

export default function PostList({ posts }: { posts: ContentItem[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {posts.map((post) => (
        <Link
          key={post.slug}
          href={`/blog/${encodeURIComponent(post.slug)}`}
          style={{ textDecoration: "none" }}
        >
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
                {post.date?.slice(0, 10)}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
