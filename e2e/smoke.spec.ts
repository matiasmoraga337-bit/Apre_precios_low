import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("public navigation", () => {
  test("renders the offer radar and supports searching", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /Compra cuando el precio/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Ofertas que merecen una mirada/i })).toBeVisible();
    await page.getByPlaceholder("Buscar videojuego...").fill("Hades");
    await expect(page.getByRole("heading", { name: "Hades II" }).first()).toBeVisible();
  });

  test("filters offers by store", async ({ page }) => {
    await page.goto("/#ofertas");
    await page.getByRole("tab", { name: "Steam" }).click();
    await expect(page.getByRole("heading", { name: "Hades II" }).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "Forza Horizon 5" })).not.toBeVisible();
  });

  test("opens a game detail with its price history", async ({ page }) => {
    await page.goto("/games/hades-ii");
    await expect(page.getByRole("heading", { name: "Hades II" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Historial registrado" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Seguir precio/i })).toBeVisible();
  });

  test("offers an accessible account entry point", async ({ page }) => {
    await page.goto("/account");
    await expect(page.getByRole("heading", { name: /Guarda tus ofertas/i })).toBeVisible();
    await expect(page.getByLabel("Correo electronico")).toBeVisible();
    await expect(page.getByLabel("Contrasena")).toBeVisible();
    await expect(page.getByRole("link", { name: "Saltar al contenido principal" })).toBeAttached();
  });

  test("passes the automated accessibility audit on the home page", async ({ page }) => {
    await page.goto("/");
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test("works on a mobile viewport and exposes the skip link to keyboard users", async ({ page }) => {
    await page.setViewportSize({ height: 800, width: 390 });
    await page.goto("/");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Saltar al contenido principal" })).toBeFocused();
    await expect(page.getByRole("heading", { name: /Compra cuando el precio/i })).toBeVisible();
  });

  test("publishes an installable web manifest without exposing API data", async ({ request }) => {
    const manifest = await request.get("/manifest.webmanifest");
    expect(manifest.ok()).toBeTruthy();
    const body = await manifest.json();
    expect(body.name).toBe("Apre precios low");
    expect(body.display).toBe("standalone");
    expect((await request.get("/api/deals")).headers()["cache-control"]).toContain("public");
  });
});
