"use client";

import { useState } from "react";
import { Send, Check } from "lucide-react";
import { site } from "@/lib/site";
import { useT } from "@/lib/i18n";

export default function ContactForm() {
  const t = useT();
  const [status, setStatus] = useState<"idle" | "submitting" | "sent">("idle");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    setStatus("submitting");
    const text = `${t("book.messagePrefix")}%0A%0A` +
      `Name: ${encodeURIComponent(name)}%0A` +
      (phone ? `Phone: ${encodeURIComponent(phone)}%0A` : "") +
      `%0A${encodeURIComponent(message)}`;
    const url = `https://wa.me/${site.whatsappDigits}?text=${text}`;
    window.setTimeout(() => {
      window.open(url, "_blank", "noopener,noreferrer");
      setStatus("sent");
    }, 350);
  };

  return (
    <form onSubmit={onSubmit} className="bg-cream-warm border border-ink/10 p-6 sm:p-8 space-y-5">
      <div>
        <label htmlFor="name" className="block text-[11px] tracking-[0.25em] uppercase text-gold-deep mb-2">
          {t("contact.name")}
        </label>
        <input
          id="name"
          name="name"
          required
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-cream border border-ink/15 px-4 py-3 text-base focus:border-gold focus:outline-none transition-colors"
          placeholder={t("contact.namePlaceholder")}
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-[11px] tracking-[0.25em] uppercase text-gold-deep mb-2">
          {t("contact.phone")} <span className="text-ink-mute lowercase tracking-normal text-xs">{t("contact.optional")}</span>
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full bg-cream border border-ink/15 px-4 py-3 text-base focus:border-gold focus:outline-none transition-colors"
          placeholder="+250 7XX XXX XXX"
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-[11px] tracking-[0.25em] uppercase text-gold-deep mb-2">
          {t("contact.message")}
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full bg-cream border border-ink/15 px-4 py-3 text-base focus:border-gold focus:outline-none transition-colors resize-y"
          placeholder={t("contact.messagePlaceholder")}
        />
      </div>

      <button
        type="submit"
        disabled={status !== "idle"}
        className={[
          "inline-flex items-center gap-2 px-5 py-3 text-sm transition-colors",
          status === "sent"
            ? "bg-emerald-600 text-white"
            : "bg-forest text-cream hover:bg-forest-deep",
          "disabled:opacity-70",
        ].join(" ")}
      >
        {status === "sent" ? (
          <>
            <Check size={16} /> {t("contact.opening")}
          </>
        ) : status === "submitting" ? (
          <>
            <span className="w-3.5 h-3.5 rounded-full border-2 border-cream/40 border-t-cream animate-spin" />
            {t("contact.preparing")}
          </>
        ) : (
          <>
            <Send size={16} /> {t("contact.send")}
          </>
        )}
      </button>

      <p className="text-[11px] text-ink-mute">
        {t("contact.disclaimer")}
      </p>
    </form>
  );
}
