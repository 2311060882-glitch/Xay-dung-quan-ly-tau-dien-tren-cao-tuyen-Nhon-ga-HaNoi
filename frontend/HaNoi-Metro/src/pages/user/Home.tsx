// src/pages/user/Home.tsx
import { Bell, QrCode, CreditCard, Users, Bike, UserPlus, ArrowRight } from 'lucide-react';
import { TicketCard } from '../../components/ui/TicketCard';
import { useNavigate } from 'react-router-dom';

export default function Home() {
    const navigate = useNavigate();
  return (
    <div className="relative min-h-screen bg-gray-50 pb-24">
      {/* Header & Banner nền xanh */}
      <div className="bg-primary pt-10 pb-20 px-4 text-white rounded-b-[40px] relative">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-sm opacity-90">Chào buổi chiều</p>
            <h1 className="text-xl font-bold">Trịnh Minh Hoàng</h1>
          </div>
          <button className="bg-white/20 p-2 rounded-full cursor-pointer hover:bg-white/30 transition">
            <Bell size={20} />
          </button>
        </div>
        
        {/* Khối Banner giả lập */}
        <div className="w-full h-32 bg-blue-400 rounded-xl flex items-center justify-center font-bold italic text-white shadow-inner cursor-pointer hover:opacity-95 transition">
          HÀNH TRÌNH XANH CÙNG HÀ NỘI METRO
        </div>
      </div>

      {/* Khối Ví điện tử (Đẩy lên đè vào phần xanh) */}
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
             <TicketCard 
                lineName="Tuyến 3.1 Nhổn - Ga Hà Nội"
                ticketType="01 tháng"
                userName="TRỊNH MINH HOÀNG"
                isDiscount={true}
                expiryDate="01/11/2026"
                ticketCode="TK7658364"
                onQrClick={() => navigate('/qr')}
              />
          </div>
        </div>
      </div>

      {/* Khối Nút Tiện Ích */}
      <div className="px-4 mt-6">
        <div className="bg-white rounded-2xl shadow-sm p-5 grid grid-cols-4 gap-4">
          <button 
            onClick={() => navigate('/tickets/buy')}
            className="flex flex-col items-center gap-2 cursor-pointer group"
          >
            <div className="text-primary group-hover:scale-110 group-active:scale-95 transition-transform"><CreditCard size={28} /></div>
            <span className="text-xs text-center text-gray-600 font-medium leading-tight group-hover:text-primary transition-colors">Mua vé tàu</span>
          </button>
          <button 
            onClick={() => navigate('/registrations/new')}
            className="flex flex-col items-center gap-2 cursor-pointer group"
          >
            <div className="text-primary group-hover:scale-110 group-active:scale-95 transition-transform"><Users size={28} /></div>
            <span className="text-xs text-center text-gray-600 font-medium leading-tight group-hover:text-primary transition-colors">Đăng ký ưu tiên</span>
          </button>
          <button className="flex flex-col items-center gap-2 cursor-pointer group">
            <div className="text-primary group-hover:scale-110 group-active:scale-95 transition-transform"><Bike size={28} /></div>
            <span className="text-xs text-center text-gray-600 font-medium leading-tight group-hover:text-primary transition-colors">Thuê xe TNGo</span>
          </button>
          <button className="flex flex-col items-center gap-2 cursor-pointer group">
            <div className="text-primary group-hover:scale-110 group-active:scale-95 transition-transform"><UserPlus size={28} /></div>
            <span className="text-xs text-center text-gray-600 font-medium leading-tight group-hover:text-primary transition-colors">Định danh hộ</span>
          </button>
        </div>
      </div>

      {/* Khối Tiện ích liên thông Be-Metro */}
      <div className="px-4 mt-6 cursor-pointer hover:shadow-md transition-shadow rounded-2xl">
        <div className="bg-white border-2 border-yellow-400 rounded-2xl p-4 flex justify-between items-center relative overflow-hidden group">
          <div className="z-10">
            <span className="bg-primary text-white text-[10px] px-2 py-0.5 rounded font-bold group-hover:bg-blue-700 transition-colors">MỚI</span>
            <h3 className="font-bold text-gray-800 mt-1">Đặt chuyến liên thông</h3>
            <p className="text-xs text-gray-500 mt-1">Đi Be - Metro - Be thuận tiện</p>
          </div>
          <ArrowRight className="text-gray-400 z-10 group-hover:text-primary group-hover:translate-x-1 transition-all" />
          <div className="absolute right-[-20px] bottom-[-10px] opacity-20 group-hover:scale-110 transition-transform duration-500">
            <Bike size={100} />
          </div>
        </div>
      </div>
    </div>
  );
}