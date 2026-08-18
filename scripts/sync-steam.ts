import "dotenv/config";
import { StoreCode, SyncStatus } from "@prisma/client";
import { SteamAppUnavailableError } from "../src/integrations/steam/steam-adapter";
import { prisma } from "../src/lib/prisma";
import { markSteamAppUnavailable, syncSteamApp } from "../src/server/steam-sync";

const cliAppIds = process.argv.slice(2).map(Number);
const envAppIds = (process.env.STEAM_APP_IDS ?? "").split(",").map((value) => Number(value.trim())).filter((value) => Number.isInteger(value) && value > 0);
const appIds = cliAppIds.length > 0 ? cliAppIds : envAppIds;

async function main() {
  if (appIds.length === 0 || appIds.some((appId) => !Number.isInteger(appId) || appId <= 0)) {
    throw new Error("Uso: npm run sync:steam -- <steam-app-id> [<steam-app-id> ...]");
  }

  const run = await prisma.syncRun.create({ data: { requestedCount: appIds.length, status: SyncStatus.RUNNING, store: StoreCode.STEAM } });
  const failures: number[] = [];
  let successes = 0;
  try {
    for (const [index, appId] of appIds.entries()) {
      try {
        const offer = await syncSteamApp(appId);
        successes += 1;
        console.log(`${offer.title}: $${offer.priceClp.toLocaleString("es-CL")} CLP (${offer.discountPercent}% descuento)`);
      } catch (error: unknown) {
        if (error instanceof SteamAppUnavailableError && await markSteamAppUnavailable(appId)) {
          successes += 1;
          console.log(`Steam app ${appId}: marcada como no disponible`);
        } else {
          failures.push(appId);
          console.error(`Steam app ${appId}: sincronizacion fallida`);
        }
      }
      if (index < appIds.length - 1) await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    const status = failures.length === 0 ? SyncStatus.SUCCESS : successes > 0 ? SyncStatus.PARTIAL : SyncStatus.FAILED;
    await prisma.syncRun.update({ data: { failedCount: failures.length, failedExternalIds: failures.length > 0 ? failures.join(",") : null, finishedAt: new Date(), status, successCount: successes }, where: { id: run.id } });
    if (failures.length > 0) throw new Error(`Fallaron ${failures.length} sincronizaciones: ${failures.join(", ")}`);
  } catch (error) {
    await prisma.syncRun.update({ data: { failedCount: failures.length || appIds.length, failedExternalIds: failures.length > 0 ? failures.join(",") : null, finishedAt: new Date(), status: failures.length > 0 && successes > 0 ? SyncStatus.PARTIAL : SyncStatus.FAILED, successCount: successes }, where: { id: run.id } });
    throw error;
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Steam sync failed");
  process.exitCode = 1;
}).finally(async () => prisma.$disconnect());
