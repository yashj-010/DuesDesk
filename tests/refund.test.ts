import { describe, it, expect } from "vitest";
import { calculateStatutoryRefund } from "../src/lib/refundCalculator";

describe("Ministry of Education (MoE) 2024 Statutory Pro-Rata Refund Calculator", () => {
  it("calculates correct pro-rata refund for a student leaving mid-term within 10 days statutory deadline", () => {
    const refundResult = calculateStatutoryRefund({
      studentId: "STU-TEST-01",
      studentName: "Test Student",
      batch: "JEE 2027 Morning",
      courseCommencedDate: "2026-07-01",
      leavingNoticeDate: "2026-09-29", // 90 days attended
      totalCourseFee: 120000,
      totalPaidSoFar: 80000,
      totalCourseDurationDays: 365,
      registrationFeeCap: 5000,
      studyMaterialCost: 8000,
    });

    // Verify statutory 10-day rule: notice on 2026-09-29 -> deadline 2026-10-09
    expect(refundResult.statutoryDeadlineDate).toBe("2026-10-09");
    expect(refundResult.daysAttended).toBe(90);

    // Applicable Tuition Base = 120,000 - 5,000 (reg cap) - 8,000 (material) = 107,000
    expect(refundResult.applicableTuitionBase).toBe(107000);

    // Pro-rata per day = 107000 / 365 = ~293.15
    // Tuition Consumed for 90 days = round(293.15068 * 90) = 26384
    expect(refundResult.tuitionFeeConsumed).toBe(26384);

    // Total Retained = 5000 + 8000 + 26384 = 39384
    // Refund = 80000 - 39384 = 40616
    expect(refundResult.eligibleRefundAmount).toBe(40616);
    expect(refundResult.netRefundPayable).toBe(40616);
  });

  it("strictly enforces maximum registration fee cap to ₹5,000 as per guidelines even if higher requested", () => {
    const refundResult = calculateStatutoryRefund({
      studentId: "STU-TEST-02",
      studentName: "Excess Fee Student",
      batch: "NEET 2027 Morning",
      courseCommencedDate: "2026-07-01",
      leavingNoticeDate: "2026-07-15", // 14 days
      totalCourseFee: 120000,
      totalPaidSoFar: 60000,
      registrationFeeCap: 25000, // Intentional excessive retention attempt
    });

    // Must cap at 5000
    expect(refundResult.nonRefundableRegCap).toBe(5000);
  });

  it("handles leaving on commencement date (1 day attended)", () => {
    const refundResult = calculateStatutoryRefund({
      studentId: "STU-TEST-03",
      studentName: "Day One Student",
      batch: "JEE 2027 Evening",
      courseCommencedDate: "2026-07-01",
      leavingNoticeDate: "2026-07-01",
      totalCourseFee: 120000,
      totalPaidSoFar: 40000,
    });

    expect(refundResult.daysAttended).toBe(1);
    expect(refundResult.eligibleRefundAmount).toBeGreaterThan(25000);
  });
});
