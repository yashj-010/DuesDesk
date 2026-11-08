"use client";

import React, { useState, useEffect } from "react";
import { Student, Instalment, ReminderNotification, UnmatchedPayment, CounsellorTask } from "@/types";
import { Language } from "@/lib/i18n";
import { APP_CONFIG } from "@/config/appConfig";
import { Navbar, ActiveTab } from "@/components/Navbar";
import { ParentPortal } from "@/components/ParentPortal";
import { AccountsDashboard } from "@/components/AccountsDashboard";
import { StudentLedger } from "@/components/StudentLedger";
import { RefundCalculator } from "@/components/RefundCalculator";
import { RemindersQueue } from "@/components/RemindersQueue";
import { DropoutRiskQueue } from "@/components/DropoutRiskQueue";
import { BulkUploadModal } from "@/components/BulkUploadModal";
import { PaymentModal } from "@/components/PaymentModal";
import { Loader2, Sparkles, BellOff } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("parent");
  const [language, setLanguage] = useState<Language>("en");
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("STU-0587");
  const [reminders, setReminders] = useState<ReminderNotification[]>([]);
  const [unmatchedPayments, setUnmatchedPayments] = useState<UnmatchedPayment[]>([]);
  const [counsellorTasks, setCounsellorTasks] = useState<CounsellorTask[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modal state
  const [payingInstalment, setPayingInstalment] = useState<{
    instalment: Instalment;
    student: Student;
  } | null>(null);

  // Global notification banner
  const [systemAlert, setSystemAlert] = useState<{
    type: "SUCCESS" | "INFO";
    message: string;
    details?: string;
  } | null>(null);

  const fetchData = async () => {
    try {
      const [stuRes, remRes, riskRes] = await Promise.all([
        fetch("/api/students"),
        fetch("/api/reminders"),
        fetch("/api/risk"),
      ]);

      const stuData = await stuRes.json();
      const remData = await remRes.json();
      const riskData = await riskRes.json();

      if (stuData.students) {
        setStudents(stuData.students);
      }
      if (remData.all) {
        setReminders(remData.all);
        setUnmatchedPayments(remData.unmatchedPayments || []);
      }
      if (riskData.tasks) {
        setCounsellorTasks(riskData.tasks);
      }
    } catch (err) {
      console.error("Failed to load data", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const activeStudent =
    students.find((s) => s.id === selectedStudentId) || students[0];

  const handleOpenPayment = (instalment: Instalment) => {
    const student = students.find((s) => s.id === instalment.studentId) || activeStudent;
    if (student) {
      setPayingInstalment({ instalment, student });
    }
  };

  const handlePaymentComplete = (data: {
    transaction: any;
    cancelledRemindersCount: number;
  }) => {
    setSystemAlert({
      type: "SUCCESS",
      message: `Payment of ₹${data.transaction.amount.toLocaleString("en-IN")} confirmed (Receipt: ${data.transaction.receiptNumber})`,
      details: `Stop-on-Payment rule applied: ${data.cancelledRemindersCount} pending reminders were instantly cancelled.`,
    });
    fetchData();
    setTimeout(() => setSystemAlert(null), 6000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 text-sky-600 animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-600">
            Initializing {APP_CONFIG.name} Engine...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Global Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        language={language}
        setLanguage={setLanguage}
        selectedStudentId={selectedStudentId}
        setSelectedStudentId={setSelectedStudentId}
        students={students.map((s) => ({ id: s.id, name: s.name, batch: s.batch }))}
      />

      {/* Global Toast / System Alert */}
      {systemAlert && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 w-full">
          <div className="p-4 bg-emerald-600 text-white rounded-2xl shadow-lg flex items-start space-x-3 transition-all animate-in fade-in">
            <BellOff className="w-5 h-5 shrink-0 mt-0.5 text-emerald-200" />
            <div className="flex-1">
              <p className="text-xs font-bold">{systemAlert.message}</p>
              {systemAlert.details && (
                <p className="text-[11px] text-emerald-100 mt-0.5 font-medium">
                  {systemAlert.details}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Tab Screen Content */}
      <main className="flex-1">
        {activeTab === "parent" && activeStudent && (
          <ParentPortal
            student={activeStudent}
            language={language}
            onOpenPaymentModal={handleOpenPayment}
          />
        )}

        {activeTab === "accounts" && (
          <AccountsDashboard
            students={students}
            onSelectStudent={(id) => setSelectedStudentId(id)}
            onNavigateToTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === "ledger" && activeStudent && (
          <StudentLedger
            student={activeStudent}
            allStudents={students}
            onSelectStudent={(id) => setSelectedStudentId(id)}
            onOpenPaymentModal={handleOpenPayment}
            onNavigateToRefund={() => setActiveTab("refund")}
          />
        )}

        {activeTab === "refund" && (
          <RefundCalculator
            students={students}
            initialStudentId={selectedStudentId}
          />
        )}

        {activeTab === "reminders" && (
          <RemindersQueue
            reminders={reminders}
            unmatchedPayments={unmatchedPayments}
          />
        )}

        {activeTab === "risk" && (
          <DropoutRiskQueue
            tasks={counsellorTasks}
            students={students}
          />
        )}

        {activeTab === "upload" && (
          <BulkUploadModal onUploadSuccess={fetchData} />
        )}
      </main>

      {/* Mock Payment Gateway Modal */}
      {payingInstalment && (
        <PaymentModal
          instalment={payingInstalment.instalment}
          student={payingInstalment.student}
          onClose={() => setPayingInstalment(null)}
          onPaymentComplete={handlePaymentComplete}
        />
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400 no-print">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p className="font-semibold text-slate-600">
            {APP_CONFIG.name} • {APP_CONFIG.clientName} Fee Tracking & Compliance Platform
          </p>
          <p>
            Compliant with Ministry of Education 2024 Coaching Guidelines & DPDP Act 2023 • Rajasthan GSTIN {APP_CONFIG.gstNumber}
          </p>
        </div>
      </footer>
    </div>
  );
}
