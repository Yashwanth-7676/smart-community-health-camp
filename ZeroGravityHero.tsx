/**
 * ZeroGravityHero.tsx
 * World-class R3F + Rapier + Postprocessing zero-gravity hero.
 * Requires:
 *   npm install three @react-three/fiber @react-three/drei @react-three/rapier
 *              @react-three/postprocessing framer-motion
 */
import React, {
  useRef, useMemo, useState, useEffect, useCallback, Suspense
} from 'react';
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber';
import {
  Environment, Float, PerspectiveCamera, MeshTransmissionMaterial,
  Preload, useTexture
} from '@react-three/drei';
import {
  Physics, RigidBody, BallCollider, CuboidCollider,
  RapierRigidBody, useRapier
} from '@react-three/rapier';
import {
  EffectComposer, Bloom, DepthOfField,
  Vignette, Noise, ChromaticAberration
} from '@react-three/postprocessing';
import { BlendFunction, KernelSize } from 'postprocessing';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';

// ─── Nebula Background Shader ──────────────────────────────────────────────
const NebulaShaderMaterial = {
  uniforms: {
    uTime: { value: 0 },
    uRes: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = vec4(position, 1.0); }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform vec2  uRes;
    varying vec2  vUv;

    float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
    float noise(vec2 p){
      vec2 i=floor(p); vec2 f=fract(p);
      vec2 u=f*f*(3.0-2.0*f);
      return mix(mix(hash(i),hash(i+vec2(1,0)),u.x),
                 mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x),u.y);
    }
    float fbm(vec2 p){
      float v=0.0,a=0.5;
      for(int i=0;i<6;i++){ v+=a*noise(p); p*=2.1; a*=0.5; }
      return v;
    }
    void main(){
      float t = uTime * 0.08;
      float n1 = fbm(vUv * 2.4 + vec2(t*0.6, t*0.3));
      float n2 = fbm(vUv * 3.8 - vec2(t*0.2, t*0.7));
      float n  = n1*0.6 + n2*0.4;
      vec3 base   = vec3(0.012, 0.0,  0.028);
      vec3 purple = vec3(0.28,  0.08, 0.55);
      vec3 blue   = vec3(0.04,  0.15, 0.62);
      vec3 col = base;
      col = mix(col, purple, smoothstep(0.35, 0.62, n) * 0.55);
      col = mix(col, blue,   smoothstep(0.50, 0.75, n2) * 0.40);
      float dist = length(vUv - 0.5);
      col += vec3(0.06, 0.02, 0.16) * (1.0 - smoothstep(0.0, 0.65, dist));
      gl_FragColor = vec4(col, 1.0);
    }
  `
};

function NebulaBg() {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  useFrame(({ clock }) => {
    if (matRef.current) matRef.current.uniforms.uTime.value = clock.getElapsedTime();
  });
  return (
    <mesh renderOrder={-1} scale={[2, 2, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={matRef}
        args={[NebulaShaderMaterial]}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}

// ─── Glass Material Helper ─────────────────────────────────────────────────
function GlassMesh({ geo, hue, index }: { geo: THREE.BufferGeometry; hue: number; index: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const bodyRef = useRef<RapierRigidBody>(null);
  const matRef  = useRef<THREE.MeshPhysicalMaterial>(null);
  const { mouse, viewport } = useThree() as any;

  const color = useMemo(() => new THREE.Color().setHSL(hue, 0.75, 0.55), [hue]);
  const emissive = useMemo(() => new THREE.Color().setHSL(hue, 1.0, 0.55), [hue]);

  const rotSpeed = useMemo(() => new THREE.Vector3(
    (Math.random() - 0.5) * 0.01,
    (Math.random() - 0.5) * 0.015,
    (Math.random() - 0.5) * 0.01
  ), []);

  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), []);

  useFrame(({ camera, raycaster }) => {
    if (!meshRef.current || !matRef.current) return;
    meshRef.current.rotation.x += rotSpeed.x;
    meshRef.current.rotation.y += rotSpeed.y;
    meshRef.current.rotation.z += rotSpeed.z;
    // Fade glow
    matRef.current.emissiveIntensity = THREE.MathUtils.lerp(
      matRef.current.emissiveIntensity, 0, 0.1
    );
  });

  const scale = useMemo(() => 0.6 + Math.random() * 0.5, []);
  const startPos = useMemo<[number, number, number]>(() => [
    (Math.random() - 0.5) * 12,
    (Math.random() - 0.5) * 7,
    (Math.random() - 0.5) * 5
  ], []);

  return (
    <RigidBody
      ref={bodyRef}
      position={startPos}
      restitution={0.8}
      friction={0.1}
      linearDamping={0.65}
      angularDamping={0.6}
      colliders="hull"
    >
      <mesh ref={meshRef} scale={scale} castShadow receiveShadow
        onPointerOver={() => {
          if (matRef.current) matRef.current.emissiveIntensity = 3.2;
          if (meshRef.current) {
            rotSpeed.x *= 6; rotSpeed.y *= 6; rotSpeed.z *= 6;
          }
        }}
        onPointerOut={() => {
          rotSpeed.x /= 6; rotSpeed.y /= 6; rotSpeed.z /= 6;
        }}
      >
        <primitive object={geo} attach="geometry" />
        <meshPhysicalMaterial
          ref={matRef}
          color={color}
          emissive={emissive}
          emissiveIntensity={0}
          roughness={0.06}
          metalness={0.0}
          transmission={0.92}
          thickness={2.0}
          ior={1.65}
          clearcoat={1.0}
          clearcoatRoughness={0.05}
          specularIntensity={1.0}
          specularColor={new THREE.Color(0xffffff)}
          envMapIntensity={3.0}
          transparent
          opacity={0.9}
          side={THREE.DoubleSide}
        />
      </mesh>
    </RigidBody>
  );
}

// ─── Invisible Mouse Repulsor ─────────────────────────────────────────────
function MouseRepulsor({ explode }: { explode: boolean }) {
  const bodyRef = useRef<RapierRigidBody>(null);
  const { viewport } = useThree();
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), []);
  const worldPos = useRef(new THREE.Vector3());

  useFrame(({ mouse, raycaster, camera }) => {
    if (!bodyRef.current) return;
    raycaster.setFromCamera(mouse, camera);
    raycaster.ray.intersectPlane(plane, worldPos.current);
    bodyRef.current.setNextKinematicTranslation({
      x: worldPos.current.x,
      y: worldPos.current.y,
      z: worldPos.current.z
    });
  });

  return (
    <RigidBody ref={bodyRef} type="kinematicPosition" colliders={false} restitution={1.2}>
      <BallCollider args={[2.8]} />
    </RigidBody>
  );
}

// ─── Magnetic Cursor Particles ────────────────────────────────────────────
function MagneticParticles() {
  const COUNT = 60;
  const geoRef  = useRef<THREE.BufferGeometry>(null);
  const plane   = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), []);
  const mouse3D = useRef(new THREE.Vector3());

  const { positions, colors, particleData } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const colors    = new Float32Array(COUNT * 3);
    const particleData = [];
    for (let i = 0; i < COUNT; i++) {
      positions[i*3]   = (Math.random()-0.5)*16;
      positions[i*3+1] = (Math.random()-0.5)*10;
      positions[i*3+2] = (Math.random()-0.5)*3;
      const c = new THREE.Color().setHSL((i/COUNT)*0.7+0.6, 1, 0.65);
      colors[i*3] = c.r; colors[i*3+1] = c.g; colors[i*3+2] = c.b;
      particleData.push({
        vx: 0, vy: 0,
        angle: Math.random() * Math.PI * 2,
        radius: 1.5 + Math.random() * 2.5
      });
    }
    return { positions, colors, particleData };
  }, []);

  useFrame(({ mouse, raycaster, camera, clock }) => {
    if (!geoRef.current) return;
    raycaster.setFromCamera(mouse, camera);
    raycaster.ray.intersectPlane(plane, mouse3D.current);
    const pos = geoRef.current.attributes.position.array as Float32Array;
    const t = clock.getElapsedTime();
    for (let i = 0; i < COUNT; i++) {
      const pd = particleData[i];
      pd.angle += 0.012 + i * 0.0002;
      const tx = mouse3D.current.x + Math.cos(pd.angle) * pd.radius * 0.2;
      const ty = mouse3D.current.y + Math.sin(pd.angle) * pd.radius * 0.2;
      const dx = tx - pos[i*3];
      const dy = ty - pos[i*3+1];
      pd.vx = pd.vx * 0.88 + dx * 0.018;
      pd.vy = pd.vy * 0.88 + dy * 0.018;
      pos[i*3]   += pd.vx;
      pos[i*3+1] += pd.vy;
      pos[i*3+2] += Math.sin(t * 0.4 + i) * 0.005;
    }
    geoRef.current.attributes.position.needsUpdate = true;
  });

  return (
    <points>
      <bufferGeometry ref={geoRef}>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.065}
        vertexColors
        transparent
        opacity={0.85}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

// ─── Dynamic Lighting ─────────────────────────────────────────────────────
function DynamicLights() {
  const purpleRef = useRef<THREE.PointLight>(null);
  const cyanRef   = useRef<THREE.PointLight>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (purpleRef.current) {
      purpleRef.current.position.x = Math.sin(t * 0.3) * 9;
      purpleRef.current.position.y = Math.cos(t * 0.2) * 6;
    }
    if (cyanRef.current) {
      cyanRef.current.position.x = Math.cos(t * 0.25) * 9;
      cyanRef.current.position.y = Math.sin(t * 0.35) * 6;
    }
  });
  return (
    <>
      <ambientLight color="#1a0040" intensity={2.5} />
      <pointLight ref={purpleRef} color="#7c3aed" intensity={120} distance={40} />
      <pointLight ref={cyanRef}   color="#38bdf8" intensity={100} distance={40} />
      <pointLight position={[0, 8, -6]}  color="#f472b6" intensity={60}  distance={30} />
      <directionalLight position={[5, 10, 8]} intensity={1.2} />
    </>
  );
}

// ─── Camera Parallax ──────────────────────────────────────────────────────
function CameraParallax() {
  useFrame(({ camera, mouse }) => {
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, mouse.x * 1.2, 0.035);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, mouse.y * 0.8, 0.035);
    camera.lookAt(0, 0, 0);
  });
  return null;
}

// ─── Physics Scene ────────────────────────────────────────────────────────
const GEOMETRIES = [
  new THREE.TorusKnotGeometry(0.8, 0.28, 128, 20, 2, 3),
  new THREE.TorusKnotGeometry(0.9, 0.22, 128, 16, 3, 5),
  new THREE.TorusKnotGeometry(0.75, 0.30, 128, 20, 2, 5),
  new THREE.IcosahedronGeometry(1.0, 0),
  new THREE.IcosahedronGeometry(0.8, 1),
  new THREE.IcosahedronGeometry(1.1, 0),
  new THREE.OctahedronGeometry(1.0, 0),
  new THREE.OctahedronGeometry(0.85, 1),
  new THREE.TetrahedronGeometry(1.0, 0),
  new THREE.TetrahedronGeometry(1.2, 1),
  new THREE.DodecahedronGeometry(0.9, 0),
  new THREE.TorusGeometry(0.9, 0.28, 32, 64),
  new THREE.TorusGeometry(1.1, 0.18, 48, 80),
  new THREE.SphereGeometry(0.85, 64, 64),
  new THREE.ConeGeometry(0.7, 1.6, 6),
  new THREE.BoxGeometry(1.0, 1.0, 1.0, 3, 3, 3),
  new THREE.CapsuleGeometry(0.35, 0.9, 12, 32),
  new THREE.RingGeometry(0.5, 1.0, 48, 4),
  new THREE.CylinderGeometry(0.5, 0.5, 1.4, 7),
].concat(
  // Custom star extrusion
  (() => {
    const sh = new THREE.Shape();
    for (let i=0;i<10;i++){
      const r = i%2===0?1.0:0.42;
      const a = (i/10)*Math.PI*2-Math.PI/2;
      i===0?sh.moveTo(Math.cos(a)*r,Math.sin(a)*r):sh.lineTo(Math.cos(a)*r,Math.sin(a)*r);
    }
    sh.closePath();
    return [new THREE.ExtrudeGeometry(sh, {depth:0.35,bevelEnabled:true,bevelSize:0.08,bevelSegments:4})];
  })()
);

function PhysicsScene({ explode }: { explode: boolean }) {
  const TOTAL = 25;
  const bodies = useMemo(() => {
    return Array.from({ length: TOTAL }, (_, i) => ({
      geo: GEOMETRIES[i % GEOMETRIES.length],
      hue: i / TOTAL
    }));
  }, []);

  return (
    <>
      <MouseRepulsor explode={explode} />
      {bodies.map((b, i) => (
        <GlassMesh key={i} geo={b.geo} hue={b.hue} index={i} />
      ))}
    </>
  );
}

// ─── Framer Motion Headline Overlay ───────────────────────────────────────
const words = ['THE', 'NEW', 'WEB'];

function UIOverlay({ onExplode }: { onExplode: () => void }) {
  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-center items-center select-none">
      <motion.p
        className="text-[0.7rem] tracking-[0.35em] uppercase text-violet-400 mb-4"
        initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        Zero Gravity · Interactive Physics
      </motion.p>

      <h1 className="leading-none text-center">
        {words.map((word, i) => (
          <motion.span
            key={word}
            className="block text-[clamp(3.5rem,12vw,10rem)] font-black tracking-tighter bg-gradient-to-br from-white via-violet-300 to-sky-400 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 40, skewX: -3 }}
            animate={{ opacity: 1, y: 0, skewX: 0 }}
            transition={{ duration: 1.0, delay: 0.5 + i * 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            {word}
          </motion.span>
        ))}
      </h1>

      <motion.p
        className="mt-6 text-[clamp(0.75rem,1.8vw,1rem)] font-light tracking-wide text-violet-300/70 max-w-[42ch] text-center leading-relaxed"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.0, delay: 1.1, ease: [0.16, 1, 0.3, 1] }}
      >
        An immersive physics simulation at the intersection of art and engineering.
      </motion.p>

      <motion.div
        className="mt-10 flex gap-4 pointer-events-auto"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.0, delay: 1.3, ease: [0.16, 1, 0.3, 1] }}
      >
        <button
          onClick={onExplode}
          className="px-8 py-3.5 rounded-full bg-gradient-to-r from-violet-600 to-blue-600 text-white text-xs font-bold tracking-widest uppercase shadow-[0_0_32px_rgba(124,58,237,0.5)] hover:scale-105 hover:shadow-[0_0_48px_rgba(124,58,237,0.7)] transition-all duration-200 active:scale-95"
        >
          Detonate
        </button>
        <button className="px-8 py-3.5 rounded-full border border-white/20 text-white/70 text-xs font-light tracking-widest uppercase hover:border-violet-400 hover:text-violet-300 transition-colors duration-200">
          Explore work
        </button>
      </motion.div>

      {/* Status bar */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-9 text-[0.6rem] tracking-[0.2em] uppercase text-violet-400/35"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.7 }}
      >
        <span><span className="inline-block w-1.5 h-1.5 rounded-full bg-violet-400 mr-1.5 animate-ping align-middle" />Live Physics</span>
        <span>25 Bodies</span>
        <span>R3F + Rapier</span>
        <span>60 FPS</span>
      </motion.div>
    </div>
  );
}

// ─── Root Component ───────────────────────────────────────────────────────
export default function ZeroGravityHero() {
  const [explode, setExplode] = useState(false);

  const handleExplode = useCallback(() => {
    setExplode(true);
    setTimeout(() => setExplode(false), 1200);
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#040008]">
      {/* Tailwind radial overlays */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(124,58,237,0.20),transparent)] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(56,189,248,0.12),transparent_40%)] pointer-events-none z-0" />

      {/* 3D Canvas */}
      <div className="absolute inset-0 z-10">
        <Canvas
          camera={{ position: [0, 0, 14], fov: 50 }}
          gl={{
            antialias: true,
            powerPreference: 'high-performance',
            alpha: false,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.4
          }}
          dpr={[1, 2]}
          onPointerDown={handleExplode}
        >
          <CameraParallax />
          <DynamicLights />
          <NebulaBg />

          <Suspense fallback={null}>
            <Environment preset="city" />
            <Physics gravity={[0, 0, 0]}>
              <PhysicsScene explode={explode} />
            </Physics>
          </Suspense>

          <MagneticParticles />

          {/* Post Processing */}
          <EffectComposer multisampling={0}>
            <Bloom
              intensity={1.45}
              luminanceThreshold={0.22}
              luminanceSmoothing={0.9}
              kernelSize={KernelSize.LARGE}
              blendFunction={BlendFunction.ADD}
            />
            <DepthOfField
              focusDistance={0.01}
              focalLength={0.018}
              bokehScale={2.5}
              height={480}
            />
            <ChromaticAberration
              offset={new THREE.Vector2(0.0008, 0.0008) as any}
              blendFunction={BlendFunction.NORMAL}
            />
            <Noise
              premultiply
              blendFunction={BlendFunction.SOFT_LIGHT}
              opacity={0.22}
            />
            <Vignette
              offset={0.35}
              darkness={0.65}
              blendFunction={BlendFunction.NORMAL}
            />
          </EffectComposer>
        </Canvas>
      </div>

      {/* Framer Motion UI */}
      <UIOverlay onExplode={handleExplode} />
    </div>
  );
}
