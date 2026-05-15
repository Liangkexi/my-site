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

const require = createRequire(import.meta.url);
const matter  = require("gray-matter");
const { marked, Renderer } = require("marked");

const __dirname  = path.dirname(fileURLToPath(import.meta.url));
const contentDir = path.join(__dirname, "../content");
const outputFile = path.join(__dirname, "../lib/content-data.json");

// ── Heading ID (must match lib/headings.ts) ──
function toHeadingId(text) {
  return text.trim().toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w一-鿿-]/g, "")
    .replace(/^-+|-+$/g, "");
}

const renderer = new Renderer();
function normalizeProjectHref(href) {
  if (href.startsWith("https://liangkx.com/explore/") && !href.startsWith("https://liangkx.com/explore/跨境电商/")) {
    return href.replace("https://liangkx.com/explore/", "https://liangkx.com/explore/跨境电商/");
  }
  if (href.startsWith("/explore/") && !href.startsWith("/explore/跨境电商/")) {
    return href.replace("/explore/", "/explore/跨境电商/");
  }
  return href;
}

function escapeAttr(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

renderer.link = function ({ href, title, text, tokens }) {
  const normalizedHref = normalizeProjectHref(href);
  const html = tokens && this.parser ? this.parser.parseInline(tokens) : text;
  const titleAttr = title ? ` title="${escapeAttr(title)}"` : "";
  return `<a href="${escapeAttr(encodeURI(normalizedHref))}"${titleAttr}>${html}</a>`;
};

renderer.heading = function ({ text, depth, tokens }) {
  const html = tokens && this.parser ? this.parser.parseInline(tokens) : text;
  const id = toHeadingId(html.replace(/<[^>]+>/g, ""));
  return `<h${depth} id="${id}">${html}</h${depth}>\n`;
};
marked.use({ renderer });

// ── Obsidian-style callouts ──
const CALLOUT_ALIASES = {
  note: "note",
  info: "info",
  todo: "todo",
  tip: "tip", hint: "tip", important: "tip",
  success: "success", check: "success", done: "success",
  question: "question", help: "question", faq: "question",
  warning: "warning", caution: "warning", attention: "warning",
  failure: "failure", fail: "failure", missing: "failure",
  danger: "danger", error: "danger",
  bug: "bug",
  example: "example",
  quote: "quote", cite: "quote",
  abstract: "abstract", summary: "abstract", tldr: "abstract",
};
const CALLOUT_ICONS = {
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

const calloutExtension = {
  name: "callout",
  level: "block",
  start(src) {
    const m = src.match(/^>\s*\[!/m);
    return m ? m.index : undefined;
  },
  tokenizer(src) {
    const rule = /^(>[^\n]*(?:\n|$)(?:>[^\n]*(?:\n|$))*)/;
    const match = rule.exec(src);
    if (!match) return;
    const block = match[1];
    const lines = block.replace(/\n$/, "").split("\n");
    const firstStripped = lines[0].replace(/^>\s?/, "");
    const header = /^\[!([A-Za-z]+)\]([+-]?)\s*(.*)$/.exec(firstStripped);
    if (!header) return;
    const rawType = header[1].toLowerCase();
    const type = CALLOUT_ALIASES[rawType] || "note";
    const foldMarker = header[2]; // "", "+", or "-"
    const customTitle = header[3].trim();
    const title = customTitle || (rawType[0].toUpperCase() + rawType.slice(1));
    const body = lines.slice(1).map(l => l.replace(/^>\s?/, "")).join("\n");
    const token = {
      type: "callout",
      raw: match[0],
      calloutType: type,
      foldMarker,
      title,
      tokens: [],
    };
    this.lexer.blockTokens(body, token.tokens);
    return token;
  },
  renderer(token) {
    const body = this.parser.parse(token.tokens);
    const icon = CALLOUT_ICONS[token.calloutType] || CALLOUT_ICONS.note;
    const foldable = token.foldMarker === "+" || token.foldMarker === "-";
    const openAttr = token.foldMarker === "+" ? " open" : "";
    const titleInner = `<span class="callout-icon" aria-hidden="true">${icon}</span>`
      + `<span class="callout-title-text">${token.title}</span>`
      + (foldable ? `<span class="callout-fold" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg></span>` : "");
    if (foldable) {
      return `<details class="callout callout-${token.calloutType} is-collapsible"${openAttr}>`
        + `<summary class="callout-title">${titleInner}</summary>`
        + `<div class="callout-content">${body}</div></details>\n`;
    }
    return `<div class="callout callout-${token.calloutType}">`
      + `<div class="callout-title">${titleInner}</div>`
      + `<div class="callout-content">${body}</div></div>\n`;
  },
};
marked.use({ extensions: [calloutExtension] });

const META_FILES = new Set(["README.md", "CLAUDE.md", "readme.md", "claude.md"]);

function normalizeDate(value) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "string") return value.slice(0, 10);
  return "";
}

function makeItem(filePath, slug, type, extra = {}) {
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  const html = marked.parse(content);
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

fs.writeFileSync(outputFile, JSON.stringify(result, null, 2), "utf-8");
const total = Object.values(result).flat().length;
console.log(`✓ content-data.json generated (${total} items)`);
