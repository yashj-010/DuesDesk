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
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white font-black shadow-sm">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold tracking-tight text-slate-900">
                  {APP_CONFIG.name}
                </span>
                <span className="hidden sm:inline-flex px-2 py-0.5 text-xs font-semibold rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                  {APP_CONFIG.clientName}
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden md:block">
                Jaipur Network (4 Centres • 2,600 Students)
              </p>
            </div>
          </div>

          {/* Right Header Controls: Student Selector (for Parent View) & Language Switcher */}
          <div className="flex items-center space-x-3">
            {/* Quick Student Switcher for Parent Simulation */}
            <div className="flex items-center space-x-1.5 bg-slate-100 rounded-lg p-1 text-xs">
              <span className="text-slate-500 font-medium px-1.5 hidden sm:inline">Active Student:</span>
              <select
                aria-label="Active Student"
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="bg-white border border-slate-200 rounded px-2 py-1 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500"
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
              className="inline-flex items-center space-x-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition shadow-sm"
              title="Toggle Hindi / English"
            >
              <Globe className="w-3.5 h-3.5 text-sky-600" />
              <span>{language === "en" ? "हिंदी" : "English"}</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center space-x-1 overflow-x-auto py-2 border-t border-slate-100 scrollbar-none text-xs sm:text-sm">
          <button
            onClick={() => setActiveTab("parent")}
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
              activeTab === "parent"
                ? "bg-sky-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>1. Parent Portal (Mobile)</span>
          </button>

          <button
            onClick={() => setActiveTab("accounts")}
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
              activeTab === "accounts"
                ? "bg-sky-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>2. Dues & Ageing Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab("ledger")}
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
              activeTab === "ledger"
                ? "bg-sky-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>3. Student Fee Ledger</span>
          </button>

          <button
            onClick={() => setActiveTab("refund")}
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
              activeTab === "refund"
                ? "bg-sky-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>4. MoE 2024 Refund Calculator</span>
          </button>

          <button
            onClick={() => setActiveTab("reminders")}
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
              activeTab === "reminders"
                ? "bg-sky-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <BellRing className="w-4 h-4" />
            <span>5. Reminders & Stop-on-Payment</span>
          </button>

          <button
            onClick={() => setActiveTab("risk")}
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
              activeTab === "risk"
                ? "bg-sky-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <BrainCircuit className="w-4 h-4" />
            <span>6. AI Dropout Risk Queue</span>
          </button>

          <button
            onClick={() => setActiveTab("upload")}
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
              activeTab === "upload"
                ? "bg-sky-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>7. Bulk CSV Upload</span>
          </button>
        </div>
      </div>
    </header>
  );
};
