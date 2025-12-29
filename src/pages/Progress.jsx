import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle, Flame } from "lucide-react";

export default function Progress() {
  const fade = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  };

  // Example progress data — replace with backend later
  const skills = [
    { name: "React.js", value: 70 },
    { name: "JavaScript", value: 80 },
    { name: "Node.js", value: 50 },
    { name: "Databases", value: 40 },
  ];

  const roadmap = [
    { step: "Fundamentals", value: 100 },
    { step: "Frontend Skills", value: 80 },
    { step: "Backend Basics", value: 40 },
    { step: "Full-Stack Development", value: 20 },
  ];

  const recentTasks = [
    "Completed JavaScript Functions Module",
    "Created Login + Register Frontend",
    "Finished React Hooks Tutorial",
  ];

  const weeklyStreak = 4; // placeholder number

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-6 flex justify-center">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fade}
        className="w-full max-w-4xl bg-gray-800 p-8 rounded-2xl border border-gray-700 shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link
            to="/dashboard"
            className="p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-3xl font-bold text-white">Your Progress</h1>
        </div>

        <p className="text-gray-400 mb-10">
          Track what you've learned and how close you are to your goals.
        </p>

        {/* Weekly Streak */}
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-700 mb-12 flex items-center gap-4">
          <Flame className="text-orange-400" size={32} />
          <div>
            <h2 className="text-xl font-semibold text-white">Weekly Learning Streak</h2>
            <p className="text-gray-300">{weeklyStreak} days in a row 🔥</p>
          </div>
        </div>

        {/* Skill Progress */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-4">Skill Progress</h2>
          <div className="space-y-5">
            {skills.map((s, i) => (
              <div key={i}>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-300">{s.name}</span>
                  <span className="text-gray-400">{s.value}%</span>
                </div>
                <div className="w-full bg-gray-700 h-3 rounded-full">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${s.value}%` }}
                    transition={{ duration: 0.7, delay: i * 0.1 }}
                    className="h-3 bg-blue-500 rounded-full"
                  ></motion.div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Roadmap Completion */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-4">Roadmap Completion</h2>
          <div className="space-y-5">
            {roadmap.map((r, i) => (
              <div key={i}>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-300">{r.step}</span>
                  <span className="text-gray-400">{r.value}%</span>
                </div>
                <div className="w-full bg-gray-700 h-3 rounded-full">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${r.value}%` }}
                    transition={{ duration: 0.7, delay: i * 0.1 }}
                    className="h-3 bg-green-500 rounded-full"
                  ></motion.div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Tasks */}
        <div>
          <h2 className="text-2xl font-semibold text-white mb-4">Recent Tasks</h2>
          <div className="space-y-3">
            {recentTasks.map((t, i) => (
              <div
                key={i}
                className="flex items-center gap-3 bg-gray-900 p-4 rounded-lg border border-gray-700"
              >
                <CheckCircle className="text-green-400" size={20} />
                <span className="text-gray-300">{t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Back Button */}
        <div className="flex justify-end mt-10">
          <Link
            to="/dashboard"
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
