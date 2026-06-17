import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ToastProvider } from "./components/Toast";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";

import Dashboard from "./pages/Dashboard";
import Causeries from "./pages/Causeries";
import Visites from "./pages/Visites";
import Rex from "./pages/Rex";
import Actions from "./pages/Actions";
import Audits from "./pages/Audits";
import Users from "./pages/Users";
import Login from "./pages/Login";
import Register from "./pages/Register";

function AppContent() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", backgroundColor: "var(--bg-app)" }}>
        <p style={{ fontSize: "1.1rem", color: "var(--text-muted)", fontWeight: 600 }}>Chargement...</p>
      </div>
    );
  }

  const isAuthPage =
    location.pathname === "/login" ||
    location.pathname === "/register";

  if (!user && !isAuthPage) {
    return <Navigate to="/login" replace />;
  }

  if (user && isAuthPage) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      {!isAuthPage && <Navbar />}

      {isAuthPage ? (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      ) : (
        <div className="sidebar-layout">
          <Sidebar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/causeries" element={<Causeries />} />
              <Route path="/visites" element={<Visites />} />
              <Route path="/rex" element={<Rex />} />
              <Route path="/actions" element={<Actions />} />

              <Route
                path="/audits"
                element={
                  <ProtectedRoute
                    allowedRoles={[
                      "Administrateur",
                      "Responsable QSE",
                      "Auditeur",
                    ]}
                  >
                    <Audits />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/users"
                element={
                  <ProtectedRoute allowedRoles={["Administrateur"]}>
                    <Users />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      )}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ToastProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </ToastProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}