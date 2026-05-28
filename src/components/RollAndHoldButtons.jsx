"use client";
import React from "react";

export default function RollAndHoldButtons({
  onRoll,
  onHold,
  isRolling,
  disabled,
}) {
  return (
    <>
      {!isRolling && (
        <div className="flex gap-4 sm:gap-6">
          {/* ROLL DICE BUTTON */}
          <button
            disabled={disabled}
            onClick={onRoll}
            className="group relative cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 active:scale-95 transition-transform"
          >
            {/* Retro Shadow Effect Box */}
            <div className="absolute inset-0 bg-yellow-600 rounded-xl translate-x-1 translate-y-1 group-active:translate-x-0 group-active:translate-y-0 transition-transform" />

            <div className="relative bg-yellow-400 border-2 border-yellow-500 px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl uppercase text-xs sm:text-sm text-zinc-900 font-black tracking-wide flex items-center gap-2">
              <span>🎲</span>
              <span>Roll Dice</span>
            </div>
          </button>

          {/* HOLD RESULT BUTTON */}
          <button
            disabled={disabled}
            onClick={onHold}
            className="group relative cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 active:scale-95 transition-transform"
          >
            {/* Retro Shadow Effect Box */}
            <div className="absolute inset-0 bg-purple-300 rounded-xl translate-x-1 translate-y-1 group-active:translate-x-0 group-active:translate-y-0 transition-transform" />

            <div className="relative bg-purple-100 border-2 border-purple-200 px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl uppercase text-xs sm:text-sm text-purple-900 font-black tracking-wide flex items-center gap-2">
              <span>📥</span>
              <span>Hold Result</span>
            </div>
          </button>
        </div>
      )}
    </>
  );
}
