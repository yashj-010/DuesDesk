import { NextResponse } from "next/server";
import { calculateStatutoryRefund, RefundInput } from "@/lib/refundCalculator";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body: RefundInput = await request.json();

    if (!body.courseCommencedDate || !body.leavingNoticeDate || !body.totalCourseFee) {
      return NextResponse.json(
        { error: "Missing required dates or fee details for refund calculation" },
        { status: 400 }
      );
    }

    const calculation = calculateStatutoryRefund(body);

    return NextResponse.json({
      success: true,
      calculation,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Refund calculation error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
