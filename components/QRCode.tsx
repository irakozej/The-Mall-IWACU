"use client";

import { useCallback, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Download, Printer } from "lucide-react";

type Props = {
  url: string;
  label?: string;
  size?: number;
};

export default function QRCode({ url, label = "Scan to view our menu", size = 220 }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);

  const downloadPNG = useCallback(async () => {
    const svg = wrapRef.current?.querySelector("svg");
    if (!svg) return;

    const xml = new XMLSerializer().serializeToString(svg);
    const svg64 = typeof window !== "undefined" ? window.btoa(unescape(encodeURIComponent(xml))) : "";
    const dataUrl = `data:image/svg+xml;base64,${svg64}`;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const scale = 4;
      const canvas = document.createElement("canvas");
      canvas.width = size * scale;
      canvas.height = size * scale;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = "#FAF9F6";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const link = document.createElement("a");
      link.download = "themalliwacu-menu-qr.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.src = dataUrl;
  }, [size]);

  const print = useCallback(() => {
    window.print();
  }, []);

  return (
    <div className="bg-cream-warm border border-ink/10 p-6 sm:p-8 flex flex-col items-center text-center">
      <div className="text-[10px] tracking-[0.3em] uppercase text-gold-deep">
        Scan · Tap · Order
      </div>
      <h3 className="mt-2 font-display text-2xl text-forest">Menu QR Code</h3>
      <p className="mt-1 max-w-xs text-sm text-ink-soft">{label}</p>

      <div ref={wrapRef} className="mt-6 p-4 bg-cream border border-gold/40 inline-flex">
        <QRCodeSVG
          value={url}
          size={size}
          fgColor="#1B4332"
          bgColor="#FAF9F6"
          level="M"
          includeMargin={false}
        />
      </div>

      <div className="mt-5 flex gap-2">
        <button
          type="button"
          onClick={downloadPNG}
          className="inline-flex items-center gap-2 bg-forest text-cream px-4 py-2.5 text-sm hover:bg-forest-deep transition-colors"
        >
          <Download size={16} /> Download PNG
        </button>
        <button
          type="button"
          onClick={print}
          className="inline-flex items-center gap-2 border border-forest/40 text-forest px-4 py-2.5 text-sm hover:bg-forest hover:text-cream transition-colors"
        >
          <Printer size={16} /> Print
        </button>
      </div>

      <p className="mt-4 text-[11px] text-ink-mute break-all">{url}</p>
    </div>
  );
}
