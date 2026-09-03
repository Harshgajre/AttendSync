import { useState, useEffect } from "react";
import HomePage from "./components/HomePage";
import AdminLogin from "./components/admin/AdminLogin";
import AdminDashboard from "./components/admin/AdminDashboard";

function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener("popstate", handleLocationChange);
    return () => window.removeEventListener("popstate", handleLocationChange);
  }, []);

  const path = currentPath.toLowerCase();

  // Admin Area Routing
  if (path.startsWith("/admin")) {
    const adminToken = localStorage.getItem("adminToken");
    const adminUser = (() => {
      try {
        return JSON.parse(localStorage.getItem("adminUser") || "{}");
      } catch {
        return {};
      }
    })();

    const isAdminAuthenticated = Boolean(
      adminToken && adminUser && (adminUser.role === "admin" || adminUser.role === "faculty_admin")
    );

    const handleAdminLogout = () => {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");
      if (window.location.pathname !== "/admin/login") {
        window.history.pushState({}, "", "/admin/login");
        setCurrentPath("/admin/login");
      } else {
        setCurrentPath("/admin/login");
      }
    };

    // If authenticated admin, show Admin Dashboard for /admin or /admin/dashboard
    if (isAdminAuthenticated) {
      return <AdminDashboard onLogout={handleAdminLogout} />;
    }

    // Unauthenticated or non-admin attempting admin access
    return (
      <AdminLogin
        onLoginSuccess={() => {
          window.history.pushState({}, "", "/admin/dashboard");
          setCurrentPath("/admin/dashboard");
        }}
      />
    );
  }

  // Normal User Flow (Student / Employee)
  return <HomePage />;
}

export default App;