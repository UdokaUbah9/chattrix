export default function ChatPlaceholder() {
  return (
    <div className="hidden md:flex flex-col items-center justify-center h-full bg-yellow-50 text-zinc-400">
      <div className="text-6xl mb-4">💬</div>
      <p className="font-bold text-zinc-500">
        Select a friend to start a conversation
      </p>
    </div>
  );
}
