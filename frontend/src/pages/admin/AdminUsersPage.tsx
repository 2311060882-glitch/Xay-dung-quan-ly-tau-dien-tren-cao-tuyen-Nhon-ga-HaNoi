import { useState, useEffect } from 'react';
import { Search, UserCircle, Wallet, Calendar } from 'lucide-react';
import axiosInstance from '../../api/axios'; // Dùng axiosInstance để gọi API thực

interface User {
  id: number;
  fullname: string;
  phone: string;
  wallet_balance: string;
  created_at: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    // Gọi API thực tế từ Backend. Sửa đường dẫn nếu backend của bro cấu trúc khác.
    axiosInstance.get('/admin/users.php') // Giả sử bro có endpoint này
      .then(res => {
        setUsers(res.data.data || []);
      })
      .catch(err => console.error("Lỗi lấy danh sách khách hàng:", err))
      .finally(() => setLoading(false));
  }, []);

  const filteredUsers = users.filter(u => 
    u.fullname.toLowerCase().includes(search.toLowerCase()) || 
    u.phone.includes(search)
  );

  return (
    <div className="h-full flex flex-col font-sans">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Quản lý Khách hàng</h2>
        <p className="text-sm text-gray-500 mt-1">Danh sách tài khoản, số dư ví và định danh.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center">
          <div className="relative max-w-md w-full">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Tìm theo tên hoặc SĐT..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="p-10 text-center text-gray-500">Đang tải dữ liệu...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-white sticky top-0 shadow-sm">
                <tr className="text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-200">
                  <th className="p-4">Khách hàng</th>
                  <th className="p-4">Số dư ví (VNĐ)</th>
                  <th className="p-4">Ngày đăng ký</th>
                  <th className="p-4">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <UserCircle size={32} className="text-gray-300" />
                        <div>
                          <p className="font-bold text-gray-900">{user.fullname}</p>
                          <p className="text-xs text-gray-500">{user.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 font-bold text-emerald-600">
                        <Wallet size={16} />
                        {Number(user.wallet_balance).toLocaleString('vi-VN')} đ
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600 flex items-center gap-2">
                       <Calendar size={14} className="text-gray-400"/>
                       {new Date(user.created_at).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="p-4">
                      <button className="text-blue-600 text-xs font-bold hover:underline">Chi tiết</button>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr><td colSpan={4} className="p-6 text-center text-gray-400">Không tìm thấy khách hàng.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}