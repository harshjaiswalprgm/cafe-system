const API = import.meta.env.VITE_API_URL;
import { useEffect, useMemo, useState } from "react";
import FloatingNavbar from "../components/FloatingNavbar";
import Footer from "../components/Footer";
import DailyOffers from "../components/DailyOffers";
import GoogleReviews from "../components/GoogleReviews";
import ImageFeed from "../components/ImageFeed";




/* ================= HERO IMAGES ================= */
const heroImages = [
  "https://images.unsplash.com/photo-1550547660-d9450f859349",
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38",
  "https://images.unsplash.com/photo-1606755962773-d324e0a13086",
  "https://images.unsplash.com/photo-1550317138-10000687a72b",
];

/* ================= FLOATING DOODLES ================= */
function FloatingDoodles() {
  const doodles = ["☕", "🍩", "🥐", "🧋", "🍰", "🍪", "🥪"];

  const particles = useMemo(() => {
    return Array.from({ length: 26 }).map(() => ({
      left: Math.random() * 100,
      size: 16 + Math.random() * 18,
      duration: 25 + Math.random() * 25,
      delay: Math.random() * 10,
      emoji: doodles[Math.floor(Math.random() * doodles.length)],
    }));
  }, []);

  return (

    <div className="fixed inset-0 z-[5] pointer-events-none overflow-hidden">

      {particles.map((p, i) => (
        <span
          key={i}
          style={{
            left: `${p.left}%`,
            fontSize: `${p.size}px`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
       className="absolute top-[-10%] text-black/50 dark:text-white/90 animate-float"

        >
          {p.emoji}
        </span>
      ))}

      <style>{`
        @keyframes float {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          15% {
            opacity: 1;
          }
          50% {
            transform: translateY(50vh) translateX(20px);
          }
          100% {
            transform: translateY(110vh) translateX(-20px);
            opacity: 0;
          }
        }
        .animate-float {
          animation-name: float;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
      `}</style>
    </div>

  );
}

export default function Menu() {
  const [items, setItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [placing, setPlacing] = useState(false);
  const [dark, setDark] = useState(false);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);

  /* ================= HERO SLIDER ================= */
  useEffect(() => {
    const id = setInterval(
      () => setHeroIndex((i) => (i + 1) % heroImages.length),
      4000
    );
    return () => clearInterval(id);
  }, []);

  /* ================= FETCH ITEMS ================= */
  useEffect(() => {
   fetch(`${API}/items`)

      .then((res) => res.json())
      .then(setItems)
      .catch(() => setItems([]));
  }, []);

  /* ================= CATEGORY ================= */
  const categories = useMemo(() => {
    const cats = Array.from(new Set(items.map((i) => i.category || "Others")));
    return ["All", ...cats];
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const catMatch =
        activeCategory === "All" ||
        (item.category || "Others") === activeCategory;
      const searchMatch =
        !search || item.name.toLowerCase().includes(search.toLowerCase());
      return catMatch && searchMatch;
    });
  }, [items, activeCategory, search]);

  /* ================= CART ================= */
  const addToCart = (item) => {
    setCart((prev) => {
      const idx = prev.findIndex((c) => c.item._id === item._id);
      if (idx === -1) return [...prev, { item, qty: 1 }];
      const copy = [...prev];
      copy[idx].qty += 1;
      return copy;
    });
  };

  const changeQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((c) => (c.item._id === id ? { ...c, qty: c.qty + delta } : c))
        .filter((c) => c.qty > 0)
    );
  };

  const cartTotal = cart.reduce(
    (sum, c) => sum + c.item.price * c.qty,
    0
  );

  /* ================= ORDER ================= */
  const placeOrder = () => {
    if (!cart.length) return alert("Cart is empty");
    setShowPaymentPopup(true);
  };

  const confirmOrder = async (method) => {
    setPlacing(true);

    const expandedCart = cart.flatMap((c) =>
      Array.from({ length: c.qty }).map(() => ({
        name: c.item.name,
        price: c.item.price,
      }))
    );

    await fetch(`${API}/order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cart: expandedCart,
        paymentMethod: method,
        paymentStatus: method === "QR" ? "Paid" : "Unpaid",
      }),
    });

    setCart([]);
    setPlacing(false);
    setShowPaymentPopup(false);

    alert(
      method === "Cash"
        ? "✅ Order placed! Collect your bill from counter."
        : "✅ Order placed successfully!"
    );
  };

  const theme = dark
    ? {
        bg: "bg-[#0b0b0b] text-slate-100",
        card: "bg-[#161616] border border-[#2a2a2a]",
        muted: "text-slate-400",
      }
    : {
        bg: "bg-[#fff7ed] text-slate-900",
        card: "bg-white",
        muted: "text-slate-500",
      };

  return (
    <div className={`min-h-screen ${theme.bg} relative`}>
       <FloatingNavbar />
      <FloatingDoodles />


      {/* ================= HERO ================= */}
      <header className="relative border-b overflow-hidden z-[10]">
        <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-14 items-center">
          <div>
            <p className="text-xs tracking-widest uppercase text-orange-500">
              ASHA CAFÉ
            </p>
            <h1 className="text-4xl md:text-6xl font-black mt-2">
              Fresh food.
              <br />
              <span className="text-orange-500">Zero waiting.</span>
            </h1>
            <p className={`mt-4 ${theme.muted}`}>
              One QR • Order on phone • Pay at counter
            </p>

            <button
              onClick={() => setDark(!dark)}
              className="mt-6 px-6 py-2 rounded-full bg-orange-500 text-black font-bold"
            >
              {dark ? "☀ Light Mode" : "🌙 Dark Mode"}
            </button>
          </div>

          <div className="h-[420px] rounded-[32px] overflow-hidden shadow-2xl">
            <img
              key={heroIndex}
              src={heroImages[heroIndex]}
              alt="Food"
              className="h-full w-full object-cover animate-fade"
            />
          </div>
        </div>
      </header>

      {/* ================= MENU ================= */}
      <main className="max-w-7xl mx-auto px-4 py-12 grid lg:grid-cols-[1fr_360px] gap-8 relative z-[10]">
        <section>
          <div className="flex gap-2 flex-wrap mb-5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold ${
                  activeCategory === cat
                    ? "bg-orange-500 text-black"
                    : "border"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search food…"
            className="w-full px-4 py-2 mb-6 rounded-xl border"
          />

          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item._id}
                className={`${theme.card} rounded-3xl p-4 hover:shadow-xl transition`}
              >
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-36 w-full object-cover rounded-2xl mb-3"
                  />
                )}

                <h3 className="font-bold">{item.name}</h3>
                <p className={`text-xs ${theme.muted}`}>
                  {item.category}
                </p>

                <div className="flex justify-between items-center mt-3">
                  <span className="font-black text-orange-500">
                    ₹{item.price}
                  </span>
                  <button
                    onClick={() => addToCart(item)}
                    className="h-10 w-10 rounded-full bg-orange-500 text-black font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CART */}
        <aside className={`${theme.card} rounded-3xl p-5 sticky top-6`}>
          <h2 className="font-black mb-4">Your Order</h2>

          {cart.map(({ item, qty }) => (
            <div key={item._id} className="flex justify-between mb-2">
              <span>{item.name}</span>
              <div className="flex gap-2">
                <button onClick={() => changeQty(item._id, -1)}>–</button>
                <span>{qty}</span>
                <button onClick={() => changeQty(item._id, +1)}>+</button>
              </div>
            </div>
          ))}

          <div className="border-t pt-3 flex justify-between font-black mt-4">
            <span>Total</span>
            <span className="text-orange-500">₹{cartTotal}</span>
          </div>

          <button
            onClick={placeOrder}
            disabled={!cart.length || placing}
            className="w-full mt-4 bg-orange-500 py-3 rounded-xl font-black"
          >
            Place Order
          </button>
        </aside>
      </main>

      {/* PAYMENT */}
      {showPaymentPopup && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-3xl w-80 text-center">
            <h2 className="text-xl font-black mb-4">Choose Payment</h2>
            <div className="flex gap-3">
              <button
                onClick={() => confirmOrder("QR")}
                className="flex-1 bg-orange-500 py-2 rounded-xl font-bold"
              >
                QR
              </button>
              <button
                onClick={() => confirmOrder("Cash")}
                className="flex-1 bg-green-600 py-2 rounded-xl text-white font-bold"
              >
                Cash
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fade {
          from { opacity: 0; transform: scale(1.05); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade { animation: fade 0.8s ease-out; }
      `}</style>
    </div>
  );
}
