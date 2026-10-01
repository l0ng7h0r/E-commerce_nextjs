"use client";

import React, { useEffect } from "react";
import { AlertTriangle, XCircle, PackageX } from "lucide-react";

interface CancelOrderModalProps {
  /** Controls modal visibility */
  isOpen: boolean;
  /** The order ID to be cancelled — null means no modal */
  orderId: string | null;
  /** Whether the cancel API call is in-flight */
  isLoading?: boolean;
  /** Emitted when user confirms cancellation */
  onConfirm: (orderId: string) => void;
  /** Emitted when user dismisses / keeps the order */
  onCancel: () => void;
}

export default function CancelOrderModal({
  isOpen,
  orderId,
  isLoading = false,
  onConfirm,
  onCancel,
}: CancelOrderModalProps) {
  // Lock body scroll while open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) onCancel();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, isLoading, onCancel]);

  if (!isOpen || !orderId) return null;

  const shortId = orderId.substring(0, 8).toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={() => !isLoading && onCancel()}
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-sm rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl z-10 animate-in zoom-in-95 duration-200 overflow-hidden">
        <div className="p-6">
          {/* Icon + Title */}
          <div className="flex flex-col items-center text-center gap-3 mb-5">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center justify-center">
              <PackageX className="w-7 h-7 text-rose-500 dark:text-rose-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Cancel Order?
              </h3>
              <p className="text-[11px] font-mono text-zinc-400 mt-0.5">
                #{shortId}
              </p>
            </div>
          </div>

          {/* Warning message */}
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 flex items-start gap-2.5 mb-5">
            <AlertTriangle className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
              Are you sure you want to cancel this order?{" "}
              <span className="font-semibold">
                The reserved items will be returned to stock.
              </span>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row gap-2.5">
            {/* Keep Order */}
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
            >
              Keep Order
            </button>

            {/* Confirm Cancel */}
            <button
              onClick={() => onConfirm(orderId)}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/25 flex items-center justify-center gap-1.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>Cancelling…</span>
                </>
              ) : (
                <>
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Yes, Cancel Order</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
