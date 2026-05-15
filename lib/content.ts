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
