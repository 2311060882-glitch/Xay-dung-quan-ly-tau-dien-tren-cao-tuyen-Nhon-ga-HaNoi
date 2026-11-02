import { useState, useEffect, type ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TrainTrack } from 'lucide-react';

// Admin Pages
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminTripsPage from './pages/admin/AdminTripsPage';
import AdminScanQRPage from './pages/admin/AdminScanQRPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';
import AdminPriorityPage from './pages/admin/AdminPriorityPage';
import AdminLayout from './pages/admin/AdminLayout';
import AdminTicketsPage from './pages/admin/AdminTicketsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';

// User Pages
import MobileLayout from './templates/MobileLayout';
import Home from './pages/user/Home';
import Tickets from './pages/user/TicketsPage';
import Stations from './pages/user/Stations';
import QRPage from './pages/user/ActiveQRPage';
import Profile from './pages/user/ProfilePage';
import Login from './pages/user/Login';
import Register from './pages/user/Register';
import RegistrationHistory from './pages/user/PriorityRegistrationsPage';
import RegistrationFormPage from './pages/user/RegistrationFormPage';
import WalletPage from './pages/user/WalletPage';
import BuyTicketPage from './pages/user/BuyTicketPage';
import RelativesPage from './pages/user/RelativesPage';
import JourneyHistoryPage from './pages/user/JourneyHistoryPage';
import StationDetailPage from './pages/user/StationDetailPage'; // Thêm import này lên đầu

// --- COMPONENT BẢO VỆ ROUTE USER ---
const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const isAuth = localStorage.getItem('csrf_token');
  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// --- COMPONENT BẢO VỆ ROUTE ADMIN ---
const AdminProtectedRoute = ({ children }: { children: ReactNode }) => {
  const adminUserStr = localStorage.getItem('adminUser');
  if (!adminUserStr) {
    return <Navigate to="/admin/login" replace />;
  }
  
  let isAdmin: boolean;
  try {
    const adminUser = JSON.parse(adminUserStr);
    isAdmin = adminUser.role === 'ADMIN';
  } catch {
    // Xử lý khi parse JSON thất bại
    isAdmin = false;
  }

  return isAdmin ? <>{children}</> : <Navigate to="/admin/login" replace />;
};

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary flex flex-col items-center justify-center text-white relative">
        <div className="animate-pulse flex flex-col items-center">
          <div className="bg-white p-4 rounded-full mb-4 shadow-lg shadow-blue-500/50">
            <TrainTrack size={48} className="text-primary" />
          </div>
          <h1 className="text-2xl font-black tracking-widest">HANOI METRO</h1>
          <p className="text-sm text-blue-200 mt-2 font-medium">Hành trình xanh - Giao thông sạch</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* USER PROTECTED ROUTES */}
        <Route path="/registration/history" element={<ProtectedRoute><RegistrationHistory /></ProtectedRoute>} />
        <Route path="/registration/new" element={<ProtectedRoute><RegistrationFormPage /></ProtectedRoute>} />
        <Route path="/relatives" element={<ProtectedRoute><RelativesPage /></ProtectedRoute>} />
        <Route path="/journeys" element={<ProtectedRoute><JourneyHistoryPage /></ProtectedRoute>} />
        <Route path="/tickets/buy" element={<ProtectedRoute><BuyTicketPage /></ProtectedRoute>} />
        <Route path="/wallet" element={<ProtectedRoute><WalletPage /></ProtectedRoute>} />
        
        {/* ADMIN ROUTES */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route
          path="/admin"
          element={
            <AdminProtectedRoute>
              <AdminLayout />
            </AdminProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="priority-applications" element={<AdminPriorityPage />} />
          <Route path="trips" element={<AdminTripsPage />} />
          <Route path="scan-qr" element={<AdminScanQRPage />} />
          <Route path="reports" element={<AdminReportsPage />} />
          <Route path="tickets" element={<AdminTicketsPage />} />
          <Route path="users" element={<AdminUsersPage />} />
        </Route>

        {/* CÁC TRANG USER CÓ THANH BOTTOM NAVIGATION */}
        <Route element={<ProtectedRoute><MobileLayout /></ProtectedRoute>}>
          <Route path="/" element={<Home />} />
          <Route path="/tickets" element={<Tickets />} />
          <Route path="/qr" element={<QRPage />} />
          <Route path="/stations" element={<Stations />} />
          <Route path="/stations/detail" element={<StationDetailPage />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}