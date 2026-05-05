import fs from "fs";
import path from "path";
import matter from "gray-matter";

export type ContentType = "blog" | "projects" | "notes" | "life";

export interface FrontMatter {
  title: string;
  date: string;
  summary?: string;
  cover?: string;
  tags?: string[];
  published?: boolean;
  // project-specific
  links?: { github?: string; demo?: string; figma?: string };
  // life-specific
  location?: string;
  photos?: string[];
}

export interface ContentItem extends FrontMatter {
  slug: string;
  type: ContentType;
  content: string;
}

const contentDir = path.join(process.cwd(), "content");

export function getContentByType(type: ContentType): ContentItem[] {
  const dir = path.join(contentDir, type);
  if (!fs.existsSync(dir)) return [];

  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md"));

  return files
    .map((file) => {
      const raw = fs.readFileSync(path.join(dir, file), "utf-8");
      const { data, content } = matter(raw);
      return {
        ...(data as FrontMatter),
        slug: file.replace(".md", ""),
        type,
        content,
      };
    })
    .filter((item) => item.published !== false)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getContentItem(
  type: ContentType,
  slug: string
): ContentItem | null {
  const filePath = path.join(contentDir, type, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  return { ...(data as FrontMatter), slug, type, content };
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
  const all = getAllExploreItems();
  return all.slice(0, 6);
}

export function getLatestPosts(): ContentItem[] {
  return getAllBlogPosts().slice(0, 5);
}
