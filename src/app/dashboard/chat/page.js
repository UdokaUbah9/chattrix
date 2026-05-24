export default function ChatLandingPage() {
  return (
    <div className="hidden md:flex h-full items-center justify-center bg-yellow-50/50">
      <div className="text-center">
        <div className="text-5xl mb-4">💬</div>
        <h2 className="text-xl font-bold text-zinc-800">Your Messages</h2>
        <p className="text-zinc-500">
          Select a friend from the list to start chatting.
        </p>
      </div>
    </div>
  );
}
