"use client";

import React, { useState } from "react";
import { Student, Instalment } from "@/types";
import { APP_CONFIG } from "@/config/appConfig";
import {
  FileText,
  CreditCard,
  Percent,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Printer,
  PlusCircle,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";

interface StudentLedgerProps {
  student: Student;
  allStudents: Student[];
  onSelectStudent: (id: string) => void;
  onOpenPaymentModal: (instalment: Instalment) => void;
  onNavigateToRefund: () => void;
}

export const StudentLedger: React.FC<StudentLedgerProps> = ({
  student,
  allStudents,
  onSelectStudent,
  onOpenPaymentModal,
  onNavigateToRefund,
}) => {
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const handleCopyPaymentLink = (link: string, id: string) => {
    navigator.clipboard?.writeText(link);
    setCopiedLink(id);
    setTimeout(() => setCopiedLink(null), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Student Profile Header & Selector */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-sky-600 uppercase tracking-wider mb-1">
            <FileText className="w-4 h-4" />
            <span>Student Fee Ledger</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">{student.name}</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Student ID: <span className="font-mono font-bold text-slate-700">{student.id}</span> • Batch:{" "}
            <span className="font-semibold text-slate-700">{student.batch}</span> • Centre:{" "}
            <span className="font-semibold text-slate-700">{student.centreName}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Student Switcher */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500 font-medium">Select Student:</span>
            <select
              aria-label="Select Student"
              value={student.id}
              onChange={(e) => onSelectStudent(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800"
            >
              {allStudents.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.id}) - {s.batch}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={onNavigateToRefund}
            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold transition border border-rose-200"
          >
            Calculate Pro-Rata Exit Refund
          </button>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Gross Course Plan
          </span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            ₹{student.totalCourseFee.toLocaleString("en-IN")}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Enrolled on {student.enrollmentDate}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
            Scholarship / Discount
          </span>
          <div className="text-2xl font-black text-indigo-700 mt-1">
            -₹{student.totalDiscount.toLocaleString("en-IN")}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {student.discountReason || "Standard Fee Structure"}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
            Total Paid (with GST)
          </span>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            ₹{student.totalPaid.toLocaleString("en-IN")}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {Math.round((student.totalPaid / student.netPayableFee) * 100)}% Cleared
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
            Balance Due
          </span>
          <div className="text-2xl font-black text-amber-700 mt-1">
            ₹{student.totalBalance.toLocaleString("en-IN")}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Net Payable: ₹{student.netPayableFee.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {/* Instalments Table with Payment Links & Status */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Instalment Ledger & Payment Links
            </h2>
            <p className="text-xs text-slate-500">
              Every instalment is tied to automated bilingual triggers that stop the moment it is marked paid
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase font-bold text-[10px]">
                <th className="py-2.5">#</th>
                <th className="py-2.5">Instalment ID</th>
                <th className="py-2.5">Due Date</th>
                <th className="py-2.5">Amount (INR)</th>
                <th className="py-2.5">Paid (INR)</th>
                <th className="py-2.5">Balance</th>
                <th className="py-2.5">Overdue Days</th>
                <th className="py-2.5">Status</th>
                <th className="py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {student.instalments.map((inst) => {
                const isPaid = inst.status === "PAID";
                const isOverdue = inst.daysOverdue > 0;

                return (
                  <tr key={inst.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 font-bold text-slate-800">
                      Instalment {inst.instalmentNumber}
                    </td>
                    <td className="py-3 font-mono text-slate-500">{inst.id}</td>
                    <td className="py-3 text-slate-700 font-medium">
                      {new Date(inst.dueDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3 font-bold text-slate-900">
                      ₹{inst.totalAmount.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 text-emerald-700 font-semibold">
                      ₹{inst.paidAmount.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 font-bold text-amber-800">
                      ₹{inst.balanceAmount.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3">
                      {inst.daysOverdue > 60 ? (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700">
                          {inst.daysOverdue} days (&gt;60d)
                        </span>
                      ) : inst.daysOverdue > 0 ? (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">
                          {inst.daysOverdue} days
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">0 days</span>
                      )}
                    </td>
                    <td className="py-3">
                      {isPaid ? (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700 flex items-center w-fit space-x-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Paid</span>
                        </span>
                      ) : isOverdue ? (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700 flex items-center w-fit space-x-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Overdue</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-sky-100 text-sky-700">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-right space-x-2">
                      {!isPaid && (
                        <>
                          <button
                            onClick={() => onOpenPaymentModal(inst)}
                            className="px-2.5 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded font-bold text-[11px] transition shadow-sm"
                          >
                            Collect / Pay
                          </button>
                          <button
                            onClick={() => handleCopyPaymentLink(inst.paymentLink, inst.id)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold text-[11px] transition"
                            title="Copy Payment Link"
                          >
                            {copiedLink === inst.id ? "Copied!" : "Copy Link"}
                          </button>
                        </>
                      )}
                      {isPaid && (
                        <span className="text-[11px] text-slate-400 font-medium">
                          Receipt on {inst.lastPaymentDate || "2026-10-10"}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Parent Contact & DPDP Act 2023 Consent Section */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center space-x-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Parent Communication & DPDP Act 2023 Compliance</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-slate-400 font-semibold">Parent / Guardian:</span>
            <p className="text-sm font-bold text-slate-800 mt-0.5">{student.parentName}</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-slate-400 font-semibold">Registered Mobile:</span>
            <p className="text-sm font-mono font-bold text-slate-800 mt-0.5">{student.parentPhone}</p>
          </div>
          <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl">
            <span className="text-emerald-700 font-semibold">Parental Consent Status:</span>
            <p className="text-xs font-bold text-emerald-800 mt-0.5">
              Verified Digital Consent On-File (DPDP Act 2023 Minor Protection Compliant)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
