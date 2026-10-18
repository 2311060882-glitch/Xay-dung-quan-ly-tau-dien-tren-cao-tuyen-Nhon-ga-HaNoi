// src/pages/user/ProfilePage.tsx
import { useNavigate } from 'react-router-dom';
import { Users, UserCheck, QrCode, Shield, Headphones, Wallet } from 'lucide-react';
import { MenuItem } from '../../components/ui/MenuItem';

export default function Profile() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 pb-24 px-4 pt-6">
      
      {/* Header Profile */}
      <div className="flex items-center gap-4 mb-6 px-1">
        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0">
          <img 
            src="https://ui-avatars.com/api/?name=Hoang&background=random" 
            alt="Trịnh Minh Hoàng" 
            className="w-full h-full object-cover" 
          />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800">Trịnh Minh Hoàng</h1>
          <p className="text-sm text-gray-400 font-medium">********449</p>
        </div>
      </div>

      {/* Khối Phương thức thanh toán */}
      <div className="mb-5">
        <div className="flex justify-between items-center mb-2 px-1">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Phương thức thanh toán</h2>
          <button className="text-xs text-primary font-bold">Xem tất cả</button>
        </div>
        
        {/* NÚT VÍ THANH TOÁN - CHUYỂN HƯỚNG */}
        <div 
          onClick={() => navigate('/wallet')} 
          className="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between border border-gray-100 cursor-pointer hover:bg-gray-50 transition"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-primary rounded-xl">
              <Wallet size={22} />
            </div>
            <div>
              <p className="font-bold text-gray-800 text-sm">Ví thanh toán</p>
              <p className="text-xs text-amber-600 font-medium">Chưa liên kết ngân hàng</p>
            </div>
          </div>
        </div>
      </div>

      {/* Khối Tiện ích */}
      <div className="mb-6">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-1">Tiện ích</h2>
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 divide-y divide-gray-50">
          
          <div 
            onClick={() => navigate('/registration/history')} 
            className="cursor-pointer hover:bg-gray-50 transition"
          >
            <MenuItem 
              icon={<Users size={22} className="text-primary" />} 
              title="Quản lý đăng ký vé ưu tiên" 
              subtitle="Theo dõi và quản lý các đơn đăng ký" 
            />
          </div>

          <MenuItem 
            icon={<UserCheck size={22} />} 
            title="Định danh hộ" 
            subtitle="Hỗ trợ định danh cho người khác" 
          />
          <MenuItem 
            icon={<QrCode size={22} />} 
            title="Đăng nhập thiết bị nhân viên" 
            subtitle="Quét mã đăng nhập trên PC" 
          />
          <MenuItem 
            icon={<Shield size={22} />} 
            title="Cài đặt bảo mật" 
            subtitle="Bảo vệ an toàn cho tài khoản" 
          />
          <MenuItem 
            icon={<Headphones size={22} />} 
            title="Trợ giúp" 
            subtitle="Liên hệ với chúng tôi để được hỗ trợ" 
          />
        </div>
      </div>

      {/* Nút Gỡ định danh */}
      <div className="text-center mt-8">
        <button className="text-red-500 font-bold text-sm hover:underline">
          Gỡ định danh trên thiết bị này
        </button>
      </div>
    </div>
  );
}