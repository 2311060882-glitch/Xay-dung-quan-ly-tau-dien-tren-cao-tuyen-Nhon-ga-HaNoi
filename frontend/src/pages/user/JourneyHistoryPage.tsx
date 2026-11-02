import { ArrowLeft, TrainTrack } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';

interface JourneyItem {
  id: number;
  line_name?: string;
  check_in_station?: string;
  check_out_station?: string;
  check_in_time?: string;
  check_out_time?: string;
}

export default function JourneyHistoryPage() {
  const navigate = useNavigate();
  const [journeys, setJourneys] = useState<JourneyItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchJourneys = async () => {
      try {
        const res = await axiosInstance.get('/auth/journeys.php');
        const resData = res.data;
        
        // Đọc đúng mảng items trong res.data.data.items
        const items = resData?.data?.items || resData?.data || [];
        if (Array.isArray(items)) {
          setJourneys(items);
        }
      } catch (error) {
        console.error('Lỗi lấy lịch sử chuyến đi:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJourneys();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      <div className="w-full max-w-md bg-white min-h-screen flex flex-col relative pb-10 shadow-xl">
        
        {/* Header */}
        <div className="px-4 py-4 flex items-center gap-3 sticky top-0 z-10 bg-white border-b border-gray-100">
          <button onClick={() => navigate(-1)} className="p-1 -ml-1 hover:bg-gray-100 rounded-full transition cursor-pointer">
            <ArrowLeft size={22} className="text-gray-800" />
          </button>
          <h1 className="text-base font-bold text-gray-900">Lịch sử chuyến đi</h1>
        </div>

        {/* Nội dung */}
        <div className="p-4 flex-1">
          {loading ? (
            <div className="text-center text-gray-400 py-10 font-medium text-sm">Đang tải lịch sử...</div>
          ) : journeys.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-3">
                <TrainTrack size={32} />
              </div>
              <p className="text-sm font-bold text-gray-800">Chưa có chuyến đi nào</p>
              <p className="text-xs text-gray-400 mt-1 max-w-xs">
                Lịch sử sẽ được ghi nhận sau khi bạn quét mã QR vé tại cổng soát vé ga Metro.
              </p>
              <button
                onClick={() => navigate('/tickets/buy')}
                className="mt-5 bg-blue-600 text-white font-bold px-5 py-2.5 rounded-xl text-xs hover:bg-blue-700 transition cursor-pointer"
              >
                Mua vé đi ngay
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {journeys.map((item) => (
                <div key={item.id} className="p-4 bg-white border border-gray-100 rounded-2xl shadow-xs">
                  <p className="text-sm font-bold text-gray-900">{item.line_name || 'Tuyến Metro'}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {item.check_in_station} &rarr; {item.check_out_station}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-2">
                    {item.check_in_time ? new Date(item.check_in_time).toLocaleString('vi-VN') : ''}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}