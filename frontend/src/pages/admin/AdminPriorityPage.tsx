import { useState, useEffect } from 'react';
import { adminApi } from '../../api/admin.api';
import { CheckCircle, XCircle, Clock, ShieldAlert, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PriorityApplication {
  id: number;
  user_name: string;
  phone: string;
  priority_type: string;
  document_url: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  created_at: string;
}

export default function AdminPriorityPage() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<PriorityApplication[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getAllRegistrations();
      if (res.data?.data) {
        setApplications(res.data.data);
      }
    } catch (error) {
      console.error('Lỗi tải danh sách:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initializePage = async () => {
      try {
        setLoading(true);
        const res = await adminApi.getAllRegistrations();
        if (!isMounted) return;
        if (res.data?.data) {
          setApplications(res.data.data);
        }
      } catch (error) {
        console.error('Lỗi tải danh sách:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void initializePage();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleAction = async (id: number, status: 'APPROVED' | 'REJECTED') => {
    if (!window.confirm(`Xác nhận ${status === 'APPROVED' ? 'Duyệt' : 'Từ chối'} hồ sơ này?`)) return;
    
    try {
      await adminApi.updateRegistrationStatus(id, status, status === 'REJECTED' ? 'Giấy tờ không hợp lệ' : '');
      alert('Cập nhật trạng thái thành công!');
      await fetchApplications(); // Refresh lại danh sách
    } catch {
      alert('Có lỗi xảy ra, vui lòng thử lại.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold"><Clock size={14}/> Chờ duyệt</span>;
      case 'APPROVED':
        return <span className="flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold"><CheckCircle size={14}/> Đã duyệt</span>;
      case 'REJECTED':
        return <span className="flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold"><XCircle size={14}/> Từ chối</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center gap-4">
          <button onClick={() => navigate('/admin/dashboard')} className="p-2 hover:bg-gray-100 rounded-full cursor-pointer">
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          <div className="bg-amber-500 p-2.5 rounded-xl text-white shadow-md">
            <ShieldAlert size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight">Duyệt Hồ Sơ Ưu Tiên</h1>
            <p className="text-xs text-gray-500 mt-0.5">Quản lý và xét duyệt giấy tờ ưu tiên của hành khách</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 w-full flex-1">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-gray-500">Đang tải dữ liệu...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase">
                  <th className="p-4 font-bold">Khách hàng</th>
                  <th className="p-4 font-bold">Loại ưu tiên</th>
                  <th className="p-4 font-bold">Ngày gửi</th>
                  <th className="p-4 font-bold">Trạng thái</th>
                  <th className="p-4 font-bold text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                    <td className="p-4">
                      <p className="font-bold text-gray-900">{app.user_name}</p>
                      <p className="text-xs text-gray-500">{app.phone}</p>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-md">
                        {app.priority_type}
                      </span>
                      <a href={app.document_url} target="_blank" rel="noreferrer" className="block text-[11px] text-blue-500 underline mt-1">
                        Xem giấy tờ đính kèm
                      </a>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {new Date(app.created_at).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="p-4">
                      {getStatusBadge(app.status)}
                    </td>
                    <td className="p-4 text-center">
                      {app.status === 'PENDING' && (
                        <div className="flex justify-center gap-2">
                          <button onClick={() => handleAction(app.id, 'APPROVED')} className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 cursor-pointer">
                            Duyệt
                          </button>
                          <button onClick={() => handleAction(app.id, 'REJECTED')} className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-bold rounded-lg hover:bg-red-100 cursor-pointer">
                            Từ chối
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}