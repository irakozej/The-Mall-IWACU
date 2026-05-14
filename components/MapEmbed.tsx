import { site } from "@/lib/site";

type Props = {
  className?: string;
  ariaLabel?: string;
};

export default function MapEmbed({ className, ariaLabel }: Props) {
  return (
    <div className={["relative", className].filter(Boolean).join(" ")}>
      <div
        className="absolute -top-2 -left-2 w-full h-full border border-gold/60 pointer-events-none rounded-2xl"
        aria-hidden
      />
      <iframe
        title={ariaLabel ?? "Map of The Mall IWACU in Kabeza, Kicukiro, Kigali"}
        src={site.mapEmbed}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="relative block w-full h-full min-h-[280px] border-0 bg-cream-warm rounded-2xl"
      />
    </div>
  );
}
