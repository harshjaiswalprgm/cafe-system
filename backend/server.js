const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());
app.use(cors());

/* ================================
   ✅ MONGODB CONNECTION
================================ */
mongoose
  .connect("PASTE_YOUR_MONGODB_URL_HERE")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err.message));

/* ================================
   ✅ USER SCHEMA (LOGIN)
================================ */
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
  role: String, // admin | kitchen
});

const User = mongoose.model("User", userSchema);

/* ================================
   ✅ TEMP: CREATE DEFAULT USERS
   Open once -> http://localhost:5000/create-users
================================ */
app.get("/create-users", async (req, res) => {
  await User.deleteMany();

  await User.create([
    { username: "admin", password: "admin123", role: "admin" },
    { username: "kitchen", password: "kitchen123", role: "kitchen" },
  ]);

  res.json({ success: true, message: "Users created" });
});

/* ================================
   ✅ LOGIN FROM DATABASE
================================ */
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });

  if (!user || user.password !== password) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid credentials" });
  }

  res.json({
    success: true,
    role: user.role,
  });
});

/* ================================
   ✅ IN-MEMORY MENU ITEMS (FOR NOW)
================================ */
let items = [
  {
    id: 1,
    name: "Cold Coffee",
    price: 120,
    imageUrl: "",
    category: "Beverage",
    stock: 20,
    available: true
  },
  {
    id: 2,
    name: "Veg Burger",
    price: 150,
    imageUrl: "",
    category: "Snacks",
    stock: 15,
    available: true
  },
  {
    id: 3,
    name: "French Fries",
    price: 150,
    imageUrl: "",
    category: "Snacks",
    stock: 15,
    available: true
  }
];


/* ================================
   ✅ ORDERS (IN MEMORY FOR NOW)
================================ */
let orders = [];

/* ================================
   ✅ MENU APIs
================================ */
app.get("/items", (req, res) => {
  res.json(items);
});


app.post("/update-stock", (req, res) => {
  const { id, stock, available } = req.body;

  const item = items.find((i) => i.id === id);
  if (!item) {
    return res.status(404).json({ success: false, message: "Item not found" });
  }

  if (stock !== undefined) item.stock = stock;
  if (available !== undefined) item.available = available;

  res.json({ success: true, item });
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
  if (idx === -1)
    return res.status(404).json({ success: false, message: "Item not found" });

  items[idx] = { ...items[idx], ...req.body };
  res.json({ success: true, item: items[idx] });
});

app.delete("/items/:id", (req, res) => {
  const id = Number(req.params.id);
  items = items.filter((i) => i.id !== id);
  res.json({ success: true });
});

/* ================================
   ✅ PLACE ORDER
================================ */
app.post("/order", (req, res) => {
  const newOrder = {
    ...req.body,
    status: "Pending",
    paymentStatus: "Unpaid",
    paymentMethod: req.body.paymentMethod || "QR", // ✅ ADD THIS
    time: new Date().toISOString(),
    billNo: Date.now(),
  };

  orders.push(newOrder);
  res.json({ success: true });
});

/* ================================
   ✅ GET ALL ORDERS
================================ */
app.get("/orders", (req, res) => {
  res.json(orders);
});

/* ================================
   ✅ UPDATE ORDER STATUS
================================ */
app.post("/update-status", (req, res) => {
  const { index, status } = req.body;
  if (orders[index]) orders[index].status = status;
  res.json({ success: true });
});

/* ================================
   ✅ UPDATE PAYMENT STATUS
================================ */
app.post("/update-payment", (req, res) => {
  const { index, paymentStatus } = req.body;
  if (orders[index]) orders[index].paymentStatus = paymentStatus;
  res.json({ success: true });
});

/* ================================
   ✅ ADMIN FULL ORDER EDIT
================================ */
app.post("/admin-update-order", (req, res) => {
  const { index, updatedOrder } = req.body;
  if (orders[index]) {
    orders[index] = { ...orders[index], ...updatedOrder };
  }
  res.json({ success: true, order: orders[index] });
});

/* ================================
   ✅ REPORTS: DAILY / MONTHLY
================================ */
app.get("/reports", (req, res) => {
  const daily = {};
  const monthly = {};

  orders.forEach((o) => {
    if (o.paymentStatus !== "Paid") return;

    const date = new Date(o.time);
    const dayKey = date.toISOString().slice(0, 10);
    const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}`;

    const amount = o.cart.reduce((sum, item) => sum + item.price, 0);

    daily[dayKey] = (daily[dayKey] || 0) + amount;
    monthly[monthKey] = (monthly[monthKey] || 0) + amount;
  });

  res.json({ daily, monthly });
});

/* ================================
   ✅ START SERVER
================================ */
app.listen(5000, () => {
  console.log("✅ Backend running on http://localhost:5000");
});
