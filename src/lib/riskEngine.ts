import { Student, CounsellorTask } from "@/types";

export interface DropoutRiskEvaluation {
  studentId: string;
  studentName: string;
  riskScore: number; // 0 to 100
  riskLevel: "LOW" | "MODERATE" | "HIGH";
  factors: {
    overdueDaysScore: number;
    attendanceDropScore: number;
    testScoreDeclineScore: number;
  };
  reasons: string[];
  shouldTriggerCounsellorTask: boolean;
  counsellorTask?: CounsellorTask;
}

/**
 * Multi-Signal AI Dropout Risk Model:
 * 1. Fee overdue signal: Days overdue on unpaid instalments (Weight: 35 pts)
 * 2. Attendance signal: Month-over-month trend or current attendance < 75% (Weight: 35 pts)
 * 3. Academic performance signal: Downward percentile trend on latest tests (Weight: 30 pts)
 *
 * Safety Guardrails (Strict Compliance with Brief):
 * - Risk flag NEVER triggers fee enforcement or collection actions.
 * - Risk flag NEVER sends automated messages or notifications to parents.
 * - Risk flag ONLY creates an internal Counsellor Call Task for empathetic retention intervention.
 * - Counsellor feedback loop allows marking 'False Positive' to prevent future noise.
 */
export function evaluateDropoutRisk(
  student: Student,
  referenceDateStr = "2026-11-08"
): DropoutRiskEvaluation {
  const refDate = new Date(referenceDateStr);
  const reasons: string[] = [];

  // --- Signal 1: Fee Overdue Analysis (Max 35 points) ---
  let maxDaysOverdue = 0;
  for (const inst of student.instalments) {
    if (inst.status !== "PAID") {
      const dueDate = new Date(inst.dueDate);
      const diffDays = Math.floor((refDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays > maxDaysOverdue) {
        maxDaysOverdue = diffDays;
      }
    }
  }

  let overdueDaysScore = 0;
  if (maxDaysOverdue >= 30) {
    overdueDaysScore = 35;
    reasons.push(`Instalment is critically overdue by ${maxDaysOverdue} days`);
  } else if (maxDaysOverdue >= 15) {
    overdueDaysScore = 20;
    reasons.push(`Instalment is overdue by ${maxDaysOverdue} days`);
  } else if (maxDaysOverdue > 0) {
    overdueDaysScore = 10;
    reasons.push(`Instalment overdue by ${maxDaysOverdue} days`);
  }

  // --- Signal 2: Attendance Trajectory (Max 35 points) ---
  let attendanceDropScore = 0;
  const attHistory = student.attendance || [];
  if (attHistory.length >= 2) {
    const latestAtt = attHistory[attHistory.length - 1].percentage;
    const previousAtt = attHistory[attHistory.length - 2].percentage;
    const drop = previousAtt - latestAtt;

    if (drop >= 20 || latestAtt < 65) {
      attendanceDropScore = 35;
      reasons.push(`Severe attendance collapse: dropped from ${previousAtt}% to ${latestAtt}%`);
    } else if (drop >= 10 || latestAtt < 75) {
      attendanceDropScore = 20;
      reasons.push(`Attendance declined by ${drop}% (currently at ${latestAtt}%)`);
    } else if (latestAtt < 80) {
      attendanceDropScore = 10;
      reasons.push(`Attendance below benchmark threshold (${latestAtt}%)`);
    }
  } else if (attHistory.length === 1 && attHistory[0].percentage < 70) {
    attendanceDropScore = 25;
    reasons.push(`Low overall attendance recorded (${attHistory[0].percentage}%)`);
  }

  // --- Signal 3: Test Scores & Rank Trend (Max 30 points) ---
  let testScoreDeclineScore = 0;
  const testHistory = student.testScores || [];
  if (testHistory.length >= 2) {
    const latestTest = testHistory[testHistory.length - 1];
    const prevTest = testHistory[testHistory.length - 2];
    const percentileDrop = prevTest.percentile - latestTest.percentile;

    if (percentileDrop >= 15 || latestTest.percentile < 50) {
      testScoreDeclineScore = 30;
      reasons.push(
        `Substantial test percentile decline: down ${percentileDrop.toFixed(1)}% (latest ${latestTest.percentile.toFixed(1)}%ile)`
      );
    } else if (percentileDrop >= 8 || latestTest.percentile < 65) {
      testScoreDeclineScore = 15;
      reasons.push(`Recent test performance dropped by ${percentileDrop.toFixed(1)}%ile`);
    }
  } else if (testHistory.length === 1 && testHistory[0].percentile < 50) {
    testScoreDeclineScore = 15;
    reasons.push(`Recent test percentile below median (${testHistory[0].percentile}%ile)`);
  }

  const riskScore = Math.min(100, overdueDaysScore + attendanceDropScore + testScoreDeclineScore);

  let riskLevel: "LOW" | "MODERATE" | "HIGH" = "LOW";
  let shouldTriggerCounsellorTask = false;

  if (riskScore >= 60) {
    riskLevel = "HIGH";
    shouldTriggerCounsellorTask = true;
  } else if (riskScore >= 40) {
    riskLevel = "MODERATE";
    shouldTriggerCounsellorTask = true;
  }

  let counsellorTask: CounsellorTask | undefined;
  if (shouldTriggerCounsellorTask) {
    counsellorTask = {
      id: `TASK-${student.id}-${Date.now().toString().slice(-4)}`,
      studentId: student.id,
      studentName: student.name,
      batch: student.batch,
      centreName: student.centreName,
      riskScore,
      riskReasons: reasons,
      status: "PENDING_CALL",
      assignedTo: "Academic Counselling Cell",
      createdAt: new Date().toISOString(),
      notes: "Auto-generated retention task. Do not mention fee dues first; enquire about academic difficulty.",
    };
  }

  return {
    studentId: student.id,
    studentName: student.name,
    riskScore,
    riskLevel,
    factors: {
      overdueDaysScore,
      attendanceDropScore,
      testScoreDeclineScore,
    },
    reasons,
    shouldTriggerCounsellorTask,
    counsellorTask,
  };
}
