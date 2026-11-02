import { useState, useEffect } from 'react';
import { ArrowLeft, Train, Navigation, Bus, ChevronDown } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { adminTripsApi } from '../../api/admin.trips.api';

export default function StationDetailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Lấy data từ URL (Nếu không có thì mặc định là Cát Linh - Hà Đông)
  const stationName = searchParams.get('name') || 'Trạm Metro';
  const lineName = searchParams.get('line') || 'Tuyến 2A: Cát Linh - Hà Đông';
  const ep1 = searchParams.get('ep1') || 'Yên Nghĩa';
  const ep2 = searchParams.get('ep2') || 'Cát Linh';
  
  const [direction, setDirection] = useState<string>(ep1);
  const [tripTimes, setTripTimes] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const generateDefaultSchedule = (): string[] => {
    const times: string[] = [];
    for (let hour = 5; hour <= 21; hour++) {
      for (let min = 0; min < 60; min += 10) {
        if (hour === 5 && min < 19) continue;
        times.push(`${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`);
      }
    }
    return times;
  };

  useEffect(() => {
    const fetchRealSchedule = async () => {
      setLoading(true);
      try {
        const res = await adminTripsApi.getTrips();
        const rawTrips = res.data?.data || [];
        
        if (Array.isArray(rawTrips) && rawTrips.length > 0) {
          const times = rawTrips
            .map((t: { departure_time?: string }) => {
              if (!t.departure_time) return null;
              const date = new Date(t.departure_time);
              return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
            })
            .filter((t): t is string => t !== null);
          setTripTimes(times.length > 0 ? times : generateDefaultSchedule());
        } else {
          setTripTimes(generateDefaultSchedule());
        }
      } catch {
        setTripTimes(generateDefaultSchedule());
      } finally {
        setLoading(false);
      }
    };
    fetchRealSchedule();
  }, [stationName, direction]);

  // Phân loại Sáng / Chiều / Tối
  const groupedTimes = {
    sang: tripTimes.filter(t => parseInt(t.split(':')[0]) < 12),
    chieu: tripTimes.filter(t => { const h = parseInt(t.split(':')[0]); return h >= 12 && h < 18; }),
    toi: tripTimes.filter(t => parseInt(t.split(':')[0]) >= 18)
  };

  // Hàm mở Google Maps
  const handleOpenDirections = () => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=Ga+Metro+${encodeURIComponent(stationName)},+Hà+Nội`, '_blank');
  };

  const handleOpenBusStops = () => {
    window.open(`https://www.google.com/maps/search/Trạm+xe+buýt+gần+Ga+Metro+${encodeURIComponent(stationName)},+Hà+Nội`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center font-sans">
      <div className="w-full max-w-md bg-white min-h-screen flex flex-col relative pb-10 shadow-xl">
        <div className="px-4 py-4 flex items-center gap-3 bg-white border-b border-gray-100 sticky top-0 z-20">
          <button onClick={() => navigate(-1)} className="p-1 -ml-1 hover:bg-gray-100 rounded-full transition"><ArrowLeft size={22} className="text-gray-800" /></button>
          <h1 className="text-base font-bold text-gray-900">{stationName}</h1>
        </div>

        <div className="p-4 space-y-4">
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white"><Train size={24} /></div>
              <div>
                <h2 className="text-base font-bold text-gray-900">{stationName}</h2>
                <p className="text-xs text-gray-500 mt-0.5">{lineName}</p>
              </div>
            </div>
            <div className="pt-2 border-t border-gray-100 text-xs text-gray-700 space-y-1 font-medium">
              <p><span className="text-gray-400">Giờ hoạt động:</span> 05:19 – 22:00</p>
              <p><span className="text-gray-400">Tần suất:</span> 10 phút / 1 chuyến</p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button onClick={handleOpenDirections} className="flex items-center justify-center gap-2 p-3 bg-gray-50 border border-gray-100 rounded-xl hover:bg-blue-50 text-blue-600 transition">
                <Navigation size={18}/>
                <div className="text-left"><p className="text-[10px] text-gray-400 font-medium">Metro</p><p className="text-xs font-bold text-gray-800">Chỉ đường</p></div>
              </button>
              <button onClick={handleOpenBusStops} className="flex items-center justify-center gap-2 p-3 bg-gray-50 border border-gray-100 rounded-xl hover:bg-blue-50 text-blue-600 transition">
                <Bus size={18}/>
                <div className="text-left"><p className="text-[10px] text-gray-400 font-medium">Tiện ích</p><p className="text-xs font-bold text-gray-800">Trạm xe buýt</p></div>
              </button>
            </div>
          </div>

          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button onClick={() => setDirection(ep1)} className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition ${direction === ep1 ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500'}`}>Hướng {ep1}</button>
            <button onClick={() => setDirection(ep2)} className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition ${direction === ep2 ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500'}`}>Hướng {ep2}</button>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-bold text-gray-800">Biểu đồ giờ khởi hành</h3>
              <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-200"><span>Hôm nay</span><ChevronDown size={14} /></div>
            </div>
            
            {loading ? <div className="text-center text-xs text-gray-400 py-6">Đang tải lịch tàu thực tế...</div> : (
              <div className="space-y-5 max-h-[400px] overflow-y-auto pr-1">
                {/* SÁNG */}
                {groupedTimes.sang.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Buổi Sáng (05:00 - 11:59)</h4>
                    <div className="grid grid-cols-4 gap-2">
                      {groupedTimes.sang.map((time, idx) => (
                        <div key={idx} className="p-2 rounded-xl text-center text-xs font-bold border bg-gray-50 text-blue-700 border-gray-100">{time}</div>
                      ))}
                    </div>
                  </div>
                )}
                {/* CHIỀU */}
                {groupedTimes.chieu.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Buổi Chiều (12:00 - 17:59)</h4>
                    <div className="grid grid-cols-4 gap-2">
                      {groupedTimes.chieu.map((time, idx) => (
                        <div key={idx} className="p-2 rounded-xl text-center text-xs font-bold border bg-gray-50 text-blue-700 border-gray-100">{time}</div>
                      ))}
                    </div>
                  </div>
                )}
                {/* TỐI */}
                {groupedTimes.toi.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Buổi Tối (18:00 - 23:59)</h4>
                    <div className="grid grid-cols-4 gap-2">
                      {groupedTimes.toi.map((time, idx) => (
                        <div key={idx} className="p-2 rounded-xl text-center text-xs font-bold border bg-gray-50 text-blue-700 border-gray-100">{time}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}