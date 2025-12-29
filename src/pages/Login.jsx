import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, Sphere, Preload, Ring } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, Suspense, useRef, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react"; // Assuming Lucide icons; install with npm i lucide-react
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
   FLOATING PARTICLES - OPTIMIZED
----------------------------------------------------------- */
function FloatingParticles() {
  const particlesRef = useRef();
  const particleCount = 80;
 
  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const col = new Float32Array(particleCount * 3);
   
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
     
      const color = new THREE.Color();
      color.setHSL(Math.random(), 0.8, 0.6);
      col[i * 3] = color.r;
      col[i * 3 + 1] = color.g;
      col[i * 3 + 2] = color.b;
    }
    
    return { positions: pos, colors: col };
  }, []);
 
  useFrame(({ clock }) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = clock.getElapsedTime() * 0.04;
      particlesRef.current.rotation.x = clock.getElapsedTime() * 0.015;
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
      <pointsMaterial size={0.1} vertexColors transparent opacity={0.7} sizeAttenuation />
    </points>
  );
}

/* -----------------------------------------------------------
   EXTRA STARS - OPTIMIZED
----------------------------------------------------------- */
function ExtraStars() {
  return (
    <Stars
      radius={120}
      depth={80}
      count={6000}
      factor={4}
      saturation={0.8}
      fade
      speed={0.15}
    />
  );
}

/* -----------------------------------------------------------
   ENHANCED PLANET COMPONENT - OPTIMIZED
----------------------------------------------------------- */
function Planet({ position, color, scale: initialScale = 1, ringColor, ringScale = 1.3 }) {
  const groupRef = useRef();
  const [hovered, setHovered] = useState(false);
  
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += hovered ? 0.015 : 0.008;
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
        <Sphere args={[1, 48, 48]} scale={hovered ? initialScale * 1.15 : initialScale}>
          <meshStandardMaterial
            color={hovered ? `${color}ff` : color}
            emissive={hovered ? color : `${color}80`}
            emissiveIntensity={hovered ? 1.0 : 0.8}
            roughness={hovered ? 0.05 : 0.1}
            metalness={hovered ? 1.0 : 0.9}
          />
        </Sphere>
      </mesh>
      <Sphere args={[1.15 * initialScale, 24, 24]}>
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
          args={[1.2 * initialScale, ringScale * initialScale, 48]}
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
   MAIN SCENE - Login Theme
----------------------------------------------------------- */
function Scene() {
  return (
    <>
      <ambientLight intensity={0.7} />
      <pointLight position={[0, 0, 5]} intensity={2.5} color="#ffffff" />
      <directionalLight position={[-10, 10, 5]} intensity={1.5} color="#3b82f6" />
      <directionalLight position={[10, -10, 5]} intensity={1.2} color="#a855f7" />
      <hemisphereLight intensity={0.8} skyColor="#3b82f6" groundColor="#a855f7" />
      <Stars
        radius={80}
        depth={40}
        count={3000}
        factor={5}
        saturation={0.8}
        fade
        speed={0.3}
      />
      {/* Central Portal Planet */}
      <Planet position={[0, 0, -3]} color="#8b5cf6" scale={3.5} ringColor="#c084fc" ringScale={2.0} />
      {/* Orbiting Smaller Planets */}
      <Planet position={[-2.5, 1, -4]} color="#3b82f6" scale={1.2} />
      <Planet position={[2.5, -1, -4]} color="#a855f7" scale={1.5} ringColor="#60a5fa" ringScale={1.4} />
      <Planet position={[0, 2.5, -5]} color="#10b981" scale={1.0} />
     
      <FloatingParticles />
    </>
  );
}

/* -----------------------------------------------------------
   PASSWORD VISIBILITY TOGGLE - Custom to avoid default cursor
----------------------------------------------------------- */
function PasswordToggle({ showPassword, onToggle }) {
  return (
    <motion.button
      type="button"
      onClick={onToggle}
      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1 rounded-full bg-transparent border-none"
      style={{ cursor: 'none' }} // FIXED: Explicitly none to prevent default on toggle
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      tabIndex={-1} // FIXED: Prevent focus to avoid outline/cursor
    >
      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
    </motion.button>
  );
}

/* -----------------------------------------------------------
   MAIN LOGIN PAGE
----------------------------------------------------------- */
export default function Login() {
  const [loaded, setLoaded] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 1000);
    return () => clearTimeout(timer);
  }, []);

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
        /* FIXED: Ensure password toggle doesn't show default cursor */
        input[type="password"] ~ button,
        .password-toggle {
          cursor: none !important;
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

  const handleSubmit = (e) => {
    e.preventDefault();
    // FIXED: Use navigate for smooth SPA redirect
    navigate("/dashboard");
  };

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="w-full h-screen bg-black text-white overflow-hidden relative font-sans antialiased">
      {/* LOADING SCREEN - Planet Approach Effect */}
      <AnimatePresence>
        {!loaded && (
          <motion.div
            className="fixed inset-0 bg-gradient-to-br from-black via-purple-900/40 to-blue-900/40 z-[999] flex flex-col items-center justify-center"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.div
              className="w-24 h-24 border-4 border-purple-500 border-t-transparent rounded-full relative"
              animate={{ rotate: 360, scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 to-blue-400 blur-xl opacity-50" />
            </motion.div>
            <motion.p
              className="mt-6 text-purple-300 text-xl font-light"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Approaching Secure Portal...
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3D CANVAS */}
      <div className="fixed inset-0 z-0">
        <Canvas
          frameloop="demand"
          camera={{ position: [0, 0, 8], fov: 70 }}
          gl={{
            alpha: false,
            antialias: true,
            powerPreference: "high-performance",
            toneMapping: THREE.ACESFilmicToneMapping,
            outputEncoding: THREE.sRGBEncoding,
          }}
          style={{
            background: "linear-gradient(135deg, #000000 0%, #0a0a1a 50%, #000000 100%)"
          }}
          dpr={[1, 1.5]}
        >
          <Suspense fallback={null}>
            <Scene />
            <ExtraStars />
          </Suspense>
          <Preload all />
        </Canvas>
      </div>

      {/* UI ABOVE 3D */}
      <div className="relative z-10 h-full flex items-center justify-center">
        {/* LOGIN SECTION - Planet Portal Form */}
        <section className="w-full flex items-center justify-center text-center px-4 relative">
          {/* Animated gradient orbs - Portal accents */}
          <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse pointer-events-none" />
          <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-pulse pointer-events-none" style={{ animationDelay: '0.5s' }} />
         
          <AnimatePresence>
            {loaded && (
              <motion.div
                className="relative z-10"
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -30, scale: 0.95 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <motion.h2
                  className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent drop-shadow-2xl mb-4"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1, duration: 0.6 }}
                >
                  <motion.span
                    animate={{
                      textShadow: [
                        "0 0 20px rgba(139, 92, 246, 0.5)",
                        "0 0 40px rgba(59, 130, 246, 0.5)",
                        "0 0 20px rgba(139, 92, 246, 0.5)"
                      ]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    Welcome Back 👋
                  </motion.span>
                </motion.h2>
                <motion.p
                  className="text-gray-300 mb-8 text-lg md:text-xl leading-relaxed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  Access your cosmic career path
                </motion.p>

                <motion.form
                  className="backdrop-blur-2xl bg-white/5 rounded-3xl p-8 md:p-10 border border-white/10 shadow-2xl max-w-md w-full relative overflow-hidden"
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.7, ease: "easeOut" }}
                >
                  {/* Animated border effect */}
                  <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
                    <div className="absolute inset-[-2px] bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 opacity-30 animate-pulse" />
                  </div>

                  <div className="relative z-10 flex flex-col gap-6">
                    {/* Email */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6, duration: 0.4 }}
                    >
                      <label className="text-gray-300 text-sm block mb-2 text-left">Email Address</label>
                      <input
                        type="email"
                        placeholder="you@cosmos.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-4 rounded-xl bg-white/10 text-white outline-none focus:ring-2 focus:ring-purple-500 transition-all border border-white/20 pr-12" // FIXED: Added pr-12 for icon space
                        required
                      />
                    </motion.div>

                    {/* Password with Visibility Toggle */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7, duration: 0.4 }}
                      className="relative" // FIXED: Relative for absolute toggle
                    >
                      <label className="text-gray-300 text-sm block mb-2 text-left">Password</label>
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter secure key"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-4 rounded-xl bg-white/10 text-white outline-none focus:ring-2 focus:ring-purple-500 transition-all border border-white/20 pr-12" // FIXED: Added pr-12 for icon space
                        required
                      />
                      {/* FIXED: Custom Toggle with no default cursor/focus */}
                      <PasswordToggle showPassword={showPassword} onToggle={togglePassword} />
                    </motion.div>

                    {/* Login Button */}
                    <motion.button
                      type="submit"
                      className="group relative w-full bg-gradient-to-r from-purple-600 to-blue-600 py-4 mt-2 rounded-xl text-white text-lg font-semibold hover:shadow-purple-500/50 hover:scale-105 transition-all overflow-hidden"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8, duration: 0.4 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <span className="relative z-10">Enter Portal</span>
                      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-purple-600 to-blue-600 blur-xl opacity-50 group-hover:opacity-75" />
                    </motion.button>
                  </div>
                </motion.form>

                <motion.p
                  className="text-gray-400 mt-6 relative z-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9, duration: 0.3 }}
                >
                  New to the universe?{" "}
                  <Link
                    to="/register"  // FIXED: Changed from /signup to /register for consistency
                    className="text-purple-400 hover:underline font-semibold"
                  >
                    Create Account
                  </Link>
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>

      {/* Custom Cursor */}
      {loaded && <CustomCursor />}
    </div>
  );
}