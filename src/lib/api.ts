import axios from "axios"

const api = axios.create({
  baseURL: "/api",
  withCredentials: true, // send session cookies on every request
  headers: {
    "Content-Type": "application/json",
  },
})

console.log("API base URL:", api)

/* ── Response interceptor ────────────────────────────────────────────
   Unwrap the { success, message, data } envelope so callers just get
   `data` back, and normalise errors into a plain Error with `.message`
   set to the server's human-readable string.
─────────────────────────────────────────────────────────────────────── */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      const serverMessage =
        error.response?.data?.message ?? error.message ?? "حدث خطأ غير متوقع"

      // Session expired on a protected route — redirect to login.
      // Skip this for auth routes themselves (e.g. wrong credentials returns 401
      // but we want to show the error in-page, not redirect).
      const url = error.config?.url ?? ""
      if (error.response?.status === 401 && !url.includes("/auth/")) {
        window.location.href = "/login"
      }

      return Promise.reject(new Error(serverMessage))
    }
    return Promise.reject(error)
  }
)

export default api
