import { useState } from "react";
import EmployeeDashboard from "./EmployeeDashboard";

export default function EmployeeLogin() {

  const [employeeName, setEmployeeName] =
    useState("");

  const [officeName, setOfficeName] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [isLoggedIn, setIsLoggedIn] =
    useState(false);

  const [error, setError] =
    useState("");

  // Login
  const handleLogin = async () => {

    if (
      !employeeName ||
      !officeName ||
      !password
    ) {
      alert("Fill all fields");
      return;
    }

    try {
      const response = await fetch(
        `/api/employees/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: employeeName,
            company: officeName,
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
        "employeeUser",
        JSON.stringify(data.employee)
      );

      setError("");
      setIsLoggedIn(true);
    } catch (err) {
      setError("Unable to connect to the server.");
    }
  };

  // Dashboard
  if (isLoggedIn) {
    return (
      <EmployeeDashboard
        userName={employeeName}
        role="Employee"
        onLogout={() =>
          setIsLoggedIn(false)
        }
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-slate-950 to-slate-900 text-white px-6">

      {/* Glow */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-green-500/20 rounded-full blur-3xl"></div>

      <div className="absolute bottom-20 right-20 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl"></div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md bg-slate-900/80 backdrop-blur-2xl border border-green-500/20 rounded-[40px] p-10 shadow-[0_0_60px_rgba(34,197,94,0.15)]">

        {/* Header */}
        <div className="text-center mb-10">

          {/* Logo */}
          <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center text-4xl font-black shadow-2xl shadow-green-500/30 mb-6">

            E

          </div>

          {/* Title */}
          <h1 className="text-5xl font-black mb-3">

            Employee Login

          </h1>

          {/* Subtitle */}
          <p className="text-gray-400 text-lg">

            AttendSync Employee Portal

          </p>

        </div>

        {/* Inputs */}
        <div className="space-y-5">

          {/* Employee Name */}
          <input
            type="text"
            placeholder="Employee Name"
            value={employeeName}
            onChange={(e) =>
              setEmployeeName(
                e.target.value
              )
            }
            className="w-full bg-slate-800/80 border border-white/10 focus:border-green-400 p-5 rounded-2xl outline-none"
          />

          {/* Office */}
          <input
            type="text"
            placeholder="Office Name"
            value={officeName}
            onChange={(e) =>
              setOfficeName(
                e.target.value
              )
            }
            className="w-full bg-slate-800/80 border border-white/10 focus:border-green-400 p-5 rounded-2xl outline-none"
          />

          {/* Password */}
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }
            className="w-full bg-slate-800/80 border border-white/10 focus:border-green-400 p-5 rounded-2xl outline-none"
          />

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-300 p-4 rounded-2xl">
              {error}
            </div>
          )}

          {/* Login Button */}
          <button
            onClick={handleLogin}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 py-5 rounded-2xl text-lg font-bold hover:scale-[1.02] transition-all duration-300"
          >

            Login as Employee

          </button>

        </div>

      </div>

    </div>
  );
}