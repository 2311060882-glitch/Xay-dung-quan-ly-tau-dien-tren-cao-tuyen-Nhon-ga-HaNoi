// src/pages/user/ActiveQRPage.tsx
import { useEffect, useState } from 'react';
import { Info, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ticketApi } from '../../api/ticket.api';

interface ActiveTicket {
  id?: number;
  qr_code?: string;
  ticket_type_name?: string;
  expires_at?: string;
  line_name?: string;
  purchase_price?: number | string;
}

export default function QRPage() {
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<ActiveTicket | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ticketApi
      .getActiveQr()
      .then((res: { data?: { success?: boolean; data?: ActiveTicket } }) => {
        if (res.data?.success && res.data?.data) {
          setTicket(res.data.data);
        } else {
          setTicket(null);
        }
      })
      .catch(() => setTicket(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-200 flex justify-center items-center">
      <div className="w-full max-w-md min-h-screen bg-white flex flex-col relative pb-6 shadow-2xl">
        
        <div className="bg-[#ff5a00] text-white px-4 py-3 flex justify-between items-center shadow-sm z-10 rounded-b-md">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(-1)} className="p-1 hover:bg-black/10 rounded-full cursor-pointer">
              <ArrowLeft size={18} />
            </button>
            <span className="font-bold text-sm">Tuyến 3.1</span>
          </div>
          <span className="font-bold text-sm">Nhổn - Ga Hà Nội</span>
        </div>

        <div className="flex-1 px-5 pt-8 flex flex-col items-center relative">
          <div className="flex items-center justify-center gap-6 mb-6 w-full">
            <div className="flex items-center text-primary font-bold text-lg">
              <span className="text-red-500 text-3xl font-black mr-1 tracking-tighter">M</span> 
              <div className="flex flex-col leading-none">
                <span className="text-[10px]">HANOI</span>
                <span>METRO</span>
              </div>
            </div>
            <span className="text-blue-800 font-bold text-2xl italic tracking-wider">VISA</span>
          </div>

          {loading ? (
            <div className="py-20 text-gray-400 font-medium">Đang tải mã QR vé...</div>
          ) : !ticket ? (
            <div className="py-16 text-center">
              <p className="text-gray-500 font-bold text-base">Không tìm thấy vé đang kích hoạt</p>
              <button 
                onClick={() => navigate('/tickets/buy')}
                className="mt-4 px-5 py-2.5 bg-primary text-white font-bold rounded-xl text-sm shadow-md cursor-pointer"
              >
                Mua vé ngay
              </button>
            </div>
          ) : (() => {
              const qrValue = ticket.qr_code || `TK${String(ticket.id).padStart(7, '0')}`;
              const codeStr = ticket.id ? `TK${String(ticket.id).padStart(7, '0')}` : '---';

              return (
                <>
                  <div className="w-56 h-56 mb-4 bg-white p-2 rounded-xl shadow-md border border-gray-100">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrValue)}`} 
                      alt="Mã QR Vé" 
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <p className="text-gray-400 text-xs text-center px-4 mb-6">
                    Quét mã để qua cổng. Vui lòng không đưa mã cho người khác.
                  </p>

                  <div className="w-full text-sm flex flex-col gap-3.5 mt-2">
                    <div className="text-center font-bold text-base text-gray-800 mb-1">
                      {ticket.ticket_type_name || 'Vé đi tàu'}
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Mã vé</span>
                      <span className="font-bold text-gray-800">{codeStr}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Ngày hết hạn</span>
                      <span className="font-bold text-[#ff5a00]">
                        {ticket.expires_at ? new Date(ticket.expires_at).toLocaleDateString('vi-VN') : 'Trong ngày'}
                      </span>
                    </div>

                    <div className="flex justify-between items-start">
                      <span className="text-gray-500 w-1/3">Tuyến áp dụng</span>
                      <span className="font-medium text-gray-800 text-right w-2/3 leading-snug">
                        {ticket.line_name || 'Tuyến 3.1 Nhổn - Ga Hà Nội'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center mt-1">
                      <span className="text-gray-500">Giá vé</span>
                      <span className="font-medium text-gray-800">
                        {ticket.purchase_price ? `${Number(ticket.purchase_price).toLocaleString('vi-VN')} VNĐ` : '---'}
                      </span>
                    </div>
                  </div>
                </>
              );
            })()}

          <div className="mt-8 flex justify-center w-full">
            <button className="flex items-center gap-1.5 text-primary font-bold text-sm cursor-pointer">
              <Info size={16} /> Chi tiết điều khoản
            </button>
          </div>
        </div>

        <div className="px-5 mt-auto flex gap-3 pt-4">
          <button onClick={() => navigate(-1)} className="flex-1 py-3.5 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold shadow-sm hover:bg-gray-50 cursor-pointer">
            Thoát
          </button>
          <button onClick={() => navigate('/tickets/buy')} className="flex-1 py-3.5 bg-primary text-white rounded-xl font-bold shadow-lg shadow-blue-200 cursor-pointer">
            Mua thêm vé
          </button>
        </div>
      </div>
    </div>
  );
}