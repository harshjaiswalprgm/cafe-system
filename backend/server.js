// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const Item = require("./models/Item");
const Order = require("./models/Order");

const app = express();

/* ================================
   ✅ ENV VARIABLES
================================ */
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;
const MONGO_URI = process.env.MONGO_URI;

/* ================================
   ✅ MIDDLEWARES
================================ */
app.use(express.json());

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://cafe-system-eta.vercel.app",
      "https://cafe-system-pxgwrtdr2-harsh-jaiswals-projects-d196f3a8.vercel.app"
    ],
    credentials: true,
  })
);

/* ================================
   ✅ MONGODB CONNECTION
================================ */
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err.message));

/* ================================
   ✅ USER SCHEMA
================================ */
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
  role: String, // admin | kitchen
});

const User = mongoose.model("User", userSchema);

/* ================================
   ✅ JWT MIDDLEWARES
================================ */
function verifyToken(req, res, next) {
  const header = req.headers.authorization;
  if (!header) {
    return res.status(401).json({ success: false, message: "No token" });
  }

  try {
    const token = header.split(" ")[1];
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ success: false, message: "Invalid token" });
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    next();
  };
}

/* ================================
   ❌ DEV ONLY (REMOVE IN PROD)
================================ */
// app.get("/create-users", async (req, res) => {
//   await User.deleteMany();
//   await User.create([
//     { username: "admin", password: "admin123", role: "admin" },
//     { username: "kitchen", password: "kitchen123", role: "kitchen" },
//   ]);
//   res.json({ success: true });
// });

/* ================================
   ✅ LOGIN
================================ */
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user || user.password !== password) {
    return res.status(401).json({ success: false });
  }

  const token = jwt.sign(
    { id: user._id, role: user.role },
    JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.json({ success: true, role: user.role, token });
});

/* ================================
   ✅ MENU APIs
================================ */
app.get("/items", async (req, res) => {
  res.json(await Item.find().sort({ createdAt: -1 }));
});

app.post("/items", verifyToken, requireRole("admin"), async (req, res) => {
  const item = await Item.create({
    ...req.body,
    stock: 10,
    available: true,
  });
  res.json({ success: true, item });
});

app.put("/items/:id", verifyToken, requireRole("admin"), async (req, res) => {
  const item = await Item.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json({ success: true, item });
});

app.delete("/items/:id", verifyToken, requireRole("admin"), async (req, res) => {
  await Item.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

/* ================================
   ✅ PLACE ORDER
================================ */
app.post("/order", async (req, res) => {
  try {
    const last = await Order.findOne().sort({ createdAt: -1 });
    const next = (last?.orderNumber || 0) + 1;

    const order = await Order.create({
      orderNumber: next,
      orderToken: `A${String(next).padStart(3, "0")}`,
      cart: req.body.cart,
      status: "Pending",
      paymentStatus: req.body.paymentStatus || "Unpaid",
      paymentMethod: req.body.paymentMethod || "Cash",
    });

    res.json({ success: true, payload: order });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/* ================================
   ✅ ORDERS (ADMIN / KITCHEN)
================================ */
app.get("/orders", verifyToken, async (req, res) => {
  res.json(await Order.find().sort({ createdAt: 1 }));
});

/* ================================
   ✅ UPDATE ORDER
================================ */
app.post(
  "/admin-update-order",
  verifyToken,
  requireRole("admin"),
  async (req, res) => {
    const { orderId, updatedOrder } = req.body;
    const order = await Order.findByIdAndUpdate(
      orderId,
      { $set: updatedOrder },
      { new: true }
    );
    res.json({ success: true, order });
  }
);

/* ================================
   ✅ UPDATE STATUS / PAYMENT
================================ */
app.post("/update-status", verifyToken, async (req, res) => {
  await Order.findByIdAndUpdate(req.body.orderId, {
    status: req.body.status,
  });
  res.json({ success: true });
});

app.post("/update-payment", verifyToken, async (req, res) => {
  await Order.findByIdAndUpdate(req.body.orderId, {
    paymentStatus: "Paid",
  });
  res.json({ success: true });
});

/* ================================
   ✅ REPORTS
================================ */
app.get("/reports", verifyToken, async (req, res) => {
  const orders = await Order.find({ paymentStatus: "Paid" });
  const daily = {};
  const monthly = {};

  orders.forEach((o) => {
    const d = o.createdAt || new Date();
    const day = d.toISOString().slice(0, 10);
    const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const amount = o.cart.reduce((s, i) => s + i.price, 0);

    daily[day] = (daily[day] || 0) + amount;
    monthly[month] = (monthly[month] || 0) + amount;
  });

  res.json({ daily, monthly });
});

/* ================================
   ✅ START SERVER
================================ */
app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});
