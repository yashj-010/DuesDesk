import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateTallyXML, generateTallyCSV } from "@/lib/tallyExport";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") || "xml";

  const students = db.getStudents();
  const transactions = db.getTransactions();

  if (format === "csv") {
    const csvData = generateTallyCSV(students);
    return new NextResponse(csvData, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="Tally_Ledger_Export.csv"',
      },
    });
  }

  const xmlData = generateTallyXML(students, transactions);
  return new NextResponse(xmlData, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Content-Disposition": 'attachment; filename="Tally_Vouchers_Export.xml"',
    },
  });
}
