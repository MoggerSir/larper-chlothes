import { Icon } from "./Icon";

interface LogoProps {
  tone?: "ink" | "inverse";
  className?: string;
}

export function Logo({ tone = "ink", className }: LogoProps) {
  return (
    <a
      href="#top"
      className={className}
      data-tone={tone}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.5rem",
        color:
          tone === "inverse"
            ? "var(--color-inverse-ink)"
            : "var(--header-ink, var(--color-ink))",
      }}
    >
      <Icon name="ring" size={20} strokeWidth={1.4} />
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 600,
          fontSize: "1.05rem",
          letterSpacing: "-0.01em",
          lineHeight: 1,
        }}
      >
        LARPER<span style={{ opacity: 0.55 }}>&nbsp;CLOTHES</span>
      </span>
    </a>
  );
}
