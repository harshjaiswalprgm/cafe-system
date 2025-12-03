const express = require("express");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// 🔐 Simple hardcoded users
const USERS = {
  admin: { password: "admin123", role: "admin" },
  kitchen: { password: "kitchen123", role: "kitchen" },
};

// 🧾 In-memory menu items (Admin can change)
let items = [
  {
    id: 1,
    name: "Cold Coffee",
    price: 120,
    imageUrl: "",
    category: "Beverage",
  },
  {
    id: 2,
    name: "Veg Burger",
    price: 150,
    imageUrl: "",
    category: "Snacks",
  },
  {
    id: 3,
    name: "Margherita Pizza",
    price: 250,
    imageUrl: "",
    category: "Pizza",
  },
];

// 🧾 Orders
let orders = [];

// 🔐 Login route
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = USERS[username];
  if (!user || user.password !== password) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }
  return res.json({ success: true, role: user.role });
});

// ☕ MENU APIs
app.get("/items", (req, res) => {
  res.json(items);
});

app.post("/items", (req, res) => {
  const { name, price, imageUrl, category } = req.body;
  const newItem = {
    id: Date.now(),
    name,
    price: Number(price) || 0,
    imageUrl: imageUrl || "",
    category: category || "General",
  };
  items.push(newItem);
  res.json({ success: true, item: newItem });
});

app.put("/items/:id", (req, res) => {
  const id = Number(req.params.id);
  const idx = items.findIndex((i) => i.id === id);
  if (idx === -1) return res.status(404).json({ success: false, message: "Item not found" });

  items[idx] = { ...items[idx], ...req.body };
  res.json({ success: true, item: items[idx] });
});

app.delete("/items/:id", (req, res) => {
  const id = Number(req.params.id);
  items = items.filter((i) => i.id !== id);
  res.json({ success: true });
});

// ✅ Place Order
app.post("/order", (req, res) => {
  const newOrder = {
    ...req.body, // { table, cart }
    status: "Pending",
    paymentStatus: "Unpaid",
    time: new Date().toISOString(),
    billNo: Date.now(),
  };
  orders.push(newOrder);
  res.json({ success: true });
});

// ✅ Get All Orders
app.get("/orders", (req, res) => {
  res.json(orders);
});

// ✅ Update status (Kitchen/Admin)
app.post("/update-status", (req, res) => {
  const { index, status } = req.body;
  if (orders[index]) orders[index].status = status;
  res.json({ success: true });
});

// ✅ Update payment
app.post("/update-payment", (req, res) => {
  const { index, paymentStatus } = req.body;
  if (orders[index]) orders[index].paymentStatus = paymentStatus;
  res.json({ success: true });
});

// ✅ Admin: update whole order (change items, table, etc.)
app.post("/admin-update-order", (req, res) => {
  const { index, updatedOrder } = req.body;
  if (orders[index]) {
    orders[index] = { ...orders[index], ...updatedOrder };
  }
  res.json({ success: true, order: orders[index] });
});

// ✅ Reports: daily / monthly revenue (Paid orders only)
app.get("/reports", (req, res) => {
  const daily = {};
  const monthly = {};

  orders.forEach((o) => {
    if (o.paymentStatus !== "Paid") return;

    const date = new Date(o.time);
    const dayKey = date.toISOString().slice(0, 10); // YYYY-MM-DD
    const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}`;

    const amount = o.cart.reduce((sum, item) => sum + item.price, 0);

    daily[dayKey] = (daily[dayKey] || 0) + amount;
    monthly[monthKey] = (monthly[monthKey] || 0) + amount;
  });

  res.json({ daily, monthly });
});

app.listen(5000, () => {
  console.log("✅ Backend running on http://localhost:5000");
});
