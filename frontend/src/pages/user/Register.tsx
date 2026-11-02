import { TrainTrack, Phone, Lock, User, EyeOff, Eye } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/auth.api';

export default function Register() {
  const navigate = useNavigate();
  
  const [fullname, setFullname] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (password !== confirmPassword) {
      setErrorMsg('Mật khẩu nhập lại không khớp!');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authApi.register({ fullname, phone, password });
      
      // Kiểm tra phản hồi thành công linh hoạt theo chuẩn API
      const resData = res.data;
      const isSuccess = 
        resData?.success === true || 
        resData?.status === true || 
        resData?.status === 200 || 
        resData?.status === 201;

      if (isSuccess) {
        alert('Đăng ký thành công! Vui lòng đăng nhập.');
        navigate('/login');
      } else {
        setErrorMsg(resData?.message || 'Đăng ký thất bại.');
      }
    } catch (error: unknown) {
      const apiError = error as {
        response?: {
          data?: {
            message?: string;
          };
        };
      };

      if (apiError.response?.data?.message) {
        setErrorMsg(apiError.response.data.message);
      } else {
        setErrorMsg('Không thể kết nối đến máy chủ.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-200 flex justify-center items-center">
      <div className="w-full max-w-md min-h-screen bg-primary flex flex-col justify-center px-6 relative overflow-hidden shadow-2xl py-8">
        
        {/* Đốm sáng trang trí */}
        <div className="absolute top-[-10%] right-[-20%] w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-20%] w-80 h-80 bg-blue-400/20 rounded-full blur-2xl"></div>

        {/* Logo & Tiêu đề */}
        <div className="flex flex-col items-center mb-6 z-10">
          <div className="bg-white p-3.5 rounded-full mb-3 shadow-lg shadow-blue-900/50">
            <TrainTrack size={36} className="text-primary" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-wider">ĐĂNG KÝ</h1>
          <p className="text-blue-200 text-sm mt-0.5">Gia nhập cộng đồng Hanoi Metro</p>
        </div>

        {/* Form Đăng ký */}
        <div className="bg-white rounded-3xl p-6 shadow-2xl z-10">
          <form onSubmit={handleRegister} className="space-y-3.5">
            {errorMsg && (
              <div className="bg-red-100 text-red-600 p-2.5 rounded-xl text-xs font-medium text-center">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Họ và tên</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User size={18} className="text-gray-400" />
                </div>
                <input 
                  type="text" 
                  placeholder="Nhập họ và tên" 
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition text-sm font-medium"
                  required
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
                  placeholder="Nhập số điện thoại" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition text-sm font-medium"
                  required
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
                  placeholder="Tạo mật khẩu" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition text-sm font-medium"
                  required
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

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Nhập lại mật khẩu</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400" />
                </div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Xác nhận mật khẩu" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition text-sm font-medium"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className={`w-full text-white font-bold py-3.5 rounded-xl shadow-lg mt-2 transition text-sm ${
                isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary shadow-blue-200 active:scale-95'
              }`}
            >
              {isLoading ? 'ĐANG ĐĂNG KÝ...' : 'ĐĂNG KÝ NGAY'}
            </button>
          </form>

          <div className="mt-4 text-center text-xs text-gray-600">
            Đã có tài khoản?{' '}
            <span onClick={() => navigate('/login')} className="text-primary font-bold cursor-pointer hover:underline">
              Đăng nhập
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}