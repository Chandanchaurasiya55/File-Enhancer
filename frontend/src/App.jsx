import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Pages
import Navigation from './components/Navigation'
import Home from './components/Home'
import Services from './components/Services'
import Features from './components/Features'
import Stats from './components/Stats'
import Premium from './components/Premium'
import Pricing from './components/Pricing'
import Footer from './components/Footer'
import VideoProcessor from './components/VideoProcessor'
import ServiceDetail from './components/ServiceDetail'

// Auth Pages
import UserLogin from './Auth/UserLogin';
import UserSignup from './Auth/UserSignup';
import AdminLogin from './Auth/AdminLogin';
import AdminSignup from './Auth/AdminSignup';

// Dashboard Pages
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import UnauthorizedPage from './components/UnauthorizedPage';
import ProtectedRoute from './components/ProtectedRoute';

import './styles/index.css'

// Landing page component
function LandingPage() {
  return (
    <>
      <Navigation />
      <Home />
      <Services />
      <Features />
      <Stats />
      <Premium />
      <Pricing />
      <Footer />
    </>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Video Processing */}
          <Route path="/process-video" element={<VideoProcessor />} />

          {/* Service Detail Pages */}
          <Route path="/service/:serviceId" element={<ServiceDetail />} />

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
      </AuthProvider>
    </Router>
  )
}

export default App
