"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import type { MenuData } from "@/lib/menu";
import { unsplashSrc } from "@/lib/site";
import MenuCard from "./MenuCard";

type Props = {
  data: MenuData;
};

export default function MenuTabs({ data }: Props) {
  const [active, setActive] = useState(data.categories[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const programmaticScrollRef = useRef(false);

  const q = query.trim().toLowerCase();

  const filtered = useMemo(() => {
    if (!q) return data.categories;
    return data.categories
      .map((cat) => ({
        ...cat,
        sections: cat.sections
          .map((sec) => ({
            ...sec,
            items: sec.items.filter(
              (i) =>
                i.name.toLowerCase().includes(q) ||
                (i.description ?? "").toLowerCase().includes(q),
            ),
          }))
          .filter((sec) => sec.items.length > 0),
      }))
      .filter((cat) => cat.sections.length > 0);
  }, [data.categories, q]);

  // Active tab on scroll — observe category sections
  useEffect(() => {
    if (q) return; // disabled while filtering
    const sections = data.categories
      .map((c) => sectionRefs.current[c.id])
      .filter(Boolean) as HTMLElement[];

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (programmaticScrollRef.current) return;
        const top = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (top) setActive((top.target as HTMLElement).dataset.catId ?? active);
      },
      { rootMargin: "-180px 0px -55% 0px", threshold: 0 },
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [data.categories, q, active]);

  const goTo = (id: string) => {
    setActive(id);
    const el = sectionRefs.current[id];
    if (!el) return;
    programmaticScrollRef.current = true;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => {
      programmaticScrollRef.current = false;
    }, 800);
  };

  return (
    <>
      {/* Sticky control strip — tabs + search */}
      <div className="sticky top-16 sm:top-20 z-30 bg-cream/90 backdrop-blur-md border-b border-ink/8">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <div className="flex items-center gap-3 py-3 tabs-row overflow-x-auto">
            {data.categories.map((cat) => {
              const isActive = active === cat.id && !q;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => goTo(cat.id)}
                  className={[
                    "relative shrink-0 px-4 py-2 text-sm transition-colors",
                    isActive ? "text-forest" : "text-ink-soft hover:text-forest",
                  ].join(" ")}
                  aria-current={isActive ? "true" : undefined}
                >
                  <span className="font-medium">{cat.name}</span>
                  <span
                    aria-hidden
                    className={[
                      "absolute left-3 right-3 -bottom-px h-0.5 origin-left transition-transform bg-gold",
                      isActive ? "scale-x-100" : "scale-x-0",
                    ].join(" ")}
                  />
                </button>
              );
            })}

            <div className="ml-auto relative w-full max-w-[260px]">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute pointer-events-none"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                type="search"
                inputMode="search"
                placeholder="Search the menu…"
                aria-label="Search the menu"
                className="w-full bg-cream-warm border border-ink/10 pl-9 pr-9 py-2 text-sm focus:border-gold focus:outline-none transition-colors"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-mute hover:text-forest"
                >
                  <X size={14} />
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="font-display text-2xl text-forest">No matches</p>
            <p className="mt-2 text-sm text-ink-soft">
              Try a different word — or{" "}
              <button onClick={() => setQuery("")} className="text-gold underline underline-offset-4">
                clear your search
              </button>
              .
            </p>
          </div>
        ) : (
          filtered.map((cat) => (
            <section
              key={cat.id}
              data-cat-id={cat.id}
              ref={(el) => {
                sectionRefs.current[cat.id] = el;
              }}
              id={`cat-${cat.id}`}
              className="scroll-mt-36 mb-16 sm:mb-24"
            >
              <header className="mb-8 sm:mb-10">
                {cat.image ? (
                  <div className="relative aspect-[16/7] sm:aspect-[16/6] overflow-hidden mb-6 bg-forest/10">
                    <Image
                      src={unsplashSrc(cat.image, 1600, 72)}
                      alt={cat.imageAlt ?? cat.name}
                      fill
                      sizes="(min-width: 1024px) 960px, 100vw"
                      className="object-cover"
                      priority={cat.id === "kitchen"}
                    />
                    <div
                      aria-hidden
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(180deg, rgba(15,42,31,0.05) 0%, rgba(15,42,31,0.55) 100%)",
                      }}
                    />
                    <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7 text-cream">
                      <p className="text-[10px] tracking-[0.3em] uppercase text-gold/95">
                        Section
                      </p>
                      <h2 className="mt-1 font-display text-4xl sm:text-5xl leading-tight">
                        {cat.name}
                      </h2>
                      <p className="mt-1 text-cream/85 text-sm italic max-w-md">
                        {cat.tagline}
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-baseline gap-3">
                      <span className="font-sans text-[11px] tracking-[0.3em] uppercase text-gold-deep">
                        Section
                      </span>
                      <span className="h-px flex-1 bg-ink/15" aria-hidden />
                    </div>
                    <h2 className="mt-3 font-display text-4xl sm:text-5xl text-forest">
                      {cat.name}
                    </h2>
                    <p className="mt-2 text-sm text-ink-soft max-w-md italic">
                      {cat.tagline}
                    </p>
                  </>
                )}
              </header>

              <div className="space-y-12">
                {cat.sections.map((sec) => (
                  <div key={sec.id} id={`sec-${sec.id}`} className="scroll-mt-36">
                    <div className="flex items-baseline justify-between gap-4 pb-3 border-b border-forest/15">
                      <h3 className="font-display text-xl sm:text-2xl text-forest">
                        {sec.title}
                      </h3>
                      {sec.subtitle ? (
                        <p className="text-[11px] tracking-[0.2em] uppercase text-ink-mute">
                          {sec.subtitle}
                        </p>
                      ) : null}
                    </div>
                    <ul className="mt-4">
                      {sec.items.map((item) => (
                        <MenuCard key={item.name} item={item} currency={data.currency} />
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          ))
        )}

        <p className="mt-16 text-center text-xs text-ink-mute italic">
          {data.disclaimer}
        </p>
      </div>
    </>
  );
}
