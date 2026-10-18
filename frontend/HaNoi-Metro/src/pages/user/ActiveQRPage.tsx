// src/pages/QRPage.tsx
import { Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function QRPage() {
  const navigate = useNavigate();

  return (
    // Nền trắng tinh giúp màn hình phát sáng tối đa khi đưa vào máy quét
    <div className="min-h-screen bg-white flex flex-col relative pb-6 z-50">
      
      {/* Header màu cam đặc trưng của Tuyến Nhổn */}
      <div className="bg-[#ff5a00] text-white px-4 py-3 flex justify-between items-center shadow-sm z-10 rounded-b-md">
        <span className="font-bold text-sm">Tuyến 3.1</span>
        <span className="font-bold text-sm">Nhổn - Ga Hà Nội</span>
      </div>

      <div className="flex-1 px-5 pt-8 flex flex-col items-center relative">
        
        {/* Hình nền giả lập họa tiết cây xanh ở viền (giống app thật) */}
        <div className="absolute top-10 left-0 w-4 h-64 bg-green-100/50 rounded-r-3xl -z-10"></div>
        <div className="absolute top-20 right-0 w-6 h-48 bg-blue-100/50 rounded-l-3xl -z-10"></div>

        {/* Cụm Logo: Metro & VISA */}
        <div className="flex items-center justify-center gap-6 mb-6 w-full">
          {/* Logo Metro (giả lập bằng text) */}
          <div className="flex items-center text-primary font-bold text-lg">
            <span className="text-red-500 text-3xl font-black mr-1 tracking-tighter">M</span> 
            <div className="flex flex-col leading-none">
              <span className="text-[10px]">HANOI</span>
              <span>METRO</span>
            </div>
          </div>
          <span className="text-blue-800 font-bold text-2xl italic tracking-wider">VISA</span>
        </div>

        {/* Mã QR trung tâm */}
        <div className="w-56 h-56 mb-4">
          <img 
            src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=HANOIMETRO_TK7658364" 
            alt="Mã QR Vé" 
            className="w-full h-full object-contain"
          />
        </div>

        {/* Dòng cảnh báo */}
        <p className="text-gray-400 text-xs text-center px-4 mb-6">
          Quét mã để qua cổng. Vui lòng không đưa mã cho người khác.
        </p>

        {/* Khối Thông tin chi tiết vé */}
        <div className="w-full text-sm flex flex-col gap-3.5 mt-2">
          <div className="text-center font-bold text-base text-gray-800 mb-1">
            01 tháng
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-500">Mã</span>
            <span className="font-medium text-gray-800">TK7658364</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-500">Ngày hết hạn</span>
            <span className="font-bold text-[#ff5a00]">01/11/2026</span>
          </div>

          <div className="flex justify-between items-start">
            <span className="text-gray-500 w-1/3">Ga có thể xuống</span>
            <span className="font-medium text-gray-800 text-right w-2/3 leading-snug">
              Nhổn, Minh Khai, Phú Diễn, Cầu Diễn, Lê Đức Thọ, ĐH Quốc Gia, Chùa Hà, Cầu Giấy
            </span>
          </div>

          <div className="flex justify-between items-center mt-1">
            <span className="text-gray-500">Giá</span>
            <span className="font-medium text-gray-800">140.000 VNĐ</span>
          </div>
        </div>

        {/* Nút Chi tiết vé */}
        <div className="mt-8 flex justify-center w-full">
          <button className="flex items-center gap-1.5 text-primary font-bold text-sm">
            <Info size={16} /> Chi tiết vé
          </button>
        </div>

        {/* Timestamp */}
        <div className="w-full flex justify-between text-[10px] text-gray-400 mt-6 px-2">
          <span>18:14:54 16/10/2026</span>
          <span>18:14:54 16/10/2026</span>
        </div>
      </div>

      {/* Hai nút hành động dưới cùng */}
      <div className="px-5 mt-auto flex gap-3 pt-4">
        <button 
          onClick={() => navigate(-1)} 
          className="flex-1 py-3.5 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold shadow-sm"
        >
          Thoát
        </button>
        <button className="flex-1 py-3.5 bg-primary text-white rounded-xl font-bold shadow-lg shadow-blue-200">
          Đổi vé
        </button>
      </div>
    </div>
  );
}