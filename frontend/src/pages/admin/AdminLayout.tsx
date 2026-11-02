import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Ticket, QrCode, TrainTrack, 
  BarChart3, ShieldAlert, LogOut 
} from 'lucide-react';
import { authApi } from '../../api/auth.api';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      console.warn('Logout request failed, continuing with local cleanup.');
    } finally {
      localStorage.clear();
      navigate('/admin/login');
    }
  };

  const navItems = [
    { name: 'Bảng điều khiển', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Duyệt hồ sơ', path: '/admin/priority-applications', icon: ShieldAlert },
    { name: 'Cổng quét QR', path: '/admin/scan-qr', icon: QrCode },
    { name: 'Quản lý chuyến', path: '/admin/trips', icon: TrainTrack },
    { name: 'Quản lý vé', path: '/admin/tickets', icon: Ticket },
    { name: 'Khách hàng', path: '/admin/users', icon: Users },
    { name: 'Báo cáo', path: '/admin/reports', icon: BarChart3 },
  ];

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      {/* Sidebar cố định */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col z-20 shadow-sm">
        <div className="h-20 flex items-center px-6 border-b border-gray-100 cursor-pointer" onClick={() => navigate('/admin/dashboard')}>
          <div className="bg-blue-600 p-2 rounded-xl text-white mr-3">
            <TrainTrack size={20} />
          </div>
          <div>
            <h1 className="font-black text-gray-900 leading-none">HANOI METRO</h1>
            <span className="text-[10px] font-bold text-blue-600 uppercase">Admin Portal</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          <p className="px-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Danh mục chính</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.includes(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-blue-600' : 'text-gray-400'} />
                {item.name}
              </button>
            );
          })}
        </div>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700">
              A
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-gray-900 truncate">Quản trị viên</p>
              <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Trực tuyến
              </p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl text-sm font-bold transition"
          >
            <LogOut size={16} /> Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content Area: Vùng hiển thị các màn hình khác */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-gray-50 relative">
        <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
          <div className="max-w-6xl mx-auto w-full">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}