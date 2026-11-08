import { Student, Instalment } from "@/types";

export interface AgeingBuckets {
  currentNotDue: { count: number; amount: number };
  overdue1to30: { count: number; amount: number };
  overdue31to60: { count: number; amount: number };
  overdue60Plus: { count: number; amount: number };
  totalOverdueAmount: number;
  totalCollected: number;
  totalBilled: number;
  totalStudents: number;
  criticalLeakageRiskAmount: number; // Target slice (>60 days overdue)
}

export interface CentreSummary {
  centreId: string;
  centreName: string;
  studentCount: number;
  billedAmount: number;
  collectedAmount: number;
  overdueAmount: number;
  overdue60PlusAmount: number;
  collectionEfficiency: number; // %
}

export interface BatchSummary {
  batchName: string;
  studentCount: number;
  billedAmount: number;
  collectedAmount: number;
  overdueAmount: number;
  overdue60PlusAmount: number;
}

export function computeAgeingAndKPIs(students: Student[], referenceDateStr = "2026-11-08"): {
  overall: AgeingBuckets;
  byCentre: CentreSummary[];
  byBatch: BatchSummary[];
} {
  const refDate = new Date(referenceDateStr);

  let currentNotDueAmount = 0;
  let currentNotDueCount = 0;
  let overdue1to30Amount = 0;
  let overdue1to30Count = 0;
  let overdue31to60Amount = 0;
  let overdue31to60Count = 0;
  let overdue60PlusAmount = 0;
  let overdue60PlusCount = 0;

  let totalCollected = 0;
  let totalBilled = 0;

  const centreMap = new Map<string, CentreSummary>();
  const batchMap = new Map<string, BatchSummary>();

  for (const s of students) {
    totalBilled += s.netPayableFee;
    totalCollected += s.totalPaid;

    // Centre mapping
    if (!centreMap.has(s.centreId)) {
      centreMap.set(s.centreId, {
        centreId: s.centreId,
        centreName: s.centreName,
        studentCount: 0,
        billedAmount: 0,
        collectedAmount: 0,
        overdueAmount: 0,
        overdue60PlusAmount: 0,
        collectionEfficiency: 0,
      });
    }
    const cStat = centreMap.get(s.centreId)!;
    cStat.studentCount += 1;
    cStat.billedAmount += s.netPayableFee;
    cStat.collectedAmount += s.totalPaid;

    // Batch mapping
    if (!batchMap.has(s.batch)) {
      batchMap.set(s.batch, {
        batchName: s.batch,
        studentCount: 0,
        billedAmount: 0,
        collectedAmount: 0,
        overdueAmount: 0,
        overdue60PlusAmount: 0,
      });
    }
    const bStat = batchMap.get(s.batch)!;
    bStat.studentCount += 1;
    bStat.billedAmount += s.netPayableFee;
    bStat.collectedAmount += s.totalPaid;

    // Iterate instalments
    for (const inst of s.instalments) {
      if (inst.status === "PAID") continue;

      const dueDate = new Date(inst.dueDate);
      const diffTime = refDate.getTime() - dueDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const pendingBalance = inst.balanceAmount;

      if (diffDays <= 0) {
        currentNotDueAmount += pendingBalance;
        currentNotDueCount++;
      } else if (diffDays <= 30) {
        overdue1to30Amount += pendingBalance;
        overdue1to30Count++;
        cStat.overdueAmount += pendingBalance;
        bStat.overdueAmount += pendingBalance;
      } else if (diffDays <= 60) {
        overdue31to60Amount += pendingBalance;
        overdue31to60Count++;
        cStat.overdueAmount += pendingBalance;
        bStat.overdueAmount += pendingBalance;
      } else {
        // > 60 days overdue (The critical leak problem highlighted in brief)
        overdue60PlusAmount += pendingBalance;
        overdue60PlusCount++;
        cStat.overdueAmount += pendingBalance;
        cStat.overdue60PlusAmount += pendingBalance;
        bStat.overdueAmount += pendingBalance;
        bStat.overdue60PlusAmount += pendingBalance;
      }
    }
  }

  // Calculate efficiencies
  centreMap.forEach((c) => {
    c.collectionEfficiency = c.billedAmount > 0 
      ? Math.round((c.collectedAmount / c.billedAmount) * 100) 
      : 100;
  });

  const totalOverdue = overdue1to30Amount + overdue31to60Amount + overdue60PlusAmount;

  return {
    overall: {
      currentNotDue: { count: currentNotDueCount, amount: currentNotDueAmount },
      overdue1to30: { count: overdue1to30Count, amount: overdue1to30Amount },
      overdue31to60: { count: overdue31to60Count, amount: overdue31to60Amount },
      overdue60Plus: { count: overdue60PlusCount, amount: overdue60PlusAmount },
      totalOverdueAmount: totalOverdue,
      totalCollected,
      totalBilled,
      totalStudents: students.length,
      criticalLeakageRiskAmount: overdue60PlusAmount,
    },
    byCentre: Array.from(centreMap.values()),
    byBatch: Array.from(batchMap.values()),
  };
}
