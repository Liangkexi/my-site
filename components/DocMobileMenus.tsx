"use client";

import { useEffect, useState } from "react";
import DocSidebar, { type DocPage } from "@/components/DocSidebar";
import TableOfContents, { type TocHeading } from "@/components/TableOfContents";

export default function DocMobileMenus({
  pages,
  currentSlug,
  projectTitle,
  headings,
  showProjectMenu,
}: {
  pages: DocPage[];
  currentSlug: string;
  projectTitle: string;
  headings: TocHeading[];
  showProjectMenu: boolean;
}) {
  const [openPanel, setOpenPanel] = useState<"project" | "toc" | null>(null);
  const hasToc = headings.length > 0;

  useEffect(() => {
    if (!openPanel) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenPanel(null);
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [openPanel]);

  if (!showProjectMenu && !hasToc) return null;

  const close = () => setOpenPanel(null);

  return (
    <div className="doc-mobile-menus">
      <div className="doc-mobile-menus__bar" aria-label="移动端目录">
        {showProjectMenu && (
          <button
            type="button"
            className="doc-mobile-menu-btn"
            onClick={() => setOpenPanel("project")}
            aria-expanded={openPanel === "project"}
            aria-controls="doc-mobile-project-menu"
          >
            <MenuIcon />
            <span>项目目录</span>
          </button>
        )}
        {hasToc && (
          <button
            type="button"
            className="doc-mobile-menu-btn"
            onClick={() => setOpenPanel("toc")}
            aria-expanded={openPanel === "toc"}
            aria-controls="doc-mobile-toc-menu"
          >
            <ListIcon />
            <span>文章目录</span>
          </button>
        )}
      </div>

      <div
        className="doc-mobile-drawer"
        data-open={openPanel !== null}
        aria-hidden={openPanel === null}
      >
        <button
          type="button"
          className="doc-mobile-drawer__backdrop"
          aria-label="关闭目录"
          onClick={close}
          tabIndex={openPanel ? 0 : -1}
        />
        <section
          id={openPanel === "project" ? "doc-mobile-project-menu" : "doc-mobile-toc-menu"}
          className="doc-mobile-drawer__panel"
          role="dialog"
          aria-modal="true"
          aria-label={openPanel === "project" ? "项目目录" : "文章目录"}
        >
          <div className="doc-mobile-drawer__header">
            <p>{openPanel === "project" ? "项目目录" : "文章目录"}</p>
            <button type="button" onClick={close} aria-label="关闭目录">
              <CloseIcon />
            </button>
          </div>

          <div className="doc-mobile-drawer__body">
            {openPanel === "project" && (
              <DocSidebar
                pages={pages}
                currentSlug={currentSlug}
                projectTitle={projectTitle}
                onNavigate={close}
              />
            )}
            {openPanel === "toc" && (
              <TableOfContents headings={headings} onNavigate={close} />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function MenuIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 6h11M9 12h11M9 18h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M4 6h1M4 12h1M4 18h1" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
