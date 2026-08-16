import Link from "next/link";

export const metadata = { title: "Terminos | Apre precios low" };

export default function TermsPage() {
  return <main className="site-shell legal-shell" id="main-content"><header className="topbar"><Link className="brand" href="/" aria-label="Apre precios low, inicio"><span className="brand-mark"><span /></span><span>apre<span className="brand-accent">.</span></span></Link><Link className="detail-back-mobile" href="/">Volver</Link></header><article className="legal-content"><Link className="back-link" href="/">← Volver al inicio</Link><p className="section-kicker">Documento inicial</p><h1>Terminos de <em>uso.</em></h1><p className="legal-warning">Esta es una plantilla para aprendizaje y debe revisarse legalmente antes de usar el proyecto en produccion.</p><h2>Naturaleza del servicio</h2><p>Apre precios low muestra informacion de precios de fuentes externas. No vende videojuegos ni procesa pagos.</p><h2>Fuentes externas</h2><p>Los precios, impuestos, disponibilidad y condiciones pueden cambiar. Verifica siempre la oferta directamente en la tienda antes de comprar.</p><h2>Alertas</h2><p>Las alertas son informativas y pueden llegar con retraso. Puedes desactivarlas desde tu cuenta.</p><h2>Uso prohibido</h2><p>No se permite acceder a cuentas ajenas, saturar endpoints, evadir limites ni introducir contenido malicioso.</p></article></main>;
}
