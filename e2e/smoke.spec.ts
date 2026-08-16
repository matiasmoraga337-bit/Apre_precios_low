import { expect, test } from "@playwright/test";

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
});
