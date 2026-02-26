import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider } from "../src/Auth/AuthContext.jsx";
import { useEffect } from "react";

// Pages
import Navigation from "../src/components/Navigation.jsx";
import Home from "../src/components/Home.jsx";
import Services from "../src/components/Services.jsx";
import Features from "../src/components/Features.jsx";
import Stats from "../src/components/Stats.jsx";
import Premium from "../src/components/Premium.jsx";
import Pricing from "../src/components/Pricing.jsx";
import Studio from "../src/components/Studio.jsx";
import Footer from "../src/components/Footer.jsx";
import ServiceDetail from "../src/components/ServiceDetail.jsx";
import Question from "../src/components/Question.jsx";

// Auth Pages
import UserLogin from "../src/Auth/UserLogin.jsx";
import UserSignup from "../src/Auth/UserSignup.jsx";
import AdminLogin from "../src/Auth/AdminLogin.jsx";
import AdminSignup from "../src/Auth/AdminSignup.jsx";

// Dashboard Pages
import UserDashboard from "../src/components/UserDashboard.jsx";
import AdminDashboard from "../src/components/AdminDashboard.jsx";
import UnauthorizedPage from "../src/components/UnauthorizedPage.jsx";
import ProtectedRoute from "../src/components/ProtectedRoute.jsx";

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
