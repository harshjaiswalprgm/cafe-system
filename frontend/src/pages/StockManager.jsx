import { useEffect, useState } from "react";
const API = import.meta.env.VITE_API_URL;
export default function StockManager() {
  const [items, setItems] = useState([]);

  const loadItems = async () => {
    const res = await fetch(`${API}/items`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`, // ✅ JWT
      },
    });

    const data = await res.json();
    setItems(data || []);
  };

  useEffect(() => {
    loadItems();
  }, []);

  const updateStock = async (id, stock) => {
    await fetch(`${API}/update-stock`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`, // ✅ REQUIRED
      },
      body: JSON.stringify({ id, stock }),
    });

    loadItems();
  };

  const toggleAvailability = async (id, available) => {
    await fetch(`${API}/update-stock`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`, // ✅ REQUIRED
      },
      body: JSON.stringify({ id, available }),
    });

    loadItems();
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-2xl font-bold mb-6">📦 Stock Management</h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <div
            key={item._id} // ✅ FIXED
            className="bg-neutral-900 border border-orange-500/30 rounded-xl p-4"
          >
            <h2 className="text-lg font-semibold">{item.name}</h2>
            <p className="text-sm text-neutral-400">
              ₹{item.price} • {item.category}
            </p>

            <div className="flex items-center gap-2 mt-3">
              <span className="text-xs">Stock:</span>
              <input
                type="number"
                value={item.stock}
                onChange={(e) =>
                  updateStock(item._id, Number(e.target.value)) // ✅ FIXED
                }
                className="w-20 bg-black border border-neutral-700 rounded px-2 py-1 text-sm"
              />
            </div>

            <button
              onClick={() =>
                toggleAvailability(item._id, !item.available) // ✅ FIXED
              }
              className={`mt-3 w-full text-sm py-2 rounded-lg ${
                item.available
                  ? "bg-green-500 text-black"
                  : "bg-red-500 text-white"
              }`}
            >
              {item.available ? "Available" : "Out of Stock"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
