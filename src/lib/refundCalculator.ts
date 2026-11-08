import { StatutoryRefundCalculation } from "@/types";

/**
 * Ministry of Education (MoE) 2024 Guidelines on Coaching Centers:
 * 1. Pro-rata refund must be calculated based on the unexpired period of the course.
 * 2. Refund must be credited within a strict statutory deadline of 10 days from receipt of exit notice.
 * 3. Registration/prospectus charges can be retained up to a reasonable cap (e.g. ₹5,000 maximum).
 * 4. Cost of physical study materials provided may only be deducted if already handed over and non-reusable.
 * 5. GST adjustment: 18% GST collected on the unconsumed tuition portion must be credited back.
 */

export interface RefundInput {
  studentId: string;
  studentName: string;
  batch: string;
  courseCommencedDate: string; // YYYY-MM-DD
  leavingNoticeDate: string;   // YYYY-MM-DD
  totalCourseFee: number;
  totalPaidSoFar: number;
  totalCourseDurationDays?: number; // Default 365 days
  registrationFeeCap?: number;      // Default 5000 max
  studyMaterialCost?: number;       // Default 8000
}

export function calculateStatutoryRefund(input: RefundInput): StatutoryRefundCalculation {
  const totalDuration = input.totalCourseDurationDays || 365;
  const regFeeCap = Math.min(input.registrationFeeCap ?? 5000, 5000); // capped per guideline
  const studyMaterialCost = input.studyMaterialCost ?? 8000;

  const startDate = new Date(input.courseCommencedDate);
  const noticeDate = new Date(input.leavingNoticeDate);

  // Compute days attended
  const diffTime = Math.max(0, noticeDate.getTime() - startDate.getTime());
  const rawDaysAttended = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const daysAttended = Math.min(Math.max(rawDaysAttended, 1), totalDuration);

  // Statutory 10-day deadline from notice
  const deadlineDate = new Date(noticeDate);
  deadlineDate.setDate(deadlineDate.getDate() + 10);
  const statutoryDeadlineDate = deadlineDate.toISOString().split("T")[0];

  // Base tuition subject to pro-rata
  // Tuition Base = Total Course Fee - Registration Fee - Study Material Cost
  const applicableTuitionBase = Math.max(0, input.totalCourseFee - regFeeCap - studyMaterialCost);
  const proRataTuitionPerDay = applicableTuitionBase / totalDuration;

  // Consumed tuition
  const tuitionFeeConsumed = Math.round(proRataTuitionPerDay * daysAttended);

  // Total non-refundable amount retained by institute
  const totalRetainedByInstitute = regFeeCap + studyMaterialCost + tuitionFeeConsumed;

  // Raw Refund from tuition portion
  // Eligible refund = Total Paid - (Registration + Material + Consumed Tuition)
  const rawEligibleRefund = input.totalPaidSoFar - totalRetainedByInstitute;
  const eligibleRefundAmount = Math.max(0, Math.round(rawEligibleRefund));

  // 18% GST adjustment reversal on refundable tuition
  // GST Reversal = Refund * 18%
  const gstReversalAmount = Math.round(eligibleRefundAmount * 0.18);
  const netRefundPayable = eligibleRefundAmount; // Net total payable back to parent

  return {
    studentId: input.studentId,
    studentName: input.studentName,
    batch: input.batch,
    courseCommencedDate: input.courseCommencedDate,
    leavingNoticeDate: input.leavingNoticeDate,
    statutoryDeadlineDate,
    totalCourseDurationDays: totalDuration,
    daysAttended,
    totalCourseFee: input.totalCourseFee,
    nonRefundableRegCap: regFeeCap,
    studyMaterialCostDeduction: studyMaterialCost,
    applicableTuitionBase,
    proRataTuitionPerDay: Math.round(proRataTuitionPerDay * 100) / 100,
    tuitionFeeConsumed,
    totalPaidSoFar: input.totalPaidSoFar,
    eligibleRefundAmount,
    gstReversalAmount,
    netRefundPayable,
    status: "CALCULATED",
  };
}
