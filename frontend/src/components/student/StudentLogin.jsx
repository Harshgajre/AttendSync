import { useState } from "react";
import StudentDashboard from "./StudentDashboard";

export default function StudentLogin() {

  const [studentName, setStudentName] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {

    if (
      !studentName ||
      !collegeName ||
      !password
    ) {
      alert("Please fill all fields");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/students/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: studentName,
            college: collegeName,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Login failed");
        return;
      }

      localStorage.setItem(
        "studentUser",
        JSON.stringify(data.student)
      );

      setError("");
      setIsLoggedIn(true);
    } catch (err) {
      setError("Unable to connect to the server.");
    }
  };

  // DASHBOARD
  if (isLoggedIn) {

    return (
      <StudentDashboard
        userName={studentName}
        role="Student"
        onLogout={() => {

          setIsLoggedIn(false);

          setStudentName("");
          setCollegeName("");
          setPassword("");

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
        <div className="text-center mb-10">

          <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-4xl font-black shadow-2xl shadow-cyan-500/30 mb-6">
            S
          </div>

          <h1 className="text-5xl font-black mb-3">
            Student Login
          </h1>

          <p className="text-gray-400 text-lg">
            AttendSync Student Portal
          </p>

        </div>

        {/* Inputs */}
        <div className="space-y-5">

          {/* Student Name */}
          <input
            type="text"
            placeholder="Student Name"
            value={studentName}
            onChange={(e) =>
              setStudentName(e.target.value)
            }
            className="w-full bg-slate-800/80 border border-white/10 focus:border-cyan-400 p-5 rounded-2xl outline-none"
          />

          {/* College Name */}
          <input
            type="text"
            placeholder="College Name"
            value={collegeName}
            onChange={(e) =>
              setCollegeName(e.target.value)
            }
            className="w-full bg-slate-800/80 border border-white/10 focus:border-cyan-400 p-5 rounded-2xl outline-none"
          />

          {/* Password */}
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            className="w-full bg-slate-800/80 border border-white/10 focus:border-cyan-400 p-5 rounded-2xl outline-none"
          />

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-300 p-4 rounded-2xl mb-4">
              {error}
            </div>
          )}

          {/* Login Button */}
          <button
            onClick={handleLogin}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 py-5 rounded-2xl text-lg font-bold hover:scale-[1.02] transition-all duration-300"
          >
            Login as Student
          </button>

        </div>

      </div>

    </div>
  );
}