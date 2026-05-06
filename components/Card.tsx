"use client";
import Link from "next/link";
import type { ContentItem } from "@/lib/content";

const typeToPath: Record<string, string> = {
  blog: "blog",
  projects: "explore",
  notes: "explore",
  life: "explore",
};

const typeLabel: Record<string, string> = {
  blog: "Blog",
  projects: "Project",
  notes: "Note",
  life: "Life",
};

export default function Card({ item }: { item: ContentItem }) {
  const href = `/${typeToPath[item.type]}/${item.slug}`;

  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <div
        style={{
          background: "var(--card-bg)",
          border: "1px solid var(--border)",
          borderRadius: 10,
          overflow: "hidden",
          transition: "border-color 0.15s, transform 0.15s",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor = "var(--accent-hex)";
          (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
          (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
        }}
      >
        {/* Thumbnail */}
        <div
          style={{
            height: 120,
            background: item.cover
              ? `url(${item.cover}) center/cover no-repeat`
              : "linear-gradient(135deg, var(--accent-s), var(--thumb-bg))",
            position: "relative",
          }}
        >
          <span
            style={{
              position: "absolute",
              bottom: 8,
              left: 8,
              fontSize: 12.1,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "var(--tag-fg)",
              background: "var(--tag-bg)",
              padding: "3px 8px",
              borderRadius: 4,
              border: "1px solid var(--border)",
            }}
          >
            {typeLabel[item.type]}
          </span>
        </div>

        {/* Body */}
        <div style={{ padding: "12px 14px 14px" }}>
          <div
            style={{
              fontSize: 14.3,
              fontWeight: 600,
              color: "var(--fg)",
              marginBottom: 4,
              lineHeight: 1.4,
            }}
          >
            {item.title}
          </div>
          {item.summary && (
            <div
              style={{
                fontSize: 13.2,
                color: "var(--fg-m)",
                lineHeight: 1.55,
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {item.summary}
            </div>
          )}
          {item.tags && item.tags.length > 0 && (
            <div style={{ display: "flex", gap: 4, marginTop: 8, flexWrap: "wrap" }}>
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontSize: 12.1,
                    padding: "2px 7px",
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
          )}
          {item.date && (
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                gap: 10,
                marginTop: 10,
              }}
            >
              <span style={{ fontSize: 13.2, color: "var(--fg-sub)", whiteSpace: "nowrap" }}>
                {item.date.slice(0, 10)}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
