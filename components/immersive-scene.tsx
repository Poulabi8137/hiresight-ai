"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Line, MeshTransmissionMaterial, RoundedBox, Text } from "@react-three/drei";
import { Suspense, useMemo, useRef } from "react";
import type { Group, Mesh } from "three";

function TalentCore() {
  const group = useRef<Group>(null);
  const scanner = useRef<Mesh>(null);

  useFrame(({ clock, mouse }) => {
    if (!group.current) return;
    group.current.rotation.y = clock.elapsedTime * 0.16 + mouse.x * 0.18;
    group.current.rotation.x = -0.12 + mouse.y * 0.12;
    if (scanner.current) {
      scanner.current.position.y = Math.sin(clock.elapsedTime * 1.7) * 1.2;
      scanner.current.scale.x = 1.2 + Math.sin(clock.elapsedTime * 2.2) * 0.16;
    }
  });

  const rails = useMemo(
    () => [
      [
        [-2.9, -0.9, 0],
        [-1.2, 0.7, 0.15],
        [0.2, -0.1, -0.15],
        [1.65, 0.85, 0.05],
        [3.1, -0.45, 0]
      ],
      [
        [-2.4, 1.1, -0.35],
        [-0.8, -0.35, 0.2],
        [0.9, 0.62, -0.2],
        [2.55, 0.05, 0.2]
      ]
    ] as [number, number, number][][],
    []
  );

  return (
    <group ref={group} position={[1.15, 0.1, -0.75]}>
      <Float speed={1.35} rotationIntensity={0.16} floatIntensity={0.35}>
        <RoundedBox args={[3.2, 2.05, 0.18]} radius={0.08} smoothness={8} position={[0, 0, 0]}>
          <MeshTransmissionMaterial
            color="#1dd6c1"
            transmission={0.32}
            thickness={0.28}
            roughness={0.18}
            metalness={0.2}
            transparent
            opacity={0.58}
          />
        </RoundedBox>
        <mesh ref={scanner} position={[0, 0, 0.14]}>
          <boxGeometry args={[2.65, 0.045, 0.055]} />
          <meshStandardMaterial color="#f59e0b" emissive="#f97316" emissiveIntensity={1.8} transparent opacity={0.82} />
        </mesh>
        <Text
          fontSize={0.22}
          letterSpacing={0}
          position={[-1.26, 0.72, 0.19]}
          color="#f8fafc"
          anchorX="left"
          anchorY="middle"
        >
          AI MATCH 94
        </Text>
      </Float>

      {rails.map((points, index) => (
        <Line key={index} points={points} color={index === 0 ? "#2dd4bf" : "#fb923c"} lineWidth={2.2} transparent opacity={0.68} />
      ))}

      {[
        [-2.8, -0.9, 0.05, "#2dd4bf"],
        [-1.2, 0.7, 0.28, "#f8fafc"],
        [0.2, -0.1, 0.14, "#fb923c"],
        [1.65, 0.85, 0.2, "#f8fafc"],
        [3.1, -0.45, 0.08, "#2dd4bf"]
      ].map(([x, y, z, color], index) => (
        <mesh key={index} position={[Number(x), Number(y), Number(z)]}>
          <octahedronGeometry args={[0.13, 0]} />
          <meshStandardMaterial color={String(color)} emissive={String(color)} emissiveIntensity={0.8} metalness={0.35} roughness={0.2} />
        </mesh>
      ))}
    </group>
  );
}

function FloatingTiles() {
  const ref = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.children.forEach((child, index) => {
      child.position.y += Math.sin(clock.elapsedTime * 1.2 + index) * 0.0008;
      child.rotation.z = Math.sin(clock.elapsedTime * 0.7 + index) * 0.035;
    });
  });

  return (
    <group ref={ref}>
      {[
        [-3.8, 1.6, -1.3, 0.78, 0.44, "#0f766e"],
        [-3.25, -1.38, -1.9, 0.68, 0.38, "#ea580c"],
        [3.65, 1.35, -2.2, 0.72, 0.42, "#475569"],
        [3.22, -1.5, -1.4, 0.6, 0.34, "#0d9488"]
      ].map(([x, y, z, w, h, color], index) => (
        <RoundedBox key={index} args={[Number(w), Number(h), 0.08]} radius={0.04} smoothness={6} position={[Number(x), Number(y), Number(z)]}>
          <meshStandardMaterial color={String(color)} emissive={String(color)} emissiveIntensity={0.22} roughness={0.34} metalness={0.28} />
        </RoundedBox>
      ))}
    </group>
  );
}

function ParticleField() {
  const ref = useRef<Group>(null);
  const particles = useMemo(
    () =>
      Array.from({ length: 18 }).map((_, index) => ({
        id: index,
        pos: [
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 4.6,
          -2.4 - Math.random() * 2.4
        ] as [number, number, number],
        scale: 0.04 + Math.random() * 0.08
      })),
    []
  );

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.children.forEach((child, index) => {
      child.position.y += Math.sin(clock.elapsedTime * 0.65 + index * 0.4) * 0.0009;
      child.position.x += Math.cos(clock.elapsedTime * 0.5 + index) * 0.0006;
    });
  });

  return (
    <group ref={ref}>
      {particles.map((particle) => (
        <mesh key={particle.id} position={particle.pos} scale={particle.scale}>
          <sphereGeometry args={[1, 10, 10]} />
          <meshStandardMaterial
            color={particle.id % 3 === 0 ? "#2dd4bf" : particle.id % 3 === 1 ? "#fb923c" : "#f8fafc"}
            emissive={particle.id % 2 ? "#2dd4bf" : "#fb923c"}
            emissiveIntensity={0.5}
            transparent
            opacity={0.72}
          />
        </mesh>
      ))}
    </group>
  );
}

function MeshHalo() {
  const mesh = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    if (!mesh.current) return;
    mesh.current.rotation.z = clock.elapsedTime * 0.06;
    mesh.current.rotation.y = clock.elapsedTime * 0.1;
  });

  return (
    <mesh ref={mesh} position={[0.6, 0, -2.9]}>
      <torusGeometry args={[3.5, 0.05, 20, 140]} />
      <meshStandardMaterial color="#5eead4" emissive="#14b8a6" emissiveIntensity={0.45} transparent opacity={0.26} />
    </mesh>
  );
}

export function ImmersiveScene() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 opacity-95">
      <Canvas
        camera={{ position: [0, 0, 7.5], fov: 45 }}
        dpr={[1, 1.25]}
        gl={{ antialias: true, powerPreference: "high-performance", alpha: true }}
      >
        <color attach="background" args={["transparent"]} />
        <ambientLight intensity={0.45} />
        <directionalLight position={[4, 5, 5]} intensity={1.45} />
        <pointLight position={[-4, 2, 3]} color="#2dd4bf" intensity={1.9} />
        <pointLight position={[3, -2, 4]} color="#fb923c" intensity={1.5} />
        <Suspense fallback={null}>
          <MeshHalo />
          <TalentCore />
          <FloatingTiles />
          <ParticleField />
        </Suspense>
      </Canvas>
    </div>
  );
}
