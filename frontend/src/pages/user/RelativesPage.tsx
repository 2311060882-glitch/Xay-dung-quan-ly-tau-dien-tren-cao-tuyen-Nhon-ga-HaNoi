import { useEffect, useState } from 'react';
import { relativesApi, type CreateRelativeData } from '../../api/relatives.api';
import { ArrowLeft, UserPlus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Relative {
  id: number;
  full_name: string;
  id_card: string;
  date_of_birth: string;
  type: string;
}

export default function RelativesPage() {
  const navigate = useNavigate();
  const [relatives, setRelatives] = useState<Relative[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<CreateRelativeData>({
    full_name: '', id_card: '', date_of_birth: '', type: 'ADULT'
  });

  const fetchRelatives = () => {
    relativesApi.getRelatives()
      .then(res => setRelatives(res.data.data || []))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    let isActive = true;
    relativesApi.getRelatives().then(res => {
      if (isActive) setRelatives(res.data.data || []);
    });
    return () => { isActive = false; };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await relativesApi.createRelative(formData);
      setShowForm(false);
      fetchRelatives();
      setFormData({ full_name: '', id_card: '', date_of_birth: '', type: 'ADULT' });
    } catch (error) {
      console.error(error);
      alert('Lỗi thêm người thân!');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Xóa thông tin người thân này?')) return;
    try {
      await relativesApi.deleteRelative(id);
      fetchRelatives();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 max-w-md mx-auto relative shadow-lg">
      <div className="bg-primary pt-8 pb-6 px-4 text-white rounded-b-[28px] flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 bg-white/10 rounded-full hover:bg-white/20">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-bold">Định danh hộ</h1>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)} 
          className="bg-white/20 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1"
        >
          <UserPlus size={14} /> {showForm ? 'Đóng' : 'Thêm'}
        </button>
      </div>

      <div className="p-4 space-y-4">
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase">Thông tin người thân</h3>
            <input required placeholder="Họ tên" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} className="w-full text-sm border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary" />
            <input required placeholder="CCCD / Định danh" value={formData.id_card} onChange={e => setFormData({...formData, id_card: e.target.value})} className="w-full text-sm border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary" />
            <input required type="date" value={formData.date_of_birth} onChange={e => setFormData({...formData, date_of_birth: e.target.value})} className="w-full text-sm border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary" />
            <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as CreateRelativeData['type']})} className="w-full text-sm border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary">
              <option value="ADULT">Người lớn</option>
              <option value="CHILD">Trẻ em</option>
              <option value="STUDENT">Học sinh / Sinh viên</option>
              <option value="SENIOR">Người cao tuổi</option>
            </select>
            <button type="submit" className="w-full bg-primary text-white font-bold py-3 rounded-xl text-sm shadow-md">Lưu thông tin</button>
          </form>
        )}

        {relatives.length === 0 ? (
          <p className="text-center text-gray-400 py-8 text-sm">Chưa đăng ký người thân nào</p>
        ) : (
          relatives.map(r => (
            <div key={r.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
              <div>
                <h4 className="font-bold text-gray-800 text-sm">{r.full_name}</h4>
                <p className="text-xs text-gray-400">CCCD: {r.id_card}</p>
                <span className="inline-block mt-2 text-[10px] bg-blue-50 text-primary font-bold px-2 py-0.5 rounded-full">{r.type}</span>
              </div>
              <button onClick={() => handleDelete(r.id)} className="text-red-400 hover:text-red-600 p-2">
                <Trash2 size={18} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}