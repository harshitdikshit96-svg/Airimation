import { NextRequest, NextResponse } from "next/server";
import { getSql, LeadSubmission } from "@/lib/db";

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

  const sql = getSql();

  if (!sql) {
    // No database configured yet — log so the lead isn't silently lost during
    // local development, and still confirm success to the visitor.
    console.log("[contact] Neon not configured — lead received:", body);
    return NextResponse.json({ ok: true, stored: false });
  }

  try {
    await sql`
      insert into leads (name, email, phone, organization_type, event_date, message)
      values (
        ${body.name},
        ${body.email},
        ${body.phone ?? null},
        ${body.organization_type},
        ${body.event_date ?? null},
        ${body.message}
      )
    `;
  } catch (error) {
    console.error("[contact] Neon insert failed:", error);
    return NextResponse.json({ error: "Could not save your message. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, stored: true });
}
