import { NextResponse } from "next/server";
import { getDeals } from "@/server/deals";
import type { DealSort, StoreId } from "@/types/deals";

export const dynamic = "force-dynamic";

const stores = new Set<StoreId>(["steam", "eneba", "xbox", "epic"]);
const sorts = new Set<DealSort>(["recent", "price-asc", "discount-desc"]);

function positiveInteger(value: string | null, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export async function GET(request: Request) {
  const startedAt = performance.now();
  try {
    const searchParams = new URL(request.url).searchParams;
    const rawStore = searchParams.get("store");
    const rawSort = searchParams.get("sort");
    const store = rawStore && stores.has(rawStore as StoreId) ? rawStore as StoreId : undefined;
    const sort = rawSort && sorts.has(rawSort as DealSort) ? rawSort as DealSort : undefined;
    const result = await getDeals({
      page: positiveInteger(searchParams.get("page"), 1),
      pageSize: Math.min(24, positiveInteger(searchParams.get("pageSize"), 8)),
      search: searchParams.get("search")?.slice(0, 100),
      sort,
      store,
    });
    const response = NextResponse.json(result);
    response.headers.set("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
    response.headers.set("Server-Timing", `db;dur=${Math.round(performance.now() - startedAt)}`);
    return response;
  } catch {
    return NextResponse.json(
      { error: "No fue posible consultar las ofertas" },
      { status: 503 },
    );
  }
}
