import { NextResponse } from "next/server";
import { getDeals } from "@/server/deals";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json({ deals: await getDeals() });
  } catch {
    return NextResponse.json(
      { error: "No fue posible consultar las ofertas" },
      { status: 503 },
    );
  }
}
