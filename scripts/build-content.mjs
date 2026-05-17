/**
 * Pre-build script: walks content/ (with 3-level support), compiles
 * markdown → HTML, writes lib/content-data.json.
 *
 * Structure:
 *   content/projects/foo.md                       → single file
 *   content/projects/bar/index.md                 → multi-page project root
 *   content/projects/bar/01-chapter.md            → chapter
 *   content/projects/bar/00-section/01-page.md    → grouped chapter (1 level deep)
 */
import fs   from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import { applyMarkdownConfig, preprocessMarkdown } from "../lib/markdown-config.mjs";

const require = createRequire(import.meta.url);
const matter  = require("gray-matter");
const { marked, Renderer } = require("marked");

const __dirname  = path.dirname(fileURLToPath(import.meta.url));
const contentDir = path.join(__dirname, "../content");
const outputFile = path.join(__dirname, "../lib/content-data.json");

applyMarkdownConfig(marked, Renderer);

const META_FILES = new Set(["README.md", "CLAUDE.md", "readme.md", "claude.md"]);

function normalizeDate(value) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "string") return value.slice(0, 10);
  return "";
}

function makeItem(filePath, slug, type, extra = {}) {
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  const html = marked.parse(preprocessMarkdown(content));
  // Fallback title from filename (strip extension + numeric prefix)
  const fallbackTitle = path.basename(filePath, ".md").replace(/^\d+[-_]?\s*/, "");
  return {
    ...data,
    title: data.title ?? fallbackTitle,
    date: normalizeDate(data.date),
    slug, type, content, html, ...extra,
  };
}

/** Walk a project folder, grouping by first-level section directories. */
function walkProject(dir, projectSlug, type, currentSection = null, nestedSlug = "") {
  const out = [];
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
      // For flat files with a 'part' frontmatter field, use it as section grouping
      if (!isIndex && !currentSection && item.part) {
        item.sectionSlug = item.part;
        item.sectionTitle = item.part;
      }
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

// ── Build ──
const TYPES = ["blog", "projects", "notes", "life"];
const result = {};

for (const type of TYPES) {
  const dir = path.join(contentDir, type);
  result[type] = [];
  if (!fs.existsSync(dir)) continue;

  const entries = fs.readdirSync(dir);
  for (const entry of entries) {
    if (entry.startsWith(".") || entry.startsWith("_")) continue;
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

fs.writeFileSync(outputFile, JSON.stringify(result), "utf-8");
const total = Object.values(result).flat().length;
console.log(`✓ content-data.json generated (${total} items)`);
