"use client";
import FriendList from "@/components/FrriendList";
import { useParams } from "next/navigation";

export default function ChatLayout({ children }) {
  const { userId } = useParams();

  return (
    <div className="flex h-dvh max-h-dvh w-full overflow-hidden bg-yellow-300">
      <aside
        className={`
          w-full md:w-[350px] lg:w-[400px] border-r border-zinc-200 h-full overflow-hidden
          ${userId ? "hidden" : "flex"} 
          md:flex flex-col gap-4 p-5
        `}
      >
        <p className="text-2xl font-bold text-zinc-900 uppercase leading-none select-none tracking-wide shrink-0">
          CHAT
        </p>

        {/* Wrapper for the list so it takes up remaining height and scrolls neatly if needed */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <FriendList />
        </div>
      </aside>

      {/* MAIN CONTENT: The Chat Window */}
      <main
        className={`
          relative flex-1 h-full min-h-0 overflow-hidden
          ${userId ? "block" : "hidden"} 
          md:block
        `}
      >
        {children}
      </main>
    </div>
  );
}
