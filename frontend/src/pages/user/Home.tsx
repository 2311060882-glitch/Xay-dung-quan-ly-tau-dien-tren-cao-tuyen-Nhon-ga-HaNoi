// src/pages/user/Home.tsx
import { useEffect, useState } from 'react';
import { Bell, QrCode, CreditCard, Users, Bike, UserPlus } from 'lucide-react';
import { TicketCard } from '../../components/ui/TicketCard';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/auth.api';
import { ticketApi } from '../../api/ticket.api';

interface ActiveTicket {
  id?: number;
  line_name?: string;
  ticket_type_name?: string;
  expires_at?: string;
}

export default function Home() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>('Người dùng');
  const [activeTicket, setActiveTicket] = useState<ActiveTicket | null>(null);

  useEffect(() => {
  // Lấy thông tin User
  authApi.getProfile()
    .then((res) => {
      const resData = res.data;
      if ((resData?.success || resData?.status === 200 || resData?.status === true) && resData?.data?.fullname) {
        setUserName(resData.data.fullname);
      }
    })
    .catch(() => {});

  // Lấy vé khả dụng (QR Active)
  ticketApi.getActiveQr()
    .then((res) => {
      const resData = res.data;
      const isSuccess = resData?.success === true || resData?.status === 200 || resData?.status === true;
      
      if (isSuccess && resData?.data) {
        setActiveTicket(resData.data);
      } else {
        setActiveTicket(null);
      }
    })
    .catch(() => {
      setActiveTicket(null);
    });
}, []);

  return (
    <div className="relative min-h-screen bg-gray-50 pb-24">
      <div className="bg-primary pt-10 pb-20 px-4 text-white rounded-b-[40px] relative">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-sm opacity-90">Chào buổi chiều</p>
            <h1 className="text-xl font-bold">{userName}</h1>
          </div>
          <button className="bg-white/20 p-2 rounded-full cursor-pointer hover:bg-white/30 transition">
            <Bell size={20} />
          </button>
        </div>
        
        <div className="w-full h-32 bg-blue-400 rounded-xl flex items-center justify-center font-bold italic text-white shadow-inner cursor-pointer hover:opacity-95 transition">
          HÀNH TRÌNH XANH CÙNG HÀ NỘI METRO
        </div>
      </div>

      <div className="px-4 -mt-12 relative z-10">
        <div 
          onClick={() => navigate('/wallet')} 
          className="bg-white rounded-2xl shadow-lg p-4 mb-4 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
        >
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <QrCode className="text-primary" size={24} />
              <span className="font-semibold text-gray-800">Ví điện tử</span>
            </div>
            <button className="text-xs bg-blue-50 text-primary px-3 py-1 rounded-full font-medium hover:bg-blue-100 cursor-pointer">
              Liên kết ngân hàng
            </button>
          </div>
          
          <div className="pt-4" onClick={(e) => e.stopPropagation()}>
            {activeTicket ? (
              <TicketCard 
                lineName={activeTicket.line_name || "Tuyến 3.1 Nhổn - Ga Hà Nội"}
                ticketType={activeTicket.ticket_type_name || "Vé lượt"}
                userName={userName.toUpperCase()}
                isDiscount={activeTicket.ticket_type_name?.toLowerCase().includes('ưu tiên') || false}
                expiryDate={activeTicket.expires_at ? new Date(activeTicket.expires_at).toLocaleDateString('vi-VN') : 'Theo lượt'}
                ticketCode={activeTicket.id ? `TK${String(activeTicket.id).padStart(7, '0')}` : '---'}
                onQrClick={() => navigate('/qr')}
              />
            ) : (
              <div 
                onClick={() => navigate('/tickets/buy')}
                className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:bg-blue-50/50 transition"
              >
                <p className="text-sm font-bold text-gray-700">Bạn chưa có vé khả dụng</p>
                <p className="text-xs text-blue-600 mt-1 font-medium">+ Bấm vào đây để mua vé đi tàu ngay</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Đoạn code 4 nút tiện ích trong Home.tsx */}
<div className="px-4 mt-6">
  <div className="bg-white rounded-2xl shadow-sm p-5 grid grid-cols-4 gap-4">
    <button onClick={() => navigate('/tickets/buy')} className="flex flex-col items-center gap-2 cursor-pointer group">
      <div className="text-primary group-hover:scale-110 transition-transform"><CreditCard size={28} /></div>
      <span className="text-xs text-center text-gray-600 font-medium">Mua vé tàu</span>
    </button>
    <button onClick={() => navigate('/registration/new')} className="flex flex-col items-center gap-2 cursor-pointer group">
      <div className="text-primary group-hover:scale-110 transition-transform"><Users size={28} /></div>
      <span className="text-xs text-center text-gray-600 font-medium">Đăng ký ưu tiên</span>
    </button>
    <button className="flex flex-col items-center gap-2 cursor-pointer group">
      <div className="text-primary group-hover:scale-110 transition-transform"><Bike size={28} /></div>
      <span className="text-xs text-center text-gray-600 font-medium">Thuê xe TNGo</span>
    </button>
    
    {/* ĐÃ THÊM ONCLICK VÀO ĐÂY */}
    <button onClick={() => navigate('/relatives')} className="flex flex-col items-center gap-2 cursor-pointer group">
      <div className="text-primary group-hover:scale-110 transition-transform"><UserPlus size={28} /></div>
      <span className="text-xs text-center text-gray-600 font-medium">Định danh hộ</span>
    </button>
  </div>
</div>
    </div>
  );
}