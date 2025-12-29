// src/pages/Landing.jsx - Updated with viewport optimization ONLY
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, Sphere, Preload, Ring } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, Suspense, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import * as THREE from "three";

/* -----------------------------------------------------------
   VIEWPORT OPTIMIZATION (NEW)
----------------------------------------------------------- */
function useInView(options = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      { threshold: 0.15, ...options }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [options]);

  return [ref, inView];
}

function ViewportSection({ children }) {
  const [ref, inView] = useInView();

  return (
    <div ref={ref} style={{ minHeight: "100vh" }}>
      {inView && children}
    </div>
  );
}

/* -----------------------------------------------------------
   CUSTOM CURSOR WITH AURORA TRAIL + STARS (Fixed: No sun spin, sharper stars)
----------------------------------------------------------- */
function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [trail, setTrail] = useState([]);
  const cursorRef = useRef(null);
  const rafRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const newPos = { x: e.clientX, y: e.clientY, id: Date.now() };
      setPosition(newPos);

      setTrail((prev) => {
        const newTrail = [...prev, newPos].slice(-40);
        return newTrail;
      });
    });
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);

    const interval = setInterval(() => {
      setTrail((prev) => prev.filter((p) => Date.now() - p.id < 1200));
    }, 50);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      clearInterval(interval);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [handleMouseMove]);

  return (
    <>
      {trail.map((pos, index) => {
        const age = Date.now() - pos.id;
        const opacity = Math.max(0, 1 - age / 1200);
        const scale = 1 - index / trail.length;
        const isStar = index % 3 === 0;

        return (
          <motion.div
            key={pos.id}
            className="fixed pointer-events-none z-[9999]"
            style={{
              left: pos.x,
              top: pos.y,
              transform: "translate(-50%, -50%)",
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: opacity * 0.8,
              scale: scale * 3,
            }}
            transition={{ duration: 0.1 }}
          >
            {isStar ? (
              <div
                className="w-8 h-8"
                style={{
                  background: `radial-gradient(circle, 
                    rgba(255, 255, 255, ${opacity * 1}) 0%,
                    rgba(255, 215, 0, ${opacity * 0.7}) 30%,
                    transparent 50%)`,
                  clipPath:
                    "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
                  filter: `blur(${2 + Math.random() * 2}px) brightness(${
                    1 + Math.sin(Date.now() / 200) * 0.5
                  })`,
                }}
              />
            ) : (
              <div
                className="w-12 h-12 rounded-full"
                style={{
                  background: `radial-gradient(circle,
                    rgba(0, 255, 127, ${opacity}) 0%,
                    rgba(138, 43, 226, ${opacity * 0.9}) 25%,
                    rgba(255, 20, 147, ${opacity * 0.8}) 50%,
                    rgba(0, 191, 255, ${opacity * 0.7}) 75%,
                    transparent 100%)`,
                  filter: "blur(16px)",
                }}
              />
            )}
          </motion.div>
        );
      })}

      <motion.div
        ref={cursorRef}
        className="fixed pointer-events-none z-[10000]"
        style={{
          left: position.x,
          top: position.y,
          transform: "translate(-50%, -50%)",
        }}
      >
        <div className="absolute inset-0 w-12 h-12 -translate-x-1/2 -translate-y-1/2">
          <div
            className="w-full h-full rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(255, 200, 0, 0.4) 0%, rgba(255, 150, 0, 0.2) 40%, transparent 70%)",
              filter: "blur(4px)",
            }}
          />
        </div>

        <div className="relative w-6 h-6 -translate-x-1/2 -translate-y-1/2">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle, #ffed4e 0%, #ff9d00 50%, #ff6b00 100%)",
              boxShadow:
                "0 0 20px rgba(255, 200, 0, 0.8), 0 0 40px rgba(255, 150, 0, 0.4)",
            }}
          />

          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute top-1/2 left-1/2 w-1 h-3 bg-gradient-to-t from-yellow-400 to-orange-500"
              style={{
                transform: `translate(-50%, -50%) rotate(${i * 45}deg) translateY(-8px)`,
                transformOrigin: "center",
                borderRadius: "2px",
              }}
            />
          ))}
        </div>
      </motion.div>
    </>
  );
}

/* -----------------------------------------------------------
   FLOATING PARTICLES
----------------------------------------------------------- */
function FloatingParticles() {
  const particlesRef = useRef();
  const particleCount = 100;

  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 20;

    const color = new THREE.Color();
    color.setHSL(Math.random(), 0.8, 0.6);
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }

  useFrame(({ clock }) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = clock.getElapsedTime() * 0.05;
      particlesRef.current.rotation.x = clock.getElapsedTime() * 0.02;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particleCount}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
}

/* -----------------------------------------------------------
   EXTRA STARS
----------------------------------------------------------- */
function ExtraStars() {
  return (
    <Stars
      radius={120}
      depth={80}
      count={8000}
      factor={4}
      saturation={0.8}
      fade
      speed={0.2}
    />
  );
}

/* -----------------------------------------------------------
   ENHANCED PLANET COMPONENT
----------------------------------------------------------- */
function Planet({
  position,
  color,
  scale: initialScale = 1,
  ringColor,
  ringScale = 1.3,
}) {
  const groupRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += hovered ? 0.02 : 0.01;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <mesh
        onPointerEnter={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerLeave={(e) => {
          e.stopPropagation();
          setHovered(false);
        }}
      >
        <Sphere
          args={[1, 64, 64]}
          scale={hovered ? initialScale * 1.15 : initialScale}
        >
          <meshStandardMaterial
            color={hovered ? `${color}ff` : color}
            emissive={hovered ? color : `${color}80`}
            emissiveIntensity={hovered ? 1.0 : 0.8}
            roughness={hovered ? 0.05 : 0.1}
            metalness={hovered ? 1.0 : 0.9}
          />
        </Sphere>
      </mesh>

      <Sphere args={[1.15 * initialScale, 32, 32]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 0.6 : 0.4}
          transparent
          opacity={hovered ? 0.7 : 0.5}
          side={THREE.BackSide}
        />
      </Sphere>

      {ringColor && (
        <Ring
          args={[
            1.2 * initialScale,
            ringScale * initialScale,
            64,
          ]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <meshBasicMaterial
            color={ringColor}
            transparent
            opacity={hovered ? 0.9 : 0.7}
            side={THREE.DoubleSide}
          />
        </Ring>
      )}
    </group>
  );
}

/* -----------------------------------------------------------
   MAIN SCENE
----------------------------------------------------------- */
function Scene() {
  return (
    <>
      <ambientLight intensity={0.7} />
      <pointLight position={[0, 0, 5]} intensity={2.5} color="#ffffff" />
      <directionalLight
        position={[-10, 10, 5]}
        intensity={1.5}
        color="#3b82f6"
      />
      <directionalLight
        position={[10, -10, 5]}
        intensity={1.2}
        color="#a855f7"
      />
      <hemisphereLight
        intensity={0.8}
        skyColor="#3b82f6"
        groundColor="#a855f7"
      />

      <Stars
        radius={80}
        depth={40}
        count={4000}
        factor={5}
        saturation={0.8}
        fade
        speed={0.4}
      />

      <Planet
        position={[-3.5, 1.5, -3]}
        color="#3b82f6"
        scale={1.8}
        ringColor="#60a5fa"
        ringScale={1.6}
      />
      <Planet
        position={[3.5, -0.5, -2.5]}
        color="#a855f7"
        scale={2.2}
        ringColor="#c084fc"
        ringScale={1.7}
      />
      <Planet
        position={[-1.5, -2.5, -4]}
        color="#f59e0b"
        scale={1.4}
      />
      <Planet
        position={[1.5, 2.5, -3.5]}
        color="#10b981"
        scale={1.6}
        ringColor="#34d399"
        ringScale={1.4}
      />
      <Planet
        position={[4.5, 0.5, -4.5]}
        color="#ef4444"
        scale={1.7}
      />
      <Planet
        position={[-4.5, -1.5, -2]}
        color="#8b5cf6"
        scale={1.9}
      />

      <FloatingParticles />
    </>
  );
}

/* -----------------------------------------------------------
   MAIN PAGE
----------------------------------------------------------- */
export default function Landing() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 600);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (loaded) {
      document.documentElement.style.cursor = "none";
      document.body.style.cursor = "none";

      const style = document.createElement("style");
      style.textContent = `
        * {
          cursor: none !important;
        }
        input:focus, button:focus, a:focus {
          outline: none;
        }
      `;
      document.head.appendChild(style);

      return () => {
        document.documentElement.style.cursor = "default";
        document.body.style.cursor = "default";
        if (document.head.contains(style)) {
          document.head.removeChild(style);
        }
      };
    }
    return () => {
      document.documentElement.style.cursor = "default";
      document.body.style.cursor = "default";
    };
  }, [loaded]);

  return (
    <div className="w-full min-h-screen bg-black text-white overflow-x-hidden relative font-sans antialiased">
      <AnimatePresence>
        {!loaded && (
          <motion.div
            className="fixed inset-0 bg-gradient-to-br from-black via-blue-900/20 to-purple-900/20 z-[999] flex flex-col items-center justify-center"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <motion.div
              className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "linear",
              }}
            />
            <motion.p
              className="mt-6 text-gray-300 text-lg font-light"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Initializing AI Universe...
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3D CANVAS */}
      <div className="fixed inset-0 z-0">
        <Canvas
          frameloop="always"
          camera={{ position: [0, 0, 6], fov: 65 }}
          gl={{
            alpha: false,
            antialias: true,
            powerPreference: "high-performance",
            toneMapping: THREE.ACESFilmicToneMapping,
            outputEncoding: THREE.sRGBEncoding,
          }}
          style={{
            background:
              "linear-gradient(135deg, #000000 0%, #0a0a1a 50%, #000000 100%)",
          }}
        >
          <Suspense fallback={null}>
            <Scene />
            <ExtraStars />
          </Suspense>
          <Preload all />
        </Canvas>
      </div>

      <div className="relative z-10">
        {/* HERO SECTION */}
        <ViewportSection>
          <section className="h-screen flex flex-col items-center justify-center text-center px-4 relative">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-pulse" />
            <div
              className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse"
              style={{ animationDelay: "1s" }}
            />

            <motion.div
              className="relative z-10"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            >
              <motion.h1
                className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-extrabold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-300 bg-clip-text text-transparent drop-shadow-2xl leading-tight"
                animate={{
                  textShadow: [
                    "0 0 20px rgba(59, 130, 246, 0.5)",
                    "0 0 40px rgba(168, 85, 247, 0.5)",
                    "0 0 20px rgba(59, 130, 246, 0.5)",
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                CareerPathAI
              </motion.h1>

              <motion.div
                className="mt-4 h-1 w-64 mx-auto bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-full"
                animate={{ scaleX: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>

            <motion.div
              className="mt-8 relative z-10 backdrop-blur-xl bg-white/5 rounded-3xl p-8 border border-white/10 shadow-2xl max-w-3xl"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
            >
              <p className="text-base sm:text-lg md:text-xl text-gray-200 leading-relaxed">
                Your AI-powered guide to career mastery — built for the future.
              </p>

              <div className="mt-6 flex items-center justify-center gap-8 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span>AI-Powered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                  <span>Personalized</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                  <span>Futuristic</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="mt-12 flex flex-col sm:flex-row gap-4 sm:gap-6 relative z-10"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              <Link
                to="/register"
                className="group relative px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 hover:shadow-blue-500/50 hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative z-10 font-semibold text-lg">
                  Get Started
                </span>
                <div className="absolute inset-0 -z-10 bg-gradient-to-r from-blue-600 to-purple-600 blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
              </Link>

              <Link
                to="/login"
                className="group relative px-10 py-4 bg-white/5 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden transition-all duration-300 hover:bg-white/10 hover:border-white/30 hover:scale-105"
              >
                <span className="relative z-10 font-semibold text-lg">
                  Login
                </span>
              </Link>
            </motion.div>

            <motion.div
              className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
                <motion.div
                  className="w-1.5 h-1.5 bg-white rounded-full"
                  animate={{ y: [0, 12, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
            </motion.div>
          </section>
        </ViewportSection>

        {/* ABOUT SECTION 1 */}
        <ViewportSection>
          <section className="h-screen flex items-center justify-center px-6 py-20 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-blue-900/20 to-black/40" />

            <motion.div
              className="max-w-5xl mx-auto relative z-10"
              initial={{ opacity: 0, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
            >
              <div className="backdrop-blur-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-3xl p-12 border border-blue-400/20 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 rounded-3xl overflow-hidden">
                  <div className="absolute inset-[-2px] bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 opacity-20 animate-pulse" />
                </div>

                <div className="relative z-10">
                  <motion.div
                    className="inline-block px-6 py-2 bg-blue-500/20 backdrop-blur-xl rounded-full border border-blue-400/30 mb-6"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <span className="text-blue-300 text-sm font-semibold">
                      WHAT WE DO
                    </span>
                  </motion.div>

                  <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-300 via-blue-400 to-blue-500 bg-clip-text text-transparent mb-8">
                    What Does CareerPathAI Do?
                  </h2>

                  <p className="text-gray-300 text-lg md:text-xl leading-relaxed mb-8">
                    CareerPathAI analyzes your skills, interests, and experience
                    to generate personalized AI roadmaps, job recommendations,
                    and structured progress tracking.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
                    <motion.div
                      className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-blue-400/50 transition-all duration-300"
                      whileHover={{ scale: 1.05, y: -5 }}
                    >
                      <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
                        <span className="text-2xl">🎯</span>
                      </div>
                      <h3 className="text-xl font-bold text-blue-300 mb-2">
                        AI Roadmaps
                      </h3>
                      <p className="text-gray-400 text-sm">
                        Personalized learning paths tailored to your goals
                      </p>
                    </motion.div>

                    <motion.div
                      className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-purple-400/50 transition-all duration-300"
                      whileHover={{ scale: 1.05, y: -5 }}
                    >
                      <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4">
                        <span className="text-2xl">💼</span>
                      </div>
                      <h3 className="text-xl font-bold text-purple-300 mb-2">
                        Job Matching
                      </h3>
                      <p className="text-gray-400 text-sm">
                        Smart recommendations based on your profile
                      </p>
                    </motion.div>

                    <motion.div
                      className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-cyan-400/50 transition-all duration-300"
                      whileHover={{ scale: 1.05, y: -5 }}
                    >
                      <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center mb-4">
                        <span className="text-2xl">📊</span>
                      </div>
                      <h3 className="text-xl font-bold text-cyan-300 mb-2">
                        Progress Tracking
                      </h3>
                      <p className="text-gray-400 text-sm">
                        Monitor your growth with detailed analytics
                      </p>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          </section>
        </ViewportSection>

        {/* ABOUT SECTION 2 */}
        <ViewportSection>
          <section className="h-screen flex items-center justify-center px-6 py-20 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-purple-900/20 to-black/40" />

            <motion.div
              className="max-w-5xl mx-auto relative z-10"
              initial={{ opacity: 0, x: -100 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
            >
              <div className="backdrop-blur-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-3xl p-12 border border-purple-400/20 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />

                <div className="relative z-10">
                  <motion.div
                    className="inline-block px-6 py-2 bg-purple-500/20 backdrop-blur-xl rounded-full border border-purple-400/30 mb-6"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: 0.5,
                    }}
                  >
                    <span className="text-purple-300 text-sm font-semibold">
                      FRONTEND ENGINEER
                    </span>
                  </motion.div>

                  <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-300 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-6">
                    Meet Arsh Mishra
                  </h2>

                  <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="flex-1">
                      <p className="text-gray-300 text-lg leading-relaxed mb-6">
                        Arsh crafted the entire frontend with 3D visuals,
                        animations, UX and futuristic design.
                      </p>

                      <div className="flex flex-wrap gap-3">
                        {["React", "Three.js", "Framer Motion", "Tailwind"].map(
                          (tech, i) => (
                            <motion.span
                              key={tech}
                              className="px-4 py-2 bg-purple-500/20 backdrop-blur-xl rounded-full border border-purple-400/30 text-purple-200 text-sm"
                              initial={{ opacity: 0, scale: 0 }}
                              whileInView={{ opacity: 1, scale: 1 }}
                              viewport={{ once: true }}
                              transition={{ delay: i * 0.1 }}
                            >
                              {tech}
                            </motion.span>
                          )
                        )}
                      </div>
                    </div>

                    <motion.div
                      className="w-48 h-48 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-3xl backdrop-blur-xl border border-purple-400/30 flex items-center justify-center"
                      whileHover={{ rotate: 5, scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                    >
                      <span className="text-7xl">👨‍💻</span>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          </section>
        </ViewportSection>

        {/* ABOUT SECTION 3 */}
        <ViewportSection>
          <section className="h-screen flex items-center justify-center px-6 py-20 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-cyan-900/20 to-black/40" />

            <motion.div
              className="max-w-5xl mx-auto relative z-10"
              initial={{ opacity: 0, x: 100 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
            >
              <div className="backdrop-blur-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-3xl p-12 border border-cyan-400/20 shadow-2xl relative overflow-hidden">
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl" />

                <div className="relative z-10">
                  <motion.div
                    className="inline-block px-6 py-2 bg-cyan-500/20 backdrop-blur-xl rounded-full border border-cyan-400/30 mb-6"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: 1,
                    }}
                  >
                    <span className="text-cyan-300 text-sm font-semibold">
                      BACKEND ARCHITECT
                    </span>
                  </motion.div>

                  <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-cyan-300 via-cyan-400 to-blue-400 bg-clip-text text-transparent mb-6">
                    Abhijit More
                  </h2>

                  <div className="flex flex-col md:flex-row gap-8 items-center">
                    <motion.div
                      className="w-48 h-48 bg-gradient-to-br from-cyan-500/30 to-blue-500/30 rounded-3xl backdrop-blur-xl border border-cyan-400/30 flex items-center justify-center order-2 md:order-1"
                      whileHover={{ rotate: -5, scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                    >
                      <span className="text-7xl">🔧</span>
                    </motion.div>

                    <div className="flex-1 order-1 md:order-2">
                      <p className="text-gray-300 text-lg leading-relaxed mb-6">
                        Abhijit built the secure backend, analytics, AI
                        pipelines, authentication systems, and data
                        architecture.
                      </p>

                      <div className="flex flex-wrap gap-3">
                        {["Node.js", "Python", "AI/ML", "Database"].map(
                          (tech, i) => (
                            <motion.span
                              key={tech}
                              className="px-4 py-2 bg-cyan-500/20 backdrop-blur-xl rounded-full border border-cyan-400/30 text-cyan-200 text-sm"
                              initial={{ opacity: 0, scale: 0 }}
                              whileInView={{ opacity: 1, scale: 1 }}
                              viewport={{ once: true }}
                              transition={{ delay: i * 0.1 }}
                            >
                              {tech}
                            </motion.span>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </section>
        </ViewportSection>

        {/* FOOTER */}
        <ViewportSection>
          <footer className="h-screen relative py-20 text-center overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-t from-black via-blue-900/10 to-transparent" />

            <motion.div
              className="relative z-10 max-w-4xl mx-auto px-6"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="backdrop-blur-2xl bg-white/5 rounded-3xl p-10 border border-white/10">
                <motion.div
                  className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-300 bg-clip-text text-transparent mb-4"
                  animate={{
                    backgroundPosition: ["0%", "100%", "0%"],
                  }}
                  transition={{ duration: 5, repeat: Infinity }}
                >
                  CareerPathAI
                </motion.div>

                <div className="h-px w-64 mx-auto bg-gradient-to-r from-transparent via-blue-400 to-transparent mb-6" />

                <p className="text-gray-400 mb-6">
                  &copy; 2025 CareerPathAI — Built by Arsh Mishra & Abhijit More
                </p>

                <div className="flex justify-center gap-6">
                  <motion.div
                    className="w-12 h-12 bg-blue-500/20 backdrop-blur-xl rounded-full border border-blue-400/30 flex items-center justify-center cursor-pointer"
                    whileHover={{ scale: 1.2, rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <span className="text-blue-400">★</span>
                  </motion.div>

                  <motion.div
                    className="w-12 h-12 bg-purple-500/20 backdrop-blur-xl rounded-full border border-purple-400/30 flex items-center justify-center cursor-pointer"
                    whileHover={{ scale: 1.2, rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <span className="text-purple-400">♦</span>
                  </motion.div>

                  <motion.div
                    className="w-12 h-12 bg-cyan-500/20 backdrop-blur-xl rounded-full border border-cyan-400/30 flex items-center justify-center cursor-pointer"
                    whileHover={{ scale: 1.2, rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <span className="text-cyan-400">●</span>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
          </footer>
        </ViewportSection>
      </div>

      {loaded && <CustomCursor />}
    </div>
  );
}