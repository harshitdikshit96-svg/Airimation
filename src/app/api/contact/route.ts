import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient, LeadSubmission } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  let body: Partial<LeadSubmission>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { name, email, organization_type, message } = body;

  if (!name || !email || !organization_type || !message) {
    return NextResponse.json(
      { error: "Name, email, organisation type and message are required." },
      { status: 400 }
    );
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();

  if (!supabase) {
    // No database configured yet — log so the lead isn't silently lost during
    // local development, and still confirm success to the visitor.
    console.log("[contact] Supabase not configured — lead received:", body);
    return NextResponse.json({ ok: true, stored: false });
  }

  const { error } = await supabase.from("leads").insert({
    name: body.name,
    email: body.email,
    phone: body.phone ?? null,
    organization_type: body.organization_type,
    event_date: body.event_date ?? null,
    message: body.message,
  });

  if (error) {
    console.error("[contact] Supabase insert failed:", error);
    return NextResponse.json({ error: "Could not save your message. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, stored: true });
}
