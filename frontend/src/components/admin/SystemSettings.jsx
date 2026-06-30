export default function SystemSettings() {
  return (
    <div>
      <h1 className="text-5xl font-black mb-10">
        System
        <span className="text-cyan-400"> Settings</span>
      </h1>

      <div className="bg-slate-900 p-8 rounded-3xl border border-cyan-500/10 space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Application Status</h2>
          <p className="text-gray-400">The application is running using the current configuration.</p>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-2">Environment</h2>
          <p className="text-gray-400">Frontend: React + Vite</p>
          <p className="text-gray-400">Backend: Express + MongoDB</p>
        </div>

        <div className="bg-slate-800 p-6 rounded-3xl">
          <h2 className="text-xl font-bold mb-3">Local Storage</h2>
          <p className="text-gray-400">Admin settings and records are stored locally in the browser unless connected to the backend.</p>
        </div>
      </div>
    </div>
  );
}
