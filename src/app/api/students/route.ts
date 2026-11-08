import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { computeAgeingAndKPIs } from "@/lib/ageing";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const centre = searchParams.get("centre");
  const batch = searchParams.get("batch");

  let students = db.getStudents();

  if (id) {
    const student = db.getStudentById(id);
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }
    return NextResponse.json({ student });
  }

  if (centre && centre !== "ALL") {
    students = students.filter((s) => s.centreId === centre || s.centreName.toLowerCase().includes(centre.toLowerCase()));
  }

  if (batch && batch !== "ALL") {
    students = students.filter((s) => s.batch.toLowerCase().includes(batch.toLowerCase()));
  }

  const ageingReport = computeAgeingAndKPIs(students);

  return NextResponse.json({
    students,
    ageingReport,
  });
}
