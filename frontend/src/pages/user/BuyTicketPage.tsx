import { useState, useEffect } from 'react';
import { ArrowLeft, Ticket, CreditCard, User, Award, ChevronDown, MapPin, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ticketApi } from '../../api/ticket.api';
import { registrationApi } from '../../api/registration.api';

interface MetroLine {
  id: number;
  name: string;
  code: string;
  color: string;
}

interface Station {
  id: number;
  name: string;
}

interface TicketOption {
  id: number;
  name: string;
  price: number;
  desc: string;
}

interface ApiResponsePayload {
  success?: boolean;
  status?: boolean | number;
  message?: string;
  data?: unknown;
}

interface AxiosErrorShape {
  response?: {
    status?: number;
    data?: ApiResponsePayload;
  };
}

const METRO_LINES: MetroLine[] = [
  { id: 1, name: 'Tuyến 3.1: Nhổn - Ga Hà Nội', code: '3.1', color: '#ff5a00' },
  { id: 2, name: 'Tuyến 2A: Cát Linh - Hà Đông', code: '2A', color: '#059669' },
];

const STATIONS_BY_LINE: Record<number, Station[]> = {
  1: [
    { id: 1, name: 'Nhổn' },
    { id: 2, name: 'Minh Khai' },
    { id: 3, name: 'Phú Diễn' },
    { id: 4, name: 'Cầu Diễn' },
    { id: 5, name: 'Lê Đức Thọ' },
    { id: 6, name: 'Đại học Quốc Gia' },
    { id: 7, name: 'Chùa Hà' },
    { id: 8, name: 'Cầu Giấy' },
  ],
  2: [
    { id: 9, name: 'Cát Linh' },
    { id: 10, name: 'La Thành' },
    { id: 11, name: 'Thái Hà' },
    { id: 12, name: 'Láng' },
    { id: 13, name: 'Thượng Đình' },
    { id: 14, name: 'Vành Đai 3' },
    { id: 15, name: 'Hà Đông' },
  ]
};

const NORMAL_TICKETS: TicketOption[] = [
  { id: 1, name: 'Vé lượt (Đi 1 lần)', price: 15000, desc: 'Có giá trị sử dụng trong ngày' },
  { id: 2, name: 'Vé ngày', price: 30000, desc: 'Không giới hạn lượt đi trong 24h' },
  { id: 3, name: 'Vé 01 tháng (Phổ thông)', price: 200000, desc: 'Có giá trị 30 ngày kể từ lúc mua' },
];

const PRIORITY_TICKETS: TicketOption[] = [
  { id: 4, name: 'Vé tháng (Ưu tiên - HSSV)', price: 100000, desc: 'Giảm 50% cho HSSV, NCT, Công nhân KCN' },
];

export default function BuyTicketPage() {
  const navigate = useNavigate();
  const [selectedLineId, setSelectedLineId] = useState<number>(1);
  const [isLineDropdownOpen, setIsLineDropdownOpen] = useState<boolean>(false);
  const [customerType, setCustomerType] = useState<'normal' | 'priority'>('normal');
  const [selectedTicketTypeId, setSelectedTicketTypeId] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Trạng thái kiểm tra hồ sơ ưu tiên
  const [isPriorityApproved, setIsPriorityApproved] = useState<boolean>(false);
  const [checkingPriority, setCheckingPriority] = useState<boolean>(true);

  // State chọn Ga đi & Ga đến cho Vé lượt
  const stations = STATIONS_BY_LINE[selectedLineId] || [];
  const [originStationId, setOriginStationId] = useState<number>(stations[0]?.id || 1);
  const [destinationStationId, setDestinationStationId] = useState<number>(stations[1]?.id || 2);

  // Kiểm tra lịch sử đăng ký ưu tiên của user
  useEffect(() => {
    const checkPriorityStatus = async () => {
      try {
        const res = await registrationApi.getHistory();
        if (res.data?.success && Array.isArray(res.data?.data)) {
          // Kiểm tra xem có đơn đăng ký nào đã được APPROVED không
          const approved = res.data.data.some(
            (item: { status?: string }) => item.status === 'APPROVED'
          );
          setIsPriorityApproved(approved);
        }
      } catch (error) {
        console.error('Không thể kiểm tra trạng thái ưu tiên:', error);
      } finally {
        setCheckingPriority(false);
      }
    };

    checkPriorityStatus();
  }, []);

  const selectedLine = METRO_LINES.find(l => l.id === selectedLineId) || METRO_LINES[0];
  const activeTickets = customerType === 'normal' ? NORMAL_TICKETS : PRIORITY_TICKETS;
  const currentTicket = activeTickets.find(t => t.id === selectedTicketTypeId) || activeTickets[0];
  const currentPrice = currentTicket.price;

  const handleSelectCustomerType = (type: 'normal' | 'priority') => {
    setCustomerType(type);
    if (type === 'normal') {
      setSelectedTicketTypeId(1);
    } else {
      setSelectedTicketTypeId(4);
    }
  };

  const handleBuyTicket = async () => {
    // Kiểm tra client-side trước khi gửi
    if (customerType === 'priority' && !isPriorityApproved) {
      if (confirm('Tài khoản của bạn chưa được duyệt hồ sơ ưu tiên. Bạn có muốn gửi đơn đăng ký ngay bây giờ không?')) {
        navigate('/registration/new');
      }
      return;
    }

    try {
      setIsSubmitting(true);

      const payload: {
        line_id: number;
        ticket_type_id: number;
        origin_station_id?: number;
        destination_station_id?: number;
      } = {
        line_id: selectedLineId,
        ticket_type_id: currentTicket.id,
      };

      if (currentTicket.id === 1) {
        if (originStationId === destinationStationId) {
          alert('Ga đi và Ga đến không được trùng nhau!');
          setIsSubmitting(false);
          return;
        }
        payload.origin_station_id = originStationId;
        payload.destination_station_id = destinationStationId;
      }

      const res = await ticketApi.buyTicket(payload);

      const resData = res.data as ApiResponsePayload | undefined;
      const isSuccess = 
        resData?.success === true || 
        resData?.status === true || 
        resData?.status === 200 || 
        resData?.status === 201;

      if (isSuccess) {
        alert(`Mua vé thành công! Đã trừ ${currentPrice.toLocaleString('vi-VN')}đ từ ví.`);
        navigate('/tickets');
      } else {
        alert(resData?.message || 'Không thể mua vé.');
      }
    } catch (error: unknown) {
      const apiError = error as AxiosErrorShape;
      const statusCode = apiError.response?.status;
      const backendMessage = apiError.response?.data?.message;

      if (statusCode === 403 || (backendMessage && backendMessage.includes('chưa được duyệt'))) {
        if (confirm(`${backendMessage || 'Bạn chưa được duyệt đối tượng ưu tiên.'}\n\nBạn có muốn chuyển tới trang Đăng ký ưu tiên không?`)) {
          navigate('/registration/new');
        }
      } else if (backendMessage) {
        alert(backendMessage);
      } else {
        alert('Lỗi hệ thống khi gửi yêu cầu mua vé.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      <div className="w-full max-w-md bg-white min-h-screen flex flex-col relative pb-28 shadow-xl">
        
        {/* Header */}
        <div className="px-4 py-4 flex items-center gap-3 sticky top-0 z-10 bg-white border-b border-gray-100">
          <button onClick={() => navigate(-1)} className="p-1 -ml-1 hover:bg-gray-100 rounded-full transition cursor-pointer">
            <ArrowLeft size={22} className="text-gray-800" />
          </button>
          <h1 className="text-base font-bold text-gray-900">Mua vé tàu</h1>
        </div>

        <div className="px-4 pt-4 flex-1">
          
          {/* 1. CHỌN TUYẾN METRO */}
          <div className="mb-6 relative z-30">
            <h2 className="text-sm font-bold text-gray-800 mb-2">1. Chọn tuyến Metro</h2>
            <button
              type="button"
              onClick={() => setIsLineDropdownOpen(!isLineDropdownOpen)}
              className="w-full flex items-center justify-between p-3.5 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-all active:scale-[0.99] cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span 
                  className="text-xs font-extrabold px-2.5 py-1 rounded-md text-white shadow-xs"
                  style={{ backgroundColor: selectedLine.color }}
                >
                  {selectedLine.code}
                </span>
                <span className="text-sm font-bold text-gray-800 text-left truncate">
                  {selectedLine.name}
                </span>
              </div>
              <ChevronDown 
                size={18} 
                className={`text-gray-500 shrink-0 transition-transform duration-300 ${isLineDropdownOpen ? 'rotate-180' : ''}`} 
              />
            </button>

            {isLineDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden z-50">
                {METRO_LINES.map((line) => (
                  <button
                    key={line.id}
                    type="button"
                    onClick={() => {
                      setSelectedLineId(line.id);
                      setIsLineDropdownOpen(false);
                      const newStations = STATIONS_BY_LINE[line.id] || [];
                      if (newStations.length >= 2) {
                        setOriginStationId(newStations[0].id);
                        setDestinationStationId(newStations[1].id);
                      }
                    }}
                    className={`w-full flex items-center gap-3 p-3.5 border-b border-gray-50 last:border-0 hover:bg-blue-50 transition-colors cursor-pointer ${
                      selectedLineId === line.id ? 'bg-blue-50/70' : ''
                    }`}
                  >
                    <span 
                      className="text-xs font-extrabold px-2.5 py-1 rounded-md text-white shadow-xs"
                      style={{ backgroundColor: line.color }}
                    >
                      {line.code}
                    </span>
                    <span className={`text-sm text-left truncate ${selectedLineId === line.id ? 'font-bold text-blue-700' : 'font-medium text-gray-700'}`}>
                      {line.name}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 2. CHỌN NHÓM ĐỐI TƯỢNG */}
          <div className="mb-6 relative z-10">
            <h2 className="text-sm font-bold text-gray-800 mb-2">2. Nhóm đối tượng</h2>
            <div className="flex bg-gray-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => handleSelectCustomerType('normal')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                  customerType === 'normal' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <User size={16} /> Phổ thông
              </button>
              <button
                type="button"
                onClick={() => handleSelectCustomerType('priority')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                  customerType === 'priority' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Award size={16} /> Ưu tiên
              </button>
            </div>

            {/* Thông báo cảnh báo khi chọn nhóm Ưu tiên nhưng chưa được duyệt */}
            {customerType === 'priority' && !checkingPriority && !isPriorityApproved && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5">
                <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs font-bold text-amber-800">Tài khoản chưa được duyệt ưu tiên</p>
                  <p className="text-[11px] text-amber-700 mt-0.5 leading-snug">
                    Bạn cần đăng ký thông tin đối tượng ưu tiên và chờ quản trị viên duyệt trước khi mua vé này.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate('/registration/new')}
                    className="mt-2 text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                  >
                    Đăng ký đối tượng ưu tiên ngay &rarr;
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 3. CHỌN LOẠI VÉ */}
          <div className="mb-6 relative z-10">
            <h2 className="text-sm font-bold text-gray-800 mb-2">3. Chọn loại vé</h2>
            <div className="space-y-3">
              {activeTickets.map((ticket) => (
                <div 
                  key={ticket.id}
                  onClick={() => setSelectedTicketTypeId(ticket.id)}
                  className={`p-4 rounded-xl border-2 transition cursor-pointer flex justify-between items-center ${
                    selectedTicketTypeId === ticket.id ? 'border-blue-500 bg-blue-50' : 'border-gray-100 bg-white hover:border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${selectedTicketTypeId === ticket.id ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                      <Ticket size={20} />
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${selectedTicketTypeId === ticket.id ? 'text-blue-700' : 'text-gray-800'}`}>
                        {ticket.name}
                      </p>
                      <p className="text-[11px] text-gray-500 mt-0.5 max-w-50 leading-tight">{ticket.desc}</p>
                    </div>
                  </div>
                  <p className="text-sm font-black text-gray-900">{`${ticket.price.toLocaleString('vi-VN')} đ`}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 4. CHỌN GA ĐI / GA ĐẾN (Vé lượt) */}
          {selectedTicketTypeId === 1 && (
            <div className="mb-6 p-4 bg-blue-50/50 border border-blue-100 rounded-2xl relative z-10">
              <h2 className="text-sm font-bold text-blue-900 mb-3 flex items-center gap-2">
                <MapPin size={16} className="text-blue-600" /> Chọn chặng đi (Vé lượt)
              </h2>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Ga đi</label>
                  <select
                    value={originStationId}
                    onChange={(e) => setOriginStationId(Number(e.target.value))}
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {stations.map((st) => (
                      <option key={st.id} value={st.id}>{st.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Ga đến</label>
                  <select
                    value={destinationStationId}
                    onChange={(e) => setDestinationStationId(Number(e.target.value))}
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {stations.map((st) => (
                      <option key={st.id} value={st.id}>{st.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* KHUNG THANH TOÁN */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-100 p-4 z-20 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-gray-500">Tổng thanh toán:</span>
            <span className="text-xl font-black text-blue-600">{`${currentPrice.toLocaleString('vi-VN')} đ`}</span>
          </div>
          <button 
            type="button"
            onClick={handleBuyTicket}
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl flex justify-center items-center gap-2 hover:bg-blue-700 active:scale-[0.98] transition cursor-pointer disabled:opacity-50"
          >
            <CreditCard size={20} /> {isSubmitting ? 'Đang xử lý...' : 'Thanh toán qua Ví nội bộ'}
          </button>
        </div>

      </div>
    </div>
  );
}