"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, Line } from "@react-three/drei";
import * as THREE from "three";

function WireframeGlobe() {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  const lines = useMemo(() => {
    const lines = [];
    const radius = 2.5;
    const segments = 32;

    // Latitudes
    for (let i = 1; i < segments; i++) {
      const phi = (Math.PI * i) / segments;
      const points = [];
      for (let j = 0; j <= segments; j++) {
        const theta = (2 * Math.PI * j) / segments;
        points.push(
          new THREE.Vector3(
            radius * Math.sin(phi) * Math.cos(theta),
            radius * Math.cos(phi),
            radius * Math.sin(phi) * Math.sin(theta)
          )
        );
      }
      lines.push(points);
    }

    // Longitudes
    for (let i = 0; i < segments; i++) {
      const theta = (2 * Math.PI * i) / segments;
      const points = [];
      for (let j = 0; j <= segments; j++) {
        const phi = (Math.PI * j) / segments;
        points.push(
          new THREE.Vector3(
            radius * Math.sin(phi) * Math.cos(theta),
            radius * Math.cos(phi),
            radius * Math.sin(phi) * Math.sin(theta)
          )
        );
      }
      lines.push(points);
    }

    return lines;
  }, []);

  return (
    <group ref={groupRef}>
      <Sphere args={[2.48, 64, 64]}>
        <meshBasicMaterial color="#050505" />
      </Sphere>
      
      {lines.map((points, index) => (
        <Line
          key={index}
          points={points}
          color="#0066ff"
          lineWidth={0.5}
          transparent
          opacity={0.3}
        />
      ))}

      {/* Atmospheric Glow */}
      <Sphere args={[2.6, 32, 32]}>
        <meshBasicMaterial color="#00f0ff" transparent opacity={0.05} side={THREE.BackSide} />
      </Sphere>
    </group>
  );
}

export default function Globe() {
  return (
    <div className="absolute inset-0 w-full h-full -z-10 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
        <fog attach="fog" args={["#050505", 5, 15]} />
        <ambientLight intensity={0.5} />
        <WireframeGlobe />
      </Canvas>
    </div>
  );
}
