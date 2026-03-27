import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string; consented?: boolean };
  const sessionId = randomUUID();
  const email = body.email?.trim().toLowerCase();
  const consented = Boolean(body.consented);

  if (!email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();

  if (supabase) {
    let { data: userRecord, error: userLookupError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (userLookupError) {
      return NextResponse.json({ error: userLookupError.message }, { status: 500 });
    }

    if (!userRecord) {
      const newUserId = randomUUID();
      const { error: userInsertError } = await supabase.from("users").insert({
        id: newUserId,
        email
      });

      if (userInsertError) {
        return NextResponse.json({ error: userInsertError.message }, { status: 500 });
      }

      userRecord = { id: newUserId };
    }

    if (!userRecord) {
      return NextResponse.json({ error: "Unable to resolve user." }, { status: 500 });
    }

    const { error: sessionError } = await supabase.from("sessions").insert({
      id: sessionId,
      user_id: userRecord.id,
      consented,
      status: "in_progress"
    });

    if (sessionError) {
      return NextResponse.json({ error: sessionError.message }, { status: 500 });
    }
  }

  return NextResponse.json({
    sessionId,
    persistence: supabase ? "supabase" : "local"
  });
}
