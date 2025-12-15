const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    table: String,

    cart: [
      {
        name: String,
        price: Number,
      },
    ],

    status: {
      type: String,
      default: "Pending",
    },

    paymentStatus: {
      type: String,
      default: "Unpaid",
    },

    paymentMethod: {
      type: String,
      default: "Cash", // QR | Cash
    },

    billNo: Number,

    time: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
