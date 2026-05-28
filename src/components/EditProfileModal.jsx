import React, { useEffect, useState } from "react";
import { Camera, User, Mail, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "@/store/authSlice";
import toast from "react-hot-toast";
import Image from "next/image";
import { useRouter } from "next/navigation";

function EditProfileModal({ onClose, getMyProfile }) {
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState("");
  const { user, token } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    username: user?.username || "",
    avatar: user?.avatar || "",
  });
  const dispatch = useDispatch();
  const router = useRouter();

  const handleUpdateProfile = async (formData) => {
    setIsEditing(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/smile/v1/users/updateMe`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            username: formData.username,
            avatar: formData.avatar,
          }),
        },
      );

      const data = await res.json();
      if (data.status === "success") {
        dispatch(setUser({ user: data.user, token }));
        toast.success("Profile updated successfully");
      }
    } catch (err) {
      toast.error("Update failed");
    } finally {
      setIsEditing(false);
    }
  };

  const onSaveClick = async function (e) {
    e.preventDefault();
    if (isEditing) return;
    await handleUpdateProfile(formData);
    // await getMyProfile();

    router.replace("/dashboard/me");
    onClose();
  };

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        avatar: user.avatar || "",
      });
    }
  }, [user]); // Re-runs when Redux user changes
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 mt-6 ">
      {/* Backdrop */}
      <div className="absolute inset-0 backdrop-blur-sm" />

      {/* Modal Card */}
      <div className="relative w-full max-w-md  border border-white/10 rounded-[2.5rem] p-8 shadow-2xl animate-in fade-in zoom-in duration-300 bg-yellow-100">
        <form className="space-y-8">
          <div className="text-center">
            <h2 className="text-xl text-zinc-700 uppercase tracking-widest font-semibold">
              Edit Profile
            </h2>
          </div>

          {/* Avatar Change Section */}
          <div className="flex justify-center">
            <div className="relative group">
              <div className="relative size-28 rounded-full overflow-hidden flex items-center justify-center">
                {!preview ? (
                  <Image
                    src={user.avatar || "/default-dp.png"}
                    alt="Profile"
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <Image
                    src={preview}
                    alt="preview profile"
                    fill
                    className="object-cover"
                    priority
                  />
                )}
              </div>

              {/* Camera Trigger */}
              <label className="absolute bottom-1 right-1 p-2.5 rounded-full cursor-pointer hover:scale-110 transition-transform shadow-md">
                <Camera size={18} />
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        // This updates your local state so the modal shows the new pic immediately
                        setFormData({ ...formData, avatar: reader.result });
                        setPreview(reader.result);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
            </div>
          </div>

          {/* Fields */}
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs tracking-widest uppercase text-zinc-600 font-bold ml-2">
                Username
              </label>
              <div className="relative">
                <User
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
                  size={18}
                />
                <input
                  type="text"
                  className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-zinc-800 focus:outline-none focus:border-smile-primary/50 transition-all"
                  placeholder="Enter username"
                  onChange={(e) =>
                    setFormData((data) => ({
                      ...data,
                      username: e.target.value,
                    }))
                  }
                  value={formData.username}
                />
              </div>
            </div>

            <div className="space-y-1 opacity-80">
              <label className="text-xs tracking-widest uppercase text-zinc-600 font-bold ml-2">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-800"
                  size={18}
                />
                <input
                  type="email"
                  value={user?.email || "user@example.com"}
                  readOnly
                  className="w-full bg-zinc-700/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-zinc-900 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex gap-4 pt-2">
            <button
              type="button"
              className="flex-1 py-4 rounded-2xl text-red-600 shadow-sm tracking-wider"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isEditing}
              className="flex-1 py-4 rounded-2xl bg-purple-200 text-purple-600 shadow-sm tracking-wider"
              onClick={onSaveClick}
            >
              {isEditing ? "Uploading to Smile..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProfileModal;
