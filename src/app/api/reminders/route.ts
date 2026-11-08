import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const reminders = db.getReminders();
  const unmatched = db.getUnmatchedPayments();

  const scheduled = reminders.filter((r) => r.status === "SCHEDULED");
  const cancelled = reminders.filter((r) => r.status === "CANCELLED_ON_PAYMENT");
  const sent = reminders.filter((r) => r.status === "SENT");

  return NextResponse.json({
    total: reminders.length,
    scheduled,
    cancelled,
    sent,
    all: reminders,
    unmatchedPayments: unmatched,
  });
}
