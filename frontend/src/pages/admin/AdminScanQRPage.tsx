import { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { adminTripsApi } from '../../api/admin.trips.api';
import { Camera, MapPin, TrainTrack, ScanLine, CheckCircle2, XCircle } from 'lucide-react';

interface ScanLog {
  id: string;
  code: string;
  time: string;
  status: 'success' | 'error';
  message: string;
}

export default function AdminScanQRPage() {
  const [mode, setMode] = useState<'check-in' | 'check-out'>('check-in');
  const [tripId, setTripId] = useState<number>(1);
  const [stationId, setStationId] = useState<number>(1);
  const [logs, setLogs] = useState<ScanLog[]>([]);
  const [currentStatus, setCurrentStatus] = useState<{ text: string; type: 'success' | 'error' | 'idle' }>({ text: 'Sẵn sàng quét mã QR', type: 'idle' });

  const modeRef = useRef(mode);
  const tripIdRef = useRef(tripId);
  const stationIdRef = useRef(stationId);
  const isProcessingRef = useRef(false);

  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { tripIdRef.current = tripId; }, [tripId]);
  useEffect(() => { stationIdRef.current = stationId; }, [stationId]);

  const addLog = (log: ScanLog) => {
    setLogs((prev) => [log, ...prev].slice(0, 10)); // Giữ 10 log gần nhất
  };

  useEffect(() => {
    const scanner = new Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: { width: 250, height: 250 } }, false);

    scanner.render(
      async (decodedText) => {
        if (isProcessingRef.current) return;
        isProcessingRef.current = true;

        const timestamp = new Date().toLocaleTimeString('vi-VN');
        
        try {
          if (modeRef.current === 'check-in') {
            await adminTripsApi.checkInQR(decodedText, tripIdRef.current, stationIdRef.current);
            setCurrentStatus({ text: 'Check-in thành công!', type: 'success' });
            addLog({ id: Date.now().toString(), code: decodedText, time: timestamp, status: 'success', message: 'Vào ga hợp lệ' });
          } else {
            await adminTripsApi.checkOutQR(decodedText, tripIdRef.current, stationIdRef.current);
            setCurrentStatus({ text: 'Check-out thành công!', type: 'success' });
            addLog({ id: Date.now().toString(), code: decodedText, time: timestamp, status: 'success', message: 'Ra ga hợp lệ' });
          }
        } catch {
          setCurrentStatus({ text: 'Mã không hợp lệ hoặc đã dùng!', type: 'error' });
          addLog({ id: Date.now().toString(), code: decodedText, time: timestamp, status: 'error', message: 'Từ chối truy cập' });
        }

        setTimeout(() => {
          setCurrentStatus({ text: 'Sẵn sàng quét mã QR', type: 'idle' });
          isProcessingRef.current = false;
        }, 2500);
      },
      () => { /* Ignore empty frames */ }
    );

    return () => { scanner.clear().catch(console.error); };
  }, []);

  return (
    <div className="h-full flex flex-col font-sans">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Cổng Quét Vé Điện Tử</h2>
        <p className="text-sm text-gray-500 mt-1">Hệ thống kiểm soát ra vào ga (Turnstile) tự động.</p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CỘT TRÁI: ĐIỀU KHIỂN & CAMERA */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase mb-2"><MapPin size={16}/> Ga hiện tại (ID)</label>
                <input type="number" value={stationId} onChange={e => setStationId(Number(e.target.value))} className="w-full bg-white border border-gray-200 p-2.5 rounded-lg font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase mb-2"><TrainTrack size={16}/> Chuyến tàu (ID)</label>
                <input type="number" value={tripId} onChange={e => setTripId(Number(e.target.value))} className="w-full bg-white border border-gray-200 p-2.5 rounded-lg font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>

            <div className="flex bg-gray-100 p-1.5 rounded-xl mb-6">
              <button onClick={() => setMode('check-in')} className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all flex justify-center items-center gap-2 ${mode === 'check-in' ? 'bg-emerald-500 text-white shadow-md' : 'text-gray-500 hover:text-gray-700'}`}>
                <ScanLine size={18} /> CỬA VÀO (Check-in)
              </button>
              <button onClick={() => setMode('check-out')} className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all flex justify-center items-center gap-2 ${mode === 'check-out' ? 'bg-amber-500 text-white shadow-md' : 'text-gray-500 hover:text-gray-700'}`}>
                <ScanLine size={18} /> CỬA RA (Check-out)
              </button>
            </div>

            <div className="relative rounded-2xl overflow-hidden border-4 border-gray-100 bg-gray-50 flex justify-center items-center min-h-[350px]">
              <div id="qr-reader" className="w-full max-w-lg [&>img]:hidden [&>video]:rounded-xl [&>video]:w-full"></div>
            </div>
            
            <div className={`mt-6 p-4 rounded-xl flex items-center justify-center gap-3 font-bold text-lg transition-colors duration-300 ${
              currentStatus.type === 'success' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
              currentStatus.type === 'error' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-gray-50 text-gray-500 border border-gray-200'
            }`}>
              {currentStatus.type === 'success' && <CheckCircle2 size={24} />}
              {currentStatus.type === 'error' && <XCircle size={24} />}
              {currentStatus.type === 'idle' && <Camera size={24} />}
              {currentStatus.text}
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: LỊCH SỬ QUÉT */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gray-50">
            <h3 className="font-bold text-gray-900">Lịch sử soát vé</h3>
            <p className="text-xs text-gray-500">10 lượt quét gần nhất</p>
          </div>
          <div className="flex-1 p-5 overflow-y-auto space-y-3">
            {logs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50">
                <ScanLine size={48} className="mb-3" />
                <p className="text-sm font-medium">Chưa có dữ liệu quét</p>
              </div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="p-3 rounded-xl border border-gray-100 bg-gray-50 flex items-start gap-3">
                  <div className={`mt-0.5 p-1.5 rounded-full ${log.status === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                    {log.status === 'success' ? <CheckCircle2 size={16}/> : <XCircle size={16}/>}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-900 truncate max-w-[200px]">{log.code}</p>
                    <p className={`text-xs font-semibold mt-0.5 ${log.status === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>{log.message}</p>
                  </div>
                  <span className="text-[10px] font-bold text-gray-400">{log.time}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}