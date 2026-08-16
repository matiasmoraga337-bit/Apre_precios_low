"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

type AlertState = { active: boolean; targetDiscountPercent: number | null; targetPriceClp: number | null } | null;

export function PriceTracker({ slug }: { slug: string }) {
  const [followed, setFollowed] = useState(false);
  const [alert, setAlert] = useState<AlertState>(null);
  const [price, setPrice] = useState("");
  const [discount, setDiscount] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/watchlist/${slug}`).then((response) => response.json() as Promise<{ alert: AlertState; followed: boolean }>).then((data) => {
      setFollowed(data.followed);
      setAlert(data.alert);
      setPrice(data.alert?.targetPriceClp?.toString() ?? "");
      setDiscount(data.alert?.targetDiscountPercent?.toString() ?? "");
    }).catch(() => setMessage("No pudimos consultar tu seguimiento.")).finally(() => setLoading(false));
  }, [slug]);

  async function toggleFollow() {
    setMessage("");
    const response = await fetch(`/api/watchlist/${slug}`, { method: followed ? "DELETE" : "POST" });
    const data = await response.json() as { error?: string; followed?: boolean };
    if (response.status === 401) {
      setMessage("Necesitas una cuenta para seguir precios.");
      return;
    }
    if (!response.ok) { setMessage(data.error ?? "No pudimos actualizar tu seguimiento."); return; }
    setFollowed(Boolean(data.followed));
    if (!data.followed) { setAlert(null); setPrice(""); setDiscount(""); await fetch(`/api/alerts/${slug}`, { method: "DELETE" }); }
  }

  async function saveAlert(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const response = await fetch(`/api/alerts/${slug}`, { body: JSON.stringify({ targetPriceClp: price, targetDiscountPercent: discount }), headers: { "Content-Type": "application/json" }, method: "PUT" });
    const data = await response.json() as { alert?: AlertState; error?: string };
    if (!response.ok) { setMessage(data.error ?? "No pudimos guardar la alerta."); return; }
    setAlert(data.alert ?? null);
    setMessage("Alerta guardada.");
  }

  return (
    <div className="tracker-box">
      <button type="button" className="primary-button" disabled={loading} onClick={toggleFollow}>{followed ? "Dejar de seguir" : "Seguir precio"} <span>{followed ? "−" : "＋"}</span></button>
      {message && <p className="tracker-message" role="status">{message} {message.includes("cuenta") && <Link href="/account">Iniciar sesion</Link>}</p>}
      {followed && <form className="alert-form" onSubmit={saveAlert}><p className="alert-title">Avisarme cuando...</p><div className="alert-fields"><label>Precio CLP<input inputMode="numeric" min="0" max="100000000" placeholder="Ej: 12990" type="number" value={price} onChange={(event) => setPrice(event.target.value)} /></label><label>Descuento %<input inputMode="numeric" min="0" max="100" placeholder="Ej: 50" type="number" value={discount} onChange={(event) => setDiscount(event.target.value)} /></label></div><button type="submit" className="secondary-button">{alert ? "Actualizar alerta" : "Guardar alerta"}</button></form>}
    </div>
  );
}
