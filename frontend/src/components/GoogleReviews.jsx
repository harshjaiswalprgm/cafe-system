import { useEffect, useRef } from "react";

/* ================= REVIEWS DATA ================= */
const reviews = [
  { name: "Rahul", text: "Best coffee I’ve had in Bangalore ☕", rating: 5 },
  { name: "Ananya", text: "Super fast service & fresh food!", rating: 5 },
  { name: "Vikram", text: "Loved the ambience. Premium feel ✨", rating: 4 },
  { name: "Sneha", text: "Affordable & tasty. Will visit again!", rating: 5 },
  { name: "Arjun", text: "Perfect hangout café for evenings.", rating: 4 },
  { name: "Rahul", text: "Best coffee I’ve had in Bangalore ☕", rating: 5 },
  { name: "Ananya", text: "Super fast service & fresh food!", rating: 5 },
  { name: "Vikram", text: "Loved the ambience. Premium feel ✨", rating: 4 },
  { name: "Sneha", text: "Affordable & tasty. Will visit again!", rating: 5 },
  { name: "Arjun", text: "Perfect hangout café for evenings.", rating: 4 },
  { name: "Pooja", text: "Zero waiting really means zero waiting 😍", rating: 5 },
  { name: "Rohit", text: "QR ordering is super smooth.", rating: 5 },
  { name: "Pooja", text: "Zero waiting really means zero waiting 😍", rating: 5 },
  { name: "Rohit", text: "QR ordering is super smooth.", rating: 5 },
  { name: "Kiran", text: "Loved the cold coffee & sandwiches.", rating: 4 },
];

export default function GoogleReviews() {
  const ref = useRef(null);

  useEffect(() => {
    const cards = ref.current.querySelectorAll(".review-card");
    const w = window.innerWidth;

    cards.forEach((card, i) => {
      let x = 0;
      let y = 0;
      let drift = 0;

      /* 🖥 DESKTOP */
      if (w >= 1024) {
        do {
          x = Math.random() * 1000 - 500;
          y = Math.random() * 420 - 210;
        } while (Math.abs(x) < 260 && Math.abs(y) < 220);

        drift = 60;
      }

      /* 📱 MOBILE / TABLET */
      else {
        x = 0;
        y = i * 90 - (reviews.length * 45);
        drift = 12;
      }

      card.style.setProperty("--x", `${x}px`);
      card.style.setProperty("--y", `${y}px`);
      card.style.setProperty("--dx", `${(Math.random() * 2 - 1) * drift}px`);
      card.style.setProperty("--dy", `${(Math.random() * 2 - 1) * drift}px`);
      card.style.animationDuration = `${22 + Math.random() * 8}s`;
    });
  }, []);

  return (
    <section className="relative py-28 overflow-hidden bg-white">
      {/* HEADER */}
      <div className="text-center mb-20 px-4">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-400 mb-3">
          CUSTOMER TRUST
        </p>

        <h2 className="text-4xl md:text-6xl font-black text-slate-900">
          Google{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-red-500 to-yellow-500">
            Reviews
          </span>
        </h2>

        <p className="mt-4 text-sm text-slate-600">
          Real people. Real experiences.
        </p>
      </div>

      {/* FLOAT AREA */}
      <div
        ref={ref}
        className="relative max-w-6xl mx-auto h-[520px] flex items-center justify-center"
      >
        {/* GOOGLE LOGO */}
        <div className="relative z-20 google-logo">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/960px-Google_%22G%22_logo.svg.png"
            alt="Google"
            className="h-40 md:h-56 select-none"
          />
        </div>

        {/* REVIEWS */}
        {reviews.map((r, i) => (
          <div key={i} className="review-card absolute">
            <div className="review-inner">
              <p className="text-sm text-slate-700 leading-snug">
                “{r.text}”
              </p>

              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800">
                  {r.name}
                </span>
                <span className="text-yellow-500">
                  {"★".repeat(r.rating)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* STYLES */}
      <style>{`
        .google-logo {
          filter:
            drop-shadow(0 0 18px rgba(66,133,244,0.35))
            drop-shadow(0 0 22px rgba(234,67,53,0.25))
            drop-shadow(0 0 26px rgba(251,188,5,0.25))
            drop-shadow(0 0 30px rgba(52,168,83,0.25));
        }

        .review-card {
          transform: translate(var(--x), var(--y));
          animation: drift linear infinite;
        }

        .review-card:hover {
          animation-play-state: paused;
          z-index: 50;
        }

        .review-inner {
          background: white;
          border-radius: 20px;
          padding: 16px 18px;
          width: 240px;
          box-shadow:
            0 16px 40px rgba(0,0,0,0.14);
          transition: transform 0.4s ease;
        }

        .review-card:hover .review-inner {
          transform: scale(1.1);
        }

        @keyframes drift {
          0% {
            transform: translate(var(--x), var(--y));
          }
          50% {
            transform: translate(
              calc(var(--x) + var(--dx)),
              calc(var(--y) + var(--dy))
            );
          }
          100% {
            transform: translate(var(--x), var(--y));
          }
        }

        /* 📱 MOBILE SAFETY */
        @media (max-width: 768px) {
          .review-inner {
            width: 88vw;
          }
        }
      `}</style>
    </section>
  );
}
