import type { TocHeading } from "@/components/TableOfContents";
import { toHeadingId } from "./markdown-config.mjs";

export { toHeadingId };

/** Extract H2 / H3 headings from raw markdown */
export function extractHeadings(markdown: string): TocHeading[] {
  const headings: TocHeading[] = [];
  for (const line of markdown.split("\n")) {
    const m3 = line.match(/^###\s+(.+)/);
    const m2 = !m3 && line.match(/^##\s+(.+)/);
    if (m2) headings.push({ level: 2, text: m2[1].trim(), id: toHeadingId(m2[1]) });
    if (m3) headings.push({ level: 3, text: m3[1].trim(), id: toHeadingId(m3[1]) });
  }
  return headings;
}
