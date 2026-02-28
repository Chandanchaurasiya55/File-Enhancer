import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { useEffect } from "react";

// Pages
import Navigation from "./components/Navigation.jsx";
import Home from "./components/Home.jsx";
import Services from "./components/Services.jsx";
import Features from "./components/Features.jsx";
import Stats from "./components/Stats.jsx";
import Premium from "./components/Premium.jsx";
import Pricing from "./components/Pricing.jsx";
import Studio from "./components/Studio.jsx";
import Footer from "./components/Footer.jsx";
import ServiceDetail from "./components/ServiceDetail.jsx";
import Upload from "./components/Upload.jsx";
import Queary from "./components/Queary.jsx";
import MouseMovingEffect from "./components/MouseMovingEffect.jsx";

// Auth Pages
import UserLogin from "./Auth/UserLogin.jsx";
import UserSignup from "./Auth/UserSignup.jsx";
import AdminLogin from "./Auth/AdminLogin.jsx";
import AdminSignup from "./Auth/AdminSignup.jsx";

// Dashboard Pages
import UserDashboard from "./components/UserDashboard.jsx";
import AdminDashboard from "./components/AdminDashboard.jsx";
import UnauthorizedPage from "./components/UnauthorizedPage.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

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
      <Queary />
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
        <MouseMovingEffect />
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

          <Route path="/stats" element={<Stats />} />

          {/* Service Detail Pages - Protected */}
          <Route
            path="/service/:serviceId"
            element={
              <ProtectedRoute requiredRole="user">
                <ServiceDetail />
              </ProtectedRoute>
            }
          />

          {/* Upload Pages - Protected */}
          <Route
            path="/upload/:serviceId"
            element={
              <ProtectedRoute requiredRole="user">
                <Upload />
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