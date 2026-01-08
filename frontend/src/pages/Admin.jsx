import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
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
  const [chartType, setChartType] = useState("bar"); // bar | line | area
  const [range] = useState("daily"); // daily | monthly
  const [showAvatar, setShowAvatar] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const [menuItems, setMenuItems] = useState([]);
  const [newItem, setNewItem] = useState({
    name: "",
    price: "",
    imageUrl: "",
    category: "",
  });

  const [editCart, setEditCart] = useState([]);
  const [dark, setDark] = useState(false);

  // ---- LOAD DATA ----
  const load = async () => {
    try {
      const token = localStorage.getItem("token");

      const [ordersRes, reportsRes, itemsRes] = await Promise.all([
        fetch("http://localhost:5000/orders", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch("http://localhost:5000/reports", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch("http://localhost:5000/items"), // public, no token needed
      ]);

      // ✅ Proper error handling
      if (!ordersRes.ok) throw new Error("Orders API failed");
      if (!reportsRes.ok) throw new Error("Reports API failed");
      if (!itemsRes.ok) throw new Error("Items API failed");

      const o = await ordersRes.json();
      const r = await reportsRes.json();
      const m = await itemsRes.json();

      // ✅ SAFETY: always force correct types
      setOrders(Array.isArray(o) ? o : []);
      setReports(r || { daily: {}, monthly: {} });
      setMenuItems(Array.isArray(m) ? m : []);
    } catch (err) {
      console.error("Admin Load Error:", err.message);
    }
  };

  useEffect(() => {
    load(); // ✅ no VS Code error now

    const id = setInterval(() => {
      load();
    }, 4000);

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
  const monthlyData = Object.entries(reports.monthly || {}).map(
    ([month, total]) => ({
      month,
      total,
    })
  );

  const activeChartData = range === "daily" ? dailyData : monthlyData;

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
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(newItem),
    });

    setNewItem({ name: "", price: "", imageUrl: "", category: "" });
    load();
  };
  const handleDeleteItem = async (id) => {
    await fetch(`http://localhost:5000/items/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
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

  // ---- ORDER EDITING deleted because of no use  ----

  const updateOrderField = (field, value, orderId = selectedOrderId) => {
    if (!orderId) return;

    fetch("http://localhost:5000/admin-update-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        orderId,
        updatedOrder: { [field]: value },
      }),
    }).then(load);
  };

  const addItemToEditCart = (itemId) => {
    const item = menuItems.find((m) => m._id === itemId);
    if (!item) return;
    setEditCart((prev) => [...prev, item]);
  };

  const removeItemFromEditCart = (idx) => {
    setEditCart((prev) => prev.filter((_, i) => i !== idx));
  };

  const saveEditedCart = () => {
    if (!selectedOrderId) return;

    fetch("http://localhost:5000/admin-update-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        orderId: selectedOrderId,
        updatedOrder: { cart: editCart },
      }),
    }).then(() => {
      setSelectedOrderId(null);
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
          {/* ✅ Profile Image Button */}
          <button
            onClick={() => setShowAvatar(true)}
            className="h-9 w-9 rounded-2xl bg-orange-500 overflow-hidden border-2 border-orange-400 shadow-md"
          >
            <img
              src="/Screenshot 2025-12-06 160752.png"
              alt="Harsh"
              className="h-full w-full object-cover"
            />
          </button>

          <div>
            <p className="text-xs uppercase tracking-wide text-orange-400">
              Admin
            </p>
            <p className="font-semibold text-sm">Bachelor&apos;s Hub</p>
          </div>
        </div>

        <nav className="space-y-1 text-sm">
          <p className="text-[11px] uppercase tracking-wide text-gray-400">
            Menu
          </p>

          <Link
            to="/admin"
            className="block px-3 py-2 rounded-xl bg-orange-500/10 text-orange-400 font-semibold"
          >
            Dashboard
          </Link>

          <Link
            to="/admin"
            className="block px-3 py-2 rounded-xl hover:bg-slate-800/40"
          >
            Orders
          </Link>

          <Link
            to="/admin"
            className="block px-3 py-2 rounded-xl hover:bg-slate-800/40"
          >
            Menu Items
          </Link>

          {/* ✅ NEW STOCK BUTTON */}
          <Link
            to="/admin/stock"
            className="block px-3 py-2 rounded-xl hover:bg-slate-800/40"
          >
            📦 Stock Control
          </Link>

          {/* ✅ FUTURE REPORTS */}
          <Link
            to="/admin/reports"
            className="block px-3 py-2 rounded-xl hover:bg-slate-800/40"
          >
            📊 Reports
          </Link>
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
  {/* ================= REVENUE CHART ================= */}
  <div className={`${cardClass} rounded-2xl p-5 relative`}>
    {/* HEADER */}
    <div className="flex items-center justify-between mb-4">
      <div>
        <p className="text-[11px] uppercase tracking-wide text-slate-400">
          Revenue Analytics
        </p>
        <h2 className="text-sm font-semibold">
          {range === "daily" ? "Daily Revenue" : "Monthly Revenue"}
        </h2>
      </div>

      {/* CHART TYPE */}
      <select
        value={chartType}
        onChange={(e) => setChartType(e.target.value)}
        className="px-3 py-1.5 text-xs rounded-lg bg-transparent border border-slate-400/40 focus:outline-none focus:ring-1 focus:ring-green-400"
      >
        <option value="bar">Bar</option>
        <option value="line">Line</option>
        <option value="area">Area</option>
      </select>
    </div>

    {/* CHART */}
    <div className="h-[260px] w-full">
      {activeChartData.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "bar" && (
            <BarChart data={activeChartData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey={range === "daily" ? "date" : "month"} />
              <YAxis />
              <Tooltip />
              <Bar
                dataKey="total"
                fill="#f97316"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          )}

          {chartType === "line" && (
            <LineChart data={activeChartData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey={range === "daily" ? "date" : "month"} />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#f97316"
                strokeWidth={3}
              />
            </LineChart>
          )}

          {chartType === "area" && (
            <AreaChart data={activeChartData}>
              <defs>
                <linearGradient
                  id="colorRevenue"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey={range === "daily" ? "date" : "month"} />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="total"
                stroke="#f97316"
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      ) : (
        <div className="h-full flex items-center justify-center text-xs text-slate-400">
          No revenue data available
        </div>
      )}
    </div>
  </div>

  {/* ================= MOST ORDERED ITEMS ================= */}
  <div className={`${cardClass} rounded-2xl p-5`}>
    {/* HEADER */}
    <div className="mb-4">
      <p className="text-[11px] uppercase tracking-wide text-slate-400">
        Insights
      </p>
      <h2 className="text-sm font-semibold">
        Most Ordered Items (Paid)
      </h2>
    </div>

    {/* PIE */}
    <div className="h-[260px] w-full">
      {pieData.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              outerRadius={90}
              innerRadius={50}
            >
              {pieData.map((_, i) => (
                <Cell
                  key={i}
                  fill={PIE_COLORS[i % PIE_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-full flex items-center justify-center text-xs text-slate-400">
          No item data available
        </div>
      )}
    </div>

    {/* LEGEND */}
    <div className="flex flex-wrap gap-3 mt-4 text-xs">
      {pieData.map((p, i) => (
        <div key={p.name} className="flex items-center gap-2">
          <span
            className="h-3 w-3 rounded-full"
            style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
          />
          <span className="truncate max-w-[120px]">
            {p.name}
          </span>
        </div>
      ))}
    </div>
  </div>
</section>


        {/* MENU + ADD ITEM */}
        <section className="grid md:grid-cols-2 gap-4 mb-6">
          {/* ================= MENU ITEMS LIST ================= */}
          <div className={`${cardClass} rounded-2xl p-5`}>
  {/* HEADER */}
  <div className="flex items-center justify-between mb-3">
    <div>
      <p className="text-[11px] uppercase tracking-wide text-slate-400">
        Inventory
      </p>
      <h2 className="text-sm font-semibold">
        Menu Items
      </h2>
    </div>

    <span className={`text-xs ${mutedText}`}>
      {menuItems.length} items
    </span>
  </div>

  {/* LIST */}
  <div className="space-y-2 max-h-64 overflow-y-auto text-sm pr-1">
    {menuItems.map((m) => (
      <div
        key={m._id}
        className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl transition ${
          dark
            ? "bg-slate-800 hover:bg-slate-700"
            : "bg-slate-50 hover:bg-slate-100"
        }`}
      >
        {/* ITEM INFO */}
        <div className="min-w-0">
          <p className="font-semibold truncate">
            {m.name}
          </p>
          <p className={`text-[11px] ${mutedText}`}>
            ₹{m.price} • {m.category}
          </p>
        </div>

        {/* ACTION */}
        <button
          onClick={() => handleDeleteItem(m._id)}
          className="shrink-0 text-[11px] px-3 py-1.5 rounded-full border border-red-500/40 text-red-400 hover:bg-red-500 hover:text-white transition"
          title="Delete item"
        >
          Delete
        </button>
      </div>
    ))}

    {/* EMPTY STATE */}
    {menuItems.length === 0 && (
      <div className="py-10 text-center text-xs text-slate-400">
        No menu items added yet
      </div>
    )}
  </div>
</div>


          {/* ================= ADD NEW ITEM ================= */}
         <div className={`${cardClass} rounded-2xl p-5`}>
  {/* HEADER */}
  <div className="mb-4">
    <p className="text-[11px] uppercase tracking-wide text-slate-400">
      Menu Management
    </p>
    <h2 className="text-sm font-semibold">
      Add New Item
    </h2>
  </div>

  <form onSubmit={handleAddItem} className="space-y-3 text-sm">
    {/* ITEM NAME */}
    <div className="flex flex-col gap-1">
      <label className="text-[11px] text-slate-400">
        Item Name
      </label>
      <input
        className="w-full rounded-lg px-3 py-2 border border-slate-400/40 bg-transparent focus:outline-none focus:ring-1 focus:ring-orange-400"
        placeholder="e.g. Margherita Pizza"
        value={newItem.name}
        onChange={(e) =>
          setNewItem((n) => ({ ...n, name: e.target.value }))
        }
        required
      />
    </div>

    {/* PRICE */}
    <div className="flex flex-col gap-1">
      <label className="text-[11px] text-slate-400">
        Price (₹)
      </label>
      <input
        type="number"
        className="w-full rounded-lg px-3 py-2 border border-slate-400/40 bg-transparent focus:outline-none focus:ring-1 focus:ring-orange-400"
        placeholder="e.g. 199"
        value={newItem.price}
        onChange={(e) =>
          setNewItem((n) => ({ ...n, price: e.target.value }))
        }
        required
      />
    </div>

    {/* CATEGORY */}
    <div className="flex flex-col gap-1">
      <label className="text-[11px] text-slate-400">
        Category
      </label>
      <input
        className="w-full rounded-lg px-3 py-2 border border-slate-400/40 bg-transparent focus:outline-none focus:ring-1 focus:ring-orange-400"
        placeholder="e.g. Pizza, Drinks, Desserts"
        value={newItem.category}
        onChange={(e) =>
          setNewItem((n) => ({ ...n, category: e.target.value }))
        }
        required
      />
    </div>

    {/* IMAGE URL */}
    <div className="flex flex-col gap-1">
      <label className="text-[11px] text-slate-400">
        Image URL <span className="opacity-60">(optional)</span>
      </label>
      <input
        className="w-full rounded-lg px-3 py-2 border border-slate-400/40 bg-transparent focus:outline-none focus:ring-1 focus:ring-orange-400"
        placeholder="https://example.com/image.jpg"
        value={newItem.imageUrl}
        onChange={(e) =>
          setNewItem((n) => ({ ...n, imageUrl: e.target.value }))
        }
      />
    </div>

    {/* ACTION */}
    <div className="pt-2">
      <button
        type="submit"
        className="w-full bg-orange-500 text-black px-4 py-2.5 rounded-xl font-semibold hover:bg-orange-400 transition"
      >
        Save Item
      </button>
    </div>
  </form>
</div>

        </section>

        {/* ORDERS */}
       <section className="mb-16">
  {/* SECTION HEADER */}
  <div className="flex items-center justify-between mb-3">
    <h2 className="text-sm font-semibold tracking-wide">
      All Orders
    </h2>
    <span className={`text-xs ${mutedText}`}>
      Total: {orders.length}
    </span>
  </div>

  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
    {orders.map((o) => {
      const amount = o.cart.reduce((s, item) => s + item.price, 0);
      const isSelected = selectedOrderId === o._id;

      return (
        <div
          key={o._id}
          className={`${cardClass} rounded-2xl p-4 transition ${
            isSelected
              ? "ring-2 ring-orange-400 shadow-lg"
              : "hover:shadow-md"
          }`}
        >
          {/* HEADER */}
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-xs uppercase tracking-wide opacity-60">
                Order
              </p>
              <p className="font-bold text-base text-orange-400">
                Table {o.table}
              </p>
              <p className={`text-[11px] ${mutedText}`}>
                Bill #{o.billNo}
              </p>
            </div>

            <button
              onClick={() => printBill(o)}
              className="text-[11px] px-3 py-1 rounded-full border border-slate-500/40 hover:bg-orange-500 hover:text-black transition"
            >
              🧾 Print
            </button>
          </div>

          {/* STATUS & PAYMENT */}
          <div className="flex justify-between items-center text-xs mb-2">
            <div>
              <span className="opacity-60">Status:</span>{" "}
              <span className="font-semibold text-orange-300">
                {o.status}
              </span>
            </div>

            <div>
              <span className="opacity-60">Payment:</span>{" "}
              <span
                className={
                  o.paymentStatus === "Paid"
                    ? "text-emerald-400 font-semibold"
                    : "text-yellow-400 font-semibold"
                }
              >
                {o.paymentStatus}
              </span>
            </div>
          </div>

          {/* TOTAL */}
          <div className="flex justify-between items-center mb-2 text-sm">
            <span className="opacity-60">Total Amount</span>
            <span className="font-bold text-orange-400">
              ₹{amount}
            </span>
          </div>

          {/* ITEMS */}
          <div
            className={`text-[11px] mt-2 max-h-16 overflow-y-auto space-y-0.5 ${mutedText}`}
          >
            {o.cart.map((c, j) => (
              <p key={j}>• {c.name}</p>
            ))}
          </div>

          {/* ACTIONS */}
          <div className="flex gap-2 mt-4 text-[11px]">
            <button
              onClick={() => {
                setSelectedOrderId(o._id);
                setEditCart(o.cart || []);
              }}
              className="flex-1 px-3 py-1.5 rounded-full bg-orange-500 text-black font-semibold hover:bg-orange-400 transition"
            >
              Edit
            </button>

            <button
              onClick={() =>
                updateOrderField("status", "Cancelled", o._id)
              }
              className="flex-1 px-3 py-1.5 rounded-full bg-red-500/80 text-white font-semibold hover:bg-red-500 transition"
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
        {selectedOrderId && (
  <div
    className={`fixed bottom-0 left-0 right-0 z-50 border-t ${
      dark
        ? "bg-slate-900 border-slate-700 text-slate-100"
        : "bg-white border-slate-200 text-slate-900"
    }`}
  >
    {(() => {
      const order = orders.find((o) => o._id === selectedOrderId);
      if (!order) return null;

      return (
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-3">
          {/* HEADER */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-slate-400">
                Edit Order
              </p>
              <p className="text-sm font-semibold">
                Bill #{order.billNo}
              </p>
            </div>

            <button
              onClick={() => {
                setSelectedOrderId(null);
                setEditCart([]);
              }}
              className="h-8 w-8 rounded-lg border border-slate-400/40 flex items-center justify-center text-sm hover:bg-red-500 hover:text-white transition"
              title="Close"
            >
              ✕
            </button>
          </div>

          {/* CONTROLS GRID */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            {/* STATUS */}
            <div className="flex flex-col gap-1">
              <span className="text-slate-400">Status</span>
              <select
                value={order.status}
                onChange={(e) =>
                  updateOrderField("status", e.target.value, order._id)
                }
                className="rounded-lg px-2 py-1.5 border border-slate-400/40 bg-transparent focus:outline-none focus:ring-1 focus:ring-orange-400"
              >
                <option>Pending</option>
                <option>Preparing</option>
                <option>Ready</option>
                <option>Served</option>
                <option>Cancelled</option>
              </select>
            </div>

            {/* PAYMENT */}
            <div className="flex flex-col gap-1">
              <span className="text-slate-400">Payment</span>
              <select
                value={order.paymentStatus}
                onChange={(e) =>
                  updateOrderField(
                    "paymentStatus",
                    e.target.value,
                    order._id
                  )
                }
                className="rounded-lg px-2 py-1.5 border border-slate-400/40 bg-transparent focus:outline-none focus:ring-1 focus:ring-orange-400"
              >
                <option>Unpaid</option>
                <option>Paid</option>
              </select>
            </div>

            {/* ADD ITEM */}
            <div className="flex flex-col gap-1">
              <span className="text-slate-400">Add Item</span>
              <select
                defaultValue=""
                onChange={(e) => {
                  addItemToEditCart(e.target.value);
                  e.target.value = "";
                }}
                className="rounded-lg px-2 py-1.5 border border-slate-400/40 bg-transparent focus:outline-none focus:ring-1 focus:ring-orange-400"
              >
                <option value="">Select item…</option>
                {menuItems.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* CART ITEMS */}
          {editCart.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pt-1">
              {editCart.map((i, idx) => (
                <button
                  key={idx}
                  onClick={() => removeItemFromEditCart(idx)}
                  className="px-3 py-1.5 rounded-full border border-orange-400/40 bg-orange-400/10 text-orange-400 text-xs font-medium whitespace-nowrap hover:bg-orange-400 hover:text-black transition"
                >
                  {i.name} ✕
                </button>
              ))}
            </div>
          )}

          {/* ACTIONS */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={saveEditedCart}
              className="flex-1 rounded-xl bg-orange-500 text-black py-2 font-semibold hover:bg-orange-400 transition"
            >
              Save Changes
            </button>

            <button
              onClick={() => {
                setSelectedOrderId(null);
                setEditCart([]);
              }}
              className="flex-1 rounded-xl border border-slate-400/40 py-2 font-semibold hover:bg-slate-700 hover:text-white transition"
            >
              Cancel
            </button>
          </div>
        </div>
      );
    })()}
  </div>
)}

       {showAvatar && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
    {/* Overlay click close (optional UX improvement) */}
    <div
      className="absolute inset-0"
      onClick={() => setShowAvatar(false)}
    />

    {/* Modal Card */}
    <div className="relative z-10 animate-scaleIn">
      {/* Close Button */}
      <button
        onClick={() => setShowAvatar(false)}
        className="absolute -top-3 -right-3 h-8 w-8 rounded-full bg-orange-500 text-black font-bold shadow-lg hover:scale-105 transition"
        title="Close"
      >
        ✕
      </button>

      {/* Image Container */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-slate-900 to-black p-3 shadow-2xl">
        <img
          src="/Screenshot 2025-12-06 160752.png"
          alt="Profile Preview"
          className="max-h-[75vh] max-w-[75vw] rounded-2xl object-contain"
        />

        {/* Caption */}
        <div className="mt-3 text-center">
          <p className="text-sm font-semibold text-orange-400">
            Admin Profile
          </p>
          <p className="text-[11px] text-slate-400">
            Bachelor&apos;s Hub
          </p>
        </div>
      </div>
    </div>

    {/* Animation */}
    <style>
      {`
        @keyframes scaleIn {
          from { transform: scale(0.92); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-scaleIn {
          animation: scaleIn 0.25s ease-out;
        }
      `}
    </style>
  </div>
)}

      </main>
    </div>
  );
}
