"use client";

import React, { useState } from "react";
import { Student, Instalment } from "@/types";
import { translations, Language } from "@/lib/i18n";
import { APP_CONFIG } from "@/config/appConfig";
import {
  CreditCard,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  FileText,
  TrendingUp,
  Award,
  Clock,
  Printer,
  ChevronRight,
  ShieldCheck,
  Lock,
} from "lucide-react";

interface ParentPortalProps {
  student: Student;
  language: Language;
  onOpenPaymentModal: (instalment: Instalment) => void;
}

export const ParentPortal: React.FC<ParentPortalProps> = ({
  student,
  language,
  onOpenPaymentModal,
}) => {
  const t = translations[language];
  const [activeReceipt, setActiveReceipt] = useState<{
    instalment: Instalment;
    receiptNo: string;
    paidDate: string;
  } | null>(null);

  // Find next unpaid instalment
  const nextPendingInstalment = student.instalments.find(
    (inst) => inst.status !== "PAID"
  );

  const totalOverdueDays = nextPendingInstalment ? nextPendingInstalment.daysOverdue : 0;
  const isOverdue = totalOverdueDays > 0;

  return (
    <div className="max-w-md mx-auto sm:max-w-xl pb-16 pt-4 px-4 sm:px-0">
      {/* Student Badge & Low-end Phone Responsive Card */}
      <div className="bg-white rounded-2xl p-4 mb-4 border border-slate-200/80 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {t.studentLabel}
          </span>
          <h2 className="text-base font-bold text-slate-900">{student.name}</h2>
          <p className="text-xs text-slate-500">
            {student.batch} • {student.centreName}
          </p>
        </div>
        <div className="text-right">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ShieldCheck className="w-3 h-3 mr-1" />
            DPDP Verified
          </span>
          <p className="text-[11px] text-slate-400 mt-0.5">{student.id}</p>
        </div>
      </div>

      {/* 5-SECOND GLANCE CARD (Design constraint: "Parents should understand their dues in five seconds: amount, due date and a pay button, nothing more") */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-sky-950 text-white rounded-3xl p-6 sm:p-7 shadow-xl relative overflow-hidden mb-5">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between mb-2">
          <span className="text-xs sm:text-sm font-medium text-slate-300">
            {t.totalDuesTitle}
          </span>
          {isOverdue && (
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
              <AlertTriangle className="w-3 h-3 text-rose-400" />
              <span>
                {totalOverdueDays} {t.daysOverdue}
              </span>
            </span>
          )}
        </div>

        {/* Big Prominent Amount */}
        <div className="my-2">
          <div className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            ₹{student.totalBalance.toLocaleString("en-IN")}
          </div>
        </div>

        {/* Next Due Date */}
        {nextPendingInstalment ? (
          <div className="flex items-center text-xs sm:text-sm text-slate-300 mb-6">
            <Calendar className="w-4 h-4 mr-1.5 text-sky-400" />
            <span>
              {t.nextDueDate}:{" "}
              <strong className="text-white font-semibold">
                {new Date(nextPendingInstalment.dueDate).toLocaleDateString(
                  language === "hi" ? "hi-IN" : "en-IN",
                  { day: "numeric", month: "short", year: "numeric" }
                )}
              </strong>
            </span>
          </div>
        ) : (
          <div className="flex items-center text-xs sm:text-sm text-emerald-300 mb-6">
            <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-400" />
            <span>{t.allClear}</span>
          </div>
        )}

        {/* 1-Tap Pay Now Button */}
        {nextPendingInstalment && (
          <button
            onClick={() => onOpenPaymentModal(nextPendingInstalment)}
            className="w-full bg-sky-500 hover:bg-sky-400 active:scale-[0.99] text-white font-bold py-3.5 px-6 rounded-xl transition shadow-lg shadow-sky-900/40 flex items-center justify-center space-x-2 text-base"
          >
            <CreditCard className="w-5 h-5" />
            <span>
              {t.payNow} (₹{nextPendingInstalment.balanceAmount.toLocaleString("en-IN")})
            </span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        <div className="flex items-center justify-center space-x-1 text-[11px] text-slate-400 mt-4">
          <Lock className="w-3 h-3 text-sky-400" />
          <span>{t.securePayment}</span>
        </div>
      </div>

      {/* Fee Summary Progress */}
      <div className="bg-white rounded-2xl p-5 mb-5 border border-slate-200/80 shadow-sm">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          {t.paymentSummary}
        </h3>
        <div className="grid grid-cols-3 gap-3 text-center mb-3">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <p className="text-[11px] text-slate-500">{t.courseTotal}</p>
            <p className="text-sm font-bold text-slate-800">
              ₹{student.netPayableFee.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
            <p className="text-[11px] text-emerald-700">{t.paidSoFar}</p>
            <p className="text-sm font-bold text-emerald-800">
              ₹{student.totalPaid.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="bg-amber-50 p-3 rounded-xl border border-amber-100">
            <p className="text-[11px] text-amber-700">{t.balanceRemaining}</p>
            <p className="text-sm font-bold text-amber-800">
              ₹{student.totalBalance.toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
            style={{
              width: `${Math.round(
                (student.totalPaid / student.netPayableFee) * 100
              )}%`,
            }}
          />
        </div>
      </div>

      {/* Instalment Schedule */}
      <div className="bg-white rounded-2xl p-5 mb-5 border border-slate-200/80 shadow-sm">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          {t.instalmentTimeline}
        </h3>
        <div className="space-y-3">
          {student.instalments.map((inst) => {
            const isInstPaid = inst.status === "PAID";
            const isInstOverdue = inst.status === "OVERDUE" || (inst.status === "PARTIALLY_PAID" && inst.daysOverdue > 0);

            return (
              <div
                key={inst.id}
                className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-slate-800">
                      {t.instalment} {inst.instalmentNumber}
                    </span>
                    {isInstPaid ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-700">
                        {t.statusPaid}
                      </span>
                    ) : isInstOverdue ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-700">
                        {inst.daysOverdue} {t.daysOverdue}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-sky-100 text-sky-700">
                        {t.statusPending}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 flex items-center">
                    <Clock className="w-3 h-3 mr-1 text-slate-400" />
                    {t.dueOn}:{" "}
                    {new Date(inst.dueDate).toLocaleDateString(
                      language === "hi" ? "hi-IN" : "en-IN",
                      { day: "numeric", month: "short", year: "numeric" }
                    )}
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-sm font-extrabold text-slate-900">
                    ₹{inst.totalAmount.toLocaleString("en-IN")}
                  </div>

                  {isInstPaid ? (
                    <button
                      onClick={() =>
                        setActiveReceipt({
                          instalment: inst,
                          receiptNo: `RCPT-2026-${inst.id.slice(-4)}`,
                          paidDate: inst.lastPaymentDate || "2026-10-10",
                        })
                      }
                      className="text-xs font-medium text-sky-600 hover:text-sky-800 flex items-center justify-end mt-1"
                    >
                      <FileText className="w-3 h-3 mr-0.5" />
                      <span>{t.viewReceipt}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => onOpenPaymentModal(inst)}
                      className="mt-1 px-3 py-1 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-lg shadow-sm"
                    >
                      {t.payNow}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Attendance & Test Scores (Stops WhatsApp PDF chasing) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          {t.attendanceAndScores}
        </h3>
        <div className="grid grid-cols-2 gap-3 mb-3">
          {/* Attendance Card */}
          <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl">
            <div className="flex items-center text-indigo-700 text-xs font-semibold mb-1">
              <TrendingUp className="w-3.5 h-3.5 mr-1" />
              <span>{t.recentAttendance}</span>
            </div>
            {student.attendance.length > 0 ? (
              <div>
                <p className="text-2xl font-black text-indigo-900">
                  {student.attendance[student.attendance.length - 1].percentage}%
                </p>
                <p className="text-[11px] text-indigo-600">
                  {student.attendance[student.attendance.length - 1].month} (
                  {student.attendance[student.attendance.length - 1].attendedClasses}/
                  {student.attendance[student.attendance.length - 1].totalClasses} classes)
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-400">No data</p>
            )}
          </div>

          {/* Test Scores Card */}
          <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-xl">
            <div className="flex items-center text-emerald-700 text-xs font-semibold mb-1">
              <Award className="w-3.5 h-3.5 mr-1" />
              <span>{t.latestTestRank}</span>
            </div>
            {student.testScores.length > 0 ? (
              <div>
                <p className="text-2xl font-black text-emerald-900">
                  #{student.testScores[student.testScores.length - 1].rank}
                </p>
                <p className="text-[11px] text-emerald-600">
                  {student.testScores[student.testScores.length - 1].percentile}%ile •{" "}
                  {student.testScores[student.testScores.length - 1].score}/
                  {student.testScores[student.testScores.length - 1].maxScore}
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-400">No test data</p>
            )}
          </div>
        </div>
      </div>

      {/* GST Tax Receipt Modal / Printable Dialog */}
      {activeReceipt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <div className="text-center pb-4 border-b border-slate-200">
              <span className="text-xs font-bold text-sky-600 tracking-wider uppercase">
                Official GST Tax Invoice / Fee Receipt
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-1">
                {APP_CONFIG.clientName}
              </h3>
              <p className="text-xs text-slate-500">
                {student.centreName}, Jaipur, Rajasthan
              </p>
              <p className="text-xs font-semibold text-slate-700 mt-0.5">
                GSTIN: {APP_CONFIG.gstNumber} | SAC: 999293 (Coaching Services)
              </p>
            </div>

            <div className="py-4 space-y-2 text-xs border-b border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">Receipt No:</span>
                <span className="font-bold text-slate-800">{activeReceipt.receiptNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date:</span>
                <span className="font-semibold text-slate-800">{activeReceipt.paidDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Student:</span>
                <span className="font-bold text-slate-800">
                  {student.name} ({student.id})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Batch:</span>
                <span className="font-medium text-slate-800">{student.batch}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Parent:</span>
                <span className="font-medium text-slate-800">{student.parentName}</span>
              </div>
            </div>

            {/* GST Breakdown Table */}
            <div className="py-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Instalment #{activeReceipt.instalment.instalmentNumber} Base Fee:</span>
                <span>
                  ₹{(Math.round((activeReceipt.instalment.totalAmount / 1.18) * 100) / 100).toLocaleString(
                    "en-IN"
                  )}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>CGST @ 9%:</span>
                <span>
                  ₹{(Math.round(((activeReceipt.instalment.totalAmount / 1.18) * 0.09) * 100) / 100).toLocaleString(
                    "en-IN"
                  )}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>SGST @ 9%:</span>
                <span>
                  ₹{(Math.round(((activeReceipt.instalment.totalAmount / 1.18) * 0.09) * 100) / 100).toLocaleString(
                    "en-IN"
                  )}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-bold text-slate-900">
                <span>Total Amount Paid (Inclusive of GST):</span>
                <span>₹{activeReceipt.instalment.totalAmount.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div className="flex space-x-3 mt-4">
              <button
                onClick={() => window.print()}
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-1"
              >
                <Printer className="w-4 h-4" />
                <span>Print Receipt</span>
              </button>
              <button
                onClick={() => setActiveReceipt(null)}
                className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
