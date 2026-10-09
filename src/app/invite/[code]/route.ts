import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Joins the room that owns this invite code, then opens the room. */
export async function GET(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const supabase = await createClient();
  const { data: roomId, error } = await supabase.rpc("join_room_by_code", { _code: code });
  if (error || !roomId) return NextResponse.redirect(new URL("/app?invite=invalid", request.url));
  return NextResponse.redirect(new URL(`/app/rooms/${roomId}`, request.url));
}
