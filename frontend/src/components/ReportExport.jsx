import React from "react";

/**
 * orders  -> array of order objects
 * reports -> { daily, monthly }
 */
export default function ReportExport({ orders = [] }) {

  /* ===============================
     ✅ EXPORT TO CSV (EXCEL)
  =============================== */
  const exportExcel = () => {
    if (!orders.length) {
      alert("No orders to export");
      return;
    }

    const headers = [
      "Order No",
      "Token",
      "Status",
      "Payment Status",
      "Payment Method",
      "Items",
      "Total Qty",
      "Total Amount",
      "Date & Time",
    ];

    const rows = orders.map((o) => {
      const totalAmount = o.cart.reduce(
        (sum, i) => sum + i.price * (i.qty || 1),
        0
      );

      const totalQty = o.cart.reduce(
        (sum, i) => sum + (i.qty || 1),
        0
      );

      return [
        o.orderNumber,
        o.orderToken,
        o.status,
        o.paymentStatus,
        o.paymentMethod || "Cash",
        o.cart.map((i) => i.name).join(" | "),
        totalQty,
        totalAmount,
        new Date(o.createdAt).toLocaleString(),
      ];
    });

    let csv = headers.join(",") + "\n";
    rows.forEach((r) => (csv += r.join(",") + "\n"));

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "asha_cafe_orders.csv";
    a.click();
  };

  /* ===============================
     🧾 FINAL 58mm BILL (EXPORT ONLY)
     ⚠️ DO NOT RENDER BUTTONS HERE
  =============================== */
  const printBill = (order) => {
    if (!order || !order.cart?.length) return;

    const subtotal = order.cart.reduce(
      (s, i) => s + i.price * (i.qty || 1),
      0
    );

    const totalQty = order.cart.reduce(
      (s, i) => s + (i.qty || 1),
      0
    );

    const cgstRate = 2.5;
    const sgstRate = 2.5;

    const cgstAmt = +(subtotal * (cgstRate / 100)).toFixed(2);
    const sgstAmt = +(subtotal * (sgstRate / 100)).toFixed(2);

    const totalTax = +(cgstAmt + sgstAmt).toFixed(2);
    const grossTotal = subtotal + totalTax;
    const roundOff = +(Math.round(grossTotal) - grossTotal).toFixed(2);
    const finalTotal = Math.round(grossTotal);

    const itemsRows = order.cart
      .map(
        (i) => `
          <tr>
            <td>${i.name}</td>
            <td style="text-align:center">${i.qty || 1}</td>
            <td style="text-align:right">₹${i.price}</td>
          </tr>
        `
      )
      .join("");

    const win = window.open("", "_blank", "width=380,height=600");
    if (!win) {
      alert("Please allow popups to print the bill.");
      return;
    }

    win.document.write(`
      <html>
        <head>
          <title>Bill ${order.orderToken}</title>
          <style>
            body {
              width: 58mm;
              font-family: monospace;
              font-size: 11px;
              margin: 0;
              padding: 4px;
            }
            h3, h4, p { margin: 2px 0; text-align: center; }
            table { width:100%; border-collapse:collapse; }
            th, td { padding:2px 0; }
            .right { text-align:right; }
            .center { text-align:center; }
            hr { border-top:1px dashed #000; margin:4px 0; }
          </style>
        </head>
        <body>

          <h3>ASHA CAFE</h3>
          <p>
            Koramangala, Bengaluru<br/>
            Ph: 9XXXXXXXXX<br/>
            Mail: ashacafe@gmail.com<br/>
            GSTIN: XXXXXXXXXX<br/>
            FSSAI: XXXXXXXXXXXXX
          </p>

          <hr/>

          <p style="text-align:left">
            Bill No: ${order.orderToken}<br/>
            Date: ${new Date(order.createdAt).toLocaleDateString()}<br/>
            Time: ${new Date(order.createdAt).toLocaleTimeString()}
          </p>

          <hr/>

          <table>
            <tr>
              <th>Item</th>
              <th class="center">Qty</th>
              <th class="right">Amt</th>
            </tr>
            ${itemsRows}
          </table>

          <hr/>

          <table>
            <tr><td>Total Qty</td><td class="right">${totalQty}</td></tr>
            <tr><td>Sub Total</td><td class="right">₹${subtotal.toFixed(2)}</td></tr>
          </table>

          <hr/>

          <p class="center"><b>Tax Summary</b></p>
          <table>
            <tr><td>CGST @ ${cgstRate}%</td><td class="right">₹${cgstAmt}</td></tr>
            <tr><td>SGST @ ${sgstRate}%</td><td class="right">₹${sgstAmt}</td></tr>
            <tr><td><b>Total Tax</b></td><td class="right"><b>₹${totalTax}</b></td></tr>
            <tr><td>Round Off</td><td class="right">₹${roundOff}</td></tr>
          </table>

          <hr/>

          <h4>TOTAL AMOUNT: ₹${finalTotal}</h4>

          <hr/>

          <p>Thank you! Visit Again ☕</p>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(() => window.close(), 300);
            };
          </script>

        </body>
      </html>
    `);

    win.document.close();
  };

  /* ===============================
     ✅ REPORTS UI (NO PRINT HERE)
  =============================== */
  return (
    <div className="flex gap-3 mb-6">
      <button
        onClick={exportExcel}
        className="px-4 py-2 rounded bg-emerald-500 text-black font-semibold"
      >
        ⬇️ Export Orders (Excel)
      </button>
    </div>
  );
}

/* =================================================
   ✅ IMPORTANT:
   - Bill printing is REMOVED from Reports UI
   - Admin dashboard will CALL printBill(order)
================================================= */
