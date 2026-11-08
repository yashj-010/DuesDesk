"use client";

import React, { useState } from "react";
import { Instalment, Student } from "@/types";
import { APP_CONFIG } from "@/config/appConfig";
import {
  CreditCard,
  CheckCircle,
  AlertCircle,
  Loader2,
  X,
  BellOff,
  QrCode,
  ShieldCheck,
  Building,
} from "lucide-react";

interface PaymentModalProps {
  instalment: Instalment;
  student: Student;
  onClose: () => void;
  onPaymentComplete: (data: {
    transaction: any;
    cancelledRemindersCount: number;
  }) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  instalment,
  student,
  onClose,
  onPaymentComplete,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<"UPI" | "NET_BANKING" | "CARD">("UPI");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState<{
    success: boolean;
    receiptNo?: string;
    cancelledCount?: number;
    error?: string;
  } | null>(null);

  const amountToPay = instalment.balanceAmount;

  const handleSimulatePayment = async (isSuccess: boolean) => {
    if (!isSuccess) {
      setPaymentResult({
        success: false,
        error: "Bank gateway response: Transaction cancelled or timed out by user.",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: student.id,
          instalmentId: instalment.id,
          amount: amountToPay,
          method: selectedMethod,
          referenceId: `${selectedMethod}/SIM-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Payment recording failed");
      }

      setPaymentResult({
        success: true,
        receiptNo: data.transaction.receiptNumber,
        cancelledCount: data.cancelledRemindersCount,
      });

      onPaymentComplete(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Payment error";
      setPaymentResult({ success: false, error: msg });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-slate-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-2 text-sky-600 text-xs font-bold uppercase tracking-wider mb-1">
          <ShieldCheck className="w-4 h-4" />
          <span>Payment Gateway (Test Mode)</span>
        </div>
        <h3 className="text-xl font-black text-slate-900">
          Pay Instalment #{instalment.instalmentNumber}
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          For {student.name} • {student.centreName}
        </p>

        {/* If payment finished, show success banner & Stop-on-Payment proof */}
        {paymentResult?.success ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-9 h-9" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">Payment Successful!</h4>
            <p className="text-xs text-slate-500 mt-1">
              Receipt No: <strong className="text-slate-800">{paymentResult.receiptNo}</strong>
            </p>
            <p className="text-xs text-slate-500">
              Amount Paid: <strong className="text-slate-800">₹{amountToPay.toLocaleString("en-IN")}</strong> (Includes 18% GST)
            </p>

            {/* Stop-on-Payment Highlight Badge */}
            <div className="mt-4 p-3 bg-sky-50 border border-sky-200 rounded-xl text-left flex items-start space-x-2.5">
              <BellOff className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-sky-900">
                  Automated Reminders Halted
                </p>
                <p className="text-[11px] text-sky-700 mt-0.5">
                  All {paymentResult.cancelledCount || 3} pending reminders for Instalment #{instalment.instalmentNumber} were immediately cancelled. No parent messages will be dispatched.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="mt-6 w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm transition"
            >
              Done & Return
            </button>
          </div>
        ) : (
          <div>
            {/* Amount Banner */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-4 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500">Total Payable Now</span>
                <div className="text-2xl font-black text-slate-900">
                  ₹{amountToPay.toLocaleString("en-IN")}
                </div>
              </div>
              <div className="text-right text-[11px] text-slate-400">
                <span>Base: ₹{(Math.round((amountToPay / 1.18) * 100) / 100).toLocaleString("en-IN")}</span>
                <br />
                <span>GST (18%): ₹{(Math.round(((amountToPay / 1.18) * 0.18) * 100) / 100).toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Payment Mode Selector */}
            <div className="space-y-2 mb-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Select Test Payment Mode
              </span>

              <div
                onClick={() => setSelectedMethod("UPI")}
                className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition ${
                  selectedMethod === "UPI"
                    ? "border-sky-500 bg-sky-50/60 text-sky-900 font-semibold"
                    : "border-slate-200 hover:bg-slate-50 text-slate-700"
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <QrCode className="w-4 h-4 text-sky-600" />
                  <span className="text-xs">UPI (Google Pay, PhonePe, Paytm, BHIM)</span>
                </div>
                <span className="text-[11px] font-bold text-emerald-600">Instant</span>
              </div>

              <div
                onClick={() => setSelectedMethod("NET_BANKING")}
                className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition ${
                  selectedMethod === "NET_BANKING"
                    ? "border-sky-500 bg-sky-50/60 text-sky-900 font-semibold"
                    : "border-slate-200 hover:bg-slate-50 text-slate-700"
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Building className="w-4 h-4 text-sky-600" />
                  <span className="text-xs">Net Banking (SBI, HDFC, ICICI, Axis)</span>
                </div>
                <span className="text-[11px] text-slate-400">Direct</span>
              </div>

              <div
                onClick={() => setSelectedMethod("CARD")}
                className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition ${
                  selectedMethod === "CARD"
                    ? "border-sky-500 bg-sky-50/60 text-sky-900 font-semibold"
                    : "border-slate-200 hover:bg-slate-50 text-slate-700"
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <CreditCard className="w-4 h-4 text-sky-600" />
                  <span className="text-xs">Debit / Credit Card (Visa, RuPay, MasterCard)</span>
                </div>
                <span className="text-[11px] text-slate-400">Secure</span>
              </div>
            </div>

            {/* Error Message */}
            {paymentResult?.error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl mb-4 flex items-center space-x-2 text-xs text-rose-700">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{paymentResult.error}</span>
              </div>
            )}

            {/* Gateway Test Triggers */}
            <div className="space-y-2 mt-5">
              <button
                disabled={isProcessing}
                onClick={() => handleSimulatePayment(true)}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm transition flex items-center justify-center space-x-2 shadow-sm disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying with Bank...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Simulate Successful Payment (Test Mode)</span>
                  </>
                )}
              </button>

              <button
                disabled={isProcessing}
                onClick={() => handleSimulatePayment(false)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 px-4 rounded-xl text-xs transition disabled:opacity-50"
              >
                Simulate Payment Failure
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
