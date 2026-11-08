"use client";

import React, { useState } from "react";
import { APP_CONFIG } from "@/config/appConfig";
import {
  FileSpreadsheet,
  Upload,
  CheckCircle,
  AlertCircle,
  FileCheck,
  RefreshCw,
} from "lucide-react";

interface BulkUploadModalProps {
  onUploadSuccess: () => void;
}

export const BulkUploadModal: React.FC<BulkUploadModalProps> = ({ onUploadSuccess }) => {
  const [batchName, setBatchName] = useState<string>("JEE 2027 Morning");
  const [uploadType, setUploadType] = useState<"ATTENDANCE" | "TEST_SCORES">("ATTENDANCE");
  const [label, setLabel] = useState<string>("Nov 2026 Monthly");
  const [rawCsvText, setRawCsvText] = useState<string>(
    "STU-0412,27,28\nSTU-0587,22,28\nSTU-0219,26,28\nSTU-0344,28,28"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    success: boolean;
    message: string;
    errors?: string[];
  } | null>(null);

  const handleTemplateSwitch = (type: "ATTENDANCE" | "TEST_SCORES") => {
    setUploadType(type);
    if (type === "ATTENDANCE") {
      setLabel("Nov 2026 Monthly Attendance");
      setRawCsvText("STU-0412,27,28\nSTU-0587,22,28\nSTU-0219,26,28\nSTU-0344,28,28");
    } else {
      setLabel("JEE Main All-Rajasthan Mock 4");
      setRawCsvText("STU-0412,275,300\nSTU-0587,160,300\nSTU-0219,650,720\nSTU-0344,240,300");
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setUploadStatus(null);

    try {
      // Parse CSV text
      const lines = rawCsvText.trim().split("\n");
      const records = lines.map((line) => {
        const parts = line.split(",").map((p) => p.trim());
        return {
          studentId: parts[0],
          value1: Number(parts[1]),
          value2: parts[2] ? Number(parts[2]) : undefined,
          label,
        };
      });

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batchName,
          type: uploadType,
          records,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setUploadStatus({
        success: true,
        message: data.message,
        errors: data.result?.errors,
      });

      onUploadSuccess();
    } catch (err: unknown) {
      setUploadStatus({
        success: false,
        message: err instanceof Error ? err.message : "Upload processing failed",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-semibold mb-3 border border-sky-500/30">
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>Batch Operations Console</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
          Bulk Upload of Attendance & Test Scores
        </h1>
        <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
          Instantly imports Excel/CSV data for batches across all 4 centres. Feeds into the AI dropout-risk engine and parent portal in real-time.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        {/* Toggle Mode */}
        <div className="flex space-x-2 mb-6 p-1 bg-slate-100 rounded-2xl w-fit text-xs font-bold">
          <button
            onClick={() => handleTemplateSwitch("ATTENDANCE")}
            className={`px-4 py-2 rounded-xl transition ${
              uploadType === "ATTENDANCE"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Monthly Attendance CSV
          </button>
          <button
            onClick={() => handleTemplateSwitch("TEST_SCORES")}
            className={`px-4 py-2 rounded-xl transition ${
              uploadType === "TEST_SCORES"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Batch Test Scores CSV
          </button>
        </div>

        <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Target Batch:</label>
              <select
                aria-label="Target Batch"
                value={batchName}
                onChange={(e) => setBatchName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
              >
                {APP_CONFIG.batches.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Evaluation Label / Test Name:
              </label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-700">
                CSV Data Payload (Student ID, Score/Attended, Max/Total):
              </label>
              <span className="text-[11px] text-slate-400">Comma-separated per line</span>
            </div>
            <textarea
              rows={5}
              value={rawCsvText}
              onChange={(e) => setRawCsvText(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-mono text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          {uploadStatus && (
            <div
              className={`p-3 rounded-xl flex items-start space-x-2 text-xs ${
                uploadStatus.success
                  ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                  : "bg-rose-50 border border-rose-200 text-rose-800"
              }`}
            >
              {uploadStatus.success ? (
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-bold">{uploadStatus.message}</p>
                {uploadStatus.errors && uploadStatus.errors.length > 0 && (
                  <p className="text-[11px] mt-0.5 text-rose-600">
                    Errors: {uploadStatus.errors.join(", ")}
                  </p>
                )}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            <span>{isSubmitting ? "Processing CSV..." : "Process & Import Records"}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
