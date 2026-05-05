import { getContentItem, getAllBlogPosts } from "@/lib/content";
import { MDXRemote } from "next-mdx-remote/rsc";
import Link from "next/link";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  const posts = getAllBlogPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const post = getContentItem("blog", decodedSlug);
  if (!post) notFound();

  // Prev / Next
  const all = getAllBlogPosts(); // sorted newest → oldest
  const idx = all.findIndex((p) => p.slug === decodedSlug);
  const prev = idx > 0              ? all[idx - 1] : null; // newer → 上一篇
  const next = idx < all.length - 1 ? all[idx + 1] : null; // older → 下一篇

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px" }}>
      <div style={{ padding: "48px 0 0" }}>
        <Link
          href="/blog"
          style={{ fontSize: 13.2, color: "var(--accent-l-hex)", fontWeight: 600, display: "block", marginBottom: 20 }}
        >
          ← 博客
        </Link>

        <div style={{ fontSize: 13.2, color: "var(--fg-sub)", marginBottom: 10, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <span>{post.date?.slice(0, 10)}</span>
          {post.tags?.map((tag) => (
            <span
              key={tag}
              style={{ fontSize: 12.1, padding: "2px 8px", borderRadius: 4, background: "var(--tag-bg)", color: "var(--tag-fg)", fontWeight: 600 }}
            >
              {tag}
            </span>
          ))}
        </div>

        <h1
          style={{ fontSize: "clamp(1.65rem, 3.3vw, 2.2rem)", fontWeight: 700, color: "var(--fg)", letterSpacing: "-0.02em", lineHeight: 1.3, marginBottom: 10 }}
        >
          {post.title}
        </h1>

        {post.summary && (
          <p style={{ fontSize: 16.5, color: "var(--fg-m)", lineHeight: 1.6, marginBottom: 32 }}>
            {post.summary}
          </p>
        )}
      </div>

      {/* Cover */}
      {post.cover && (
        <div
          style={{
            height: 240,
            borderRadius: 12,
            marginBottom: 40,
            background: `url(${post.cover}) center/cover no-repeat`,
            border: "1px solid var(--border)",
          }}
        />
      )}

      {/* Content */}
      <article className="prose" style={{ paddingBottom: 56 }}>
        <MDXRemote source={post.content} />
      </article>

      {/* Prev / Next navigation */}
      <nav className="post-nav">
        {prev ? (
          <Link href={`/blog/${encodeURIComponent(prev.slug)}`} className="post-nav__card post-nav__card--prev">
            <div className="post-nav__header">
              <span className="post-nav__arrow">←</span>
              <span className="post-nav__meta">上一篇</span>
            </div>
            <span className="post-nav__title">{prev.title}</span>
          </Link>
        ) : <div />}

        {next ? (
          <Link href={`/blog/${encodeURIComponent(next.slug)}`} className="post-nav__card post-nav__card--next">
            <div className="post-nav__header">
              <span className="post-nav__meta">下一篇</span>
              <span className="post-nav__arrow">→</span>
            </div>
            <span className="post-nav__title">{next.title}</span>
          </Link>
        ) : <div />}
      </nav>
    </div>
  );
}
