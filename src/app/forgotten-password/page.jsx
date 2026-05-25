"use client";
import { useState } from "react";
import { Mail, ArrowLeft, Send } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import Smile from "@/components/Smile";
import { useRouter } from "next/navigation";
import RedirectLoginButton from "@/components/LoginBack";

export default function ForgottenPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleResetRequest = async function (e) {
    e.preventDefault();

    if (!email) {
      setError(true);
      setTimeout(function () {
        setError(false);
      }, 2000);
      return;
    }

    try {
      setIsLoading(true);

      // CREATING A TIMEOUT FOR THE FETCH REQUEST
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/smile/v1/users/forgotten-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          credentials: "include",
          body: JSON.stringify({ email: email.trim() }),
        },
      );

      // DELETING THE CREATED TIMEOUT FOR THE FETCH REQUEST
      clearTimeout(timeoutId);

      const result = await res.json();

      if (result.status === "fail") {
        return;
      }

      router.replace(
        `/forgotten-password/verify?email=${encodeURIComponent(email)}`,
      );
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-yellow-50 min-h-screen flex flex-col gap-14">
      <Smile />
      <div className="flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white border border-zinc-200 rounded-[2.5rem] p-8 shadow-xl animate-in fade-in zoom-in duration-300">
          {/* Header */}
          <div className="text-center space-y-3 mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-2">
              <Mail className="text-purple-600" size={32} />
            </div>
            <h2 className="text-2xl font-black text-zinc-800 uppercase tracking-tight">
              Forgot Password?
            </h2>
            <p className="text-zinc-500 text-sm">
              Enter your email and we'll send you a link to reset your identity.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleResetRequest} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.2em] text-zinc-400 font-bold ml-2">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
                  size={18}
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="udoka@example.com"
                  autoFocus
                  className="w-full bg-zinc-50 border-2 border-yellow-400 rounded-2xl py-4 pl-12 pr-4 text-zinc-800 focus:outline-none focus:ring-2 focus:ring-yellow-300 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2
              ${
                isLoading
                  ? "bg-zinc-200 text-zinc-400 cursor-not-allowed"
                  : "bg-yellow-400 text-zinc-800 hover:bg-yellow-300 active:scale-[0.98]"
              }`}
            >
              {isLoading ? (
                "Sending..."
              ) : (
                <>
                  <span>Send Reset Link</span>
                  <Send size={18} />
                </>
              )}
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-8 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm font-bold text-zinc-400 hover:text-purple-600 transition-colors"
            >
              <ArrowLeft size={16} />
              <span>Back to Login</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
