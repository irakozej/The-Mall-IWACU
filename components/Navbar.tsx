"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { useT } from "@/lib/i18n";
import LanguageSwitcher from "./LanguageSwitcher";

const linkDefs = [
  { href: "/", labelKey: "nav.home" },
  { href: "/menu", labelKey: "nav.menu" },
  { href: "/book", labelKey: "nav.book" },
  { href: "/about", labelKey: "nav.about" },
  { href: "/contact", labelKey: "nav.contact" },
];

export default function Navbar() {
  const t = useT();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      className={[
        "sticky top-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-cream/85 backdrop-blur-md border-b border-ink/5 shadow-soft"
          : "bg-cream/0 border-b border-transparent",
      ].join(" ")}
    >
      <nav className="max-w-7xl mx-auto px-5 sm:px-8 h-16 sm:h-20 flex items-center justify-between">
        <Link
          href="/"
          className="group inline-flex items-baseline gap-2 select-none"
          aria-label="The Mall IWACU"
        >
          <span className="font-display text-xl sm:text-2xl text-forest leading-none">
            The Mall
          </span>
          <span className="font-display italic text-xl sm:text-2xl text-gold leading-none">
            IWACU
          </span>
          <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-gold ml-1 translate-y-[-2px] group-hover:scale-125 transition-transform" />
        </Link>

        <ul className="hidden md:flex items-center gap-1">
          {linkDefs.map((l) => {
            const active =
              l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={[
                    "relative px-4 py-2 text-sm tracking-wide transition-colors",
                    active ? "text-forest" : "text-ink-soft hover:text-forest",
                  ].join(" ")}
                >
                  {t(l.labelKey)}
                  <span
                    className={[
                      "pointer-events-none absolute left-4 right-4 -bottom-0.5 h-px origin-left transition-transform",
                      "bg-gold",
                      active ? "scale-x-100" : "scale-x-0",
                    ].join(" ")}
                    aria-hidden
                  />
                </Link>
              </li>
            );
          })}
          <li className="ml-2 pl-3 border-l border-ink/10">
            <LanguageSwitcher />
          </li>
          <li className="ml-3">
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 bg-forest text-cream text-sm px-4 py-2.5 hover:bg-forest-deep transition-colors"
            >
              {t("common.viewMenu")}
              <span aria-hidden>→</span>
            </Link>
          </li>
        </ul>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="md:hidden -mr-2 p-2 text-forest"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-nav"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      <div
        id="mobile-nav"
        className={[
          "md:hidden overflow-hidden border-t border-ink/5 bg-cream",
          "transition-[max-height,opacity] duration-300",
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
        ].join(" ")}
      >
        <ul className="px-5 py-4 flex flex-col gap-1">
          {linkDefs.map((l, i) => {
            const active =
              l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={[
                    "block px-3 py-3 font-display text-2xl",
                    active ? "text-forest" : "text-ink",
                  ].join(" ")}
                >
                  <span className="text-gold/70 text-xs align-top mr-2 font-sans tracking-widest">
                    0{i + 1}
                  </span>
                  {t(l.labelKey)}
                </Link>
              </li>
            );
          })}
          <li className="mt-2 px-3 flex items-center justify-between gap-3">
            <span className="text-[11px] tracking-[0.25em] uppercase text-ink-mute">
              {t("common.language")}
            </span>
            <LanguageSwitcher />
          </li>
          <li className="mt-2">
            <Link
              href="/menu"
              className="block bg-forest text-cream text-center py-3 text-sm tracking-widest uppercase"
            >
              {t("common.menuShortcut")}
            </Link>
          </li>
        </ul>
      </div>
    </header>
  );
}
