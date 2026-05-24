"use client";
import { useRef } from "react";
import { useLoader } from "@react-three/fiber";
import { useSpring, animated } from "@react-spring/three";
import { TextureLoader } from "three";

export default function Dice({ rolling, value }) {
  const meshRef = useRef();
  const texture = useLoader(TextureLoader, [
    "/dice-6.jpg", // +X
    "/dice-5.jpg", // -X
    "/dice-4.jpg", // -Y
    "/dice-3.jpg", // +Y
    "/dice-1.jpg", // +Z
    "/dice-2.jpg", // -Z
  ]);

  // Define rotations for each dice face [x, y, z]
  const rotations = {
    1: [0, 0, 0],
    2: [0, Math.PI, 0],
    3: [-Math.PI / 2, 0, 0],
    4: [Math.PI / 2, 0, 0],
    5: [0, Math.PI / 2, 0],
    6: [0, -Math.PI / 2, 0],
  };

  // Animation spring for smooth rolling
  const { rotation, position } = useSpring({
    rotation: rolling
      ? [Math.PI * 4, Math.PI * 4, 0]
      : rotations[value] || [0, 0, 0],
    position: rolling ? [0, 2, 0] : [0, 0, 0], // Bounce up when rolling
    config: { mass: 1, tension: 180, friction: 12 },
  });

  return (
    <animated.mesh
      ref={meshRef}
      rotation={rotation}
      position={position}
      //   castShadow
    >
      <mesh ref={meshRef} castShadow>
        <boxGeometry args={[0.45, 0.45, 0.45]} />

        {texture.map((tex, i) => (
          <meshStandardMaterial
            key={i}
            attach={`material-${i}`}
            color="#ffffff"
            roughness={0.1}
            metalness={0.3}
            /* Adding a subtle green glow */
            emissive="#ffffff"
            emissiveIntensity={0} // Start at 0, increase if still too dark
            map={tex}
          />
        ))}
      </mesh>
    </animated.mesh>
  );
}
