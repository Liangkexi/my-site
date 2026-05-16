import type { marked, Renderer } from "marked";

export function toHeadingId(text: string): string;
export function preprocessMarkdown(src: string): string;

export function applyMarkdownConfig(
  markedInstance: typeof marked,
  RendererClass: typeof Renderer,
): void;
