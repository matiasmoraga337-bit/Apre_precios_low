import Link from "next/link";
import { notFound } from "next/navigation";
import { DealArtwork } from "@/components/deal-artwork";
import { PriceTracker } from "@/components/price-tracker";
import { formatClp, isHistoricalLow, percentageAboveHistoricalLow } from "@/domain/pricing";
import { getDealDetails } from "@/server/deals";

type GamePageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return [];
}

function HistoryChart({ prices }: { prices: { date: string; price: number; label: string }[] }) {
  const max = Math.max(...prices.map((point) => point.price));
  const min = Math.min(...prices.map((point) => point.price));
  const range = Math.max(max - min, 1);
  const points = prices
    .map((point, index) => {
      const x = (index / Math.max(prices.length - 1, 1)) * 100;
      const y = 12 + ((max - point.price) / range) * 72;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="detail-chart-wrap">
      <div className="detail-chart-labels"><span>{formatClp(max)}</span><span>{formatClp(min)}</span></div>
      <div className="detail-chart">
        <span className="chart-grid grid-one" />
        <span className="chart-grid grid-two" />
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-label="Grafico de historial de precios">
          <polyline points={points} />
          {prices.map((point, index) => {
            const x = (index / Math.max(prices.length - 1, 1)) * 100;
            const y = 12 + ((max - point.price) / range) * 72;
            return <circle cx={x} cy={y} key={point.label} r="1.5" />;
          })}
        </svg>
      </div>
      <div className="detail-chart-dates">{prices.map((point) => <span key={point.date}>{point.label}</span>)}</div>
    </div>
  );
}

export async function generateMetadata({ params }: GamePageProps) {
  const { id } = await params;
  const details = await getDealDetails(id);
  return { title: details ? `${details.deal.title} | Apre precios low` : "Videojuego | Apre precios low" };
}

export default async function GameDetailPage({ params }: GamePageProps) {
  const { id } = await params;
  const details = await getDealDetails(id);

  if (!details) notFound();

  const { deal, history } = details;

  const aboveLow = percentageAboveHistoricalLow(deal.currentPrice, deal.historicalLow);
  const atHistoricalLow = isHistoricalLow(deal);

  return (
    <main className="site-shell detail-shell">
      <header className="topbar">
        <Link className="brand" href="/" aria-label="Apre precios low, inicio"><span className="brand-mark"><span /></span><span>apre<span className="brand-accent">.</span></span></Link>
        <nav className="main-nav" aria-label="Navegacion principal"><Link className="active" href="/#ofertas">Ofertas</Link><Link href="/#historial">Historial</Link><Link href="/#tiendas">Tiendas</Link></nav>
        <Link className="detail-back-mobile" href="/">Volver</Link>
      </header>

      <div className="detail-content">
        <Link className="back-link" href="/#ofertas">← Volver a las ofertas</Link>
        <div className="detail-hero">
          <div className="detail-art-column"><DealArtwork deal={deal} large /><span className="detail-art-caption">Imagen representativa · datos simulados</span></div>
          <div className="detail-intro">
            <p className="section-kicker"><span className="live-pulse" /> {deal.storeLabel} · {deal.genre}</p>
            <h1>{deal.title}</h1>
            <p className="detail-summary">Seguimiento de precio para la edicion digital disponible en Chile. La informacion se actualiza periodicamente y se compara con todo el historial registrado.</p>
            <div className="detail-price-box">
              <div><span className="price-label">Precio actual</span><strong>{formatClp(deal.currentPrice)}</strong></div>
              <span className="discount-badge">-{deal.discountPercent}%</span>
              <div className="low-price"><span className="price-label">Minimo historico</span><span>{formatClp(deal.historicalLow)}</span></div>
            </div>
            <div className={`detail-status${atHistoricalLow ? " is-low" : ""}`}><span className="status-dot" /> {atHistoricalLow ? "El precio actual es el minimo historico" : `Esta ${aboveLow}% sobre el minimo historico`}</div>
            <div className="detail-actions"><PriceTracker slug={deal.id} /><button type="button" className="secondary-button">Ver en {deal.storeLabel} ↗</button></div>
          </div>
        </div>

        <section className="detail-panel" aria-labelledby="history-title">
          <div className="detail-panel-heading"><div><p className="section-kicker">Contexto del precio</p><h2 id="history-title">Historial registrado</h2></div><span className="history-range">Ultimos 6 meses</span></div>
          <HistoryChart prices={history} />
          <div className="history-legend"><span><i className="legend-current" /> Precio actual</span><span><i className="legend-low" /> Minimo historico</span><span>Ultima lectura: {deal.lastChecked}</span></div>
        </section>

        <section className="detail-note"><div className="note-icon">i</div><div><strong>Como interpretamos este dato</strong><p>El minimo se calcula usando los registros disponibles para esta tienda y edicion. Todavia estamos construyendo el historial real, por eso estos valores son simulados.</p></div></section>
      </div>
    </main>
  );
}
