"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

const links = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/book", label: "Book" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
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
          aria-label="The Mall IWACU — Home"
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
          {links.map((l) => {
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
                  {l.label}
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
          <li className="ml-3">
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 bg-forest text-cream text-sm px-4 py-2.5 hover:bg-forest-deep transition-colors"
            >
              View Menu
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
          open ? "max-h-80 opacity-100" : "max-h-0 opacity-0",
        ].join(" ")}
      >
        <ul className="px-5 py-4 flex flex-col gap-1">
          {links.map((l) => {
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
                    0{links.indexOf(l) + 1}
                  </span>
                  {l.label}
                </Link>
              </li>
            );
          })}
          <li className="mt-2">
            <Link
              href="/menu"
              className="block bg-forest text-cream text-center py-3 text-sm tracking-widest uppercase"
            >
              Tap to View Menu
            </Link>
          </li>
        </ul>
      </div>
    </header>
  );
}
