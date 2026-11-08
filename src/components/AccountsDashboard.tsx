"use client";

import React, { useState } from "react";
import { Student } from "@/types";
import { APP_CONFIG } from "@/config/appConfig";
import { computeAgeingAndKPIs } from "@/lib/ageing";
import {
  TrendingDown,
  Building2,
  Users,
  Download,
  AlertOctagon,
  Calendar,
  Layers,
  ArrowUpRight,
  ShieldAlert,
  FileCode,
  FileSpreadsheet,
  Clock,
  AlertTriangle,
} from "lucide-react";

interface AccountsDashboardProps {
  students: Student[];
  onSelectStudent: (id: string) => void;
  onNavigateToTab: (tab: any) => void;
}

export const AccountsDashboard: React.FC<AccountsDashboardProps> = ({
  students,
  onSelectStudent,
  onNavigateToTab,
}) => {
  const [selectedCentre, setSelectedCentre] = useState<string>("ALL");
  const [selectedBatch, setSelectedBatch] = useState<string>("ALL");

  // Filter students based on UI selections
  const filteredStudents = students.filter((s) => {
    const matchCentre = selectedCentre === "ALL" || s.centreId === selectedCentre;
    const matchBatch = selectedBatch === "ALL" || s.batch === selectedBatch;
    return matchCentre && matchBatch;
  });

  const ageingData = computeAgeingAndKPIs(filteredStudents);
  const overall = ageingData.overall;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner: Financial Target & Leakage Reduction Tracker */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-semibold mb-3 border border-sky-500/30">
            <Building2 className="w-3.5 h-3.5" />
            <span>{APP_CONFIG.clientName} • Dues Management Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Cross-Centre Dues & Ageing Control
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
            Target: Reduce overdue &gt;60 days from 12% to 6%, cut ₹79.2 Lakh annual leakage, and slash month-end reconciliation from 4 days to 1.
          </p>
        </div>

        {/* Tally Export Buttons */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
          <a
            href="/api/tally?format=xml"
            download="Tally_Vouchers_Export.xml"
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            <FileCode className="w-4 h-4" />
            <span>Export Tally XML</span>
          </a>
          <a
            href="/api/tally?format=csv"
            download="Tally_Ledger_Export.csv"
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Tally CSV</span>
          </a>
        </div>
      </div>

      {/* Top KPI Cards (4 Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Billed */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Total Billed Fee
          </span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            ₹{(overall.totalBilled / 100000).toFixed(2)} L
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {overall.totalStudents} Active Students enrolled
          </p>
        </div>

        {/* Total Collected */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
            Total Collected
          </span>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            ₹{(overall.totalCollected / 100000).toFixed(2)} L
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {overall.totalBilled > 0
              ? `${Math.round((overall.totalCollected / overall.totalBilled) * 100)}% Collection Rate`
              : "0%"}
          </p>
        </div>

        {/* Total Overdue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
            Total Active Overdue
          </span>
          <div className="text-2xl font-black text-amber-700 mt-1">
            ₹{(overall.totalOverdueAmount / 100000).toFixed(2)} L
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Pending across 1–60+ days
          </p>
        </div>

        {/* Critical >60 Days Overdue (The Primary Leakage Target) */}
        <div className="bg-rose-50/70 p-5 rounded-2xl border border-rose-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-rose-700 uppercase tracking-wider">
              &gt;60 Days Overdue (Leakage)
            </span>
            <AlertOctagon className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-800 mt-1">
            ₹{(overall.criticalLeakageRiskAmount / 100000).toFixed(2)} L
          </div>
          <p className="text-[11px] text-rose-600 font-semibold mt-1">
            Target slice: Drop from 12% to &lt;6%
          </p>
        </div>
      </div>

      {/* Ageing Buckets Breakdown */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Ageing Pipeline Breakdown
            </h2>
            <p className="text-xs text-slate-500">
              Categorized by overdue age to prioritize automated SMS/WhatsApp triggers
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Current / Not Due */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-600 mb-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Current (Not Due)</span>
            </div>
            <div className="text-xl font-black text-slate-900">
              ₹{(overall.currentNotDue.amount / 1000).toFixed(0)}k
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {overall.currentNotDue.count} instalments scheduled
            </p>
          </div>

          {/* 1 - 30 Days Overdue */}
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-800 mb-1">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>1 – 30 Days Overdue</span>
            </div>
            <div className="text-xl font-black text-amber-900">
              ₹{(overall.overdue1to30.amount / 1000).toFixed(0)}k
            </div>
            <p className="text-[11px] text-amber-700 mt-0.5">
              {overall.overdue1to30.count} instalments • Auto-reminders active
            </p>
          </div>

          {/* 31 - 60 Days Overdue */}
          <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-100">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-orange-800 mb-1">
              <AlertTriangle className="w-3.5 h-3.5 text-orange-600" />
              <span>31 – 60 Days Overdue</span>
            </div>
            <div className="text-xl font-black text-orange-900">
              ₹{(overall.overdue31to60.amount / 1000).toFixed(0)}k
            </div>
            <p className="text-[11px] text-orange-700 mt-0.5">
              {overall.overdue31to60.count} instalments • Escalation stage
            </p>
          </div>

          {/* > 60 Days Overdue */}
          <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-rose-800 mb-1">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
              <span>&gt; 60 Days Overdue</span>
            </div>
            <div className="text-xl font-black text-rose-900">
              ₹{(overall.overdue60Plus.amount / 1000).toFixed(0)}k
            </div>
            <p className="text-[11px] text-rose-700 mt-0.5">
              {overall.overdue60Plus.count} instalments • Critical intervention
            </p>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          {/* Centre Filter */}
          <div className="flex items-center space-x-1.5 text-xs">
            <span className="text-slate-500 font-semibold">Centre:</span>
            <select
              aria-label="Filter Centre"
              value={selectedCentre}
              onChange={(e) => setSelectedCentre(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              <option value="ALL">All 4 Centres (Jaipur)</option>
              {APP_CONFIG.centres.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Batch Filter */}
          <div className="flex items-center space-x-1.5 text-xs">
            <span className="text-slate-500 font-semibold">Batch:</span>
            <select
              aria-label="Filter Batch"
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              <option value="ALL">All Batches</option>
              {APP_CONFIG.batches.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
        </div>

        <span className="text-xs text-slate-400 font-medium">
          Showing {filteredStudents.length} students
        </span>
      </div>

      {/* Cross-Centre Breakdown Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Centre-wise Performance */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-1.5">
              <Building2 className="w-4 h-4 text-sky-600" />
              <span>Dues by Centre (Jaipur Network)</span>
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase font-bold text-[10px]">
                  <th className="py-2">Centre</th>
                  <th className="py-2">Students</th>
                  <th className="py-2">Billed</th>
                  <th className="py-2">Overdue</th>
                  <th className="py-2 text-rose-600">&gt;60d Late</th>
                  <th className="py-2 text-right">Efficiency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ageingData.byCentre.map((c) => (
                  <tr key={c.centreId} className="hover:bg-slate-50 transition">
                    <td className="py-2.5 font-bold text-slate-800">{c.centreName}</td>
                    <td className="py-2.5 text-slate-500">{c.studentCount}</td>
                    <td className="py-2.5 text-slate-700">₹{(c.billedAmount / 1000).toFixed(0)}k</td>
                    <td className="py-2.5 font-semibold text-amber-700">
                      ₹{(c.overdueAmount / 1000).toFixed(0)}k
                    </td>
                    <td className="py-2.5 font-bold text-rose-600">
                      ₹{(c.overdue60PlusAmount / 1000).toFixed(0)}k
                    </td>
                    <td className="py-2.5 text-right">
                      <span className="px-2 py-0.5 rounded-full font-bold text-[11px] bg-slate-100 text-slate-800">
                        {c.collectionEfficiency}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Batch-wise Breakdown */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-1.5">
              <Layers className="w-4 h-4 text-sky-600" />
              <span>Dues by Academic Batch</span>
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase font-bold text-[10px]">
                  <th className="py-2">Batch Name</th>
                  <th className="py-2">Students</th>
                  <th className="py-2">Billed</th>
                  <th className="py-2">Overdue</th>
                  <th className="py-2 text-rose-600">&gt;60d Late</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ageingData.byBatch.map((b) => (
                  <tr key={b.batchName} className="hover:bg-slate-50 transition">
                    <td className="py-2.5 font-bold text-slate-800">{b.batchName}</td>
                    <td className="py-2.5 text-slate-500">{b.studentCount}</td>
                    <td className="py-2.5 text-slate-700">₹{(b.billedAmount / 1000).toFixed(0)}k</td>
                    <td className="py-2.5 font-semibold text-amber-700">
                      ₹{(b.overdueAmount / 1000).toFixed(0)}k
                    </td>
                    <td className="py-2.5 font-bold text-rose-600">
                      ₹{(b.overdue60PlusAmount / 1000).toFixed(0)}k
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Student Quick Action Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-3">
          Students & Overdue Action Ledger
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase font-bold text-[10px]">
                <th className="py-2.5">Student ID</th>
                <th className="py-2.5">Name</th>
                <th className="py-2.5">Batch</th>
                <th className="py-2.5">Centre</th>
                <th className="py-2.5">Total Balance</th>
                <th className="py-2.5">Overdue Days</th>
                <th className="py-2.5">AI Risk</th>
                <th className="py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((s) => {
                let maxOverdue = 0;
                for (const inst of s.instalments) {
                  if (inst.status !== "PAID" && inst.daysOverdue > maxOverdue) {
                    maxOverdue = inst.daysOverdue;
                  }
                }

                return (
                  <tr key={s.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 font-mono font-bold text-slate-600">{s.id}</td>
                    <td className="py-3 font-bold text-slate-900">{s.name}</td>
                    <td className="py-3 text-slate-600">{s.batch}</td>
                    <td className="py-3 text-slate-500">{s.centreName}</td>
                    <td className="py-3 font-black text-slate-900">
                      ₹{s.totalBalance.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3">
                      {maxOverdue > 60 ? (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700">
                          {maxOverdue}d (&gt;60d)
                        </span>
                      ) : maxOverdue > 0 ? (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">
                          {maxOverdue}d
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                          Current
                        </span>
                      )}
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          s.dropoutRiskLevel === "HIGH"
                            ? "bg-rose-100 text-rose-700"
                            : s.dropoutRiskLevel === "MODERATE"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {s.dropoutRiskScore}/100 ({s.dropoutRiskLevel})
                      </span>
                    </td>
                    <td className="py-3 text-right space-x-2">
                      <button
                        onClick={() => {
                          onSelectStudent(s.id);
                          onNavigateToTab("ledger");
                        }}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-semibold text-[11px] transition"
                      >
                        Ledger
                      </button>
                      <button
                        onClick={() => {
                          onSelectStudent(s.id);
                          onNavigateToTab("refund");
                        }}
                        className="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded font-semibold text-[11px] transition"
                      >
                        Refund Calc
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
