import { ArrowLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { registrationApi } from '../../api/registration.api';

const categoryMap: Record<string, string> = {
  student: 'Học sinh, sinh viên',
  elderly: 'Người cao tuổi',
  revolution: 'Người có công',
  poor: 'Hộ nghèo / Cận nghèo',
};

const statusBadgeMap: Record<string, { label: string; className: string }> = {
  PENDING: { label: 'Đang chờ duyệt', className: 'bg-amber-50 border-amber-200 text-amber-600' },
  APPROVED: { label: 'Đã duyệt', className: 'bg-emerald-50 border-emerald-200 text-emerald-600' },
  REJECTED: { label: 'Từ chối', className: 'bg-red-50 border-red-200 text-red-600' },
};

type Registration = {
  id: string | number;
  status: string;
  full_name: string;
  category: string;
  created_at: string;
};

export default function RegistrationHistory() {
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await registrationApi.getHistory();
        if (res.data.success) {
          setRegistrations(res.data.data);
        }
      } catch (error) {
        console.error('Lỗi khi lấy lịch sử đăng ký:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className="min-h-screen bg-gray-200 flex justify-center">
      <div className="w-full max-w-md bg-gray-50 min-h-screen flex flex-col relative pb-28 shadow-xl">
        
        <div className="bg-white px-4 py-4 flex items-center gap-3 sticky top-0 z-10 border-b border-gray-100">
          <button 
            onClick={() => navigate(-1)} 
            className="p-1 -ml-1 hover:bg-gray-100 rounded-full transition"
          >
            <ArrowLeft size={22} className="text-gray-800" />
          </button>
          <h1 className="text-base font-bold text-gray-900">Danh sách đăng ký vé ưu tiên</h1>
        </div>

        <div className="px-4 mt-4 space-y-3">
          {loading ? (
            <div className="text-center text-gray-400 py-10 font-medium">Đang tải dữ liệu...</div>
          ) : registrations.length === 0 ? (
            <div className="text-center text-gray-400 py-10 font-medium">Bạn chưa có đơn đăng ký nào.</div>
          ) : (
            registrations.map((item) => {
              const badge = statusBadgeMap[item.status] || statusBadgeMap.PENDING;
              return (
                <div key={item.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <img 
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${item.full_name}`} 
                        alt="Avatar" 
                        className="w-11 h-11 rounded-full bg-gray-100 object-cover"
                      />
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{item.full_name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {categoryMap[item.category] || item.category}
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-gray-300" />
                  </div>

                  <div className="border-t border-gray-100 my-3"></div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-800 text-xs">Đăng ký ưu đãi</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {new Date(item.created_at).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <div className={`px-2.5 py-1 rounded-md border ${badge.className}`}>
                      <span className="text-xs font-bold">{badge.label}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

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