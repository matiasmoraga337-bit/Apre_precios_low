import type { Deal } from "@/types/deals";

export function DealArtwork({ deal, large = false }: { deal: Deal; large?: boolean }) {
  return (
    <div
      className={`deal-artwork${large ? " deal-artwork-large" : ""}`}
      style={{ "--art-accent": deal.accent } as React.CSSProperties}
      aria-hidden="true"
    >
      <span className="artwork-orbit artwork-orbit-one" />
      <span className="artwork-orbit artwork-orbit-two" />
      <span className="artwork-noise" />
      <span className="artwork-initials">{deal.initials}</span>
      <span className="artwork-label">{deal.storeLabel}</span>
    </div>
  );
}
