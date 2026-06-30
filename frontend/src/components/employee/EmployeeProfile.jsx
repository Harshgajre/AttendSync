import { useState } from "react";

export default function EmployeeProfile({
  userName,
  role,
 percentage,
}) {

  // Edit Mode
  const [isEditing, setIsEditing] =
    useState(false);

  // Employee Data
  const [employeeId] =
    useState("EMP1024");

  const [email, setEmail] =
    useState("employee@company.com");

  const [phone, setPhone] =
    useState("+91 9876543210");

  const [joiningDate, setJoiningDate] =
    useState("2026-06-10");

  // Experience Calculate
  const calculateExperience = () => {

    const join =
      new Date(joiningDate);

    const today =
      new Date();

    let years =
      today.getFullYear() -
      join.getFullYear();

    let months =
      today.getMonth() -
      join.getMonth();

    let days =
      today.getDate() -
      join.getDate();

    if (days < 0) {

      months--;

      days += 30;

    }

    if (months < 0) {

      years--;

      months += 12;

    }

    return `${years} Years ${months} Months ${days} Days`;
  };

  const experience =
    calculateExperience();

  // Performance Based On Attendance
  const getPerformance = () => {

    if (percentage >= 90)
      return "Excellent";

    if (percentage >= 75)
      return "Very Good";

    if (percentage >= 60)
      return "Good";

    if (percentage >= 40)
      return "Average";

    return "Poor";
  };

  return (
    <div className="text-white">

      {/* Heading */}
      <h1 className="text-4xl sm:text-5xl font-black mb-10">

        My
        <span className="text-green-400">
          {" "}Profile
        </span>

      </h1>

      {/* Main Card */}
      <div className="bg-slate-900 border border-green-500/10 rounded-3xl p-6 sm:p-10">

        <div className="flex flex-col xl:flex-row gap-10">

          {/* LEFT */}
          <div className="flex flex-col items-center xl:items-start">

            {/* Avatar */}
            <div className="w-36 h-36 rounded-full bg-green-500 flex items-center justify-center text-5xl font-black mb-6">

              {userName?.charAt(0)}

            </div>

            {/* Name */}
            <h2 className="text-4xl font-black mb-2">

              {userName}

            </h2>

            {/* Role */}
            <p className="text-green-400 text-xl font-bold mb-6">

              {role}

            </p>

            {/* Status */}
            <div className="bg-green-500/20 text-green-400 px-6 py-3 rounded-2xl font-bold">

              Active Employee

            </div>

          </div>

          {/* RIGHT */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Employee ID */}
            <div className="bg-slate-800 rounded-3xl p-6">

              <p className="text-gray-400 mb-2">
                Employee ID
              </p>

              <h3 className="text-2xl font-black">

                {employeeId}

              </h3>

            </div>

            {/* Department */}
            <div className="bg-slate-800 rounded-3xl p-6">

              <p className="text-gray-400 mb-2">
                Department
              </p>

              <h3 className="text-2xl font-black">
                IT Department
              </h3>

            </div>

            {/* Email */}
            <div className="bg-slate-800 rounded-3xl p-6">

              <p className="text-gray-400 mb-2">
                Email
              </p>

              <h3 className="text-xl font-black break-all">

                {email}

              </h3>

            </div>

            {/* Phone */}
            <div className="bg-slate-800 rounded-3xl p-6">

              <p className="text-gray-400 mb-2">
                Phone
              </p>

              <h3 className="text-2xl font-black">

                {phone}

              </h3>

            </div>

            {/* Joining */}
            <div className="bg-slate-800 rounded-3xl p-6">

              <p className="text-gray-400 mb-2">
                Joining Date
              </p>

              <h3 className="text-2xl font-black">

                {joiningDate}

              </h3>

            </div>

            {/* Experience */}
            <div className="bg-slate-800 rounded-3xl p-6">

              <p className="text-gray-400 mb-2">
                Experience
              </p>

              <h3 className="text-2xl font-black">

                {experience}

              </h3>

            </div>

            {/* Attendance */}
            <div className="bg-slate-800 rounded-3xl p-6">

              <p className="text-gray-400 mb-2">
                Attendance
              </p>

              <h3 className="text-3xl font-black text-green-400">

                {percentage}%

              </h3>

            </div>

            {/* Performance */}
            <div className="bg-slate-800 rounded-3xl p-6">

              <p className="text-gray-400 mb-2">
                Performance
              </p>

              <h3 className="text-3xl font-black text-green-400">

                {getPerformance()}

              </h3>

            </div>

          </div>

        </div>

        {/* Button */}
        <button
          onClick={() =>
            setIsEditing(!isEditing)
          }
          className="mt-10 w-full bg-green-500 hover:bg-green-600 py-5 rounded-2xl text-lg font-bold transition-all"
        >

          {isEditing
            ? "Save Profile"
            : "Edit Profile"}

        </button>

        {/* Edit Form */}
        {isEditing && (

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Email */}
            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(
                  e.target.value
                )
              }
              placeholder="Enter Email"
              className="bg-slate-800 p-5 rounded-2xl outline-none"
            />

            {/* Phone */}
            <input
              type="text"
              value={phone}
              onChange={(e) =>
                setPhone(
                  e.target.value
                )
              }
              placeholder="Enter Phone"
              className="bg-slate-800 p-5 rounded-2xl outline-none"
            />

            {/* Joining Date */}
            <input
              type="date"
              value={joiningDate}
              onChange={(e) =>
                setJoiningDate(
                  e.target.value
                )
              }
              className="bg-slate-800 p-5 rounded-2xl outline-none"
            />

          </div>

        )}

      </div>

    </div>
  );
}