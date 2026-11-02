import { useEffect, useState } from 'react';
import { adminReportsApi, type TicketSalesQuery } from '../../api/admin.reports.api';

interface ReportData {
  label: string;
  total_tickets: number;
  total_revenue: number;
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<TicketSalesQuery>({ group_by: 'day' });

  const fetchReport = () => {
    setLoading(true);
    adminReportsApi.getTicketSales(filter)
      .then(res => setReports(res.data.data || []))
      .catch(err => console.error('Lỗi tải báo cáo:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let isActive = true;
    adminReportsApi.getTicketSales(filter)
      .then(res => {
        if (isActive) setReports(res.data.data || []);
      })
      .catch(err => console.error(err))
      .finally(() => {
        if (isActive) setLoading(false);
      });
    return () => { isActive = false; };
  }, [filter]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Thống kê & Báo cáo doanh thu</h2>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-wrap gap-4 items-center">
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1">Nhóm theo</label>
          <select 
            value={filter.group_by} 
            onChange={e => setFilter({ ...filter, group_by: e.target.value as TicketSalesQuery['group_by'] })}
            className="border border-gray-200 p-2 rounded-lg text-sm font-medium"
          >
            <option value="day">Theo ngày</option>
            <option value="line">Theo tuyến tàu</option>
            <option value="ticket_type">Theo loại vé</option>
          </select>
        </div>
        <button 
          onClick={fetchReport} 
          className="mt-5 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-700"
        >
          Lọc báo cáo
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-500 py-8">Đang tải số liệu báo cáo...</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase">
                <th className="p-4">Tiêu chí</th>
                <th className="p-4 text-center">Số vé bán ra</th>
                <th className="p-4 text-right">Tổng doanh thu (VNĐ)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {reports.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-6 text-center text-gray-400">Không có dữ liệu báo cáo</td>
                </tr>
              ) : (
                reports.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="p-4 font-bold text-gray-800">{item.label}</td>
                    <td className="p-4 text-center font-semibold text-blue-600">{item.total_tickets} vé</td>
                    <td className="p-4 text-right font-bold text-green-600">
                      {Number(item.total_revenue).toLocaleString('vi-VN')} đ
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}