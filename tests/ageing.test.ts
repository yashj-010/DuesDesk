import { describe, it, expect } from "vitest";
import { computeAgeingAndKPIs } from "../src/lib/ageing";
import { Student } from "../src/types";

describe("Cross-Centre Dues & Ageing Bucket Computation", () => {
  const sampleStudents: Student[] = [
    {
      id: "STU-0412",
      name: "Aarav Meena",
      centreId: "C-01",
      centreName: "Malviya Nagar Centre",
      batch: "JEE 2027 Morning",
      parentName: "Ramswaroop Meena",
      parentPhone: "+91 98290 12345",
      enrollmentDate: "2026-06-15",
      totalCourseFee: 120000,
      totalDiscount: 10000,
      netPayableFee: 110000,
      totalPaid: 110000,
      totalBalance: 0,
      instalments: [
        {
          id: "INST-1",
          studentId: "STU-0412",
          instalmentNumber: 1,
          totalAmount: 110000,
          paidAmount: 110000,
          balanceAmount: 0,
          dueDate: "2026-10-10",
          status: "PAID",
          daysOverdue: 0,
          paymentLink: "https://pay.shikshaledger.in/inst/INST-1",
        },
      ],
      attendance: [],
      testScores: [],
      dropoutRiskScore: 5,
      dropoutRiskLevel: "LOW",
      dropoutRiskReasons: [],
    },
    {
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
          id: "INST-2",
          studentId: "STU-0587",
          instalmentNumber: 2,
          totalAmount: 40000,
          paidAmount: 20000,
          balanceAmount: 20000,
          dueDate: "2026-08-25", // 75 days overdue relative to 2026-11-08 -> >60 days bucket
          status: "OVERDUE",
          daysOverdue: 75,
          paymentLink: "https://pay.shikshaledger.in/inst/INST-2",
        },
        {
          id: "INST-3",
          studentId: "STU-0587",
          instalmentNumber: 3,
          totalAmount: 30000,
          paidAmount: 15000,
          balanceAmount: 15000,
          dueDate: "2026-10-10", // 29 days overdue -> 1-30 days bucket
          status: "PARTIALLY_PAID",
          daysOverdue: 29,
          paymentLink: "https://pay.shikshaledger.in/inst/INST-3",
        },
      ],
      attendance: [],
      testScores: [],
      dropoutRiskScore: 85,
      dropoutRiskLevel: "HIGH",
      dropoutRiskReasons: [],
    },
    {
      id: "STU-0219",
      name: "Mohit Gurjar",
      centreId: "C-02",
      centreName: "Raja Park Centre",
      batch: "NEET 2027 Morning",
      parentName: "Kalyan Sahay Gurjar",
      parentPhone: "+91 97850 54321",
      enrollmentDate: "2026-07-01",
      totalCourseFee: 120000,
      totalDiscount: 5000,
      netPayableFee: 115000,
      totalPaid: 75000,
      totalBalance: 40000,
      instalments: [
        {
          id: "INST-4",
          studentId: "STU-0219",
          instalmentNumber: 3,
          totalAmount: 40000,
          paidAmount: 0,
          balanceAmount: 40000,
          dueDate: "2026-11-15", // In future -> CurrentNotDue bucket
          status: "PENDING",
          daysOverdue: 0,
          paymentLink: "https://pay.shikshaledger.in/inst/INST-4",
        },
      ],
      attendance: [],
      testScores: [],
      dropoutRiskScore: 10,
      dropoutRiskLevel: "LOW",
      dropoutRiskReasons: [],
    },
  ];

  it("correctly buckets instalments into Current, 1-30d, 31-60d, and >60d overdue categories", () => {
    const summary = computeAgeingAndKPIs(sampleStudents, "2026-11-08");

    // Mohit Gurjar (40000) is due in future
    expect(summary.overall.currentNotDue.amount).toBe(40000);

    // Ishita Sharma INST-3 (15000) is 29 days overdue
    expect(summary.overall.overdue1to30.amount).toBe(15000);

    // Ishita Sharma INST-2 (20000) is 75 days overdue (>60d critical bucket)
    expect(summary.overall.overdue60Plus.amount).toBe(20000);
    expect(summary.overall.criticalLeakageRiskAmount).toBe(20000);

    // Total Overdue = 15000 + 20000 = 35000
    expect(summary.overall.totalOverdueAmount).toBe(35000);

    // Centre breakdowns
    expect(summary.byCentre.length).toBe(2); // Malviya Nagar & Raja Park
  });
});
