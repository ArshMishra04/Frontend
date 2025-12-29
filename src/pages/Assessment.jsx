// src/pages/Assessment.jsx (Production-Ready: 10k+ Skills/Jobs Support)
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, Sphere, Preload, Ring } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, Suspense, useRef, useCallback, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import * as THREE from "three";
import api from "../utils/api";

/* -----------------------------------------------------------
   SKILLS/JOBS SEARCH HOOK - Handles 10k+ entries efficiently
----------------------------------------------------------- */
function useSkillsSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState("all");
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("recentSkillSearches")) || [];
    } catch {
      return [];
    }
  });
  
  const cacheRef = useRef(new Map()); // Cache for search results
  const abortControllerRef = useRef(null);

  // Popular skills to show when no query (can be fetched from backend too)
  const popularSkills = useMemo(() => [
    { name: "JavaScript", category: "Programming", popularity: 98 },
    { name: "Python", category: "Programming", popularity: 97 },
    { name: "React", category: "Frontend", popularity: 95 },
    { name: "Node.js", category: "Backend", popularity: 93 },
    { name: "SQL", category: "Database", popularity: 92 },
    { name: "AWS", category: "Cloud", popularity: 90 },
    { name: "Docker", category: "DevOps", popularity: 88 },
    { name: "TypeScript", category: "Programming", popularity: 87 },
    { name: "Git", category: "Tools", popularity: 96 },
    { name: "Machine Learning", category: "AI/ML", popularity: 85 },
    { name: "Kubernetes", category: "DevOps", popularity: 82 },
    { name: "GraphQL", category: "API", popularity: 78 },
  ], []);

  const categories = useMemo(() => [
    { id: "all", label: "All Skills", icon: "🌐" },
    { id: "programming", label: "Programming", icon: "💻" },
    { id: "frontend", label: "Frontend", icon: "🎨" },
    { id: "backend", label: "Backend", icon: "⚙️" },
    { id: "database", label: "Database", icon: "🗄️" },
    { id: "cloud", label: "Cloud", icon: "☁️" },
    { id: "devops", label: "DevOps", icon: "🔧" },
    { id: "ai-ml", label: "AI/ML", icon: "🤖" },
    { id: "mobile", label: "Mobile", icon: "📱" },
    { id: "security", label: "Security", icon: "🔒" },
  ], []);

  const search = useCallback(async (searchQuery, selectedCategory = "all") => {
    const trimmedQuery = searchQuery.trim();
    
    // Show popular skills if no query
    if (trimmedQuery.length < 2) {
      const filtered = selectedCategory === "all" 
        ? popularSkills 
        : popularSkills.filter(s => s.category.toLowerCase().replace("/", "-") === selectedCategory);
      setResults(filtered);
      setLoading(false);
      return;
    }

    // Check cache first
    const cacheKey = `${trimmedQuery}-${selectedCategory}`;
    if (cacheRef.current.has(cacheKey)) {
      setResults(cacheRef.current.get(cacheKey));
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        q: trimmedQuery,
        type: "skills",
        category: selectedCategory,
        limit: 50, // Pagination - load 50 at a time
        offset: 0,
      });

      const res = await api.get(`/search?${params}`, {
        signal: abortControllerRef.current.signal,
      });

      const data = res.data.suggestions || res.data.skills || res.data.results || [];
      
      // Cache the results
      cacheRef.current.set(cacheKey, data);
      
      // Limit cache size
      if (cacheRef.current.size > 100) {
        const firstKey = cacheRef.current.keys().next().value;
        cacheRef.current.delete(firstKey);
      }

      setResults(data);
      
      // Save to recent searches
      if (trimmedQuery.length >= 3) {
        setRecentSearches(prev => {
          const updated = [trimmedQuery, ...prev.filter(s => s !== trimmedQuery)].slice(0, 5);
          localStorage.setItem("recentSkillSearches", JSON.stringify(updated));
          return updated;
        });
      }
    } catch (err) {
      if (err.name === "AbortError") return;
      
      console.error("Search Error:", err);
      setError("Search failed. Using local suggestions.");
      
      // Fallback: Local fuzzy search simulation
      const fallbackSkills = [
        { name: "React", category: "Frontend" },
        { name: "React Native", category: "Mobile" },
        { name: "Redux", category: "Frontend" },
        { name: "Python", category: "Programming" },
        { name: "PyTorch", category: "AI/ML" },
        { name: "JavaScript", category: "Programming" },
        { name: "Java", category: "Programming" },
        { name: "TypeScript", category: "Programming" },
        { name: "Node.js", category: "Backend" },
        { name: "Next.js", category: "Frontend" },
        { name: "SQL", category: "Database" },
        { name: "PostgreSQL", category: "Database" },
        { name: "MongoDB", category: "Database" },
        { name: "Docker", category: "DevOps" },
        { name: "Kubernetes", category: "DevOps" },
        { name: "AWS", category: "Cloud" },
        { name: "Azure", category: "Cloud" },
        { name: "GCP", category: "Cloud" },
        { name: "TensorFlow", category: "AI/ML" },
        { name: "Machine Learning", category: "AI/ML" },
        { name: "Deep Learning", category: "AI/ML" },
        { name: "GraphQL", category: "API" },
        { name: "REST API", category: "API" },
        { name: "Git", category: "Tools" },
        { name: "GitHub Actions", category: "DevOps" },
        { name: "Cybersecurity", category: "Security" },
        { name: "Penetration Testing", category: "Security" },
        { name: "UI/UX Design", category: "Design" },
        { name: "Figma", category: "Design" },
        { name: "Swift", category: "Mobile" },
        { name: "Kotlin", category: "Mobile" },
        { name: "Flutter", category: "Mobile" },
      ];

      const filtered = fallbackSkills.filter(skill => {
        const matchesQuery = skill.name.toLowerCase().includes(trimmedQuery.toLowerCase());
        const matchesCategory = selectedCategory === "all" || 
          skill.category.toLowerCase().replace("/", "-") === selectedCategory;
        return matchesQuery && matchesCategory;
      });

      setResults(filtered);
    } finally {
      setLoading(false);
    }
  }, [popularSkills]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    query,
    setQuery,
    results,
    loading,
    error,
    search,
    category,
    setCategory,
    categories,
    popularSkills,
    recentSearches,
    clearCache: () => cacheRef.current.clear(),
  };
}

/* -----------------------------------------------------------
   JOBS SEARCH HOOK - For job recommendations
----------------------------------------------------------- */
function useJobsSearch() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchJobs = useCallback(async (skills, experience) => {
    if (!skills.length) return;
    
    setLoading(true);
    try {
      const res = await api.get(`/search?type=jobs&skills=${skills.join(",")}&experience=${experience}&limit=20`);
      setResults(res.data.jobs || []);
    } catch (err) {
      console.error("Jobs search error:", err);
      // Fallback mock jobs
      setResults([
        { title: "Frontend Developer", company: "Tech Co", match: 95 },
        { title: "Full Stack Engineer", company: "Startup Inc", match: 88 },
        { title: "React Developer", company: "Digital Agency", match: 82 },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { results, loading, searchJobs };
}

/* -----------------------------------------------------------
   SEARCHABLE SKILLS INPUT COMPONENT
----------------------------------------------------------- */
function SkillsSearchInput({ 
  selectedSkills, 
  onAddSkill, 
  onRemoveSkill, 
  maxSkills = 15 
}) {
  const {
    query,
    setQuery,
    results,
    loading,
    error,
    search,
    category,
    setCategory,
    categories,
    popularSkills,
    recentSearches,
  } = useSkillsSearch();

  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      search(query, category);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [query, category, search]);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!showDropdown) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : results.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && results[highlightedIndex]) {
          handleAddSkill(results[highlightedIndex]);
        }
        break;
      case "Escape":
        setShowDropdown(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && dropdownRef.current) {
      const highlighted = dropdownRef.current.children[highlightedIndex];
      if (highlighted) {
        highlighted.scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightedIndex]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (inputRef.current && !inputRef.current.contains(e.target) &&
          dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddSkill = (skill) => {
    if (selectedSkills.length >= maxSkills) {
      return; // Max reached
    }
    onAddSkill(skill);
    setQuery("");
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  };

  const isSelected = (skillName) => selectedSkills.includes(skillName);
  const canAddMore = selectedSkills.length < maxSkills;

  return (
    <div className="space-y-4">
      {/* Category Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {categories.slice(0, 6).map((cat) => (
          <motion.button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              category === cat.id
                ? "bg-blue-600 text-white"
                : "bg-white/10 text-gray-300 hover:bg-white/20"
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {cat.icon} {cat.label}
          </motion.button>
        ))}
        <motion.button
          onClick={() => setCategory("all")}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-gray-400 hover:text-white"
          whileHover={{ scale: 1.05 }}
        >
          More...
        </motion.button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowDropdown(true);
              setHighlightedIndex(-1);
            }}
            onFocus={() => setShowDropdown(true)}
            onKeyDown={handleKeyDown}
            placeholder={canAddMore ? "Type to search 10,000+ skills..." : "Maximum skills reached"}
            disabled={!canAddMore}
            className={`w-full bg-white/10 p-4 pl-12 rounded-xl border text-white transition-all ${
              canAddMore 
                ? "border-white/20 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                : "border-red-500/50 opacity-60"
            }`}
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            🔍
          </div>
          {loading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <motion.div
                className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-xs text-yellow-400 mt-1">{error}</p>
        )}

        {/* Dropdown Results */}
        <AnimatePresence>
          {showDropdown && (
            <motion.div
              ref={dropdownRef}
              className="absolute z-50 w-full mt-2 bg-gray-900/95 backdrop-blur-xl rounded-xl border border-white/20 shadow-2xl overflow-hidden"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
            >
              {/* Recent Searches */}
              {query.length < 2 && recentSearches.length > 0 && (
                <div className="p-3 border-b border-white/10">
                  <p className="text-xs text-gray-500 mb-2">Recent Searches</p>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((term, i) => (
                      <button
                        key={i}
                        onClick={() => setQuery(term)}
                        className="px-2 py-1 text-xs bg-white/10 rounded-md text-gray-300 hover:bg-white/20"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Results List */}
              <div className="max-h-64 overflow-y-auto">
                {results.length === 0 && query.length >= 2 && !loading ? (
                  <div className="p-4 text-center text-gray-400">
                    <p>No skills found for "{query}"</p>
                    <p className="text-xs mt-1">Try a different search term</p>
                  </div>
                ) : (
                  results.map((skill, index) => {
                    const selected = isSelected(skill.name);
                    return (
                      <motion.button
                        key={skill.name || index}
                        onClick={() => !selected && handleAddSkill(skill)}
                        disabled={selected}
                        className={`w-full p-3 text-left flex items-center justify-between transition-all ${
                          highlightedIndex === index
                            ? "bg-blue-600/30"
                            : "hover:bg-white/10"
                        } ${selected ? "opacity-50 cursor-not-allowed" : ""}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.02 }}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-white font-medium">
                            {skill.name}
                          </span>
                          {skill.category && (
                            <span className="text-xs px-2 py-0.5 bg-white/10 rounded-full text-gray-400">
                              {skill.category}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {skill.popularity && (
                            <div className="flex items-center gap-1">
                              <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                                  style={{ width: `${skill.popularity}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-500">{skill.popularity}%</span>
                            </div>
                          )}
                          {selected ? (
                            <span className="text-xs text-green-400">✓ Added</span>
                          ) : (
                            <span className="text-xs text-gray-500">+ Add</span>
                          )}
                        </div>
                      </motion.button>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className="p-2 border-t border-white/10 bg-white/5">
                <p className="text-xs text-gray-500 text-center">
                  ↑↓ Navigate • Enter to select • Esc to close
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Selected Skills Chips */}
      <div className="flex flex-wrap gap-2">
        <AnimatePresence>
          {selectedSkills.map((skill, index) => (
            <motion.span
              key={skill}
              className="px-3 py-1.5 bg-gradient-to-r from-blue-600/30 to-purple-600/30 rounded-full text-sm border border-blue-400/50 flex items-center gap-2 group"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ delay: index * 0.03 }}
              layout
            >
              <span className="text-white">{skill}</span>
              <button
                onClick={() => onRemoveSkill(skill)}
                className="w-4 h-4 rounded-full bg-red-500/30 text-red-300 hover:bg-red-500/50 hover:text-white flex items-center justify-center text-xs transition-all opacity-70 group-hover:opacity-100"
              >
                ×
              </button>
            </motion.span>
          ))}
        </AnimatePresence>
      </div>

      {/* Skills Counter */}
      <div className="flex items-center justify-between text-xs">
        <span className={`${selectedSkills.length >= maxSkills ? "text-red-400" : "text-gray-500"}`}>
          {selectedSkills.length} / {maxSkills} skills selected
        </span>
        {selectedSkills.length > 0 && (
          <button
            onClick={() => selectedSkills.forEach(s => onRemoveSkill(s))}
            className="text-gray-500 hover:text-red-400 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Suggested Skills (when few selected) */}
      {selectedSkills.length < 3 && query.length < 2 && (
        <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/10">
          <p className="text-xs text-gray-400 mb-3">🔥 Popular Skills to Consider</p>
          <div className="flex flex-wrap gap-2">
            {popularSkills
              .filter(s => !isSelected(s.name))
              .slice(0, 8)
              .map((skill) => (
                <motion.button
                  key={skill.name}
                  onClick={() => handleAddSkill(skill)}
                  className="px-3 py-1.5 bg-white/10 rounded-lg text-xs text-gray-300 hover:bg-blue-600/30 hover:text-white transition-all border border-transparent hover:border-blue-400/50"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  + {skill.name}
                </motion.button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* -----------------------------------------------------------
   CUSTOM CURSOR (Same as before)
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
      setTrail((prev) => [...prev, newPos].slice(-40));
    });
  }, []);
  
  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    const interval = setInterval(() => setTrail((prev) => prev.filter((p) => Date.now() - p.id < 1200)), 50);
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
            style={{ left: pos.x, top: pos.y, transform: "translate(-50%, -50%)" }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: opacity * 0.8, scale: scale * 3 }}
            transition={{ duration: 0.1 }}
          >
            {isStar ? (
              <div
                className="w-8 h-8"
                style={{
                  background: `radial-gradient(circle, rgba(255, 255, 255, ${opacity}) 0%, rgba(255, 215, 0, ${opacity * 0.7}) 30%, transparent 50%)`,
                  clipPath: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
                  filter: `blur(${2 + Math.random() * 2}px)`,
                }}
              />
            ) : (
              <div
                className="w-12 h-12 rounded-full"
                style={{
                  background: `radial-gradient(circle, rgba(0, 255, 127, ${opacity}) 0%, rgba(138, 43, 226, ${opacity * 0.9}) 25%, rgba(255, 20, 147, ${opacity * 0.8}) 50%, rgba(0, 191, 255, ${opacity * 0.7}) 75%, transparent 100%)`,
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
        style={{ left: position.x, top: position.y, transform: "translate(-50%, -50%)" }}
      >
        <div className="absolute inset-0 w-12 h-12 -translate-x-1/2 -translate-y-1/2">
          <div
            className="w-full h-full rounded-full"
            style={{ background: "radial-gradient(circle, rgba(255, 200, 0, 0.4) 0%, rgba(255, 150, 0, 0.2) 40%, transparent 70%)", filter: "blur(4px)" }}
          />
        </div>
        <div className="relative w-6 h-6 -translate-x-1/2 -translate-y-1/2">
          <div
            className="absolute inset-0 rounded-full"
            style={{ background: "radial-gradient(circle, #ffed4e 0%, #ff9d00 50%, #ff6b00 100%)", boxShadow: "0 0 20px rgba(255, 200, 0, 0.8), 0 0 40px rgba(255, 150, 0, 0.4)" }}
          />
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute top-1/2 left-1/2 w-1 h-3 bg-gradient-to-t from-yellow-400 to-orange-500"
              style={{ transform: `translate(-50%, -50%) rotate(${i * 45}deg) translateY(-8px)`, transformOrigin: "center", borderRadius: "2px" }}
            />
          ))}
        </div>
      </motion.div>
    </>
  );
}

/* -----------------------------------------------------------
   3D SCENE COMPONENTS (Same as before, condensed)
----------------------------------------------------------- */
function FloatingParticles() {
  const particlesRef = useRef();
  const particleCount = 100;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3 + 0] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    const color = new THREE.Color();
    color.setHSL(Math.random(), 0.8, 0.6);
    colors[i * 3 + 0] = color.r;
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
        <bufferAttribute attach="attributes-position" count={particleCount} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={particleCount} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.1} vertexColors transparent opacity={0.8} sizeAttenuation />
    </points>
  );
}

function Planet({ position, color, scale = 1, ringColor, ringScale = 1.3 }) {
  const groupRef = useRef();
  const [hovered, setHovered] = useState(false);
  
  useFrame(() => {
    if (groupRef.current) groupRef.current.rotation.y += hovered ? 0.02 : 0.01;
  });
  
  return (
    <group ref={groupRef} position={position}>
      <mesh 
        onPointerEnter={(e) => { e.stopPropagation(); setHovered(true); }} 
        onPointerLeave={(e) => { e.stopPropagation(); setHovered(false); }}
      >
        <Sphere args={[1, 64, 64]} scale={hovered ? scale * 1.15 : scale}>
          <meshStandardMaterial 
            color={hovered ? `${color}ff` : color} 
            emissive={hovered ? color : `${color}80`} 
            emissiveIntensity={hovered ? 1.0 : 0.8} 
            roughness={hovered ? 0.05 : 0.1} 
            metalness={hovered ? 1.0 : 0.9} 
          />
        </Sphere>
      </mesh>
      <Sphere args={[1.15 * scale, 32, 32]}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={hovered ? 0.6 : 0.4} transparent opacity={hovered ? 0.7 : 0.5} side={THREE.BackSide} />
      </Sphere>
      {ringColor && (
        <Ring args={[1.2 * scale, ringScale * scale, 64]} rotation={[Math.PI / 2, 0, 0]}>
          <meshBasicMaterial color={ringColor} transparent opacity={hovered ? 0.9 : 0.7} side={THREE.DoubleSide} />
        </Ring>
      )}
    </group>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.7} />
      <pointLight position={[0, 0, 5]} intensity={2.5} color="#ffffff" />
      <directionalLight position={[-10, 10, 5]} intensity={1.5} color="#3b82f6" />
      <directionalLight position={[10, -10, 5]} intensity={1.2} color="#a855f7" />
      <hemisphereLight intensity={0.8} skyColor="#3b82f6" groundColor="#a855f7" />
      <Stars radius={80} depth={40} count={4000} factor={5} saturation={0.8} fade speed={0.4} />
      <Planet position={[-3.5, 1.5, -3]} color="#3b82f6" scale={1.8} ringColor="#60a5fa" ringScale={1.6} />
      <Planet position={[3.5, -0.5, -2.5]} color="#a855f7" scale={2.2} ringColor="#c084fc" ringScale={1.7} />
      <Planet position={[-1.5, -2.5, -4]} color="#f59e0b" scale={1.4} />
      <Planet position={[1.5, 2.5, -3.5]} color="#10b981" scale={1.6} ringColor="#34d399" ringScale={1.4} />
      <FloatingParticles />
    </>
  );
}

/* -----------------------------------------------------------
   MAIN ASSESSMENT COMPONENT
----------------------------------------------------------- */
export default function Assessment() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const total = 4;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loaded, setLoaded] = useState(false);
  
  const [form, setForm] = useState({
    interests: [],
    selectedSkills: [],
    experience: "Beginner",
    goals: "",
  });

  // Jobs search (optional - for step 4 preview)
  const { results: matchedJobs, searchJobs } = useJobsSearch();

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 600);
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

  // Search for matching jobs when reaching step 4
  useEffect(() => {
    if (step === 4 && form.selectedSkills.length > 0) {
      searchJobs(form.selectedSkills, form.experience);
    }
  }, [step, form.selectedSkills, form.experience, searchJobs]);

  const addSkill = (skill) => {
    if (!form.selectedSkills.includes(skill.name)) {
      setForm(prev => ({
        ...prev,
        selectedSkills: [...prev.selectedSkills, skill.name],
      }));
    }
  };

  const removeSkill = (skillName) => {
    setForm(prev => ({
      ...prev,
      selectedSkills: prev.selectedSkills.filter(s => s !== skillName),
    }));
  };

  const updateCheckbox = (value) => {
    setForm((s) => ({
      ...s,
      interests: s.interests.includes(value) 
        ? s.interests.filter((i) => i !== value) 
        : [...s.interests, value],
    }));
  };

  const next = async () => {
    if (step < total) {
      setStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const submitData = {
        ...form,
        skills: form.selectedSkills,
        skillsText: form.selectedSkills.join(", "),
      };
      
      const res = await api.post('/assessment', submitData);
      console.log('Assessment Response:', res.data);
      localStorage.setItem('assessmentData', JSON.stringify(res.data));
      navigate("/recommendations", { state: { assessment: res.data } });
    } catch (err) {
      console.error('Submission Error:', err);
      alert('Assessment failed! Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const back = () => {
    if (step === 1) navigate("/dashboard");
    else {
      setStep((s) => s - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const variants = {
    enter: { opacity: 0, y: 12 },
    center: { opacity: 1, y: 0, transition: { duration: 0.28 } },
    exit: { opacity: 0, y: -8, transition: { duration: 0.18 } },
  };

  const interestsList = [
    { name: "Web Development", icon: "🌐" },
    { name: "AI/ML", icon: "🤖" },
    { name: "Cybersecurity", icon: "🔒" },
    { name: "UI/UX Design", icon: "🎨" },
    { name: "Data Science", icon: "📊" },
    { name: "Cloud Computing", icon: "☁️" },
    { name: "Mobile Development", icon: "📱" },
    { name: "DevOps", icon: "⚙️" },
  ];

  const experienceLevels = [
    { value: "Beginner", label: "Beginner", desc: "0-1 years", icon: "🌱" },
    { value: "Intermediate", label: "Intermediate", desc: "1-3 years", icon: "🌿" },
    { value: "Advanced", label: "Advanced", desc: "3+ years", icon: "🌳" },
  ];

  return (
    <div className="w-full min-h-screen bg-black text-white overflow-x-hidden relative font-sans antialiased">
      {/* Loading Screen */}
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
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }} 
            />
            <motion.p 
              className="mt-6 text-gray-300 text-lg font-light" 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.4 }}
            >
              Scanning Your Skills...
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3D Background */}
      <div className="fixed inset-0 z-0">
        <Canvas 
          frameloop="always" 
          camera={{ position: [0, 0, 6], fov: 65 }} 
          gl={{ 
            alpha: false, 
            antialias: true, 
            powerPreference: "high-performance",
          }} 
          style={{ background: "linear-gradient(135deg, #000000 0%, #0a0a1a 50%, #000000 100%)" }}
        >
          <Suspense fallback={null}>
            <Scene />
            <Stars radius={120} depth={80} count={8000} factor={4} saturation={0.8} fade speed={0.2} />
          </Suspense>
          <Preload all />
        </Canvas>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-6 py-20">
        {/* Background Blurs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-pulse pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse pointer-events-none" style={{ animationDelay: "1s" }} />
        
        {loaded && (
          <motion.div 
            className="w-full max-w-3xl backdrop-blur-xl bg-white/5 rounded-3xl p-8 border border-white/10 shadow-2xl relative overflow-visible"
            initial={{ opacity: 0, y: 50 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8 }}
          >
            {/* Border Glow */}
            <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
              <div className="absolute inset-[-2px] bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 opacity-20 animate-pulse" />
            </div>
            
            <div className="relative z-10">
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-300">Step {step} of {total}</div>
                  <div className="text-sm text-gray-400">{Math.round((step / total) * 100)}%</div>
                </div>
                <div className="mt-3 bg-white/10 h-2 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(step / total) * 100}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </div>

              {/* Step Content */}
              <div className="min-h-[320px]">
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={step} 
                    initial="enter" 
                    animate="center" 
                    exit="exit" 
                    variants={variants}
                  >
                    {/* Step 1: Interests */}
                    {step === 1 && (
                      <section>
                        <h2 className="text-2xl font-semibold mb-3 bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                          Your Interests
                        </h2>
                        <p className="text-gray-400 mb-6">Select the fields you're interested in exploring</p>
                        <div className="grid grid-cols-2 gap-3">
                          {interestsList.map((item) => (
                            <motion.label 
                              key={item.name} 
                              className={`flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer ${
                                form.interests.includes(item.name)
                                  ? "bg-blue-600/20 border-blue-400/50"
                                  : "bg-white/5 border-white/10 hover:border-blue-400/30"
                              }`}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <input 
                                type="checkbox" 
                                checked={form.interests.includes(item.name)} 
                                onChange={() => updateCheckbox(item.name)} 
                                className="sr-only" 
                              />
                              <span className="text-2xl">{item.icon}</span>
                              <span className="text-white font-medium">{item.name}</span>
                              {form.interests.includes(item.name) && (
                                <motion.span 
                                  className="ml-auto text-blue-400"
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                >
                                  ✓
                                </motion.span>
                              )}
                            </motion.label>
                          ))}
                        </div>
                      </section>
                    )}

                    {/* Step 2: Skills (Enhanced) */}
                    {step === 2 && (
                      <section>
                        <h2 className="text-2xl font-semibold mb-3 bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                          Your Skills
                        </h2>
                        <p className="text-gray-400 mb-4">
                          Search from our database of 10,000+ skills
                        </p>
                        <SkillsSearchInput
                          selectedSkills={form.selectedSkills}
                          onAddSkill={addSkill}
                          onRemoveSkill={removeSkill}
                          maxSkills={15}
                        />
                      </section>
                    )}

                    {/* Step 3: Experience */}
                    {step === 3 && (
                      <section>
                        <h2 className="text-2xl font-semibold mb-3 bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                          Experience Level
                        </h2>
                        <p className="text-gray-400 mb-6">Select your current experience level</p>
                        <div className="space-y-3">
                          {experienceLevels.map((level) => (
                            <motion.label
                              key={level.value}
                              className={`flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
                                form.experience === level.value
                                  ? "bg-blue-600/20 border-blue-400/50"
                                  : "bg-white/5 border-white/10 hover:border-blue-400/30"
                              }`}
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.99 }}
                            >
                              <input
                                type="radio"
                                name="experience"
                                value={level.value}
                                checked={form.experience === level.value}
                                onChange={(e) => setForm({ ...form, experience: e.target.value })}
                                className="sr-only"
                              />
                              <span className="text-3xl">{level.icon}</span>
                              <div className="flex-1">
                                <div className="text-white font-medium">{level.label}</div>
                                <div className="text-gray-500 text-sm">{level.desc}</div>
                              </div>
                              {form.experience === level.value && (
                                <motion.span
                                  className="text-blue-400 text-xl"
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                >
                                  ✓
                                </motion.span>
                              )}
                            </motion.label>
                          ))}
                        </div>
                      </section>
                    )}

                    {/* Step 4: Goals & Summary */}
                    {step === 4 && (
                      <section>
                        <h2 className="text-2xl font-semibold mb-3 bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                          Goals & Summary
                        </h2>
                        <p className="text-gray-400 mb-4">Describe your career goals</p>
                        <textarea
                          value={form.goals}
                          onChange={(e) => setForm({ ...form, goals: e.target.value })}
                          placeholder="Example: Become a full-stack developer, transition into AI/ML, land a remote job at a tech startup..."
                          className="w-full bg-white/10 p-4 rounded-xl border border-white/20 text-white min-h-[100px] mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                        />
                        
                        {/* Summary Card */}
                        <div className="bg-white/5 rounded-xl p-4 border border-white/10 mb-4">
                          <h3 className="text-sm font-medium text-gray-400 mb-3">📋 Your Profile Summary</h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-500">Interests:</span>
                              <span className="text-white">{form.interests.length} selected</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Skills:</span>
                              <span className="text-white">{form.selectedSkills.length} added</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Experience:</span>
                              <span className="text-white">{form.experience}</span>
                            </div>
                          </div>
                        </div>

                        {/* Matched Jobs Preview */}
                        {matchedJobs.length > 0 && (
                          <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-xl p-4 border border-blue-400/20">
                            <h3 className="text-sm font-medium text-blue-300 mb-2">
                              🎯 Potential Job Matches
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {matchedJobs.slice(0, 3).map((job, i) => (
                                <span key={i} className="px-2 py-1 bg-white/10 rounded-md text-xs text-gray-300">
                                  {job.title}
                                </span>
                              ))}
                              {matchedJobs.length > 3 && (
                                <span className="text-xs text-gray-500">
                                  +{matchedJobs.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </section>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Navigation Buttons */}
              <div className="mt-8 flex items-center justify-between">
                <motion.button 
                  onClick={back} 
                  className="px-5 py-2.5 rounded-xl border border-white/20 text-white hover:bg-white/10 transition-all backdrop-blur-xl bg-white/5"
                  whileHover={{ scale: 1.05 }} 
                  whileTap={{ scale: 0.95 }}
                >
                  ← Back
                </motion.button>
                
                <div className="flex items-center gap-3">
                  <motion.button 
                    onClick={() => setStep(1)} 
                    className="px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white backdrop-blur-xl bg-white/5 border border-white/20" 
                    whileHover={{ scale: 1.05 }} 
                    title="Restart"
                  >
                    ↺ Restart
                  </motion.button>
                  
                  <motion.button 
                    onClick={next} 
                    disabled={isSubmitting} 
                    className={`px-6 py-2.5 rounded-xl text-white font-semibold transition-all ${
                      step === total 
                        ? "bg-gradient-to-r from-blue-600 to-purple-600" 
                        : "bg-gradient-to-r from-purple-600 to-cyan-600"
                    } ${isSubmitting ? "opacity-50 cursor-not-allowed" : "hover:shadow-lg hover:shadow-blue-500/25"}`}
                    whileHover={!isSubmitting ? { scale: 1.05 } : {}} 
                    whileTap={!isSubmitting ? { scale: 0.95 } : {}}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <motion.span
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        Analyzing...
                      </span>
                    ) : step === total ? (
                      "🚀 Get Recommendations"
                    ) : (
                      "Next Step →"
                    )}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
      
      {loaded && <CustomCursor />}
    </div>
  );
}
