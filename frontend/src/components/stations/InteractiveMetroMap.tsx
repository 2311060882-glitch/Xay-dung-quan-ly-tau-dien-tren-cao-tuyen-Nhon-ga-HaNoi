// src/components/stations/InteractiveMetroMap.tsx
import { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { type Station } from '../../data/stationsData';
import { type ActiveTrain } from '../../hooks/useMultiTrainSimulation';
import { getHanoiMetroIcon, getStationIcon } from '../../utils/mapIcons';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Props {
  stations: Station[];
  trains: ActiveTrain[];
  selectedStation?: string;
  onSelectStation: (name: string) => void;
}

export function InteractiveMetroMap({ stations, trains, selectedStation, onSelectStation }: Props) {
  // 1. KHAI BÁO CÁC HOOK Ở ĐẦU COMPONENT (Chạy không điều kiện)
  const lineCoordinates: [number, number][] = useMemo(() => {
    if (!stations) return [];
    return stations.map(s => [s.lat, s.lng]);
  }, [stations]);

  // 2. CHECK AN TOÀN ĐẶT DƯỚI CÁC HOOK
  if (!stations || stations.length === 0) {
    return <div className="p-4 text-center text-gray-500">Đang tải dữ liệu bản đồ...</div>;
  }

  const centerPosition: [number, number] = [stations[0].lat, stations[0].lng];

  return (
    <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 mt-4">
      <div className="flex justify-between items-center mb-3 px-1">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Live GPS Tracking</span>
        <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span> Real-time
        </span>
      </div>
      
      <div className="w-full h-[450px] rounded-xl overflow-hidden border border-gray-200 z-0 relative">
        <MapContainer center={centerPosition} zoom={13} style={{ height: '100%', width: '100%', zIndex: 0 }}>
          <TileLayer
            attribution='&copy; Google Maps'
            url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
          />
          
          <Polyline positions={lineCoordinates} color="#3b82f6" weight={4} opacity={0.8} />

          {/* VẼ CÁC GA */}
          {stations.map((station, idx) => (
            <Marker 
              key={idx} 
              position={[station.lat, station.lng]} 
              icon={getStationIcon(selectedStation === station.name)}
              eventHandlers={{ click: () => onSelectStation(station.name) }}
            >
              <Popup><strong>{station.name}</strong><br/>Mã ga: {station.code}</Popup>
            </Marker>
          ))}

          {/* VẼ TÀU CHẠY */}
          {trains.map((train) => {
            if (train.stationIndex >= stations.length) return null;
            
            const currentStation = stations[train.stationIndex];
            const nextIndex = train.direction === 'forward' 
              ? Math.min(train.stationIndex + 1, stations.length - 1)
              : Math.max(train.stationIndex - 1, 0);
            
            const nextStation = stations[nextIndex];
            if (!currentStation || !nextStation) return null;

            const currentLat = currentStation.lat + ((nextStation.lat - currentStation.lat) * (train.progress / 100));
            const currentLng = currentStation.lng + ((nextStation.lng - currentStation.lng) * (train.progress / 100));

            const dx = nextStation.lng - currentStation.lng;
            const dy = -(nextStation.lat - currentStation.lat);
            const angle = Math.atan2(dy, dx) * (180 / Math.PI);

            return (
              <Marker 
                key={train.id} 
                position={[currentLat, currentLng]} 
                icon={getHanoiMetroIcon(angle)}
                zIndexOffset={1000}
              >
                <Popup>
                  <strong>Tàu {train.code}</strong><br/>
                  Trạng thái: <span className="text-orange-600 font-bold">{train.status === 'waiting' ? 'Đang dừng tại ga' : 'Đang di chuyển'}</span>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}