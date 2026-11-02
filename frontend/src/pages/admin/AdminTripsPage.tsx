import { useEffect, useState } from 'react';
import { adminTripsApi } from '../../api/admin.trips.api';
import { TrainTrack, Plus, Search, Calendar, ArrowRight, X } from 'lucide-react';

interface Trip {
  id: number;
  trip_code: string;
  direction: 'OUTBOUND' | 'INBOUND';
  departure_time: string;
  status: string;
}

export default function AdminTripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');

  const [tripCode, setTripCode] = useState('');
  const [direction, setDirection] = useState<'OUTBOUND' | 'INBOUND'>('OUTBOUND');
  const [departureTime, setDepartureTime] = useState('');

  const fetchTrips = () => {
    adminTripsApi.getTrips().then(res => setTrips(res.data.data || [])).catch(console.error);
  };

  useEffect(() => { fetchTrips(); }, []);

  const handleCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminTripsApi.createTrip({ line_id: 1, trip_code: tripCode, direction, departure_time: departureTime, capacity: 500 });
      alert('Đã tạo chuyến tàu mới!');
      setShowForm(false);
      setTripCode('');
      setDepartureTime('');
      fetchTrips();
    } catch {
      alert('Tạo thất bại, vui lòng kiểm tra lại thông tin!');
    }
  };

  const filteredTrips = trips.filter(t => t.trip_code.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="h-full flex flex-col font-sans relative">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Điều hành chuyến tàu</h2>
          <p className="text-sm text-gray-500 mt-1">Lên lịch, giám sát lộ trình và trạng thái các đoàn tàu Metro.</p>
        </div>
        <button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md flex items-center gap-2">
          <Plus size={18} /> Tạo chuyến mới
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex-1 flex flex-col">
        <div className="p-4 border-b border-gray-100 flex gap-4 bg-gray-50">
          <div className="relative flex-1 max-w-md">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Tìm theo mã chuyến..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white sticky top-0 shadow-sm">
              <tr className="text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-200">
                <th className="p-4">Mã chuyến</th>
                <th className="p-4">Tuyến & Chiều đi</th>
                <th className="p-4">Khởi hành</th>
                <th className="p-4">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTrips.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50/50 transition">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-50 p-2 rounded-lg text-blue-600"><TrainTrack size={18}/></div>
                      <span className="font-bold text-gray-900">{t.trip_code}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">Tuyến 3.1</span>
                      <ArrowRight size={14} className="text-gray-400" />
                      {t.direction === 'OUTBOUND' ? <span className="text-blue-600 font-bold">Lượt đi</span> : <span className="text-amber-600 font-bold">Lượt về</span>}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar size={14} className="text-gray-400" />
                      {t.departure_time}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full ${
                      t.status === 'COMPLETED' ? 'bg-gray-100 text-gray-600' :
                      t.status === 'RUNNING' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {t.status || 'SCHEDULED'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL TẠO CHUYẾN MỚI */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-900">Tạo chuyến tàu mới</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 p-1"><X size={20}/></button>
            </div>
            <form onSubmit={handleCreateTrip} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Mã chuyến</label>
                <input required value={tripCode} onChange={e => setTripCode(e.target.value)} className="w-full border border-gray-200 p-3 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="VD: NHON-01" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Chiều chạy</label>
                <select value={direction} onChange={e => setDirection(e.target.value as 'OUTBOUND' | 'INBOUND')} className="w-full border border-gray-200 p-3 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                  <option value="OUTBOUND">Đi (Outbound)</option>
                  <option value="INBOUND">Về (Inbound)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Giờ khởi hành</label>
                <input required type="datetime-local" value={departureTime} onChange={e => setDepartureTime(e.target.value)} className="w-full border border-gray-200 p-3 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white" />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition">Hủy bỏ</button>
                <button type="submit" className="flex-1 py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-md">Lưu chuyến</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}