"use client";

import React, { useState } from "react";
import { Student, StatutoryRefundCalculation } from "@/types";
import { APP_CONFIG } from "@/config/appConfig";
import { calculateStatutoryRefund } from "@/lib/refundCalculator";
import {
  Calculator,
  Scale,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Printer,
  ShieldCheck,
  FileCheck,
  HelpCircle,
} from "lucide-react";

interface RefundCalculatorProps {
  students: Student[];
  initialStudentId?: string;
}

export const RefundCalculator: React.FC<RefundCalculatorProps> = ({
  students,
  initialStudentId,
}) => {
  const defaultStudent =
    students.find((s) => s.id === initialStudentId) || students[1] || students[0];

  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    defaultStudent ? defaultStudent.id : ""
  );

  const activeStudent =
    students.find((s) => s.id === selectedStudentId) || defaultStudent;

  const [commencedDate, setCommencedDate] = useState<string>("2026-06-25");
  const [noticeDate, setNoticeDate] = useState<string>("2026-10-15");
  const [totalCourseFee, setTotalCourseFee] = useState<number>(
    activeStudent ? activeStudent.netPayableFee : 120000
  );
  const [totalPaidSoFar, setTotalPaidSoFar] = useState<number>(
    activeStudent ? activeStudent.totalPaid : 75000
  );
  const [regFeeCap, setRegFeeCap] = useState<number>(5000);
  const [studyMaterialCost, setStudyMaterialCost] = useState<number>(8000);

  const [calculation, setCalculation] = useState<StatutoryRefundCalculation>(() =>
    calculateStatutoryRefund({
      studentId: activeStudent?.id || "STU-0587",
      studentName: activeStudent?.name || "Ishita Sharma",
      batch: activeStudent?.batch || "JEE 2027 Evening",
      courseCommencedDate: "2026-06-25",
      leavingNoticeDate: "2026-10-15",
      totalCourseFee: activeStudent?.netPayableFee || 120000,
      totalPaidSoFar: activeStudent?.totalPaid || 75000,
      registrationFeeCap: 5000,
      studyMaterialCost: 8000,
    })
  );

  // Sync state when student changes
  const handleStudentSelect = (id: string) => {
    setSelectedStudentId(id);
    const st = students.find((s) => s.id === id);
    if (st) {
      setTotalCourseFee(st.netPayableFee);
      setTotalPaidSoFar(st.totalPaid);
      const res = calculateStatutoryRefund({
        studentId: st.id,
        studentName: st.name,
        batch: st.batch,
        courseCommencedDate: commencedDate,
        leavingNoticeDate: noticeDate,
        totalCourseFee: st.netPayableFee,
        totalPaidSoFar: st.totalPaid,
        registrationFeeCap: regFeeCap,
        studyMaterialCost,
      });
      setCalculation(res);
    }
  };

  const handleRecalculate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStudent) return;

    const res = calculateStatutoryRefund({
      studentId: activeStudent.id,
      studentName: activeStudent.name,
      batch: activeStudent.batch,
      courseCommencedDate: commencedDate,
      leavingNoticeDate: noticeDate,
      totalCourseFee,
      totalPaidSoFar,
      registrationFeeCap: regFeeCap,
      studyMaterialCost,
    });
    setCalculation(res);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Banner: Ministry of Education (MoE) 2024 Guidelines */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3 border border-indigo-500/30">
          <Scale className="w-3.5 h-3.5" />
          <span>Statutory Compliance: Ministry of Education 2024 Guidelines</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
          Pro-Rata Refund Settlement Calculator
        </h1>
        <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-3xl">
          Automates written pro-rata refund calculations eliminating arbitrary guesswork. Complies with the 2024 MoE mandate: pro-rata refund based on unexpired tenure, registration fee capped at ₹5,000, and refund credited within 10 days.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Inputs */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Calculator className="w-4 h-4 text-sky-600" />
            <span>Exit Notice & Fee Parameters</span>
          </h2>

          <form onSubmit={handleRecalculate} className="space-y-4 text-xs">
            {/* Student Picker */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Select Student for Exit Settlement:
              </label>
              <select
                aria-label="Select Student for Exit Settlement"
                value={selectedStudentId}
                onChange={(e) => handleStudentSelect(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.id}) - {s.batch}
                  </option>
                ))}
              </select>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Batch Start Date:
                </label>
                <input
                  type="date"
                  value={commencedDate}
                  onChange={(e) => setCommencedDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Leaving Notice Date:
                </label>
                <input
                  type="date"
                  value={noticeDate}
                  onChange={(e) => setNoticeDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800"
                />
              </div>
            </div>

            {/* Fees */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Total Course Fee (₹):
                </label>
                <input
                  type="number"
                  value={totalCourseFee}
                  onChange={(e) => setTotalCourseFee(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Total Paid So Far (₹):
                </label>
                <input
                  type="number"
                  value={totalPaidSoFar}
                  onChange={(e) => setTotalPaidSoFar(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-emerald-800"
                />
              </div>
            </div>

            {/* Retention Deductions */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">Registration Cap:</label>
                  <span className="text-[10px] text-sky-600 font-bold">Max ₹5,000</span>
                </div>
                <input
                  type="number"
                  max={5000}
                  value={regFeeCap}
                  onChange={(e) => setRegFeeCap(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Study Material Cost (₹):
                </label>
                <input
                  type="number"
                  value={studyMaterialCost}
                  onChange={(e) => setStudyMaterialCost(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition shadow-sm mt-2"
            >
              Re-calculate Pro-Rata Settlement
            </button>
          </form>

          {/* MoE 2024 Rule Callout */}
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 space-y-1">
            <p className="font-bold flex items-center">
              <Scale className="w-3.5 h-3.5 mr-1 text-amber-700" />
              MoE 2024 Statutory Guidelines Rule 6(b):
            </p>
            <p className="text-slate-600">
              Coaching centers must refund the unconsumed proportional fee within 10 days of exit notice. Arbitrary non-refundable clauses on full tuition are prohibited.
            </p>
          </div>
        </div>

        {/* Right Output: Settlement Breakdown & Printable Voucher */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <span className="text-[11px] font-bold text-sky-600 uppercase tracking-wider">
                Settlement Outcome
              </span>
              <h2 className="text-xl font-black text-slate-900">
                Statutory Pro-Rata Refund Voucher
              </h2>
            </div>
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center space-x-1"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Voucher</span>
            </button>
          </div>

          {/* 10-Day Statutory Deadline Alert Box */}
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                Statutory 10-Day Disbursement Deadline
              </span>
              <div className="text-lg font-black text-emerald-950 mt-0.5">
                Must be disbursed by:{" "}
                {new Date(calculation.statutoryDeadlineDate).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </div>
              <p className="text-[11px] text-emerald-700">
                Notice received: {calculation.leavingNoticeDate} • Days attended:{" "}
                <strong>{calculation.daysAttended} of {calculation.totalCourseDurationDays} days</strong>
              </p>
            </div>
            <div className="text-right hidden sm:block">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-200 text-emerald-900">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                Within Law
              </span>
            </div>
          </div>

          {/* Step-by-Step Mathematical Calculation Breakdown */}
          <div className="space-y-2 text-xs border border-slate-100 rounded-2xl p-4 bg-slate-50/60">
            <div className="flex justify-between py-1 border-b border-slate-200 text-slate-600">
              <span>Gross Course Fee:</span>
              <span className="font-semibold text-slate-900">
                ₹{calculation.totalCourseFee.toLocaleString("en-IN")}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-200 text-slate-600">
              <span>Less: Non-Refundable Registration Fee (Capped):</span>
              <span className="font-semibold text-slate-800">
                -₹{calculation.nonRefundableRegCap.toLocaleString("en-IN")}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-200 text-slate-600">
              <span>Less: Study Material Handed Over:</span>
              <span className="font-semibold text-slate-800">
                -₹{calculation.studyMaterialCostDeduction.toLocaleString("en-IN")}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-200 text-slate-600 font-medium">
              <span>Applicable Tuition Base for Pro-Rata:</span>
              <span className="font-bold text-slate-900">
                ₹{calculation.applicableTuitionBase.toLocaleString("en-IN")}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-200 text-slate-600">
              <span>
                Tuition Consumed ({calculation.daysAttended} days @ ₹{calculation.proRataTuitionPerDay}/day):
              </span>
              <span className="font-bold text-slate-800">
                ₹{calculation.tuitionFeeConsumed.toLocaleString("en-IN")}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-200 text-slate-600 font-bold">
              <span>Total Retained by Institute (Tuition + Reg + Material):</span>
              <span className="text-slate-900">
                ₹{(
                  calculation.nonRefundableRegCap +
                  calculation.studyMaterialCostDeduction +
                  calculation.tuitionFeeConsumed
                ).toLocaleString("en-IN")}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-200 text-slate-600">
              <span>Total Paid by Parent So Far:</span>
              <span className="font-bold text-emerald-700">
                ₹{calculation.totalPaidSoFar.toLocaleString("en-IN")}
              </span>
            </div>

            {/* Net Payable Highlight */}
            <div className="flex justify-between pt-2 text-sm font-black text-slate-900 bg-sky-50 -mx-4 -mb-4 p-4 rounded-b-2xl border-t border-sky-100">
              <div>
                <span className="text-sky-900">Net Refund Payable to Parent:</span>
                <p className="text-[11px] font-normal text-sky-700">
                  Includes 18% GST reversal adjustment on unconsumed tuition
                </p>
              </div>
              <div className="text-2xl font-black text-sky-950">
                ₹{calculation.netRefundPayable.toLocaleString("en-IN")}
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-100 rounded-xl text-center text-xs text-slate-500 font-medium">
            Authorized by {APP_CONFIG.clientName} Accounts Section • Rajasthan Centres
          </div>
        </div>
      </div>
    </div>
  );
};
