import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.redirect("https://lk-reactor-download.mute-mountain-033a.workers.dev", 302);
}
