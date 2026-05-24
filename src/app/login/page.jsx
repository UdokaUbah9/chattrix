"use client";
import { useState, useEffect } from "react";
import LoginForm from "../../components/LoginForm";
import Smile from "../../components/Smile";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import SmileLoader from "@/components/SmileLoader";

export default function Login() {
  const router = useRouter();
  const [isFocused, setIsFocused] = useState(false);
  const { isHydrated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isHydrated && user) {
      router.replace("/dashboard/chat");
    }
  }, [user, isHydrated, router]);

  if (!isHydrated) return <SmileLoader />;

  if (user) return null;

  return (
    <div className="bg-yellow-50 min-h-screen">
      <Smile isFocused={isFocused} />
      <LoginForm isFocused={isFocused} setIsFocused={setIsFocused} />
    </div>
  );
}
