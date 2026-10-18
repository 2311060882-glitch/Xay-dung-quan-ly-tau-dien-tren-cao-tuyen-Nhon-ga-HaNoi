// src/pages/Login.tsx
import { TrainTrack, Phone, Lock, EyeOff, Eye } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  // Hàm xử lý đăng nhập tạm thời chuyển thẳng vào trang chủ
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-primary flex flex-col justify-center px-6 relative overflow-hidden">
      {/* Vòng tròn trang trí nền */}
      <div className="absolute top-[-10%] right-[-20%] w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] left-[-20%] w-80 h-80 bg-blue-400/20 rounded-full blur-2xl"></div>

      {/* Logo */}
      <div className="flex flex-col items-center mb-10 z-10">
        <div className="bg-white p-4 rounded-full mb-4 shadow-lg shadow-blue-900/50">
          <TrainTrack size={40} className="text-primary" />
        </div>
        <h1 className="text-3xl font-black text-white tracking-wider">HANOI METRO</h1>
        <p className="text-blue-200 mt-1">Đăng nhập để bắt đầu hành trình</p>
      </div>

      {/* Form Đăng nhập */}
      <div className="bg-white rounded-3xl p-6 shadow-2xl z-10">
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="text-sm font-bold text-gray-700 block mb-2">Số điện thoại</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Phone size={20} className="text-gray-400" />
              </div>
              <input 
                type="tel" 
                placeholder="Nhập số điện thoại" 
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition font-medium"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-gray-700 block mb-2">Mật khẩu</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock size={20} className="text-gray-400" />
              </div>
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Nhập mật khẩu" 
                className="w-full pl-11 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition font-medium"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-primary"
              >
                {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
            </div>
            <div className="flex justify-end mt-2">
              <a href="#" className="text-sm text-primary font-medium hover:underline">Quên mật khẩu?</a>
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 active:scale-95 transition"
          >
            ĐĂNG NHẬP
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Chưa có tài khoản?{' '}
          <span onClick={() => navigate('/register')} className="text-primary font-bold cursor-pointer hover:underline">
            Đăng ký ngay
          </span>
        </div>
      </div>
    </div>
  );
}