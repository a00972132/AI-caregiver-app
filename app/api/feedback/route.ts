import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    sessionId?: string;
    usefulnessRating?: string;
    comments?: string;
  };

  if (!body.sessionId) {
    return NextResponse.json({ error: "sessionId is required." }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();

  if (supabase) {
    const { error } = await supabase.from("feedback").insert({
      session_id: body.sessionId,
      usefulness_rating: body.usefulnessRating ?? null,
      comments: body.comments ?? null
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
