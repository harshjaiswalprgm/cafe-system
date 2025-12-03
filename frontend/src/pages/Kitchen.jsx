import { useEffect, useRef, useState } from "react";

export default function Kitchen() {
  const [orders, setOrders] = useState([]);
  const [dark, setDark] = useState(true);
  const [highlightIds, setHighlightIds] = useState([]);
  const audioRef = useRef(null);
  const prevIdsRef = useRef([]);

  const loadOrders = async () => {
    const res = await fetch("http://localhost:5000/orders");
    let data = await res.json();

    // ✅ AUTO REMOVE SERVED AFTER 5 MINUTES
    const now = Date.now();
    data = data.filter((order) => {
      if (order.status === "Served" && order.servedAt) {
        return now - new Date(order.servedAt).getTime() < 5 * 60 * 1000;
      }
      return true;
    });

    const newIds = data.map((o) => o.billNo);
    const prevIds = prevIdsRef.current;
    const justAdded = newIds.filter((id) => !prevIds.includes(id));

    if (justAdded.length > 0) {
      audioRef.current?.play().catch(() => {});
      setHighlightIds((prev) => [...prev, ...justAdded]);

      setTimeout(() => {
        setHighlightIds((prev) => prev.filter((id) => !justAdded.includes(id)));
      }, 2000);
    }

    prevIdsRef.current = newIds;
    setOrders(data);
  };

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 2000);
    return () => clearInterval(interval);
  }, []);

  // ✅ FULLSCREEN AUTO
  useEffect(() => {
    if (orders.length > 0 && !document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    }
  }, [orders.length]);

  const updateStatus = (index, status) => {
    fetch("http://localhost:5000/update-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        index,
        status,
        servedAt: status === "Served" ? new Date() : null,
      }),
    });
  };

  const markPaid = (index) => {
    fetch("http://localhost:5000/update-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ index, paymentStatus: "Paid" }),
    });
  };

  // ✅ THEME SYSTEM
  const bgClass = dark
    ? "bg-[#0c0c0c] text-white"
    : "bg-slate-100 text-black";

  const cardBase = dark
    ? "bg-[#151515] border border-[#2a2a2a] text-white"
    : "bg-white border border-slate-300 text-black";

  return (
    <div className={`min-h-screen ${bgClass} p-4 lg:p-6`}>
      <audio ref={audioRef} src="/new-order.mp3" preload="auto" />

      {/* ✅ TOP BAR */}
      <div className="max-w-7xl mx-auto flex items-center justify-between mb-5">
        <div>
          <p className="text-xs tracking-widest uppercase text-orange-500">
            Bachelor&apos;s Hub
          </p>
          <h1 className="text-2xl lg:text-3xl font-extrabold flex items-center gap-3 text-black dark:text-white">
            👨‍🍳 Kitchen
            <span className="text-[11px] px-3 py-1 rounded-full bg-orange-500 text-black font-bold">
              LIVE
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setDark((d) => !d)}
            className="px-4 py-1.5 rounded-full text-xs font-bold bg-orange-500 text-black"
          >
            {dark ? "☀ Light" : "🌙 Dark"}
          </button>

          <span className="text-xs font-bold text-black dark:text-orange-400">
            Orders: {orders.length}
          </span>
        </div>
      </div>

      {/* ✅ ORDERS GRID */}
      <div className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {orders.map((order, index) => {
          const amount = order.cart.reduce(
            (sum, item) => sum + item.price,
            0
          );
          const isNew = highlightIds.includes(order.billNo);

          let statusClasses =
            "bg-slate-400/30 text-black border border-slate-400";

          if (order.status === "Pending") {
            statusClasses =
              "bg-yellow-300 text-black border border-yellow-500";
          } else if (order.status === "Preparing") {
            statusClasses =
              "bg-blue-400 text-black border border-blue-600 status-preparing";
          } else if (order.status === "Ready") {
            statusClasses =
              "bg-green-400 text-black border border-green-600";
          } else if (order.status === "Served") {
            statusClasses =
              "bg-slate-300 text-black border border-slate-500";
          } else if (order.status === "Cancelled") {
            statusClasses =
              "bg-red-400 text-black border border-red-600";
          }

          const paid =
            order.paymentStatus &&
            order.paymentStatus.toLowerCase() === "paid";

          return (
            <div
              key={order.billNo ?? index}
              className={`${cardBase} rounded-3xl p-4 shadow-xl flex flex-col justify-between gap-3 ${
                isNew ? "card-new" : ""
              }`}
            >
              {/* HEADER */}
              <div className="flex justify-between items-start gap-2">
                <div>
                  <p className="text-xs opacity-70">Table</p>
                  <p className="text-2xl font-black text-orange-500">
                    #{order.table}
                  </p>
                  <p className="text-[11px] opacity-60">
                    Bill #{order.billNo}
                  </p>
                </div>

                <span
                  className={`text-[11px] px-3 py-1 rounded-full font-bold ${statusClasses}`}
                >
                  {order.status}
                </span>
              </div>

              {/* ITEMS */}
              <div className="text-sm max-h-32 overflow-y-auto space-y-1 pr-1">
                {order.cart.map((item, i) => (
                  <div className="flex justify-between" key={i}>
                    <span>• {item.name}</span>
                    <span className="opacity-70">₹{item.price}</span>
                  </div>
                ))}
              </div>

              {/* FOOTER */}
              <div className="space-y-1 text-xs">
                <div className="flex justify-between font-bold">
                  <span>Amount</span>
                  <span className="text-orange-500">₹{amount}</span>
                </div>

                <div className="flex justify-between font-bold">
                  <span>Payment</span>
                  <span
                    className={paid ? "text-green-600" : "text-yellow-600"}
                  >
                    {order.paymentStatus}
                  </span>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex flex-wrap gap-2 text-xs">
                <button
                  onClick={() => updateStatus(index, "Preparing")}
                  className="flex-1 px-3 py-1 rounded-full bg-yellow-400 text-black font-bold"
                >
                  Preparing
                </button>

                <button
                  onClick={() => updateStatus(index, "Ready")}
                  className="flex-1 px-3 py-1 rounded-full bg-blue-400 text-black font-bold"
                >
                  Ready
                </button>

                <button
                  onClick={() => updateStatus(index, "Served")}
                  className="flex-1 px-3 py-1 rounded-full bg-green-400 text-black font-bold"
                >
                  Served
                </button>

                {!paid && (
                  <button
                    onClick={() => markPaid(index)}
                    className="w-full px-3 py-1 rounded-full bg-orange-500 text-black font-bold"
                  >
                    ✅ Mark Paid
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {orders.length === 0 && (
        <p className="mt-20 text-center text-sm opacity-70">
          No live orders right now 🍽️
        </p>
      )}

      {/* ✅ ANIMATIONS */}
      <style>
        {`
          .card-new {
            animation: pop 0.6s ease-out;
          }
          @keyframes pop {
            0% { transform: scale(0.9); box-shadow: 0 0 0 rgba(255,115,22,0); }
            50% { transform: scale(1.05); box-shadow: 0 20px 50px rgba(255,115,22,0.6); }
            100% { transform: scale(1); box-shadow: 0 10px 30px rgba(0,0,0,0.6); }
          }

          .status-preparing {
            animation: pulse 1.2s infinite;
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.6; }
          }
        `}
      </style>
    </div>
  );
}
