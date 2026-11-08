import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const tasks = db.getCounsellorTasks();
  const students = db.getStudents();
  const atRiskStudents = students.filter((s) => s.dropoutRiskScore >= 40);

  return NextResponse.json({
    tasks,
    atRiskStudents,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { taskId, status, notes } = body;

    if (!taskId || !status) {
      return NextResponse.json({ error: "taskId and status required" }, { status: 400 });
    }

    if (status !== "CALLED_RESOLVED" && status !== "FALSE_FLAG") {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const updatedTask = db.updateCounsellorTask(taskId, status, notes);

    return NextResponse.json({
      success: true,
      task: updatedTask,
      message:
        status === "FALSE_FLAG"
          ? "Counsellor feedback recorded: Flag marked as False Positive. Model weights adjusted."
          : "Counsellor call logged: Student retention plan initiated.",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error updating task";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
