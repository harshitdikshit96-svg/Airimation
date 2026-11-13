import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { checkLead, makeRateLimiter } from "@/lib/leadValidation";

const allow = makeRateLimiter();

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!allow(ip)) {
    return NextResponse.json({ error: "Too many messages — please try again in a few minutes." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const check = checkLead(body);
  if (check.ok === "spam") return NextResponse.json({ ok: true, stored: false });
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: 400 });
  const lead = check.lead;

  const sql = getSql();

  if (!sql) {
    // No database configured yet — log so the lead isn't silently lost during
    // local development, and still confirm success to the visitor.
    console.log("[contact] Neon not configured — lead received:", lead);
    return NextResponse.json({ ok: true, stored: false });
  }

  try {
    await sql`
      insert into leads (name, email, phone, organization_type, event_date, message)
      values (
        ${lead.name},
        ${lead.email},
        ${lead.phone ?? null},
        ${lead.organization_type},
        ${lead.event_date ?? null},
        ${lead.message}
      )
    `;
  } catch (error) {
    console.error("[contact] Neon insert failed:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Could not save your message. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, stored: true });
}
