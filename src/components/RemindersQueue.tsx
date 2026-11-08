"use client";

import React, { useState } from "react";
import { ReminderNotification, UnmatchedPayment } from "@/types";
import {
  BellRing,
  BellOff,
  CheckCircle2,
  Clock,
  MessageSquare,
  AlertOctagon,
  Search,
  Check,
  Building,
} from "lucide-react";

interface RemindersQueueProps {
  reminders: ReminderNotification[];
  unmatchedPayments: UnmatchedPayment[];
}

export const RemindersQueue: React.FC<RemindersQueueProps> = ({
  reminders: initialReminders,
  unmatchedPayments: initialUnmatched,
}) => {
  const [reminders, setReminders] = useState<ReminderNotification[]>(initialReminders);
  const [unmatched, setUnmatched] = useState<UnmatchedPayment[]>(initialUnmatched);
  const [languageFilter, setLanguageFilter] = useState<"BOTH" | "HI" | "EN">("BOTH");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "SCHEDULED" | "CANCELLED_ON_PAYMENT">("ALL");

  const filteredReminders = reminders.filter((r) => {
    if (statusFilter !== "ALL" && r.status !== statusFilter) return false;
    return true;
  });

  const handleResolveUnmatched = (id: string, action: "MATCHED" | "REFUNDED") => {
    setUnmatched((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: action } : item))
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-semibold mb-3 border border-sky-500/30">
          <BellRing className="w-3.5 h-3.5" />
          <span>Automated Reminders & Exception Resolution Queue</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
          Bilingual Reminders & Stop-on-Payment Engine
        </h1>
        <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-3xl">
          Dispatches SMS and WhatsApp reminders in Hindi or English (3 days before, on due date, and 5 days overdue). The moment an instalment is paid, scheduled reminders are immediately halted.
        </p>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Total Triggers Created
          </span>
          <div className="text-2xl font-black text-slate-900 mt-1">{reminders.length}</div>
          <p className="text-[11px] text-slate-500 mt-1">Pre-due, Due Date & Post-due</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
            Scheduled (Active)
          </span>
          <div className="text-2xl font-black text-amber-700 mt-1">
            {reminders.filter((r) => r.status === "SCHEDULED").length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Awaiting due dates</p>
        </div>

        <div className="bg-emerald-50/70 p-5 rounded-2xl border border-emerald-200 shadow-sm">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
            Stopped on Payment
          </span>
          <div className="text-2xl font-black text-emerald-800 mt-1">
            {reminders.filter((r) => r.status === "CANCELLED_ON_PAYMENT").length}
          </div>
          <p className="text-[11px] text-emerald-700 mt-1 font-semibold">
            Halted immediately upon fee clearance
          </p>
        </div>

        <div className="bg-rose-50/70 p-5 rounded-2xl border border-rose-200 shadow-sm">
          <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">
            Unmatched Bank Transfers
          </span>
          <div className="text-2xl font-black text-rose-800 mt-1">
            {unmatched.filter((u) => u.status === "PENDING_INVESTIGATION").length}
          </div>
          <p className="text-[11px] text-rose-600 mt-1">In accounts investigation queue</p>
        </div>
      </div>

      {/* Unmatched Payments Accounts Queue (Directly required in brief) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <AlertOctagon className="w-4 h-4 text-rose-600" />
              <span>Unmatched Payments Accounts Queue</span>
            </h2>
            <p className="text-xs text-slate-500">
              Per brief: Unmatched bank transfers go to this queue instead of arbitrarily marking students paid
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {unmatched.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {item.referenceNo}
                  </span>
                  <span className="text-xs font-bold text-emerald-800">
                    ₹{item.amount.toLocaleString("en-IN")}
                  </span>
                  <span className="text-xs text-slate-400">• Received on {item.date}</span>
                </div>
                <p className="text-xs text-slate-700 font-medium mt-1">
                  Bank Narration: <span className="font-mono text-slate-900">{item.bankNarration}</span>
                </p>
                {item.detectedStudentHint && (
                  <p className="text-[11px] text-sky-700 font-semibold mt-0.5">
                    Suggested Match: {item.detectedStudentHint}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                {item.status === "PENDING_INVESTIGATION" ? (
                  <>
                    <button
                      onClick={() => handleResolveUnmatched(item.id, "MATCHED")}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center space-x-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Confirm & Match Student</span>
                    </button>
                    <button
                      onClick={() => handleResolveUnmatched(item.id, "REFUNDED")}
                      className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-semibold transition"
                    >
                      Reject / Refund
                    </button>
                  </>
                ) : (
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      item.status === "MATCHED"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    Resolved ({item.status})
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reminders Log Table with Stop-on-Payment Status */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Bilingual Reminder Notifications Log
            </h2>
            <p className="text-xs text-slate-500">
              Live status of triggers across all students & instalments
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <select
              aria-label="Filter Reminders Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700"
            >
              <option value="ALL">All Statuses</option>
              <option value="SCHEDULED">Scheduled Only</option>
              <option value="CANCELLED_ON_PAYMENT">Halted on Payment Only</option>
            </select>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredReminders.map((rem) => {
            const isCancelled = rem.status === "CANCELLED_ON_PAYMENT";

            return (
              <div key={rem.id} className="py-4 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-slate-500">{rem.id}</span>
                    <span className="text-xs font-bold text-slate-800">
                      Student: {rem.studentId}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">({rem.parentPhone})</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 uppercase">
                      {rem.type}
                    </span>
                  </div>

                  <div>
                    {isCancelled ? (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                        <BellOff className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Cancelled on Payment</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>Scheduled for {rem.scheduledDate}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Dual Message Cards: Hindi & English */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  {/* Hindi Card */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                    <span className="text-[10px] font-bold uppercase text-sky-700 tracking-wider">
                      हिंदी संदेश (SMS / WhatsApp)
                    </span>
                    <p className="text-slate-800 mt-1 leading-relaxed font-sans">{rem.messageHindi}</p>
                  </div>

                  {/* English Card */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                    <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                      English Message (SMS / WhatsApp)
                    </span>
                    <p className="text-slate-800 mt-1 leading-relaxed">{rem.messageEnglish}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
