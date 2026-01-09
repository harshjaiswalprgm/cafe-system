import Footer from "../components/Footer";

export default function CustomerLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen bg-[#fff7ed] text-slate-900">
      {/* CUSTOMER CONTENT */}
      <main className="flex-1">
        {children}
      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
