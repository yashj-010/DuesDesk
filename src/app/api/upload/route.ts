import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { batchName, type, records } = body;

    if (!batchName || !type || !Array.isArray(records)) {
      return NextResponse.json(
        { error: "Invalid upload payload. batchName, type, and records required." },
        { status: 400 }
      );
    }

    const result = db.bulkUpdateRecords(batchName, type, records);

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${result.updatedCount} student records.`,
      result,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Bulk upload failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
