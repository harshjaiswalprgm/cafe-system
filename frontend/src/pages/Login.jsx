const API = import.meta.env.VITE_API_URL;
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/admin";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.message || "Login failed");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);

      if (data.role === "admin") navigate("/admin");
      else if (data.role === "kitchen") navigate("/kitchen");
      else navigate(from);
    } catch {
      setError("Server error");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* ✅ PARALLAX ZOOM BACKGROUND */}
      <div
        className="absolute inset-0 bg-cover bg-center animate-parallax"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1920&q=80')",
        }}
      />

      {/* ✅ Dark overlay for contrast */}
      <div className="absolute inset-0 bg-black/50" />

      {/* ✅ Glass Main Card */}
      <div className="relative z-10 w-[95%] max-w-4xl h-[520px] rounded-[28px] bg-white/20 backdrop-blur-2xl shadow-2xl flex overflow-hidden border border-white/30">
        {/* ✅ LEFT BRAND PANEL */}
        <div className="hidden md:flex w-1/2 flex-col items-center justify-center bg-black/30">
          <h1 className="text-4xl font-extrabold text-orange-400 tracking-wide mb-3">
            Bachelor&apos;s Hub
          </h1>
          <p className="text-sm text-neutral-200 tracking-wide">
            Smart Cafe Management System
          </p>
        </div>

        {/* ✅ RIGHT LOGIN PANEL */}
        <div className="w-full md:w-1/2 bg-white/95 p-10 flex flex-col justify-center">
          <h2 className="text-2xl font-bold text-neutral-900 mb-1">
            Welcome Back
          </h2>
          <p className="text-sm text-neutral-500 mb-8">
            Login to control your cafe
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* ✅ ROLE */}
            <div>
              <label className="text-xs font-semibold text-neutral-700">
                Login as
              </label>
              <select
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full mt-1 rounded-xl border border-neutral-400 bg-white px-4 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="admin">Admin</option>
                <option value="kitchen">Kitchen</option>
              </select>
            </div>

            {/* ✅ PASSWORD */}
            <div>
              <label className="text-xs font-semibold text-neutral-700">
                Password
              </label>
              <input
                type="password"
                placeholder={username === "admin" ? "admin123" : "kitchen123"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-1 rounded-xl border border-neutral-400 bg-white px-4 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* ✅ ERROR */}
            {error && (
              <p className="text-red-600 text-xs bg-red-100 px-3 py-2 rounded-lg border border-red-300">
                {error}
              </p>
            )}

            {/* ✅ BUTTON */}
            <button
              type="submit"
              className="w-full mt-2 bg-black text-white hover:bg-orange-500 py-2 rounded-xl font-semibold transition"
            >
              Continue
            </button>
          </form>

          {/* ✅ TEST CREDENTIALS */}
          <div className="mt-6 text-[11px] text-neutral-600 space-y-1">
            <p>
              Admin: <b>admin / admin123</b>
            </p>
            <p>
              Kitchen: <b>kitchen / kitchen123</b>
            </p>
          </div>
        </div>
      </div>

      {/* ✅ PARALLAX ANIMATION CSS */}
      <style>{`
        @keyframes parallax {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }

        .animate-parallax {
          animation: parallax 25s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
