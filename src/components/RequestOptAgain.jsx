"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import SmileLoader from "./SmileLoader";
import toast from "react-hot-toast";

export default function RequestOtpAgain() {
  const [isLoading, setIsLoading] = useState(false);
  const errorTimeoutRef = useRef();

  const { pendingSignUp, forgottenPasswordEmail } = useSelector(
    (state) => state.auth,
  );

  useEffect(() => {
    return () => {
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
    };
  }, []);

  const handleResendOtp = async function (e) {
    e.preventDefault();

    // Determine which email to use
    const email = forgottenPasswordEmail || pendingSignUp?.email;

    if (!email) {
      return toast.error("No email address found to resend the code.");
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      setIsLoading(true);

      // Point to the endpoints that SEND the email, not verify it
      const endpoint = forgottenPasswordEmail
        ? "http://localhost:5000/api/smile/v1/users/forgotten-password"
        : "http://localhost:5000/api/smile/v1/users/signup/request-otp";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({ email }),
      });

      clearTimeout(timeoutId);
      const data = await res.json();

      if (data.status === "fail" || data.status === "error") {
        throw new Error(data.message || "Failed to send code");
      }

      toast.success("A new 4-digit code has been sent to your Gmail!");
    } catch (err) {
      if (err.name === "AbortError") {
        toast.error("Request timed out. Please check your connection.");
      } else {
        toast.error(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-12 space-y-4">
      <p className="text-zinc-500 text-sm text-center">
        Your verification code will{" "}
        <span className="font-bold text-black">expire in 10 minutes.</span>
      </p>

      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={handleResendOtp}
          disabled={isLoading}
          className="text-sm font-bold text-purple-600 hover:text-purple-500 transition-colors underline underline-offset-4 disabled:opacity-50"
        >
          {isLoading ? "Sending..." : "Didn't receive the code? Resend"}
        </button>
      </div>
    </div>
  );
}
