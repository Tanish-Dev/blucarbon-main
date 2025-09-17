import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import FieldCapture from "./pages/FieldCapture";
import DMRVStudio from "./pages/DMRVStudio";
import Credits from "./pages/Credits";
import Marketplace from "./pages/Marketplace";
import Admin from "./pages/Admin";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { Toaster } from "./components/ui/toaster";

function App() {
  return (
    <div className="App font-['Inter',sans-serif] bg-[#fafafa]">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/field-capture" element={<FieldCapture />} />
              <Route path="/create-project" element={<FieldCapture />} />
              <Route path="/dmrv-studio" element={<DMRVStudio />} />
              <Route path="/credits" element={<Credits />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute requiredRoles={['admin']}>
                    <Admin />
                  </ProtectedRoute>
                } 
              />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Routes>
        </BrowserRouter>
        <Toaster />
      </AuthProvider>
    </div>
  );
}

export default App;