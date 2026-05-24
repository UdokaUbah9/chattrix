import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

export default function BackButton() {
  const router = useRouter();
  return (
    <div>
      <button
        onClick={() => router.replace("/dashboard/chat")}
        className="p-3 text-[#050505] cursor-pointer shrink-0"
        title="Go back"
      >
        <ArrowLeft size={20} />
      </button>
    </div>
  );
}
