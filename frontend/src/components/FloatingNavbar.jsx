import { useEffect, useState } from "react";
import SnakeGame from "./SnakeGame";

import {
  Home,
  Search,
  Image,
  MessageCircle,
  ShoppingBag,
  MapPin,
  CloudSun,
  Gamepad2,
} from "lucide-react";

export default function FloatingNavbar() {
  const [time, setTime] = useState(new Date());
  const [showSnake, setShowSnake] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const navItems = [
    { icon: Home, label: "Home", href: "#" },
    { icon: Search, label: "Menu", href: "#menu" },
    { icon: Image, label: "Gallery", href: "#gallery" },
    { icon: MapPin, label: "Google Reviews", href: "#reviews" },
    { icon: ShoppingBag, label: "Orders", href: "#orders" },
  ];

  return (
    <>
      {/* ================= DESKTOP FLOATING NAV ================= */}
      <aside className="fixed left-4 top-1/2 -translate-y-1/2 z-50 hidden md:flex">
        <div className="flex flex-col items-center gap-5 px-3 py-4 rounded-[28px] bg-white/80 backdrop-blur-xl shadow-xl border border-black/5">

          {/* LOGO */}
          <div className="h-10 w-10 rounded-full bg-orange-500 text-black font-black flex items-center justify-center">
            ☕
          </div>

          {/* TIME */}
          <div className="text-center leading-tight">
            <p className="text-[10px] font-semibold">
              {time.toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
              })}
            </p>
            <p className="text-[11px] font-bold">
              {time.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>

          {/* NAV ICONS */}
          <nav className="flex flex-col gap-3">
            {navItems.map((item, i) => {
              const Icon = item.icon;
              return (
                <a
                  key={i}
                  href={item.href}
                  title={item.label}
                  className="group h-10 w-10 rounded-full flex items-center justify-center text-slate-600 hover:bg-orange-500 hover:text-black transition"
                >
                  <Icon size={18} />
                </a>
              );
            })}
          </nav>

          {/* WEATHER */}
          <button
            title="Weather"
            className="h-9 w-9 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center hover:bg-orange-100 transition"
          >
            <CloudSun size={18} />
          </button>

          {/* SNAKE GAME */}
          <button
            onClick={() => setShowSnake(true)}
            title="Play Snake"
            className="h-11 w-11 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-black shadow-lg flex items-center justify-center hover:scale-105 transition"
          >
            <Gamepad2 size={20} />
          </button>
        </div>
      </aside>

      {/* ================= MOBILE BOTTOM NAV ================= */}
      <nav className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 md:hidden">
        <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/90 backdrop-blur-xl shadow-xl border border-black/5">
          {navItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <a
                key={i}
                href={item.href}
                className="h-10 w-10 rounded-full flex items-center justify-center text-slate-700 hover:bg-orange-500 hover:text-black transition"
              >
                <Icon size={18} />
              </a>
            );
          })}

          <button
            onClick={() => setShowSnake(true)}
            className="h-11 w-11 rounded-full bg-orange-500 text-black flex items-center justify-center"
          >
            <Gamepad2 size={20} />
          </button>
        </div>
      </nav>

      {/* ================= SNAKE GAME MODAL ================= */}
     {showSnake && <SnakeGame onClose={() => setShowSnake(false)} />}
    </>
  );
}
