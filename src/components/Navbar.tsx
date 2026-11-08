"use client";

import React from "react";
import { APP_CONFIG } from "@/config/appConfig";
import { Language } from "@/lib/i18n";
import {
  LayoutDashboard,
  Smartphone,
  Calculator,
  BellRing,
  BrainCircuit,
  FileSpreadsheet,
  Globe,
  UserCheck,
  Building2,
  ChevronDown,
} from "lucide-react";

export type ActiveTab =
  | "parent"
  | "accounts"
  | "ledger"
  | "refund"
  | "reminders"
  | "risk"
  | "upload";

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  selectedStudentId: string;
  setSelectedStudentId: (id: string) => void;
  students: Array<{ id: string; name: string; batch: string }>;
}

const TABS: Array<{
  id: ActiveTab;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}> = [
  { id: "parent", label: "Parent Portal", shortLabel: "Parent", icon: Smartphone, badge: "Mobile" },
  { id: "accounts", label: "Dues & Ageing", shortLabel: "Ageing", icon: LayoutDashboard },
  { id: "ledger", label: "Fee Ledger", shortLabel: "Ledger", icon: UserCheck },
  { id: "refund", label: "MoE Refund", shortLabel: "Refund", icon: Calculator },
  { id: "reminders", label: "Reminders", shortLabel: "Reminders", icon: BellRing },
  { id: "risk", label: "AI Risk Queue", shortLabel: "AI Risk", icon: BrainCircuit, badge: "AI" },
  { id: "upload", label: "Bulk CSV", shortLabel: "Upload", icon: FileSpreadsheet },
];

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  language,
  setLanguage,
  selectedStudentId,
  setSelectedStudentId,
  students,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white font-black shadow-md shadow-sky-600/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-extrabold tracking-tight text-slate-900">
                  {APP_CONFIG.name}
                </span>
                <span className="hidden sm:inline-flex px-2 py-0.5 text-[11px] font-bold rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                  {APP_CONFIG.clientName}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden md:block">
                Jaipur Network • 4 Centres • 2,600 Students
              </p>
            </div>
          </div>

          {/* Right Header Controls: Student Selector & Language Switcher */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Quick Student Switcher for Parent Simulation */}
            <div className="flex items-center space-x-1.5 bg-slate-100 rounded-xl p-1 text-xs">
              <span className="text-slate-500 font-semibold px-1.5 hidden md:inline">Student:</span>
              <select
                aria-label="Active Student"
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.id})
                  </option>
                ))}
              </select>
            </div>

            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === "en" ? "hi" : "en")}
              className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition shadow-sm"
              title="Toggle Hindi / English"
            >
              <Globe className="w-3.5 h-3.5 text-sky-600" />
              <span>{language === "en" ? "हिंदी" : "English"}</span>
            </button>
          </div>
        </div>

        {/* Responsive Navigation: Mobile Dropdown (< 1024px) / Desktop Segmented Tabs (>= 1024px) */}
        <div className="py-2.5 border-t border-slate-100">
          {/* Mobile View Dropdown (< 1024px) */}
          <div className="lg:hidden flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Active Console:
            </span>
            <div className="relative flex-1 max-w-xs">
              <select
                aria-label="Select Console Screen"
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value as ActiveTab)}
                className="w-full bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
              >
                {TABS.map((tab, idx) => (
                  <option key={tab.id} value={tab.id}>
                    {idx + 1}. {tab.label} {tab.badge ? `(${tab.badge})` : ""}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Desktop Seamless Segmented Bar (>= 1024px) - Clean, Fits Without Horizontal Scroll */}
          <div className="hidden lg:grid lg:grid-cols-7 gap-1.5 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center justify-center space-x-1.5 px-2.5 py-2 rounded-xl text-xs font-bold transition duration-150 ${
                    isActive
                      ? "bg-white text-sky-700 shadow-sm border border-slate-200/80"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-sky-600" : "text-slate-400"}`} />
                  <span className="truncate">{tab.label}</span>
                  {tab.badge && (
                    <span
                      className={`text-[9px] px-1 py-0.2 rounded font-extrabold ${
                        isActive ? "bg-sky-100 text-sky-800" : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};
