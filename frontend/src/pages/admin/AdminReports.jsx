import { useState, useEffect, useMemo } from 'react';
import axios from '../../api/axios';
import { BarChart, Bar, LabelList, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import * as XLSX from 'xlsx';

const AdminReports = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalCars: 0,
    avgRevenue: 0,
  });
  const [revenueData, setRevenueData] = useState([]);
  const [statusStats, setStatusStats] = useState([]);
  const [topCars, setTopCars] = useState([]);
  const [ordersRaw, setOrdersRaw] = useState([]); // store raw orders for aggregation
  const [granularity, setGranularity] = useState('day'); // 'day' | 'month' | 'year'
  const [topN, setTopN] = useState(3); // top 3 or 5
  const [loading, setLoading] = useState(true);

  // Helper function to safely extract array data from various response formats
  const extractArrayData = (response) => {
    if (!response) return [];
    // handle case axios returned array directly or a wrapped response
    if (Array.isArray(response)) return response;
    if (response.data === undefined || response.data === null) return [];
    const data = response.data;
    
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.data)) return data.data;
    if (data.content && Array.isArray(data.content)) return data.content;
    return [];
  };

  useEffect(() => {
    fetchReportsData();
  }, []);

  const fetchReportsData = async () => {
    try {
      setLoading(true);
      const [orders, cars, categories] = await Promise.all([
        axios.get('/orders'),
        axios.get('/cars'),
        axios.get('/categories'),
      ]);

      const ordersData = extractArrayData(orders);
      const carsData = extractArrayData(cars);
      const categoriesData = extractArrayData(categories);

      // store raw orders for aggregation
      setOrdersRaw(ordersData);

      // Calculate stats
      const totalRevenue = ordersData.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
      const avgRevenue = ordersData.length > 0 
        ? totalRevenue / ordersData.length 
        : 0;

      setStats({
        totalRevenue,
        totalCars: carsData.length,
        avgRevenue,
      });

      // 1. Revenue data (grouped by date using ISO key for reliable sorting)
      const revenueByDate = {};
      ordersData.forEach(order => {
        if (!order.orderDate) return;
        const d = new Date(order.orderDate);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const key = `${yyyy}-${mm}-${dd}`; // sortable key
        const label = d.toLocaleDateString('vi-VN');
        if (!revenueByDate[key]) revenueByDate[key] = { label, revenue: 0 };
        revenueByDate[key].revenue += Number(order.totalAmount || 0);
      });
      
      const chartData = Object.entries(revenueByDate)
        .map(([key, { label, revenue }]) => ({
          key,
          date: label,
          revenue: Math.round(revenue / 1000000),
        }))
        .sort((a, b) => a.key.localeCompare(b.key));
      
      setRevenueData(chartData.length > 0 ? chartData : [{ date: 'Không có dữ liệu', revenue: 0 }]);

      // 2. Status stats (Pie chart)
      const statusCount = {};
      ordersData.forEach(order => {
        if (order.status) {
          statusCount[order.status] = (statusCount[order.status] || 0) + 1;
        }
      });

      const statusChartData = [
        { name: 'Chờ Xác Nhận', value: statusCount['PENDING'] || 0 },
        { name: 'Đang Giao', value: statusCount['DELIVERING'] || 0 },
        { name: 'Hoàn Thành', value: statusCount['COMPLETED'] || 0 },
        { name: 'Hủy', value: statusCount['CANCELLED'] || 0 },
      ].filter(s => s.value > 0);

      setStatusStats(statusChartData.length > 0 ? statusChartData : [
        { name: 'Chưa có dữ liệu', value: 1 }
      ]);

      // 3. Top cars (robust aggregation: support order.items, single order.car/carId, and compute sold count + revenue)
      const carAccum = {}; // { [carId]: { count: number, revenue: number } }
      ordersData.forEach(order => {
        // if order has items array, prefer per-item aggregation
        if (Array.isArray(order.items) && order.items.length > 0) {
          order.items.forEach(item => {
            const cid = item.carId ?? item.productId ?? item.id ?? item.car?.id;
            if (!cid) return;
            const qty = Number(item.quantity ?? item.qty ?? 1) || 1;
            const price = Number(item.price ?? item.unitPrice ?? item.totalAmount ?? 0) || 0;
            const itemRevenue = Number(item.totalAmount ?? (price * qty)) || (price * qty);
            if (!carAccum[cid]) carAccum[cid] = { count: 0, revenue: 0 };
            carAccum[cid].count += qty;
            carAccum[cid].revenue += itemRevenue;
          });
          return;
        }

        // fallback: single-car order
        const cid = order.carId ?? order.car?.id;
        if (cid) {
          if (!carAccum[cid]) carAccum[cid] = { count: 0, revenue: 0 };
          carAccum[cid].count += 1;
          carAccum[cid].revenue += Number(order.totalAmount ?? 0);
        }
      });

      const topCarsData = Object.entries(carAccum)
        .map(([carId, { count, revenue }]) => {
          const car = carsData.find(c => String(c.id) === String(carId));
          return {
            id: carId,
            name: car?.name || `Xe #${carId}`,
            count,
            revenue: revenue || 0,
            image: car?.imageUrl || car?.images?.[0] || null,
          };
        })
        .sort((a, b) => b.count - a.count || b.revenue - a.revenue)
        .slice(0, 10);

      setTopCars(topCarsData.length > 0 ? topCarsData : [
        { id: 'none', name: 'Chưa có dữ liệu bán hàng', count: 0, revenue: 0 }
      ]);

    } catch (err) {
      console.error('Error fetching reports:', err);
      // Set fallback data (ensure Pie chart has a visible slice)
      setRevenueData([{ date: 'Lỗi tải dữ liệu', revenue: 0 }]);
      setStatusStats([{ name: 'Lỗi tải dữ liệu', value: 1 }]);
      setTopCars([{ name: 'Lỗi tải dữ liệu', count: 0 }]);
    } finally {
      setLoading(false);
    }
  };

  // Aggregate orders by granularity
  const aggregatedData = useMemo(() => {
    if (!ordersRaw || ordersRaw.length === 0) return [];
    const map = {};
    ordersRaw.forEach(order => {
      if (!order.orderDate) return;
      const d = new Date(order.orderDate);
      let key, label;
      if (granularity === 'day') {
        key = d.toISOString().slice(0,10); // yyyy-mm-dd
        label = d.toLocaleDateString('vi-VN');
      } else if (granularity === 'month') {
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        key = `${year}-${month}`; // sortable
        label = new Intl.DateTimeFormat('vi-VN', { month: 'long', year: 'numeric' }).format(d);
      } else { // year
        const year = d.getFullYear();
        key = `${year}`;
        label = `${year}`;
      }
      if (!map[key]) map[key] = { period: label, orders: 0, revenue: 0 };
      map[key].orders += 1;
      map[key].revenue += Number(order.totalAmount || 0);
    });
    const arr = Object.entries(map).map(([k, v]) => ({ ...v, key: k }));
    arr.sort((a, b) => a.key.localeCompare(b.key));
    return arr;
  }, [ordersRaw, granularity]);

  // Export aggregatedData to Excel
  const exportAggregatedToExcel = () => {
    if (!aggregatedData || aggregatedData.length === 0) return;
    const wsData = aggregatedData.map(r => ({
      'Kỳ': r.period,
      'Số lượng đơn': r.orders,
      'Doanh thu (VND)': r.revenue,
    }));
    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Báo cáo');
    XLSX.writeFile(wb, `report_${granularity}_${Date.now()}.xlsx`);
  };

  // Export aggregatedData to PDF (dynamic import to avoid Vite failing to resolve at startup)
  const exportAggregatedToPDF = async () => {
    if (!aggregatedData || aggregatedData.length === 0) return;
    try {
      const mod = await import('jspdf');
      const { jsPDF } = mod;
      await import('jspdf-autotable');

      const doc = new jsPDF();
      const granularityLabel = granularity === 'day' ? 'ngày' : granularity === 'month' ? 'tháng' : 'năm';
      const title = `Báo cáo theo ${granularityLabel}`;
      doc.setFontSize(14);
      const pageWidth = doc.internal.pageSize.getWidth();
      doc.text(title, pageWidth / 2, 16, { align: 'center' });

      const body = aggregatedData.map(r => [r.period, r.orders, formatPrice(r.revenue)]);
      doc.autoTable({
        startY: 22,
        head: [['Kỳ', 'Số lượng đơn', 'Doanh thu']],
        body,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [31, 41, 55], textColor: [255, 255, 255] },
        columnStyles: {
          1: { halign: 'right' },
          2: { halign: 'right' },
        },
      });
      doc.save(`report_${granularity}_${Date.now()}.pdf`);
    } catch (e) {
      console.error('PDF export failed:', e);
      alert('Không thể xuất PDF. Vui lòng chạy: npm install jspdf jspdf-autotable hoặc dùng Export Excel.');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const formatMoneyShort = (price) => {
    const val = Number(price) || 0;
    if (val >= 1000000) {
      return Math.round(val / 1000000) + ' Tr đ';
    }
    return formatPrice(val);
  };

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Tổng Doanh Thu</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{formatMoneyShort(stats.totalRevenue)}</p>
              <p className="text-xs text-green-600 mt-1">+22.05% ↑</p>
            </div>
            <div className="text-5xl text-blue-600">💰</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Xe Đã Bán</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalCars}</p>
              <p className="text-xs text-green-600 mt-1">+18.2% ↑</p>
            </div>
            <div className="text-5xl text-purple-600">🚗</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Doanh Thu Trung Bình</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{formatMoneyShort(stats.avgRevenue)}</p>
              <p className="text-xs text-green-600 mt-1">+5.2% ↑</p>
            </div>
            <div className="text-5xl text-red-600">📈</div>
          </div>
        </div>
      </div>

      {/* Thống kê số lượng & doanh thu theo kỳ (moved to top) - Line chart with two lines */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">📊 Thống Kê Đơn Hàng Theo Kỳ</h2>
          <div className="flex items-center gap-3">
            <select value={granularity} onChange={(e) => setGranularity(e.target.value)} className="border rounded px-2 py-1">
              <option value="day">Theo ngày</option>
              <option value="month">Theo tháng</option>
              <option value="year">Theo năm</option>
            </select>
            <button onClick={exportAggregatedToExcel} className="bg-green-500 text-white px-3 py-1 rounded">Export Excel</button>
            <button onClick={exportAggregatedToPDF} className="bg-red-500 text-white px-3 py-1 rounded">Export PDF</button>
          </div>
        </div>

        {aggregatedData && aggregatedData.length > 0 ? (
          <div className="space-y-4">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart
                data={aggregatedData.map(a => ({
                  period: a.period,
                  orders: a.orders,
                  revenueMillion: Math.round(a.revenue / 1_000_000),
                }))}
                margin={{ top: 10, right: 40, left: 0, bottom: 0 }}
                barCategoryGap="30%"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="period" stroke="#6b7280" />
                <YAxis yAxisId="left" stroke="#3b82f6" label={{ value: 'Số đơn', angle: -90, position: 'insideLeft', fill: '#3b82f6' }} />
                <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" label={{ value: 'Doanh thu (Triệu đ)', angle: -90, position: 'insideRight', fill: '#f59e0b' }} tickFormatter={(v) => `${v} Tr`} />
                <Tooltip 
                  formatter={(value, name) => name === 'revenueMillion' ? [`${value} Triệu đ`, 'Doanh thu'] : [value, 'Số đơn']}
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                />
                <Legend verticalAlign="top" />

                <Bar yAxisId="left" dataKey="orders" fill="#3b82f6" name="Số lượng đơn" radius={[4,4,0,0]}>
                  <LabelList dataKey="orders" position="top" formatter={(v) => v} />
                </Bar>
                <Bar yAxisId="right" dataKey="revenueMillion" fill="#f59e0b" name="Doanh thu (Triệu đ)" radius={[4,4,0,0]} barSize={16}>
                  <LabelList dataKey="revenueMillion" position="top" formatter={(v) => `${v} Tr`} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead>
                  <tr className="text-sm text-gray-600">
                    <th className="py-2 px-3">Kỳ</th>
                    <th className="py-2 px-3">Số lượng đơn</th>
                    <th className="py-2 px-3">Doanh thu</th>
                  </tr>
                </thead>
                <tbody>
                  {aggregatedData.map((r, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="py-2 px-3">{r.period}</td>
                      <td className="py-2 px-3">{r.orders}</td>
                      <td className="py-2 px-3">{formatPrice(r.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="h-40 flex items-center justify-center text-gray-500 border-2 border-dashed rounded">
            Chưa có dữ liệu thống kê
          </div>
        )}
      </div>

      {/* Danh sách ô tô bán chạy (Top N) - appears right after the above chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">🚘 Danh sách ô tô bán chạy</h2>
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-600">Top</label>
            <select value={topN} onChange={(e) => setTopN(Number(e.target.value))} className="border rounded px-2 py-1 text-sm">
              <option value={3}>Top 3</option>
              <option value={5}>Top 5</option>
            </select>
          </div>
        </div>

        {topCars && topCars.length > 0 && topCars[0].count > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {topCars.slice(0, topN).map((car, idx) => (
              <div key={car.id || idx} className="border rounded-lg p-4 flex flex-col items-start gap-3 hover:shadow transition">
                <div className="w-full flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-12 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                      {car.image ? <img src={car.image} alt={car.name} className="w-full h-full object-cover" /> : <span className="text-gray-400 text-sm">No Img</span>}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{car.name}</p>
                      <p className="text-sm text-gray-500">Đã bán: <span className="font-medium">{car.count}</span></p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">#{idx + 1}</div>
                    <div className="text-sm font-semibold text-blue-600 mt-1">{formatMoneyShort(car.revenue || 0)}</div>
                  </div>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded">
                  <div className="h-2 bg-blue-500" style={{ width: `${Math.min(100, Math.round((car.count / Math.max(...topCars.map(t=>t.count),1)) * 100))}%` }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-28 flex items-center justify-center text-gray-500 border-2 border-dashed rounded">
            Chưa có dữ liệu bán hàng
          </div>
        )}
      </div>

      {/* Charts Row 1 - Area Chart & Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Area Chart */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">📈 Doanh Thu Theo Thời Gian</h2>
          </div>
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  name="Doanh Thu (Triệu đ)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-500">
              Chưa có dữ liệu
            </div>
          )}
        </div>

        {/* Status Distribution Pie Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">🥧 Trạng Thái Đơn Hàng</h2>
          {statusStats.length > 0 ? (
            <div className="space-y-4">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={statusStats}
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              {/* Legend below chart */}
              <div className="space-y-2 mt-4">
                {statusStats.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <span className="text-sm text-gray-700">
                      {item.name}: <span className="font-semibold">{item.value}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-500">
              Chưa có dữ liệu
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
