export default function ReportExport({ orders, reports }) {
  // ✅ EXPORT TO CSV (EXCEL)
  const exportExcel = () => {
  if (!orders.length) {
    alert("No orders to export");
    return;
  }

  const headers = [
    "Bill No",
    "Table",
    "Order Status",
    "Payment Status",
    "Payment Method",      // ✅ NEW COLUMN
    "Items Ordered",
    "Total Items",
    "Total Amount",
    "Date & Time",
  ];

  const rows = orders.map((o) => {
    const totalAmount = o.cart.reduce((s, i) => s + i.price, 0);
    const itemsList = o.cart.map((i) => i.name).join(" | ");
    const totalItems = o.cart.length;

    return [
      o.billNo,
      o.table,
      o.status,
      o.paymentStatus,
      o.paymentMethod || "QR",   // ✅ DEFAULT = QR if missing
      itemsList,
      totalItems,
      totalAmount,
      new Date(o.time).toLocaleString(),
    ];
  });

  let csv = headers.join(",") + "\n";
  rows.forEach((r) => (csv += r.join(",") + "\n"));

  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "bachelorshub_orders_detailed.csv";
  a.click();
};


  // ✅ EXPORT PDF (PRINTABLE REPORT)
  const exportPDF = () => {
    const daily = reports.daily || {};
    let rows = "";

    Object.entries(daily).forEach(([date, total]) => {
      rows += `<tr><td>${date}</td><td>₹${total}</td></tr>`;
    });

    const win = window.open("", "_blank");
    win.document.write(`
      <html>
        <head>
          <title>Daily Sales Report</title>
          <style>
            body { font-family: Arial; background:#f5f5f5; padding:30px; }
            .card { background:white; padding:20px; border-radius:10px; }
            h1 { color:#f97316; }
            table { width:100%; border-collapse:collapse; margin-top:20px; }
            th, td { border:1px solid #ddd; padding:8px; text-align:left; }
            th { background:#f97316; color:black; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>Bachelor's Hub - Daily Sales Report</h1>
            <table>
              <tr><th>Date</th><th>Revenue</th></tr>
              ${rows}
            </table>
          </div>
        </body>
      </html>
    `);

    win.document.close();
    win.print();
  };

  return (
    <div className="flex flex-wrap gap-3 mb-6">
      <button
        onClick={exportExcel}
        className="px-4 py-2 rounded-lg bg-emerald-500 text-black font-semibold hover:bg-emerald-400"
      >
        ⬇️ Export Orders (Excel)
      </button>

      <button
        onClick={exportPDF}
        className="px-4 py-2 rounded-lg bg-orange-500 text-black font-semibold hover:bg-orange-400"
      >
        ⬇️ Export Daily Report (PDF)
      </button>
    </div>
  );
}
