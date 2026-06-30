import { useState, useEffect } from "react";

export default function EmployeePFCL() {

  // PF
  const [totalPF, setTotalPF] =
    useState("");

  const [usedPF, setUsedPF] =
    useState("");

  // CL
  const [totalCL, setTotalCL] =
    useState("");

  const [usedCL, setUsedCL] =
    useState("");

  // Remaining
  const remainingPF =
    totalPF - usedPF;

  const remainingCL =
    totalCL - usedCL;

  // Load Saved Data
  useEffect(() => {

    const savedData =
      localStorage.getItem(
        "employeePFCL"
      );

    if (savedData) {

      const parsed =
        JSON.parse(savedData);

      setTotalPF(
        parsed.totalPF || 0
      );

      setUsedPF(
        parsed.usedPF || 0
      );

      setTotalCL(
        parsed.totalCL || 0
      );

      setUsedCL(
        parsed.usedCL || 0
      );

    }

  }, []);

  // Save PF / CL
  const handleSavePFCL = () => {

    localStorage.setItem(
      `employeePFCL-${userName}`,

      JSON.stringify({

        totalPF,
        usedPF,
        totalCL,
        usedCL,

      })
    );

  };

  return (

    <div>

      {/* Heading */}
      <h1 className="text-4xl sm:text-5xl font-black mb-10">

        PF / CL
        <span className="text-green-400">
          {" "}Limits
        </span>

      </h1>

      {/* Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

        {/* PF Card */}
        <div className="bg-slate-900 border border-green-500/10 rounded-3xl p-6 sm:p-8">

          <h2 className="text-3xl font-black mb-8">

            PF Settings

          </h2>

          {/* Total PF */}
          <div className="mb-6">

            <label className="block text-lg font-bold mb-3">

              Total PF Limit

            </label>

            <input
              type="number"
              value={totalPF}
              onChange={(e) =>
                setTotalPF(
                  Number(e.target.value)
                )
              }
              className="w-full bg-slate-800 p-5 rounded-2xl outline-none"
            />

          </div>

          {/* Used PF */}
          <div className="mb-8">

            <label className="block text-lg font-bold mb-3">

              Used PF

            </label>

            <input
              type="number"
              value={usedPF}
              onChange={(e) =>
                setUsedPF(
                  Number(e.target.value)
                )
              }
              className="w-full bg-slate-800 p-5 rounded-2xl outline-none"
            />

          </div>

          {/* Remaining */}
          <div className="bg-slate-800 rounded-3xl p-6">

            <p className="text-lg text-gray-300 mb-3">

              Remaining PF

            </p>

            <h3 className="text-5xl font-black text-green-400">

              {remainingPF}

            </h3>

          </div>

        </div>

        {/* CL Card */}
        <div className="bg-slate-900 border border-green-500/10 rounded-3xl p-6 sm:p-8">

          <h2 className="text-3xl font-black mb-8">

            CL Settings

          </h2>

          {/* Total CL */}
          <div className="mb-6">

            <label className="block text-lg font-bold mb-3">

              Total CL Limit

            </label>

            <input
              type="number"
              value={totalCL}
              onChange={(e) =>
                setTotalCL(
                  Number(e.target.value)
                )
              }
              className="w-full bg-slate-800 p-5 rounded-2xl outline-none"
            />

          </div>

          {/* Used CL */}
          <div className="mb-8">

            <label className="block text-lg font-bold mb-3">

              Used CL

            </label>

            <input
              type="number"
              value={usedCL}
              onChange={(e) =>
                setUsedCL(
                  Number(e.target.value)
                )
              }
              className="w-full bg-slate-800 p-5 rounded-2xl outline-none"
            />

          </div>

          {/* Remaining */}
          <div className="bg-slate-800 rounded-3xl p-6">

            <p className="text-lg text-gray-300 mb-3">

              Remaining CL

            </p>

            <h3 className="text-5xl font-black text-green-400">

              {remainingCL}

            </h3>

          </div>

        </div>

      </div>

      {/* Save Button */}
      <button
        onClick={handleSavePFCL}
        className="w-full mt-8 bg-green-500 hover:bg-green-600 py-5 rounded-2xl text-lg font-bold transition-all duration-300"
      >

        Save PF / CL

      </button>

    </div>
  );
}