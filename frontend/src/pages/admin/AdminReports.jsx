import { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, LabelList, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FaFilePdf, FaFileExcel, FaDownload } from 'react-icons/fa';
import adminService from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import exportService from '../../services/exportService';

const CHART_COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#f97316'];

/**
 * Admin Reports Component
 * Refactored to use AdminLayout and context providers
 */
const AdminReports = () => {
  const { formatCurrency, addNotification } = useApp();
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
    fromDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    toDate: new Date().toISOString().split('T')[0] // today
  });

  useEffect(() => {
    fetchReportsData();
  }, [dateRange]);

  const fetchReportsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch sales report, inventory report, and orders list
      const salesReportParams = {
        fromDate: dateRange.fromDate,
        toDate: dateRange.toDate,
        groupBy: 'day'
      };
      
      const [salesReport, inventoryReport, ordersResponse] = await Promise.all([
        adminService.getSalesReport(salesReportParams),
        adminService.getInventoryReport(),
        adminService.getAllOrders({
          fromDate: dateRange.fromDate,
          toDate: dateRange.toDate,
          size: 1000, // Get all orders for export
          sortBy: 'orderDate',
          sortDir: 'desc'
        })
      ]);

      // Process the data
      const processedData = {
        totalRevenue: salesReport.data?.totalRevenue || 0,
        totalOrders: salesReport.data?.totalOrders || 0,
        averageRevenue: salesReport.data?.totalOrders > 0 ? 
          (salesReport.data?.totalRevenue || 0) / salesReport.data.totalOrders : 0,
        revenueByPeriod: salesReport.data?.salesData || [],
        orderStatusStats: generateOrderStatusStats(salesReport.data?.salesData || [], ordersResponse.data?.content || []),
        topCars: salesReport.data?.topSellingCars || [],
        orders: ordersResponse.data?.content || [] // Store orders for export
      };

      setData(processedData);
    } catch (err) {
      console.error('Error fetching reports data:', err);
      setError(err.message || 'Không thể tải dữ liệu báo cáo');
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: 'Không thể tải dữ liệu báo cáo'
      });
    } finally {
      setLoading(false);
    }
  };

  // Generate order status stats from orders data
  const generateOrderStatusStats = (salesData, orders) => {
    // If we have actual orders, count by status
    if (orders && orders.length > 0) {
      const statusCounts = {};
      orders.forEach(order => {
        const status = order.status || 'UNKNOWN';
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });

      const statusDisplayNames = {
        'PENDING': 'Chờ xác nhận',
        'CONFIRMED': 'Đã xác nhận',
        'PROCESSING': 'Đang xử lý',
        'SHIPPED': 'Đang giao',
        'DELIVERED': 'Hoàn thành',
        'CANCELLED': 'Đã hủy'
      };

      return Object.entries(statusCounts).map(([status, count]) => ({
        status,
        displayName: statusDisplayNames[status] || status,
        count
      }));
    }

    // Fallback to estimated distribution from sales data
    if (!salesData || salesData.length === 0) return [];
    
    const totalOrders = salesData.reduce((sum, item) => sum + (item.orders || 0), 0);
    
    return [
      { displayName: 'Hoàn thành', count: Math.floor(totalOrders * 0.7) },
      { displayName: 'Đang giao', count: Math.floor(totalOrders * 0.2) },
      { displayName: 'Chờ xác nhận', count: Math.floor(totalOrders * 0.08) },
      { displayName: 'Hủy', count: Math.floor(totalOrders * 0.02) }
    ].filter(item => item.count > 0);
  };

  const handleDateRangeChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const refresh = () => {
    fetchReportsData();
  };

  // Export to PDF
  const handleExportPDF = async () => {
    setExporting(true);
    try {
      await exportService.exportSalesReportToPDF({
        totalRevenue: data.totalRevenue,
        totalOrders: data.totalOrders,
        averageRevenue: data.averageRevenue,
        revenueByPeriod: data.revenueByPeriod,
        topCars: data.topCars,
        orderStatusStats: data.orderStatusStats,
        orders: data.orders,
        dateRange: dateRange,
      }, `bao-cao-ban-hang-${dateRange.fromDate}-${dateRange.toDate}`, {
        orientation: 'portrait',
      });
      addNotification({
        type: 'success',
        title: 'Thành công',
        message: 'Xuất PDF thành công!'
      });
    } catch (err) {
      console.error('Export PDF error:', err);
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: err.message || 'Không thể xuất PDF'
      });
    } finally {
      setExporting(false);
    }
  };

  // Export to Excel
  const handleExportExcel = () => {
    setExporting(true);
    try {
      exportService.exportSalesReportToExcel({
        totalRevenue: data.totalRevenue,
        totalOrders: data.totalOrders,
        averageRevenue: data.averageRevenue,
        revenueByPeriod: data.revenueByPeriod,
        topCars: data.topCars,
        orderStatusStats: data.orderStatusStats,
        orders: data.orders,
        dateRange: dateRange,
      }, `bao-cao-ban-hang-${dateRange.fromDate}-${dateRange.toDate}`);
      addNotification({
        type: 'success',
        title: 'Thành công',
        message: 'Xuất Excel thành công!'
      });
    } catch (err) {
      console.error('Export Excel error:', err);
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: err.message || 'Không thể xuất Excel'
      });
    } finally {
      setExporting(false);
    }
  };

  if (loading && !data.revenueByPeriod.length) {
    return <LoadingSpinner />;
  }

  if (error && !data.revenueByPeriod.length) {
    return <ErrorDisplay message={error} onRetry={refresh} />;
  }

  return (
    <div className="space-y-6">
      {/* Header with Export Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">📊 Báo Cáo Bán Hàng</h1>
        <div className="flex gap-2">
          <button
            onClick={handleExportPDF}
            disabled={exporting || loading}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaFilePdf />
            {exporting ? 'Đang xuất...' : 'Xuất PDF'}
          </button>
          <button
            onClick={handleExportExcel}
            disabled={exporting || loading}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaFileExcel />
            {exporting ? 'Đang xuất...' : 'Xuất Excel'}
          </button>
        </div>
      </div>

      {/* Date Range Controls */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Từ ngày</label>
            <input
              type="date"
              value={dateRange.fromDate}
              onChange={(e) => handleDateRangeChange('fromDate', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Đến ngày</label>
            <input
              type="date"
              value={dateRange.toDate}
              onChange={(e) => handleDateRangeChange('toDate', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={refresh}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              disabled={loading}
            >
              {loading ? 'Đang tải...' : 'Làm mới'}
            </button>
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div className="space-y-6 bg-white p-4 rounded-lg">
        {/* Summary Stats Cards */}
        <SummaryStatsCards stats={data} formatCurrency={formatCurrency} />

        {/* Revenue by Period Chart */}
        <RevenueByPeriodSection data={data.revenueByPeriod || []} formatCurrency={formatCurrency} />

        {/* Top Selling Cars */}
        <TopCarsSection cars={data.topCars || []} formatCurrency={formatCurrency} />

        {/* Charts Row - Revenue Area Chart & Status Pie Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <RevenueAreaChart data={data.revenueByPeriod || []} />
          <StatusPieChart stats={data.orderStatusStats || []} />
        </div>
      </div>
    </div>
  );
};

/**
 * Loading Spinner Component
 */
const LoadingSpinner = () => (
  <div className="flex justify-center items-center min-h-screen">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
  </div>
);

/**
 * Error Display Component
 */
const ErrorDisplay = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
    <div className="text-red-600 text-xl">⚠️ Lỗi tải dữ liệu</div>
    <p className="text-gray-600">{message}</p>
    <button
      onClick={onRetry}
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
    >
      Thử lại
    </button>
  </div>
);

/**
 * Summary Statistics Cards
 */
const SummaryStatsCards = ({ stats, formatCurrency }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <StatCard
      title="Tổng Doanh Thu"
      value={formatCurrency(stats.totalRevenue)}
      icon="💰"
      color="blue"
    />
    <StatCard
      title="Xe Đã Bán"
      value={stats.totalOrders}
      icon="🚗"
      color="purple"
    />
    <StatCard
      title="Doanh Thu Trung Bình"
      value={formatCurrency(stats.averageRevenue)}
      icon="📈"
      color="red"
    />
  </div>
);

/**
 * Stat Card Component
 */
const StatCard = ({ title, value, icon, color }) => {
  const borderColors = {
    blue: 'border-blue-600',
    purple: 'border-purple-600',
    red: 'border-red-600',
  };

  const textColors = {
    blue: 'text-blue-600',
    purple: 'text-purple-600',
    red: 'text-red-600',
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${borderColors[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`text-5xl ${textColors[color]}`}>{icon}</div>
      </div>
    </div>
  );
};

/**
 * Revenue by Period Section with Chart and Controls
 */
const RevenueByPeriodSection = ({ data, formatCurrency }) => {
  // Transform data for chart
  const chartData = useMemo(() => {
    return data.map(item => ({
      period: item.period,
      orders: item.orders,
      revenueMillion: Math.round(item.revenue / 1_000_000),
    }));
  }, [data]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">📊 Thống Kê Đơn Hàng Theo Kỳ</h2>
      </div>

      {chartData.length > 0 ? (
        <div className="space-y-4">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={chartData}
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

              <Bar yAxisId="left" dataKey="orders" fill="#3b82f6" name="Số lượng đơn" radius={[4, 4, 0, 0]}>
                <LabelList dataKey="orders" position="top" />
              </Bar>
              <Bar yAxisId="right" dataKey="revenueMillion" fill="#f59e0b" name="Doanh thu (Triệu đ)" radius={[4, 4, 0, 0]} barSize={16}>
                <LabelList dataKey="revenueMillion" position="top" formatter={(v) => `${v} Tr`} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <DataTable data={data} formatCurrency={formatCurrency} />
        </div>
      ) : (
        <EmptyState message="Chưa có dữ liệu thống kê" />
      )}
    </div>
  );
};

/**
 * Data Table Component
 */
const DataTable = ({ data, formatCurrency }) => (
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
        {data.map((r, idx) => (
          <tr key={idx} className="border-t">
            <td className="py-2 px-3">{r.period}</td>
            <td className="py-2 px-3">{r.orders}</td>
            <td className="py-2 px-3">{formatCurrency(r.revenue)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

/**
 * Top Selling Cars Section
 */
const TopCarsSection = ({ cars, formatCurrency }) => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-bold text-gray-800">🚘 Danh sách ô tô bán chạy</h2>
    </div>

    {cars && cars.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {cars.slice(0, 5).map((car, idx) => (
          <TopCarCard key={car.carId || idx} car={car} rank={idx + 1} maxCount={Math.max(...cars.map(c => c.totalSold))} formatCurrency={formatCurrency} />
        ))}
      </div>
    ) : (
      <EmptyState message="Chưa có dữ liệu bán hàng" />
    )}
  </div>
);

/**
 * Top Car Card Component
 */
const TopCarCard = ({ car, rank, maxCount, formatCurrency }) => {
  const progressPercent = Math.min(100, Math.round((car.totalSold / maxCount) * 100));

  return (
    <div className="border rounded-lg p-4 flex flex-col gap-3 hover:shadow transition">
      <div className="w-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-16 h-12 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
            <div className="text-2xl">🚗</div>
          </div>
          <div>
            <p className="font-semibold text-gray-800">{car.carName}</p>
            <p className="text-sm text-gray-500">Đã bán: <span className="font-medium">{car.totalSold}</span></p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500">#{rank}</div>
          <div className="text-sm font-semibold text-blue-600 mt-1">
            {formatCurrency(car.totalRevenue || 0)}
          </div>
        </div>
      </div>
      <div className="w-full bg-gray-100 h-2 rounded">
        <div className="h-2 bg-blue-500 rounded" style={{ width: `${progressPercent}%` }} />
      </div>
    </div>
  );
};

/**
 * Revenue Area Chart Component
 */
const RevenueAreaChart = ({ data }) => {
  const chartData = useMemo(() => {
    return data.map(item => ({
      date: item.period,
      revenue: Math.round(item.revenue / 1_000_000),
    }));
  }, [data]);

  return (
    <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">📈 Doanh Thu Theo Thời Gian</h2>
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
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
        <EmptyState message="Chưa có dữ liệu" height="h-80" />
      )}
    </div>
  );
};

/**
 * Status Pie Chart Component
 */
const StatusPieChart = ({ stats }) => {
  // Transform data for pie chart
  const chartData = useMemo(() => {
    return stats.map(item => ({
      name: item.displayName,
      value: item.count,
    }));
  }, [stats]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">🥧 Trạng Thái Đơn Hàng</h2>
      {chartData.length > 0 ? (
        <div className="space-y-4">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius={70}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div className="space-y-2 mt-4">
            {chartData.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                ></div>
                <span className="text-sm text-gray-700">
                  {item.name}: <span className="font-semibold">{item.value}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <EmptyState message="Chưa có dữ liệu" height="h-80" />
      )}
    </div>
  );
};

/**
 * Empty State Component
 */
const EmptyState = ({ message, height = "h-40" }) => (
  <div className={`${height} flex items-center justify-center text-gray-500 border-2 border-dashed rounded`}>
    {message}
  </div>
);

export default AdminReports;
