"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type NavItem = {
  name: string;
  link: string;
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function Navbar({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 24);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="resizable-navbar" data-scrolled={scrolled}>
      {children}
    </header>
  );
}

export function NavBody({ children }: { children: React.ReactNode }) {
  return <div className="resizable-navbar__body">{children}</div>;
}

const stripSlash = (p: string) => (p !== "/" && p.endsWith("/") ? p.slice(0, -1) : p);

export function NavItems({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const current = stripSlash(pathname);

  return (
    <ul className="resizable-navbar__items">
      {items.map((item) => (
        <li key={item.link}>
          <Link
            className="resizable-navbar__item"
            href={item.link}
            data-active={current === stripSlash(item.link)}
          >
            {item.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function MobileNav({ children }: { children: React.ReactNode }) {
  return <div className="resizable-navbar__mobile">{children}</div>;
}

export function NavbarLogo() {
  return (
    <Link className="resizable-navbar__logo" href="/" aria-label="Liang home">
      <img className="resizable-navbar__logo-avatar" src="/images/avatar.jpg" alt="" aria-hidden="true" />
    </Link>
  );
}

type NavbarButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    href?: string;
    variant?: "primary" | "secondary";
    className?: string;
  };

export function NavbarButton({
  children,
  className,
  href,
  variant = "primary",
  ...props
}: NavbarButtonProps) {
  const classes = cn(
    "resizable-navbar__button",
    variant === "secondary" && "resizable-navbar__button--secondary",
    variant === "primary" && "resizable-navbar__button--primary",
    className,
  );

  if (href) {
    return (
      <Link className={classes} href={href}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} type="button" {...props}>
      {children}
    </button>
  );
}

export function MobileNavHeader({ children }: { children: React.ReactNode }) {
  return <div className="resizable-navbar__mobile-header">{children}</div>;
}

export function MobileNavToggle({
  isOpen,
  onClick,
}: {
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className="resizable-navbar__mobile-toggle"
      onClick={onClick}
      type="button"
      aria-label={isOpen ? "Close menu" : "Open menu"}
      aria-expanded={isOpen}
    >
      <span />
      <span />
      <span />
    </button>
  );
}

export function MobileNavMenu({
  children,
  isOpen,
}: {
  children: React.ReactNode;
  isOpen: boolean;
  onClose?: () => void;
}) {
  return (
    <div className="resizable-navbar__mobile-menu" data-open={isOpen}>
      {children}
    </div>
  );
}
