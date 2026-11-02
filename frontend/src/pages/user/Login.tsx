// src/pages/user/Login.tsx
import { TrainTrack, Phone, Lock, EyeOff, Eye } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/auth.api';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const res = await authApi.login({ phone, password });
      const responseData = res.data || res;
      
      // Mở rộng điều kiện check thành công, bắt chính xác thông điệp trả về
      const isSuccess = 
        responseData.success === true || 
        responseData.success === 'true' || 
        responseData.status === true || 
        responseData.status === 200 ||
        responseData.message === 'Đăng nhập thành công.';

      if (isSuccess) {
        // Lấy data thực sự đề phòng API bọc nhiều lớp
        const userData = responseData.data || responseData;

        localStorage.setItem('csrf_token', userData.csrf_token);
        localStorage.setItem('user', JSON.stringify(userData));

        // Fix luồng chuyển hướng Admin chuẩn với App.tsx
        if (userData.role === 'ADMIN') {
          localStorage.setItem('adminUser', JSON.stringify(userData));
          navigate('/admin/dashboard'); 
        } else {
          navigate('/');
        }
      } else {
        setErrorMsg(responseData.message || 'Đăng nhập thất bại.');
      }
    } catch (error: unknown) {
      const errorResponse = isRecord(error) && isRecord(error.response) ? error.response : undefined;
      const errorPayload = errorResponse && isRecord(errorResponse.data) ? errorResponse.data : undefined;
      const userData = errorPayload && isRecord(errorPayload.data) ? errorPayload.data : undefined;

      const isCatchSuccess = errorResponse?.status === 200 &&
        (errorPayload?.success === true || errorPayload?.status === true || errorPayload?.message === 'Đăng nhập thành công.');

      if (isCatchSuccess && userData && typeof userData.csrf_token === 'string') {
        localStorage.setItem('csrf_token', userData.csrf_token);
        localStorage.setItem('user', JSON.stringify(userData));
        if (userData.role === 'ADMIN') {
           localStorage.setItem('adminUser', JSON.stringify(userData));
           navigate('/admin/dashboard');
        } else {
           navigate('/');
        }
        return;
      }

      const msg = typeof errorPayload?.message === 'string'
        ? errorPayload.message
        : 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau.';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-200 flex justify-center items-center">
      <div className="w-full max-w-md min-h-screen bg-primary flex flex-col justify-center px-6 relative overflow-hidden shadow-2xl">
        
        {/* Đốm sáng nền */}
        <div className="absolute top-[-10%] right-[-20%] w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-20%] w-80 h-80 bg-blue-400/20 rounded-full blur-2xl"></div>

        {/* Logo & Tiêu đề */}
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
            {errorMsg && (
              <div className="bg-red-100 text-red-600 p-3 rounded-xl text-sm font-medium text-center">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="text-sm font-bold text-gray-700 block mb-2">Số điện thoại</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Phone size={20} className="text-gray-400" />
                </div>
                <input 
                  type="tel" 
                  placeholder="Nhập số điện thoại" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition font-medium"
                  required
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition font-medium"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-primary"
                >
                  {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className={`w-full text-white font-bold py-4 rounded-xl shadow-lg transition ${
                isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary shadow-blue-200 active:scale-95'
              }`}
            >
              {isLoading ? 'ĐANG XỬ LÝ...' : 'ĐĂNG NHẬP'}
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
    </div>
  );
}