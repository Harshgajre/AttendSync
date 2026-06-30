import { useState } from "react";
import AdminDashboard from "./AdminDashboard";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (
      username === "admin" &&
      password === "admin123"
    ) {
      setIsLoggedIn(true);
      setError("");
    } else {
      setError("Invalid Admin Credentials");
    }
  };

  if (isLoggedIn) {
    return <AdminDashboard />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-slate-950 to-slate-900 text-white px-6">

      {/* Glow Effects */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-red-500/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl"></div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md bg-slate-900/80 backdrop-blur-2xl border border-red-500/20 rounded-[40px] p-10 shadow-[0_0_60px_rgba(239,68,68,0.15)]">

        {/* Header */}
        <div className="text-center mb-10">

          <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-r from-red-500 to-purple-600 flex items-center justify-center text-4xl font-black shadow-2xl shadow-red-500/30 mb-6">
            A
          </div>

          <h1 className="text-5xl font-black mb-3">
            Admin Login
          </h1>

          <p className="text-gray-400 text-lg">
            AttendSync Administration Panel
          </p>

        </div>

        {/* Inputs */}
        <div className="space-y-5">

          <input
            type="text"
            placeholder="Admin Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-slate-800/80 border border-white/10 focus:border-red-500 p-5 rounded-2xl outline-none text-white placeholder-gray-400 transition-all duration-300"
          />

          <input
            type="password"
            placeholder="Admin Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-slate-800/80 border border-white/10 focus:border-red-500 p-5 rounded-2xl outline-none text-white placeholder-gray-400 transition-all duration-300"
          />

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 py-4 rounded-2xl text-center">
              {error}
            </div>
          )}

          {/* Login Button */}
          <button
            onClick={handleLogin}
            className="w-full bg-gradient-to-r from-red-500 to-purple-600 hover:scale-[1.02] transition-all duration-300 py-5 rounded-2xl text-lg font-bold shadow-2xl shadow-red-500/20"
          >
            Login to Admin Panel
          </button>

        </div>

        {/* Demo Credentials */}
        <div className="mt-8 bg-slate-800/60 border border-white/10 rounded-2xl p-5">

          <p className="text-gray-400 text-sm mb-2">
            Demo Credentials
          </p>

          <p className="text-red-400 font-semibold">
            Username: admin
          </p>

          <p className="text-red-400 font-semibold">
            Password: admin123
          </p>

        </div>
      </div>
    </div>
  );
}