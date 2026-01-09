import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import Menu from "./pages/Menu";
import Kitchen from "./pages/Kitchen";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import StockManager from "./pages/StockManager";
import Reports from "./pages/Reports";

import CustomerLayout from "./layouts/CustomerLayout";
import DailyOffers from "./components/DailyOffers";
import GoogleReviews from "./components/GoogleReviews";
import ImageFeed from "./components/ImageFeed";

/* =================================================
   ✅ PROTECTED ROUTE
================================================= */
function ProtectedRoute({ allowedRoles, children }) {
  const location = useLocation();
  const role = localStorage.getItem("role");

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
}

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-black to-neutral-950 text-white">
      <Routes>
        {/* DEFAULT */}
        <Route path="/" element={<Navigate to="/menu/1" />} />

        {/* ================= CUSTOMER SIDE ================= */}
        <Route
          path="/menu/:table"
          element={
            <CustomerLayout>
              <Menu />
              <DailyOffers />
              <ImageFeed />
              <GoogleReviews />
            </CustomerLayout>
          }
        />

        {/* ================= KITCHEN ================= */}
        <Route
          path="/kitchen"
          element={
            <ProtectedRoute allowedRoles={["kitchen", "admin"]}>
              <Kitchen />
            </ProtectedRoute>
          }
        />

        {/* ================= ADMIN ================= */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Admin />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/stock"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <StockManager />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Reports />
            </ProtectedRoute>
          }
        />

        {/* ================= LOGIN ================= */}
        <Route path="/login" element={<Login />} />
      </Routes>
    </div>
  );
}
