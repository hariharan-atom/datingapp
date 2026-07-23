import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { loadProfiles } from "@/services/server/profile-records";
import { authenticateRequest } from "@/supabase/request-auth";

const idSchema = z.string().uuid();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { admin, user } = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json(
        { message: "Sign in to view profiles." },
        { status: 401 },
      );
    }

    const { id } = await params;
    if (!idSchema.safeParse(id).success) {
      return NextResponse.json(
        { message: "This profile does not exist." },
        { status: 404 },
      );
    }

    const [record] = await loadProfiles(admin, [id]);
    const visible =
      record &&
      (id === user.id ||
        (record.completed &&
          record.active &&
          record.discoverable &&
          !record.incognito));

    if (!visible) {
      return NextResponse.json(
        { message: "This profile is unavailable." },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { profile: record.profile },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch {
    return NextResponse.json(
      { message: "This profile is temporarily unavailable." },
      { status: 503 },
    );
  }
}
