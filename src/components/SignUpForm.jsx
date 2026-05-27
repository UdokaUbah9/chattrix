"use client";
import { useState, useRef } from "react";
import { toast, Toaster } from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

import { setPendingSignUp } from "../store/authSlice";
import { useDispatch } from "react-redux";
import SmileLoader from "./SmileLoader";

gsap.registerPlugin(useGSAP);

export default function SignUpForm({ setIsFocused }) {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const passwordField = useRef(null);
  const signupFormRef = useRef(null);

  const dispatch = useDispatch();
  const router = useRouter();

  const inputStyle =
    "h-12 md:h-14 bg-smoke px-3 py-1 text-base cursor-pointer rounded-lg tracking-wide w-full transition-all";
  const parentStyle = "flex flex-col w-full max-w-[370px]";
  const labelStyle = "font-semibold mb-2 text-zinc-800 text-sm md:text-xs";

  // Show Password
  const onShowPassword = function () {
    setShowPassword((show) => !show);
  };

  // HANDLE PASSWORD CHANGE
  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);

    if (val.length > 0 && val.length < 8) {
      setPasswordError("Password must be at least 8 characters");
    } else {
      setPasswordError("");
    }
  };

  // HANDLE PASSWORD CHANGE
  const handleUsernameChange = (e) => {
    const val = e.target.value;
    setUsername(val);

    if (val.length > 0 && val.length < 8) {
      setUsernameError("Password must be at least 8 characters");
    } else {
      setUsernameError("");
    }
  };

  // SignUp Handler Function
  const handleSubmit = async function (e) {
    e.preventDefault();

    if (!email || !username || !password) {
      setError(true);
      setTimeout(function () {
        setError(false);
      }, 2000);
      return;
    }

    try {
      setIsLoading(true);
      const data = { email, username, password };

      dispatch(setPendingSignUp(data));

      // CREATING A TIMEOUT FOR THE FETCH REQUEST
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/smile/v1/users/signup/request-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          credentials: "include",
          body: JSON.stringify(data),
        },
      );

      // DELETING THE CREATED TIMEOUT FOR THE FETCH REQUEST
      clearTimeout(timeoutId);

      const result = await res.json();

      if (result.status === "fail") {
        setError(result.message || "Something went wrong");
        setTimeout(function () {
          setError(false);
        }, 4000);
        return;
      }

      router.replace("/signup/verify");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Using GSAP
  useGSAP(() => {
    gsap.from(signupFormRef.current, {
      scale: 0.9,
      opacity: 0,
      y: 20,
      duration: 0.6,
      ease: "power4.out",
    });
  });
  return (
    <>
      {isLoading && <SmileLoader />}
      <form
        className="flex flex-col items-center justify-center gap-4 md:gap-6 w-full px-5 py-6 md:py-12 max-w-[370px] mx-auto"
        onSubmit={handleSubmit}
        ref={signupFormRef}
      >
        <div className={parentStyle}>
          <label htmlFor="email" className={labelStyle}>
            Email
          </label>
          <input
            id="email"
            type="email"
            className={`${inputStyle} focus:outline-none 
    focus:ring-3
    focus:ring-yellow-400
    focus:ring-offset-2`}
            placeholder="Enter Email Address"
            value={email}
            autoFocus
            onChange={(e) => setEmail(e.target.value)}
          />
          {error && email === "" && (
            <p className="text-red-500 text-xs mt-1 animate-pulse">
              Email is required
            </p>
          )}
        </div>
        <div className={parentStyle}>
          <label htmlFor="username" className={labelStyle}>
            Username
          </label>
          <input
            id="username"
            type="text"
            className={`${inputStyle} focus:outline-none 
    focus:ring-3
    focus:ring-yellow-400
    focus:ring-offset-2`}
            placeholder="Enter Username"
            value={username}
            onChange={handleUsernameChange}
            minLength={8}
          />
          {usernameError && (
            <p className="text-red-500 text-xs mt-1 animate-pulse">
              {usernameError}
            </p>
          )}
          {error && username === "" && (
            <p className="text-red-500 text-xs mt-1 animate-pulse">
              Username is required
            </p>
          )}
        </div>
        <div className={parentStyle}>
          <label htmlFor="passweord" className={labelStyle}>
            Password
          </label>
          <div className="relative cursor-pointer">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              className={`${inputStyle} focus:outline-none 
    focus:ring-3
    focus:ring-yellow-400
    focus:ring-offset-2`}
              placeholder="Enter Password"
              ref={passwordField}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              value={password}
              onChange={handlePasswordChange}
              minLength={8}
            />
            <div
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10"
              onClick={onShowPassword}
            >
              {showPassword ? <FaEye /> : <FaEyeSlash />}
            </div>
          </div>
          {passwordError && (
            <p className="text-red-500 text-xs mt-1 animate-pulse">
              {passwordError}
            </p>
          )}
          {error && password === "" && (
            <p className="text-red-500 text-xs mt-1 animate-pulse">
              Password is required
            </p>
          )}
        </div>

        {typeof error === "string" && (
          <p className="text-red-500 text-xs mt-1 animate-pulse">{error}</p>
        )}

        <button className="bg-yellow-400 w-full max-w-[370px] h-14 cursor-pointer mt-10 p-2 rounded-lg font-bold">
          Sign Up
        </button>

        <div className="flex gap-3 items-center">
          <p className="text-dark-slate-grey text-sm tracking-wide">
            Already have an account?
          </p>

          <Link
            href="login"
            replace
            className="font-bold cursor-pointer text-yellow-500"
          >
            Log In
          </Link>
        </div>
        <Toaster />
      </form>
    </>
  );
}
