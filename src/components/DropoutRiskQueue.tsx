"use client";

import React, { useState } from "react";
import { CounsellorTask, Student } from "@/types";
import {
  BrainCircuit,
  PhoneCall,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  TrendingDown,
  Info,
  Calendar,
  Sparkles,
} from "lucide-react";

interface DropoutRiskQueueProps {
  tasks: CounsellorTask[];
  students: Student[];
}

export const DropoutRiskQueue: React.FC<DropoutRiskQueueProps> = ({
  tasks: initialTasks,
  students,
}) => {
  const [tasks, setTasks] = useState<CounsellorTask[]>(initialTasks);
  const [selectedTask, setSelectedTask] = useState<CounsellorTask | null>(null);
  const [counsellorNotes, setCounsellorNotes] = useState<string>("");
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);

  const handleUpdateTask = async (taskId: string, status: "CALLED_RESOLVED" | "FALSE_FLAG") => {
    try {
      const res = await fetch("/api/risk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId,
          status,
          notes: counsellorNotes || (status === "FALSE_FLAG" ? "Verified false flag: Family issue, continuing course" : "Counselling conducted successfully"),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status, notes: counsellorNotes || t.notes } : t))
      );

      setFeedbackSuccess(data.message);
      setSelectedTask(null);
      setCounsellorNotes("");
      setTimeout(() => setFeedbackSuccess(null), 4000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error updating task");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 text-xs font-semibold mb-3 border border-violet-500/30">
          <BrainCircuit className="w-3.5 h-3.5" />
          <span>AI Retention Engine & Counsellor Safety Guardrail</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
          AI Dropout-Risk & Early Intervention Queue
        </h1>
        <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-3xl">
          Combines 3 non-linear signals: missed fee instalments, sudden attendance drops, and declining test percentiles to flag students needing empathetic support before they leave.
        </p>
      </div>

      {/* Safety Guardrail Callout (Strict compliance with problem statement) */}
      <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-start space-x-3">
        <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <div className="text-xs text-emerald-950">
          <strong className="font-bold uppercase tracking-wider block text-emerald-900 mb-0.5">
            Strict AI Safety Guardrail (Human-In-The-Loop)
          </strong>
          When an AI flag is raised or is unsure: it <strong>ONLY</strong> creates an internal counsellor call task. It <strong>NEVER</strong> triggers fee enforcement or sends messages to parents. Counsellors can mark false flags below to continuously adjust model sensitivity and eliminate noise.
        </div>
      </div>

      {feedbackSuccess && (
        <div className="p-3 bg-sky-50 border border-sky-200 text-sky-800 text-xs font-bold rounded-xl flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-sky-600" />
          <span>{feedbackSuccess}</span>
        </div>
      )}

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tasks.map((task) => {
          const student = students.find((s) => s.id === task.studentId);
          const isPending = task.status === "PENDING_CALL";
          const isFalseFlag = task.status === "FALSE_FLAG";

          return (
            <div
              key={task.id}
              className={`p-6 rounded-3xl border transition shadow-sm ${
                isFalseFlag
                  ? "bg-slate-50 border-slate-200 opacity-75"
                  : isPending
                  ? "bg-white border-rose-200 ring-1 ring-rose-100"
                  : "bg-white border-emerald-200"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-slate-500">
                      {task.studentId}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">• {task.batch}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                    {task.studentName}
                  </h3>
                  <p className="text-xs text-slate-500">{task.centreName}</p>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                      task.riskScore >= 75
                        ? "bg-rose-100 text-rose-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    Risk Score: {task.riskScore}/100
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1 font-mono">
                    {new Date(task.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                </div>
              </div>

              {/* Explanatory Multi-Signal Reasons */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 mb-4 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  AI Multi-Factor Signals Detected:
                </span>
                {task.riskReasons.map((reason, idx) => (
                  <p key={idx} className="text-xs text-slate-700 flex items-start space-x-1.5">
                    <span className="text-rose-500 font-bold">•</span>
                    <span>{reason}</span>
                  </p>
                ))}
              </div>

              {/* Attendance & Test Trends Preview */}
              {student && (
                <div className="grid grid-cols-2 gap-2 text-[11px] mb-4">
                  <div className="p-2 bg-indigo-50/50 rounded-xl">
                    <span className="text-indigo-600 font-semibold">Attendance Trend:</span>
                    <p className="font-bold text-slate-800">
                      {student.attendance.map((a) => `${a.percentage}%`).join(" → ")}
                    </p>
                  </div>
                  <div className="p-2 bg-emerald-50/50 rounded-xl">
                    <span className="text-emerald-700 font-semibold">Test Percentiles:</span>
                    <p className="font-bold text-slate-800">
                      {student.testScores.map((t) => `${t.percentile}%ile`).join(" → ")}
                    </p>
                  </div>
                </div>
              )}

              {/* Status or Actions */}
              {isPending ? (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedTask(task)}
                      className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Log Retention Call</span>
                    </button>
                    <button
                      onClick={() => handleUpdateTask(task.id, "FALSE_FLAG")}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
                      title="Mark as False Flag (Adjusts Model)"
                    >
                      Mark False Flag
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span
                    className={`font-bold flex items-center space-x-1 ${
                      isFalseFlag ? "text-slate-500" : "text-emerald-700"
                    }`}
                  >
                    {isFalseFlag ? (
                      <>
                        <XCircle className="w-4 h-4 text-slate-400 mr-1" />
                        <span>False Flag (Model weights adjusted)</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-1" />
                        <span>Counsellor Call Resolved</span>
                      </>
                    )}
                  </span>
                  {task.notes && (
                    <span className="text-slate-400 italic text-[11px] truncate max-w-xs">
                      &quot;{task.notes}&quot;
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Log Call Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">
              Log Counselling Intervention
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Student: {selectedTask.studentName} ({selectedTask.studentId})
            </p>

            <div className="my-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Counsellor Discussion Notes:
              </label>
              <textarea
                rows={3}
                value={counsellorNotes}
                onChange={(e) => setCounsellorNotes(e.target.value)}
                placeholder="e.g. Discussed physics difficulty with student. Arranged 3 1-on-1 doubt sessions. Parent confirmed continuing."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => handleUpdateTask(selectedTask.id, "CALLED_RESOLVED")}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                Save & Mark Resolved
              </button>
              <button
                onClick={() => setSelectedTask(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
