import React, { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Environment,
  Float,
  MeshTransmissionMaterial,
  Text,
  ContactShadows,
  Lightformer
} from "@react-three/drei";
import {
  Physics,
  RigidBody,
  BallCollider,
  CuboidCollider,
  RapierRigidBody
} from "@react-three/rapier";
import * as THREE from "three";

/**
 * Interactive Invisible Mouse Repulsor:
 * Updates its kinematic position in 3D space according to mouse coordinates
 * softly pushing zero-gravity floating bodies away.
 */
function MouseRepulsor() {
  const rigidRef = useRef<RapierRigidBody>(null);
  const { viewport } = useThree();

  useFrame(({ mouse }) => {
    if (!rigidRef.current) return;
    const x = (mouse.x * viewport.width) / 2;
    const y = (mouse.y * viewport.height) / 2;
    // Kinematic translation towards cursor at z = 0
    rigidRef.current.setNextKinematicTranslation({ x, y, z: 0 });
  });

  return (
    <RigidBody
      ref={rigidRef}
      type="kinematicPosition"
      colliders={false}
      restitution={1.2}
      friction={0.1}
    >
      <BallCollider args={[2.5]} />
    </RigidBody>
  );
}

/**
 * Subtle Camera Parallax
 */
function CameraRig() {
  useFrame(({ camera, mouse }) => {
    // Smooth lerp pan & tilt
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, mouse.x * 1.5, 0.05);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, mouse.y * 1.2, 0.05);
    camera.lookAt(0, 0, 0);
  });
  return null;
}

/**
 * 1. Floating Glass Sphere with transmission, reflection, and chromatic aberration
 */
function GlassSphere({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const bodyRef = useRef<RapierRigidBody>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const randomRot = useMemo(
    () => [Math.random() * 0.01 - 0.005, Math.random() * 0.01 - 0.005, Math.random() * 0.01 - 0.005],
    []
  );

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += randomRot[0];
      meshRef.current.rotation.y += randomRot[1];
      meshRef.current.rotation.z += randomRot[2];
    }
  });

  return (
    <RigidBody
      ref={bodyRef}
      position={position}
      restitution={0.8}
      friction={0.2}
      linearDamping={0.6}
      angularDamping={0.6}
      colliders="ball"
    >
      <mesh ref={meshRef} scale={scale} castShadow receiveShadow>
        <sphereGeometry args={[1, 64, 64]} />
        <MeshTransmissionMaterial
          backside
          samples={16}
          resolution={512}
          transmission={0.96}
          roughness={0.08}
          thickness={1.2}
          ior={1.52}
          chromaticAberration={0.08}
          anisotropy={0.2}
          distortion={0.25}
          distortionScale={0.3}
          temporalDistortion={0.1}
          color="#e0f7fa"
        />
      </mesh>
    </RigidBody>
  );
}

/**
 * 2. Floating Metallic Icosahedron with chromatic high-specular metal finish
 */
function MetallicIcosahedron({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const bodyRef = useRef<RapierRigidBody>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const randomSpeed = useMemo(
    () => [Math.random() * 0.015 - 0.0075, Math.random() * 0.015 - 0.0075, Math.random() * 0.015 - 0.0075],
    []
  );

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += randomSpeed[0];
      meshRef.current.rotation.y += randomSpeed[1];
      meshRef.current.rotation.z += randomSpeed[2];
    }
  });

  return (
    <RigidBody
      ref={bodyRef}
      position={position}
      restitution={0.85}
      friction={0.2}
      linearDamping={0.6}
      angularDamping={0.6}
      colliders="hull"
    >
      <mesh ref={meshRef} scale={scale} castShadow receiveShadow>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          metalness={0.95}
          roughness={0.15}
          color="#0ea5e9"
          envMapIntensity={2.5}
        />
      </mesh>
    </RigidBody>
  );
}

/**
 * 3. Floating Glowing Neon Torus Ring
 */
function NeonRing({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const bodyRef = useRef<RapierRigidBody>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const spin = useMemo(
    () => [Math.random() * 0.02 - 0.01, Math.random() * 0.02 - 0.01, Math.random() * 0.02 - 0.01],
    []
  );

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += spin[0];
      meshRef.current.rotation.y += spin[1];
      meshRef.current.rotation.z += spin[2];
    }
  });

  return (
    <RigidBody
      ref={bodyRef}
      position={position}
      restitution={0.9}
      friction={0.1}
      linearDamping={0.6}
      angularDamping={0.6}
      colliders="hull"
    >
      <mesh ref={meshRef} scale={scale}>
        <torusGeometry args={[1.2, 0.22, 32, 64]} />
        <meshStandardMaterial
          emissive="#2dd4bf"
          emissiveIntensity={3.5}
          color="#14b8a6"
          roughness={0.2}
          toneMapped={false}
        />
      </mesh>
    </RigidBody>
  );
}

/**
 * Zero-Gravity Floating Object Cluster (20 interactive physics objects)
 */
function PhysicsScene() {
  const items = useMemo(() => {
    const list: Array<{ type: "sphere" | "ico" | "ring"; pos: [number, number, number]; scale: number }> = [];
    const types: ("sphere" | "ico" | "ring")[] = ["sphere", "ico", "ring"];

    for (let i = 0; i < 20; i++) {
      const type = types[i % 3];
      const x = (Math.random() - 0.5) * 14;
      const y = (Math.random() - 0.5) * 8;
      const z = (Math.random() - 0.5) * 6;
      const scale = 0.55 + Math.random() * 0.55;
      list.push({ type, pos: [x, y, z], scale });
    }
    return list;
  }, []);

  return (
    <>
      <MouseRepulsor />
      {items.map((item, idx) => {
        if (item.type === "sphere") {
          return <GlassSphere key={idx} position={item.pos} scale={item.scale} />;
        }
        if (item.type === "ico") {
          return <MetallicIcosahedron key={idx} position={item.pos} scale={item.scale} />;
        }
        return <NeonRing key={idx} position={item.pos} scale={item.scale} />;
      })}
    </>
  );
}

/**
 * Studio Lighting & Reflections Setup
 */
function StudioLights() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 15, 10]} intensity={1.8} castShadow shadow-mapSize={1024} />
      <pointLight position={[-10, -10, -5]} intensity={1.5} color="#38bdf8" />
      <pointLight position={[10, -5, 5]} intensity={2.0} color="#2dd4bf" />

      <Environment resolution={512}>
        <Lightformer form="ring" color="#38bdf8" intensity={4} scale={10} position={[-5, 5, -5]} target={[0, 0, 0]} />
        <Lightformer form="rect" color="#2dd4bf" intensity={5} scale={8} position={[10, 5, -5]} target={[0, 0, 0]} />
        <Lightformer form="circle" color="#ffffff" intensity={2} scale={4} position={[0, 10, 5]} target={[0, 0, 0]} />
      </Environment>
    </>
  );
}

/**
 * Root Hero Section Component
 */
export default function DefyGravityHero() {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-950 select-none">
      {/* Deep Elegant Cinematic Gradient Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(14,165,233,0.18),rgba(2,6,23,0.98))] z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(45,212,191,0.12),transparent_40%)] z-0" />

      {/* 3D Canvas with Zero-Gravity Rapier Physics */}
      <div className="absolute inset-0 z-10">
        <Canvas
          shadows
          camera={{ position: [0, 0, 11], fov: 45 }}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          dpr={[1, 2]}
        >
          <CameraRig />
          <StudioLights />
          <Physics gravity={[0, 0, 0]}>
            <PhysicsScene />
          </Physics>
        </Canvas>
      </div>

      {/* Minimalist UI Overlay with Tailwind CSS */}
      <div className="relative z-20 flex flex-col justify-between items-center w-full h-full p-8 pointer-events-none">
        {/* Top Minimal Header */}
        <header className="w-full max-w-7xl flex justify-between items-center pt-4 pointer-events-auto">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-teal-400 shadow-[0_0_12px_#2dd4bf] animate-pulse" />
            <span className="text-xs uppercase font-mono tracking-widest text-slate-300">
              Antigravity Studio
            </span>
          </div>
          <nav className="hidden md:flex gap-8 text-xs font-mono tracking-wider text-slate-400 uppercase">
            <a href="#lab" className="hover:text-teal-400 transition-colors">Lab</a>
            <a href="#physics" className="hover:text-teal-400 transition-colors">Physics</a>
            <a href="#archive" className="hover:text-teal-400 transition-colors">Archive</a>
          </nav>
        </header>

        {/* Center Massive Headline */}
        <div className="flex flex-col items-center justify-center text-center my-auto">
          <p className="text-xs md:text-sm font-mono tracking-[0.3em] uppercase text-teal-400/90 mb-4 drop-shadow">
            Zero Gravity Simulator · Interactive Physics
          </p>
          <h1 className="text-6xl sm:text-8xl md:text-9xl font-black tracking-tighter text-white uppercase mix-blend-difference leading-none">
            DEFY GRAVITY
          </h1>
          <p className="max-w-md mt-6 text-sm md:text-base text-slate-300/80 font-light tracking-wide">
            Move your cursor to disrupt floating physical bodies in real-time zero gravity.
          </p>

          {/* Sleek Glassmorphic Explore Button */}
          <div className="mt-10 pointer-events-auto">
            <button className="group relative px-8 py-3.5 rounded-full overflow-hidden backdrop-blur-xl bg-white/[0.05] border border-white/20 text-white font-medium text-sm tracking-widest uppercase transition-all duration-300 hover:border-teal-400/70 hover:shadow-[0_0_30px_rgba(45,212,191,0.35)] hover:scale-105 active:scale-95">
              <span className="relative z-10 flex items-center gap-2">
                Explore Universe
                <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 via-sky-500/20 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </button>
          </div>
        </div>

        {/* Bottom Minimal Footer Info */}
        <footer className="w-full max-w-7xl flex justify-between items-center text-xs text-slate-500 font-mono tracking-widest pb-4">
          <span>60 FPS REAL-TIME SIMULATION</span>
          <span className="hidden sm:inline">R3F · DREI · RAPIER PHYSICS</span>
          <span>SCROLL TO DISCOVER</span>
        </footer>
      </div>
    </div>
  );
}
