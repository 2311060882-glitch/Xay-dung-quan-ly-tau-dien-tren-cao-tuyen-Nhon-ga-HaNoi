// src/pages/RegistrationHistory.tsx
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function RegistrationHistory() {
  const navigate = useNavigate();

  return (
    // Bọc khung căn giữa máy tính
    <div className="min-h-screen bg-gray-200 flex justify-center">
      <div className="w-full max-w-md bg-gray-50 min-h-screen flex flex-col relative pb-28 shadow-xl">
        
        {/* Header App Mobile */}
        <div className="bg-white px-4 py-4 flex items-center gap-3 sticky top-0 z-10 border-b border-gray-100">
          <button 
            onClick={() => navigate(-1)} 
            className="p-1 -ml-1 hover:bg-gray-100 rounded-full transition"
          >
            <ArrowLeft size={22} className="text-gray-800" />
          </button>
          <h1 className="text-base font-bold text-gray-900">Danh sách đăng ký vé ưu tiên</h1>
        </div>

        {/* Thẻ trạng thái đơn đăng ký */}
        <div className="px-4 mt-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            {/* Dòng 1: Avatar + Tên + Đối tượng */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <img 
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Hoang" 
                  alt="Avatar" 
                  className="w-11 h-11 rounded-full bg-gray-100 object-cover"
                />
                <div>
                  <p className="font-bold text-gray-900 text-sm">Trịnh Minh Hoàng</p>
                  <p className="text-xs text-gray-400 mt-0.5">Học sinh sinh viên</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-300" />
            </div>

            <div className="border-t border-gray-100 my-3"></div>

            {/* Dòng 2: Ngày & Trạng thái duyệt */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-800 text-xs">Đăng ký ưu đãi</p>
                <p className="text-[11px] text-gray-400 mt-0.5">30/09/2026</p>
              </div>
              <div className="px-2.5 py-1 bg-emerald-50 rounded-md border border-emerald-200">
                <span className="text-xs font-bold text-emerald-600">Đã duyệt</span>
              </div>
            </div>
          </div>
        </div>

        {/* Nút gửi đơn mới nằm đúng vị trí nút bấm mobile */}
        <div className="fixed bottom-6 w-full max-w-md px-4 left-1/2 -translate-x-1/2 z-10">
          <button 
            onClick={() => navigate('/registration/new')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-md transition active:scale-[0.98] text-sm"
          >
            Gửi đơn đăng ký mới
          </button>
        </div>

      </div>
    </div>
  );
}