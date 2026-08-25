import { useState, useEffect } from "react";
import StudentDashboard from "./StudentDashboard";

export default function StudentLogin() {
  const [isRegister, setIsRegister] = useState(false);
  const [studentName, setStudentName] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [semester, setSemester] = useState("1");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Check existing authenticated session on load
  useEffect(() => {
    try {
      const token = localStorage.getItem("studentToken");
      const savedUser = localStorage.getItem("studentUser");

      if (token && savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed && parsed.name) {
          setStudentName(parsed.name);
          setCollegeName(parsed.college || "");
          setIsLoggedIn(true);
        }
      }
    } catch (err) {
      localStorage.removeItem("studentToken");
      localStorage.removeItem("studentUser");
    }
  }, []);

  const handleLogin = async () => {
    setError("");
    setSuccessMsg("");

    if (!studentName.trim() || !collegeName.trim() || !password) {
      setError("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/students/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: studentName.trim(),
          college: collegeName.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Login failed. Please check your credentials.");
        setLoading(false);
        return;
      }

      // Store JWT token and user info
      if (data.token) {
        localStorage.setItem("studentToken", data.token);
      }
      if (data.student) {
        localStorage.setItem("studentUser", JSON.stringify(data.student));
      }

      setError("");
      setIsLoggedIn(true);
    } catch (err) {
      setError("Unable to connect to the server. Please verify the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setError("");
    setSuccessMsg("");

    if (!studentName.trim() || !collegeName.trim() || !password) {
      setError("Please fill all required fields");
      return;
    }

    if (password.length < 4) {
      setError("Password must be at least 4 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/students/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: studentName.trim(),
          college: collegeName.trim(),
          semester: semester || "1",
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Registration failed. Please try again.");
        setLoading(false);
        return;
      }

      // Store JWT token and user info
      if (data.token) {
        localStorage.setItem("studentToken", data.token);
      }
      if (data.student) {
        localStorage.setItem("studentUser", JSON.stringify(data.student));
      }

      setError("");
      setIsLoggedIn(true);
    } catch (err) {
      setError("Unable to connect to the server. Please verify the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  // DASHBOARD
  if (isLoggedIn) {
    return (
      <StudentDashboard
        userName={studentName}
        role="Student"
        onLogout={() => {
          localStorage.removeItem("studentToken");
          localStorage.removeItem("studentUser");
          setIsLoggedIn(false);
          setStudentName("");
          setCollegeName("");
          setPassword("");
          setConfirmPassword("");
          setError("");
          setSuccessMsg("");
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white px-6">
      {/* Glow */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-20 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl"></div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md bg-slate-900/80 backdrop-blur-2xl border border-cyan-500/20 rounded-[40px] p-10 shadow-[0_0_60px_rgba(34,211,238,0.15)]">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-4xl font-black shadow-2xl shadow-cyan-500/30 mb-6">
            S
          </div>

          <h1 className="text-4xl sm:text-5xl font-black mb-3">
            {isRegister ? "Student Register" : "Student Login"}
          </h1>

          <p className="text-gray-400 text-base sm:text-lg">
            {isRegister
              ? "Create your AttendSync student account"
              : "AttendSync Student Portal"}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-800/80 p-1.5 rounded-2xl mb-6 border border-white/10">
          <button
            type="button"
            onClick={() => {
              setIsRegister(false);
              setError("");
              setSuccessMsg("");
            }}
            className={`flex-1 py-3 text-sm sm:text-base font-bold rounded-xl transition-all duration-300 ${
              !isRegister
                ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/20"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegister(true);
              setError("");
              setSuccessMsg("");
            }}
            className={`flex-1 py-3 text-sm sm:text-base font-bold rounded-xl transition-all duration-300 ${
              isRegister
                ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/20"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Register
          </button>
        </div>

        {/* Inputs */}
        <div className="space-y-4">
          {/* Student Name */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1.5 ml-1">
              Full Name
            </label>
            <input
              type="text"
              placeholder="e.g. Rahul Sharma"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="w-full bg-slate-800/80 border border-white/10 focus:border-cyan-400 p-4 rounded-2xl outline-none text-white transition-all placeholder:text-gray-500"
            />
          </div>

          {/* College Name */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1.5 ml-1">
              College / University
            </label>
            <input
              type="text"
              placeholder="e.g. IIT Bombay"
              value={collegeName}
              onChange={(e) => setCollegeName(e.target.value)}
              className="w-full bg-slate-800/80 border border-white/10 focus:border-cyan-400 p-4 rounded-2xl outline-none text-white transition-all placeholder:text-gray-500"
            />
          </div>

          {/* Semester (in register mode) */}
          {isRegister && (
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1.5 ml-1">
                Semester
              </label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full bg-slate-800/80 border border-white/10 focus:border-cyan-400 p-4 rounded-2xl outline-none text-white transition-all"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={String(s)} className="bg-slate-900 text-white">
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Password */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1.5 ml-1">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-800/80 border border-white/10 focus:border-cyan-400 p-4 rounded-2xl outline-none text-white transition-all placeholder:text-gray-500"
            />
          </div>

          {/* Confirm Password (in register mode) */}
          {isRegister && (
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1.5 ml-1">
                Confirm Password
              </label>
              <input
                type="password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-800/80 border border-white/10 focus:border-cyan-400 p-4 rounded-2xl outline-none text-white transition-all placeholder:text-gray-500"
              />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-4 rounded-2xl text-sm leading-relaxed">
              {error}
            </div>
          )}

          {/* Success Message */}
          {successMsg && (
            <div className="bg-green-500/10 border border-green-500/30 text-green-300 p-4 rounded-2xl text-sm leading-relaxed">
              {successMsg}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="button"
            disabled={loading}
            onClick={isRegister ? handleRegister : handleLogin}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 py-4 sm:py-5 rounded-2xl text-lg font-bold hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-xl shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading
              ? "Please wait..."
              : isRegister
              ? "Create Student Account"
              : "Login as Student"}
          </button>
        </div>

        {/* Footer switch prompt */}
        <div className="mt-6 text-center text-sm text-gray-400">
          {isRegister ? (
            <p>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setIsRegister(false);
                  setError("");
                }}
                className="text-cyan-400 hover:underline font-semibold"
              >
                Sign In
              </button>
            </p>
          ) : (
            <p>
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setIsRegister(true);
                  setError("");
                }}
                className="text-cyan-400 hover:underline font-semibold"
              >
                Register here
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}