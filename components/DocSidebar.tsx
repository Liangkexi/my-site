"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";

export interface DocPage {
  slug: string;
  title: string;
  isIndex?: boolean;
  sectionSlug?: string;
  sectionTitle?: string;
}

interface Section {
  slug: string;
  title: string;
  pages: DocPage[];
}

/** Group pages by sectionSlug, preserving insertion order. */
function groupPages(pages: DocPage[]) {
  const topLevel: DocPage[] = [];
  const sections = new Map<string, Section>();

  for (const page of pages) {
    if (!page.sectionSlug) {
      topLevel.push(page);
    } else {
      if (!sections.has(page.sectionSlug)) {
        sections.set(page.sectionSlug, {
          slug: page.sectionSlug,
          title: page.sectionTitle ?? page.sectionSlug,
          pages: [],
        });
      }
      sections.get(page.sectionSlug)!.pages.push(page);
    }
  }

  return { topLevel, sections: Array.from(sections.values()) };
}

function pageHref(slug: string): string {
  return `/explore/${slug.split("/").map(encodeURIComponent).join("/")}`;
}

function titleFromSlug(slug: string): string {
  return decodeURIComponent(slug.split("/").at(-1) ?? slug);
}

export default function DocSidebar({
  pages,
  currentSlug,
  projectTitle,
  onNavigate,
}: {
  pages: DocPage[];
  currentSlug: string;
  projectTitle: string;
  onNavigate?: () => void;
}) {
  const { topLevel, sections } = groupPages(pages);

  // Track which section the current page belongs to (auto-expand it)
  const currentPage = pages.find((p) => p.slug === currentSlug);
  const currentSectionSlug = currentPage?.sectionSlug;

  // Open all sections by default; remember user toggles after that
  const [openSections, setOpenSections] = useState<Set<string>>(
    () => new Set(sections.map((s) => s.slug)),
  );

  // When path changes, ensure the active section is open
  useEffect(() => {
    if (currentSectionSlug) {
      setOpenSections((prev) => {
        if (prev.has(currentSectionSlug)) return prev;
        const next = new Set(prev);
        next.add(currentSectionSlug);
        return next;
      });
    }
  }, [currentSectionSlug]);

  const toggle = (slug: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  // ── Persist sidebar scroll position across navigations ──
  const navRef = useRef<HTMLElement>(null);
  const STORAGE_KEY = `sidebar-scroll:${currentSlug.split("/")[0]}`; // per-project key

  // Restore scroll on mount
  useEffect(() => {
    const el = navRef.current;
    if (!el) return;
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved !== null) el.scrollTop = Number(saved);
  // Only run on mount (key changes per project, not per page)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save scroll before navigating
  const saveScroll = useCallback(() => {
    const el = navRef.current;
    if (el) sessionStorage.setItem(STORAGE_KEY, String(el.scrollTop));
    onNavigate?.();
  }, [STORAGE_KEY, onNavigate]);

  return (
    <nav ref={navRef} className="doc-sidebar" aria-label="章节导航">
      <p className="doc-sidebar__project">{projectTitle}</p>

      <ul className="doc-sidebar__list">
        {/* Top-level pages (index + un-sectioned chapters) */}
        {topLevel.map((page) => (
          <li key={page.slug}>
            <Link
              href={pageHref(page.slug)}
              className="doc-sidebar__link"
              data-active={currentSlug === page.slug}
              onClick={saveScroll}
            >
              {page.isIndex ? "概览" : (page.title || titleFromSlug(page.slug))}
            </Link>
          </li>
        ))}

        {/* Sections (collapsible) */}
        {sections.map((section) => {
          const open = openSections.has(section.slug);
          const hasActive = section.pages.some((p) => p.slug === currentSlug);
          return (
            <li key={section.slug} className="doc-sidebar__section">
              <button
                type="button"
                className="doc-sidebar__section-header"
                onClick={() => toggle(section.slug)}
                data-open={open}
                data-has-active={hasActive}
                aria-expanded={open}
              >
                <span className="doc-sidebar__caret" aria-hidden="true">▸</span>
                <span className="doc-sidebar__section-title">{section.title}</span>
              </button>

              {open && (
                <ul className="doc-sidebar__sublist">
                  {section.pages.map((page) => (
                    <li key={page.slug}>
                      <Link
                        href={pageHref(page.slug)}
                        className="doc-sidebar__link doc-sidebar__link--child"
                        data-active={currentSlug === page.slug}
                        onClick={saveScroll}
                      >
                        {page.title || titleFromSlug(page.slug)}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
