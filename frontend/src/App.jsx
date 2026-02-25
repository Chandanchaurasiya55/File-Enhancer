import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { useEffect } from "react";

// Pages
import Navigation from "./components/Navigation";
import Home from "./components/Home";
import Services from "./components/Services";
import Features from "./components/Features";
import Stats from "./components/Stats";
import Premium from "./components/Premium";
import Pricing from "./components/Pricing";
import Studio from "./components/studio";
import Footer from "./components/Footer";
import ServiceDetail from "./components/ServiceDetail";
import Question from "./components/question";

// Auth Pages
import UserLogin from "./Auth/UserLogin";
import UserSignup from "./Auth/UserSignup";
import AdminLogin from "./Auth/AdminLogin";
import AdminSignup from "./Auth/AdminSignup";

// Dashboard Pages
import UserDashboard from "./components/UserDashboard";
import AdminDashboard from "./components/AdminDashboard";
import UnauthorizedPage from "./components/UnauthorizedPage";
import ProtectedRoute from "./components/ProtectedRoute";

import "./styles/index.css";

// Landing page component
function LandingPage() {
  return (
    <>
      <Home />
      <Services />
      <Features />
      <Premium />
      <Stats />
      <Question />
    </>
  );
}

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [pathname]);

  return null;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ScrollToTop />
        <Navigation />
        <Routes>
          {/* Landing Page */}
          <Route path="/" element={<LandingPage />} />

          <Route path="/home" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/features" element={<Features />} />
          <Route path="/studio" element={<Studio />} />

          {/* Pricing Page */}
          <Route path="/pricing" element={<Pricing />} />

          <Route path="/studio" element={<Stats />} />

          {/* Service Detail Pages - Protected */}
          <Route
            path="/service/:serviceId"
            element={
              <ProtectedRoute requiredRole="user">
                <ServiceDetail />
              </ProtectedRoute>
            }
          />

          {/* User Auth Routes */}
          <Route path="/user/login" element={<UserLogin />} />
          <Route path="/user/signup" element={<UserSignup />} />

          {/* User Dashboard */}
          <Route
            path="/user/dashboard"
            element={
              <ProtectedRoute requiredRole="user">
                <UserDashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin Auth Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/signup" element={<AdminSignup />} />

          {/* Admin Dashboard */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Error Pages */}
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <Footer />
      </AuthProvider>
    </Router>
  );
}

export default App;
