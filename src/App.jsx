import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";

import Dashboard from "./pages/Dashboard";
import Causeries from "./pages/Causeries";
import Visites from "./pages/Visites";
import Rex from "./pages/Rex";
import Actions from "./pages/Actions";
import Audits from "./pages/Audits";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/causeries" element={<Causeries />} />
        <Route path="/visites" element={<Visites />} />
        <Route path="/rex" element={<Rex />} />
        <Route path="/actions" element={<Actions />} />
        <Route path="/audits" element={<Audits />} />
      </Routes>
    </BrowserRouter>
  );
}