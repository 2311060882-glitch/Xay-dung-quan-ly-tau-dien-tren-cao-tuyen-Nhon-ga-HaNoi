// src/templates/MobileLayout.tsx
import { Outlet } from 'react-router-dom';
import BottomNav from '../components/BottomNav';

export default function MobileLayout() {
  return (
    // Giả lập khung màn hình điện thoại khi xem trên PC
    <div className="w-full h-screen bg-gray-100 flex justify-center overflow-hidden">
      <div className="w-full max-w-md bg-white h-full relative flex flex-col shadow-xl">
        
        {/* Phần nội dung của từng trang (sẽ cuộn được) */}
        <div className="flex-1 overflow-y-auto pb-20">
          <Outlet /> {/* Outlet là nơi render các trang như Home, Tickets... */}
        </div>

        {/* Thanh điều hướng luôn nằm ở đáy */}
        <BottomNav />
      </div>
    </div>
  );
}