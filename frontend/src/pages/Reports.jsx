import ReportExport from "../components/ReportExport";
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const PIE_COLORS = ["#fb923c", "#22c55e", "#3b82f6", "#a855f7", "#eab308"];

export default function Reports() {
  const [orders, setOrders] = useState([]);
  const [reports, setReports] = useState({ daily: {}, monthly: {} });
  const [loading, setLoading] = useState(true);

  // 🔄 LOAD DATA (ORDERS + REPORTS)
 useEffect(() => {
  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");

      const [ordersRes, reportsRes] = await Promise.all([
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
      ]);

      const o = await ordersRes.json();
      const r = await reportsRes.json();

      // ✅ Safety Guards
      setOrders(Array.isArray(o) ? o : []);
      setReports(r || { daily: {}, monthly: {} });
    } catch (err) {
      console.error("Reports fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);


  // 📊 DERIVED METRICS
  const paidOrders = orders.filter((o) => o.paymentStatus === "Paid");
  const unpaidOrders = orders.filter((o) => o.paymentStatus !== "Paid");

  const totalRevenue = paidOrders.reduce(
    (sum, o) => sum + o.cart.reduce((s, i) => s + i.price, 0),
    0
  );

  const totalOrders = orders.length;
  const paidCount = paidOrders.length;
  const unpaidCount = unpaidOrders.length;

  const avgOrderValue = paidCount
    ? Math.round(totalRevenue / paidCount)
    : 0;

  // 📅 Daily + Monthly data for charts
  const dailyData = Object.entries(reports.daily || {}).map(
    ([date, total]) => ({ date, total })
  );

  const monthlyData = Object.entries(reports.monthly || {}).map(
    ([month, total]) => ({ month, total })
  );

  // 🥧 Most ordered items (from PAID orders)
  const itemCounts = {};
  paidOrders.forEach((o) =>
    o.cart.forEach((i) => {
      itemCounts[i.name] = (itemCounts[i.name] || 0) + 1;
    })
  );
  const pieData = Object.entries(itemCounts).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-neutral-950 to-black text-white p-4 lg:p-8">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-wide">
            📊 Bachelor&apos;s Hub — Reports
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Revenue, orders and item insights for your cafe.
          </p>
        </div>


        <div className="flex gap-2 text-xs">
          {/* Placeholder buttons – we’ll wire these in next steps */}
          <button className="px-3 py-2 rounded-lg border border-orange-500/60 bg-black/40 hover:bg-black/70 transition">
            ⬇️ Export Excel (soon)
          </button>
          <button className="px-3 py-2 rounded-lg bg-orange-500 text-black font-semibold hover:bg-orange-400 transition">
            ⬇️ Export PDF (soon)
          </button>
        </div>
      </header>
      <ReportExport orders={orders} reports={reports} />




      {loading ? (
        <p className="text-sm text-neutral-400">Loading reports...</p>
      ) : (
        <>
          {/* SUMMARY CARDS */}
          <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-neutral-900/80 border border-orange-500/20 rounded-2xl p-4">
              <p className="text-xs text-neutral-400">Total Revenue</p>
              <p className="text-2xl font-bold mt-1 text-orange-400">
                ₹{totalRevenue}
              </p>
              <p className="text-[11px] text-neutral-500 mt-1">
                From paid orders only
              </p>
            </div>

            <div className="bg-neutral-900/80 border border-neutral-700 rounded-2xl p-4">
              <p className="text-xs text-neutral-400">Total Orders</p>
              <p className="text-2xl font-bold mt-1">{totalOrders}</p>
              <p className="text-[11px] text-neutral-500 mt-1">
                Paid: {paidCount} • Unpaid: {unpaidCount}
              </p>
            </div>

            <div className="bg-neutral-900/80 border border-neutral-700 rounded-2xl p-4">
              <p className="text-xs text-neutral-400">Average Order Value</p>
              <p className="text-2xl font-bold mt-1">
                ₹{isNaN(avgOrderValue) ? 0 : avgOrderValue}
              </p>
              <p className="text-[11px] text-neutral-500 mt-1">
                Based on paid bills
              </p>
            </div>

            <div className="bg-neutral-900/80 border border-neutral-700 rounded-2xl p-4">
              <p className="text-xs text-neutral-400">Payment Split</p>
              <p className="text-lg font-semibold mt-1 text-emerald-400">
                {paidCount} Paid
              </p>
              <p className="text-[11px] text-neutral-500 mt-1">
                {unpaidCount} pending / unpaid
              </p>
            </div>
          </section>

          {/* CHARTS SECTION */}
          <section className="grid lg:grid-cols-2 gap-4 mb-8">
            {/* DAILY REVENUE */}
            <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-semibold">Daily Revenue</h2>
                <p className="text-[11px] text-neutral-500">
                  From /reports.daily API
                </p>
              </div>

              <div style={{ width: "100%", height: 260 }}>
                {dailyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Bar dataKey="total" fill="#f97316" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-neutral-500">
                    No daily revenue data yet.
                  </div>
                )}
              </div>
            </div>

            {/* MONTHLY REVENUE */}
            <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-semibold">Monthly Revenue</h2>
                <p className="text-[11px] text-neutral-500">
                  From /reports.monthly API
                </p>
              </div>

              <div style={{ width: "100%", height: 260 }}>
                {monthlyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                      <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Bar dataKey="total" fill="#22c55e" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-neutral-500">
                    No monthly data yet.
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* MOST ORDERED ITEMS */}
          <section className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4 mb-10">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold">Most Ordered Items</h2>
              <p className="text-[11px] text-neutral-500">
                Paid orders only
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 items-center">
              <div style={{ width: "100%", height: 220 }}>
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        outerRadius={80}
                        innerRadius={45}
                        paddingAngle={4}
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
                  <div className="h-full flex items-center justify-center text-xs text-neutral-500">
                    No paid orders yet to analyze items.
                  </div>
                )}
              </div>

              <div className="space-y-2 text-xs">
                {pieData.length > 0 ? (
                  pieData.map((p, i) => (
                    <div
                      key={p.name}
                      className="flex items-center justify-between bg-black/40 rounded-lg px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{
                            background: PIE_COLORS[i % PIE_COLORS.length],
                          }}
                        ></span>
                        <span className="font-medium">{p.name}</span>
                      </div>
                      <span className="text-neutral-400">
                        {p.value} orders
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-neutral-500">
                    Once customers start ordering, you&apos;ll see which items
                    are most popular here.
                  </p>
                )}
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
