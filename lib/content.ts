/**
 * Content loading — handles 3-level structure:
 *   1. Single file:           content/projects/old.md
 *   2. Project with chapters: content/projects/foo/01-ch.md
 *   3. Project with sections: content/projects/bar/00-section/01-page.md
 *
 * Works in both local dev (fs + marked) and Cloudflare edge (JSON).
 */

export type ContentType = "blog" | "projects" | "notes" | "life";

export interface FrontMatter {
  title: string;
  date: string | Date;
  summary?: string;
  cover?: string;
  tags?: string[];
  published?: boolean;
  order?: number;
  links?: { github?: string; demo?: string; figma?: string };
  location?: string;
  photos?: string[];
}

export interface ContentItem extends FrontMatter {
  slug: string;          // full URL slug, e.g. "foo/00-section/01-page"
  type: ContentType;
  content: string;
  html?: string;
  isIndex?: boolean;     // true only for project's index.md
  parentSlug?: string;   // top-level project folder name
  sectionSlug?: string;  // section folder name (if nested under a section)
  sectionTitle?: string; // display name for the section
}

// ── Load data ──────────────────────────────────────────────────────────────

function loadData(): Record<ContentType, ContentItem[]> {
  // 1. Pre-generated JSON (production / Cloudflare edge).
  // In local dev, read the filesystem directly so deleted markdown files do
  // not linger because lib/content-data.json is intentionally gitignored.
  if (process.env.NODE_ENV === "production") {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const json = require("./content-data.json") as Record<ContentType, ContentItem[]>;
      return json;
    } catch { /* fall through */ }
  }

  // 2. fs fallback
  try {
    const fs     = require("fs")           as typeof import("fs");
    const path   = require("path")         as typeof import("path");
    const matter = require("gray-matter")  as typeof import("gray-matter");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { marked, Renderer } = require("marked") as typeof import("marked");
    const { toHeadingId } = require("./headings") as typeof import("./headings");

    const renderer = new Renderer();
    function normalizeProjectHref(href: string): string {
      if (href.startsWith("https://liangkx.com/explore/") && !href.startsWith("https://liangkx.com/explore/跨境电商/")) {
        return href.replace("https://liangkx.com/explore/", "https://liangkx.com/explore/跨境电商/");
      }
      if (href.startsWith("/explore/") && !href.startsWith("/explore/跨境电商/")) {
        return href.replace("/explore/", "/explore/跨境电商/");
      }
      return href;
    }

    function escapeAttr(value: string): string {
      return value
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    }

    (renderer as unknown as Record<string, unknown>).link = function (
      this: { parser?: { parseInline: (tokens: unknown[]) => string } },
      { href, title, text, tokens }: { href: string; title?: string | null; text: string; tokens?: unknown[] }
    ) {
      const normalizedHref = normalizeProjectHref(href);
      const html = tokens && this.parser ? this.parser.parseInline(tokens) : text;
      const titleAttr = title ? ` title="${escapeAttr(title)}"` : "";
      return `<a href="${escapeAttr(encodeURI(normalizedHref))}"${titleAttr}>${html}</a>`;
    };

    (renderer as unknown as Record<string, unknown>).heading = function (
      this: { parser?: { parseInline: (tokens: unknown[]) => string } },
      { text, depth, tokens }: { text: string; depth: number; tokens?: unknown[] }
    ) {
      const html = tokens && this.parser ? this.parser.parseInline(tokens) : text;
      const id = toHeadingId(html.replace(/<[^>]+>/g, ""));
      return `<h${depth} id="${id}">${html}</h${depth}>\n`;
    };
    marked.use({ renderer });

    // ── Obsidian-style callouts (mirrors scripts/build-content.mjs) ──
    const CALLOUT_ALIASES: Record<string, string> = {
      note: "note", info: "info", todo: "todo",
      tip: "tip", hint: "tip", important: "tip",
      success: "success", check: "success", done: "success",
      question: "question", help: "question", faq: "question",
      warning: "warning", caution: "warning", attention: "warning",
      failure: "failure", fail: "failure", missing: "failure",
      danger: "danger", error: "danger",
      bug: "bug", example: "example",
      quote: "quote", cite: "quote",
      abstract: "abstract", summary: "abstract", tldr: "abstract",
    };
    const CALLOUT_ICONS: Record<string, string> = {
      note:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
      info:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',
      todo:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>',
      tip:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.1V18h6v-1.2c0-.8.4-1.6 1-2.1A7 7 0 0 0 12 2Z"/></svg>',
      success:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
      question: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>',
      warning:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.7 18-9-15.5a2 2 0 0 0-3.4 0L.3 18A2 2 0 0 0 2 21h18a2 2 0 0 0 1.7-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>',
      failure:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>',
      danger:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z"/></svg>',
      bug:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m8 2 1.9 1.9"/><path d="M14.1 3.9 16 2"/><path d="M8 13h8"/><path d="M5 8h14"/><rect x="6" y="8" width="12" height="12" rx="6"/></svg>',
      example:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3h5v5"/><path d="M8 3H3v5"/><path d="M3 16v5h5"/><path d="M16 21h5v-5"/></svg>',
      quote:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21c3 0 7-1 7-8V5H3v7h4"/><path d="M14 21c3 0 7-1 7-8V5h-7v7h4"/></svg>',
      abstract: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3v4a1 1 0 0 0 1 1h4"/><path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z"/><path d="M9 13h6"/><path d="M9 17h6"/></svg>',
    };
    interface CalloutToken {
      type: "callout"; raw: string; calloutType: string; title: string; tokens: unknown[];
    }
    const calloutExtension = {
      name: "callout",
      level: "block" as const,
      start(src: string) {
        const m = src.match(/^>\s*\[!/m);
        return m ? m.index : undefined;
      },
      tokenizer(this: { lexer: { blockTokens: (src: string, tokens: unknown[]) => unknown } }, src: string): CalloutToken | undefined {
        const rule = /^(>[^\n]*(?:\n|$)(?:>[^\n]*(?:\n|$))*)/;
        const match = rule.exec(src);
        if (!match) return;
        const lines = match[1].replace(/\n$/, "").split("\n");
        const firstStripped = lines[0].replace(/^>\s?/, "");
        const header = /^\[!([A-Za-z]+)\][+-]?\s*(.*)$/.exec(firstStripped);
        if (!header) return;
        const rawType = header[1].toLowerCase();
        const type = CALLOUT_ALIASES[rawType] || "note";
        const customTitle = header[2].trim();
        const title = customTitle || (rawType[0].toUpperCase() + rawType.slice(1));
        const body = lines.slice(1).map(l => l.replace(/^>\s?/, "")).join("\n");
        const token: CalloutToken = { type: "callout", raw: match[0], calloutType: type, title, tokens: [] };
        this.lexer.blockTokens(body, token.tokens);
        return token;
      },
      renderer(this: { parser: { parse: (tokens: unknown[]) => string } }, token: CalloutToken): string {
        const body = this.parser.parse(token.tokens);
        const icon = CALLOUT_ICONS[token.calloutType] || CALLOUT_ICONS.note;
        return `<div class="callout callout-${token.calloutType}">`
          + `<div class="callout-title"><span class="callout-icon" aria-hidden="true">${icon}</span>`
          + `<span class="callout-title-text">${token.title}</span></div>`
          + `<div class="callout-content">${body}</div></div>\n`;
      },
    };
    marked.use({ extensions: [calloutExtension] });

    const META_FILES = new Set(["README.md", "CLAUDE.md", "readme.md", "claude.md"]);

    function normalizeDate(value: unknown): string {
      if (value instanceof Date) return value.toISOString().slice(0, 10);
      if (typeof value === "string") return value.slice(0, 10);
      return "";
    }

    function makeItem(
      filePath: string, slug: string, type: ContentType, extra: Partial<ContentItem> = {}
    ): ContentItem {
      const raw = fs.readFileSync(filePath, "utf-8");
      const { data, content } = matter(raw);
      const html = marked.parse(content) as string;
      const fallbackTitle = path.basename(filePath, ".md").replace(/^\d+[-_]?\s*/, "");
      return {
        ...(data as FrontMatter),
        title: (data as FrontMatter).title ?? fallbackTitle,
        date: normalizeDate((data as FrontMatter).date),
        slug, type, content, html,
        ...extra,
      };
    }

    /** Walk a project folder, grouping by first-level section directories. */
    function walkProject(
      dir: string,
      projectSlug: string,
      type: ContentType,
      currentSection: { slug: string; title: string } | null = null,
      nestedSlug = "",
    ): ContentItem[] {
      const out: ContentItem[] = [];
      const entries = fs.readdirSync(dir).sort();
      for (const entry of entries) {
        if (entry.startsWith(".") || entry.startsWith("_")) continue;
        if (entry.toLowerCase() === "claude.md") continue;
        if (!currentSection && entry.toLowerCase() === "readme.md") continue;
        const entryPath = path.join(dir, entry);
        const stat = fs.statSync(entryPath);

        if (stat.isFile() && entry.endsWith(".md")) {
          const isIndex = entry === "index.md" && !currentSection;
          const chapterSlug = entry.replace(".md", "");
          const pageSlug = nestedSlug ? `${nestedSlug}/${chapterSlug}` : chapterSlug;
          const fullSlug = isIndex
            ? projectSlug
            : currentSection
              ? `${projectSlug}/${currentSection.slug}/${pageSlug}`
              : `${projectSlug}/${pageSlug}`;

          const item = makeItem(entryPath, fullSlug, type, {
            isIndex,
            parentSlug: projectSlug,
            ...(currentSection && {
              sectionSlug: currentSection.slug,
              sectionTitle: currentSection.title,
            }),
          });
          if (isIndex || item.published !== false) out.push(item);
        } else if (stat.isDirectory()) {
          if (!currentSection) {
            out.push(...walkProject(entryPath, projectSlug, type, {
              slug: entry,
              title: entry,
            }));
          } else {
            const nextNestedSlug = nestedSlug ? `${nestedSlug}/${entry}` : entry;
            out.push(...walkProject(entryPath, projectSlug, type, currentSection, nextNestedSlug));
          }
        }
      }
      return out;
    }

    const contentDir = path.join(process.cwd(), "content");
    const result: Record<ContentType, ContentItem[]> = {
      blog: [], projects: [], notes: [], life: [],
    };

    for (const type of Object.keys(result) as ContentType[]) {
      const dir = path.join(contentDir, type);
      if (!fs.existsSync(dir)) continue;

      const entries = fs.readdirSync(dir);
      for (const entry of entries) {
        if (entry.startsWith(".") || entry.startsWith("_")) continue;
        if (META_FILES.has(entry)) continue;
        const entryPath = path.join(dir, entry);
        const stat = fs.statSync(entryPath);

        if (stat.isFile() && entry.endsWith(".md")) {
          const item = makeItem(entryPath, entry.replace(".md", ""), type);
          if (item.published !== false) result[type].push(item);
        } else if (stat.isDirectory()) {
          result[type].push(...walkProject(entryPath, entry, type));
        }
      }

      result[type].sort((a, b) => (a.date < b.date ? 1 : -1));
    }

    return result;
  } catch {
    return { blog: [], projects: [], notes: [], life: [] };
  }
}

const data = loadData();

// ── Public API ─────────────────────────────────────────────────────────────

export function getContentByType(type: ContentType): ContentItem[] {
  return data[type] ?? [];
}

export function findContentItem(fullSlug: string): ContentItem | null {
  for (const type of Object.keys(data) as ContentType[]) {
    const found = data[type].find((i) => i.slug === fullSlug);
    if (found) return found;
  }
  return null;
}

export function getContentItem(type: ContentType, slug: string): ContentItem | null {
  return data[type]?.find((i) => i.slug === slug) ?? null;
}

/**
 * All pages of a multi-page project, sorted:
 *   1. index first
 *   2. then by section slug (folder name with numeric prefix)
 *   3. then by page slug
 */
export function getProjectPages(parentSlug: string, type: ContentType): ContentItem[] {
  return (data[type] ?? [])
    .filter((i) => i.parentSlug === parentSlug)
    .sort((a, b) => {
      if (a.isIndex) return -1;
      if (b.isIndex) return 1;
      const aSec = a.sectionSlug ?? "";
      const bSec = b.sectionSlug ?? "";
      if (aSec !== bSec) return aSec < bSec ? -1 : 1;
      return a.slug < b.slug ? -1 : 1;
    });
}

function listableItems(type: ContentType): ContentItem[] {
  return getContentByType(type).filter((item) => !item.parentSlug || item.isIndex);
}

export function getAllBlogPosts(): ContentItem[] {
  return getContentByType("blog");
}

export function getAllExploreItems(): ContentItem[] {
  return [
    ...listableItems("projects"),
    ...listableItems("notes"),
    ...listableItems("life"),
  ].sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getHighlights(): ContentItem[] {
  return getAllExploreItems().slice(0, 6);
}

export function getLatestPosts(): ContentItem[] {
  return getAllBlogPosts().slice(0, 5);
}
