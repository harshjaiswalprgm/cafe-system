import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Menu() {
  const { table } = useParams();
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [myOrder, setMyOrder] = useState(null);
  const [showQR, setShowQR] = useState(false);

  // Fetch menu from backend
  useEffect(() => {
    fetch("http://localhost:5000/items")
      .then((r) => r.json())
      .then(setMenuItems)
      .catch(() => setMenuItems([]));
  }, []);

  const addToCart = (item) => setCart((prev) => [...prev, item]);

  const placeOrder = async () => {
    if (cart.length === 0) return alert("Cart is empty!");

    await fetch("http://localhost:5000/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ table, cart }),
    });

    alert("✅ Order placed!");
    setCart([]);
  };

  // Poll for my order status
  useEffect(() => {
    const id = setInterval(async () => {
      const res = await fetch("http://localhost:5000/orders");
      const data = await res.json();
      setMyOrder(data.find((o) => o.table === table));
    }, 2000);

    return () => clearInterval(id);
  }, [table]);

  const activeTotal =
    myOrder?.cart?.reduce((s, i) => s + i.price, 0) ||
    cart.reduce((s, i) => s + i.price, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-neutral-900 to-black flex items-center justify-center px-4">
      <div className="w-full max-w-5xl grid md:grid-cols-3 gap-6">
        {/* Menu */}
        <div className="md:col-span-2 bg-neutral-900/90 border border-orange-500/40 rounded-3xl p-6 shadow-2xl backdrop-blur-xl">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-xl font-bold text-orange-400">
                Bachelor&apos;s Hub
              </h1>
              <p className="text-xs text-neutral-300">
                Scan. Order. Relax at Table {table}.
              </p>
            </div>
            <span className="text-[10px] px-2 py-1 bg-neutral-800 rounded-full border border-orange-500/60 text-orange-300">
              QR Ordering Active
            </span>
          </div>

          {menuItems.length === 0 && (
            <p className="text-xs text-neutral-400">
              No items added yet. Ask admin to add menu.
            </p>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            {menuItems.map((item) => (
              <div
                key={item.id}
                className="bg-neutral-900 border border-neutral-700 rounded-2xl p-4 flex flex-col justify-between hover:border-orange-400 hover:-translate-y-1 hover:shadow-lg transition"
              >
                <div className="flex gap-3">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-14 h-14 rounded-xl object-cover border border-neutral-700"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-neutral-800 flex items-center justify-center text-[10px] text-neutral-400 border border-neutral-700">
                      No Image
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-sm">{item.name}</h3>
                    <p className="text-[11px] text-neutral-400">
                      {item.category || "Item"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <span className="text-orange-400 font-bold text-sm">
                    ₹{item.price}
                  </span>
                  <button
                    onClick={() => addToCart(item)}
                    className="text-xs px-3 py-1 rounded-full bg-orange-500 text-black font-semibold hover:bg-orange-400 transition"
                  >
                    Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cart + Status + Payment */}
        <div className="bg-neutral-900/90 border border-orange-500/40 rounded-3xl p-5 shadow-2xl flex flex-col justify-between">
          <div>
            <h2 className="font-semibold text-sm mb-2">🛒 Your Cart</h2>
            {cart.length === 0 && (
              <p className="text-xs text-neutral-400 mb-2">
                Add items to place a new order.
              </p>
            )}
            <div className="space-y-1 max-h-32 overflow-y-auto text-xs">
              {cart.map((c, i) => (
                <div key={i} className="flex justify-between">
                  <span>{c.name}</span>
                  <span>₹{c.price}</span>
                </div>
              ))}
            </div>

            {cart.length > 0 && (
              <button
                onClick={placeOrder}
                className="mt-3 w-full text-xs py-2 rounded-full bg-orange-500 text-black font-semibold hover:bg-orange-400 transition"
              >
                ✅ Place Order
              </button>
            )}

            <hr className="my-3 border-neutral-700" />

            <h2 className="font-semibold text-sm mb-1">📦 Order Status</h2>
            <p className="text-xs">
              Status:{" "}
              <span className="font-semibold text-orange-300">
                {myOrder?.status || "No active order"}
              </span>
            </p>
            <p className="text-xs">
              Payment:{" "}
              <span
                className={
                  myOrder?.paymentStatus === "Paid"
                    ? "text-emerald-400 font-semibold"
                    : "text-yellow-300 font-semibold"
                }
              >
                {myOrder?.paymentStatus || "Unpaid"}
              </span>
            </p>

            <p className="mt-2 text-sm font-semibold">
              Total: <span className="text-orange-400">₹{activeTotal}</span>
            </p>
          </div>

          <div className="mt-4 space-y-2">
            <button
              onClick={() => alert("Please pay at the counter.")}
              className="w-full text-xs py-2 rounded-full bg-neutral-800 border border-neutral-700 hover:border-neutral-500 transition"
            >
              💵 Pay at Counter
            </button>
            <button
              onClick={() => setShowQR(true)}
              className="w-full text-xs py-2 rounded-full bg-orange-500 text-black font-semibold hover:bg-orange-400 transition"
            >
              📲 Pay Online (UPI QR)
            </button>
          </div>
        </div>
      </div>

      {/* QR Modal */}
      {showQR && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-neutral-900 border border-orange-500/60 rounded-2xl p-6 text-center shadow-2xl">
            <h3 className="text-lg font-semibold mb-2 text-orange-400">
              Scan & Pay
            </h3>
            <p className="text-xs text-neutral-300 mb-3">
              Use any UPI app to pay directly.
            </p>
            <img
              src="/payment-qr.png"
              alt="Payment QR"
              className="mx-auto mb-3 rounded-lg border border-neutral-700"
              width="200"
            />
            <button
              onClick={() => setShowQR(false)}
              className="mt-2 text-xs px-4 py-2 rounded-full bg-emerald-500 text-black font-semibold hover:bg-emerald-400 transition"
            >
              ✅ I Have Paid
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
