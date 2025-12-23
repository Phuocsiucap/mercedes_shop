import { useState, useEffect, useMemo, useRef } from 'react';
import { BarChart, Bar, LabelList, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FaFilePdf, FaFileExcel, FaFilter, FaCalendarAlt } from 'react-icons/fa';
import adminService from '../../services/adminService';
import { useApp } from '../../context/AppContext';
import * as XLSX from 'xlsx'; // Requires: npm install xlsx
import jsPDF from 'jspdf';     // Requires: npm install jspdf
import 'jspdf-autotable';      // Requires: npm install jspdf-autotable

const CHART_COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#f97316'];

// Helper to format compact numbers (e.g., 1.2 Tỷ) for UI
const formatCompactNumber = (number) => {
    if (!number) return '0';
    if (number >= 1_000_000_000) {
        return (number / 1_000_000_000).toLocaleString('vi-VN', { maximumFractionDigits: 1 }) + ' Tỷ';
    }
    if (number >= 1_000_000) {
        return (number / 1_000_000).toLocaleString('vi-VN', { maximumFractionDigits: 0 }) + ' Tr';
    }
    return number.toLocaleString('vi-VN');
};

// Helper to format full currency for Reports (e.g., 1.200.000.000 ₫)
const formatFullCurrency = (number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(number);
};

const AdminReports = () => {
  const { addNotification } = useApp();
  const [exporting, setExporting] = useState(false);
  
  const [data, setData] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    averageRevenue: 0,
    revenueByPeriod: [],
    orderStatusStats: [],
    topCars: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [dateRange, setDateRange] = useState({
    fromDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    toDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchReportsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  const fetchReportsData = async () => {
    try {
      setLoading(true);
      setError(null);
      const salesReportParams = { fromDate: dateRange.fromDate, toDate: dateRange.toDate, groupBy: 'day' };
      
      const [salesReport, inventoryReport, ordersResponse] = await Promise.all([
        adminService.getSalesReport(salesReportParams),
        adminService.getInventoryReport(),
        adminService.getAllOrders({ fromDate: dateRange.fromDate, toDate: dateRange.toDate, size: 1000, sortBy: 'orderDate', sortDir: 'desc' })
      ]);

      const processedData = {
        totalRevenue: salesReport.data?.totalRevenue || 0,
        totalOrders: salesReport.data?.totalOrders || 0,
        averageRevenue: salesReport.data?.totalOrders > 0 ? (salesReport.data?.totalRevenue || 0) / salesReport.data.totalOrders : 0,
        revenueByPeriod: salesReport.data?.salesData || [],
        orderStatusStats: generateOrderStatusStats(salesReport.data?.salesData || [], ordersResponse.data?.content || []),
        topCars: salesReport.data?.topSellingCars || [],
        orders: ordersResponse.data?.content || []
      };
      setData(processedData);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Không thể tải dữ liệu báo cáo');
      addNotification({ type: 'error', title: 'Lỗi', message: 'Không thể tải dữ liệu báo cáo' });
    } finally {
      setLoading(false);
    }
  };

  const generateOrderStatusStats = (salesData, orders) => {
    if (orders && orders.length > 0) {
      const statusCounts = {};
      orders.forEach(order => { statusCounts[order.status || 'UNKNOWN'] = (statusCounts[order.status || 'UNKNOWN'] || 0) + 1; });
      const statusDisplayNames = {
        'PENDING': 'Chờ xác nhận', 'CONFIRMED': 'Đã xác nhận', 'PROCESSING': 'Đang xử lý',
        'SHIPPED': 'Đang giao', 'DELIVERED': 'Hoàn thành', 'CANCELLED': 'Đã hủy'
      };
      return Object.entries(statusCounts).map(([status, count]) => ({
        status, displayName: statusDisplayNames[status] || status, count
      }));
    }
    return [];
  };

  const handleDateRangeChange = (field, value) => {
    setDateRange(prev => ({ ...prev, [field]: value }));
  };

  const handleFilterClick = () => { fetchReportsData(); };

  // ================= EXPORT EXCEL FUNCTION (Matching Reference Image) =================
  const handleExportExcel = () => {
    if (!data.revenueByPeriod.length) {
        addNotification({ type: 'warning', title: 'Thông báo', message: 'Không có dữ liệu để xuất' });
        return;
    }
    setExporting(true);

    try {
        // 1. Map data
        const dataToExport = data.revenueByPeriod.map(r => ({
            'Kỳ Báo Cáo': r.period,
            'Số Lượng Đơn': r.orders,
            'Doanh Thu (VND)': r.revenue 
        }));

        // 2. Create worksheet
        const ws = XLSX.utils.json_to_sheet(dataToExport);

        // 3. Auto-fit columns
        const wscols = [
            { wch: 20 }, // Date column width
            { wch: 15 }, // Orders column width
            { wch: 25 }, // Revenue column width
        ];
        ws['!cols'] = wscols;

        // 4. Create workbook and export
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Báo Cáo Doanh Thu');
        XLSX.writeFile(wb, `BaoCao_DoanhThu_${dateRange.fromDate}_${dateRange.toDate}.xlsx`);
        
        addNotification({ type: 'success', title: 'Thành công', message: 'Xuất Excel thành công!' });
    } catch (error) {
        console.error("Export Excel error:", error);
        addNotification({ type: 'error', title: 'Lỗi', message: 'Không thể xuất Excel' });
    } finally {
        setExporting(false);
    }
  };

  // ================= EXPORT PDF FUNCTION (Matching Reference Image) =================
  const handleExportPDF = async () => {
    if (!data.revenueByPeriod.length) {
         addNotification({ type: 'warning', title: 'Thông báo', message: 'Không có dữ liệu để xuất' });
         return;
    }
    setExporting(true);
    
    try {
      const doc = new jsPDF();

      // --- 1. Load Vietnamese Font (Roboto) ---
      const fontURL = "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf";
      const fontBytes = await fetch(fontURL).then(res => res.arrayBuffer());
      
      const filename = "Roboto-Regular.ttf";
      const bytes = new Uint8Array(fontBytes);
      let binaryString = "";
      for (let i = 0; i < bytes.byteLength; i++) {
        binaryString += String.fromCharCode(bytes[i]);
      }
      const base64String = window.btoa(binaryString);

      doc.addFileToVFS(filename, base64String);
      doc.addFont(filename, "Roboto", "normal");
      doc.setFont("Roboto"); 

      // --- 2. Header Design ---
      const title = `BÁO CÁO DOANH THU THEO NGÀY`; // Or dynamically based on granularity
      
      doc.setFontSize(16);
      doc.setTextColor(41, 128, 185); // Blue color matching image
      doc.text(title, doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Ngày xuất báo cáo: ${new Date().toLocaleDateString('vi-VN')}`, doc.internal.pageSize.getWidth() / 2, 28, { align: 'center' });

      // --- 3. Table Data ---
      const tableBody = data.revenueByPeriod.map(r => [
        r.period, 
        r.orders, 
        formatFullCurrency(r.revenue)
      ]);

      doc.autoTable({
        startY: 35,
        head: [['Kỳ Báo Cáo', 'Số Đơn Hàng', 'Doanh Thu']],
        body: tableBody,
        styles: { 
          font: "Roboto", 
          fontStyle: 'normal',
          fontSize: 10,
          cellPadding: 4,
          valign: 'middle'
        },
        headStyles: { 
          fillColor: [41, 128, 185], // Header Blue
          textColor: 255,
          fontStyle: 'bold',
          halign: 'center'
        },
        columnStyles: {
          0: { halign: 'left' },
          1: { halign: 'center' },
          2: { halign: 'right' }, 
        },
        alternateRowStyles: {
          fillColor: [245, 247, 250] 
        },
        theme: 'grid'
      });

      // --- 4. Footer Summary ---
      const finalY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(11);
      doc.setTextColor(0);
      doc.text(`Tổng doanh thu: ${formatFullCurrency(data.totalRevenue)}`, 14, finalY);
      doc.text(`Tổng số đơn: ${data.totalOrders} xe`, 14, finalY + 6);

      doc.save(`BaoCao_DoanhThu_${dateRange.fromDate}_${dateRange.toDate}.pdf`);
      addNotification({ type: 'success', title: 'Thành công', message: 'Xuất PDF thành công!' });

    } catch (e) {
      console.error('PDF export failed:', e);
      addNotification({ type: 'error', title: 'Lỗi', message: 'Lỗi xuất PDF. Vui lòng thử lại.' });
    } finally {
      setExporting(false);
    }
  };

  if (loading && !data.revenueByPeriod.length) return <LoadingSpinner />;
  if (error && !data.revenueByPeriod.length) return <ErrorDisplay message={error} onRetry={handleFilterClick} />;

  return (
    <div className="space-y-6"> 
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
           📊 Báo Cáo Bán Hàng
        </h1>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
        <div className="flex flex-wrap items-end gap-6"> 
          <div className="w-full sm:w-auto">
            <label className="block text-sm font-semibold text-gray-600 mb-2 flex items-center gap-1">
               <FaCalendarAlt className="text-gray-400"/> Từ ngày
            </label>
            <input
              type="date"
              value={dateRange.fromDate}
              onChange={(e) => handleDateRangeChange('fromDate', e.target.value)}
              className="w-full sm:w-48 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          
          <div className="w-full sm:w-auto">
            <label className="block text-sm font-semibold text-gray-600 mb-2 flex items-center gap-1">
               <FaCalendarAlt className="text-gray-400"/> Đến ngày
            </label>
            <input
              type="date"
              value={dateRange.toDate}
              onChange={(e) => handleDateRangeChange('toDate', e.target.value)}
              className="w-full sm:w-48 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          
          <div className="w-full sm:w-auto pb-[1px]"> 
            <button
              onClick={handleFilterClick}
              disabled={loading}
              className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> : 'Lọc dữ liệu'}
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <SummaryStatsCards stats={data} formatCurrency={formatCompactNumber} />

      {/* Revenue Chart Section (With Export Buttons) */}
      <RevenueByPeriodSection 
        data={data.revenueByPeriod || []} 
        onExportPDF={handleExportPDF}
        onExportExcel={handleExportExcel}
        exporting={exporting}
      />

      {/* Top Cars & Other Charts */}
      <TopCarsSection cars={data.topCars || []} formatCurrency={formatCompactNumber} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RevenueAreaChart data={data.revenueByPeriod || []} />
        <StatusPieChart stats={data.orderStatusStats || []} />
      </div>
    </div>
  );
};

// ... Sub-components ...
const LoadingSpinner = () => (
  <div className="flex justify-center items-center min-h-[400px]">
    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
  </div>
);

const ErrorDisplay = ({ message, onRetry }) => (
    <div className="text-center p-10 text-gray-500">
        <p className="mb-4 text-red-500">{message}</p>
        <button onClick={onRetry} className="text-blue-600 underline">Thử lại</button>
    </div>
);

const SummaryStatsCards = ({ stats, formatCurrency }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <StatCard title="Tổng Doanh Thu" value={formatCurrency(stats.totalRevenue)} icon="💰" color="blue" />
    <StatCard title="Xe Đã Bán" value={stats.totalOrders} icon="🚗" color="purple" />
    <StatCard title="Doanh Thu Trung Bình" value={formatCurrency(stats.averageRevenue)} icon="📈" color="red" />
  </div>
);

const StatCard = ({ title, value, icon, color }) => {
  const styles = {
    blue: "border-l-4 border-blue-500 text-blue-600",
    purple: "border-l-4 border-purple-500 text-purple-600",
    red: "border-l-4 border-red-500 text-red-600",
  };
  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 ${styles[color]} flex justify-between items-center`}>
      <div>
        <p className="text-gray-500 text-sm font-medium">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800 mt-1">{value}</h3>
      </div>
      <div className="text-4xl opacity-80">{icon}</div>
    </div>
  );
};

// Updated RevenueByPeriodSection with correct Buttons
const RevenueByPeriodSection = ({ data, onExportPDF, onExportExcel, exporting }) => {
  const chartData = useMemo(() => {
    return data.map(item => ({ period: item.period, orders: item.orders, revenue: item.revenue }));
  }, [data]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 border-b border-gray-100 pb-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            📊 Thống Kê Đơn Hàng Theo Kỳ
        </h2>
        
        <div className="flex gap-2 self-end sm:self-auto">
          <button
            onClick={onExportPDF}
            disabled={exporting}
            className="flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white hover:bg-red-700 rounded-md transition text-sm font-medium shadow-sm disabled:opacity-50"
          >
            <FaFilePdf /> Xuất PDF
          </button>
          <button
            onClick={onExportExcel}
            disabled={exporting}
            className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white hover:bg-green-700 rounded-md transition text-sm font-medium shadow-sm disabled:opacity-50"
          >
            <FaFileExcel /> Xuất Excel
          </button>
        </div>
      </div>

      {chartData.length > 0 ? (
        <div className="space-y-4">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="period" stroke="#6b7280" />
              <YAxis yAxisId="left" stroke="#3b82f6" label={{ value: 'Số đơn', angle: -90, position: 'insideLeft', fill: '#3b82f6' }} />
              <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" tickFormatter={(val) => formatCompactNumber(val)} />
              <Tooltip 
                formatter={(value, name) => name === 'revenue' ? [formatCompactNumber(value), 'Doanh thu'] : [value, 'Số lượng đơn']} 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', color: '#374151' }} 
              />
              <Legend verticalAlign="top" height={36} />
              <Bar yAxisId="left" dataKey="orders" fill="#3b82f6" name="Số lượng đơn" radius={[4, 4, 0, 0]} maxBarSize={50}>
                <LabelList dataKey="orders" position="top" />
              </Bar>
              <Bar yAxisId="right" dataKey="revenue" fill="#f59e0b" name="Doanh thu" radius={[4, 4, 0, 0]} maxBarSize={50}>
                <LabelList dataKey="revenue" position="top" formatter={(val) => formatCompactNumber(val)} style={{ fontSize: '11px', fontWeight: 'bold' }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <EmptyState message="Chưa có dữ liệu thống kê" />
      )}
    </div>
  );
};

const TopCarsSection = ({ cars, formatCurrency }) => {
  const [limit, setLimit] = useState(3);
  const displayCars = useMemo(() => (!cars ? [] : [...cars].sort((a, b) => b.totalSold - a.totalSold).slice(0, limit)), [cars, limit]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">🚘 Top Xe Bán Chạy</h2>
        <div className="flex bg-gray-100 p-1 rounded-lg">
            {[3, 5, 10].map((val) => (
                <button key={val} onClick={() => setLimit(val)} className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${limit === val ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Top {val}</button>
            ))}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayCars.map((car, idx) => <TopCarCard key={idx} car={car} rank={idx + 1} formatCurrency={formatCurrency} />)}
      </div>
    </div>
  );
};

const TopCarCard = ({ car, rank, formatCurrency }) => {
  const defaultImage = "https://res.cloudinary.com/dwtrrlefe/image/upload/v1766245329/a1_wqkwtv.webp";
  const carImage = (car.images && car.images.length > 0) ? car.images[0] : (car.image || defaultImage);
  const badgeColors = rank === 1 ? 'bg-yellow-100 text-yellow-800' : rank === 2 ? 'bg-gray-100 text-gray-800' : rank === 3 ? 'bg-orange-100 text-orange-800' : 'bg-blue-50 text-blue-600';

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden hover:shadow-lg transition bg-white flex flex-col">
      <div className="relative h-40 bg-gray-50">
        <img src={carImage} alt={car.carName} className="w-full h-full object-cover" onError={(e) => {e.target.src = defaultImage}} />
        <span className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-bold ${badgeColors}`}>#{rank}</span>
      </div>
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div><h3 className="font-bold text-gray-800 truncate">{car.carName}</h3></div>
        <div className="flex justify-between items-end mt-3 pt-3 border-t border-gray-50">
          <div><p className="text-xs text-gray-400 uppercase">Đã bán</p><p className="font-bold text-lg">{car.totalSold}</p></div>
          <div className="text-right"><p className="text-xs text-gray-400 uppercase">Doanh thu</p><p className="font-bold text-blue-600">{formatCurrency(car.totalRevenue)}</p></div>
        </div>
      </div>
    </div>
  );
};

const RevenueAreaChart = ({ data }) => {
  const chartData = useMemo(() => data.map(item => ({ date: item.period, revenue: Math.round(item.revenue / 1_000_000) })), [data]);
  return (
    <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">📈 Xu Hướng Doanh Thu</h2>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0"/>
          <XAxis dataKey="date" stroke="#9ca3af" tick={{fontSize: 12}} />
          <YAxis stroke="#9ca3af" tick={{fontSize: 12}} />
          <Tooltip formatter={(value) => [`${value} Tr`, 'Doanh thu']} />
          <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRevenue)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

const StatusPieChart = ({ stats }) => {
  const chartData = useMemo(() => stats.map(item => ({ name: item.displayName, value: item.count })), [stats]);
  const total = chartData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 flex flex-col">
      <h2 className="text-xl font-bold text-gray-800 mb-2">🥧 Trạng Thái Đơn</h2>
      <div className="flex-1 flex flex-col items-center justify-center">
        {chartData.length > 0 ? (
          <>
            <div className="h-[200px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col">
                <span className="text-3xl font-bold text-gray-700">{total}</span>
                <span className="text-xs text-gray-400 uppercase">Tổng đơn</span>
              </div>
            </div>

            <div className="w-full mt-4 space-y-2">
                {chartData.map((item, index) => {
                    const percent = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
                    return (
                        <div key={index} className="flex items-center justify-between text-sm p-2 rounded hover:bg-gray-50 transition">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}></span>
                                <span className="text-gray-700 font-medium">{item.name}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="font-bold text-gray-800">{item.value}</span>
                                <span className="text-xs text-gray-400 w-10 text-right">({percent}%)</span>
                            </div>
                        </div>
                    );
                })}
            </div>
          </>
        ) : (
          <EmptyState message="Không có dữ liệu" />
        )}
      </div>
    </div>
  );
};

const EmptyState = ({ message }) => (
  <div className="flex items-center justify-center h-40 text-gray-400 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 text-sm">
    {message}
  </div>
);

export default AdminReports;