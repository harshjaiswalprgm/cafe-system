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

const PIE_COLORS = ["#fb923c", "#22c55e", "#3b82f6", "#a855f7", "#eab308"];

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
  const [dark, setDark] = useState(false);

  // ---- LOAD DATA ----
  const load = async () => {
    const [ordersRes, reportsRes, itemsRes] = await Promise.all([
      fetch("http://localhost:5000/orders"),
      fetch("http://localhost:5000/reports"),
      fetch("http://localhost:5000/items"),
    ]);

    const o = await ordersRes.json();
    const r = await reportsRes.json();
    const m = await itemsRes.json();

    setOrders(o);
    setReports(r);
    setMenuItems(m);
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 4000);
    return () => clearInterval(id);
  }, []);

  // ---- DERIVED STATS ----
  const totalOrders = orders.length;
  const paidOrders = orders.filter((o) => o.paymentStatus === "Paid").length;
  const totalRevenue = orders
    .filter((o) => o.paymentStatus === "Paid")
    .reduce((sum, o) => sum + o.cart.reduce((s, i) => s + i.price, 0), 0);
  const pendingOrders = orders.filter(
    (o) => o.status !== "Served" && o.status !== "Cancelled"
  ).length;

  const dailyData = Object.entries(reports.daily).map(([date, total]) => ({
    date,
    total,
  }));

  // Pie chart: most ordered items
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

  // ---- MENU MANAGEMENT ----
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

  // ---- BILLING RECEIPT (KEEPING AS IS) ----
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
                  .map((i) => `<tr><td>${i.name}</td><td>₹${i.price}</td></tr>`)
                  .join("")}
                <tr class="total-row"><td>Total</td><td>₹${amount}</td></tr>
                <tr><td>Amount paid</td><td>₹${
                  o.paymentStatus === "Paid" ? amount : 0
                }</td></tr>
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

  // ---- ORDER EDITING ----
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

  // ---- THEME HELPERS ----
  const bgClass = dark
    ? "bg-slate-950 text-slate-50"
    : "bg-slate-100 text-slate-900";
  const cardClass = dark
    ? "bg-slate-900 border border-slate-700"
    : "bg-white border border-slate-200";
  const mutedText = dark ? "text-slate-400" : "text-slate-500";

  return (
    <div className={`min-h-screen ${bgClass} flex`}>
      {/* 🧭 SIDEBAR */}
      <aside
        className={`w-56 lg:w-64 py-6 px-4 flex flex-col gap-6 border-r ${
          dark ? "border-slate-800" : "border-slate-200 bg-white"
        }`}
      >
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-2xl bg-orange-500 flex items-center justify-center text-black font-extrabold">
            BH
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-orange-400">
              Admin
            </p>
            <p className="font-semibold text-sm">Bachelor&apos;s Hub</p>
          </div>
        </div>

        <nav className="space-y-1 text-sm">
          <p className={`${mutedText} text-[11px] uppercase tracking-wide`}>
            Menu
          </p>
          <button className="w-full text-left px-3 py-2 rounded-xl bg-orange-500/10 text-orange-400 font-semibold">
            Dashboard
          </button>
          <button className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-800/40">
            Orders
          </button>
          <button className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-800/40">
            Menu Items
          </button>
          <button className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-800/40">
            Reports
          </button>
        </nav>

        <div className="mt-auto">
          <button
            onClick={() => setDark((d) => !d)}
            className="w-full text-xs px-3 py-2 rounded-xl flex items-center justify-between border border-slate-600 bg-slate-900/60"
          >
            <span>Theme</span>
            <span>{dark ? "🌙 Dark" : "☀ Light"}</span>
          </button>
        </div>
      </aside>

      {/* 📊 MAIN CONTENT */}
      <main className="flex-1 p-4 lg:p-6">
        {/* Top line */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className={`text-xs ${mutedText}`}>Overview</p>
            <h1 className="text-2xl font-bold">Dashboard</h1>
          </div>
          <p className={`text-xs ${mutedText}`}>
            Total Orders:{" "}
            <span className="font-semibold text-orange-400">{totalOrders}</span>
          </p>
        </div>

        {/* STATS CARDS */}
        <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className={`${cardClass} rounded-2xl p-4`}>
            <p className={`text-xs ${mutedText}`}>Total Revenue</p>
            <p className="text-xl font-bold mt-1">₹{totalRevenue}</p>
          </div>
          <div className={`${cardClass} rounded-2xl p-4`}>
            <p className={`text-xs ${mutedText}`}>Total Orders</p>
            <p className="text-xl font-bold mt-1">{totalOrders}</p>
          </div>
          <div className={`${cardClass} rounded-2xl p-4`}>
            <p className={`text-xs ${mutedText}`}>Paid Orders</p>
            <p className="text-xl font-bold mt-1 text-emerald-400">
              {paidOrders}
            </p>
          </div>
          <div className={`${cardClass} rounded-2xl p-4`}>
            <p className={`text-xs ${mutedText}`}>Active / Pending</p>
            <p className="text-xl font-bold mt-1 text-yellow-300">
              {pendingOrders}
            </p>
          </div>
        </section>

        {/* CHARTS */}
        <section className="grid lg:grid-cols-2 gap-4 mb-6">
          <div className={`${cardClass} rounded-2xl p-4`}>
            <h2 className="text-sm font-semibold mb-2">Daily Revenue</h2>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="total" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={`${cardClass} rounded-2xl p-4`}>
            <h2 className="text-sm font-semibold mb-2">
              Most Ordered Items (Paid)
            </h2>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={80}
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* MENU + ADD ITEM */}
        <section className="grid md:grid-cols-2 gap-4 mb-6">
          <div className={`${cardClass} rounded-2xl p-4`}>
            <h2 className="text-sm font-semibold mb-2">Menu Items</h2>
            <div className="space-y-2 max-h-64 overflow-y-auto text-sm">
              {menuItems.map((m) => (
                <div
                  key={m.id}
                  className={`flex justify-between items-center px-3 py-2 rounded-xl ${
                    dark ? "bg-slate-800" : "bg-slate-50"
                  }`}
                >
                  <div>
                    <p className="font-semibold">{m.name}</p>
                    <p className={`text-[11px] ${mutedText}`}>
                      ₹{m.price} • {m.category}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteItem(m.id)}
                    className="text-xs px-3 py-1 rounded-full bg-red-500 text-white"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className={`${cardClass} rounded-2xl p-4`}>
            <h2 className="text-sm font-semibold mb-2">Add New Item</h2>
            <form onSubmit={handleAddItem} className="space-y-2 text-sm">
              <input
                className="w-full rounded-lg px-3 py-2 border border-slate-400 bg-transparent"
                placeholder="Item name"
                value={newItem.name}
                onChange={(e) =>
                  setNewItem((n) => ({ ...n, name: e.target.value }))
                }
              />
              <input
                className="w-full rounded-lg px-3 py-2 border border-slate-400 bg-transparent"
                placeholder="Price"
                type="number"
                value={newItem.price}
                onChange={(e) =>
                  setNewItem((n) => ({ ...n, price: e.target.value }))
                }
              />
              <input
                className="w-full rounded-lg px-3 py-2 border border-slate-400 bg-transparent"
                placeholder="Image URL (optional)"
                value={newItem.imageUrl}
                onChange={(e) =>
                  setNewItem((n) => ({ ...n, imageUrl: e.target.value }))
                }
              />
              <input
                className="w-full rounded-lg px-3 py-2 border border-slate-400 bg-transparent"
                placeholder="Category (e.g. Pizza, Drinks)"
                value={newItem.category}
                onChange={(e) =>
                  setNewItem((n) => ({ ...n, category: e.target.value }))
                }
              />
              <button
                type="submit"
                className="mt-1 bg-orange-500 text-black px-4 py-2 rounded-lg font-semibold"
              >
                Save Item
              </button>
            </form>
          </div>
        </section>

        {/* ORDERS */}
        <section className="mb-16">
          <h2 className="text-sm font-semibold mb-2">All Orders</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {orders.map((o, i) => {
              const amount = o.cart.reduce((s, item) => s + item.price, 0);
              const isSelected = selectedIndex === i;
              return (
                <div
                  key={i}
                  className={`${cardClass} rounded-2xl p-4 ${
                    isSelected ? "ring-2 ring-orange-400" : ""
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <p className="font-semibold text-sm">
                      Table {o.table}
                      <span className={`block text-[11px] ${mutedText}`}>
                        Bill #{o.billNo}
                      </span>
                    </p>
                    <button
                      onClick={() => printBill(o)}
                      className="text-[11px] px-2 py-1 rounded-full border border-slate-500"
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
                  <p className="text-xs mt-1">
                    Total:{" "}
                    <span className="font-semibold text-orange-400">
                      ₹{amount}
                    </span>
                  </p>

                  <div
                    className={`text-[11px] mt-2 max-h-16 overflow-y-auto ${mutedText}`}
                  >
                    {o.cart.map((c, j) => (
                      <p key={j}>• {c.name}</p>
                    ))}
                  </div>

                  <div className="flex gap-2 mt-3 text-[11px]">
                    <button
                      onClick={() => startEditOrder(i)}
                      className="flex-1 px-2 py-1 rounded-full bg-orange-500 text-black font-semibold"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => updateOrderField("status", "Cancelled")}
                      className="flex-1 px-2 py-1 rounded-full bg-red-500/80 text-white"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* BOTTOM EDIT BAR */}
        {selectedIndex !== null && orders[selectedIndex] && (
          <div
            className={`fixed bottom-0 left-0 right-0 ${
              dark ? "bg-slate-900" : "bg-white"
            } border-t border-slate-700 px-4 py-3 flex flex-wrap items-center gap-3 text-xs`}
          >
            <span className="font-semibold">
              Editing Bill #{orders[selectedIndex].billNo}
            </span>

            <select
              defaultValue={orders[selectedIndex].status}
              onChange={(e) => updateOrderField("status", e.target.value)}
              className="border border-slate-500 rounded px-2 py-1 bg-transparent"
            >
              <option>Pending</option>
              <option>Preparing</option>
              <option>Ready</option>
              <option>Served</option>
              <option>Cancelled</option>
            </select>

            <select
              defaultValue={orders[selectedIndex].paymentStatus}
              onChange={(e) =>
                updateOrderField("paymentStatus", e.target.value)
              }
              className="border border-slate-500 rounded px-2 py-1 bg-transparent"
            >
              <option>Unpaid</option>
              <option>Paid</option>
            </select>

            <select
              onChange={(e) => {
                addItemToEditCart(e.target.value);
                e.target.value = "";
              }}
              className="border border-slate-500 rounded px-2 py-1 bg-transparent"
              defaultValue=""
            >
              <option value="">Add Item…</option>
              {menuItems.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>

            <div className="flex gap-1 max-w-xs overflow-x-auto">
              {editCart.map((i, idx) => (
                <button
                  key={idx}
                  onClick={() => removeItemFromEditCart(idx)}
                  className="px-2 py-1 rounded-full bg-slate-700 text-xs"
                >
                  {i.name} ✕
                </button>
              ))}
            </div>

            <button
              onClick={saveEditedCart}
              className="px-3 py-1 rounded-full bg-emerald-500 text-black font-semibold"
            >
              Save Items
            </button>

            <button
              onClick={() => {
                setSelectedIndex(null);
                setEditCart([]);
              }}
              className="px-3 py-1 rounded-full bg-slate-600 text-slate-50"
            >
              Close
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
