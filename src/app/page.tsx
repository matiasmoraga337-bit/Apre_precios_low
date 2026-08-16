"use client";

import { useState } from "react";
import { mockDeals } from "@/data/mock-deals";
import {
  formatClp,
  isHistoricalLow,
  percentageAboveHistoricalLow,
} from "@/domain/pricing";
import type { Deal, StoreId } from "@/types/deals";

const storeFilters: { id: "all" | StoreId; label: string }[] = [
  { id: "all", label: "Todas" },
  { id: "steam", label: "Steam" },
  { id: "eneba", label: "Eneba" },
  { id: "xbox", label: "Xbox" },
  { id: "epic", label: "Epic Games" },
];

function StoreMark({ store }: { store: StoreId }) {
  return <span className={`store-mark store-${store}`} aria-hidden="true" />;
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.25 4.25" strokeLinecap="round" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path d="M18 9.5a6 6 0 0 0-12 0c0 7-3 7-3 8.5h18c0-1.5-3-1.5-3-8.5Z" />
      <path d="M10 21h4" strokeLinecap="round" />
    </svg>
  );
}

function ArrowUpRight() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M7 17 17 7M8 7h9v9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DealArtwork({ deal, large = false }: { deal: Deal; large?: boolean }) {
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

function DealCard({ deal }: { deal: Deal }) {
  const atHistoricalLow = isHistoricalLow(deal);
  const aboveLow = percentageAboveHistoricalLow(deal.currentPrice, deal.historicalLow);

  return (
    <article className="deal-card">
      <DealArtwork deal={deal} />
      <div className="deal-card-body">
        <div className="deal-card-heading">
          <div>
            <p className="eyebrow"><StoreMark store={deal.store} /> {deal.storeLabel}</p>
            <h3>{deal.title}</h3>
          </div>
          <span className="discount-badge">-{deal.discountPercent}%</span>
        </div>
        <p className="deal-genre">{deal.genre}</p>
        <div className="deal-price-row">
          <div>
            <span className="price-label">Precio actual</span>
            <strong>{formatClp(deal.currentPrice)}</strong>
          </div>
          <div className="low-price">
            <span className="price-label">Minimo historico</span>
            <span>{formatClp(deal.historicalLow)}</span>
          </div>
        </div>
        <div className={`deal-status${atHistoricalLow ? " is-low" : ""}`}>
          <span className="status-dot" />
          {atHistoricalLow ? "En su minimo historico" : `${aboveLow}% sobre el minimo`}
        </div>
        <div className="deal-card-footer">
          <span>Actualizado {deal.lastChecked}</span>
          <button type="button" className="text-button" aria-label={`Ver ${deal.title}`}>
            Ver oferta <ArrowUpRight />
          </button>
        </div>
      </div>
    </article>
  );
}

export default function Home() {
  const [activeStore, setActiveStore] = useState<"all" | StoreId>("all");
  const [search, setSearch] = useState("");

  const visibleDeals = mockDeals.filter((deal) => {
    const matchesStore = activeStore === "all" || deal.store === activeStore;
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || `${deal.title} ${deal.genre} ${deal.storeLabel}`.toLowerCase().includes(query);
    return matchesStore && matchesSearch;
  });

  return (
    <main className="site-shell">
      <div className="ambient-glow ambient-glow-top" />
      <div className="ambient-glow ambient-glow-side" />
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Apre precios low, inicio">
          <span className="brand-mark"><span /></span>
          <span>apre<span className="brand-accent">.</span></span>
        </a>
        <nav className="main-nav" aria-label="Navegacion principal">
          <a className="active" href="#ofertas">Ofertas</a>
          <a href="#historial">Historial</a>
          <a href="#tiendas">Tiendas</a>
        </nav>
        <div className="header-actions">
          <button type="button" className="icon-button" aria-label="Ver alertas"><BellIcon /><span className="notification-dot" /></button>
          <button type="button" className="avatar-button" aria-label="Abrir perfil">M</button>
        </div>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="section-kicker"><span className="live-pulse" /> Radar de ofertas para Chile</p>
          <h1>Compra cuando el precio <em>cae de verdad.</em></h1>
          <p className="hero-description">Comparamos el precio actual con su historial para que no tengas que adivinar si una oferta realmente vale la pena.</p>
          <div className="hero-actions">
            <a className="primary-button" href="#ofertas">Explorar ofertas <ArrowUpRight /></a>
            <span className="hero-note">Datos simulados para el MVP <span>•</span> CLP</span>
          </div>
        </div>
        <div className="hero-signal" aria-label="Resumen del radar">
          <div className="signal-ring signal-ring-outer"><div className="signal-ring signal-ring-inner"><span className="signal-core" /></div></div>
          <span className="signal-label signal-label-top">8.420 ofertas<br /><b>monitoreadas</b></span>
          <span className="signal-label signal-label-bottom">ultima lectura<br /><b>hace 8 min</b></span>
          <span className="signal-crosshair signal-crosshair-one" />
          <span className="signal-crosshair signal-crosshair-two" />
        </div>
      </section>

      <section className="metric-strip" aria-label="Resumen del mercado">
        <div><span className="metric-value">128</span><span className="metric-label">en minimo historico</span></div>
        <div><span className="metric-value metric-highlight">-37%</span><span className="metric-label">baja promedio hoy</span></div>
        <div><span className="metric-value">4</span><span className="metric-label">tiendas conectadas</span></div>
        <div className="metric-update"><span className="status-dot" /> Actualizado en tiempo real</div>
      </section>

      <section className="deals-section" id="ofertas">
        <div className="section-heading">
          <div>
            <p className="section-kicker">Selecciones del radar</p>
            <h2>Ofertas que merecen una mirada</h2>
          </div>
          <a className="view-all" href="#ofertas">Ver todas <ArrowUpRight /></a>
        </div>
        <div className="toolbar">
          <div className="filter-tabs" role="tablist" aria-label="Filtrar por tienda">
            {storeFilters.map((filter) => (
              <button
                type="button"
                role="tab"
                aria-selected={activeStore === filter.id}
                className={activeStore === filter.id ? "selected" : ""}
                key={filter.id}
                onClick={() => setActiveStore(filter.id)}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <label className="search-field">
            <span className="sr-only">Buscar videojuego</span>
            <SearchIcon />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar videojuego..." />
          </label>
        </div>
        {visibleDeals.length > 0 ? (
          <div className="deals-grid">
            {visibleDeals.map((deal) => <DealCard deal={deal} key={deal.id} />)}
          </div>
        ) : (
          <div className="empty-state"><span>0_0</span><h3>No encontramos ese juego</h3><p>Prueba con otro titulo, genero o tienda.</p></div>
        )}
      </section>

      <section className="feature-banner" id="historial">
        <div className="banner-copy">
          <p className="section-kicker">No todos los descuentos son iguales</p>
          <h2>Tu historial de precios, <em>sin humo.</em></h2>
          <p>Una etiqueta de descuento puede ser engañosa. Nosotros te mostramos el contexto completo para que decidas con informacion real.</p>
          <a href="#ofertas" className="text-button banner-link">Como funciona <ArrowUpRight /></a>
        </div>
        <div className="mini-chart" aria-label="Ejemplo de historial de precio">
          <div className="chart-header"><span>Hades II · Steam</span><strong>-25%</strong></div>
          <div className="chart-area"><span className="chart-grid grid-one" /><span className="chart-grid grid-two" /><svg viewBox="0 0 420 150" preserveAspectRatio="none" aria-hidden="true"><path d="M0 30 C35 18, 45 70, 80 58 S125 80, 155 45 S205 90, 240 80 S285 105, 320 82 S370 120, 420 110" /><circle cx="420" cy="110" r="4" /></svg></div>
          <div className="chart-labels"><span>$29.990</span><span>$14.990 minimo historico</span></div>
        </div>
      </section>

      <footer className="site-footer" id="tiendas">
        <div className="brand"><span className="brand-mark"><span /></span><span>apre<span className="brand-accent">.</span></span></div>
        <span>Radar de precios para jugadores en Chile.</span>
        <span className="footer-status"><span className="status-dot" /> MVP en construccion</span>
      </footer>
    </main>
  );
}
