// src/App.tsx
import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TrainTrack } from 'lucide-react';

import MobileLayout from './templates/MobileLayout';
import Home from './pages/user/Home';
import Tickets from './pages/user/TicketsPage';
import Stations from './pages/user/Stations';
import QRPage from './pages/user/ActiveQRPage';
import Profile from './pages/user/ProfilePage'; // Sửa lỗi dư dấu / ở đây
import Login from './pages/user/Login';
import Register from './pages/user/Register';
import RegistrationHistory from './pages/user/PriorityRegistrationsPage';
import RegistrationForm from './pages/user/PriorityRegisterPage';
import WalletPage from './pages/user/WalletPage';
import BuyTicketPage from './pages/user/BuyTicketPage';

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
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Sửa lại Path cho giống với các link navigate đang dùng */}
        <Route path="/registration/history" element={<RegistrationHistory />} />
        <Route path="/registration/new" element={<RegistrationForm />} />
        <Route path="/registrations/new" element={<RegistrationForm />} /> {/* Backup path */}
        
        <Route path="/tickets/buy" element={<BuyTicketPage />} />
        <Route path="/wallet" element={<WalletPage />} />
        
        <Route element={<MobileLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/tickets" element={<Tickets />} />
          <Route path="/qr" element={<QRPage />} />
          <Route path="/stations" element={<Stations />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}