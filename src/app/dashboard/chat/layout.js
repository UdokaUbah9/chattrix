"use client";
import FriendList from "@/components/FrriendList";
import { useParams } from "next/navigation";

// app/chat/layout.jsx (or a similar wrapper)
export default function ChatLayout({ children }) {
  const { userId } = useParams();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-yellow-300">
      {/* SIDEBAR: Always visible on Desktop, hidden on Mobile when a chat is open */}
      <aside
        className={`
    w-full md:w-[350px] lg:w-[400px] border-r border-zinc-200
    ${userId ? "hidden" : "flex"} 
    md:flex flex-col gap-4 p-5`}
      >
        <p
          className={`text-2xl font-bold text-zinc-900 uppercase leading-none select-none tracking-wide`}
        >
          CHAT
        </p>
        <FriendList />
      </aside>

      {/* MAIN CONTENT: The Chat Window */}
      <main
        className={`relative 
        flex-1 h-full  
        ${userId ? "block" : "hidden"} 
        md:block
      `}
      >
        {children}
      </main>
    </div>
  );
}
