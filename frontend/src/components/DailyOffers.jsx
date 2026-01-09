import { useEffect, useRef } from "react";

const offers = [
  { title: "Buy 2 Pizzas", subtitle: "Get 1 Free", icon: "🌶️", accent: "#22c55e" },
  { title: "Margherita Deal", subtitle: "20% Week Discount", icon: "🍕", accent: "#ef4444" },
  { title: "Family Combo", subtitle: "Free Drinks", icon: "🥤", accent: "#f97316" },
  { title: "Happy Hours", subtitle: "10 AM – 5 PM", icon: "🧀", accent: "#3b82f6" },
  { title: "Coffee Boost", subtitle: "2nd Cup Free", icon: "☕", accent: "#a855f7" },
  { title: "Dessert Love", subtitle: "Flat ₹50 Off", icon: "🍰", accent: "#ec4899" },
  { title: "Student Deal", subtitle: "Combo @ ₹149", icon: "🎓", accent: "#14b8a6" },
  { title: "Evening Snacks", subtitle: "Free Dip", icon: "🥪", accent: "#f59e0b" },
];

export default function DailyOffers() {
  const trackRef = useRef(null);
  const cardsRef = useRef([]);

  /* ENTRY STAGGER */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e, i) => {
          if (e.isIntersecting) {
            e.target.style.animationDelay = `${i * 120}ms`;
            e.target.classList.add("offer-show");
          }
        }),
      { threshold: 0.25 }
    );

    cardsRef.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const scroll = (dir) => {
    trackRef.current.scrollBy({
      left: dir === "left" ? -320 : 320,
      behavior: "smooth",
    });
  };

  return (
    <section className="relative py-24 bg-gradient-to-b from-[#fff7ed] to-[#f2eee8] overflow-hidden">
      {/* HEADER */}
      <div className="max-w-7xl mx-auto px-6 mb-14">
        <p className="text-xs uppercase tracking-[0.35em] text-orange-600 mb-3">
          ASHA CAFÉ
        </p>

        <h2 className="text-4xl md:text-5xl font-black text-slate-900">
          Daily
          <span className="block text-orange-600">Special Offers</span>
        </h2>

        <p className="text-sm text-slate-600 mt-4 max-w-xl">
          Crafted fresh every day. Swipe → explore → enjoy ☕
        </p>
      </div>

      {/* CONTROLS */}
      <div className="absolute right-6 top-[170px] z-30 hidden md:flex gap-3">
        <button
          onClick={() => scroll("left")}
          className="nav-btn"
        >
          ←
        </button>
        <button
          onClick={() => scroll("right")}
          className="nav-btn"
        >
          →
        </button>
      </div>

      {/* CARDS */}
      <div className="relative px-6">
        <div
          ref={trackRef}
          className="flex gap-10 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-6"
        >
          {offers.map((o, i) => (
            <div
              key={i}
              ref={(el) => (cardsRef.current[i] = el)}
              className="offer-card snap-start"
              style={{ "--accent": o.accent }}
            >
              {/* GLOW */}
              <div className="offer-glow" />

              {/* CARD */}
              <div className="offer-inner">
                <div className="offer-icon">{o.icon}</div>

                <h3>{o.title}</h3>
                <p>{o.subtitle}</p>

                <span className="offer-link">View Offer →</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CSS */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none }
        .no-scrollbar { scrollbar-width: none }

        /* NAV BUTTON */
        .nav-btn {
          height: 44px;
          width: 44px;
          border-radius: 999px;
          background: white;
          font-weight: 700;
          box-shadow: 0 10px 25px rgba(0,0,0,.15);
          transition: transform .2s ease;
        }
        .nav-btn:hover { transform: scale(1.08) }

        /* CARD BASE */
        .offer-card {
          min-width: 260px;
          max-width: 260px;
          position: relative;
          opacity: 0;
          transform: translateY(40px) scale(.94);
        }

        .offer-show {
          animation: reveal .7s cubic-bezier(.22,1,.36,1) forwards;
        }

        @keyframes reveal {
          to { opacity: 1; transform: none }
        }

        /* GLOW */
        .offer-glow {
          position: absolute;
          inset: -2px;
          border-radius: 28px;
          background: radial-gradient(
            circle at top,
            var(--accent),
            transparent 60%
          );
          opacity: .35;
          filter: blur(22px);
          transition: opacity .4s ease;
        }

        /* INNER CARD */
        .offer-inner {
          position: relative;
          background: white;
          border-radius: 26px;
          padding: 26px;
          height: 100%;
          box-shadow: 0 20px 40px rgba(0,0,0,.15);
          transition: transform .45s ease, box-shadow .45s ease;
        }

        /* ICON */
        .offer-icon {
          height: 70px;
          width: 70px;
          border-radius: 18px;
          background: linear-gradient(135deg, var(--accent), #000);
          color: white;
          font-size: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 18px;
        }

        /* TEXT */
        .offer-inner h3 {
          font-weight: 900;
          font-size: 18px;
          color: #0f172a;
        }

        .offer-inner p {
          font-size: 13px;
          color: #475569;
          margin-top: 4px;
        }

        .offer-link {
          display: inline-block;
          margin-top: 20px;
          font-size: 11px;
          font-weight: 700;
          color: var(--accent);
        }

        /* HOVER FUTURISTIC */
        .offer-card:hover .offer-inner {
          transform: translateY(-14px) rotateX(6deg) rotateY(-6deg);
          box-shadow: 0 40px 80px rgba(0,0,0,.25);
        }

        .offer-card:hover .offer-glow {
          opacity: .75;
        }
      `}</style>
    </section>
  );
}
