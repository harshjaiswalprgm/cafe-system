const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    imageUrl: { type: String, default: "" },
    category: { type: String, default: "General" },

    // ✅ STOCK SYSTEM
    stock: { type: Number, default: 10 },
    available: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Item", itemSchema);
