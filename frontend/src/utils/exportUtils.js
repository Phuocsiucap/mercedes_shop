// Utility functions for exporting data to Excel
export const exportToExcel = (data, filename, headers) => {
  // Create CSV content
  const csvContent = convertToCSV(data, headers);
  
  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

const convertToCSV = (data, headers) => {
  if (!data || data.length === 0) return '';
  
  // Create header row
  const headerRow = headers.map(h => `"${h.label}"`).join(',');
  
  // Create data rows
  const dataRows = data.map(item => {
    return headers.map(header => {
      let value = getNestedValue(item, header.key);
      
      // Format value based on type
      if (header.type === 'currency') {
        value = formatCurrency(value);
      } else if (header.type === 'date') {
        value = formatDate(value);
      } else if (header.type === 'status') {
        value = formatStatus(value, header.statusMap);
      }
      
      // Escape quotes and wrap in quotes
      return `"${String(value || '').replace(/"/g, '""')}"`;
    }).join(',');
  });
  
  return [headerRow, ...dataRows].join('\n');
};

const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

const formatCurrency = (value) => {
  if (!value) return '0';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value);
};

const formatDate = (value) => {
  if (!value) return '';
  return new Date(value).toLocaleDateString('vi-VN');
};

const formatStatus = (value, statusMap) => {
  if (!value || !statusMap) return value;
  return statusMap[value] || value;
};

// Predefined export configurations
export const exportConfigs = {
  cars: {
    filename: 'danh_sach_xe',
    headers: [
      { key: 'id', label: 'ID' },
      { key: 'name', label: 'Tên xe' },
      { key: 'categoryName', label: 'Danh mục' },
      { key: 'price', label: 'Giá', type: 'currency' },
      { key: 'manufactureYear', label: 'Năm sản xuất' },
      { key: 'color', label: 'Màu sắc' },
      { key: 'engine', label: 'Động cơ' },
      { key: 'transmission', label: 'Hộp số' },
      { key: 'seats', label: 'Số chỗ ngồi' },
      { key: 'averageRating', label: 'Đánh giá TB' },
      { key: 'reviewCount', label: 'Số đánh giá' },
      { key: 'totalOrders', label: 'Số đơn hàng' },
      { key: 'status', label: 'Trạng thái' }
    ]
  },
  users: {
    filename: 'danh_sach_nguoi_dung',
    headers: [
      { key: 'id', label: 'ID' },
      { key: 'fullName', label: 'Họ tên' },
      { key: 'email', label: 'Email' },
      { key: 'phoneNumber', label: 'Số điện thoại' },
      { key: 'role', label: 'Vai trò', type: 'status', statusMap: { 'USER': 'Khách hàng', 'ADMIN': 'Quản trị viên' } },
      { key: 'address', label: 'Địa chỉ' },
      { key: 'createdAt', label: 'Ngày tạo', type: 'date' },
      { key: 'totalOrders', label: 'Số đơn hàng' },
      { key: 'totalReviews', label: 'Số đánh giá' },
      { key: 'status', label: 'Trạng thái' }
    ]
  },
  orders: {
    filename: 'danh_sach_don_hang',
    headers: [
      { key: 'id', label: 'ID' },
      { key: 'orderDate', label: 'Ngày đặt', type: 'date' },
      { key: 'userName', label: 'Khách hàng' },
      { key: 'userEmail', label: 'Email KH' },
      { key: 'userPhone', label: 'SĐT KH' },
      { key: 'totalAmount', label: 'Tổng tiền', type: 'currency' },
      { key: 'totalItems', label: 'Số sản phẩm' },
      { key: 'status', label: 'Trạng thái', type: 'status', statusMap: {
        'PENDING': 'Chờ Xác Nhận',
        'DELIVERING': 'Đang Giao',
        'COMPLETED': 'Hoàn Thành',
        'CANCELLED': 'Hủy'
      }},
      { key: 'paymentMethod', label: 'Thanh toán' },
      { key: 'deliveryAddress', label: 'Địa chỉ giao hàng' },
      { key: 'daysSinceOrder', label: 'Số ngày' }
    ]
  }
};