"use client";
import { useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { setForgottenPasswordEmail } from "@/store/authSlice";
import Smile from "@/components/Smile";
import SmileLoader from "@/components/SmileLoader";
import toast from "react-hot-toast";
import RedirectLoginButton from "@/components/LoginBack";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function ResetPasswordForm() {
  const { token } = useParams(); // Grabs the token from the URL dynamic segment
  const searchParams = useSearchParams();
  const email = searchParams.get("email"); // Optional: for UI display

  const router = useRouter();
  const dispatch = useDispatch();

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleResetSubmit = async (e) => {
    e.preventDefault();

    if (password !== passwordConfirm) {
      return toast.error("Passwords do not match!");
    }

    try {
      setIsLoading(true);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/smile/v1/users/resetpassword/${token}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            password,
            passwordConfirm,
          }),
        },
      );

      const data = await res.json();

      if (data.status === "success") {
        toast.success("Password reset successful!");

        // 1. Clear the forgotten email from Redux state
        dispatch(setForgottenPasswordEmail(null));

        // 2. Redirect to login
        router.push("/login");
      } else {
        throw new Error(data.message || "Something went wrong");
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Show Password
  const onShowPassword = function () {
    setShowPassword((show) => !show);
  };

  return (
    <div className="relative flex items-center flex-col gap-10 w-full bg-yellow-50 min-h-screen">
      <RedirectLoginButton />
      <Smile isFocused />

      <div className="w-full max-w-md px-6 text-center">
        <h2 className="text-3xl font-black text-zinc-900 tracking-tight mb-2">
          Welcome Back!
        </h2>
        <p className="text-zinc-500 text-sm mb-8">
          Let's get a new password set up for{" "}
          <span className="font-bold text-black border-b-2 border-yellow-400">
            {email}
          </span>
        </p>

        <form onSubmit={handleResetSubmit} className="flex flex-col gap-5">
          <div className="relative cursor-pointer">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="New Password"
              className="w-full h-14 p-4 rounded-lg bg-smoke focus:outline-none focus:ring-2 focus:ring-bright-yellow"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10"
              onClick={onShowPassword}
            >
              {showPassword ? <FaEye /> : <FaEyeSlash />}
            </div>
          </div>

          <div>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Confirm New Password"
              className="w-full h-14 p-4 rounded-lg bg-smoke focus:outline-none focus:ring-2 focus:ring-bright-yellow"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="bg-yellow-300 w-full h-14 rounded-lg font-bold mt-4 hover:bg-yellow-400 transition-colors shadow-md"
          >
            {isLoading ? "Updating" : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
