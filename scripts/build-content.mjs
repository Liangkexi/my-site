/**
 * Pre-build script: reads all markdown files, compiles them to HTML,
 * and writes content-data.json.
 * Run before `next build` so Cloudflare Workers never needs fs or
 * dynamic MDX evaluation at runtime.
 */
import fs   from "fs";
import path from "path";
import { fileURLToPath } from "url";

// CJS packages via dynamic require
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const matter = require("gray-matter");
const { marked, Renderer } = require("marked");

const __dirname  = path.dirname(fileURLToPath(import.meta.url));
const contentDir = path.join(__dirname, "../content");
const outputFile = path.join(__dirname, "../lib/content-data.json");

// ── Heading ID helper (must match lib/headings.ts toHeadingId) ──────────────
function toHeadingId(text) {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w一-鿿-]/g, "")  // keep ASCII word chars + CJK + hyphens
    .replace(/^-+|-+$/g, "");
}

// ── Custom marked renderer: inject id= on headings ──────────────────────────
const renderer = new Renderer();
renderer.heading = function({ text, depth }) {
  const plainText = text.replace(/<[^>]+>/g, ""); // strip inline HTML
  const id = toHeadingId(plainText);
  return `<h${depth} id="${id}">${text}</h${depth}>\n`;
};
marked.use({ renderer });

// ── Build ────────────────────────────────────────────────────────────────────
const TYPES = ["blog", "projects", "notes", "life"];
const result = {};

for (const type of TYPES) {
  const dir = path.join(contentDir, type);
  if (!fs.existsSync(dir)) { result[type] = []; continue; }

  const files = fs.readdirSync(dir).filter(f => f.endsWith(".md"));
  result[type] = files
    .map(file => {
      const raw  = fs.readFileSync(path.join(dir, file), "utf-8");
      const { data, content } = matter(raw);
      const html = marked.parse(content);          // compile markdown → HTML at build time
      return { ...data, slug: file.replace(".md", ""), type, content, html };
    })
    .filter(item => item.published !== false)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

fs.writeFileSync(outputFile, JSON.stringify(result, null, 2), "utf-8");
console.log(`✓ content-data.json generated (${Object.values(result).flat().length} items)`);
