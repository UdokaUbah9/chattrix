import Image from "next/image";
import Smile from "./Smile";

const SmileLoader = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-yellow-50/90 backdrop-blur-2xl">
      <style jsx>{`
        @keyframes squish-bounce {
          0%,
          100% {
            transform: translateY(0) scaleX(1) scaleY(1);
          }
          50% {
            transform: translateY(-20px) scaleX(0.9) scaleY(1.1);
          }
          95% {
            transform: translateY(5px) scaleX(1.1) scaleY(0.8);
          }
        }
        .animate-squish {
          animation: squish-bounce 0.8s infinite ease-in-out;
        }
      `}</style>

      <div className="relative flex flex-col justify-center items-center h-screen">
        {/* The Icon Container */}
        <div className="animate-squish">
          <Image
            src="/chattrixclap.png"
            width={200}
            height={50}
            priority
            className="object-contain" // Keeps it perfectly sharp
            alt="Chattrix Logo"
          />
        </div>

        {/* The Dynamic Shadow */}
        <div className="w-16 h-3 bg-black/20 rounded-[100%] blur-md animate-pulse scale-x-75" />
      </div>
    </div>
  );
};

export default SmileLoader;
