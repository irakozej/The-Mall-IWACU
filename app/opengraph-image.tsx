import { ImageResponse } from "next/og";

export const alt = "The Mall IWACU — Eat, Drink, Shop, Relax · Kabeza, Kigali";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  const forest = "#0F2A1F";
  const forestSoft = "#1B4332";
  const gold = "#D4A017";
  const cream = "#FAF9F6";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: forest,
          backgroundImage: `radial-gradient(60% 50% at 30% 30%, rgba(212,160,23,0.22), transparent 60%), radial-gradient(80% 60% at 100% 100%, ${forestSoft}, transparent 70%)`,
          color: cream,
          padding: "70px 84px",
          fontFamily: "serif",
          position: "relative",
        }}
      >
        {/* Imigongo-inspired chevron band, top right */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 380,
            height: 380,
            display: "flex",
            opacity: 0.35,
          }}
        >
          <svg viewBox="0 0 200 200" width="100%" height="100%">
            <defs>
              <pattern id="chev" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M0 0 L20 20 L0 40 Z" fill={gold} opacity="0.55" />
                <path d="M40 0 L20 20 L40 40 Z" fill={gold} opacity="0.25" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#chev)" />
          </svg>
        </div>

        {/* Location pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            border: `1px solid ${gold}66`,
            color: gold,
            padding: "6px 14px",
            fontSize: 18,
            letterSpacing: 4,
            textTransform: "uppercase",
            alignSelf: "flex-start",
            fontFamily: "sans-serif",
          }}
        >
          Kabeza · Kicukiro · Kigali
        </div>

        {/* Title */}
        <div
          style={{
            marginTop: 36,
            display: "flex",
            flexDirection: "column",
            lineHeight: 0.96,
            fontSize: 148,
          }}
        >
          <span>The Mall</span>
          <span style={{ color: gold, fontStyle: "italic" }}>IWACU.</span>
        </div>

        {/* Tagline */}
        <div
          style={{
            marginTop: 36,
            fontFamily: "sans-serif",
            fontSize: 30,
            color: "rgba(250,249,246,0.82)",
            maxWidth: 800,
            display: "flex",
          }}
        >
          Eat · Drink · Shop · Relax — under one roof.
        </div>

        {/* Footer line: services + URL */}
        <div
          style={{
            marginTop: "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontFamily: "sans-serif",
            fontSize: 20,
            color: "rgba(250,249,246,0.7)",
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          <span>Groceries · Bar · Kitchen · Massage</span>
          <span style={{ color: gold }}>themalliwacu</span>
        </div>

        {/* Imigongo-inspired chevron strip — flex row of small triangles */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 14,
            display: "flex",
            backgroundColor: forest,
          }}
        >
          {Array.from({ length: 64 }).map((_, i) => (
            <div
              key={i}
              style={{
                width: 19,
                height: 14,
                marginRight: 0,
                background: i % 2 === 0 ? gold : `${gold}99`,
                display: "flex",
                clipPath: "polygon(0 0, 100% 50%, 0 100%)",
              }}
            />
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
