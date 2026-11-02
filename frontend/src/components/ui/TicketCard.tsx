// src/components/ui/TicketCard.tsx
import { QrCode } from 'lucide-react';

interface TicketCardProps {
  lineName: string;
  ticketType: string;
  userName: string;
  isDiscount?: boolean;
  expiryDate: string;
  ticketCode: string;
  avatarUrl?: string;
  onQrClick?: () => void;
  onDetailClick?: () => void;
}

export function TicketCard({
  lineName = "Tuyến 3.1 Nhổn - Ga Hà Nội",
  ticketType = "01 tháng",
  userName = "TRỊNH MINH HOÀNG",
  isDiscount = true,
  expiryDate = "01/11/2026",
  ticketCode = "TK7658364",
  avatarUrl = "https://ui-avatars.com/api/?name=Hoang&background=random",
  onQrClick,
  onDetailClick,
}: TicketCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border-l-[5px] border-[#ff5a00] p-4 relative">
      {/* Hàng 1: Tuyến & Loại vé */}
      <div className="flex justify-between items-center border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#22c55e]"></div>
          <span className="text-sm font-semibold text-gray-800">{lineName}</span>
        </div>
        <span className="font-bold text-gray-900 text-sm">{ticketType}</span>
      </div>

      {/* Hàng 2: Avatar, Tên & Nút QR */}
      <div className="py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
            <img src={avatarUrl} alt={userName} className="w-full h-full object-cover" />
          </div>
          <div>
            {isDiscount && <p className="text-xs text-gray-400 font-medium">Vé ưu đãi</p>}
            <p className="font-bold text-gray-800 text-sm tracking-wide">{userName}</p>
          </div>
        </div>

        <button 
          onClick={onQrClick} 
          className="bg-gray-100 p-2.5 rounded-xl text-gray-600 hover:bg-gray-200 transition active:scale-95"
        >
          <QrCode size={22} />
        </button>
      </div>

      {/* Hàng 3: Hạn dùng, Mã vé & Chi tiết */}
      <div className="pt-2 flex justify-between items-center border-t border-gray-50">
        <p className="text-xs text-gray-500 font-medium">
          Hết hạn {expiryDate} • {ticketCode}
        </p>
        <button 
          onClick={onDetailClick} 
          className="text-primary font-bold text-sm hover:underline"
        >
          Chi tiết
        </button>
      </div>
    </div>
  );
}