"use client";

import React, { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

function ChangePassword() {
  const [isUpdating, setIsUpdating] = useState(false);
  const { token } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    passwordCurrent: "",
    password: "",
    passwordConfirm: "",
  });

  const handleUpdatePassword = async (passwordData) => {
    setIsUpdating(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/smile/v1/users/updateMyPassword`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(passwordData),
        },
      );

      const data = await res.json();
      if (data.status === "success") {
        toast.success("Password updated successfully");
        setFormData({
          passwordCurrent: "",
          password: "",
          passwordConfirm: "",
        });
      } else {
        toast.error(data.message || "Failed to update password");
      }
    } catch (err) {
      toast.error("Password update failed");
    } finally {
      setIsUpdating(false);
    }
  };

  const onSaveClick = async function (e) {
    e.preventDefault(); // Keeps things safe from unwanted reloads
    if (isUpdating) return;
    await handleUpdatePassword(formData);
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 md:p-0">
      <form onSubmit={onSaveClick} className="space-y-6">
        {/* Current Password */}
        <div className="space-y-1.5">
          <label className="text-xs tracking-widest uppercase text-zinc-600 font-bold ml-2">
            Current Password
          </label>
          <div className="relative">
            <Lock
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
              size={18}
            />
            <input
              type={showPassword ? "text" : "password"}
              className="w-full bg-white/5 border border-zinc-200 rounded-2xl py-4 pl-12 pr-12 text-zinc-800 focus:outline-none focus:border-purple-400/50 transition-all"
              placeholder="••••••••"
              value={formData.passwordCurrent}
              onChange={(e) =>
                setFormData({ ...formData, passwordCurrent: e.target.value })
              }
              required
            />
            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div className="space-y-1.5">
          <label className="text-xs tracking-widest uppercase text-zinc-600 font-bold ml-2">
            New Password
          </label>
          <div className="relative">
            <Lock
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
              size={18}
            />
            <input
              type={showNewPassword ? "text" : "password"}
              className="w-full bg-white/5 border border-zinc-200 rounded-2xl py-4 pl-12 pr-12 text-zinc-800 focus:outline-none focus:border-purple-400/50 transition-all"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
            />
            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700"
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Confirm New Password */}
        <div className="space-y-1.5">
          <label className="text-xs tracking-widest uppercase text-zinc-600 font-bold ml-2">
            Confirm New Password
          </label>
          <div className="relative">
            <Lock
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
              size={18}
            />
            <input
              type={showConfirmPassword ? "text" : "password"}
              className="w-full bg-white/5 border border-zinc-200 rounded-2xl py-4 pl-12 pr-12 text-zinc-800 focus:outline-none focus:border-purple-400/50 transition-all"
              placeholder="••••••••"
              value={formData.passwordConfirm}
              onChange={(e) =>
                setFormData({ ...formData, passwordConfirm: e.target.value })
              }
              required
            />
            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Save Changes Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isUpdating}
            className="w-full py-4 rounded-2xl bg-purple-200 text-purple-600 shadow-sm font-semibold tracking-wider disabled:opacity-50 transition-opacity"
          >
            {isUpdating ? "Updating Password..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ChangePassword;
