import { SteamAppUnavailableError } from "../src/integrations/steam/steam-adapter";
import { markSteamAppUnavailable, syncSteamApp } from "../src/server/steam-sync";

const appIds = process.argv.slice(2).map(Number);

async function main() {
  if (appIds.length === 0 || appIds.some((appId) => !Number.isInteger(appId) || appId <= 0)) {
    throw new Error("Uso: npm run sync:steam -- <steam-app-id> [<steam-app-id> ...]");
  }

  const failures: number[] = [];
  for (const [index, appId] of appIds.entries()) {
    try {
      const offer = await syncSteamApp(appId);
      console.log(`${offer.title}: $${offer.priceClp.toLocaleString("es-CL")} CLP (${offer.discountPercent}% descuento)`);
    } catch (error: unknown) {
      if (error instanceof SteamAppUnavailableError && await markSteamAppUnavailable(appId)) {
        console.log(`Steam app ${appId}: marcada como no disponible`);
      } else {
        failures.push(appId);
        console.error(`Steam app ${appId}: sincronizacion fallida`);
      }
    }
    if (index < appIds.length - 1) await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  if (failures.length > 0) {
    throw new Error(`Fallaron ${failures.length} sincronizaciones: ${failures.join(", ")}`);
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Steam sync failed");
  process.exitCode = 1;
});
