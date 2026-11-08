export type UserRole = "PARENT" | "ACCOUNTS" | "COUNSELLOR";

export type InstalmentStatus = "PAID" | "PARTIALLY_PAID" | "OVERDUE" | "PENDING";

export interface Instalment {
  id: string;
  studentId: string;
  instalmentNumber: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  dueDate: string; // ISO date 'YYYY-MM-DD'
  status: InstalmentStatus;
  daysOverdue: number;
  paymentLink: string;
  lastPaymentDate?: string;
}

export interface PaymentTransaction {
  id: string;
  instalmentId: string;
  studentId: string;
  amount: number;
  date: string;
  method: "UPI" | "NET_BANKING" | "CARD" | "CASH" | "CHEQUE";
  referenceId: string;
  receiptNumber: string;
  baseAmount: number;
  cgst: number;
  sgst: number;
}

export interface TestScoreRecord {
  id: string;
  testDate: string;
  testName: string;
  score: number;
  maxScore: number;
  rank: number;
  percentile: number;
}

export interface AttendanceRecord {
  month: string; // e.g. "Oct 2026"
  attendedClasses: number;
  totalClasses: number;
  percentage: number;
}

export interface Student {
  id: string;
  name: string;
  centreId: string;
  centreName: string;
  batch: string;
  parentName: string;
  parentPhone: string;
  parentEmail?: string;
  enrollmentDate: string;
  totalCourseFee: number;
  totalDiscount: number;
  discountReason?: string;
  netPayableFee: number;
  totalPaid: number;
  totalBalance: number;
  instalments: Instalment[];
  attendance: AttendanceRecord[];
  testScores: TestScoreRecord[];
  dropoutRiskScore: number; // 0 to 100
  dropoutRiskLevel: "LOW" | "MODERATE" | "HIGH";
  dropoutRiskReasons: string[];
}

export interface ReminderNotification {
  id: string;
  studentId: string;
  instalmentId: string;
  parentPhone: string;
  type: "PRE_DUE" | "ON_DUE" | "POST_DUE";
  scheduledDate: string;
  messageHindi: string;
  messageEnglish: string;
  status: "SCHEDULED" | "SENT" | "CANCELLED_ON_PAYMENT";
  sentAt?: string;
  cancelledAt?: string;
}

export interface UnmatchedPayment {
  id: string;
  referenceNo: string;
  date: string;
  amount: number;
  bankNarration: string;
  detectedStudentHint?: string;
  status: "PENDING_INVESTIGATION" | "MATCHED" | "REFUNDED";
}

export interface StatutoryRefundCalculation {
  studentId: string;
  studentName: string;
  batch: string;
  courseCommencedDate: string;
  leavingNoticeDate: string;
  statutoryDeadlineDate: string; // 10 days from notice
  totalCourseDurationDays: number;
  daysAttended: number;
  totalCourseFee: number;
  nonRefundableRegCap: number; // Max statutory cap allowed
  studyMaterialCostDeduction: number;
  applicableTuitionBase: number;
  proRataTuitionPerDay: number;
  tuitionFeeConsumed: number;
  totalPaidSoFar: number;
  eligibleRefundAmount: number;
  gstReversalAmount: number;
  netRefundPayable: number;
  status: "CALCULATED" | "APPROVED" | "DISBURSED";
}

export interface CounsellorTask {
  id: string;
  studentId: string;
  studentName: string;
  batch: string;
  centreName: string;
  riskScore: number;
  riskReasons: string[];
  status: "PENDING_CALL" | "CALLED_RESOLVED" | "FALSE_FLAG";
  assignedTo: string;
  createdAt: string;
  notes?: string;
  resolutionDate?: string;
}
