"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
// import toast from "react-hot-toast";
import { socket } from "@/utils/socket";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../store/authSlice";
import SmileLoader from "./SmileLoader";
// adjust path if needed

export default function LoginForm({ setIsFocused }) {
  //Redux functionality
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const router = useRouter();

  // Setting the state of Login inputs
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const passwordField = useRef(null);
  const loginFormRef = useRef(null);

  // Show Password
  const onShowPassword = function () {
    setShowPassword((show) => !show);
  };
  const base_url = import.meta.VITE_BASE_URL;
  // Styles applied to all INPUTS, LABEL
  const inputStyle =
    "h-14 bg-smoke p-4 text-sm cursor-pointer rounded-lg tracking-wide w-full";
  const parentStyle = "flex flex-col w-full max-w-[370px]";
  const labelStyle = "font-semibold mb-2 text-text-default";
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
      setUsernameError("Username must be at least 8 characters");
    } else {
      setUsernameError("");
    }
  };

  // Function for handling Login
  const handleLogin = async function (e) {
    e.preventDefault();

    if (!username || !password) {
      setError(true);
      setTimeout(function () {
        setError(false);
      }, 2000);
      return;
    }

    // CREATING A TIMEOUT FOR THE FETCH REQUEST
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      setError("sessions has timed out, please try again.");
    }, 10000);

    try {
      setIsLoading(true);
      setError(false);
      const res = await fetch(
        `${NEXT_PUBLIC_API_URL}/api/smile/v1/users/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          credentials: "include",
          body: JSON.stringify({
            username: username.trim(),
            password: password.trim(),
          }),
        },
      );

      // DELETING THE CREATED TIMEOUT FOR THE FETCH REQUEST
      clearTimeout(timeoutId);

      const data = await res.json(); // parse the response body
      if (data.status === "fail") {
        setError(data.message || "Something went wrong");

        setTimeout(function () {
          setError(false);
        }, 4000);
        return;
        // return toast.error(data.message || "Something went wrong");
      }

      // 1. Dispatch User to Redux (as you already are)
      dispatch(setUser({ user: data.data.user, token: data.token }));

      // 2. SOCKET TRIGGER
      if (socket.connected) {
        socket.emit("identify-user", data.data.user._id);
      } else {
        socket.connect();
        socket.once("connect", () => {
          socket.emit("identify-user", data.data.user._id);
        });
      }
      // 3. Redirect
      setTimeout(() => {
        router.replace("/dashboard/chat");
      }, 300);
    } catch (err) {
      // console.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Using GSAP
  useGSAP(() => {
    gsap.from(loginFormRef.current, {
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
        className="flex flex-col items-center justify-center gap-6 w-full p-5 mt-12"
        onSubmit={handleLogin}
        ref={loginFormRef}
      >
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
            autoFocus
            onChange={handleUsernameChange}
          />
          {usernameError && (
            <p className="text-red-500 text-xs mt-1 animate-pulse">
              {usernameError}
            </p>
          )}
          {error && username === "" && (
            <p className="text-red-500 font-bold text-xs">
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
            <p className="text-red-500 font-extralight text-xs">
              Password is required
            </p>
          )}
          <p
            className="text-left text-xs mt-3 tracking-wide cursor-pointer w-fit"
            onClick={() => router.replace("/forgotten-password")}
          >
            Forgotten password?
          </p>
        </div>

        {typeof error === "string" && (
          <p className="text-red-500 font-extralight text-sm">{error}</p>
        )}

        <button
          disabled={isLoading}
          className="bg-yellow-400 w-full max-w-[370px] h-14 cursor-pointer mt-10 p-2 rounded-lg font-bold"
        >
          {isLoading ? "Logging in..." : "Log In"}
        </button>

        <div className="flex gap-3 items-center">
          <p className="text-dark-slate-grey text-sm tracking-wide">
            Don't have an account?
          </p>
          <Link
            href="signup"
            replace
            className="font-bold cursor-pointer text-yellow-500"
          >
            Sign Up
          </Link>
        </div>
      </form>
    </>
  );
}
