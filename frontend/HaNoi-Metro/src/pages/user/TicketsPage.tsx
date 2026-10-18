// src/pages/Tickets.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TicketCard } from '../../components/ui/TicketCard'; // (Nếu folder components ngang hàng với pages)

export default function Tickets() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'my' | 'others'>('my');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative pb-32">
      {/* Header & Tabs (Gộp chung nền, bỏ bóng đổ để liền mạch như app thật) */}
      <div className="bg-gray-50 pt-6 pb-4 sticky top-0 z-10">
        {/* Tiêu đề */}
        <div className="px-5 flex justify-between items-center mb-4">
          <h1 className="text-[22px] font-bold text-gray-900">Vé của tôi</h1>
          <button 
            onClick={() => alert("Lịch sử giao dịch mua vé rống.")} 
            className="text-blue-600 font-bold text-[15px]"
          >
            Lịch sử
          </button>
        </div>

        {/* Tabs */}
        <div className="px-5 flex gap-2">
          <button 
            onClick={() => setActiveTab('my')}
            className={`px-4 py-1.5 rounded-full text-[14px] font-bold transition-all ${
              activeTab === 'my' 
                ? 'bg-[#293241] text-white' 
                : 'bg-white border border-gray-200 text-gray-500 shadow-sm'
            }`}
          >
            Vé của tôi (1)
          </button>
          <button 
            onClick={() => setActiveTab('others')}
            className={`px-4 py-1.5 rounded-full text-[14px] font-bold transition-all ${
              activeTab === 'others' 
                ? 'bg-[#293241] text-white' 
                : 'bg-white border border-gray-200 text-gray-500 shadow-sm'
            }`}
          >
            Vé mua hộ
          </button>
        </div>
      </div>

      {/* Danh sách Thẻ Vé */}
      <div className="px-5 mt-1">
        {activeTab === 'my' ? (
          <TicketCard 
            lineName="Tuyến 3.1 Nhổn - Ga Hà Nội"
            ticketType="01 tháng"
            userName="TRỊNH MINH HOÀNG"
            isDiscount={true}
            expiryDate="01/11/2026"
            ticketCode="TK7658364"
            onQrClick={() => navigate('/qr')}
            onDetailClick={() => alert("Chi tiết vé TK7658364")}
          />
        ) : (
          <div className="text-center py-10 text-gray-400 text-sm">
            Chưa có vé mua hộ nào.
          </div>
        )}
      </div>

      {/* Nút Cập nhật danh sách vé - Nổi màu xanh lá sát đáy */}
      <div className="fixed bottom-[80px] w-full max-w-md px-5 z-10 left-1/2 -translate-x-1/2">
        <button className="w-full bg-[#22c55e] hover:bg-[#1db053] text-white font-bold py-3.5 rounded-2xl shadow-lg transition active:scale-[0.98]">
          Cập nhật danh sách vé
        </button>
      </div>
    </div>
  );
}