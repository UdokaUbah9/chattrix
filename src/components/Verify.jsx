"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

import Smile from "./Smile";
import {
  setForgottenPasswordEmail,
  setPendingSignUp,
  setUser,
} from "../store/authSlice";
import { useSelector, useDispatch } from "react-redux";
import SmileLoader from "./SmileLoader";
import RequestOtpAgain from "./RequestOptAgain";
import toast from "react-hot-toast";
import RedirectLoginButton from "./LoginBack";

export default function Verify() {
  const router = useRouter();
  const dispatch = useDispatch();

  const [value1, setValue1] = useState("");
  const [value2, setValue2] = useState("");
  const [value3, setValue3] = useState("");
  const [value4, setValue4] = useState("");

  const input1 = useRef(null);
  const input2 = useRef(null);
  const input3 = useRef(null);
  const input4 = useRef(null);

  const { pendingSignUp, isHydrated, user, forgottenPasswordEmail } =
    useSelector((state) => state.auth);

  const signupContainerRef = useRef(null);

  const [isLoading, setIsLoading] = useState(false);

  ////////////////////////////////////////////////////

  useEffect(() => {
    if (!isHydrated) return;
    // Check if signup data exists
    // const pending = localStorage.getItem("pendingSignup");

    if (user) {
      router.replace("/dashboard/chat"); // If logged in, kick them OUT of login
      return;
    }

    // Look for the email in the URL query string (?email=...)
    const searchParams = new URLSearchParams(window.location.search);
    const emailFromForgottenPassword = searchParams.get("email");
    dispatch(setForgottenPasswordEmail(searchParams.get("email")));

    if (!pendingSignUp?.email && !emailFromForgottenPassword) {
      return router.replace("/signup"); // redirect back if missing
    }
  }, [dispatch, user, isHydrated, router, pendingSignUp]);

  //////////////////////////////////////////////////////////////////

  const handleSubmitOtp = async function (e) {
    e.preventDefault();
    const otp = `${value1}${value2}${value3}${value4}`;

    // 1. Determine which email to use
    const email = forgottenPasswordEmail || pendingSignUp?.email;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      setIsLoading(true);

      // 2. Select the correct endpoint based on the flow
      const endpoint = forgottenPasswordEmail
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/smile/v1/users/verify-reset-otp`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/smile/v1/users/signup`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({ email, otp }),
      });

      clearTimeout(timeoutId);
      const data = await res.json();

      if (data.status === "fail" || data.status === "error") {
        throw new Error(data.message || "Invalid OTP! please try again.");
      }

      // 3. Handle Success per flow
      if (forgottenPasswordEmail) {
        // FORGOTTEN PASSWORD FLOW: Move to the reset page with the new token
        router.push(`/forgotten-password/reset/${data.token}?email=${email}`);
      } else {
        // SIGNUP FLOW: Log the user in directly
        dispatch(setUser({ user: data.data.user, token: data.token }));
        router.replace("/dashboard/chat");
      }
    } catch (err) {
      if (err.message.includes("expired")) {
        router.replace(forgottenPasswordEmail ? "/login" : "/signup");
      }
      toast.error(err.message);
    } finally {
      setIsLoading(false);
      // 4. Cleanup pending state only if it was a signup
      if (pendingSignUp) dispatch(setPendingSignUp(null));
    }
  };

  /////////////Handle Change Function//////////////
  const handleChange = function (e, setValue, nextInput, prevInput) {
    // If it's a keydown event for Backspace
    if (e.type === "keydown") {
      if (e.key === "Backspace" && !e.target.value && prevInput) {
        prevInput.current.focus();
      }
      return;
    }

    // Handle input/change event
    const value = e.target.value.replace(/\D/, ""); // allow only digits
    setValue(value.slice(-1)); // Keep only the last character

    if (value && nextInput) {
      nextInput.current.focus();
    }
  };
  if (isLoading) {
    return <SmileLoader />;
  }

  if (!isHydrated) return <SmileLoader />;

  if (user) return null;

  return (
    <div
      className="flex items-center flex-col gap-17 w-full bg-yellow-50 min-h-screen p-4"
      ref={signupContainerRef}
    >
      <RedirectLoginButton />
      <Smile />

      <p className="text-center text-zinc-800">
        Enter the 4-digit code we sent to <br />
        📧 {pendingSignUp?.email || forgottenPasswordEmail}
      </p>

      <form
        className="flex justify-center items-center flex-col text-zinc-800"
        onSubmit={handleSubmitOtp}
      >
        <div className="flex sm:gap-10 justify-between items-center gap-5">
          <input
            type="text"
            inputMode="Numeric"
            pattern="\d*"
            // maxLength={1}
            className="bg-smoke w-12 h-12 text-center font-semibold text-3xl p-2 focus:outline-none
    focus:ring-3
    focus:ring-bright-yellow
    focus:ring-offset-3"
            value={value1}
            ref={input1}
            onChange={(e) => handleChange(e, setValue1, input2, null)}
            onKeyDown={(e) => handleChange(e, setValue1, input2, null)}
            autoFocus
          />
          <input
            type="text"
            inputMode="Numeric"
            pattern="\d*"
            // maxLength={1}
            className="bg-smoke w-12 h-12 text-center font-semibold text-3xl p-2 focus:outline-none 
    focus:ring-3
    focus:ring-bright-yellow
    focus:ring-offset-3"
            value={value2}
            ref={input2}
            onChange={(e) => handleChange(e, setValue2, input3, input1)}
            onKeyDown={(e) => handleChange(e, setValue2, input3, input1)}
          />
          <input
            type="text"
            inputMode="Numeric"
            pattern="\d*"
            // maxLength={1}
            className="bg-smoke w-12 h-12 text-center font-semibold text-3xl p2 focus:outline-none 
    focus:ring-3
    focus:ring-bright-yellow
    focus:ring-offset-3"
            value={value3}
            ref={input3}
            onChange={(e) => handleChange(e, setValue3, input4, input2)}
            onKeyDown={(e) => handleChange(e, setValue3, input4, input2)}
          />
          <input
            type="text"
            inputMode="Numeric"
            pattern="\d*"
            // maxLength={1}
            className="bg-smoke w-12 h-12 text-center font-semibold text-3xl p-2 focus:outline-none 
    focus:ring-3
    focus:ring-bright-yellow
    focus:ring-offset-3"
            value={value4}
            ref={input4}
            onChange={(e) => handleChange(e, setValue4, null, input3)}
            onKeyDown={(e) => handleChange(e, setValue4, null, input3)}
          />
        </div>
        <button
          className="bg-yellow-300 text-zinc-800 w-full max-w-[280px] h-14 cursor-pointer mt-10 p-2 rounded-lg font-bold focus:outline-none 
    focus:ring-3
    focus:ring-yellow-400 
    focus:ring-offset-2"
          disabled={
            value1 === "" || value2 === "" || value3 === "" || value4 === ""
          }
        >
          Verify
        </button>

        <RequestOtpAgain />
      </form>
    </div>
  );
}
