import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

// Layout & Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import RegisterProfile from './pages/RegisterProfile';

// Volunteer Dashboard Views
import VolOverview from './pages/VolunteerDashboard/Overview';
import VolProfile from './pages/VolunteerDashboard/Profile';
import VolEvents from './pages/VolunteerDashboard/Events';
import VolCertificates from './pages/VolunteerDashboard/Certificates';

// Admin Dashboard Views
import AdminOverview from './pages/AdminDashboard/Overview';
import AdminVolunteers from './pages/AdminDashboard/VolunteersList';
import AdminEvents from './pages/AdminDashboard/EventsManager';
import AdminAttendance from './pages/AdminDashboard/AttendanceManager';
import AdminReports from './pages/AdminDashboard/Reports';

// Route Guard: Protected Route
function ProtectedRoute() {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

// Route Guard: Admin Role Route
function AdminRoute() {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user && user.role === 'admin' ? <Outlet /> : <Navigate to="/login" replace />;
}

// Route Guard: Volunteer Role & Profile Check
function VolunteerRoute() {
  const { user, loading } = useAuth();
  if (loading) return null;

  if (!user || user.role !== 'volunteer') {
    return <Navigate to="/login" replace />;
  }

  // Force onboarding if they haven't set up profile details yet
  if (!user.hasProfile) {
    return <Navigate to="/register-profile" replace />;
  }

  return <Outlet />;
}

// Dashboard Layout (Combines Navbar & Sidebar)
function DashboardLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <div className="flex-1 flex flex-col md:flex-row">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// Public Layout (For Landing Page, Login, and Signup)
function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <div className="flex-grow">
        <Outlet />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <Routes>
            {/* Public Pages */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
            </Route>

            {/* Private Profile Registration (Only logged in volunteers without profile) */}
            <Route element={<ProtectedRoute />}>
              <Route path="/register-profile" element={<RegisterProfile />} />
            </Route>

            {/* Volunteer Dashboard (Protected & Onboarded) */}
            <Route element={<VolunteerRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<VolOverview />} />
                <Route path="/dashboard/profile" element={<VolProfile />} />
                <Route path="/dashboard/events" element={<VolEvents />} />
                <Route path="/dashboard/certificates" element={<VolCertificates />} />
              </Route>
            </Route>

            {/* Admin Dashboard */}
            <Route element={<AdminRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/admin" element={<AdminOverview />} />
                <Route path="/admin/volunteers" element={<AdminVolunteers />} />
                <Route path="/admin/events" element={<AdminEvents />} />
                <Route path="/admin/attendance" element={<AdminAttendance />} />
                <Route path="/admin/reports" element={<AdminReports />} />
              </Route>
            </Route>

            {/* Catch-all Redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}
