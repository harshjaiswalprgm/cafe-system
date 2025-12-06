// import { useEffect, useMemo, useState } from "react";
// import { useParams } from "react-router-dom";

// export default function Menu() {
//   const { table } = useParams();
//   const [items, setItems] = useState([]);
//   const [activeCategory, setActiveCategory] = useState("All");
//   const [search, setSearch] = useState("");
//   const [cart, setCart] = useState([]);
//   const [placing, setPlacing] = useState(false);
//   const [dark, setDark] = useState(false);

//   // ✅ NEW: payment popup
//   const [showPaymentPopup, setShowPaymentPopup] = useState(false);

//   useEffect(() => {
//     fetch("http://localhost:5000/items")
//       .then((res) => res.json())
//       .then(setItems)
//       .catch(() => setItems([]));
//   }, []);

//   const categories = useMemo(() => {
//     const cats = Array.from(new Set(items.map((i) => i.category || "Others")));
//     return ["All", ...cats];
//   }, [items]);

//   const filteredItems = useMemo(() => {
//     return items.filter((item) => {
//       const catMatch =
//         activeCategory === "All" ||
//         (item.category || "Others") === activeCategory;
//       const searchMatch =
//         !search ||
//         item.name.toLowerCase().includes(search.toLowerCase());
//       return catMatch && searchMatch;
//     });
//   }, [items, activeCategory, search]);

//   const addToCart = (item) => {
//     setCart((prev) => {
//       const idx = prev.findIndex((c) => c.item.id === item.id);
//       if (idx === -1) return [...prev, { item, qty: 1 }];
//       const copy = [...prev];
//       copy[idx] = { ...copy[idx], qty: copy[idx].qty + 1 };
//       return copy;
//     });
//   };

//   const changeQty = (id, delta) => {
//     setCart((prev) =>
//       prev
//         .map((c) =>
//           c.item.id === id ? { ...c, qty: c.qty + delta } : c
//         )
//         .filter((c) => c.qty > 0)
//     );
//   };

//   const removeItem = (id) => {
//     setCart((prev) => prev.filter((c) => c.item.id !== id));
//   };

//   const cartTotal = cart.reduce(
//     (sum, c) => sum + c.item.price * c.qty,
//     0
//   );

//   // ✅ STEP 1: Only open popup (not placing order directly)
//   const placeOrder = () => {
//     if (!cart.length) return alert("Cart is empty!");
//     setShowPaymentPopup(true);
//   };

//   // ✅ STEP 2: Final confirm after user selects payment
//   const confirmOrder = async (method) => {
//     setPlacing(true);

//     const expandedCart = cart.flatMap((c) =>
//       Array.from({ length: c.qty }).map(() => ({
//         name: c.item.name,
//         price: c.item.price,
//       }))
//     );

//     await fetch("http://localhost:5000/order", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         table,
//         cart: expandedCart,
//         paymentMethod: method, // ✅ QR or Cash
//         paymentStatus: method === "QR" ? "Paid" : "Unpaid",
//       }),
//     });

//     alert(`✅ Order placed using ${method}`);
//     setCart([]);
//     setPlacing(false);
//     setShowPaymentPopup(false);
//   };

//   return (
//     <div
//       className={`min-h-screen transition ${
//         dark ? "bg-slate-900 text-white" : "bg-orange-100 text-slate-900"
//       }`}
//     >
//       {/* ✅ NAVBAR */}
//       <header
//         className={`border-b ${
//           dark
//             ? "bg-slate-950 border-slate-700"
//             : "bg-white/90 backdrop-blur"
//         }`}
//       >
//         <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
//           <div>
//             <p className={`${dark ? "text-slate-300" : "text-slate-500"} text-xs`}>
//               Bachelor&apos;s Hub
//             </p>
//             <h1 className="text-lg font-bold text-orange-500">
//               Table #{table}
//             </h1>
//           </div>

//           <div className="flex items-center gap-3">
//             <button
//               onClick={() => setDark(!dark)}
//               className={`px-3 py-1 text-xs rounded-full border font-semibold ${
//                 dark
//                   ? "bg-slate-800 border-slate-600 text-white"
//                   : "bg-slate-100 text-slate-800"
//               }`}
//             >
//               {dark ? "☀ Light" : "🌙 Dark"}
//             </button>

//             <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-700">
//               QR Active
//             </span>
//           </div>
//         </div>
//       </header>

//       <main className="max-w-7xl mx-auto p-4 flex gap-6">
//         {/* ✅ LEFT */}
//         <section className="flex-1">
//           <div className="flex gap-2 mb-4 flex-wrap">
//             {categories.map((cat) => (
//               <button
//                 key={cat}
//                 onClick={() => setActiveCategory(cat)}
//                 className={`px-4 py-1.5 rounded-full text-xs font-semibold border ${
//                   activeCategory === cat
//                     ? "bg-orange-500 text-white border-orange-500"
//                     : dark
//                     ? "bg-slate-800 text-white border-slate-600"
//                     : "bg-white text-slate-800 border-slate-300"
//                 }`}
//               >
//                 {cat}
//               </button>
//             ))}
//           </div>

//           <input
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             placeholder="Search drinks, snacks, pizza..."
//             className={`w-full px-4 py-2 mb-5 rounded-xl border ${
//               dark
//                 ? "bg-slate-800 border-slate-600 text-white placeholder-slate-400"
//                 : "bg-white text-black placeholder-slate-500"
//             }`}
//           />

//           <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
//             {filteredItems.map((item) => (
//               <div
//                 key={item.id}
//                 className={`rounded-2xl shadow p-3 flex flex-col ${
//                   dark ? "bg-slate-800 text-white" : "bg-white"
//                 }`}
//               >
//                 {item.imageUrl ? (
//                   <img
//                     src={item.imageUrl}
//                     alt={item.name}
//                     className="h-32 w-full object-cover rounded-xl"
//                   />
//                 ) : (
//                   <div
//                     className={`h-32 rounded-xl flex items-center justify-center text-xs ${
//                       dark ? "bg-slate-700 text-slate-300" : "bg-orange-50"
//                     }`}
//                   >
//                     No image
//                   </div>
//                 )}

//                 <h3 className="mt-2 font-semibold">{item.name}</h3>
//                 <p className="text-xs opacity-70">{item.category}</p>

//                 <div className="mt-auto flex justify-between items-center">
//                   <span className="text-orange-500 font-bold">
//                     ₹{item.price}
//                   </span>

//                   <button
//                     onClick={() => addToCart(item)}
//                     className="h-9 w-9 bg-orange-500 text-white rounded-full text-lg"
//                   >
//                     +
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </section>

//         {/* ✅ CART */}
//         <aside
//           className={`w-96 rounded-2xl shadow p-4 ${
//             dark ? "bg-slate-850 text-white border border-slate-700" : "bg-white"
//           }`}
//         >
//           <h2 className="font-bold mb-3">Current Order</h2>

//           <div className="space-y-2 max-h-[360px] overflow-y-auto">
//             {cart.map(({ item, qty }) => (
//               <div
//                 key={item.id}
//                 className={`flex justify-between items-center px-3 py-2 rounded-lg ${
//                   dark ? "bg-slate-700" : "bg-orange-50"
//                 }`}
//               >
//                 <div>
//                   <p className="text-sm font-semibold">{item.name}</p>
//                   <p className="text-xs opacity-70">
//                     ₹{item.price} × {qty}
//                   </p>
//                 </div>

//                 <div className="flex items-center gap-2">
//                   <button
//                     onClick={() => changeQty(item.id, -1)}
//                     className="h-7 w-7 bg-orange-200 rounded-full font-bold text-black"
//                   >
//                     –
//                   </button>

//                   <span className="font-bold">{qty}</span>

//                   <button
//                     onClick={() => changeQty(item.id, +1)}
//                     className="h-7 w-7 bg-orange-500 text-white rounded-full font-bold"
//                   >
//                     +
//                   </button>

//                   <button
//                     onClick={() => removeItem(item.id)}
//                     className="ml-1 text-red-400 text-sm"
//                   >
//                     ✕
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>

//           <div className="mt-4 border-t pt-3 text-sm">
//             <div className="flex justify-between font-bold text-orange-500">
//               <span>Total</span>
//               <span>₹{cartTotal}</span>
//             </div>
//           </div>

//           <button
//             onClick={placeOrder}
//             disabled={placing || !cart.length}
//             className="w-full mt-4 bg-orange-500 text-white py-2 rounded-xl font-bold"
//           >
//             Place Order
//           </button>

//           <button
//             onClick={() => setCart([])}
//             className="w-full mt-2 border py-2 rounded-xl text-xs"
//           >
//             Clear Cart
//           </button>
//         </aside>
//       </main>

//       {/* ✅ PAYMENT POPUP */}
//       {showPaymentPopup && (
//         <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
//           <div className="bg-white rounded-2xl p-6 w-80 text-center shadow-xl">
//             <h2 className="text-lg font-bold mb-2">Choose Payment Method</h2>
//             <p className="text-sm text-gray-500 mb-4">
//               How do you want to pay?
//             </p>

//             <div className="flex gap-3">
//               <button
//                 onClick={() => confirmOrder("QR")}
//                 className="flex-1 py-2 rounded-xl bg-orange-500 text-white font-bold"
//               >
//                 Pay via QR
//               </button>

//               <button
//                 onClick={() => confirmOrder("Cash")}
//                 className="flex-1 py-2 rounded-xl bg-green-600 text-white font-bold"
//               >
//                 Cash
//               </button>
//             </div>

//             <button
//               onClick={() => setShowPaymentPopup(false)}
//               className="mt-3 text-xs text-gray-500 underline"
//             >
//               Cancel
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

export default function Menu() {
  const { table } = useParams();
  const [items, setItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [placing, setPlacing] = useState(false);
  const [dark, setDark] = useState(false);

  // ✅ PAYMENT POPUP
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);

  useEffect(() => {
    fetch("http://localhost:5000/items")
      .then((res) => res.json())
      .then(setItems)
      .catch(() => setItems([]));
  }, []);

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
        !search ||
        item.name.toLowerCase().includes(search.toLowerCase());
      return catMatch && searchMatch;
    });
  }, [items, activeCategory, search]);

  const addToCart = (item) => {
    setCart((prev) => {
      const idx = prev.findIndex((c) => c.item.id === item.id);
      if (idx === -1) return [...prev, { item, qty: 1 }];
      const copy = [...prev];
      copy[idx] = { ...copy[idx], qty: copy[idx].qty + 1 };
      return copy;
    });
  };

  const changeQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((c) =>
          c.item.id === id ? { ...c, qty: c.qty + delta } : c
        )
        .filter((c) => c.qty > 0)
    );
  };

  const removeItem = (id) => {
    setCart((prev) => prev.filter((c) => c.item.id !== id));
  };

  const cartTotal = cart.reduce(
    (sum, c) => sum + c.item.price * c.qty,
    0
  );

  // ✅ ONLY OPEN PAYMENT POPUP
  const placeOrder = () => {
    if (!cart.length) return alert("Cart is empty!");
    setShowPaymentPopup(true);
  };

  // ✅ FINAL CONFIRM ORDER
  const confirmOrder = async (method) => {
    setPlacing(true);

    const expandedCart = cart.flatMap((c) =>
      Array.from({ length: c.qty }).map(() => ({
        name: c.item.name,
        price: c.item.price,
      }))
    );

    await fetch("http://localhost:5000/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        table,
        cart: expandedCart,
        paymentMethod: method,
        paymentStatus: method === "QR" ? "Paid" : "Unpaid",
      }),
    });

    alert(`✅ Order placed using ${method}`);
    setCart([]);
    setPlacing(false);
    setShowPaymentPopup(false);
  };

  return (
    <div
      className={`min-h-screen transition ${
        dark ? "bg-slate-950 text-white" : "bg-orange-100 text-slate-900"
      }`}
    >
      {/* ✅ NAVBAR */}
      <header
        className={`border-b sticky top-0 z-40 ${
          dark
            ? "bg-slate-950 border-slate-700"
            : "bg-white/90 backdrop-blur"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div>
            <p className="text-xs opacity-70">Bachelor&apos;s Hub</p>
            <h1 className="text-lg font-bold text-orange-500">
              Table #{table}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setDark(!dark)}
              className="px-3 py-1 text-xs rounded-full border font-semibold"
            >
              {dark ? "☀ Light" : "🌙 Dark"}
            </button>

            <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-700">
              QR Active
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 flex gap-6">
        {/* ✅ LEFT */}
        <section className="flex-1">
          <div className="flex gap-2 mb-4 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition ${
                  activeCategory === cat
                    ? "bg-orange-500 text-white border-orange-500 scale-105"
                    : dark
                    ? "bg-slate-800 text-white border-slate-600"
                    : "bg-white text-slate-800 border-slate-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search drinks, snacks, pizza..."
            className="w-full px-4 py-2 mb-5 rounded-xl border focus:ring-2 focus:ring-orange-400 outline-none"
          />

          {/* ✅ ITEMS */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className={`rounded-2xl shadow p-3 flex flex-col transition hover:-translate-y-1 hover:shadow-xl ${
                  dark ? "bg-slate-800 text-white" : "bg-white"
                }`}
              >
                <div className="h-32 rounded-xl flex items-center justify-center bg-orange-50">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-full w-full object-cover rounded-xl"
                    />
                  ) : (
                    "No image"
                  )}
                </div>

                <h3 className="mt-2 font-semibold">{item.name}</h3>
                <p className="text-xs opacity-70">{item.category}</p>

                <div className="mt-auto flex justify-between items-center">
                  <span className="text-orange-500 font-bold">
                    ₹{item.price}
                  </span>

                  <button
                    onClick={() => addToCart(item)}
                    className="h-9 w-9 bg-orange-500 hover:bg-orange-600 text-white rounded-full text-lg"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ✅ CART */}
        <aside className="w-96 rounded-2xl shadow p-4 bg-white">
          <h2 className="font-bold mb-3">Current Order</h2>

          {cart.length === 0 && (
            <div className="text-center text-sm opacity-60 py-10">
              Your cart is empty ☕
            </div>
          )}

          <div className="space-y-2 max-h-[360px] overflow-y-auto">
            {cart.map(({ item, qty }) => (
              <div
                key={item.id}
                className="flex justify-between items-center px-3 py-2 rounded-lg bg-orange-50"
              >
                <div>
                  <p className="text-sm font-semibold">{item.name}</p>
                  <p className="text-xs opacity-70">
                    ₹{item.price} × {qty}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => changeQty(item.id, -1)}
                    className="h-7 w-7 bg-orange-200 rounded-full font-bold"
                  >
                    –
                  </button>

                  <span className="font-bold">{qty}</span>

                  <button
                    onClick={() => changeQty(item.id, +1)}
                    className="h-7 w-7 bg-orange-500 text-white rounded-full font-bold"
                  >
                    +
                  </button>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="ml-1 text-red-400 text-sm"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 border-t pt-3 text-sm">
            <div className="flex justify-between font-bold text-orange-500">
              <span>Total</span>
              <span>₹{cartTotal}</span>
            </div>
          </div>

          <button
            onClick={placeOrder}
            disabled={placing || !cart.length}
            className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-xl font-bold"
          >
            Place Order
          </button>

          <button
            onClick={() => setCart([])}
            className="w-full mt-2 border py-2 rounded-xl text-xs"
          >
            Clear Cart
          </button>
        </aside>
      </main>

      {/* ✅ PAYMENT POPUP */}
      {showPaymentPopup && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-80 text-center shadow-xl animate-scaleIn">
            <h2 className="text-lg font-bold mb-2">Choose Payment Method</h2>
            <p className="text-sm text-gray-500 mb-4">
              How do you want to pay?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => confirmOrder("QR")}
                className="flex-1 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold"
              >
                Pay via QR
              </button>

              <button
                onClick={() => confirmOrder("Cash")}
                className="flex-1 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold"
              >
                Cash
              </button>
            </div>

            <button
              onClick={() => setShowPaymentPopup(false)}
              className="mt-3 text-xs text-gray-500 underline"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
