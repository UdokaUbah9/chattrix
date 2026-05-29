import Image from "next/image";

const LostInternet = ({ onRetry }) => (
  <div className="error-state flex flex-col items-center justify-center text-center">
    <div className="relative size-20 drop-shadow-xl">
      <Image
        src="/disconnect-plug.png"
        alt="Disconnected"
        fill
        className="object-contain"
        priority
      />
    </div>
    <h3 className="text-sm md:text-lg font-semibold text-zinc-800">
      You are offline
    </h3>
    <p className="text-xs md:text-sm text-zinc-700 opacity-70 mt-1">
      Server timed out. <br /> Check your internet connection.
    </p>
    <button
      onClick={onRetry}
      className="text-sm mt-5 px-4 py-2 bg-purple-200 text-purple-600 rounded-full active:scale-90 transition-transform shadow-xl "
    >
      Retry
    </button>
  </div>
);

export default LostInternet;
