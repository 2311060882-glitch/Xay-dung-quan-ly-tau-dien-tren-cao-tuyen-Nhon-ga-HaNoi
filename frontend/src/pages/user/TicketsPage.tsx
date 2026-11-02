import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { History, RefreshCw, QrCode } from 'lucide-react';
import { ticketApi } from '../../api/ticket.api';

interface TicketItem {
  id: number;
  line_name?: string;
  ticket_type_name?: string;
  expires_at?: string;
  is_for_relative?: boolean;
  relative_name?: string;
}

export default function TicketsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'my_tickets' | 'bought_for_others'>('my_tickets');
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = () => {
    setLoading(true);
    ticketApi.getMyTickets()
      .then(res => setTickets(res.data.data || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let isActive = true;
    ticketApi.getMyTickets()
      .then(res => {
        if (isActive) setTickets(res.data.data || []);
      })
      .catch(err => console.error(err))
      .finally(() => {
        if (isActive) setLoading(false);
      });
    return () => { isActive = false; };
  }, []);

  const filteredTickets = tickets.filter(t => 
    activeTab === 'my_tickets' ? !t.is_for_relative : t.is_for_relative
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-24 max-w-md mx-auto shadow-lg relative">
      {/* Header & Nút Lịch sử góc phải */}
      <div className="bg-primary pt-8 pb-6 px-4 text-white rounded-b-[28px] flex justify-between items-center">
        <h1 className="text-xl font-bold">Thẻ vé của tôi</h1>
        <button 
          onClick={() => navigate('/journeys')}
          className="flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-white/30 transition"
        >
          <History size={14} /> Lịch sử
        </button>
      </div>

      {/* 2 Sub-Tabs: Vé của tôi / Vé mua hộ */}
      <div className="px-4 mt-4">
        <div className="bg-gray-200/70 p-1 rounded-xl flex gap-1">
          <button 
            onClick={() => setActiveTab('my_tickets')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
              activeTab === 'my_tickets' ? 'bg-white text-primary shadow-sm' : 'text-gray-600'
            }`}
          >
            Vé của tôi
          </button>
          <button 
            onClick={() => setActiveTab('bought_for_others')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
              activeTab === 'bought_for_others' ? 'bg-white text-primary shadow-sm' : 'text-gray-600'
            }`}
          >
            Vé mua hộ người thân
          </button>
        </div>
      </div>

      {/* Danh sách vé */}
      <div className="p-4 space-y-3">
        {loading ? (
          <p className="text-center text-gray-500 py-8 text-sm">Đang tải danh sách vé...</p>
        ) : filteredTickets.length === 0 ? (
          <div className="bg-white p-6 text-center rounded-2xl border border-gray-100">
            <p className="text-sm text-gray-500">Chưa có vé nào trong danh mục này</p>
            <button 
              onClick={() => navigate('/tickets/buy')} 
              className="mt-3 text-xs bg-blue-50 text-primary font-bold px-4 py-2 rounded-full"
            >
              + Mua vé mới ngay
            </button>
          </div>
        ) : (
          filteredTickets.map(ticket => (
            <div key={ticket.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-gray-400">Mã vé: TK{String(ticket.id).padStart(7, '0')}</p>
                <h3 className="font-bold text-gray-800 text-sm mt-1">{ticket.line_name || 'Tuyến Metro Hà Nội'}</h3>
                <p className="text-xs text-gray-500">{ticket.ticket_type_name || 'Vé lượt'}</p>
                {ticket.relative_name && (
                  <span className="inline-block mt-2 text-[10px] bg-purple-50 text-purple-600 font-bold px-2 py-0.5 rounded-full">
                    Người thân: {ticket.relative_name}
                  </span>
                )}
              </div>
              <button 
                onClick={() => navigate('/qr')} 
                className="p-3 bg-blue-50 text-primary rounded-xl hover:bg-blue-100 transition"
              >
                <QrCode size={22} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Nút Cập nhật danh sách vé (Refresh) ở dưới cùng */}
      <div className="px-4 mt-2">
        <button 
          onClick={fetchTickets}
          className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl text-sm shadow-md flex items-center justify-center gap-2 hover:bg-emerald-700 active:scale-95 transition"
        >
          <RefreshCw size={16} /> Cập nhật danh sách vé
        </button>
      </div>
    </div>
  );
}