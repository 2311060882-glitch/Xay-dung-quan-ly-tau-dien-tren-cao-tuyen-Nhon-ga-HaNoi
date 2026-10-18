// src/pages/Register.tsx
import { TrainTrack, User, Phone, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullname: '',
    phone: '',
    password: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic gọi API đăng ký sẽ được nối ở phần sau
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-primary flex flex-col justify-center px-6 relative overflow-hidden py-10">
      {/* Nút quay lại */}
      <button 
        onClick={() => navigate('/login')}
        className="absolute top-6 left-6 text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition z-20"
      >
        <ArrowLeft size={24} />
      </button>

      {/* Vòng tròn trang trí */}
      <div className="absolute top-[-10%] right-[-20%] w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>

      {/* Header Logo */}
      <div className="flex flex-col items-center mb-8 z-10 mt-6">
        <div className="bg-white p-3 rounded-full mb-3 shadow-lg">
          <TrainTrack size={36} className="text-primary" />
        </div>
        <h1 className="text-2xl font-black text-white tracking-wider">ĐĂNG KÝ TÀI KHOẢN</h1>
        <p className="text-blue-200 text-sm mt-1">Tạo tài khoản đi tàu Hà Nội Metro</p>
      </div>

      {/* Form Đăng ký */}
      <div className="bg-white rounded-3xl p-6 shadow-2xl z-10">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Họ và tên</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <User size={18} className="text-gray-400" />
              </div>
              <input 
                type="text"
                required
                placeholder="Nguyễn Văn A" 
                value={formData.fullname}
                onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-medium"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Số điện thoại</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Phone size={18} className="text-gray-400" />
              </div>
              <input 
                type="tel"
                required
                placeholder="0987654321" 
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-medium"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Mật khẩu</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock size={18} className="text-gray-400" />
              </div>
              <input 
                type={showPassword ? "text" : "password"}
                required
                placeholder="Tối thiểu 6 ký tự" 
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-medium"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-primary"
              >
                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-primary text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-200 active:scale-95 transition text-sm mt-2"
          >
            ĐĂNG KÝ TÀI KHOẢN
          </button>
        </form>

        <div className="mt-5 text-center text-xs text-gray-600">
          Đã có tài khoản?{' '}
          <span onClick={() => navigate('/login')} className="text-primary font-bold cursor-pointer hover:underline">
            Đăng nhập
          </span>
        </div>
      </div>
    </div>
  );
}