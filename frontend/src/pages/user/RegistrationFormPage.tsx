import { useState } from 'react';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { registrationApi } from '../../api/registration.api';

export default function RegistrationFormPage() {
  const navigate = useNavigate();
  
  const [isForOther, setIsForOther] = useState(false);
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [idCard, setIdCard] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const res = await registrationApi.submit({
        is_for_other: isForOther,
        full_name: fullName,
        dob,
        id_card: idCard,
        phone,
        email,
        category,
      });

      if (res.data.success) {
        alert('Đã gửi đơn đăng ký ưu tiên thành công!');
        navigate('/registration/history');
      } else {
        setErrorMsg(res.data.message || 'Gửi thất bại.');
      }
    } catch (error: unknown) {
      const message =
        typeof error === 'object' && error !== null && 'response' in error
          ? (error as { response?: { data?: { message?: unknown } } }).response?.data?.message
          : undefined;

      if (typeof message === 'string') {
        setErrorMsg(message);
      } else {
        setErrorMsg('Không thể kết nối đến máy chủ.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative pb-28">
      <div className="bg-white px-4 py-4 flex items-center gap-3 sticky top-0 z-10 shadow-sm">
        <button 
          onClick={() => navigate(-1)} 
          className="p-1 -ml-1 hover:bg-gray-100 rounded-full transition"
        >
          <ArrowLeft size={24} className="text-gray-800" />
        </button>
        <h1 className="text-[17px] font-bold text-gray-900">Đăng ký đối tượng miễn phí</h1>
      </div>

      <form onSubmit={handleSubmit} className="px-4 pt-4 flex-1 space-y-4">
        {errorMsg && (
          <div className="bg-red-100 text-red-600 p-3 rounded-xl text-sm font-medium text-center">
            {errorMsg}
          </div>
        )}

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
          <span className="font-bold text-gray-800 text-[15px]">Đăng ký hộ người khác</span>
          <button
            type="button"
            onClick={() => setIsForOther(!isForOther)}
            className={`w-12 h-7 flex items-center rounded-full p-1 transition-colors duration-300 ${
              isForOther ? 'bg-blue-600 justify-end' : 'bg-gray-300 justify-start'
            }`}
          >
            <div className="bg-white w-5 h-5 rounded-full shadow-md"></div>
          </button>
        </div>

        <div className="space-y-3">
          <h2 className="text-[15px] font-bold text-gray-800 px-1">Thông tin cá nhân</h2>
          
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Họ tên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Nhập họ và tên"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-3 text-sm text-gray-800 font-medium focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Ngày sinh <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-3 text-sm text-gray-800 font-medium focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Số thẻ CCCD/Mã định danh <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Nhập số CCCD"
                value={idCard}
                onChange={(e) => setIdCard(e.target.value)}
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-3 text-sm text-gray-800 font-medium focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                placeholder="Nhập số điện thoại"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-3 text-sm text-gray-800 font-medium focus:outline-none focus:border-blue-500 transition placeholder:text-gray-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="Nhập email (nếu có)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-3 text-sm text-gray-800 font-medium focus:outline-none focus:border-blue-500 transition"
              />
            </div>
          </div>
        </div>

        <div className="space-y-3 pb-6">
          <h2 className="text-[15px] font-bold text-gray-800 px-1">Thông tin xác nhận đối tượng</h2>
          
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Đối tượng <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-3 text-sm text-gray-800 font-medium appearance-none focus:outline-none focus:border-blue-500 transition pr-10"
                >
                  <option value="" disabled>Chọn đối tượng ưu tiên</option>
                  <option value="student">Học sinh, sinh viên</option>
                  <option value="elderly">Người cao tuổi (trên 60 tuổi)</option>
                  <option value="revolution">Người có công với cách mạng</option>
                  <option value="poor">Hộ nghèo / Cận nghèo</option>
                </select>
                <ChevronDown size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-10">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full text-white font-bold py-3.5 rounded-xl shadow-lg transition active:scale-[0.98] ${
              isLoading ? 'bg-gray-400' : 'bg-[#1a66ff] hover:bg-blue-700'
            }`}
          >
            {isLoading ? 'ĐANG GỬI...' : 'Gửi đăng ký'}
          </button>
        </div>
      </form>
    </div>
  );
}