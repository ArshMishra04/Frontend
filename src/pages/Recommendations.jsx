// src/pages/Recommendations.jsx
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, Sphere, Preload, Ring } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle,
  Sparkles,
  TrendingUp,
  DollarSign,
  Clock,
  Target,
  BarChart3,
  X,
  Plus,
  ArrowLeftRight,
  Briefcase,
  GraduationCap,
  Zap,
  Star,
  ChevronDown,
  ChevronUp,
  Award,
  Globe,
} from "lucide-react";
import * as THREE from "three";

/* -----------------------------------------------------------
   CUSTOM CURSOR WITH AURORA TRAIL
----------------------------------------------------------- */
function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [trail, setTrail] = useState([]);
  const rafRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const newPos = { x: e.clientX, y: e.clientY, id: Date.now() };
      setPosition(newPos);
      setTrail((prev) => [...prev, newPos].slice(-30));
    });
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    const interval = setInterval(
      () => setTrail((prev) => prev.filter((p) => Date.now() - p.id < 1000)),
      50
    );
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
        const opacity = Math.max(0, 1 - age / 1000);
        const scale = 1 - index / trail.length;
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
            animate={{ opacity: opacity * 0.6, scale: scale * 2.5 }}
          >
            <div
              className="w-10 h-10 rounded-full"
              style={{
                background: `radial-gradient(circle, rgba(139, 92, 246, ${opacity}) 0%, rgba(59, 130, 246, ${opacity * 0.8}) 50%, transparent 100%)`,
                filter: "blur(12px)",
              }}
            />
          </motion.div>
        );
      })}
      <motion.div
        className="fixed pointer-events-none z-[10000]"
        style={{
          left: position.x,
          top: position.y,
          transform: "translate(-50%, -50%)",
        }}
      >
        <div className="relative w-5 h-5 -translate-x-1/2 -translate-y-1/2">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle, #a78bfa 0%, #8b5cf6 50%, #7c3aed 100%)",
              boxShadow:
                "0 0 15px rgba(139, 92, 246, 0.8), 0 0 30px rgba(139, 92, 246, 0.4)",
            }}
          />
        </div>
      </motion.div>
    </>
  );
}

/* -----------------------------------------------------------
   3D BACKGROUND COMPONENTS
----------------------------------------------------------- */
function FloatingParticles() {
  const particlesRef = useRef();
  const particleCount = 80;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3 + 0] = (Math.random() - 0.5) * 25;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 25;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 25;
    const color = new THREE.Color();
    color.setHSL(0.7 + Math.random() * 0.2, 0.8, 0.6);
    colors[i * 3 + 0] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }

  useFrame(({ clock }) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = clock.getElapsedTime() * 0.03;
      particlesRef.current.rotation.x = clock.getElapsedTime() * 0.01;
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
        size={0.08}
        vertexColors
        transparent
        opacity={0.7}
        sizeAttenuation
      />
    </points>
  );
}

function Planet({ position, color, scale = 1, ringColor }) {
  const groupRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (groupRef.current) groupRef.current.rotation.y += hovered ? 0.015 : 0.008;
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
        <Sphere args={[1, 64, 64]} scale={hovered ? scale * 1.1 : scale}>
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={hovered ? 0.9 : 0.6}
            roughness={0.1}
            metalness={0.9}
          />
        </Sphere>
      </mesh>
      {ringColor && (
        <Ring args={[1.3 * scale, 1.6 * scale, 64]} rotation={[Math.PI / 2.5, 0, 0]}>
          <meshBasicMaterial
            color={ringColor}
            transparent
            opacity={hovered ? 0.8 : 0.5}
            side={THREE.DoubleSide}
          />
        </Ring>
      )}
    </group>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 0, 5]} intensity={2} color="#ffffff" />
      <directionalLight position={[-10, 10, 5]} intensity={1.2} color="#8b5cf6" />
      <directionalLight position={[10, -10, 5]} intensity={1} color="#3b82f6" />
      <Stars
        radius={100}
        depth={50}
        count={5000}
        factor={4}
        saturation={0.8}
        fade
        speed={0.3}
      />
      <Planet position={[-4, 2, -4]} color="#8b5cf6" scale={1.5} ringColor="#a78bfa" />
      <Planet position={[4, -1, -3]} color="#3b82f6" scale={1.8} ringColor="#60a5fa" />
      <Planet position={[0, 3, -5]} color="#10b981" scale={1.2} />
      <Planet position={[-3, -2, -3]} color="#f59e0b" scale={1.3} />
      <FloatingParticles />
    </>
  );
}

/* -----------------------------------------------------------
   SKILL MATCH INDICATOR COMPONENT
----------------------------------------------------------- */
function SkillMatchBar({ percentage, label }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-gray-400">{label}</span>
        <span className="text-white font-medium">{percentage}%</span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{
            background:
              percentage >= 80
                ? "linear-gradient(90deg, #10b981, #34d399)"
                : percentage >= 60
                ? "linear-gradient(90deg, #3b82f6, #60a5fa)"
                : "linear-gradient(90deg, #f59e0b, #fbbf24)",
          }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, delay: 0.2 }}
        />
      </div>
    </div>
  );
}

/* -----------------------------------------------------------
   CAREER CARD COMPONENT
----------------------------------------------------------- */
function CareerCard({
  career,
  index,
  isSelected,
  onSelect,
  compareMode,
  isInComparison,
  onAddToCompare,
  onRemoveFromCompare,
}) {
  const [expanded, setExpanded] = useState(false);

  const gradients = [
    "from-blue-600/20 via-purple-600/20 to-cyan-600/20",
    "from-purple-600/20 via-pink-600/20 to-rose-600/20",
    "from-emerald-600/20 via-teal-600/20 to-cyan-600/20",
    "from-orange-600/20 via-amber-600/20 to-yellow-600/20",
    "from-indigo-600/20 via-blue-600/20 to-sky-600/20",
  ];

  const borderColors = [
    "border-blue-500/30 hover:border-blue-400/50",
    "border-purple-500/30 hover:border-purple-400/50",
    "border-emerald-500/30 hover:border-emerald-400/50",
    "border-orange-500/30 hover:border-orange-400/50",
    "border-indigo-500/30 hover:border-indigo-400/50",
  ];

  return (
    <motion.div
      className={`relative backdrop-blur-xl bg-gradient-to-br ${gradients[index % 5]} rounded-2xl border ${borderColors[index % 5]} overflow-hidden transition-all duration-300 ${
        isSelected ? "ring-2 ring-blue-500" : ""
      } ${isInComparison ? "ring-2 ring-purple-500" : ""}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.01 }}
    >
      {/* Match Badge */}
      <div className="absolute top-4 right-4">
        <div
          className={`px-3 py-1 rounded-full text-xs font-bold ${
            career.matchScore >= 90
              ? "bg-green-500/20 text-green-400 border border-green-500/30"
              : career.matchScore >= 75
              ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
              : "bg-orange-500/20 text-orange-400 border border-orange-500/30"
          }`}
        >
          {career.matchScore}% Match
        </div>
      </div>

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <div
            className={`w-14 h-14 rounded-xl bg-gradient-to-br ${
              index % 5 === 0
                ? "from-blue-500 to-purple-600"
                : index % 5 === 1
                ? "from-purple-500 to-pink-600"
                : index % 5 === 2
                ? "from-emerald-500 to-teal-600"
                : index % 5 === 3
                ? "from-orange-500 to-amber-600"
                : "from-indigo-500 to-blue-600"
            } flex items-center justify-center text-2xl shadow-lg`}
          >
            {career.icon}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-1">{career.title}</h3>
            <p className="text-gray-400 text-sm">{career.category}</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <DollarSign className="w-4 h-4 text-green-400 mx-auto mb-1" />
            <p className="text-xs text-gray-400">Avg Salary</p>
            <p className="text-sm font-semibold text-white">{career.salary}</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <TrendingUp className="w-4 h-4 text-blue-400 mx-auto mb-1" />
            <p className="text-xs text-gray-400">Growth</p>
            <p className="text-sm font-semibold text-white">{career.growth}</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <Clock className="w-4 h-4 text-purple-400 mx-auto mb-1" />
            <p className="text-xs text-gray-400">Time</p>
            <p className="text-sm font-semibold text-white">{career.timeToLearn}</p>
          </div>
        </div>

        {/* Skill Match */}
        <div className="space-y-2 mb-4">
          <SkillMatchBar percentage={career.skillMatch} label="Your Skill Match" />
          <SkillMatchBar percentage={career.demandScore} label="Market Demand" />
        </div>

        {/* Expandable Section */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-4 border-t border-white/10 space-y-4">
                {/* Required Skills */}
                <div>
                  <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                    <Target className="w-3 h-3" /> Key Skills Required
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {career.requiredSkills.map((skill, i) => (
                      <span
                        key={i}
                        className={`px-2 py-1 rounded-md text-xs ${
                          career.matchingSkills?.includes(skill)
                            ? "bg-green-500/20 text-green-400 border border-green-500/30"
                            : "bg-white/10 text-gray-300"
                        }`}
                      >
                        {career.matchingSkills?.includes(skill) && (
                          <CheckCircle className="w-3 h-3 inline mr-1" />
                        )}
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Certifications */}
                <div>
                  <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                    <Award className="w-3 h-3" /> Recommended Certifications
                  </p>
                  <div className="space-y-1">
                    {career.certifications.map((cert, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 text-xs text-gray-300"
                      >
                        <GraduationCap className="w-3 h-3 text-purple-400" />
                        {cert}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Job Outlook */}
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">💼 Job Outlook</p>
                  <p className="text-sm text-gray-300">{career.outlook}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            {expanded ? (
              <>
                <ChevronUp className="w-4 h-4" /> Less
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" /> More Details
              </>
            )}
          </button>

          <div className="flex gap-2">
            {compareMode && (
              <motion.button
                onClick={() =>
                  isInComparison
                    ? onRemoveFromCompare(career.id)
                    : onAddToCompare(career)
                }
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  isInComparison
                    ? "bg-purple-500/20 text-purple-400 border border-purple-500/50"
                    : "bg-white/10 text-gray-300 hover:bg-white/20"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isInComparison ? (
                  <>
                    <X className="w-3 h-3 inline mr-1" /> Remove
                  </>
                ) : (
                  <>
                    <Plus className="w-3 h-3 inline mr-1" /> Compare
                  </>
                )}
              </motion.button>
            )}
            <motion.button
              onClick={() => onSelect(career)}
              className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-sm font-medium text-white hover:shadow-lg hover:shadow-purple-500/25 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Select Path
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* -----------------------------------------------------------
   COMPARISON MODAL COMPONENT
----------------------------------------------------------- */
function ComparisonModal({ careers, onClose, onSelectCareer }) {
  if (careers.length < 2) return null;

  const comparisonMetrics = [
    { key: "salary", label: "Salary Range", icon: DollarSign },
    { key: "growth", label: "Growth Rate", icon: TrendingUp },
    { key: "timeToLearn", label: "Time to Learn", icon: Clock },
    { key: "matchScore", label: "Your Match", icon: Target },
    { key: "skillMatch", label: "Skill Overlap", icon: Zap },
    { key: "demandScore", label: "Market Demand", icon: BarChart3 },
    { key: "jobOpenings", label: "Job Openings", icon: Briefcase },
    { key: "remoteScore", label: "Remote Friendly", icon: Globe },
  ];

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        className="relative w-full max-w-6xl max-h-[90vh] overflow-auto bg-gray-900/95 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur-xl p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                <ArrowLeftRight className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Career Comparison
                </h2>
                <p className="text-gray-400 text-sm">
                  Comparing {careers.length} career paths side by side
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/20 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="p-6">
          {/* Career Headers */}
          <div
            className={`grid gap-4 mb-6`}
            style={{
              gridTemplateColumns: `200px repeat(${careers.length}, 1fr)`,
            }}
          >
            <div></div>
            {careers.map((career, i) => (
              <motion.div
                key={career.id}
                className="text-center p-4 bg-white/5 rounded-xl border border-white/10"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="text-3xl mb-2">{career.icon}</div>
                <h3 className="text-lg font-bold text-white mb-1">
                  {career.title}
                </h3>
                <div
                  className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                    career.matchScore >= 90
                      ? "bg-green-500/20 text-green-400"
                      : career.matchScore >= 75
                      ? "bg-blue-500/20 text-blue-400"
                      : "bg-orange-500/20 text-orange-400"
                  }`}
                >
                  {career.matchScore}% Match
                </div>
              </motion.div>
            ))}
          </div>

          {/* Metrics Rows */}
          <div className="space-y-3">
            {comparisonMetrics.map((metric, i) => (
              <motion.div
                key={metric.key}
                className={`grid gap-4 p-4 rounded-xl ${
                  i % 2 === 0 ? "bg-white/5" : ""
                }`}
                style={{
                  gridTemplateColumns: `200px repeat(${careers.length}, 1fr)`,
                }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="flex items-center gap-2 text-gray-400">
                  <metric.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{metric.label}</span>
                </div>
                {careers.map((career) => {
                  const value = career[metric.key];
                  const isHighest =
                    typeof value === "number" &&
                    careers.every(
                      (c) => typeof c[metric.key] !== "number" || c[metric.key] <= value
                    );

                  return (
                    <div
                      key={career.id}
                      className={`text-center ${
                        isHighest ? "text-green-400 font-bold" : "text-white"
                      }`}
                    >
                      {typeof value === "number" ? (
                        <div>
                          <span className="text-lg">{value}</span>
                          {metric.key.includes("Score") ||
                          metric.key.includes("Match") ? (
                            <span className="text-sm text-gray-400">%</span>
                          ) : null}
                          {isHighest && (
                            <Star className="w-4 h-4 inline ml-1 text-yellow-400" />
                          )}
                        </div>
                      ) : (
                        <span>{value}</span>
                      )}
                    </div>
                  );
                })}
              </motion.div>
            ))}
          </div>

          {/* Skills Comparison */}
          <div className="mt-8 p-6 bg-white/5 rounded-xl border border-white/10">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-400" />
              Skills Comparison
            </h3>
            <div
              className="grid gap-4"
              style={{
                gridTemplateColumns: `repeat(${careers.length}, 1fr)`,
              }}
            >
              {careers.map((career) => (
                <div key={career.id}>
                  <h4 className="text-sm font-medium text-gray-400 mb-3">
                    {career.title}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {career.requiredSkills.map((skill, i) => (
                      <span
                        key={i}
                        className={`px-2 py-1 rounded-md text-xs ${
                          career.matchingSkills?.includes(skill)
                            ? "bg-green-500/20 text-green-400 border border-green-500/30"
                            : "bg-white/10 text-gray-400"
                        }`}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Select Career Buttons */}
          <div className="mt-8 flex justify-center gap-4">
            {careers.map((career, i) => (
              <motion.button
                key={career.id}
                onClick={() => onSelectCareer(career)}
                className={`px-6 py-3 rounded-xl font-semibold text-white transition-all ${
                  i === 0
                    ? "bg-gradient-to-r from-blue-600 to-purple-600"
                    : i === 1
                    ? "bg-gradient-to-r from-purple-600 to-pink-600"
                    : "bg-gradient-to-r from-emerald-600 to-teal-600"
                } hover:shadow-lg hover:scale-105`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Choose {career.title}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* -----------------------------------------------------------
   MAIN RECOMMENDATIONS COMPONENT
----------------------------------------------------------- */
export default function Recommendations() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loaded, setLoaded] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [careersToCompare, setCareersToCompare] = useState([]);
  const [showComparison, setShowComparison] = useState(false);
  const [selectedCareer, setSelectedCareer] = useState(null);

  // Get assessment data from navigation state or localStorage
  const assessmentData = location.state?.assessment ||
    JSON.parse(localStorage.getItem("assessmentData") || "{}");

  // Mock career data - replace with backend response
  const [careers] = useState([
    {
      id: 1,
      title: "Full Stack Developer",
      category: "Software Development",
      icon: "💻",
      matchScore: 94,
      skillMatch: 85,
      demandScore: 92,
      salary: "$95-150K",
      growth: "+25%",
      timeToLearn: "6-12 mo",
      jobOpenings: 45000,
      remoteScore: 95,
      requiredSkills: [
        "JavaScript",
        "React",
        "Node.js",
        "SQL",
        "Git",
        "APIs",
        "TypeScript",
      ],
      matchingSkills: ["JavaScript", "React", "Git"],
      certifications: [
        "Meta Full Stack Certificate",
        "AWS Developer Associate",
        "MongoDB Developer",
      ],
      outlook:
        "Excellent job prospects with high demand across all industries. Remote work opportunities abundant.",
    },
    {
      id: 2,
      title: "AI/ML Engineer",
      category: "Artificial Intelligence",
      icon: "🤖",
      matchScore: 87,
      skillMatch: 72,
      demandScore: 95,
      salary: "$120-180K",
      growth: "+35%",
      timeToLearn: "12-18 mo",
      jobOpenings: 28000,
      remoteScore: 85,
      requiredSkills: [
        "Python",
        "TensorFlow",
        "PyTorch",
        "ML Algorithms",
        "Statistics",
        "Data Science",
      ],
      matchingSkills: ["Python"],
      certifications: [
        "Google ML Engineer",
        "AWS ML Specialty",
        "DeepLearning.AI Certificate",
      ],
      outlook:
        "Rapidly growing field with exceptional salary potential. Requires strong mathematical foundation.",
    },
    {
      id: 3,
      title: "Cloud Solutions Architect",
      category: "Cloud Computing",
      icon: "☁️",
      matchScore: 82,
      skillMatch: 68,
      demandScore: 90,
      salary: "$130-200K",
      growth: "+30%",
      timeToLearn: "12-24 mo",
      jobOpenings: 35000,
      remoteScore: 90,
      requiredSkills: [
        "AWS",
        "Azure",
        "GCP",
        "Kubernetes",
        "Docker",
        "Terraform",
        "Networking",
      ],
      matchingSkills: ["Docker"],
      certifications: [
        "AWS Solutions Architect Pro",
        "Azure Solutions Architect",
        "GCP Cloud Architect",
      ],
      outlook:
        "Critical role in digital transformation. High demand from enterprises moving to cloud.",
    },
    {
      id: 4,
      title: "DevOps Engineer",
      category: "Operations",
      icon: "⚙️",
      matchScore: 79,
      skillMatch: 65,
      demandScore: 88,
      salary: "$100-160K",
      growth: "+22%",
      timeToLearn: "8-14 mo",
      jobOpenings: 32000,
      remoteScore: 88,
      requiredSkills: [
        "CI/CD",
        "Docker",
        "Kubernetes",
        "Linux",
        "Scripting",
        "Monitoring",
      ],
      matchingSkills: ["Docker", "Linux"],
      certifications: [
        "Kubernetes CKA",
        "HashiCorp Terraform",
        "AWS DevOps Engineer",
      ],
      outlook:
        "Essential role bridging development and operations. High value in agile organizations.",
    },
    {
      id: 5,
      title: "Data Scientist",
      category: "Data & Analytics",
      icon: "📊",
      matchScore: 76,
      skillMatch: 60,
      demandScore: 85,
      salary: "$95-145K",
      growth: "+28%",
      timeToLearn: "12-18 mo",
      jobOpenings: 38000,
      remoteScore: 82,
      requiredSkills: [
        "Python",
        "SQL",
        "Statistics",
        "Machine Learning",
        "Data Visualization",
        "R",
      ],
      matchingSkills: ["Python", "SQL"],
      certifications: [
        "IBM Data Science",
        "Google Data Analytics",
        "DataCamp Certification",
      ],
      outlook:
        "Strong demand for data-driven decision making. Growing importance across all sectors.",
    },
  ]);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (loaded) {
      document.documentElement.style.cursor = "none";
      document.body.style.cursor = "none";
      const style = document.createElement("style");
      style.textContent = `* { cursor: none !important; }`;
      document.head.appendChild(style);
      return () => {
        document.documentElement.style.cursor = "default";
        document.body.style.cursor = "default";
        if (document.head.contains(style)) document.head.removeChild(style);
      };
    }
  }, [loaded]);

  const addToCompare = (career) => {
    if (careersToCompare.length < 3 && !careersToCompare.find((c) => c.id === career.id)) {
      setCareersToCompare([...careersToCompare, career]);
    }
  };

  const removeFromCompare = (careerId) => {
    setCareersToCompare(careersToCompare.filter((c) => c.id !== careerId));
  };

  const handleSelectCareer = (career) => {
    setSelectedCareer(career);
    localStorage.setItem("selectedCareer", JSON.stringify(career));
    navigate("/roadmap", { state: { career } });
  };

  return (
    <div className="w-full min-h-screen bg-black text-white overflow-x-hidden relative font-sans antialiased">
      {/* Loading Screen */}
      <AnimatePresence>
        {!loaded && (
          <motion.div
            className="fixed inset-0 bg-gradient-to-br from-black via-purple-900/20 to-blue-900/20 z-[999] flex flex-col items-center justify-center"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <motion.p
              className="mt-6 text-gray-300 text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Completing AI Analysis...
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Cursor */}
      <CustomCursor />

      {/* 3D Background Canvas */}
      <div className="fixed inset-0 z-0 bg-black">
        <Canvas camera={{ position: [0, 0, 12], fov: 45 }}>
          <Suspense fallback={null}>
            <Scene />
            <Preload all />
          </Suspense>
        </Canvas>
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80 pointer-events-none" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen pb-20">
        <div className="container mx-auto px-4 py-8 lg:px-8">
          {/* Header Section */}
          <header className="mb-12 relative">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeftRight className="w-4 h-4 rotate-180" /> Back to Assessment
            </Link>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <motion.h1
                  className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Your Recommended Paths
                </motion.h1>
                <motion.p
                  className="text-lg text-gray-400 max-w-2xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  Based on your skills, interests, and market trends, these are the
                  top career trajectories aligned with your profile.
                </motion.p>
              </div>

              {/* Compare Toggle */}
              <motion.div
                className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-full px-4 py-2 backdrop-blur-md"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <span
                  className={`text-sm font-medium ${
                    !compareMode ? "text-white" : "text-gray-400"
                  }`}
                >
                  View Mode
                </span>
                <button
                  onClick={() => {
                    setCompareMode(!compareMode);
                    if (compareMode) setCareersToCompare([]);
                  }}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    compareMode ? "bg-purple-600" : "bg-gray-600"
                  }`}
                >
                  <motion.div
                    className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md"
                    animate={{ x: compareMode ? 24 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </button>
                <span
                  className={`text-sm font-medium ${
                    compareMode ? "text-white" : "text-gray-400"
                  }`}
                >
                  Compare
                </span>
              </motion.div>
            </div>
          </header>

          {/* Alert / Info Banner for Compare Mode */}
          <AnimatePresence>
            {compareMode && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-8 overflow-hidden"
              >
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 flex items-center gap-3 text-purple-200">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  <p>
                    Select up to 3 careers to compare their salaries, growth, and
                    requirements side-by-side.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Careers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {careers.map((career, index) => (
              <CareerCard
                key={career.id}
                career={career}
                index={index}
                compareMode={compareMode}
                isSelected={selectedCareer?.id === career.id}
                isInComparison={careersToCompare.some(
                  (c) => c.id === career.id
                )}
                onSelect={handleSelectCareer}
                onAddToCompare={addToCompare}
                onRemoveFromCompare={removeFromCompare}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Floating Comparison Bar */}
      <AnimatePresence>
        {careersToCompare.length > 0 && (
          <motion.div
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 bg-gray-900/90 backdrop-blur-xl border border-white/20 rounded-2xl px-6 py-4 shadow-2xl shadow-purple-900/50 flex items-center gap-6 min-w-[320px]"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
          >
            <div className="flex items-center gap-3">
              <div className="flex -space-x-3">
                {careersToCompare.map((c) => (
                  <div
                    key={c.id}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-800 to-gray-700 border-2 border-gray-900 flex items-center justify-center text-lg shadow-lg"
                  >
                    {c.icon}
                  </div>
                ))}
                {Array.from({ length: 3 - careersToCompare.length }).map(
                  (_, i) => (
                    <div
                      key={`empty-${i}`}
                      className="w-10 h-10 rounded-full bg-white/5 border-2 border-gray-900 border-dashed flex items-center justify-center"
                    />
                  )
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-white font-bold text-sm">
                  Compare Careers
                </span>
                <span className="text-gray-400 text-xs">
                  {careersToCompare.length} of 3 selected
                </span>
              </div>
            </div>

            <div className="h-8 w-px bg-white/10" />

            <div className="flex gap-2">
              <button
                onClick={() => setCareersToCompare([])}
                className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowComparison(true)}
                disabled={careersToCompare.length < 2}
                className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all ${
                  careersToCompare.length >= 2
                    ? "bg-purple-600 text-white hover:bg-purple-500 shadow-lg shadow-purple-600/30"
                    : "bg-gray-700 text-gray-400 cursor-not-allowed"
                }`}
              >
                Compare Now <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comparison Modal */}
      <AnimatePresence>
        {showComparison && (
          <ComparisonModal
            careers={careersToCompare}
            onClose={() => setShowComparison(false)}
            onSelectCareer={handleSelectCareer}
          />
        )}
      </AnimatePresence>
    </div>
  );
}