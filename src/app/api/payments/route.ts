import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { studentId, instalmentId, amount, method, referenceId } = body;

    if (!studentId || !instalmentId || !amount) {
      return NextResponse.json(
        { error: "Missing required fields: studentId, instalmentId, amount" },
        { status: 400 }
      );
    }

    const result = db.recordPayment({
      studentId,
      instalmentId,
      amount: Number(amount),
      method: method || "UPI",
      referenceId,
    });

    return NextResponse.json({
      success: true,
      message: "Payment recorded successfully with 18% GST invoice. Automated reminders stopped.",
      transaction: result.transaction,
      student: result.student,
      cancelledRemindersCount: result.cancelledRemindersCount,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Payment processing failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function GET() {
  const transactions = db.getTransactions();
  const unmatched = db.getUnmatchedPayments();
  return NextResponse.json({ transactions, unmatched });
}
