"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, ArrowRight } from "lucide-react";
import ImigongoPattern from "./ImigongoPattern";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-forest-deep text-cream grain isolate">
      <ImigongoPattern
        className="absolute -right-16 -top-16 w-[420px] h-[420px] sm:w-[560px] sm:h-[560px] opacity-90 pointer-events-none"
      />
      <ImigongoPattern
        className="absolute -left-24 -bottom-24 w-[320px] h-[320px] opacity-70 pointer-events-none"
        opacity={0.12}
      />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 30%, rgba(212,160,23,0.10), transparent 60%), radial-gradient(80% 60% at 100% 100%, rgba(15,42,31,0.7), transparent 60%)",
        }}
        aria-hidden
      />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 pt-20 sm:pt-28 pb-24 sm:pb-32">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 text-[11px] tracking-[0.25em] uppercase text-gold/90 border border-gold/40 px-3 py-1.5"
        >
          <MapPin size={12} className="text-gold" />
          Kicukiro · Kanombe · Kabeza · Kigali
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="mt-7 font-display leading-[0.95] tracking-tight text-5xl sm:text-7xl md:text-8xl"
        >
          The Mall
          <br />
          <span className="italic text-gold">IWACU.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-7 max-w-xl text-lg text-cream/85 leading-relaxed"
        >
          Your neighborhood destination — eat, drink, shop, relax. Groceries, bar,
          kitchen, and massage & steam, all under one warm roof.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-10 flex flex-wrap items-center gap-3"
        >
          <Link
            href="/menu"
            className="group inline-flex items-center gap-2 bg-gold text-forest-deep font-medium px-6 py-3.5 hover:bg-gold-soft transition-colors"
          >
            View the Menu
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 border border-cream/40 px-6 py-3.5 text-cream hover:bg-cream/10 transition-colors"
          >
            Visit Us
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.7 }}
          className="mt-16 sm:mt-24 grid grid-cols-2 sm:grid-cols-4 gap-y-6 gap-x-8 max-w-3xl"
        >
          {[
            ["07:00", "Doors Open"],
            ["4", "Services"],
            ["1", "Roof"],
            ["100%", "Iwacu"],
          ].map(([k, v]) => (
            <div key={v} className="">
              <div className="font-display text-3xl sm:text-4xl text-gold">{k}</div>
              <div className="mt-1 text-[11px] tracking-[0.2em] uppercase text-cream/65">{v}</div>
            </div>
          ))}
        </motion.div>
      </div>

      <div className="imigongo-strip" aria-hidden />
    </section>
  );
}
