import { useState, useEffect } from 'react';
import { Ticket, Search, User, Clock, RefreshCw } from 'lucide-react';
import axiosInstance from '../../api/axios';

interface TicketData {
  id: number;
  qr_code?: string;
  purchase_price?: string | number;
  valid_from?: string;
  expires_at?: string;
  status?: string;
  fullname?: string;
  user_name?: string;
}

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/admin/tickets/listTickets.php');
      const resData = res.data;
      const list = Array.isArray(resData?.data) ? resData.data : Array.isArray(resData) ? resData : [];
      setTickets(list);
    } catch (err) {
      console.error("Lỗi lấy danh sách vé:", err);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initializePage = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get('/admin/tickets/listTickets.php');
        if (!isMounted) return;
        const resData = res.data;
        const list = Array.isArray(resData?.data) ? resData.data : Array.isArray(resData) ? resData : [];
        setTickets(list);
      } catch (err) {
        if (!isMounted) return;
        console.error('Lỗi lấy danh sách vé:', err);
        setTickets([]);
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

  const filteredTickets = tickets.filter(t => {
    const qr = t.qr_code || '';
    const name = t.fullname || t.user_name || '';
    const query = search.toLowerCase();
    return qr.toLowerCase().includes(query) || name.toLowerCase().includes(query);
  });

  return (
    <div className="h-full flex flex-col font-sans">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quản lý Vé Tàu</h2>
          <p className="text-sm text-gray-500 mt-1">Theo dõi vé phát hành, trạng thái và hạn sử dụng.</p>
        </div>
        <button 
          onClick={fetchTickets}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Làm mới
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center">
          <div className="relative max-w-md w-full">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Tìm theo mã QR hoặc tên khách hàng..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="p-10 text-center text-gray-400 font-medium text-sm">Đang tải dữ liệu vé...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-white sticky top-0 shadow-sm z-10">
                <tr className="text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-200">
                  <th className="p-4">Mã Vé (QR)</th>
                  <th className="p-4">Khách hàng</th>
                  <th className="p-4">Giá bán</th>
                  <th className="p-4">Thời hạn</th>
                  <th className="p-4">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTickets.map(ticket => (
                  <tr key={ticket.id} className="hover:bg-gray-50/50 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-2 font-mono text-xs font-bold text-gray-800">
                        <Ticket size={16} className="text-blue-600 shrink-0"/>
                        <span title={ticket.qr_code}>
                          {ticket.qr_code ? `${ticket.qr_code.substring(0, 12)}...` : `TK${String(ticket.id).padStart(6, '0')}`}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                        <User size={16} className="text-gray-400"/>
                        {ticket.fullname || ticket.user_name || 'Khách vãng lai'}
                      </div>
                    </td>
                    <td className="p-4 text-sm font-black text-emerald-600">
                      {ticket.purchase_price ? `${Number(ticket.purchase_price).toLocaleString('vi-VN')} đ` : '0 đ'}
                    </td>
                    <td className="p-4 text-xs text-gray-500 space-y-0.5">
                      <p className="flex items-center gap-1">
                        <Clock size={12} className="text-gray-400"/>
                        Từ: {ticket.valid_from ? new Date(ticket.valid_from).toLocaleDateString('vi-VN') : '---'}
                      </p>
                      <p className="flex items-center gap-1 text-red-500">
                        <Clock size={12}/>
                        Đến: {ticket.expires_at ? new Date(ticket.expires_at).toLocaleDateString('vi-VN') : '---'}
                      </p>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full ${
                        ticket.status === 'USED' 
                          ? 'bg-gray-100 text-gray-500' 
                          : ticket.status === 'EXPIRED'
                          ? 'bg-red-50 text-red-600'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {ticket.status || 'ACTIVE'}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredTickets.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-10 text-center text-gray-400 text-sm">
                      Không tìm thấy lịch sử vé nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}