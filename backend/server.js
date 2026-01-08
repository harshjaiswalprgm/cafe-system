// server.js
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const Item = require("./models/Item");
const Order = require("./models/Order");

const app = express();
app.use(express.json());
app.use(cors());

// 🔐 JWT secret (must match everywhere)
const JWT_SECRET = "SECRETKEY123";

/* ================================
   ✅ MONGODB CONNECTION
================================ */
mongoose
  .connect(
    "mongodb+srv://harshjaiswalprgm_db_user:admin123@bachelorshub.cjypsa4.mongodb.net/cafe?retryWrites=true&w=majority"
  )
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err.message));

/* ================================
   ✅ USER SCHEMA (LOGIN)
================================ */
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String, // plain for now
  role: String, // "admin" | "kitchen"
});

const User = mongoose.model("User", userSchema);

/* ================================
   ✅ JWT MIDDLEWARES
================================ */

// Basic token check
function verifyToken(req, res, next) {
  const header = req.headers.authorization;
  if (!header) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }

  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
}

// Role-based guard (admin / kitchen)
function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res
        .status(403)
        .json({ success: false, message: "Access denied: " + role + " only" });
    }
    next();
  };
}

/* ================================
   ✅ TEMP: CREATE DEFAULT USERS
   Hit once: http://localhost:5000/create-users
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
   ✅ LOGIN (RETURNS JWT)
================================ */
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });

  if (!user || user.password !== password) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid credentials" });
  }

  const token = jwt.sign(
    { id: user._id, role: user.role },
    JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.json({
    success: true,
    role: user.role,
    token,
  });
});

/* ================================
   ✅ MENU APIs (Mongo Items)
================================ */

// Public: customer can see menu
app.get("/items", async (req, res) => {
  const items = await Item.find().sort({ createdAt: -1 });
  res.json(items);
});

// Admin: update stock / availability
app.post("/update-stock", verifyToken, requireRole("admin"), async (req, res) => {
  const { id, stock, available } = req.body;

  const item = await Item.findByIdAndUpdate(
    id,
    { stock, available },
    { new: true }
  );

  if (!item) {
    return res
      .status(404)
      .json({ success: false, message: "Item not found" });
  }

  res.json({ success: true, item });
});

// Admin: add new item
app.post("/items", verifyToken, requireRole("admin"), async (req, res) => {
  const { name, price, imageUrl, category } = req.body;

  const newItem = await Item.create({
    name,
    price,
    imageUrl,
    category,
    stock: 10,
    available: true,
  });

  res.json({ success: true, item: newItem });
});

// Admin: update item details
app.put("/items/:id", verifyToken, requireRole("admin"), async (req, res) => {
  const item = await Item.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  if (!item) {
    return res
      .status(404)
      .json({ success: false, message: "Item not found" });
  }

  res.json({ success: true, item });
});

// Admin: delete item
app.delete("/items/:id", verifyToken, requireRole("admin"), async (req, res) => {
  await Item.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

/* ================================
   ✅ PLACE ORDER (Customer)
================================ */
app.post("/order", async (req, res) => {
  try {
    const lastOrder = await Order.findOne().sort({ createdAt: -1 });

    // ✅ SAFE number generation (NO NaN POSSIBLE)
    const lastNumber = lastOrder?.orderNumber || 0;
    const nextNumber = lastNumber + 1;

    const newOrder = new Order({
      orderNumber: nextNumber,                     // 1,2,3...
      orderToken: `A${String(nextNumber).padStart(3, "0")}`, // A001
      cart: req.body.cart,
      status: "Pending",
      paymentStatus: req.body.paymentStatus || "Unpaid",
      paymentMethod: req.body.paymentMethod || "Cash",
    });

    await newOrder.save();

    res.json({ success: true, payload: newOrder });
  } catch (err) {
    console.error("Order error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});



/* ================================
   ✅ GET ALL ORDERS (Admin / Kitchen)
================================ */
app.post("/admin-update-order", verifyToken, async (req, res) => {
  const { orderId, updatedOrder } = req.body;

  const order = await Order.findByIdAndUpdate(
    orderId,
    updatedOrder,
    { new: true }
  );

  res.json({ success: true, order });
});


/* ================================
   ✅ UPDATE ORDER STATUS (Kitchen/Admin)
================================ */
app.post("/update-status", verifyToken, async (req, res) => {
  const { orderId, status } = req.body;
  await Order.findByIdAndUpdate(orderId, { status });
  res.json({ success: true });
});

/* ================================
   ✅ GET ALL ORDERS (KITCHEN / ADMIN)
================================ */
app.get("/orders", verifyToken, async (req, res) => {
  const orders = await Order.find().sort({ createdAt: 1 });
  res.json(orders);
});



/* ================================
   ✅ UPDATE PAYMENT STATUS (Admin/Kitchen)
================================ */
app.post("/update-payment", verifyToken, async (req, res) => {
  const { orderId } = req.body;
  await Order.findByIdAndUpdate(orderId, { paymentStatus: "Paid" });
  res.json({ success: true });
});


/* ================================
   ✅ ADMIN FULL ORDER EDIT
   (You will call this with orderId from frontend)
================================ */
app.post("/admin-update-order", verifyToken, requireRole("admin"), async (req, res) => {
  const { orderId, updatedOrder } = req.body;

  try {
    const order = await Order.findByIdAndUpdate(
      orderId,
      { $set: updatedOrder },
      { new: true }
    );

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/* ================================
   ✅ REPORTS: DAILY / MONTHLY
================================ */
app.get("/reports", verifyToken, async (req, res) => {
  try {
    const orders = await Order.find({ paymentStatus: "Paid" });

    const daily = {};
    const monthly = {};

    orders.forEach((o) => {
      const date = o.createdAt || new Date();
      const dayKey = date.toISOString().slice(0, 10);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}`;

      const amount = (o.cart || []).reduce(
        (sum, item) => sum + (item.price || 0),
        0
      );

      daily[dayKey] = (daily[dayKey] || 0) + amount;
      monthly[monthKey] = (monthly[monthKey] || 0) + amount;
    });

    res.json({ daily, monthly });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/* ================================
   ✅ SEED DEFAULT ITEMS (RUN ONCE)
   http://localhost:5000/seed-items
================================ */
app.get("/seed-items", async (req, res) => {
  try {
    await Item.deleteMany();

    const data = await Item.create([
      { name: "Cold Coffee", price: 120, category: "Beverage", stock: 20 },
      { name: "Veg Burger", price: 150, category: "Snacks", stock: 15 },
      { name: "French Fries", price: 130, category: "Snacks", stock: 18 },
    ]);

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/* ================================
   ✅ START SERVER
================================ */
app.listen(5000, () => {
  console.log("✅ Backend running on http://localhost:5000");
});
