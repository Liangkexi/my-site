"use client";

import { useEffect, useState } from "react";

export interface TocHeading {
  level: number;
  text: string;
  id: string;
}

export default function TableOfContents({ headings }: { headings: TocHeading[] }) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the topmost visible heading
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-72px 0% -60% 0%", threshold: 0 }
    );

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav className="toc" aria-label="目录">
      <p className="toc__title">目录</p>
      <ul className="toc__list">
        {headings.map(({ level, text, id }) => (
          <li key={id} className="toc__item" data-level={level}>
            <a
              href={`#${id}`}
              className="toc__link"
              data-active={activeId === id}
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById(id);
                if (el) {
                  const y = el.getBoundingClientRect().top + window.scrollY - 88;
                  window.scrollTo({ top: y, behavior: "smooth" });
                }
              }}
            >
              {text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
