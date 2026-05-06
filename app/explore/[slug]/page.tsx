export const dynamic = "force-static";

import { getContentItem, getContentByType, getAllExploreItems } from "@/lib/content";
import { extractHeadings } from "@/lib/headings";
import { MDXRemote } from "next-mdx-remote/rsc";
import Link from "next/link";
import LightboxGallery from "@/components/LightboxGallery";
import TableOfContents from "@/components/TableOfContents";
import { notFound } from "next/navigation";

type ContentType = "projects" | "notes" | "life";

export async function generateStaticParams() {
  const types: ContentType[] = ["projects", "notes", "life"];
  return types.flatMap((type) =>
    getContentByType(type).map((item) => ({ slug: item.slug }))
  );
}

/** Custom MDX heading components that inject id= for TOC anchor links */
function makeHeadings(toId: (t: string) => string) {
  const H = (level: 2 | 3) =>
    function Heading({ children }: { children?: React.ReactNode }) {
      const text = String(children ?? "");
      const id = toId(text);
      if (level === 2) return <h2 id={id}>{children}</h2>;
      return <h3 id={id}>{children}</h3>;
    };
  return { h2: H(2), h3: H(3) };
}

export default async function ExploreDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  const types: ContentType[] = ["projects", "notes", "life"];
  let item = null;
  for (const type of types) {
    const found = getContentItem(type, decodedSlug);
    if (found) { item = found; break; }
  }
  if (!item) notFound();

  const isGallery = item.type === "life" && item.photos && item.photos.length > 0;
  const isProject = item.type === "projects";

  // Extract TOC headings for projects
  const headings = isProject ? extractHeadings(item.content) : [];

  // Prev / Next
  const all = getAllExploreItems();
  const idx = all.findIndex((i) => i.slug === decodedSlug);
  const prev = idx > 0              ? all[idx - 1] : null;
  const next = idx < all.length - 1 ? all[idx + 1] : null;

  // MDX heading components with auto-generated IDs
  const { toHeadingId } = await import("@/lib/headings");
  const mdxComponents = isProject ? makeHeadings(toHeadingId) : {};

  // ── Header section (shared) ──
  const header = (
    <div style={{ padding: "48px 0 0" }}>
      <Link
        href="/explore"
        style={{ fontSize: 13.2, color: "var(--accent-l-hex)", fontWeight: 600, display: "block", marginBottom: 20 }}
      >
        ← 发现
      </Link>

      {item.date && (
        <div style={{ fontSize: 13.2, color: "var(--fg-sub)", marginBottom: 10 }}>
          {item.date.slice(0, 10)}
        </div>
      )}

      <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
        {item.tags?.map((tag) => (
          <span key={tag} style={{ fontSize: 12.1, padding: "2px 8px", borderRadius: 4, background: "var(--tag-bg)", color: "var(--tag-fg)", fontWeight: 600 }}>
            {tag}
          </span>
        ))}
      </div>

      <h1 style={{ fontSize: "clamp(1.65rem, 3.3vw, 2.2rem)", fontWeight: 700, color: "var(--fg)", letterSpacing: "-0.02em", lineHeight: 1.3, marginBottom: 10 }}>
        {item.title}
      </h1>

      {item.summary && (
        <p style={{ fontSize: 16.5, color: "var(--fg-m)", lineHeight: 1.6, marginBottom: isProject ? 16 : 32 }}>
          {item.summary}
        </p>
      )}

      {isProject && item.links && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 32 }}>
          {item.links.github && <ExtLink href={item.links.github} label="GitHub" />}
          {item.links.demo   && <ExtLink href={item.links.demo}   label="Live Demo" />}
          {item.links.figma  && <ExtLink href={item.links.figma}  label="Figma" />}
        </div>
      )}

      {item.location && (
        <div style={{ fontSize: 13.2, color: "var(--fg-sub)", marginBottom: 24 }}>
          📍 {item.location}
        </div>
      )}
    </div>
  );

  // ── Project: GitBook two-column layout ──
  if (isProject) {
    return (
      <div className="doc-wrap">
        {/* Header full-width above columns */}
        <div className="doc-header">{header}</div>

        {/* Cover image */}
        {item.cover && (
          <div className="doc-cover" style={{ backgroundImage: `url(${item.cover})` }} />
        )}

        {/* Two-column: TOC + Content */}
        <div className="doc-layout">
          {/* Left: sticky TOC */}
          <aside className="doc-toc-col">
            <TableOfContents headings={headings} />
          </aside>

          {/* Right: article content + prev/next */}
          <div className="doc-content-col">
            {item.content.trim() && (
              <article className="prose" style={{ paddingBottom: 56 }}>
                <MDXRemote source={item.content} components={mdxComponents} />
              </article>
            )}

            <nav className="post-nav">
              {prev ? (
                <Link href={`/explore/${encodeURIComponent(prev.slug)}`} className="post-nav__card post-nav__card--prev">
                  <div className="post-nav__header">
                    <span className="post-nav__arrow">←</span>
                    <span className="post-nav__meta">上一篇</span>
                  </div>
                  <span className="post-nav__title">{prev.title}</span>
                </Link>
              ) : <div />}
              {next ? (
                <Link href={`/explore/${encodeURIComponent(next.slug)}`} className="post-nav__card post-nav__card--next">
                  <div className="post-nav__header">
                    <span className="post-nav__meta">下一篇</span>
                    <span className="post-nav__arrow">→</span>
                  </div>
                  <span className="post-nav__title">{next.title}</span>
                </Link>
              ) : <div />}
            </nav>
          </div>
        </div>
      </div>
    );
  }

  // ── Non-project: original single-column layout ──
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px" }}>
      {header}

      {item.cover && !isGallery && (
        <div style={{ height: 240, borderRadius: 12, marginBottom: 40, background: `url(${item.cover}) center/cover no-repeat`, border: "1px solid var(--border)" }} />
      )}

      {isGallery && item.photos && (
        <div style={{ marginBottom: 40 }}>
          <LightboxGallery photos={item.photos} title={item.title} />
        </div>
      )}

      {item.content.trim() && (
        <article className="prose" style={{ paddingBottom: 56 }}>
          <MDXRemote source={item.content} />
        </article>
      )}

      <nav className="post-nav">
        {prev ? (
          <Link href={`/explore/${encodeURIComponent(prev.slug)}`} className="post-nav__card post-nav__card--prev">
            <div className="post-nav__header">
              <span className="post-nav__arrow">←</span>
              <span className="post-nav__meta">上一篇</span>
            </div>
            <span className="post-nav__title">{prev.title}</span>
          </Link>
        ) : <div />}
        {next ? (
          <Link href={`/explore/${encodeURIComponent(next.slug)}`} className="post-nav__card post-nav__card--next">
            <div className="post-nav__header">
              <span className="post-nav__meta">下一篇</span>
              <span className="post-nav__arrow">→</span>
            </div>
            <span className="post-nav__title">{next.title}</span>
          </Link>
        ) : <div />}
      </nav>
    </div>
  );
}

function ExtLink({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      style={{ padding: "7px 14px", fontSize: 13.2, fontWeight: 600, borderRadius: 6, background: "var(--accent-s)", color: "var(--accent-l-hex)", border: "1px solid var(--border)" }}>
      {label}
    </a>
  );
}
