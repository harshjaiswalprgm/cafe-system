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
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.message || "Login failed");
        return;
      }

      localStorage.setItem("role", data.role);
      if (data.role === "admin") navigate("/admin");
      else if (data.role === "kitchen") navigate("/kitchen");
      else navigate(from);
    } catch {
      setError("Server error");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-black via-neutral-900 to-black">
      <div className="bg-neutral-900/90 border border-orange-500/50 rounded-3xl shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-1 text-center text-orange-400">
          Bachelor&apos;s Hub
        </h1>
        <p className="text-sm text-neutral-300 mb-6 text-center">
          Control Panel Login
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs mb-1 text-neutral-300">
              Login as
            </label>
            <select
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              <option value="admin">Admin</option>
              <option value="kitchen">Kitchen</option>
            </select>
          </div>

          <div>
            <label className="block text-xs mb-1 text-neutral-300">
              Password
            </label>
            <input
              type="password"
              placeholder={username === "admin" ? "admin123" : "kitchen123"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          {error && (
            <p className="text-red-400 text-xs bg-red-900/40 px-3 py-2 rounded-lg border border-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-400 text-black font-semibold py-2 rounded-xl mt-2 transition transform hover:-translate-y-0.5"
          >
            Login
          </button>
        </form>

        <div className="mt-4 text-[11px] text-neutral-400 space-y-1">
          <p>
            Admin: <b>admin / admin123</b>
          </p>
          <p>
            Kitchen: <b>kitchen / kitchen123</b>
          </p>
        </div>
      </div>
    </div>
  );
}
