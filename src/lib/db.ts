import {
  Student,
  PaymentTransaction,
  ReminderNotification,
  UnmatchedPayment,
  CounsellorTask,
} from "@/types";
import { generateRemindersForInstalment, haltRemindersOnPayment } from "./reminders";
import { evaluateDropoutRisk } from "./riskEngine";

// Initial seed dataset strictly embedding the brief's sample data and realistic Jaipur network data
const INITIAL_STUDENTS: Student[] = [
  {
    id: "STU-0412",
    name: "Aarav Meena",
    centreId: "C-01",
    centreName: "Malviya Nagar Centre",
    batch: "JEE 2027 Morning",
    parentName: "Ramswaroop Meena",
    parentPhone: "+91 98290 12345",
    parentEmail: "ramswaroop.meena@example.com",
    enrollmentDate: "2026-06-15",
    totalCourseFee: 120000,
    totalDiscount: 10000,
    discountReason: "Merit Scholarship (Top 5% in Entrance Test)",
    netPayableFee: 110000,
    totalPaid: 110000,
    totalBalance: 0,
    instalments: [
      {
        id: "INST-0412-1",
        studentId: "STU-0412",
        instalmentNumber: 1,
        totalAmount: 40000,
        paidAmount: 40000,
        balanceAmount: 0,
        dueDate: "2026-06-20",
        status: "PAID",
        daysOverdue: 0,
        paymentLink: "https://pay.shikshaledger.in/inst/INST-0412-1",
        lastPaymentDate: "2026-06-18",
      },
      {
        id: "INST-0412-2",
        studentId: "STU-0412",
        instalmentNumber: 2,
        totalAmount: 40000,
        paidAmount: 40000,
        balanceAmount: 0,
        dueDate: "2026-08-15",
        status: "PAID",
        daysOverdue: 0,
        paymentLink: "https://pay.shikshaledger.in/inst/INST-0412-2",
        lastPaymentDate: "2026-08-12",
      },
      {
        id: "INST-0412-3",
        studentId: "STU-0412",
        instalmentNumber: 3,
        totalAmount: 30000,
        paidAmount: 30000,
        balanceAmount: 0,
        dueDate: "2026-10-10",
        status: "PAID",
        daysOverdue: 0,
        paymentLink: "https://pay.shikshaledger.in/inst/INST-0412-3",
        lastPaymentDate: "2026-10-09",
      },
    ],
    attendance: [
      { month: "Aug 2026", attendedClasses: 26, totalClasses: 28, percentage: 92.8 },
      { month: "Sep 2026", attendedClasses: 25, totalClasses: 26, percentage: 96.1 },
      { month: "Oct 2026", attendedClasses: 27, totalClasses: 28, percentage: 96.4 },
    ],
    testScores: [
      {
        id: "T-01",
        testDate: "2026-08-30",
        testName: "JEE Main Diagnostic 1",
        score: 245,
        maxScore: 300,
        rank: 12,
        percentile: 98.2,
      },
      {
        id: "T-02",
        testDate: "2026-09-28",
        testName: "JEE Main Major Test 2",
        score: 255,
        maxScore: 300,
        rank: 8,
        percentile: 98.9,
      },
      {
        id: "T-03",
        testDate: "2026-10-25",
        testName: "Physics & Chem Sprint 3",
        score: 260,
        maxScore: 300,
        rank: 6,
        percentile: 99.1,
      },
    ],
    dropoutRiskScore: 5,
    dropoutRiskLevel: "LOW",
    dropoutRiskReasons: ["Consistent on-time payments", "Top 1% academic percentile"],
  },
  {
    id: "STU-0587",
    name: "Ishita Sharma",
    centreId: "C-01",
    centreName: "Malviya Nagar Centre",
    batch: "JEE 2027 Evening",
    parentName: "Dinesh Sharma",
    parentPhone: "+91 94140 67890",
    parentEmail: "dinesh.sharma.jpr@example.com",
    enrollmentDate: "2026-06-25",
    totalCourseFee: 120000,
    totalDiscount: 0,
    netPayableFee: 120000,
    totalPaid: 75000,
    totalBalance: 45000,
    instalments: [
      {
        id: "INST-0587-1",
        studentId: "STU-0587",
        instalmentNumber: 1,
        totalAmount: 40000,
        paidAmount: 40000,
        balanceAmount: 0,
        dueDate: "2026-07-05",
        status: "PAID",
        daysOverdue: 0,
        paymentLink: "https://pay.shikshaledger.in/inst/INST-0587-1",
        lastPaymentDate: "2026-07-04",
      },
      {
        id: "INST-0587-2",
        studentId: "STU-0587",
        instalmentNumber: 2,
        totalAmount: 40000,
        paidAmount: 20000,
        balanceAmount: 20000,
        dueDate: "2026-08-25",
        status: "OVERDUE",
        daysOverdue: 75,
        paymentLink: "https://pay.shikshaledger.in/inst/INST-0587-2",
        lastPaymentDate: "2026-08-28",
      },
      {
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
        lastPaymentDate: "2026-10-15",
      },
      {
        id: "INST-0587-4",
        studentId: "STU-0587",
        instalmentNumber: 4,
        totalAmount: 10000,
        paidAmount: 0,
        balanceAmount: 10000,
        dueDate: "2026-12-15",
        status: "PENDING",
        daysOverdue: 0,
        paymentLink: "https://pay.shikshaledger.in/inst/INST-0587-4",
      },
    ],
    attendance: [
      { month: "Aug 2026", attendedClasses: 24, totalClasses: 28, percentage: 85.7 },
      { month: "Sep 2026", attendedClasses: 19, totalClasses: 26, percentage: 73.0 },
      { month: "Oct 2026", attendedClasses: 14, totalClasses: 28, percentage: 50.0 },
    ],
    testScores: [
      {
        id: "T-11",
        testDate: "2026-08-30",
        testName: "JEE Main Diagnostic 1",
        score: 185,
        maxScore: 300,
        rank: 45,
        percentile: 88.5,
      },
      {
        id: "T-12",
        testDate: "2026-09-28",
        testName: "JEE Main Major Test 2",
        score: 142,
        maxScore: 300,
        rank: 92,
        percentile: 74.2,
      },
      {
        id: "T-13",
        testDate: "2026-10-25",
        testName: "Physics & Chem Sprint 3",
        score: 98,
        maxScore: 300,
        rank: 154,
        percentile: 52.1,
      },
    ],
    dropoutRiskScore: 85,
    dropoutRiskLevel: "HIGH",
    dropoutRiskReasons: [
      "Instalment #2 is critically overdue by >60 days (75 days)",
      "Severe attendance collapse: dropped from 85.7% to 50.0%",
      "Substantial test percentile decline: down 36.4%ile (latest 52.1%ile)",
    ],
  },
  {
    id: "STU-0219",
    name: "Mohit Gurjar",
    centreId: "C-02",
    centreName: "Raja Park Centre",
    batch: "NEET 2027 Morning",
    parentName: "Kalyan Sahay Gurjar",
    parentPhone: "+91 97850 54321",
    parentEmail: "ks.gurjar@example.com",
    enrollmentDate: "2026-07-01",
    totalCourseFee: 120000,
    totalDiscount: 5000,
    discountReason: "Early Bird Admission Discount",
    netPayableFee: 115000,
    totalPaid: 75000,
    totalBalance: 40000,
    instalments: [
      {
        id: "INST-0219-1",
        studentId: "STU-0219",
        instalmentNumber: 1,
        totalAmount: 40000,
        paidAmount: 40000,
        balanceAmount: 0,
        dueDate: "2026-07-10",
        status: "PAID",
        daysOverdue: 0,
        paymentLink: "https://pay.shikshaledger.in/inst/INST-0219-1",
        lastPaymentDate: "2026-07-09",
      },
      {
        id: "INST-0219-2",
        studentId: "STU-0219",
        instalmentNumber: 2,
        totalAmount: 35000,
        paidAmount: 35000,
        balanceAmount: 0,
        dueDate: "2026-09-15",
        status: "PAID",
        daysOverdue: 0,
        paymentLink: "https://pay.shikshaledger.in/inst/INST-0219-2",
        lastPaymentDate: "2026-09-14",
      },
      {
        id: "INST-0219-3",
        studentId: "STU-0219",
        instalmentNumber: 3,
        totalAmount: 40000,
        paidAmount: 0,
        balanceAmount: 40000,
        dueDate: "2026-11-15",
        status: "PENDING",
        daysOverdue: 0,
        paymentLink: "https://pay.shikshaledger.in/inst/INST-0219-3",
      },
    ],
    attendance: [
      { month: "Aug 2026", attendedClasses: 27, totalClasses: 28, percentage: 96.4 },
      { month: "Sep 2026", attendedClasses: 25, totalClasses: 26, percentage: 96.1 },
      { month: "Oct 2026", attendedClasses: 26, totalClasses: 28, percentage: 92.8 },
    ],
    testScores: [
      {
        id: "T-21",
        testDate: "2026-08-30",
        testName: "NEET Botany & Zoology Minor 1",
        score: 620,
        maxScore: 720,
        rank: 18,
        percentile: 96.5,
      },
      {
        id: "T-22",
        testDate: "2026-09-28",
        testName: "NEET Full Syllabus Mock 2",
        score: 635,
        maxScore: 720,
        rank: 14,
        percentile: 97.2,
      },
      {
        id: "T-23",
        testDate: "2026-10-25",
        testName: "Physics & Bio Integrated 3",
        score: 645,
        maxScore: 720,
        rank: 11,
        percentile: 98.0,
      },
    ],
    dropoutRiskScore: 10,
    dropoutRiskLevel: "LOW",
    dropoutRiskReasons: ["Upcoming instalment in 7 days (Not overdue)", "Strong 98th percentile in NEET"],
  },
  {
    id: "STU-0891",
    name: "Priya Verma",
    centreId: "C-03",
    centreName: "Vaishali Nagar Centre",
    batch: "NEET 2027 Evening",
    parentName: "Sanjay Verma",
    parentPhone: "+91 98281 99887",
    parentEmail: "sanjay.verma@example.com",
    enrollmentDate: "2026-06-20",
    totalCourseFee: 120000,
    totalDiscount: 15000,
    discountReason: "Sibling Scholarship",
    netPayableFee: 105000,
    totalPaid: 45000,
    totalBalance: 60000,
    instalments: [
      {
        id: "INST-0891-1",
        studentId: "STU-0891",
        instalmentNumber: 1,
        totalAmount: 45000,
        paidAmount: 45000,
        balanceAmount: 0,
        dueDate: "2026-07-01",
        status: "PAID",
        daysOverdue: 0,
        paymentLink: "https://pay.shikshaledger.in/inst/INST-0891-1",
        lastPaymentDate: "2026-06-30",
      },
      {
        id: "INST-0891-2",
        studentId: "STU-0891",
        instalmentNumber: 2,
        totalAmount: 30000,
        paidAmount: 0,
        balanceAmount: 30000,
        dueDate: "2026-09-01",
        status: "OVERDUE",
        daysOverdue: 68,
        paymentLink: "https://pay.shikshaledger.in/inst/INST-0891-2",
      },
      {
        id: "INST-0891-3",
        studentId: "STU-0891",
        instalmentNumber: 3,
        totalAmount: 30000,
        paidAmount: 0,
        balanceAmount: 30000,
        dueDate: "2026-11-01",
        status: "OVERDUE",
        daysOverdue: 7,
        paymentLink: "https://pay.shikshaledger.in/inst/INST-0891-3",
      },
    ],
    attendance: [
      { month: "Aug 2026", attendedClasses: 22, totalClasses: 28, percentage: 78.5 },
      { month: "Sep 2026", attendedClasses: 18, totalClasses: 26, percentage: 69.2 },
      { month: "Oct 2026", attendedClasses: 16, totalClasses: 28, percentage: 57.1 },
    ],
    testScores: [
      {
        id: "T-31",
        testDate: "2026-08-30",
        testName: "NEET Minor 1",
        score: 510,
        maxScore: 720,
        rank: 82,
        percentile: 79.0,
      },
      {
        id: "T-32",
        testDate: "2026-09-28",
        testName: "NEET Mock 2",
        score: 440,
        maxScore: 720,
        rank: 120,
        percentile: 65.0,
      },
    ],
    dropoutRiskScore: 75,
    dropoutRiskLevel: "HIGH",
    dropoutRiskReasons: [
      "Instalment #2 is critically overdue by 68 days (>60 days)",
      "Attendance declined from 78.5% to 57.1%",
    ],
  },
  {
    id: "STU-0344",
    name: "Rohan Shekhawat",
    centreId: "C-04",
    centreName: "Vidhyadhar Nagar Centre",
    batch: "JEE 2027 Morning",
    parentName: "Bhanwar Singh Shekhawat",
    parentPhone: "+91 94142 33445",
    enrollmentDate: "2026-07-10",
    totalCourseFee: 120000,
    totalDiscount: 0,
    netPayableFee: 120000,
    totalPaid: 90000,
    totalBalance: 30000,
    instalments: [
      {
        id: "INST-0344-1",
        studentId: "STU-0344",
        instalmentNumber: 1,
        totalAmount: 45000,
        paidAmount: 45000,
        balanceAmount: 0,
        dueDate: "2026-07-15",
        status: "PAID",
        daysOverdue: 0,
        paymentLink: "https://pay.shikshaledger.in/inst/INST-0344-1",
        lastPaymentDate: "2026-07-14",
      },
      {
        id: "INST-0344-2",
        studentId: "STU-0344",
        instalmentNumber: 2,
        totalAmount: 45000,
        paidAmount: 45000,
        balanceAmount: 0,
        dueDate: "2026-09-15",
        status: "PAID",
        daysOverdue: 0,
        paymentLink: "https://pay.shikshaledger.in/inst/INST-0344-2",
        lastPaymentDate: "2026-09-12",
      },
      {
        id: "INST-0344-3",
        studentId: "STU-0344",
        instalmentNumber: 3,
        totalAmount: 30000,
        paidAmount: 0,
        balanceAmount: 30000,
        dueDate: "2026-11-30",
        status: "PENDING",
        daysOverdue: 0,
        paymentLink: "https://pay.shikshaledger.in/inst/INST-0344-3",
      },
    ],
    attendance: [
      { month: "Aug 2026", attendedClasses: 26, totalClasses: 28, percentage: 92.8 },
      { month: "Sep 2026", attendedClasses: 25, totalClasses: 26, percentage: 96.1 },
      { month: "Oct 2026", attendedClasses: 27, totalClasses: 28, percentage: 96.4 },
    ],
    testScores: [
      {
        id: "T-41",
        testDate: "2026-08-30",
        testName: "JEE Main Diagnostic 1",
        score: 220,
        maxScore: 300,
        rank: 22,
        percentile: 94.5,
      },
      {
        id: "T-42",
        testDate: "2026-10-25",
        testName: "JEE Main Major 2",
        score: 232,
        maxScore: 300,
        rank: 18,
        percentile: 95.8,
      },
    ],
    dropoutRiskScore: 10,
    dropoutRiskLevel: "LOW",
    dropoutRiskReasons: ["Stable attendance and test performance", "No overdue fees"],
  },
];

// Initial Payment Transactions with GST breakdown
const INITIAL_TRANSACTIONS: PaymentTransaction[] = [
  {
    id: "TXN-8821",
    instalmentId: "INST-0412-3",
    studentId: "STU-0412",
    amount: 30000,
    date: "2026-10-09",
    method: "UPI",
    referenceId: "UPI/3281094821/HDFC",
    receiptNumber: "RCPT-2026-0842",
    baseAmount: 25423.73,
    cgst: 2288.13,
    sgst: 2288.14,
  },
  {
    id: "TXN-8711",
    instalmentId: "INST-0587-3",
    studentId: "STU-0587",
    amount: 15000,
    date: "2026-10-15",
    method: "NET_BANKING",
    referenceId: "NET/SBIN490182",
    receiptNumber: "RCPT-2026-0914",
    baseAmount: 12711.86,
    cgst: 1144.07,
    sgst: 1144.07,
  },
  {
    id: "TXN-8540",
    instalmentId: "INST-0219-2",
    studentId: "STU-0219",
    amount: 35000,
    date: "2026-09-14",
    method: "UPI",
    referenceId: "UPI/3257819023/ICICI",
    receiptNumber: "RCPT-2026-0610",
    baseAmount: 29661.02,
    cgst: 2669.49,
    sgst: 2669.49,
  },
];

// Initial Unmatched Payments Queue (as specified in brief: unmatched payments go to an accounts queue)
const INITIAL_UNMATCHED_PAYMENTS: UnmatchedPayment[] = [
  {
    id: "UNM-001",
    referenceNo: "NEFT/SBIN00291048",
    date: "2026-11-04",
    amount: 30000,
    bankNarration: "NEFT CR-PUNB0192-SHARMA DINESH-FEE JAIPUR",
    detectedStudentHint: "Possible match with Ishita Sharma (STU-0587)",
    status: "PENDING_INVESTIGATION",
  },
  {
    id: "UNM-002",
    referenceNo: "UPI/62910488219",
    date: "2026-11-06",
    amount: 40000,
    bankNarration: "UPI-40000-AXIS BANK-COACHING DEPOSIT",
    detectedStudentHint: "Multiple candidates with ₹40k instalment due",
    status: "PENDING_INVESTIGATION",
  },
];

// Generate initial notifications
let INITIAL_NOTIFICATIONS: ReminderNotification[] = [];
for (const student of INITIAL_STUDENTS) {
  for (const inst of student.instalments) {
    const notifs = generateRemindersForInstalment(student, inst);
    if (inst.status === "PAID") {
      // If paid, mark reminders as cancelled on payment!
      const { updatedReminders } = haltRemindersOnPayment(notifs, inst.id);
      INITIAL_NOTIFICATIONS.push(...updatedReminders);
    } else {
      INITIAL_NOTIFICATIONS.push(...notifs);
    }
  }
}

// Generate initial counsellor tasks
const INITIAL_COUNSELLOR_TASKS: CounsellorTask[] = [];
for (const s of INITIAL_STUDENTS) {
  const evalResult = evaluateDropoutRisk(s);
  if (evalResult.counsellorTask) {
    INITIAL_COUNSELLOR_TASKS.push(evalResult.counsellorTask);
  }
}

// In-Memory Database Store with singletons for server runtime
class InMemoryDatabase {
  private students: Student[] = [...INITIAL_STUDENTS];
  private transactions: PaymentTransaction[] = [...INITIAL_TRANSACTIONS];
  private reminders: ReminderNotification[] = [...INITIAL_NOTIFICATIONS];
  private unmatchedPayments: UnmatchedPayment[] = [...INITIAL_UNMATCHED_PAYMENTS];
  private counsellorTasks: CounsellorTask[] = [...INITIAL_COUNSELLOR_TASKS];

  getStudents(): Student[] {
    return this.students;
  }

  getStudentById(id: string): Student | undefined {
    return this.students.find((s) => s.id.toLowerCase() === id.toLowerCase());
  }

  getTransactions(): PaymentTransaction[] {
    return this.transactions;
  }

  getReminders(): ReminderNotification[] {
    return this.reminders;
  }

  getUnmatchedPayments(): UnmatchedPayment[] {
    return this.unmatchedPayments;
  }

  getCounsellorTasks(): CounsellorTask[] {
    return this.counsellorTasks;
  }

  /**
   * Process a payment (from Mock Gateway or Accounts Manual Entry)
   * Automatically executes the Stop-on-Payment rule to halt pending reminders!
   */
  recordPayment(payload: {
    studentId: string;
    instalmentId: string;
    amount: number;
    method: "UPI" | "NET_BANKING" | "CARD" | "CASH" | "CHEQUE";
    referenceId?: string;
  }): { transaction: PaymentTransaction; student: Student; cancelledRemindersCount: number } {
    const student = this.students.find((s) => s.id === payload.studentId);
    if (!student) throw new Error("Student not found");

    const instalment = student.instalments.find((inst) => inst.id === payload.instalmentId);
    if (!instalment) throw new Error("Instalment not found");

    const amount = payload.amount;
    const now = new Date().toISOString();
    const dateStr = now.split("T")[0];

    // Calculate GST (18% inclusive)
    const baseAmount = Math.round((amount / 1.18) * 100) / 100;
    const totalGst = Math.round((amount - baseAmount) * 100) / 100;
    const cgst = Math.round((totalGst / 2) * 100) / 100;
    const sgst = Math.round((totalGst - cgst) * 100) / 100;

    const receiptNumber = `RCPT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const referenceId = payload.referenceId || `PAY/${Math.floor(1000000000 + Math.random() * 9000000000)}`;

    const transaction: PaymentTransaction = {
      id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
      instalmentId: instalment.id,
      studentId: student.id,
      amount,
      date: dateStr,
      method: payload.method,
      referenceId,
      receiptNumber,
      baseAmount,
      cgst,
      sgst,
    };

    // Update instalment
    instalment.paidAmount += amount;
    instalment.balanceAmount = Math.max(0, instalment.totalAmount - instalment.paidAmount);
    instalment.lastPaymentDate = dateStr;

    if (instalment.balanceAmount === 0) {
      instalment.status = "PAID";
      instalment.daysOverdue = 0;
    } else {
      instalment.status = "PARTIALLY_PAID";
    }

    // Update student totals
    student.totalPaid += amount;
    student.totalBalance = Math.max(0, student.netPayableFee - student.totalPaid);

    // Save transaction
    this.transactions.unshift(transaction);

    // CRITICAL: Stop-on-Payment Engine Rule
    // Immediately cancel all scheduled reminders for this instalment
    const { updatedReminders, cancelledCount } = haltRemindersOnPayment(this.reminders, instalment.id);
    this.reminders = updatedReminders;

    // Re-evaluate risk score after payment
    const riskEval = evaluateDropoutRisk(student);
    student.dropoutRiskScore = riskEval.riskScore;
    student.dropoutRiskLevel = riskEval.riskLevel;
    student.dropoutRiskReasons = riskEval.reasons;

    return {
      transaction,
      student,
      cancelledRemindersCount: cancelledCount,
    };
  }

  /**
   * Counsellor feedback loop on AI risk flag:
   * Counsellor marks false flag or logs resolution
   */
  updateCounsellorTask(taskId: string, status: "CALLED_RESOLVED" | "FALSE_FLAG", notes?: string): CounsellorTask {
    const task = this.counsellorTasks.find((t) => t.id === taskId);
    if (!task) throw new Error("Task not found");

    task.status = status;
    task.notes = notes || task.notes;
    task.resolutionDate = new Date().toISOString();

    if (status === "FALSE_FLAG") {
      // Re-adjust student risk reasons to prevent repetitive false alarms
      const student = this.students.find((s) => s.id === task.studentId);
      if (student) {
        student.dropoutRiskReasons.push("Counsellor verified: False positive (Family emergency, confirmed continuing)");
        student.dropoutRiskScore = Math.max(10, student.dropoutRiskScore - 30);
        student.dropoutRiskLevel = student.dropoutRiskScore >= 60 ? "HIGH" : student.dropoutRiskScore >= 40 ? "MODERATE" : "LOW";
      }
    }

    return task;
  }

  /**
   * Bulk upload attendance or test scores per batch
   */
  bulkUpdateRecords(
    batchName: string,
    type: "ATTENDANCE" | "TEST_SCORES",
    records: Array<{ studentId: string; value1: number; value2?: number; label: string }>
  ): { updatedCount: number; errors: string[] } {
    let updatedCount = 0;
    const errors: string[] = [];

    for (const rec of records) {
      const student = this.students.find((s) => s.id.toLowerCase() === rec.studentId.toLowerCase());
      if (!student) {
        errors.push(`Student ID ${rec.studentId} not found`);
        continue;
      }

      if (type === "ATTENDANCE") {
        const attended = rec.value1;
        const total = rec.value2 || 28;
        const percentage = Math.round((attended / total) * 1000) / 10;
        student.attendance.push({
          month: rec.label,
          attendedClasses: attended,
          totalClasses: total,
          percentage,
        });
        updatedCount++;
      } else {
        const score = rec.value1;
        const maxScore = rec.value2 || 300;
        const percentile = Math.min(99.9, Math.round((score / maxScore) * 1000) / 10);
        student.testScores.push({
          id: `T-${Date.now().toString().slice(-4)}`,
          testDate: new Date().toISOString().split("T")[0],
          testName: rec.label,
          score,
          maxScore,
          rank: Math.max(1, Math.floor(100 - percentile)),
          percentile,
        });
        updatedCount++;
      }

      // Re-run risk evaluation
      const riskEval = evaluateDropoutRisk(student);
      student.dropoutRiskScore = riskEval.riskScore;
      student.dropoutRiskLevel = riskEval.riskLevel;
      student.dropoutRiskReasons = riskEval.reasons;
      if (riskEval.counsellorTask && !this.counsellorTasks.some((t) => t.studentId === student.id && t.status === "PENDING_CALL")) {
        this.counsellorTasks.unshift(riskEval.counsellorTask);
      }
    }

    return { updatedCount, errors };
  }
}

// Global singleton instance
const globalForDb = global as unknown as { dbInstance?: InMemoryDatabase };
export const db = globalForDb.dbInstance || new InMemoryDatabase();
if (process.env.NODE_ENV !== "production") globalForDb.dbInstance = db;
