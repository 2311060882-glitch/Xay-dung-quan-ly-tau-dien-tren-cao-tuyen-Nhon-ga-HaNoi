// src/utils/mapIcons.ts
import L from 'leaflet';

// 1. Icon Ga tàu (Tròn, viền xanh, lõm trắng)
export const getStationIcon = (isSelected: boolean) => {
  return new L.DivIcon({
    html: `
      <div style="
        width: ${isSelected ? '16px' : '12px'}; 
        height: ${isSelected ? '16px' : '12px'}; 
        background: #ffffff; 
        border: ${isSelected ? '4px' : '3px'} solid #3b82f6; 
        border-radius: 50%; 
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        transition: all 0.3s ease;
      "></div>
    `,
    className: '',
    iconSize: isSelected ? [16, 16] : [12, 12],
    iconAnchor: isSelected ? [8, 8] : [6, 6],
  });
};

// 2. Icon Tàu điện (Thiết kế Flat UI, khối liền mạch, hiện đại)
export const getHanoiMetroIcon = (angle: number) => {
  return new L.DivIcon({
    html: `
      <div style="
        transform: rotate(${angle}deg); 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        filter: drop-shadow(0px 3px 5px rgba(0,0,0,0.4));
      ">
        <!-- Vỏ tàu nguyên khối màu xám đậm -->
        <div style="
          width: 48px; 
          height: 12px; 
          background: #1e293b; 
          border-radius: 6px; 
          display: flex; 
          padding: 1.5px; 
          gap: 2px;
        ">
          <!-- Toa đầu (Dải màu xanh mạ) -->
          <div style="flex: 1; background: #84cc16; border-radius: 4px 1px 1px 4px; position: relative;">
             <div style="position: absolute; right: 2px; top: 2px; bottom: 2px; width: 3px; background: rgba(255,255,255,0.9); border-radius: 1px;"></div>
          </div>
          <!-- Toa giữa -->
          <div style="flex: 1.2; background: #84cc16; border-radius: 1px;"></div>
          <!-- Toa đuôi -->
          <div style="flex: 1; background: #84cc16; border-radius: 1px 4px 4px 1px; position: relative;">
             <div style="position: absolute; left: 2px; top: 2px; bottom: 2px; width: 3px; background: rgba(255,255,255,0.9); border-radius: 1px;"></div>
          </div>
        </div>
      </div>
    `,
    className: '',
    iconSize: [48, 12],
    iconAnchor: [24, 6],
  });
};