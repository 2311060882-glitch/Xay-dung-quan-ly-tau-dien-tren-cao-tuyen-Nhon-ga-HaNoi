// src/components/BottomNav.tsx
import { type ReactNode } from 'react';
import { Home, Ticket, Map, User, QrCode } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface NavItemType {
  path: string;
  icon: ReactNode;
  label: string;
}

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

const navItems: NavItemType[] = [
 { path: '/', icon: <Home size={24} />, label: 'Trang chủ' },
 { path: '/tickets', icon: <Ticket size={24} />, label: 'Vé của tôi' },
 { path: '/stations', icon: <Map size={24} />, label: 'Tìm ga' },
 { path: '/profile', icon: <User size={24} />, label: 'Cá nhân' },
];

  return (
    <div className="fixed bottom-0 w-full max-w-md bg-white border-t border-gray-100 flex justify-between items-center px-6 py-2 z-50 shadow-[0_-4px_15px_rgba(0,0,0,0.05)] pb-safe">
      
      {/* 2 Nút bên trái */}
      <div className="flex gap-8">
        {navItems.slice(0, 2).map((item) => (
          <button 
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center p-2 transition-colors ${location.pathname === item.path ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}
          >
            {item.icon}
            <span className="text-[10px] mt-1 font-medium">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Nút QR khổng lồ nổi ở giữa */}
      <button 
        onClick={() => navigate('/qr')}
        className="absolute left-1/2 -translate-x-1/2 -top-6 bg-primary text-white p-4 rounded-full shadow-lg shadow-blue-400/50 border-4 border-white active:scale-95 transition-transform"
      >
        <QrCode size={32} />
      </button>

      {/* 2 Nút bên phải */}
      <div className="flex gap-8">
        {navItems.slice(2, 4).map((item) => (
          <button 
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center p-2 transition-colors ${location.pathname === item.path ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}
          >
            {item.icon}
            <span className="text-[10px] mt-1 font-medium">{item.label}</span>
          </button>
        ))}
      </div>
      
    </div>
  );
}