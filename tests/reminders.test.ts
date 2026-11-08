import { describe, it, expect } from "vitest";
import { generateRemindersForInstalment, haltRemindersOnPayment } from "../src/lib/reminders";
import { Student, Instalment } from "../src/types";

describe("Automated Bilingual Reminders & Stop-on-Payment Rule", () => {
  const mockStudent: Student = {
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
    instalments: [],
    attendance: [],
    testScores: [],
    dropoutRiskScore: 60,
    dropoutRiskLevel: "HIGH",
    dropoutRiskReasons: [],
  };

  const mockInstalment: Instalment = {
    id: "INST-0587-3",
    studentId: "STU-0587",
    instalmentNumber: 3,
    totalAmount: 30000,
    paidAmount: 15000,
    balanceAmount: 15000,
    dueDate: "2026-10-10",
    status: "PARTIALLY_PAID",
    daysOverdue: 29,
    paymentLink: "https://pay.shikshaledger.in/inst/INST-0587-3",
  };

  it("generates bilingual Hindi and English reminders across pre-due, on-due and post-due triggers", () => {
    const reminders = generateRemindersForInstalment(mockStudent, mockInstalment);
    expect(reminders).toHaveLength(3);

    // Hindi message must contain Hindi text and accurate amount
    expect(reminders[0].messageHindi).toContain("प्रिय Dinesh Sharma");
    expect(reminders[0].messageHindi).toContain("₹15,000");

    // English message must contain English text and payment link
    expect(reminders[0].messageEnglish).toContain("Dear Dinesh Sharma");
    expect(reminders[0].messageEnglish).toContain("https://pay.shikshaledger.in/inst/INST-0587-3");

    // All should initially be SCHEDULED
    expect(reminders.every((r) => r.status === "SCHEDULED")).toBe(true);
  });

  it("halts and cancels all pending reminders the moment payment is received (Stop-on-Payment)", () => {
    const reminders = generateRemindersForInstalment(mockStudent, mockInstalment);
    expect(reminders.filter((r) => r.status === "SCHEDULED")).toHaveLength(3);

    const { updatedReminders, cancelledCount } = haltRemindersOnPayment(reminders, mockInstalment.id);

    // All 3 scheduled reminders for this instalment must be cancelled
    expect(cancelledCount).toBe(3);
    expect(updatedReminders.every((r) => r.status === "CANCELLED_ON_PAYMENT")).toBe(true);
    expect(updatedReminders[0].cancelledAt).toBeDefined();
  });
});
