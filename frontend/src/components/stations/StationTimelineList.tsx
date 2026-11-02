// src/components/stations/StationTimelineList.tsx
import { MapPin, Radio, Train } from 'lucide-react';
import { type Station } from '../../data/stationsData';
import { type ActiveTrain } from '../../hooks/useMultiTrainSimulation';

interface Props {
  stations: Station[];
  trains: ActiveTrain[];
  onSelectStation: (name: string) => void;
}

export function StationTimelineList({ stations, trains, onSelectStation }: Props) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Lịch trình & Vị trí Real-time</h2>
        <span className="text-[11px] text-primary font-bold flex items-center gap-1">
          <Radio size={12} className="animate-pulse" /> Live Tracking
        </span>
      </div>

      <div className="pl-3 relative">
        <div className="absolute top-4 bottom-8 left-[19px] w-[4px] bg-blue-100 z-0"></div>

        <div className="space-y-8 relative z-10">
          {stations.map((s: Station, index: number) => {
            const trainsAtStation = trains.filter((t: ActiveTrain) => t.stationIndex === index);

            return (
              <div key={index} className="relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-4 h-4 rounded-full transition-all duration-300 ${
                      trainsAtStation.length > 0 ? 'bg-primary border-4 border-blue-200 scale-125' : 'bg-white border-2 border-blue-500'
                    }`}></div>
                    
                    <div>
                      <span className={`font-bold text-sm block ${trainsAtStation.length > 0 ? 'text-primary font-extrabold' : 'text-gray-800'}`}>
                        {s.name}
                      </span>
                      <span className="text-[10px] text-gray-400 font-medium">{s.code}</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => onSelectStation(s.name)}
                    className="text-xs text-primary font-medium bg-blue-50 px-2.5 py-1 rounded-full flex items-center gap-1 hover:bg-blue-100"
                  >
                    <MapPin size={12} /> Vị trí
                  </button>
                </div>

                {trainsAtStation.map((train: ActiveTrain) => (
                  <div 
                    key={train.id}
                    className="absolute -left-[5px] top-7 z-20 flex items-center gap-2 transition-all duration-500"
                    style={{ transform: `translateY(${train.progress * 0.28}px)` }}
                  >
                    <div className="bg-orange-500 text-white p-1.5 rounded-full shadow-lg shadow-orange-300 animate-bounce">
                      <Train size={16} />
                    </div>
                    <span className="bg-orange-50 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-orange-200 shadow-sm flex items-center gap-1">
                      <strong>{train.code}</strong> ({train.progress}%)
                    </span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}