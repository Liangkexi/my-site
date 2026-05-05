import { getHighlights, getLatestPosts } from "@/lib/content";
import HeroSection from "@/components/HeroSection";
import Link from "next/link";
import HomeClient from "./HomeClient";

export const dynamic = "force-static";

export default function HomePage() {
  const highlights = getHighlights();
  const latestPosts = getLatestPosts();

  return (
    <>
      {/* Full-width Hero — outside the content column */}
      <HeroSection />

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ marginTop: 64 }}>
          <HomeClient highlights={highlights} latestPosts={latestPosts} />
        </div>
      </div>
    </>
  );
}

function SectionHeader({
  label,
  link,
}: {
  label: string;
  link?: { href: string; text: string };
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 18,
      }}
    >
      <span
        style={{
          fontSize: 13.2,
          fontWeight: 700,
          color: "var(--fg-sub)",
          textTransform: "uppercase",
          letterSpacing: "0.09em",
        }}
      >
        {label}
      </span>
      {link && (
        <Link href={link.href} style={{ fontSize: 13.2, color: "var(--accent-l-hex)", fontWeight: 500 }}>
          {link.text}
        </Link>
      )}
    </div>
  );
}
