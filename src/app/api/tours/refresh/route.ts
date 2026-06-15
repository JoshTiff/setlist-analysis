import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  return NextResponse.json(
    {
      error: "Tour refresh route is not implemented yet.",
    },
    { status: 501 }
  );
}