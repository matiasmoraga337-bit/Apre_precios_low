"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = new URLSearchParams(window.location.search).get("token") ?? "";
    const response = await fetch("/api/auth/reset-password", { body: JSON.stringify({ password, token }), headers: { "Content-Type": "application/json" }, method: "POST" });
    const data = await response.json() as { error?: string };
    if (!response.ok) { setMessage(data.error ?? "No fue posible cambiar la contrasena"); return; }
    setDone(true);
    setMessage("Contrasena actualizada. Ya puedes iniciar sesion.");
  }

  return <main className="site-shell account-shell" id="main-content"><header className="topbar"><Link className="brand" href="/" aria-label="Apre precios low, inicio"><span className="brand-mark"><span /></span><span>apre<span className="brand-accent">.</span></span></Link></header><section className="account-content reset-content"><div className="account-intro"><p className="section-kicker">Seguridad de cuenta</p><h1>Una nueva llave para tu <em>radar.</em></h1><p>El enlace de recuperacion vence en una hora y solo puede usarse una vez.</p></div><div className="account-card"><form className="auth-form" onSubmit={submit}><label htmlFor="reset-password">Nueva contrasena <span>(minimo 12 caracteres)</span></label><input id="reset-password" type="password" minLength={12} maxLength={128} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} required /><button className="primary-button auth-submit" type="submit" disabled={done}>Actualizar contrasena</button></form>{message && <p className="auth-message" role="status">{message} {done && <Link href="/account">Iniciar sesion</Link>}</p>}</div></section></main>;
}
