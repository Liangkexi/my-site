export const dynamic = "force-static";

import {
  getContentByType,
  findContentItem,
  getProjectPages,
  getAllExploreItems,
} from "@/lib/content";
import { extractHeadings } from "@/lib/headings";
import Link from "next/link";
import LightboxGallery from "@/components/LightboxGallery";
import TableOfContents from "@/components/TableOfContents";
import DocSidebar from "@/components/DocSidebar";
import DocMobileMenus from "@/components/DocMobileMenus";
import { formatDate } from "@/lib/formatDate";
import { notFound } from "next/navigation";

type ContentType = "projects" | "notes" | "life";

export async function generateStaticParams() {
  const types: ContentType[] = ["projects", "notes", "life"];
  return types.flatMap((type) =>
    getContentByType(type).map((item) => ({
      slug: item.slug.split("/"), // "icp-dex/01-ra" → ["icp-dex","01-ra"]
    }))
  );
}

export default async function ExploreDetailPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const fullSlug = slug.map(decodeURIComponent).join("/");

  const item = findContentItem(fullSlug);
  if (!item) notFound();

  const isGallery  = item.type === "life" && !!item.photos?.length;
  const isProject  = item.type === "projects";
  const isNotes    = item.type === "notes";
  const isMultiPage = !!item.parentSlug;
  const useDocLayout = (isProject || isNotes) && isMultiPage;

  // Sidebar pages (multi-page projects/notes)
  const projectPages = isMultiPage
    ? getProjectPages(item.parentSlug!, item.type as ContentType)
    : [];

  // TOC headings
  const headings = (isProject || isNotes) ? extractHeadings(item.content) : [];

  // Prev / Next
  let prev = null, next = null;
  if (isMultiPage) {
    const idx = projectPages.findIndex((p) => p.slug === fullSlug);
    prev = idx > 0 ? projectPages[idx - 1] : null;
    next = idx < projectPages.length - 1 ? projectPages[idx + 1] : null;
  } else {
    const all = getAllExploreItems();
    const idx = all.findIndex((i) => i.slug === fullSlug);
    prev = idx > 0 ? all[idx - 1] : null;
    next = idx < all.length - 1 ? all[idx + 1] : null;
  }

  // ── Shared header ──────────────────────────────────────────────────────────
  const backHref = isMultiPage ? `/explore/${item.parentSlug}` : "/explore";

  const header = (
    <div style={{ padding: "48px 0 0" }}>
      <Link
        href={isMultiPage && !item.isIndex ? backHref : "/explore"}
        style={{ fontSize: 13.2, color: "var(--accent-l-hex)", fontWeight: 600, display: "block", marginBottom: 20 }}
      >
        ← 发现
      </Link>

      {item.date && (
        <div style={{ fontSize: 13.2, color: "var(--fg-sub)", marginBottom: 10 }}>
          {formatDate(item.date)}
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
        <p style={{ fontSize: 16.5, color: "var(--fg-m)", lineHeight: 1.6, marginBottom: (isProject || isNotes) ? 16 : 32 }}>
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

  // ── Prev/Next nav ──────────────────────────────────────────────────────────
  const postNav = (
    <nav className="post-nav">
      {prev ? (
        <Link href={`/explore/${prev.slug.split("/").map(encodeURIComponent).join("/")}`} className="post-nav__card post-nav__card--prev">
          <div className="post-nav__header">
            <span className="post-nav__arrow">←</span>
            <span className="post-nav__meta">上一篇</span>
          </div>
          <span className="post-nav__title">{prev.title}</span>
        </Link>
      ) : <div />}
      {next ? (
        <Link href={`/explore/${next.slug.split("/").map(encodeURIComponent).join("/")}`} className="post-nav__card post-nav__card--next">
          <div className="post-nav__header">
            <span className="post-nav__meta">下一篇</span>
            <span className="post-nav__arrow">→</span>
          </div>
          <span className="post-nav__title">{next.title}</span>
        </Link>
      ) : <div />}
    </nav>
  );

  // ── GitBook two-column layout (projects & notes with multi-page) ───────────
  if (useDocLayout) {
    // Index page of a multi-page project: use the project title for sidebar header
    const indexItem = projectPages.find((p) => p.isIndex);
    const sidebarTitle = indexItem?.title ?? item.title;

    return (
      <div className="doc-wrap">
        <div className="doc-header">{header}</div>

        {item.cover && (
          <div className="doc-cover" style={{ backgroundImage: `url(${item.cover})` }} />
        )}

        <DocMobileMenus
          pages={projectPages}
          currentSlug={fullSlug}
          projectTitle={sidebarTitle}
          headings={headings}
          showProjectMenu={true}
        />

        <div className={`doc-layout doc-layout--with-sidebar${headings.length > 0 ? "" : " doc-layout--no-toc"}`}>
          {/* Left: project navigation */}
          <aside className="doc-sidebar-col">
            <DocSidebar
              pages={projectPages}
              currentSlug={fullSlug}
              projectTitle={sidebarTitle}
            />
          </aside>

          {/* Middle: content */}
          <div className="doc-content-col">
            {item.html ? (
              <article className="prose" style={{ paddingBottom: 56 }} dangerouslySetInnerHTML={{ __html: item.html }} />
            ) : null}
            {postNav}
          </div>

          {/* Right: article TOC */}
          {headings.length > 0 && (
            <aside className="doc-toc-col">
              <TableOfContents headings={headings} />
            </aside>
          )}
        </div>
      </div>
    );
  }

  // ── Single-column doc layout (single-file projects/notes) ─────────────────
  if (isProject || isNotes) {
    return (
      <div className="doc-wrap">
        <div className="doc-header">{header}</div>
        {item.cover && (
          <div className="doc-cover" style={{ backgroundImage: `url(${item.cover})` }} />
        )}
        <DocMobileMenus
          pages={[]}
          currentSlug={fullSlug}
          projectTitle={item.title}
          headings={headings}
          showProjectMenu={false}
        />
        <div className="doc-layout doc-layout--single">
          <div className="doc-content-col">
            {item.html ? (
              <article className="prose" style={{ paddingBottom: 56 }} dangerouslySetInnerHTML={{ __html: item.html }} />
            ) : null}
            {postNav}
          </div>
          {headings.length > 0 && (
            <aside className="doc-toc-col">
              <TableOfContents headings={headings} />
            </aside>
          )}
        </div>
      </div>
    );
  }

  // ── Original layout (life) ─────────────────────────────────────────────────
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

      {item.html ? (
        <article className="prose" style={{ paddingBottom: 56 }} dangerouslySetInnerHTML={{ __html: item.html }} />
      ) : null}

      {postNav}
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
