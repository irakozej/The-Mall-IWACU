"use client";

import { site } from "@/lib/site";
import { useT } from "@/lib/i18n";

export default function WhatsAppButton() {
  const t = useT();
  const href = `https://wa.me/${site.whatsappDigits}?text=${encodeURIComponent(
    `${t("book.messagePrefix")} — ${t("contact.formIntro")}`,
  )}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      aria-label="Chat with The Mall IWACU on WhatsApp"
      className="fixed bottom-5 right-5 sm:bottom-7 sm:right-7 z-40 group"
    >
      <span className="absolute inset-0 rounded-full bg-emerald-500 animate-pulse-ring" aria-hidden />
      <span className="relative inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500 text-white shadow-lift hover:bg-emerald-600 transition-colors">
        <svg
          viewBox="0 0 32 32"
          width="26"
          height="26"
          aria-hidden
          className="drop-shadow-sm"
        >
          <path
            fill="currentColor"
            d="M19.11 17.18c-.27-.14-1.62-.8-1.87-.89-.25-.09-.43-.14-.61.14-.18.27-.7.89-.86 1.07-.16.18-.32.2-.59.07-.27-.14-1.13-.42-2.16-1.34-.8-.71-1.34-1.59-1.49-1.86-.16-.27-.02-.42.12-.55.12-.12.27-.32.41-.48.14-.16.18-.27.27-.45.09-.18.04-.34-.02-.48-.07-.14-.61-1.47-.84-2.02-.22-.53-.45-.46-.61-.47l-.52-.01c-.18 0-.48.07-.73.34-.25.27-.96.94-.96 2.29 0 1.36.99 2.66 1.13 2.84.14.18 1.95 2.99 4.73 4.19.66.29 1.18.46 1.58.59.66.21 1.27.18 1.74.11.53-.08 1.62-.66 1.85-1.3.23-.64.23-1.18.16-1.3-.06-.11-.25-.18-.52-.32zM16.04 5.33h-.01c-5.91 0-10.71 4.79-10.71 10.69 0 1.88.49 3.72 1.43 5.33L5.2 26.67l5.55-1.46c1.55.85 3.31 1.3 5.27 1.3 5.91 0 10.7-4.79 10.7-10.69 0-2.86-1.11-5.55-3.13-7.57-2.02-2.02-4.71-3.13-7.55-3.13z"
          />
        </svg>
      </span>
      <span className="sr-only">WhatsApp</span>
    </a>
  );
}
