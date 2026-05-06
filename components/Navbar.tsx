"use client";

import {
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
  NavBody,
  NavItems,
  Navbar as ResizableNavbar,
  NavbarLogo,
} from "@/components/ui/resizable-navbar";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface NavbarProps {
  dark: boolean;
  onToggle: () => void;
}

const navItems = [
  { name: "主页",  link: "/",        icon: <HomeIcon /> },
  { name: "博客",  link: "/blog",    icon: <BlogIcon /> },
  { name: "发现",  link: "/explore", icon: <ExploreIcon /> },
  { name: "简介",  link: "/about",   icon: <AboutIcon /> },
];

export default function Navbar({ dark, onToggle }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const close = () => setIsMobileMenuOpen(false);

  return (
    <div className="relative w-full">

      {/* ── Page blur backdrop ── */}
      <div
        className="mobile-backdrop"
        data-open={isMobileMenuOpen}
        aria-hidden="true"
        onClick={close}
      />

      <ResizableNavbar>
        {/* Desktop */}
        <NavBody>
          <NavbarLogo />
          <NavItems items={navItems.map(({ name, link }) => ({ name, link }))} />
          <div className="flex items-center gap-3">
            <ThemeToggle dark={dark} onToggle={onToggle} />
          </div>
        </NavBody>

        {/* Mobile */}
        <MobileNav>
          <MobileNavHeader>
            <NavbarLogo />
            <div className="flex items-center gap-2">
              <ThemeToggle dark={dark} onToggle={onToggle} />
              <MobileNavToggle
                isOpen={isMobileMenuOpen}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              />
            </div>
          </MobileNavHeader>

          <MobileNavMenu isOpen={isMobileMenuOpen} onClose={close}>
            {navItems.map((item) => {
              const active = pathname === item.link;
              return (
                <a
                  key={item.link}
                  href={item.link}
                  onClick={close}
                  className="mobile-nav-item"
                  data-active={active}
                >
                  <span className="mobile-nav-item__icon">{item.icon}</span>
                  <span className="mobile-nav-item__label">{item.name}</span>
                </a>
              );
            })}
          </MobileNavMenu>
        </MobileNav>
      </ResizableNavbar>
    </div>
  );
}

/* ── Theme toggle ── */
function ThemeToggle({ dark, onToggle }: { dark: boolean; onToggle: () => void }) {
  return (
    <button className="theme-icon-button" onClick={onToggle} type="button" aria-label="Toggle theme">
      <ThemeIcon dark={dark} />
    </button>
  );
}

function ThemeIcon({ dark }: { dark: boolean }) {
  if (dark) {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20.7 14.4A8.2 8.2 0 0 1 9.6 3.3 8.4 8.4 0 1 0 20.7 14.4Z" />
      </svg>
    );
  }
  return (
    <svg width="23" height="23" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3.8" />
      <path d="M12 2.8v2.1" /><path d="M12 19.1v2.1" />
      <path d="m5.5 5.5 1.5 1.5" /><path d="m17 17 1.5 1.5" />
      <path d="M2.8 12h2.1" /><path d="M19.1 12h2.1" />
      <path d="m5.5 18.5 1.5-1.5" /><path d="m17 7 1.5-1.5" />
    </svg>
  );
}

/* ── Nav icons ── */
function HomeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
      <path d="M9 21V12h6v9" />
    </svg>
  );
}

function BlogIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14,2 14,8 20,8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10,9 9,9 8,9" />
    </svg>
  );
}

function ExploreIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88" />
    </svg>
  );
}

function AboutIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
