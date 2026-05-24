import { Irish_Grover } from "next/font/google";
import Image from "next/image";

const irish = Irish_Grover({ subsets: ["latin"], weight: "400" });

export default function Smile({ isFocused, loader, type }) {
  // let size;
  // let eyeSize;
  // let eyeTop;
  // let eyeLeft;
  // let smileHeight;
  // let smileBottom;
  // let curveSize;
  // let curveBorder;
  // let smileWidth = curveSize; // 20

  // if (type) {
  //   size = 35;
  //   eyeSize = 4.4;
  //   eyeTop = 10.5;
  //   eyeLeft = 8.75;
  //   smileHeight = 8.75;
  //   smileBottom = 5.25;
  //   curveSize = 17.5;
  //   curveBorder = 1.3;
  //   smileWidth = curveSize;
  // }

  // if (!type) {
  //   size = 40;
  //   eyeSize = 5.03;
  //   eyeTop = 12;
  //   eyeLeft = 10;
  //   smileHeight = 10;
  //   smileBottom = 6;
  //   curveSize = 20;
  //   curveBorder = 1.48;
  //   smileWidth = curveSize; // 20
  // }

  // // Set up local CSS variables and styles for the main container
  // const localThemeStyles = {
  //   width: `${size}px`,
  //   height: `${size}px`,

  //   // 1. Main spherical gradient (Orange face, with an EXPANDED top-left yellow light)
  //   background: `radial-gradient(
  //     circle at 35% 35%,
  //     var(--color-emoji-yellow-light) 10%,
  //     var(--color-emoji-orange-base) 60%, /* 👈 Expanded the base color area for more light visibility */
  //     var(--color-emoji-orange-shadow)
  //   )`,

  //   // Outer shadow for depth
  //   boxShadow: `
  //     inset 0 0 5px var(--color-emoji-yellow-light),
  //     0 2px 2px rgba(0, 0, 0, 0.4)
  //   `,
  // };

  return (
    <div className="flex items-center justify-center backdrop-blur-2xl">
      <div className="mt-2">
        <Image
          src="/chattrixLogo1.png"
          width={200} // 1. Set your preferred display width (e.g., 200px)
          height={50} // 2. Set the approximate height matching the aspect ratio
          priority
          className="object-contain" // Keeps it perfectly sharp
          alt="Chattrix Logo"
        />
      </div>
    </div>
  );
}

//text-text-default

//  <style jsx>{`
//         @keyframes squish-bounce {
//           0%,
//           100% {
//             transform: translateY(0) scaleX(1) scaleY(1);
//           }
//           50% {
//             transform: translateY(-10px) scaleX(0.9) scaleY(1.1);
//           }
//           95% {
//             transform: translateY(5px) scaleX(1.1) scaleY(0.8);
//           }
//         }
//         .animate-squish {
//           animation: squish-bounce 0.8s infinite ease-in-out;
//         }
//       `}</style>

//       <div
//         className={`${!isFocused && "animate-squish"} flex ${
//           !type ? "justify-center mb-2" : "mb-2"
//         } align-center gap-2  pt-3 `}
//       >
//         {/* // 🟠 Emoji Head (Outer container) */}
//         <div
//           className={`relative flex justify-center items-center rounded-full drop-shadow-sm overflow-hidden ${
//             !isFocused && "animate-none"
//           }`}
//           style={localThemeStyles}
//         >
//           {/* ✨ 1. GLOSSY HIGHLIGHT (Small, bright shine top-left) */}
//           <div
//             className="absolute rounded-full"
//             style={{
//               width: "30%",
//               height: "30%",
//               top: "10%",
//               left: "10%",
//               // Uses the light yellow color for the most pronounced shine
//               background: `radial-gradient(circle, var(--color-emoji-yellow-light), transparent 50%)`,
//               opacity: 0.8,
//               zIndex: 3,
//               filter: "blur(1px)",
//             }}
//           ></div>

//           {/* 🍑 2. CONTOUR/BLUSH LAYER (Acts as a deep shadow/contour on the orange face) */}
//           {/* This layer gives the cheek definition, positioned far left and slightly down */}
//           <div
//             className="absolute rounded-full "
//             style={{
//               width: "80%",
//               height: "80%",
//               top: "50%",
//               left: "50%",
//               // Positions the dark contour on the cheek
//               transform: "translate(-110%, -30%)",

//               // Uses the darkest orange/red hue for contouring
//               background: `radial-gradient(
//             circle,
//             var(--color-emoji-burnt-blush) 25%,
//             transparent 75%
//           )`,
//               opacity: 0.7,
//               zIndex: 1,
//             }}
//           ></div>
//           {/* 👁️ LEFT EYE */}
//           {!isFocused ? (
//             <div
//               className="absolute rounded-full"
//               style={{
//                 backgroundColor: "#000000",
//                 width: `${eyeSize}px`,
//                 height: `${eyeSize}px`,
//                 top: `${eyeTop}px`,
//                 left: `${eyeLeft}px`,
//                 zIndex: 2,
//               }}
//             ></div>
//           ) : (
//             <div
//               className="absolute"
//               style={{
//                 width: `${eyeSize + 2}px`,
//                 height: "1.5px",
//                 backgroundColor: "#000000",
//                 top: `${eyeTop + eyeSize / 2}px`,
//                 left: `${eyeLeft}px`,
//                 borderRadius: "50%",
//                 zIndex: 2,
//               }}
//             ></div>
//           )}

//           {/* 👁️ RIGHT EYE */}
//           {!isFocused ? (
//             <div
//               className="absolute rounded-full"
//               style={{
//                 backgroundColor: "#000000",
//                 width: `${eyeSize}px`,
//                 height: `${eyeSize}px`,
//                 top: `${eyeTop}px`,
//                 right: `${eyeLeft}px`,
//                 zIndex: 2,
//               }}
//             ></div>
//           ) : (
//             <div
//               className="absolute"
//               style={{
//                 width: `${eyeSize + 2}px`,
//                 height: "1.5px",
//                 backgroundColor: "#000000",
//                 top: `${eyeTop + eyeSize / 2}px`,
//                 right: `${eyeLeft}px`,
//                 borderRadius: "50%",
//                 zIndex: 2,
//               }}
//             ></div>
//           )}

//           {/* 👄 5. CLOSED SMILE LINE (Z-index 2) */}
//           <div
//             className="absolute overflow-hidden"
//             style={{
//               width: `${smileWidth}px`,
//               height: `${smileHeight}px`,
//               bottom: `${smileBottom}px`,
//               zIndex: 2,
//             }}
//           >
//             <div
//               className="absolute w-full h-full rounded-full"
//               style={{
//                 height: `${curveSize}px`,
//                 width: `${curveSize}px`,
//                 backgroundColor: "transparent",
//                 border: `${curveBorder}px solid var(--color-emoji-mouth)`,
//                 transform: "translateY(-50%)",
//               }}
//             />
//           </div>
//         </div>
//       </div>
