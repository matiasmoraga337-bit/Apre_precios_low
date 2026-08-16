"use client";

import { useEffect, useState } from "react";
import { DealArtwork } from "@/components/deal-artwork";
import { mockDeals } from "@/data/mock-deals";
import {
  formatClp,
  isHistoricalLow,
  percentageAboveHistoricalLow,
} from "@/domain/pricing";
import type { Deal, DealPage, DealSort, StoreId } from "@/types/deals";
import Link from "next/link";

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
          <Link href={`/games/${deal.id}`} className="text-button" aria-label={`Ver ${deal.title}`}>
            Ver oferta <ArrowUpRight />
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function Home() {
  const [activeStore, setActiveStore] = useState<"all" | StoreId>("all");
  const [dealPage, setDealPage] = useState<DealPage>({ deals: mockDeals, page: 1, pageSize: 6, total: mockDeals.length, totalPages: 2 });
  const [databaseError, setDatabaseError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<DealSort>("recent");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ page: String(page), pageSize: "6", sort });
    if (activeStore !== "all") params.set("store", activeStore);
    if (search.trim()) params.set("search", search.trim());

    fetch(`/api/deals?${params.toString()}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("deals_request_failed");
        return response.json() as Promise<DealPage>;
      })
      .then((data) => {
        setDealPage(data);
        setDatabaseError(false);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setDatabaseError(true);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [activeStore, page, search, sort]);

  const visibleDeals = dealPage.deals;

  return (
    <main className="site-shell" id="main-content">
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
          <Link className="avatar-button" href="/account" aria-label="Abrir cuenta">M</Link>
        </div>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="section-kicker"><span className="live-pulse" /> Radar de ofertas para Chile</p>
          <h1>Compra cuando el precio <em>cae de verdad.</em></h1>
          <p className="hero-description">Comparamos el precio actual con su historial para que no tengas que adivinar si una oferta realmente vale la pena.</p>
          <div className="hero-actions">
            <a className="primary-button" href="#ofertas">Explorar ofertas <ArrowUpRight /></a>
            <span className="hero-note">{databaseError ? "Modo de respaldo local" : "PostgreSQL local conectado"} <span>•</span> CLP</span>
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
                onClick={() => { setActiveStore(filter.id); setPage(1); }}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <label className="search-field">
            <span className="sr-only">Buscar videojuego</span>
            <SearchIcon />
            <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Buscar videojuego..." />
          </label>
          <label className="sort-field">
            <span>Ordenar</span>
            <select value={sort} onChange={(event) => { setSort(event.target.value as DealSort); setPage(1); }}>
              <option value="recent">Mas recientes</option>
              <option value="price-asc">Menor precio</option>
              <option value="discount-desc">Mayor descuento</option>
            </select>
          </label>
        </div>
        {visibleDeals.length > 0 ? (
          <div className="deals-grid">
            {visibleDeals.map((deal) => <DealCard deal={deal} key={deal.id} />)}
          </div>
        ) : (
          <div className="empty-state"><span>0_0</span><h3>No encontramos ese juego</h3><p>Prueba con otro titulo, genero o tienda.</p></div>
        )}
        <div className="catalog-footer">
          <span>{loading ? "Actualizando radar..." : `${dealPage.total} ofertas encontradas`}</span>
          {dealPage.totalPages > 1 && <div className="pagination" aria-label="Paginacion de ofertas"><button type="button" disabled={page === 1} onClick={() => setPage((current) => current - 1)}>Anterior</button><span>Pagina {dealPage.page} de {dealPage.totalPages}</span><button type="button" disabled={page >= dealPage.totalPages} onClick={() => setPage((current) => current + 1)}>Siguiente</button></div>}
        </div>
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
        <span className="footer-status"><Link href="/privacy">Privacidad</Link><Link href="/terms">Terminos</Link><span><span className="status-dot" /> MVP en construccion</span></span>
      </footer>
    </main>
  );
}
