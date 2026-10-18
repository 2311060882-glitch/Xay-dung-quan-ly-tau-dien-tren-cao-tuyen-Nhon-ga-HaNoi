import { useState} from 'react';
import { ArrowLeft, Wallet, PlusCircle, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function WalletPage(){
    const navigate = useNavigate();
    const [balance] = useState(5000);
    const [amount, setAmount] = useState<number | string>(' ');
    
    const handleTopUp = () => {
        if (!amount) return;
        alert(`Đã nạp thành công ${amount}đ vào ví nội bộ! (Demo)`);
        setAmount(' ');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex justify-center">
            <div className = "w-full max-w-md bg-white min-h-screen flex flex-col relative pb-28 shadow-xl">

                {/* Header */}
                <div className = "px-4 py-4 flex items-center gap-3 sticky top-0 z-10 bg-white">
                    <button onClick={() => navigate(-1)} className="p-1 -ml-1 hover:bg-gray-100 rounded-full transition">
            <ArrowLeft size={22} className="text-gray-800" />
            </button>
            <h1 className="text-base font-bold text-gray-900">Ví thanh toán nội bộ</h1>
        </div>

        <div className="px-4 mt-2">
          {/* Card Số Dư */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-5 text-white shadow-lg shadow-blue-500/30 mb-6">
            <div className="flex items-center gap-2 mb-2 opacity-90">
                <Wallet size={18} />
                <span className="text-sm font-medium">Số dư khả dụng</span>
            </div>
            <h2 className="text-3xl font-black">{balance.toLocaleString('vi-VN')} đ</h2>
            </div>

          {/* Khu vực nạp tiền */}
            <h3 className="font-bold text-gray-800 mb-3 text-sm">Nạp tiền vào ví</h3>
            <div className="grid grid-cols-3 gap-2 mb-4">
            {[20000, 50000, 100000, 200000, 500000].map((val) => (
                <button
                key={val}
                onClick={() => setAmount(val)}
                className={`py-2 rounded-xl text-sm font-bold border transition ${
                    amount === val ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-gray-200 text-gray-600'
                }`}
                >
                {val.toLocaleString('vi-VN')}đ
                </button>
            ))}
            </div>

            <div className="flex gap-2 mb-8">
            <input 
                type="number" 
                placeholder="Nhập số tiền khác..." 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-blue-500"
            />
            <button 
                onClick={handleTopUp}
                className="bg-blue-600 text-white px-5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition active:scale-95"
            >
                <PlusCircle size={18} /> Nạp
            </button>
            </div>

          {/* Lịch sử giao dịch */}
            <div className="flex items-center gap-2 mb-3">
            <History size={18} className="text-gray-500" />
            <h3 className="font-bold text-gray-800 text-sm">Giao dịch gần đây</h3>
            </div>
            <div className="space-y-3">
            {/* Giả lập list */}
            <div className="flex justify-between items-center p-3 border border-gray-100 rounded-xl bg-gray-50">
                <div>
                <p className="text-sm font-bold text-gray-800">Mua vé tháng Tuyến 2A</p>
                <p className="text-xs text-gray-500">10/10/2026 - 14:30</p>
                </div>
                <p className="text-sm font-bold text-red-500">- 200.000 đ</p>
            </div>
            </div>
        </div>
        </div>
    </div>
    )
    
}