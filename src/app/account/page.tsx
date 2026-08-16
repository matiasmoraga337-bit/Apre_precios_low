"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

type User = { email: string; id: string };

export default function AccountPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me").then((response) => response.json() as Promise<{ user: User | null }>).then((data) => setUser(data.user)).catch(() => undefined);
  }, []);

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

  return (
    <main className="site-shell account-shell">
      <header className="topbar">
        <Link className="brand" href="/" aria-label="Apre precios low, inicio"><span className="brand-mark"><span /></span><span>apre<span className="brand-accent">.</span></span></Link>
        <Link className="detail-back-mobile" href="/">Volver</Link>
      </header>
      <section className="account-content">
        <div className="account-intro"><p className="section-kicker"><span className="live-pulse" /> Tu radar personal</p><h1>Guarda tus ofertas. <em>Vuelve cuando caigan.</em></h1><p>Entra a tu cuenta para seguir videojuegos y recibir alertas cuando el precio alcance tu objetivo.</p></div>
        <div className="account-card">
          {user ? (
            <div className="account-logged-in"><span className="account-avatar">{user.email[0]?.toUpperCase()}</span><p className="section-kicker">Sesion activa</p><h2>{user.email}</h2><p className="account-muted">Tu cuenta esta lista para empezar a seguir precios.</p><button type="button" className="secondary-button" onClick={handleLogout}>Cerrar sesion</button></div>
          ) : (
            <>
              <div className="auth-tabs" role="tablist" aria-label="Autenticacion"><button type="button" role="tab" aria-selected={mode === "login"} className={mode === "login" ? "selected" : ""} onClick={() => { setMode("login"); setMessage(""); }}>Iniciar sesion</button><button type="button" role="tab" aria-selected={mode === "register"} className={mode === "register" ? "selected" : ""} onClick={() => { setMode("register"); setMessage(""); }}>Crear cuenta</button></div>
              <form className="auth-form" onSubmit={handleSubmit}>
                <label htmlFor="account-email">Correo electronico</label><input id="account-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
                <label htmlFor="account-password">Contrasena <span>(minimo 12 caracteres)</span></label><input id="account-password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={12} maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)} required />
                <button className="primary-button auth-submit" type="submit" disabled={loading}>{loading ? "Procesando..." : mode === "login" ? "Entrar al radar" : "Crear mi cuenta"}</button>
              </form>
              {message && <p className="auth-message" role="status">{message}</p>}
            </>
          )}
        </div>
      </section>
    </main>
  );
}
