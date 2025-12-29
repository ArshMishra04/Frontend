import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { CheckCircle, Circle, ArrowLeft } from "lucide-react";

export default function Roadmap() {
  const roadmap = [
    {
      title: "Step 1: Fundamentals",
      desc: "Start with core programming concepts and essential tools.",
      items: [
        "Learn HTML, CSS, JavaScript Basics",
        "Understand Git & GitHub",
        "Practice basic projects",
      ],
    },
    {
      title: "Step 2: Frontend Skills",
      desc: "Build strong frontend knowledge to create dynamic UIs.",
      items: [
        "Learn React.js",
        "Build UI components",
        "State management basics",
      ],
    },
    {
      title: "Step 3: Backend Basics",
      desc: "Get comfortable with backend technologies and databases.",
      items: [
        "Learn Node.js & Express",
        "APIs, routing & middleware",
        "MongoDB or SQL basics",
      ],
    },
    {
      title: "Step 4: Full-Stack Development",
      desc: "Connect frontend + backend and build real applications.",
      items: [
        "Create full-stack apps",
        "Authentication & authorization",
        "Deployment (Render, Vercel, Netlify)",
      ],
    },
    {
      title: "Step 5: Advanced Skills",
      desc: "Prepare for professional roles and advanced challenges.",
      items: [
        "Master system design basics",
        "Work on SaaS-level projects",
        "Prepare for interviews",
      ],
    },
  ];

  const fade = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  };

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
          <h1 className="text-3xl font-bold text-white">Your Career Roadmap</h1>
        </div>

        <p className="text-gray-400 mb-10">
          Follow this personalized step-by-step path to reach your career goals.
        </p>

        {/* Timeline */}
        <div className="relative border-l-2 border-gray-600 ml-4">
          {roadmap.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.15 }}
              className="mb-10 ml-6"
            >
              <span className="absolute -left-4 flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 border-2 border-blue-500">
                <Circle className="text-blue-400" size={18} />
              </span>

              <h3 className="text-xl font-semibold text-blue-400">{step.title}</h3>
              <p className="text-gray-400 mb-4">{step.desc}</p>

              <ul className="space-y-2 text-gray-300">
                {step.items.map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle size={18} className="text-green-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex justify-between mt-12">
          <Link
            to="/recommendations"
            className="px-5 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
          >
            Back to Recommendations
          </Link>

          <Link
            to="/progress"
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Progress Tracker
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
