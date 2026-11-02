import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrainTrack, ShieldCheck, KeyRound, Loader2 } from 'lucide-react';
import { authApi } from '../../api/auth.api';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await authApi.login({ phone, password }); 
      if (res.data.user.role === 'ADMIN') {
        localStorage.setItem('adminToken', res.data.token);
        localStorage.setItem('adminUser', JSON.stringify(res.data.user));
        navigate('/admin/dashboard');
      } else {
        setError('Truy cập bị từ chối. Tài khoản không có đặc quyền quản trị.');
      }
    } catch {
      setError('Thông tin đăng nhập không chính xác hoặc tài khoản đã bị khóa.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans p-4">
      <div className="w-full max-w-4xl bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-gray-100">
        
        {/* Nửa bên trái: Nhận diện thương hiệu */}
        <div className="md:w-5/12 bg-blue-600 p-10 flex flex-col justify-between text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-50 -mr-20 -mt-20"></div>
          
          <div className="relative z-10 flex items-center gap-3">
            <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm">
              <TrainTrack size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight">HANOI METRO</h1>
              <p className="text-[10px] font-medium tracking-widest opacity-80 uppercase">Hệ thống vận hành</p>
            </div>
          </div>

          <div className="relative z-10 mt-16 mb-8">
            <h2 className="text-3xl font-bold mb-4 leading-tight">Cổng Quản Trị<br/>Nội Bộ</h2>
            <p className="text-blue-100 text-sm font-medium leading-relaxed">
              Môi trường làm việc an toàn dành riêng cho nhân viên và ban quản lý vận hành đường sắt đô thị Hà Nội.
            </p>
          </div>
          
          <div className="relative z-10 text-xs text-blue-200 font-medium">
            &copy; 2026 Hanoi Metro Co., Ltd
          </div>
        </div>

        {/* Nửa bên phải: Form đăng nhập */}
        <div className="md:w-7/12 p-10 md:p-14 bg-white flex flex-col justify-center">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold mb-4 border border-amber-200">
              <ShieldCheck size={14} /> Chế độ bảo mật cao
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Đăng nhập tài khoản</h3>
            <p className="text-gray-500 text-sm mt-1">Vui lòng nhập thông tin định danh được cấp phát.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-medium rounded-r-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Số điện thoại nhân sự</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 px-4 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm font-medium"
                  placeholder="Nhập số điện thoại..."
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Mật khẩu truy cập</label>
              <div className="relative">
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 px-4 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm font-medium"
                  placeholder="••••••••"
                  required
                />
                <KeyRound size={18} className="absolute right-4 top-3.5 text-gray-400" />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white p-3.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-500/30 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {loading ? <><Loader2 size={18} className="animate-spin" /> Đang xác thực...</> : 'Truy cập hệ thống'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}