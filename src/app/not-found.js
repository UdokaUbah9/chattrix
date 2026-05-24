"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Home } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-zinc-900 flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full space-y-6 bg-zinc-800/50 border border-zinc-700/50 p-8 rounded-3xl backdrop-blur-sm">
        <div className="space-y-2">
          <h1 className="text-6xl font-black text-white tracking-tighter italic uppercase">
            404
          </h1>
          <h2 className="text-xl font-bold text-zinc-200 uppercase tracking-wide">
            Page Not Found
          </h2>
          <p className="text-zinc-400 text-sm max-w-xs mx-auto">
            The page you are looking for doesn't exist, or the match session has
            already ended.
          </p>
        </div>

        {/* SINGLE DIRECT NAVIGATION OUT */}
        <button
          onClick={() => router.push("/dashboard")}
          className="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-white text-zinc-950 font-black uppercase tracking-wider text-xs active:scale-95 transition-all hover:bg-zinc-100"
        >
          <Home size={16} strokeWidth={2.5} />
          Return to Dashboard
        </button>
      </div>
    </div>
  );
}
