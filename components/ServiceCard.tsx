"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";

type Props = {
  index: number;
  icon: ReactNode;
  title: string;
  description: string;
  href: string;
  cta: string;
};

export default function ServiceCard({
  index,
  icon,
  title,
  description,
  href,
  cta,
}: Props) {
  const number = String(index).padStart(2, "0");
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
    >
      <Link
        href={href}
        className="group relative block h-full bg-cream-warm border border-ink/8 hover:border-gold transition-colors duration-300"
      >
        <div className="absolute top-4 right-4 text-[10px] tracking-[0.3em] uppercase text-ink-mute">
          {number}
        </div>

        <div className="px-6 pt-10 pb-7 flex flex-col h-full">
          <div className="w-11 h-11 rounded-full border border-gold/50 grid place-items-center text-forest group-hover:bg-gold group-hover:border-gold transition-colors">
            {icon}
          </div>

          <h3 className="mt-6 font-display text-2xl sm:text-3xl text-forest leading-tight">
            {title}
          </h3>

          <p className="mt-3 text-sm text-ink-soft leading-relaxed flex-1">
            {description}
          </p>

          <div className="mt-7 flex items-center justify-between pt-4 border-t border-ink/10 group-hover:border-gold transition-colors">
            <span className="text-xs tracking-[0.2em] uppercase text-forest font-medium">
              {cta}
            </span>
            <ArrowUpRight
              size={18}
              className="text-forest transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
