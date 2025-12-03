import { useEffect, useState } from "react";

export default function Kitchen() {
  const [orders, setOrders] = useState([]);

  const loadOrders = async () => {
    const res = await fetch("http://localhost:5000/orders");
    const data = await res.json();
    setOrders(data);
  };

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 2000);
    return () => clearInterval(interval);
  }, []);

  const updateStatus = (index, status) => {
    fetch("http://localhost:5000/update-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ index, status }),
    });
  };

  const markPaid = (index) => {
    fetch("http://localhost:5000/update-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ index, paymentStatus: "Paid" }),
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-neutral-900 to-black text-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-orange-400">
          👨‍🍳 Bachelor&apos;s Hub — Kitchen
        </h1>
        <span className="text-xs px-3 py-1 rounded-full bg-orange-500 text-black font-semibold">
          LIVE
        </span>
      </div>

      {/* Orders Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {orders.map((order, index) => {
          const totalAmount = order.cart.reduce(
            (sum, item) => sum + item.price,
            0
          );

          const statusStyle =
            order.status === "Pending"
              ? "bg-yellow-500/20 text-yellow-300 border-yellow-500"
              : order.status === "Preparing"
              ? "bg-blue-500/20 text-blue-300 border-blue-500"
              : order.status === "Ready"
              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500"
              : order.status === "Served"
              ? "bg-gray-500/20 text-gray-300 border-gray-500"
              : "bg-red-500/20 text-red-300 border-red-500";

          return (
            <div
              key={index}
              className="bg-neutral-900/90 border border-neutral-700 rounded-3xl p-5 shadow-xl hover:border-orange-400 transition"
            >
              {/* Top */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-lg font-bold text-orange-300">
                    Table {order.table}
                  </h2>
                  <p className="text-xs text-neutral-400">
                    Bill #{order.billNo}
                  </p>
                </div>

                <span
                  className={`text-[11px] px-3 py-1 rounded-full border ${statusStyle}`}
                >
                  {order.status}
                </span>
              </div>

              {/* Items */}
              <div className="space-y-1 text-sm text-neutral-200 max-h-32 overflow-y-auto mb-3">
                {order.cart.map((item, i) => (
                  <div key={i} className="flex justify-between text-xs">
                    <span>• {item.name}</span>
                    <span>₹{item.price}</span>
                  </div>
                ))}
              </div>

              {/* Payment */}
              <div className="text-xs mb-3">
                <p>
                  Payment:{" "}
                  <span
                    className={
                      order.paymentStatus === "Paid"
                        ? "text-emerald-400 font-semibold"
                        : "text-yellow-300 font-semibold"
                    }
                  >
                    {order.paymentStatus}
                  </span>
                </p>
                <p className="mt-1 text-xs text-neutral-300">
                  Total:{" "}
                  <span className="font-bold text-orange-400">
                    ₹{totalAmount}
                  </span>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 text-[11px]">
                <button
                  onClick={() => updateStatus(index, "Preparing")}
                  className="flex-1 px-3 py-1 rounded-full bg-yellow-500/30 border border-yellow-400 text-yellow-200 hover:bg-yellow-500/40"
                >
                  Preparing
                </button>

                <button
                  onClick={() => updateStatus(index, "Ready")}
                  className="flex-1 px-3 py-1 rounded-full bg-blue-500/30 border border-blue-400 text-blue-200 hover:bg-blue-500/40"
                >
                  Ready
                </button>

                <button
                  onClick={() => updateStatus(index, "Served")}
                  className="flex-1 px-3 py-1 rounded-full bg-emerald-500/30 border border-emerald-400 text-emerald-200 hover:bg-emerald-500/40"
                >
                  Served
                </button>

                {order.paymentStatus === "Unpaid" && (
                  <button
                    onClick={() => markPaid(index)}
                    className="w-full px-3 py-1 rounded-full bg-orange-500 text-black font-semibold hover:bg-orange-400"
                  >
                    ✅ Mark Paid
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {orders.length === 0 && (
        <div className="text-center mt-20 text-neutral-400 text-sm">
          No live orders right now 🍽️
        </div>
      )}
    </div>
  );
}
