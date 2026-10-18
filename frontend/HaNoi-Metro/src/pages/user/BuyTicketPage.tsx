// src/pages/user/BuyTicketPage.tsx
import { useState } from 'react';
import { ArrowLeft, Ticket, CreditCard, User, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function BuyTicketPage() {
  const navigate = useNavigate();
  const [selectedLine, setSelectedLine] = useState('2A');
  
  // Thêm state để quản lý nhóm đối tượng
  const [customerType, setCustomerType] = useState<'normal' | 'priority'>('normal');
  const [selectedTicketByType, setSelectedTicketByType] = useState<Record<'normal' | 'priority', string>>({
    normal: 'luot',
    priority: 'thang_uutien',
  });

  // Tách riêng 2 danh sách vé
  const NORMAL_TICKETS = [
    { id: 'luot', name: 'Vé lượt (Đi 1 lần)', price: 8000, desc: 'Có giá trị trong ngày' },
    { id: 'ngay', name: 'Vé ngày', price: 24000, desc: 'Không giới hạn lượt đi trong 24h' },
    { id: 'thang', name: 'Vé tháng (Phổ thông)', price: 200000, desc: 'Có giá trị 30 ngày kể từ lúc mua' },
  ];

  const PRIORITY_TICKETS = [
    { id: 'thang_uutien', name: 'Vé tháng (Ưu tiên)', price: 100000, desc: 'Giảm 50% cho HSSV, NCT, Công nhân KCN' },
    // Có thể thêm vé miễn phí cho trẻ em/người khuyết tật nếu muốn
    { id: 'mien_phi', name: 'Vé miễn phí', price: 0, desc: 'Trẻ em dưới 6t, người khuyết tật, NCC' },
  ];

  // Lấy danh sách vé đang được hiển thị
  const activeTickets = customerType === 'normal' ? NORMAL_TICKETS : PRIORITY_TICKETS;
    const selectedTicket = selectedTicketByType[customerType];
  const currentPrice = activeTickets.find(t => t.id === selectedTicket)?.price || 0;

  const handleBuyTicket = () => {
    if (customerType === 'priority' && selectedTicket === 'thang_uutien') {
       alert(`Đã thanh toán ${currentPrice.toLocaleString('vi-VN')}đ. Hệ thống sẽ đối chiếu hồ sơ Ưu tiên của bạn!`);
    } else if (currentPrice === 0) {
       alert(`Đăng ký vé Miễn phí thành công!`);
    } else {
       alert(`Đã mua vé thành công! Trừ ${currentPrice.toLocaleString('vi-VN')}đ từ ví.`);
    }
    navigate('/tickets');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      <div className="w-full max-w-md bg-white min-h-screen flex flex-col relative pb-28 shadow-xl">
        
        {/* Header */}
        <div className="px-4 py-4 flex items-center gap-3 sticky top-0 z-10 bg-white border-b border-gray-100">
          <button onClick={() => navigate(-1)} className="p-1 -ml-1 hover:bg-gray-100 rounded-full transition cursor-pointer">
            <ArrowLeft size={22} className="text-gray-800" />
          </button>
          <h1 className="text-base font-bold text-gray-900">Mua vé tàu</h1>
        </div>

        <div className="px-4 pt-4 flex-1">
          {/* 1. Chọn tuyến */}
          <div className="mb-6">
            <h2 className="text-sm font-bold text-gray-800 mb-2">1. Chọn tuyến Metro</h2>
            <select 
              value={selectedLine}
              onChange={(e) => setSelectedLine(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-bold text-gray-800 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
            >
              <option value="2A">Tuyến 2A: Cát Linh - Hà Đông</option>
              <option value="3.1">Tuyến 3.1: Nhổn - Ga Hà Nội</option>
            </select>
          </div>

          {/* 2. Chọn đối tượng */}
          <div className="mb-6">
            <h2 className="text-sm font-bold text-gray-800 mb-2">2. Nhóm đối tượng</h2>
            <div className="flex bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setCustomerType('normal')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
                  customerType === 'normal' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <User size={16} /> Phổ thông
              </button>
              <button
                onClick={() => setCustomerType('priority')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
                  customerType === 'priority' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Award size={16} /> Ưu tiên
              </button>
            </div>
            
            {/* Gợi ý cho khách ưu tiên */}
            {customerType === 'priority' && (
              <p className="text-[11px] text-amber-600 mt-2 bg-amber-50 p-2 rounded-lg border border-amber-100">
                * Lưu ý: Bạn cần mang theo giấy tờ tuỳ thân (CCCD, Thẻ HSSV) khi mua vé ưu tiên để nhân viên ga kiểm tra.
              </p>
            )}
          </div>

          {/* 3. Chọn loại vé */}
          <div className="mb-6">
            <h2 className="text-sm font-bold text-gray-800 mb-2">3. Chọn loại vé</h2>
            <div className="space-y-3">
              {activeTickets.map((ticket) => (
                <div 
                    key={ticket.id}
                    onClick={() => setSelectedTicketByType(previous => ({ ...previous, [customerType]: ticket.id }))}
                    className={`p-4 rounded-xl border-2 transition cursor-pointer flex justify-between items-center ${
                    selectedTicket === ticket.id ? 'border-blue-500 bg-blue-50' : 'border-gray-100 bg-white hover:border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${selectedTicket === ticket.id ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                      <Ticket size={20} />
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${selectedTicket === ticket.id ? 'text-blue-700' : 'text-gray-800'}`}>
                        {ticket.name}
                        </p>
                        <p className="text-[11px] text-gray-500 mt-0.5 max-w-[200px] leading-tight">{ticket.desc}</p>
                    </div>
                  </div>
                  <p className="text-sm font-black text-gray-900">{ticket.price === 0 ? 'Miễn phí' : `${ticket.price.toLocaleString('vi-VN')} đ`}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Khung thanh toán dưới đáy */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-100 p-4 z-10 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-gray-500">Tổng thanh toán:</span>
            <span className="text-xl font-black text-blue-600">{currentPrice === 0 ? '0 đ' : `${currentPrice.toLocaleString('vi-VN')} đ`}</span>
          </div>
          <button 
            onClick={handleBuyTicket}
            className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl flex justify-center items-center gap-2 hover:bg-blue-700 active:scale-[0.98] transition cursor-pointer"
          >
            <CreditCard size={20} /> {currentPrice === 0 ? 'Xác nhận Đăng ký' : 'Thanh toán qua Ví nội bộ'}
          </button>
        </div>
      </div>
    </div>
  );
}