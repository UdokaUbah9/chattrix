"use client";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function RedirectLoginButton() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.replace("/signup")}
      className="absolute top-8 left-0 p-3 rounded-full hover:bg-yellow-100 transition-all active:scale-90 text-zinc-600 hover:text-black"
    >
      <ArrowLeft size={24} />
    </button>
  );
}
