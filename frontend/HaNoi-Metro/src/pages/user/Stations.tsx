// src/pages/Stations.tsx
import { useState } from 'react';
import { List, Map as MapIcon, ChevronDown } from 'lucide-react';
import { type MetroLine, METRO_LINES } from '../../data/stationsData';
import { useMultiTrainSimulation } from '../../hooks/useMultiTrainSimulation';
import { StationTimelineList } from '../../components/stations/StationTimelineList';
import { InteractiveMetroMap } from '../../components/stations/InteractiveMetroMap';

export default function Stations() {
  const [selectedLine, setSelectedLine] = useState<MetroLine>(METRO_LINES[0]);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [selectedStation, setSelectedStation] = useState<string>(selectedLine.stations[0].name);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const { trains } = useMultiTrainSimulation(selectedLine.stations);

  const handleLineChange = (line: MetroLine) => {
    setSelectedLine(line);
    setSelectedStation(line.stations[0]?.name || '');
  };

  return (
    // Lớp nền phía sau (màu hơi tối/xám để làm nổi bật bảng trắng lên)
    <div className="min-h-screen bg-gray-200 pt-6 pb-28">
      
      {/* Khối Bottom Sheet (Màu trắng, bo góc to ở trên, có bóng đổ 3D) */}
      <div className="bg-white min-h-screen rounded-t-[32px] shadow-[0_-8px_30px_rgba(0,0,0,0.12)] px-4 pt-3 relative">
        
        {/* THANH VUỐT (DRAG HANDLE) TẠI ĐÂY */}
        <div className="w-full flex justify-center mb-5">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
        </div>

        {/* Header & Mode Switcher */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold text-gray-800">Tìm ga & Vị trí tàu</h1>
          <div className="bg-gray-100 p-1 rounded-xl flex gap-1">
            <button 
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'
              }`}
            >
              <List size={14} /> Trực quan
            </button>
            <button 
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === 'map' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'
              }`}
            >
              <MapIcon size={14} /> Bản đồ Live
            </button>
          </div>
        </div>

        {/* CUSTOM DROPDOWN CHỌN TUYẾN XỊN XÒ */}
        <div className="mb-5 relative z-50">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2 px-1">
            Tuyến Metro vận hành
          </span>
          
          {/* Nút bấm để xổ menu */}
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex items-center justify-between p-3.5 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 transition-all active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <span 
                className="text-xs font-extrabold px-2 py-0.5 rounded text-white"
                style={{ backgroundColor: selectedLine.color || '#3b82f6' }}
              >
                {selectedLine.name.split(':')[0].replace('Tuyến ', '')}
              </span>
              <span className="text-sm font-bold text-gray-800 text-left truncate">
                {selectedLine.name}
              </span>
            </div>
            <ChevronDown 
              size={18} 
              className={`text-gray-500 flex-shrink-0 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} 
            />
          </button>

          {/* Danh sách xổ xuống */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.1)] overflow-hidden">
              {METRO_LINES.map((line) => (
                <button
                  key={line.id}
                  onClick={() => {
                    handleLineChange(line);
                    setIsDropdownOpen(false); // Đóng menu sau khi chọn
                  }}
                  className={`w-full flex items-center gap-3 p-3.5 border-b border-gray-50 last:border-0 hover:bg-blue-50 transition-colors ${
                    selectedLine.id === line.id ? 'bg-blue-50/50' : ''
                  }`}
                >
                  <span 
                    className="text-xs font-extrabold px-2 py-0.5 rounded text-white"
                    style={{ backgroundColor: line.color || '#3b82f6' }}
                  >
                    {line.name.split(':')[0].replace('Tuyến ', '')}
                  </span>
                  <span className={`text-sm text-left truncate ${selectedLine.id === line.id ? 'font-bold text-blue-700' : 'font-medium text-gray-700'}`}>
                    {line.name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content chính: List hoặc Map */}
        {viewMode === 'list' ? (
          <StationTimelineList 
            stations={selectedLine.stations} 
            trains={trains} 
            onSelectStation={(name) => {
              setSelectedStation(name);
              setViewMode('map');
            }} 
          />
        ) : (
          <InteractiveMetroMap 
            stations={selectedLine.stations} 
            trains={trains} 
            selectedStation={selectedStation} 
            onSelectStation={setSelectedStation} 
          />
        )}
      
      </div>
    </div>
  );
}