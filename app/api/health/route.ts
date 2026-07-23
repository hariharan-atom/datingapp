import { NextResponse } from "next/server";

import { createClient } from "@/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("shop_products")
      .select("id", { head: true, count: "exact" });

    if (error) throw error;

    return NextResponse.json({
      status: "ok",
      service: "the-atom-web",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "degraded",
        service: "the-atom-web",
        database: "unavailable",
        code:
          typeof error === "object" && error && "code" in error
            ? String(error.code)
            : "configuration_or_network_error",
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    );
  }
}
