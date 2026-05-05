/**
 * Pre-build script: reads all markdown files and writes content-data.json
 * Run before `next build` so Cloudflare Workers never needs fs at runtime.
 */
import fs   from "fs";
import path from "path";
import { fileURLToPath } from "url";

// gray-matter as CJS via dynamic require
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const matter = require("gray-matter");

const __dirname  = path.dirname(fileURLToPath(import.meta.url));
const contentDir = path.join(__dirname, "../content");
const outputFile = path.join(__dirname, "../lib/content-data.json");

const TYPES = ["blog", "projects", "notes", "life"];
const result = {};

for (const type of TYPES) {
  const dir = path.join(contentDir, type);
  if (!fs.existsSync(dir)) { result[type] = []; continue; }

  const files = fs.readdirSync(dir).filter(f => f.endsWith(".md"));
  result[type] = files
    .map(file => {
      const raw = fs.readFileSync(path.join(dir, file), "utf-8");
      const { data, content } = matter(raw);
      return { ...data, slug: file.replace(".md", ""), type, content };
    })
    .filter(item => item.published !== false)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

fs.writeFileSync(outputFile, JSON.stringify(result, null, 2), "utf-8");
console.log(`✓ content-data.json generated (${Object.values(result).flat().length} items)`);
