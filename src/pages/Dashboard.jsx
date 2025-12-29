import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, Sphere, Preload, Ring } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, Suspense, useRef, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  UserCheck,
  Compass,
  ListChecks,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
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
   MAIN SCENE - Dashboard Theme
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
   MAIN DASHBOARD PAGE
----------------------------------------------------------- */
export default function Dashboard() {
  const [collapsed, setCollapsed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const location = useLocation();

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

  const menuItems = [
    { title: "Dashboard", icon: <Home size={20} />, path: "/dashboard" },
    { title: "Assessment", icon: <UserCheck size={20} />, path: "/assessment" },
    { title: "Recommendations", icon: <Compass size={20} />, path: "/recommendations" },
    { title: "Roadmap", icon: <ListChecks size={20} />, path: "/roadmap" },
    { title: "Progress", icon: <ListChecks size={20} />, path: "/progress" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { y: 50, opacity: 0, scale: 0.9 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    },
  };

  const cardHoverVariants = {
    hover: {
      y: -10,
      scale: 1.02,
      boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)",
      transition: { duration: 0.3, ease: "easeOut" },
    },
  };

  return (
    <div className="w-full min-h-screen bg-black text-white overflow-x-hidden relative font-sans antialiased">
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

      <div className="relative z-10 flex min-h-screen">

        {/* ========================== SIDEBAR ========================== */}
        <motion.div
          className={`h-screen backdrop-blur-xl bg-white/5 border-r border-white/10 px-4 py-6 transition-all duration-300 relative overflow-hidden
          ${collapsed ? "w-20" : "w-64"}`}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Sidebar gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-purple-500/10" />

          {/* Collapse Button */}
          <motion.button
            onClick={() => setCollapsed(!collapsed)}
            className="relative z-10 absolute bottom-6 left-4 backdrop-blur-xl bg-white/10 p-2 rounded-lg border border-white/20 hover:bg-white/20 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </motion.button>

          {/* Menu Items */}
          <nav className="relative z-10 space-y-3 mt-20">
            {menuItems.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 relative overflow-hidden
                  ${location.pathname === item.path
                      ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-400/30"
                      : ""
                    }`}
                >
                  <div className="relative z-10">{item.icon}</div>
                  {!collapsed && <span className="relative z-10">{item.title}</span>}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </Link>
              </motion.div>
            ))}
          </nav>
        </motion.div>

        {/* ========================== MAIN CONTENT ========================== */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* ========================== TOP NAVBAR ========================== */}
          <motion.div
            className="backdrop-blur-xl bg-white/5 border-b border-white/10 p-4 flex justify-between items-center relative overflow-hidden"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5" />
            <motion.h1
              className="relative z-10 text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-300 bg-clip-text text-transparent"
              whileHover={{ scale: 1.02 }}
            >
              Control Center
            </motion.h1>

            <div className="relative z-10 flex items-center gap-3">
              <motion.span
                className="text-gray-200"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Welcome back, Explorer 👋
              </motion.span>
              <motion.img
                src="https://i.pravatar.cc/40?img=12"
                className="w-10 h-10 rounded-full border-2 border-white/20 hover:border-white/40 transition-all"
                whileHover={{ scale: 1.1, rotate: 5 }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
              />
            </div>
          </motion.div>

          {/* ========================== DASHBOARD CONTENT ========================== */}
          <main className="flex-1 p-8 overflow-y-auto relative">
            <motion.div
              className="space-y-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div
                className="backdrop-blur-xl bg-white/5 rounded-3xl p-8 border border-white/10 shadow-2xl relative overflow-hidden"
                variants={cardVariants}
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10" />
                <div className="relative z-10">
                  <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent">
                    Mission Control
                  </h2>
                  <p className="text-gray-300 text-lg leading-relaxed">
                    Navigate your cosmic career path. Engage with assessments, discover tailored recommendations, and chart your stellar roadmap.
                  </p>
                </div>
              </motion.div>

              {/* ---------- CLICKABLE CARDS ---------- */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    title: "Skill Assessment",
                    desc: "Embark on a quick evaluation to map your current capabilities across the universe of skills.",
                    icon: <UserCheck size={48} className="text-blue-400" />,
                    path: "/assessment",
                  },
                  {
                    title: "AI Recommendations",
                    desc: "Receive intelligent suggestions for roles and paths that align with your unique trajectory.",
                    icon: <Compass size={48} className="text-purple-400" />,
                    path: "/recommendations",
                  },
                  {
                    title: "Personal Roadmap",
                    desc: "Visualize and track your customized journey towards career constellations.",
                    icon: <ListChecks size={48} className="text-cyan-400" />,
                    path: "/roadmap",
                  },
                ].map((card, index) => (
                  <motion.div
                    key={card.title}
                    variants={cardVariants}
                  >
                    <Link
                      to={card.path}
                      className="group relative block backdrop-blur-xl bg-white/5 rounded-3xl p-6 border border-white/10 shadow-2xl hover:bg-white/10 hover:border-white/20 transition-all overflow-hidden cursor-pointer h-full"
                      variants={cardHoverVariants}
                      whileHover="hover"
                      whileTap={{ scale: 0.98 }}
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5"
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                      <div className="relative z-10 flex flex-col items-center text-center space-y-4 h-full justify-center">
                        <motion.div
                          className="p-3 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 group-hover:scale-110 transition-transform"
                          variants={{
                            hover: { rotate: 5, scale: 1.1 },
                          }}
                          whileHover="hover"
                          transition={{ duration: 0.3 }}
                        >
                          {card.icon}
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          whileHover={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <h3 className="text-xl font-bold mb-2 text-white">{card.title}</h3>
                          <p className="text-gray-300">{card.desc}</p>
                        </motion.div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </main>
        </div>
      </div>

      {loaded && <CustomCursor />}
    </div>
  );
}