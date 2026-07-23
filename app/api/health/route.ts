import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "the-atom-web",
    timestamp: new Date().toISOString(),
  });
}
