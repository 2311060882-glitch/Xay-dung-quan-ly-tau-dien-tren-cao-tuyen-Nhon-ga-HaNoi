// src/pages/RegistrationForm.tsx
import { useState } from 'react';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function RegistrationForm() {
  const navigate = useNavigate();
  
  // States quản lý form
  const [isForOther, setIsForOther] = useState(false);
  const [fullName, setFullName] = useState('Trịnh Minh Hoàng');
  const [dob, setDob] = useState('2005-10-30');
  const [idCard, setIdCard] = useState('022205004449');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('hoangffffp@gmail.com');
  const [category, setCategory] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Đã gửi đơn đăng ký thành công!');
    navigate('/registration/history');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative pb-28">
      {/* Header */}
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
        {/* Card Toggle: Đăng ký hộ người khác */}
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

        {/* Khối: Thông tin cá nhân */}
        <div className="space-y-3">
          <h2 className="text-[15px] font-bold text-gray-800 px-1">Thông tin cá nhân</h2>
          
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-4">
            {/* Họ tên */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Họ tên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-3 text-sm text-gray-800 font-medium focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            {/* Ngày sinh */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Ngày sinh <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-3 text-sm text-gray-800 font-medium focus:outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>

            {/* Số CCCD / Mã định danh */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Số thẻ CCCD/Mã định danh <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={idCard}
                onChange={(e) => setIdCard(e.target.value)}
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-3 text-sm text-gray-800 font-medium focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            {/* Số điện thoại */}
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

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-3 text-sm text-gray-800 font-medium focus:outline-none focus:border-blue-500 transition"
              />
            </div>
          </div>
        </div>

        {/* Khối: Thông tin xác nhận đối tượng */}
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

        {/* Nút gửi đăng ký cố định ở đáy */}
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-10">
          <button
            type="submit"
            className="w-full bg-[#1a66ff] hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg transition active:scale-[0.98]"
          >
            Gửi đăng ký
          </button>
        </div>
      </form>
    </div>
  );
}