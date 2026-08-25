import { useState, useEffect } from "react";
import AdminDashboard from "./AdminDashboard";

export default function AdminLogin({ onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Check existing authenticated admin session
  useEffect(() => {
    try {
      const token = localStorage.getItem("adminToken");
      const savedUser = localStorage.getItem("adminUser");

      if (token && savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed && parsed.role === "admin") {
          setIsLoggedIn(true);
        }
      }
    } catch (err) {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");
    }
  }, []);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setError("");

    if (!username.trim() || !password) {
      setError("Please provide admin username/email and password");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Invalid Admin Credentials");
        setLoading(false);
        return;
      }

      // Store JWT token and user info
      if (data.token) {
        localStorage.setItem("adminToken", data.token);
      }
      if (data.admin) {
        localStorage.setItem("adminUser", JSON.stringify(data.admin));
      }

      setError("");
      setIsLoggedIn(true);
      if (onLoginSuccess) {
        onLoginSuccess(data.admin);
      }
    } catch (err) {
      setError("Unable to connect to the server. Please verify the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    setIsLoggedIn(false);
    setUsername("");
    setPassword("");
    setError("");
  };

  if (isLoggedIn) {
    return <AdminDashboard onLogout={handleLogout} />;
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

          <h1 className="text-4xl sm:text-5xl font-black mb-3">
            Admin Login
          </h1>

          <p className="text-gray-400 text-base sm:text-lg">
            AttendSync Administration Panel
          </p>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1.5 ml-1">
              Admin Username or Email
            </label>
            <input
              type="text"
              placeholder="e.g. admin or admin@attendsync.com"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-800/80 border border-white/10 focus:border-red-500 p-4 sm:p-5 rounded-2xl outline-none text-white placeholder-gray-500 transition-all duration-300"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1.5 ml-1">
              Admin Password
            </label>
            <input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-800/80 border border-white/10 focus:border-red-500 p-4 sm:p-5 rounded-2xl outline-none text-white placeholder-gray-500 transition-all duration-300"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-2xl text-center text-sm leading-relaxed">
              {error}
            </div>
          )}

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-red-500 to-purple-600 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 py-4 sm:py-5 rounded-2xl text-lg font-bold shadow-2xl shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? "Authenticating..." : "Login to Admin Panel"}
          </button>
        </form>

        {/* Default Credentials Info */}
        <div className="mt-8 bg-slate-800/60 border border-white/10 rounded-2xl p-5">
          <p className="text-gray-400 text-xs mb-2 uppercase tracking-wider font-semibold">
            Default Admin Credentials
          </p>

          <p className="text-red-400 font-semibold text-sm">
            Username: <span className="text-white">admin</span> (or <span className="text-white">admin@attendsync.com</span>)
          </p>

          <p className="text-red-400 font-semibold text-sm mt-1">
            Password: <span className="text-white">admin123</span>
          </p>
        </div>
      </div>
    </div>
  );
}