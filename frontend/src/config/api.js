// Centralized API configuration for AttendSync
// In production (Vercel): uses VITE_API_URL (e.g. https://attendsync.onrender.com)
// In local development: defaults to empty string "" so requests use Vite dev proxy (/api -> http://localhost:5000)

const rawApiUrl = import.meta.env.VITE_API_URL || "";
export const API_BASE_URL = rawApiUrl ? rawApiUrl.replace(/\/+$/, "") : "";

/**
 * Builds a full API endpoint URL
 * @param {string} path e.g. "/api/students/login" or "api/students/login"
 * @returns {string} e.g. "https://attendsync.onrender.com/api/students/login" (prod) or "/api/students/login" (local)
 */
export const getApiUrl = (path) => {
  if (!path) return API_BASE_URL;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
};

export default getApiUrl;
