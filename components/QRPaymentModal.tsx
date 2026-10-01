"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Smartphone,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { paymentsApi } from "@/lib/api/payments";
import { formatCurrency } from "@/lib/utils";
import Modal from "./Modal";

// ─── Constants ───────────────────────────────────────────────────────────────
const POLL_INTERVAL_MS = 3000;   // check status every 3 s
const QR_TTL_SECONDS   = 15 * 60; // 15-minute countdown

// ─── Bank options ────────────────────────────────────────────────────────────
const BANKS = [
  { code: "BCEL",   name: "BCEL One",   color: "#1d4e89" },
  { code: "JDB",    name: "JDB Bank",   color: "#c0392b" },
  { code: "LDB",    name: "LDB",        color: "#16a085" },
  { code: "STB",    name: "STB Bank",   color: "#8e44ad" },
  { code: "MMONEY", name: "M-Money",    color: "#e67e22" },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderAmount: number;
  /** Called when payment is confirmed as SUCCESS */
  onPaymentSuccess: () => void;
}

type Phase = "bank-select" | "loading" | "qr-display" | "paid" | "failed" | "expired";

function useCountdown(seconds: number, active: boolean) {
  const [remaining, setRemaining] = useState(seconds);
  useEffect(() => {
    if (!active) { setRemaining(seconds); return; }
    setRemaining(seconds);
    const id = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) { clearInterval(id); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [active, seconds]);
  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");
  return { remaining, formatted: `${mm}:${ss}` };
}

export default function QRPaymentModal({
  isOpen,
  onClose,
  orderId,
  orderAmount,
  onPaymentSuccess,
}: Props) {
  const [phase, setPhase]         = useState<Phase>("bank-select");
  const [selectedBank, setSelectedBank] = useState("BCEL");
  const [qrCode, setQrCode]       = useState("");
  const [deepLink, setDeepLink]   = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [errorMsg, setErrorMsg]   = useState("");

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { remaining, formatted } = useCountdown(QR_TTL_SECONDS, phase === "qr-display");

  // Stop polling
  const stopPoll = useCallback(() => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  }, []);

  // Cleanup on unmount / close
  useEffect(() => {
    if (!isOpen) {
      stopPoll();
      setPhase("bank-select");
      setQrCode("");
      setTransactionId("");
      setErrorMsg("");
    }
  }, [isOpen, stopPoll]);

  // QR expires when countdown hits 0
  useEffect(() => {
    if (phase === "qr-display" && remaining === 0) {
      stopPoll();
      setPhase("expired");
    }
  }, [remaining, phase, stopPoll]);

  // Start polling when qr-display begins
  useEffect(() => {
    if (phase !== "qr-display") return;

    const poll = async () => {
      try {
        const res = await paymentsApi.checkPaymentStatus(orderId);
        const s = res.status?.toLowerCase();
        if (s === "paid" || s === "completed") {
          stopPoll();
          setPhase("paid");
          onPaymentSuccess();
        } else if (s === "failed" || s === "cancelled") {
          stopPoll();
          setPhase("failed");
        }
      } catch {
        // silent – keep polling
      }
    };

    poll(); // immediate first check
    pollRef.current = setInterval(poll, POLL_INTERVAL_MS);
    return () => stopPoll();
  }, [phase, orderId, onPaymentSuccess, stopPoll]);

  const handleGenerateQR = async () => {
    setPhase("loading");
    setErrorMsg("");
    try {
      const res = await paymentsApi.generateQR(orderId, selectedBank);
      setQrCode(res.qr_code);
      setDeepLink(res.deep_link || "");
      setTransactionId(res.transaction_id);
      setPhase("qr-display");
    } catch (err: any) {
      setErrorMsg(err?.message || "ไม่สามารถสร้าง QR Code ได้ กรุณาลองใหม่อีกครั้ง");
      setPhase("bank-select");
    }
  };

  const handleRetry = () => {
    stopPoll();
    setPhase("bank-select");
    setQrCode("");
    setErrorMsg("");
  };

  const bank = BANKS.find((b) => b.code === selectedBank) ?? BANKS[0];

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        stopPoll();
        onClose();
      }}
      title="Payment QR Code"
    >
      <div className="space-y-4 py-1">
        {/* ── Order summary strip ──────────────────────────────── */}
        <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs">
          <span className="text-zinc-500">ยอดชำระ</span>
          <span className="font-extrabold text-base text-[#0052FF] dark:text-blue-400">
            {formatCurrency(orderAmount)}
          </span>
        </div>

        {/* ── Bank Select ──────────────────────────────────────── */}
        {phase === "bank-select" && (
          <div className="space-y-4">
            <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Select Payment Method
            </p>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {BANKS.map((b) => (
                <button
                  key={b.code}
                  onClick={() => setSelectedBank(b.code)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all text-xs font-bold ${
                    selectedBank === b.code
                      ? "border-[#0052FF] bg-blue-50 dark:bg-blue-950/40 text-[#0052FF] shadow-md shadow-blue-500/20"
                      : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-500"
                  }`}
                >
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-[10px] font-black"
                    style={{ backgroundColor: b.color }}
                  >
                    {b.code[0]}
                  </div>
                  <span>{b.name}</span>
                </button>
              ))}
            </div>

            {errorMsg && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              onClick={handleGenerateQR}
              className="w-full py-3.5 rounded-2xl bg-[#0052FF] hover:bg-[#0045D8] active:scale-[0.98] text-white font-bold text-sm shadow-xl shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
            >
              Generate QR Code for {bank.name}
            </button>
          </div>
        )}

        {/* ── Loading ──────────────────────────────────────────── */}
        {phase === "loading" && (
          <div className="py-12 flex flex-col items-center gap-3 text-zinc-500">
            <Loader2 className="w-10 h-10 animate-spin text-[#0052FF]" />
            <p className="text-sm font-medium">Generating QR Code...</p>
          </div>
        )}

        {/* ── QR Display ───────────────────────────────────────── */}
        {phase === "qr-display" && qrCode && (
          <div className="space-y-4">
            {/* Timer badge */}
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-400">
              <Clock className="w-4 h-4" />
              <span>QR Code expires in {formatted} minutes</span>
              {/* animated progress bar */}
              <div className="flex-1 max-w-[80px] h-1 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
                <div
                  className="h-full bg-amber-500 transition-all duration-1000"
                  style={{ width: `${(remaining / QR_TTL_SECONDS) * 100}%` }}
                />
              </div>
            </div>

            {/* QR Code */}
            <div className="flex justify-center">
              <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border-4 shadow-xl shadow-zinc-200/60 dark:shadow-black/40"
                   style={{ borderColor: bank.color }}>
                <QRCodeSVG
                  value={qrCode}
                  size={200}
                  includeMargin={false}
                  fgColor={bank.color}
                  level="M"
                />
              </div>
            </div>

            <div className="text-center space-y-1">
              <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Open <span style={{ color: bank.color }}>{bank.name}</span> app and scan this QR code
              </p>
              <p className="text-[11px] text-zinc-400">
                The system will automatically update payment status after successful payment
              </p>
            </div>

            {/* Polling indicator */}
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
              Checking payment status...
            </div>

            {/* Deep link for mobile */}
            {deepLink && (
              <a
                href={deepLink}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-300 transition-colors"
              >
                <Smartphone className="w-4 h-4" />
                Open in Mobile App
              </a>
            )}
          </div>
        )}

        {/* ── Paid (success) ───────────────────────────────────── */}
        {phase === "paid" && (
          <div className="py-6 flex flex-col items-center gap-4 text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center ring-4 ring-emerald-200 dark:ring-emerald-800">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <div>
              <h4 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100">Payment Successful! 🎉</h4>
              <p className="text-xs text-zinc-500 mt-1">
                Thank you for your order. Your order is now being processed.
              </p>
            </div>
            <button
              onClick={onClose}
              className="px-8 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-md shadow-emerald-600/20 transition-all"
            >
              View Order Details
            </button>
          </div>
        )}

        {/* ── Failed ───────────────────────────────────────────── */}
        {phase === "failed" && (
          <div className="py-6 flex flex-col items-center gap-4 text-center">
            <div className="w-20 h-20 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <XCircle className="w-12 h-12" />
            </div>
            <div>
              <h4 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100">Payment Failed</h4>
              <p className="text-xs text-zinc-500 mt-1">Please try again or select another payment method</p>
            </div>
            <button
              onClick={handleRetry}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0052FF] hover:bg-[#0045D8] text-white text-sm font-bold shadow-md shadow-blue-500/20 transition-all"
            >
              <RefreshCw className="w-4 h-4" /> Try Again
            </button>
          </div>
        )}

        {/* ── Expired ──────────────────────────────────────────── */}
        {phase === "expired" && (
          <div className="py-6 flex flex-col items-center gap-4 text-center">
            <div className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-12 h-12" />
            </div>
            <div>
              <h4 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100">QR Code Expired</h4>
              <p className="text-xs text-zinc-500 mt-1">Please generate a new QR Code to continue payment</p>
            </div>
            <button
              onClick={handleRetry}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0052FF] hover:bg-[#0045D8] text-white text-sm font-bold shadow-md shadow-blue-500/20 transition-all"
            >
              <RefreshCw className="w-4 h-4" /> Generate New QR
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
