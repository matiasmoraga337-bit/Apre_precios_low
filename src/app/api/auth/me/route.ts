import { NextResponse } from "next/server";
import { getCurrentUser } from "@/server/auth";

export async function GET() {
  return NextResponse.json({ user: await getCurrentUser() });
}
