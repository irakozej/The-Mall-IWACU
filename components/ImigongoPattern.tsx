type Props = {
  className?: string;
  color?: string;
  opacity?: number;
};

/**
 * Imigongo-inspired chevron pattern as inline SVG.
 * Used as a decorative panel/watermark — kept restrained.
 */
export default function ImigongoPattern({
  className,
  color = "#D4A017",
  opacity = 0.18,
}: Props) {
  return (
    <svg
      className={className}
      viewBox="0 0 320 320"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      role="presentation"
    >
      <defs>
        <pattern
          id="imigongo-tile"
          width="48"
          height="48"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M0 0 L24 24 L0 48 Z"
            fill={color}
            opacity={opacity}
          />
          <path
            d="M48 0 L24 24 L48 48 Z"
            fill={color}
            opacity={opacity * 0.55}
          />
          <path
            d="M0 0 L48 0 L24 24 Z"
            fill="none"
            stroke={color}
            strokeWidth="0.6"
            opacity={opacity * 1.3}
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#imigongo-tile)" />
    </svg>
  );
}
