const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: Number,
      required: true,
    },

    orderToken: {
      type: String,
      required: true,
    },

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
      default: "Cash",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
