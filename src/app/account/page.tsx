"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

type User = { email: string; id: string };
type FollowedItem = { alert: { targetDiscountPercent: number | null; targetPriceClp: number | null } | null; genre: string; slug: string; title: string };

export default function AccountPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [forgotMode, setForgotMode] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [followedItems, setFollowedItems] = useState<FollowedItem[]>([]);
  const [emailAlertsEnabled, setEmailAlertsEnabled] = useState(true);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteMessage, setDeleteMessage] = useState("");

  useEffect(() => {
    fetch("/api/auth/me").then((response) => response.json() as Promise<{ user: User | null }>).then((data) => setUser(data.user)).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!user) return;
    Promise.all([fetch("/api/watchlist").then((response) => response.json() as Promise<{ items: FollowedItem[] }>), fetch("/api/account/preferences").then((response) => response.json() as Promise<{ emailAlertsEnabled?: boolean }>)])
      .then(([watchlist, preferences]) => { setFollowedItems(watchlist.items); setEmailAlertsEnabled(preferences.emailAlertsEnabled ?? true); }).catch(() => undefined);
  }, [user]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch(`/api/auth/${mode}`, {
        body: JSON.stringify({ email, password }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const data = await response.json() as { error?: string; user?: User };
      if (!response.ok) throw new Error(data.error ?? "No fue posible completar la solicitud");
      setUser(data.user ?? null);
      setPassword("");
      setMessage(mode === "login" ? "Sesion iniciada correctamente." : "Cuenta creada correctamente.");
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : "No fue posible completar la solicitud");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setMessage("Sesion cerrada.");
  }

  async function handleForgot(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const response = await fetch("/api/auth/request-reset", { body: JSON.stringify({ email }), headers: { "Content-Type": "application/json" }, method: "POST" });
    const data = await response.json() as { message?: string };
    setMessage(data.message ?? "Si la cuenta existe, recibiras un correo.");
    setLoading(false);
  }

  async function toggleEmailAlerts() {
    const nextValue = !emailAlertsEnabled;
    setEmailAlertsEnabled(nextValue);
    await fetch("/api/account/preferences", { body: JSON.stringify({ emailAlertsEnabled: nextValue }), headers: { "Content-Type": "application/json" }, method: "PUT" });
  }

  async function handleDeleteAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!window.confirm("Esta accion eliminara tu cuenta, seguimientos y alertas. Continuar?")) return;
    const response = await fetch("/api/account", { body: JSON.stringify({ password: deletePassword }), headers: { "Content-Type": "application/json" }, method: "DELETE" });
    const data = await response.json() as { error?: string };
    if (!response.ok) { setDeleteMessage(data.error ?? "No fue posible eliminar la cuenta"); return; }
    setUser(null);
    setDeleteMessage("Tu cuenta fue eliminada.");
  }

  return (
    <main className="site-shell account-shell" id="main-content">
      <header className="topbar">
        <Link className="brand" href="/" aria-label="Apre precios low, inicio"><span className="brand-mark"><span /></span><span>apre<span className="brand-accent">.</span></span></Link>
        <Link className="detail-back-mobile" href="/">Volver</Link>
      </header>
      <section className="account-content">
        <div className="account-intro"><p className="section-kicker"><span className="live-pulse" /> Tu radar personal</p><h1>Guarda tus ofertas. <em>Vuelve cuando caigan.</em></h1><p>Entra a tu cuenta para seguir videojuegos y recibir alertas cuando el precio alcance tu objetivo.</p></div>
        <div className="account-card">
          {user ? (
            <div className="account-logged-in"><span className="account-avatar">{user.email[0]?.toUpperCase()}</span><p className="section-kicker">Sesion activa</p><h2>{user.email}</h2><label className="preference-toggle"><input type="checkbox" checked={emailAlertsEnabled} onChange={toggleEmailAlerts} /> Recibir alertas por correo</label><p className="account-muted">{followedItems.length} videojuego{followedItems.length === 1 ? "" : "s"} seguido{followedItems.length === 1 ? "" : "s"}.</p>{followedItems.length > 0 && <div className="followed-list">{followedItems.map((item) => <Link href={`/games/${item.slug}`} key={item.slug}><strong>{item.title}</strong><span>{item.alert ? "Alerta configurada" : "Sin alerta"}</span></Link>)}</div>}<button type="button" className="secondary-button" onClick={handleLogout}>Cerrar sesion</button><form className="delete-account-form" onSubmit={handleDeleteAccount}><label htmlFor="delete-password">Para eliminar tu cuenta, confirma tu contrasena</label><input id="delete-password" type="password" autoComplete="current-password" minLength={12} value={deletePassword} onChange={(event) => setDeletePassword(event.target.value)} required /><button type="submit" className="danger-button">Eliminar cuenta</button>{deleteMessage && <p role="alert">{deleteMessage}</p>}</form></div>
          ) : (
            <>
              {!forgotMode && <div className="auth-tabs" role="tablist" aria-label="Autenticacion"><button type="button" role="tab" aria-selected={mode === "login"} className={mode === "login" ? "selected" : ""} onClick={() => { setMode("login"); setMessage(""); }}>Iniciar sesion</button><button type="button" role="tab" aria-selected={mode === "register"} className={mode === "register" ? "selected" : ""} onClick={() => { setMode("register"); setMessage(""); }}>Crear cuenta</button></div>}
              {forgotMode ? <form className="auth-form" onSubmit={handleForgot}><p className="account-muted">Te enviaremos un enlace si existe una cuenta con ese correo.</p><label htmlFor="reset-email">Correo electronico</label><input id="reset-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required /><button className="primary-button auth-submit" type="submit" disabled={loading}>{loading ? "Enviando..." : "Enviar enlace"}</button><button type="button" className="text-button" onClick={() => { setForgotMode(false); setMessage(""); }}>Volver al inicio de sesion</button></form> : <form className="auth-form" onSubmit={handleSubmit}>
                <label htmlFor="account-email">Correo electronico</label><input id="account-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
                <label htmlFor="account-password">Contrasena <span>(minimo 12 caracteres)</span></label><input id="account-password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={12} maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)} required />
                <button className="primary-button auth-submit" type="submit" disabled={loading}>{loading ? "Procesando..." : mode === "login" ? "Entrar al radar" : "Crear mi cuenta"}</button>
                {mode === "login" && <button type="button" className="text-button auth-forgot" onClick={() => { setForgotMode(true); setMessage(""); }}>Olvide mi contrasena</button>}</form>}
              {message && <p className="auth-message" role="status">{message}</p>}
            </>
          )}
        </div>
      </section>
    </main>
  );
}
