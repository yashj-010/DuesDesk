import { describe, it, expect } from "vitest";
import { evaluateDropoutRisk } from "../src/lib/riskEngine";
import { Student } from "../src/types";

describe("AI Dropout-Risk Model & Counsellor Safety Guardrail", () => {
  const atRiskStudent: Student = {
    id: "STU-0587",
    name: "Ishita Sharma",
    centreId: "C-01",
    centreName: "Malviya Nagar Centre",
    batch: "JEE 2027 Evening",
    parentName: "Dinesh Sharma",
    parentPhone: "+91 94140 67890",
    enrollmentDate: "2026-06-25",
    totalCourseFee: 120000,
    totalDiscount: 0,
    netPayableFee: 120000,
    totalPaid: 75000,
    totalBalance: 45000,
    instalments: [
      {
        id: "INST-0587-2",
        studentId: "STU-0587",
        instalmentNumber: 2,
        totalAmount: 40000,
        paidAmount: 20000,
        balanceAmount: 20000,
        dueDate: "2026-08-25", // 75 days overdue
        status: "OVERDUE",
        daysOverdue: 75,
        paymentLink: "https://pay.shikshaledger.in/inst/INST-0587-2",
      },
    ],
    attendance: [
      { month: "Aug 2026", attendedClasses: 24, totalClasses: 28, percentage: 85.7 },
      { month: "Oct 2026", attendedClasses: 14, totalClasses: 28, percentage: 50.0 }, // 35.7% drop
    ],
    testScores: [
      {
        id: "T-1",
        testDate: "2026-08-30",
        testName: "Test 1",
        score: 185,
        maxScore: 300,
        rank: 45,
        percentile: 88.5,
      },
      {
        id: "T-2",
        testDate: "2026-10-25",
        testName: "Test 2",
        score: 98,
        maxScore: 300,
        rank: 154,
        percentile: 52.1, // 36.4%ile drop
      },
    ],
    dropoutRiskScore: 0,
    dropoutRiskLevel: "LOW",
    dropoutRiskReasons: [],
  };

  it("calculates high risk score combining fee overdue, attendance drop, and test percentile decline", () => {
    const riskEval = evaluateDropoutRisk(atRiskStudent, "2026-11-08");

    expect(riskEval.riskScore).toBeGreaterThanOrEqual(70);
    expect(riskEval.riskLevel).toBe("HIGH");
    expect(riskEval.reasons.length).toBeGreaterThanOrEqual(2);
    expect(riskEval.shouldTriggerCounsellorTask).toBe(true);

    // Strictly verifies safety guardrail from brief:
    // "creates a counsellor call task, never a fee action or parent message"
    expect(riskEval.counsellorTask).toBeDefined();
    expect(riskEval.counsellorTask?.assignedTo).toBe("Academic Counselling Cell");
    expect(riskEval.counsellorTask?.notes).toContain("Do not mention fee dues first");
  });

  it("assigns low risk to students with clean payments and stable attendance", () => {
    const lowRiskStudent: Student = {
      ...atRiskStudent,
      id: "STU-0412",
      name: "Aarav Meena",
      instalments: [
        {
          id: "INST-0412-1",
          studentId: "STU-0412",
          instalmentNumber: 1,
          totalAmount: 40000,
          paidAmount: 40000,
          balanceAmount: 0,
          dueDate: "2026-10-10",
          status: "PAID",
          daysOverdue: 0,
          paymentLink: "https://pay.shikshaledger.in/inst/INST-0412-1",
        },
      ],
      attendance: [
        { month: "Aug 2026", attendedClasses: 27, totalClasses: 28, percentage: 96.4 },
        { month: "Oct 2026", attendedClasses: 26, totalClasses: 28, percentage: 92.8 },
      ],
      testScores: [
        {
          id: "T-1",
          testDate: "2026-10-25",
          testName: "Test 1",
          score: 280,
          maxScore: 300,
          rank: 2,
          percentile: 99.4,
        },
      ],
    };

    const riskEval = evaluateDropoutRisk(lowRiskStudent, "2026-11-08");
    expect(riskEval.riskScore).toBeLessThan(30);
    expect(riskEval.riskLevel).toBe("LOW");
    expect(riskEval.shouldTriggerCounsellorTask).toBe(false);
  });
});
