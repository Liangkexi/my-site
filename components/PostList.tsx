"use client";
import Link from "next/link";
import type { ContentItem } from "@/lib/content";
import { formatDate } from "@/lib/formatDate";

export default function PostList({ posts }: { posts: ContentItem[] }) {
  return (
    <div
      style={{
        background: "var(--card-bg)",
        border: "1px solid var(--sep)",
        borderRadius: 14,
        overflow: "hidden",
        boxShadow:
          "0 1px 2px rgba(15,23,42,0.04), 0 8px 24px rgba(15,23,42,0.06)",
      }}
    >
      {posts.map((post, idx) => (
        <Link
          key={post.slug}
          href={`/blog/${encodeURIComponent(post.slug)}`}
          style={{ textDecoration: "none", display: "block" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "16px 20px",
              borderTop: idx === 0 ? "none" : "1px solid var(--sep)",
              cursor: "pointer",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.background = "var(--bg-s)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.background = "transparent")}
          >
            <div
              style={{
                fontSize: 15.4,
                color: "var(--fg)",
                lineHeight: 1.4,
                flex: 1,
                minWidth: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {post.title}
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
              <svg
                width="8"
                height="14"
                viewBox="0 0 8 14"
                fill="none"
                style={{ color: "var(--fg-sub)", opacity: 0.6 }}
                aria-hidden="true"
              >
                <path
                  d="M1 1L7 7L1 13"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
