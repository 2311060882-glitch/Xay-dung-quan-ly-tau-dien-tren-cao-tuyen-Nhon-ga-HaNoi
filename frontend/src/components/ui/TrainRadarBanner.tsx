// src/components/ui/TrainRadarBanner.tsx
import { Zap, Clock } from 'lucide-react';

interface TrainRadarBannerProps {
  currentStation: string;
  nextStation: string;
  estimatedMinutes: number;
}

export function TrainRadarBanner({ currentStation, nextStation, estimatedMinutes }: TrainRadarBannerProps) {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4 rounded-2xl shadow-md mb-5 relative overflow-hidden">
      <div className="flex justify-between items-start mb-2 z-10 relative">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-100">
            Trạng thái: Ở {currentStation}
          </span>
        </div>
        <span className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
          <Zap size={10} /> 38 km/h
        </span>
      </div>

      <div className="flex justify-between items-end z-10 relative mt-3">
        <div>
          <p className="text-xs text-blue-200">Ga kế tiếp:</p>
          <p className="text-lg font-extrabold text-white">{nextStation}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-blue-200 flex items-center justify-end gap-1"><Clock size={12}/> Dự kiến đến:</p>
          <p className="text-sm font-bold text-yellow-300">{estimatedMinutes} phút nữa</p>
        </div>
      </div>
    </div>
  );
}