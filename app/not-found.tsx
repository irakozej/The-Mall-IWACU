import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ImigongoPattern from "@/components/ImigongoPattern";

export default function NotFound() {
  return (
    <section className="relative bg-forest-deep text-cream overflow-hidden min-h-[80vh] flex items-center">
      <ImigongoPattern className="absolute -right-32 -top-32 w-[560px] h-[560px] opacity-90" />
      <ImigongoPattern className="absolute -left-32 -bottom-32 w-[420px] h-[420px] opacity-80" opacity={0.12} />

      <div className="relative max-w-4xl mx-auto px-5 sm:px-8 py-20 text-center">
        <p className="text-[11px] tracking-[0.3em] uppercase text-gold/85">
          You wandered off the menu
        </p>
        <h1 className="mt-3 font-display text-7xl sm:text-9xl leading-none">
          4<span className="italic text-gold">0</span>4.
        </h1>
        <p className="mt-6 max-w-md mx-auto text-cream/80">
          That page is not on the table. But the rest of the mall is open — pull
          up a chair.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-gold text-forest-deep px-5 py-3 hover:bg-gold-soft transition-colors"
          >
            <ArrowLeft size={16} /> Back to home
          </Link>
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 border border-cream/40 text-cream px-5 py-3 hover:bg-cream/10 transition-colors"
          >
            See the menu
          </Link>
        </div>
      </div>
    </section>
  );
}
