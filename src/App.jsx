// src/App.jsx - Fixed with Assessment Route + Placeholders
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Assessment from "./pages/Assessment"; // NEW: Import Assessment

// Optional: Uncomment as you add these pages
// import Recommendations from "./pages/Recommendations";
// import Roadmap from "./pages/Roadmap";
// import Progress from "./pages/Progress";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/assessment" element={<Assessment />} /> {/* NEW: This fixes the blank page */}
        
        {/* Optional: Add these as you build */}
        {/* <Route path="/recommendations" element={<Recommendations />} /> */}
        {/* <Route path="/roadmap" element={<Roadmap />} /> */}
        {/* <Route path="/progress" element={<Progress />} /> */}
        
        {/* Catch-all 404 for unknown routes */}
        <Route path="*" element={
          <div className="flex items-center justify-center min-h-screen bg-black text-white p-4 text-center">
            <div>
              <h1 className="text-4xl font-bold mb-4">Lost in the Cosmos? 🚀</h1>
              <p className="text-gray-400 mb-6">Page not found—head back to the dashboard.</p>
              <a href="/dashboard" className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition">Return to Dashboard</a>
            </div>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;