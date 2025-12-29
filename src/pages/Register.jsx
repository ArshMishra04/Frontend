// src/pages/Register.jsx - Full file with fixed navigation (useNavigate)
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, Sphere, Preload, Ring } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, Suspense, useRef, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";  // FIXED: Added useNavigate
import * as THREE from "three";

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
      <pointsMaterial size={0.1} vertexColors transparent opacity={0.8} sizeAttenuation />
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
function Planet({ position, color, scale: initialScale = 1, ringColor, ringScale = 1.3 }) {
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
        <Sphere args={[1, 64, 64]} scale={hovered ? initialScale * 1.15 : initialScale}>
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
          args={[1.2 * initialScale, ringScale * initialScale, 64]}
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
   MAIN SCENE - Signup Theme (Birth of New Stars)
----------------------------------------------------------- */
function Scene() {
  return (
    <>
      <ambientLight intensity={0.7} />
      <pointLight position={[0, 0, 5]} intensity={2.5} color="#ffffff" />
      <directionalLight position={[-10, 10, 5]} intensity={1.5} color="#10b981" />
      <directionalLight position={[10, -10, 5]} intensity={1.2} color="#06b6d4" />
      <hemisphereLight intensity={0.8} skyColor="#10b981" groundColor="#06b6d4" />
      <Stars
        radius={80}
        depth={40}
        count={4000}
        factor={5}
        saturation={0.8}
        fade
        speed={0.4}
      />
      {/* Central Birth Planet */}
      <Planet position={[0, 0, -3]} color="#10b981" scale={3.2} ringColor="#34d399" ringScale={2.0} />
      {/* Orbiting Creation Planets */}
      <Planet position={[-3, 1.5, -4]} color="#06b6d4" scale={1.3} ringColor="#22d3ee" ringScale={1.4} />
      <Planet position={[3, -1, -4.5]} color="#14b8a6" scale={1.6} />
      <Planet position={[0, 2.5, -5]} color="#059669" scale={1.1} />
      <Planet position={[-2, -2, -3.5]} color="#0891b2" scale={1.4} ringColor="#06b6d4" ringScale={1.3} />
     
      <FloatingParticles />
    </>
  );
}

/* -----------------------------------------------------------
   MAIN REGISTER PAGE
----------------------------------------------------------- */
export default function Register() {  // Renamed from Signup for your file name
  const [loaded, setLoaded] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [terms, setTerms] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();  // FIXED: Added for smooth redirect

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 1000);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  useEffect(() => {
    if (loaded) {
      document.documentElement.style.cursor = 'none';
      document.body.style.cursor = 'none';

      const style = document.createElement('style');
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
        document.documentElement.style.cursor = 'default';
        document.body.style.cursor = 'default';
        if (document.head.contains(style)) {
          document.head.removeChild(style);
        }
      };
    }
  }, [loaded]);

  const handleSubmit = (e) => {  // FIXED: Use navigate instead of window.location
    e.preventDefault();
    // Add real signup logic here (e.g., API call)
    navigate("/dashboard");  // Smooth SPA redirect
  };

  return (
    <div className="w-full min-h-screen bg-black text-white overflow-x-hidden relative font-sans antialiased">
      {/* LOADING SCREEN - Star Birth Effect */}
      <AnimatePresence>
        {!loaded && (
          <motion.div
            className="fixed inset-0 bg-gradient-to-br from-black via-green-900/40 to-cyan-900/40 z-[999] flex flex-col items-center justify-center"
            initial={{ opacity: 1, scale: 1.2 }}
            animate={{ opacity: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.0, ease: "easeInOut" }}
          >
            <motion.div
              className="relative"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <motion.div
                className="w-24 h-24 border-4 border-green-500 border-t-transparent rounded-full relative"
                animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-400 to-cyan-400 blur-xl opacity-50" />
              </motion.div>
              
              {/* Birth particles */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute top-1/2 left-1/2 w-2 h-2 bg-green-400 rounded-full"
                  style={{
                    transform: `translate(-50%, -50%) rotate(${i * 45}deg) translateY(-40px)`,
                  }}
                  animate={{
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </motion.div>
            
            <motion.p
              className="mt-6 text-green-300 text-xl font-light"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Initiating New Journey...
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3D CANVAS */}
      <div className="fixed inset-0 z-0">
        <Canvas
          frameloop="always"
          camera={{ position: [0, 0, 8], fov: 70 }}
          gl={{
            alpha: false,
            antialias: true,
            powerPreference: "high-performance",
            toneMapping: THREE.ACESFilmicToneMapping,
            outputEncoding: THREE.sRGBEncoding,
          }}
          style={{
            background: "linear-gradient(135deg, #000000 0%, #0a1a0a 50%, #000000 100%)"
          }}
        >
          <Suspense fallback={null}>
            <Scene />
            <ExtraStars />
          </Suspense>
          <Preload all />
        </Canvas>
      </div>

      {/* UI ABOVE 3D */}
      <div className="relative z-10">
        {/* REGISTER SECTION */}
        <section className="min-h-screen flex items-center justify-center text-center px-4 py-8 relative">
          {/* Animated gradient orbs */}
          <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-green-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }} />
         
          <AnimatePresence>
            {loaded && (
              <motion.div
                className="relative z-10 w-full max-w-md"
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -30, scale: 0.95 }}
                transition={{ duration: 1.0, ease: "easeInOut" }}
              >
                <motion.h2
                  className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-green-400 via-cyan-400 to-teal-300 bg-clip-text text-transparent drop-shadow-2xl mb-4"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1, duration: 0.6 }}
                >
                  <motion.span
                    animate={{
                      textShadow: [
                        "0 0 20px rgba(16, 185, 129, 0.5)",
                        "0 0 40px rgba(6, 182, 212, 0.5)",
                        "0 0 20px rgba(16, 185, 129, 0.5)"
                      ]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    Begin Your Journey ✨
                  </motion.span>
                </motion.h2>
                
                <motion.p
                  className="text-gray-300 mb-8 text-lg md:text-xl leading-relaxed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  Create your account and unlock infinite possibilities
                </motion.p>

                <motion.form
                  className="backdrop-blur-2xl bg-white/5 rounded-3xl p-8 md:p-10 border border-white/10 shadow-2xl w-full relative overflow-hidden"
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.7, ease: "easeInOut" }}
                >
                  {/* Animated border effect */}
                  <div className="absolute inset-0 rounded-3xl overflow-hidden">
                    <div className="absolute inset-[-2px] bg-gradient-to-r from-green-400 via-cyan-400 to-teal-400 opacity-30 animate-pulse" />
                  </div>

                  <div className="relative z-10 flex flex-col gap-5">
                    {/* Full Name */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6, duration: 0.4 }}
                    >
                      <label className="text-gray-300 text-sm block mb-2 text-left">Full Name</label>
                      <input
                        type="text"
                        placeholder="Enter your full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-4 rounded-xl bg-white/10 text-white outline-none focus:ring-2 focus:ring-green-500 transition-all border border-white/20 placeholder:text-gray-500"
                        required
                      />
                    </motion.div>

                    {/* Email */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7, duration: 0.4 }}
                    >
                      <label className="text-gray-300 text-sm block mb-2 text-left">Email Address</label>
                      <input
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-4 rounded-xl bg-white/10 text-white outline-none focus:ring-2 focus:ring-green-500 transition-all border border-white/20 placeholder:text-gray-500"
                        required
                      />
                    </motion.div>

                    {/* Password */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8, duration: 0.4 }}
                    >
                      <label className="text-gray-300 text-sm block mb-2 text-left">Password</label>
                      <input
                        type="password"
                        placeholder="Create a secure password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-4 rounded-xl bg-white/10 text-white outline-none focus:ring-2 focus:ring-green-500 transition-all border border-white/20 placeholder:text-gray-500"
                        required
                      />
                    </motion.div>

                    {/* Terms */}
                    <motion.div
                      className="flex items-start gap-3 text-left"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.9, duration: 0.4 }}
                    >
                      <input
                        type="checkbox"
                        id="terms"
                        checked={terms}
                        onChange={(e) => setTerms(e.target.checked)}
                        className="mt-1 w-4 h-4 accent-green-500"
                        required
                      />
                      <label htmlFor="terms" className="text-gray-400 text-sm">
                        I agree to the Terms of Service and Privacy Policy
                      </label>
                    </motion.div>

                    {/* Register Button */}
                    <motion.button
                      type="submit"
                      disabled={!terms}
                      className="group relative w-full bg-gradient-to-r from-green-600 to-cyan-600 py-4 mt-2 rounded-xl text-white text-lg font-semibold hover:shadow-green-500/50 hover:scale-105 transition-all overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.0, duration: 0.4 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <span className="relative z-10">Create Account</span>
                      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-green-600 to-cyan-600 blur-xl opacity-50 group-hover:opacity-75" />
                    </motion.button>
                  </div>
                </motion.form>

                <motion.p
                  className="text-gray-400 mt-6 relative z-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.1, duration: 0.3 }}
                >
                  Already exploring the cosmos?{" "}
                  <Link
                    to="/login"
                    className="text-green-400 hover:underline font-semibold"
                  >
                    Login Here
                  </Link>
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Creation indicator */}
          <motion.div
            className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="w-6 h-10 border-2 border-green-400/30 rounded-full flex items-start justify-center p-2">
              <motion.div
                className="w-1.5 h-1.5 bg-green-400 rounded-full"
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          </motion.div>
        </section>
      </div>

      {/* Custom Cursor */}
      {loaded && <CustomCursor />}
    </div>
  );
}