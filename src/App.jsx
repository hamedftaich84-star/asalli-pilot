import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import { supabase } from "./services/supabase";

import Navbar from "./components/Navbar";
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
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const location = useLocation();

  useEffect(() => {
    async function getSession() {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setLoading(false);
    }

    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return <p style={{ padding: "30px" }}>Chargement...</p>;
  }

  const isAuthPage =
    location.pathname === "/login" ||
    location.pathname === "/register";

  if (!session && !isAuthPage) {
    return <Navigate to="/login" replace />;
  }

  if (session && isAuthPage) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      {!isAuthPage && <Navbar />}

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

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
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}