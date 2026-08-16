import { syncSteamApp } from "../src/server/steam-sync";

const appIds = process.argv.slice(2).map(Number);

async function main() {
  if (appIds.length === 0 || appIds.some((appId) => !Number.isInteger(appId) || appId <= 0)) {
    throw new Error("Uso: npm run sync:steam -- <steam-app-id> [<steam-app-id> ...]");
  }

  for (const appId of appIds) {
    const offer = await syncSteamApp(appId);
    console.log(`${offer.title}: $${offer.priceClp.toLocaleString("es-CL")} CLP (${offer.discountPercent}% descuento)`);
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Steam sync failed");
  process.exitCode = 1;
});
