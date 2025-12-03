import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const PIE_COLORS = ["#fb923c", "#f97316", "#fed7aa", "#facc15", "#22c55e"];

export default function Admin() {
  const [orders, setOrders] = useState([]);
  const [reports, setReports] = useState({ daily: {}, monthly: {} });
  const [menuItems, setMenuItems] = useState([]);
  const [newItem, setNewItem] = useState({
    name: "",
    price: "",
    imageUrl: "",
    category: "",
  });
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [editCart, setEditCart] = useState([]);

  const load = async () => {
    const o = await fetch("http://localhost:5000/orders").then((r) => r.json());
    const r = await fetch("http://localhost:5000/reports").then((r) => r.json());
    const m = await fetch("http://localhost:5000/items").then((r) => r.json());
    setOrders(o);
    setReports(r);
    setMenuItems(m);
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 4000);
    return () => clearInterval(id);
  }, []);

  const dailyData = Object.entries(reports.daily).map(([date, total]) => ({
    date,
    total,
  }));
  const monthlyData = Object.entries(reports.monthly).map(([month, total]) => ({
    month,
    total,
  }));

  // Pie data for most ordered items
  const itemCounts = {};
  orders
    .filter((o) => o.paymentStatus === "Paid")
    .forEach((o) =>
      o.cart.forEach((i) => {
        itemCounts[i.name] = (itemCounts[i.name] || 0) + 1;
      })
    );
  const pieData = Object.entries(itemCounts).map(([name, value]) => ({
    name,
    value,
  }));

  const handleAddItem = async (e) => {
    e.preventDefault();
    await fetch("http://localhost:5000/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newItem),
    });
    setNewItem({ name: "", price: "", imageUrl: "", category: "" });
    load();
  };

  const handleDeleteItem = async (id) => {
    await fetch(`http://localhost:5000/items/${id}`, { method: "DELETE" });
    load();
  };

  const printBill = (o) => {
    const amount = o.cart.reduce((s, i) => s + i.price, 0);
    const win = window.open("", "_blank");
    win.document.write(`
      <html>
        <head>
          <title>Receipt #${o.billNo}</title>
          <style>
            body { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI"; background:#0b0b10; color:#111827; padding:30px; }
            .card { max-width:600px; margin:0 auto; background:#f9fafb; border-radius:18px; padding:24px; box-shadow:0 20px 50px rgba(15,23,42,0.35); }
            .amount { font-size:32px; font-weight:700; color:#ea580c; }
            .sub { color:#4b5563; font-size:13px; }
            .badge { font-size:11px; padding:3px 8px; border-radius:999px; background:#e5e7eb; display:inline-block; }
            table { width:100%; border-collapse:collapse; margin-top:14px; font-size:13px; }
            th,td { padding:8px 4px; border-bottom:1px solid #e5e7eb; text-align:left; }
            th { color:#6b7280; font-weight:500; }
            .total-row td { font-weight:600; }
            .muted { color:#6b7280; font-size:11px; margin-top:16px; }
          </style>
        </head>
        <body>
          <div class="card">
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
              <div>
                <div class="sub">Receipt from</div>
                <h2 style="font-size:20px; font-weight:700; margin:2px 0 10px;">Bachelor's Hub</h2>
                <div class="amount">₹${amount}</div>
                <div class="sub">Paid status: ${o.paymentStatus}</div>
              </div>
              <div style="text-align:right;font-size:11px;color:#6b7280;">
                <div>Bill #${o.billNo}</div>
                <div>Table ${o.table}</div>
                <div>${new Date(o.time).toLocaleString()}</div>
              </div>
            </div>

            <div style="margin-top:14px; display:flex; gap:8px; font-size:11px;">
              <span class="badge">Receipt</span>
              <span class="badge">Dine-in</span>
              <span class="badge">${o.status}</span>
            </div>

            <table>
              <thead>
                <tr><th>Item</th><th>Price</th></tr>
              </thead>
              <tbody>
                ${o.cart
                  .map(
                    (i) =>
                      `<tr><td>${i.name}</td><td>₹${i.price}</td></tr>`
                  )
                  .join("")}
                <tr class="total-row"><td>Total</td><td>₹${amount}</td></tr>
                <tr><td>Amount paid</td><td>₹${o.paymentStatus === "Paid" ? amount : 0}</td></tr>
              </tbody>
            </table>

            <div class="muted">
              Questions about this bill? Visit Bachelor's Hub counter or contact us.
            </div>
          </div>
        </body>
      </html>
    `);
    win.document.close();
    win.print();
  };

  const startEditOrder = (index) => {
    setSelectedIndex(index);
    setEditCart(orders[index].cart);
  };

  const updateOrderField = (field, value) => {
    if (selectedIndex === null) return;
    fetch("http://localhost:5000/admin-update-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        index: selectedIndex,
        updatedOrder: { [field]: value },
      }),
    }).then(load);
  };

  const addItemToEditCart = (itemId) => {
    const item = menuItems.find((m) => m.id === Number(itemId));
    if (!item) return;
    setEditCart((prev) => [...prev, item]);
  };

  const removeItemFromEditCart = (idx) => {
    setEditCart((prev) => prev.filter((_, i) => i !== idx));
  };

  const saveEditedCart = () => {
    if (selectedIndex === null) return;
    fetch("http://localhost:5000/admin-update-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        index: selectedIndex,
        updatedOrder: { cart: editCart },
      }),
    }).then(() => {
      setSelectedIndex(null);
      setEditCart([]);
      load();
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-neutral-950 to-black text-white p-4">
      <h1 className="text-3xl font-bold mb-4 text-orange-400">
        Bachelor&apos;s Hub • Admin
      </h1>

      {/* Top: charts */}
      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-neutral-900/90 border border-orange-500/40 rounded-2xl p-4 col-span-2">
          <h2 className="text-sm font-semibold mb-2">Daily Revenue (Paid)</h2>
          {dailyData.length === 0 ? (
            <p className="text-xs text-neutral-400">
              No paid orders yet today.
            </p>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#e5e7eb" }} />
                  <YAxis tick={{ fontSize: 10, fill: "#e5e7eb" }} />
                  <Tooltip />
                  <Bar dataKey="total" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="bg-neutral-900/90 border border-orange-500/40 rounded-2xl p-4">
          <h2 className="text-sm font-semibold mb-2">
            Most Ordered Items (Paid)
          </h2>
          {pieData.length === 0 ? (
            <p className="text-xs text-neutral-400">No data yet.</p>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={70}
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Menu Management */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="bg-neutral-900/90 border border-orange-500/40 rounded-2xl p-4">
          <h2 className="text-sm font-semibold mb-3">Menu Items</h2>
          <div className="space-y-2 max-h-56 overflow-y-auto text-xs">
            {menuItems.map((m) => (
              <div
                key={m.id}
                className="flex justify-between items-center bg-neutral-800/80 rounded-xl px-3 py-2"
              >
                <div>
                  <p className="font-semibold">{m.name}</p>
                  <p className="text-[11px] text-neutral-400">
                    ₹{m.price} • {m.category}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteItem(m.id)}
                  className="text-[11px] px-2 py-1 rounded-full bg-red-500/90 text-white hover:bg-red-400"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-neutral-900/90 border border-orange-500/40 rounded-2xl p-4">
          <h2 className="text-sm font-semibold mb-3">Add New Item</h2>
          <form onSubmit={handleAddItem} className="space-y-2 text-xs">
            <input
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2"
              placeholder="Item name"
              value={newItem.name}
              onChange={(e) =>
                setNewItem((n) => ({ ...n, name: e.target.value }))
              }
            />
            <input
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2"
              placeholder="Price"
              type="number"
              value={newItem.price}
              onChange={(e) =>
                setNewItem((n) => ({ ...n, price: e.target.value }))
              }
            />
            <input
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2"
              placeholder="Image URL (optional)"
              value={newItem.imageUrl}
              onChange={(e) =>
                setNewItem((n) => ({ ...n, imageUrl: e.target.value }))
              }
            />
            <input
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2"
              placeholder="Category (e.g. Pizza, Beverage)"
              value={newItem.category}
              onChange={(e) =>
                setNewItem((n) => ({ ...n, category: e.target.value }))
              }
            />
            <button
              type="submit"
              className="mt-1 bg-orange-500 text-black font-semibold px-3 py-2 rounded-lg hover:bg-orange-400"
            >
              Save Item
            </button>
          </form>
        </div>
      </div>

      {/* Orders list */}
      <h2 className="text-lg font-semibold mb-2">All Orders</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
        {orders.map((o, i) => {
          const amount = o.cart.reduce((s, item) => s + item.price, 0);
          const isSelected = selectedIndex === i;
          return (
            <div
              key={i}
              className={`bg-neutral-900/90 p-4 rounded-2xl border ${
                isSelected ? "border-orange-400" : "border-neutral-700"
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-semibold">
                  Table {o.table}
                  <span className="block text-[10px] text-neutral-400">
                    Bill #{o.billNo}
                  </span>
                </p>
                <button
                  onClick={() => printBill(o)}
                  className="text-[11px] px-2 py-1 rounded-full bg-neutral-800 border border-neutral-600 hover:border-orange-400"
                >
                  🧾 Print
                </button>
              </div>

              <p className="text-xs">
                Status:{" "}
                <span className="font-semibold text-orange-300">
                  {o.status}
                </span>
              </p>
              <p className="text-xs">
                Payment:{" "}
                <span
                  className={
                    o.paymentStatus === "Paid"
                      ? "text-emerald-400 font-semibold"
                      : "text-yellow-300 font-semibold"
                  }
                >
                  {o.paymentStatus}
                </span>
              </p>
              <p className="text-xs mb-2 text-neutral-300">Total: ₹{amount}</p>

              <div className="text-[11px] max-h-16 overflow-y-auto mb-2">
                {o.cart.map((c, j) => (
                  <p key={j}>• {c.name}</p>
                ))}
              </div>

              <div className="flex gap-2 text-[11px]">
                <button
                  onClick={() => startEditOrder(i)}
                  className="flex-1 px-2 py-1 rounded-full bg-orange-500 text-black font-semibold hover:bg-orange-400"
                >
                  Edit
                </button>
                <button
                  onClick={() => updateOrderField("status", "Cancelled")}
                  className="flex-1 px-2 py-1 rounded-full bg-red-500/90 text-white hover:bg-red-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom edit bar for selected order */}
      {selectedIndex !== null && orders[selectedIndex] && (
        <div className="fixed bottom-0 left-0 right-0 bg-neutral-900 border-t border-neutral-700 p-3 flex flex-wrap items-center gap-3 text-[11px]">
          <span className="text-neutral-300">
            Editing Bill #{orders[selectedIndex].billNo}
          </span>

          <select
            defaultValue={orders[selectedIndex].status}
            onChange={(e) => updateOrderField("status", e.target.value)}
            className="bg-neutral-800 border border-neutral-600 rounded px-2 py-1"
          >
            <option value="Pending">Pending</option>
            <option value="Preparing">Preparing</option>
            <option value="Ready">Ready</option>
            <option value="Served">Served</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <select
            defaultValue={orders[selectedIndex].paymentStatus}
            onChange={(e) =>
              updateOrderField("paymentStatus", e.target.value)
            }
            className="bg-neutral-800 border border-neutral-600 rounded px-2 py-1"
          >
            <option value="Unpaid">Unpaid</option>
            <option value="Paid">Paid</option>
          </select>

          {/* Edit items */}
          <div className="flex items-center gap-2 flex-wrap">
            <select
              onChange={(e) => {
                addItemToEditCart(e.target.value);
                e.target.value = "";
              }}
              defaultValue=""
              className="bg-neutral-800 border border-neutral-600 rounded px-2 py-1"
            >
              <option value="">Add item…</option>
              {menuItems.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} (₹{m.price})
                </option>
              ))}
            </select>

            <div className="flex gap-1 max-w-xs overflow-x-auto">
              {editCart.map((i, idx) => (
                <button
                  key={idx}
                  onClick={() => removeItemFromEditCart(idx)}
                  className="px-2 py-1 rounded-full bg-neutral-800 border border-neutral-600 text-[10px]"
                >
                  {i.name} ✕
                </button>
              ))}
            </div>

            <button
              onClick={saveEditedCart}
              className="px-3 py-1 rounded-full bg-emerald-500 text-black font-semibold hover:bg-emerald-400"
            >
              Save Items
            </button>

            <button
              onClick={() => {
                setSelectedIndex(null);
                setEditCart([]);
              }}
              className="px-2 py-1 rounded-full bg-neutral-800 border border-neutral-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
