// src/data/stationsData.ts
export interface Station {
  name: string;
  code: string;
  lat: number;
  lng: number;
}

export interface MetroLine {
  id: string;
  name: string;
  color: string;
  stations: Station[];
}

export const METRO_LINES: MetroLine[] = [
  {
    id: 'line-2a',
    name: 'Tuyến 2A: Cát Linh - Hà Đông',
    color: '#2563eb', // Blue
    stations: [
      { name: 'Cát Linh(2A)', code: 'ST01', lat: 21.0282, lng: 105.8285 },
      { name: 'La Thành', code: 'ST02', lat: 21.0225, lng: 105.8228 },
      { name: 'Thái Hà', code: 'ST03', lat: 21.0168, lng: 105.8182 },
      { name: 'Láng', code: 'ST04', lat: 21.0105, lng: 105.8130 },
      { name: 'Thượng Đình', code: 'ST05', lat: 21.0008, lng: 105.8115 },
      { name: 'Vành Đai 3', code: 'ST06', lat: 20.9935, lng: 105.8052 },
      { name: 'Phùng Khoang', code: 'ST07', lat: 20.9882, lng: 105.7985 },
      { name: 'Văn Quán', code: 'ST08', lat: 20.9805, lng: 105.7908 },
      { name: 'Hà Đông', code: 'ST09', lat: 20.9732, lng: 105.7825 }
    ]
  },
  {
    id: 'line-31',
    name: 'Tuyến 3.1: Nhổn - Ga Hà Nội',
    color: '#16a34a', // Green
    stations: [
      { name: 'Nhổn', code: 'N01', lat: 21.0538, lng: 105.7351 },
      { name: 'Minh Khai', code: 'N02', lat: 21.0482, lng: 105.7462 },
      { name: 'Phú Diễn', code: 'N03', lat: 21.0435, lng: 105.7588 },
      { name: 'Cầu Diễn', code: 'N04', lat: 21.0381, lng: 105.7682 },
      { name: 'Lê Đức Thọ', code: 'N05', lat: 21.0345, lng: 105.7768 },
      { name: 'Đại học Quốc Gia', code: 'N06', lat: 21.0368, lng: 105.7831 },
      { name: 'Chùa Hà', code: 'N07', lat: 21.0352, lng: 105.7932 },
      { name: 'Cầu Giấy', code: 'N08', lat: 21.0301, lng: 105.8025 }
    ]
  }
];

export const CAT_LINH_HA_DONG_STATIONS: Station[] = METRO_LINES[0].stations;