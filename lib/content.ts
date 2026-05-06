/**
 * Content loading — works in both local dev (fs) and Cloudflare edge (JSON).
 *
 * In CI / Cloudflare: `npm run build` calls the prebuild script first,
 * which generates lib/content-data.json. This file is then statically
 * imported so no fs access is needed at runtime.
 *
 * In local dev: if the JSON doesn't exist yet we fall back to fs.
 */

export type ContentType = "blog" | "projects" | "notes" | "life";

export interface FrontMatter {
  title: string;
  date: string;
  summary?: string;
  cover?: string;
  tags?: string[];
  published?: boolean;
  links?: { github?: string; demo?: string; figma?: string };
  location?: string;
  photos?: string[];
}

export interface ContentItem extends FrontMatter {
  slug: string;
  type: ContentType;
  content: string;
  /** Pre-compiled HTML. Present when loaded from content-data.json. */
  html?: string;
}

// ── Load data ──────────────────────────────────────────────────────────────

function loadData(): Record<ContentType, ContentItem[]> {
  // 1. Try the pre-generated JSON (always works on Cloudflare / edge)
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const json = require("./content-data.json") as Record<ContentType, ContentItem[]>;
    return json;
  } catch {
    // 2. Fall back to fs (local dev without running the prebuild script)
  }

  try {
    const fs     = require("fs")     as typeof import("fs");
    const path   = require("path")   as typeof import("path");
    const matter = require("gray-matter") as typeof import("gray-matter");
    // marked is safe on all runtimes (pure JS, no Node APIs)
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { marked, Renderer } = require("marked") as typeof import("marked");

    // Replicate the same heading renderer used in build-content.mjs
    const { toHeadingId } = require("./headings") as typeof import("./headings");
    const renderer = new Renderer();
    (renderer as unknown as Record<string, unknown>).heading = function ({ text, depth }: { text: string; depth: number }) {
      const plainText = text.replace(/<[^>]+>/g, "");
      const id = toHeadingId(plainText);
      return `<h${depth} id="${id}">${text}</h${depth}>\n`;
    };
    marked.use({ renderer });

    const contentDir = path.join(process.cwd(), "content");
    const result: Record<ContentType, ContentItem[]> = {
      blog: [], projects: [], notes: [], life: [],
    };

    for (const type of Object.keys(result) as ContentType[]) {
      const dir = path.join(contentDir, type);
      if (!fs.existsSync(dir)) continue;

      const files = fs.readdirSync(dir).filter((f: string) => f.endsWith(".md"));
      result[type] = files
        .map((file: string) => {
          const raw = fs.readFileSync(path.join(dir, file), "utf-8");
          const { data, content } = matter(raw);
          const html = marked.parse(content) as string;
          return { ...data, slug: file.replace(".md", ""), type, content, html } as ContentItem;
        })
        .filter((item: ContentItem) => item.published !== false)
        .sort((a: ContentItem, b: ContentItem) => (a.date < b.date ? 1 : -1));
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

export function getContentItem(type: ContentType, slug: string): ContentItem | null {
  return data[type]?.find(item => item.slug === slug) ?? null;
}

export function getAllBlogPosts(): ContentItem[] {
  return getContentByType("blog");
}

export function getAllExploreItems(): ContentItem[] {
  return [
    ...getContentByType("projects"),
    ...getContentByType("notes"),
    ...getContentByType("life"),
  ].sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getHighlights(): ContentItem[] {
  return getAllExploreItems().slice(0, 6);
}

export function getLatestPosts(): ContentItem[] {
  return getAllBlogPosts().slice(0, 5);
}
