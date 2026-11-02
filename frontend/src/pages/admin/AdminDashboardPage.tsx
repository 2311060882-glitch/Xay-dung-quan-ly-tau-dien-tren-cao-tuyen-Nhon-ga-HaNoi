import { useState, useEffect } from 'react';
import { Users, Ticket, Wallet, ShieldAlert, TrendingUp, Clock } from 'lucide-react';

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Giả lập API call lấy dữ liệu thống kê
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const stats = [
    { title: 'Tổng hành khách', value: '24,592', change: '+12%', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Doanh thu hôm nay', value: '18.5M ₫', change: '+5.2%', icon: Wallet, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Lượt đi trong ngày', value: '3,421', change: '-2%', icon: Ticket, color: 'text-amber-600', bg: 'bg-amber-50' },
    { title: 'Hồ sơ chờ duyệt', value: '156', change: 'Cần xử lý', icon: ShieldAlert, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  if (loading) {
    return <div className="flex h-full items-center justify-center text-gray-400">Đang tải dữ liệu tổng quan...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Tổng quan hệ thống</h2>
        <p className="text-sm text-gray-500 mt-1">Dữ liệu vận hành tuyến đường sắt đô thị theo thời gian thực.</p>
      </div>

      {/* Thẻ thống kê */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{stat.title}</p>
                <h3 className="text-2xl font-black text-gray-900">{stat.value}</h3>
                <p className={`text-xs font-medium mt-1 flex items-center gap-1 ${stat.change.includes('-') ? 'text-red-500' : stat.change.includes('Cần') ? 'text-rose-500' : 'text-emerald-500'}`}>
                  {stat.change.includes('Cần') ? <Clock size={12} /> : <TrendingUp size={12} />}
                  {stat.change}
                </p>
              </div>
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <Icon size={24} className={stat.color} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Khu vực Biểu đồ & Hoạt động gần đây */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[300px] flex items-center justify-center">
          <p className="text-gray-400 text-sm font-medium">Khu vực tích hợp biểu đồ Chart.js / Recharts</p>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-base font-bold text-gray-900 mb-4">Hoạt động gần đây</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Hành khách quét mã QR qua cổng Cát Linh</p>
                  <p className="text-xs text-gray-500 mt-0.5">Vài giây trước</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}