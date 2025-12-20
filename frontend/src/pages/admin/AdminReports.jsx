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
      
      // Fetch data from APIs
      const [orders, cars, categories] = await Promise.all([
        axios.get('/orders'),
        axios.get('/cars'),
        axios.get('/categories'),
      ]);

      const ordersData = extractArrayData(orders);
      const carsData = extractArrayData(cars);

      console.log('=== DATA FETCHED ===');
      console.log('Orders:', ordersData.length, 'items');
      console.log('Cars:', carsData.length, 'items');
      console.log('Sample order:', ordersData[0]);
      console.log('Sample car:', carsData[0]);

      // Store raw orders for aggregation
      setOrdersRaw(ordersData);

      // Calculate stats
      const totalRevenue = ordersData.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
      const avgRevenue = ordersData.length > 0 ? totalRevenue / ordersData.length : 0;

      // Calculate total cars sold
      let totalCarsSold = 0;
      ordersData.forEach(order => {
        if (Array.isArray(order.orderDetails)) {
          order.orderDetails.forEach(detail => {
            totalCarsSold += Number(detail.quantity || 1);
          });
        } else {
          totalCarsSold += 1;
        }
      });

      setStats({
        totalRevenue,
        totalCars: totalCarsSold,
        avgRevenue,
      });

      // Revenue data by date
      const revenueByDate = {};
      ordersData.forEach(order => {
        if (!order.orderDate) return;
        const d = new Date(order.orderDate);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const key = `${yyyy}-${mm}-${dd}`;
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

      // Status stats
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

      // TOP CARS CALCULATION - FIXED VERSION
      console.log('=== PROCESSING TOP CARS ===');
      const carAccum = {};
      
      ordersData.forEach((order, orderIdx) => {
        console.log(`Order ${orderIdx + 1}:`, {
          id: order.id,
          hasOrderDetails: !!order.orderDetails,
          orderDetailsCount: order.orderDetails?.length || 0,
          totalAmount: order.totalAmount
        });

        // Process orderDetails (main structure)
        if (Array.isArray(order.orderDetails) && order.orderDetails.length > 0) {
          order.orderDetails.forEach((detail, detailIdx) => {
            console.log(`  Detail ${detailIdx + 1}:`, {
              carId: detail.carId,
              carFromDetail: detail.car?.id,
              carName: detail.car?.name,
              quantity: detail.quantity,
              price: detail.price
            });

            // Get car ID from multiple possible sources
            const carId = detail.car?.id || detail.carId;
            if (!carId) {
              console.log('    ❌ No car ID found');
              return;
            }

            const qty = Number(detail.quantity || 1);
            const price = Number(detail.price || 0);
            
            if (!carAccum[carId]) {
              carAccum[carId] = { count: 0, revenue: 0 };
            }
            
            carAccum[carId].count += qty;
            carAccum[carId].revenue += price * qty;
            
            console.log(`    ✅ Added to car ${carId}: +${qty} cars, +${price * qty} revenue`);
          });
        } else {
          // Fallback for single car orders
          const carId = order.carId || order.car?.id;
          if (carId) {
            console.log(`  Single car order: ${carId}`);
            if (!carAccum[carId]) {
              carAccum[carId] = { count: 0, revenue: 0 };
            }
            carAccum[carId].count += 1;
            carAccum[carId].revenue += Number(order.totalAmount || 0);
            console.log(`    ✅ Added to car ${carId}: +1 car, +${order.totalAmount} revenue`);
          } else {
            console.log('  ❌ No car ID found in single car order');
          }
        }
      });

      console.log('Car accumulation result:', carAccum);

      // Map car IDs to car details
      const topCarsData = Object.entries(carAccum)
        .map(([carId, { count, revenue }]) => {
          console.log(`Looking up car ID: ${carId} (type: ${typeof carId})`);
          
          // Find car with flexible ID matching
          const car = carsData.find(c => {
            const currentCarId = c.id || c._id; // Hỗ trợ cả id và _id
          return String(currentCarId) === String(carId);
          });
          
          if (car) {
            console.log(`  ✅ Found car: "${car.name}"`);
          } else {
            console.log(`  ❌ Car not found. Available IDs:`, carsData.slice(0, 5).map(c => `${c.id}(${typeof c.id})`));
          }
          
          return {
            id: carId,
            name: car?.name || `Xe không tìm thấy #${carId}`,
            count,
            revenue: revenue || 0,
            image: car?.image || car?.imageUrl || null,
            car: car // Keep for debugging
          };
        })
        .sort((a, b) => b.count - a.count || b.revenue - a.revenue)
        .slice(0, 10);

      console.log('Final top cars:', topCarsData);

      setTopCars(topCarsData.length > 0 ? topCarsData : [
        { id: 'none', name: 'Chưa có dữ liệu bán hàng', count: 0, revenue: 0 }
      ]);

    } catch (err) {
      console.error('Error fetching reports:', err);
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
                margin={{ top: 30, right: 40, left: 0, bottom: 0 }}
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
                <Legend verticalAlign="bottom" align="center" />

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

      {/* Danh sách ô tô bán chạy */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Xe Bán Chạy Nhất</h2>
            <p className="text-gray-500 text-sm mt-1">Các mẫu xe dẫn đầu doanh số tháng này</p>
          </div>
          <div className="flex items-center gap-2">
            {[3, 5, 10].map(num => (
              <button
                key={num}
                onClick={() => setTopN(num)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  topN === num 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Top {num}
              </button>
            ))}
          </div>
        </div>

        {topCars && topCars.length > 0 && topCars[0].count > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topCars.slice(0, topN).map((car, idx) => (
              <div key={car.id || idx} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border border-gray-100">
                {/* Ranking Badge */}
                <div className="relative">
                  <div className="absolute top-3 left-3 z-10">
                    <div className={`px-3 py-1 rounded-full text-white text-sm font-bold shadow-lg ${
                      idx === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                      idx === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-600' :
                      idx === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-600' :
                      'bg-gradient-to-r from-blue-400 to-blue-600'
                    }`}>
                      {idx === 0 ? '👑 #1 Best Seller' : `#${idx + 1}`}
                    </div>
                  </div>

                  {/* Car Image */}
                  <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                    {car.image ? (
                      <>
                        <img 
                          src={car.image} 
                          alt={car.name} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextElementSibling.style.display = 'flex';
                          }}
                        />
                        <div className="w-full h-full hidden items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                          <span className="text-6xl text-gray-400">🚗</span>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                        <span className="text-6xl text-gray-400">🚗</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Car Info */}
                <div className="p-5">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 truncate">{car.name}</h3>
                  <div className="text-sm text-gray-500 mb-4">
                    <span>Sedan • 1.5L CVT</span>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Đã bán</p>
                      <p className="text-lg font-bold text-gray-900">{car.count.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 mb-1">Doanh thu</p>
                      <p className="text-lg font-bold text-blue-600">
                        {car.revenue >= 1000000000 
                          ? `${Math.round(car.revenue / 1000000000)} Tỷ`
                          : car.revenue >= 1000000
                          ? `${Math.round(car.revenue / 1000000)} Tr`
                          : formatPrice(car.revenue)
                        }
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>Tỷ lệ bán</span>
                      <span>{Math.round((car.count / Math.max(...topCars.map(t=>t.count),1)) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-700 ${
                          idx === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                          idx === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-600' :
                          idx === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-600' :
                          'bg-gradient-to-r from-blue-400 to-blue-600'
                        }`}
                        style={{ 
                          width: `${Math.min(100, Math.round((car.count / Math.max(...topCars.map(t=>t.count),1)) * 100))}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Chưa có dữ liệu bán hàng</h3>
            <p className="text-gray-500 text-center max-w-md">
              Dữ liệu xe bán chạy sẽ hiển thị khi có đơn hàng được xử lý thành công
            </p>
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
