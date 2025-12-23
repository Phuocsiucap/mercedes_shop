import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

/**
 * Export Service - Handles exporting reports to PDF and Excel
 */
class ExportService {
  /**
   * Export sales report to PDF with proper Vietnamese support
   * @param {Object} reportData - Report data to export
   * @param {string} filename - Output filename
   * @param {Object} options - Export options
   */
  async exportSalesReportToPDF(reportData, filename = 'report', options = {}) {
    const {
      orientation = 'portrait',
      format = 'a4',
    } = options;

    const {
      totalRevenue = 0,
      totalOrders = 0,
      averageRevenue = 0,
      revenueByPeriod = [],
      topCars = [],
      orderStatusStats = [],
      orders = [],
      dateRange = {}
    } = reportData;

    try {
      const pdf = new jsPDF(orientation, 'mm', format);
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 14;
      let yPos = 20;

      // Title
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(37, 99, 235); // Blue color
      pdf.text('BAO CAO BAN HANG', pageWidth / 2, yPos, { align: 'center' });
      yPos += 10;

      // Date range
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Tu ngay: ${dateRange.fromDate || ''} - Den ngay: ${dateRange.toDate || ''}`, pageWidth / 2, yPos, { align: 'center' });
      yPos += 15;

      // Summary section
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text('TONG QUAN', margin, yPos);
      yPos += 8;

      // Summary table
      pdf.autoTable({
        startY: yPos,
        head: [['Chi tieu', 'Gia tri']],
        body: [
          ['Tong doanh thu', this.formatCurrency(totalRevenue)],
          ['Tong don hang', totalOrders.toString()],
          ['Doanh thu trung binh/don', this.formatCurrency(averageRevenue)],
        ],
        theme: 'grid',
        headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 10, cellPadding: 4 },
        columnStyles: {
          0: { cellWidth: 60 },
          1: { cellWidth: 80, halign: 'right' }
        },
        margin: { left: margin, right: margin }
      });
      yPos = pdf.lastAutoTable.finalY + 15;

      // Revenue by period section
      if (revenueByPeriod.length > 0) {
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('DOANH THU THEO KY', margin, yPos);
        yPos += 8;

        pdf.autoTable({
          startY: yPos,
          head: [['Ky', 'So don hang', 'Doanh thu']],
          body: revenueByPeriod.map(item => [
            item.period || '',
            (item.orders || 0).toString(),
            this.formatCurrency(item.revenue || 0)
          ]),
          theme: 'striped',
          headStyles: { fillColor: [245, 158, 11], textColor: 255, fontStyle: 'bold' },
          styles: { fontSize: 9, cellPadding: 3 },
          columnStyles: {
            0: { cellWidth: 50 },
            1: { cellWidth: 40, halign: 'center' },
            2: { cellWidth: 60, halign: 'right' }
          },
          margin: { left: margin, right: margin }
        });
        yPos = pdf.lastAutoTable.finalY + 15;
      }

      // Check if need new page
      if (yPos > 240) {
        pdf.addPage();
        yPos = 20;
      }

      // Top selling cars section
      if (topCars.length > 0) {
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('XE BAN CHAY NHAT', margin, yPos);
        yPos += 8;

        pdf.autoTable({
          startY: yPos,
          head: [['STT', 'Ten xe', 'So luong ban', 'Doanh thu']],
          body: topCars.slice(0, 10).map((car, idx) => [
            (idx + 1).toString(),
            car.carName || car.name || '',
            (car.totalSold || 0).toString(),
            this.formatCurrency(car.totalRevenue || 0)
          ]),
          theme: 'striped',
          headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' },
          styles: { fontSize: 9, cellPadding: 3 },
          columnStyles: {
            0: { cellWidth: 15, halign: 'center' },
            1: { cellWidth: 70 },
            2: { cellWidth: 35, halign: 'center' },
            3: { cellWidth: 50, halign: 'right' }
          },
          margin: { left: margin, right: margin }
        });
        yPos = pdf.lastAutoTable.finalY + 15;
      }

      // Check if need new page
      if (yPos > 240) {
        pdf.addPage();
        yPos = 20;
      }

      // Order status stats
      if (orderStatusStats.length > 0) {
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('TRANG THAI DON HANG', margin, yPos);
        yPos += 8;

        pdf.autoTable({
          startY: yPos,
          head: [['Trang thai', 'So luong']],
          body: orderStatusStats.map(item => [
            this.removeVietnameseDiacritics(item.displayName || item.status || ''),
            (item.count || 0).toString()
          ]),
          theme: 'grid',
          headStyles: { fillColor: [139, 92, 246], textColor: 255, fontStyle: 'bold' },
          styles: { fontSize: 9, cellPadding: 3 },
          columnStyles: {
            0: { cellWidth: 60 },
            1: { cellWidth: 40, halign: 'center' }
          },
          margin: { left: margin, right: margin }
        });
        yPos = pdf.lastAutoTable.finalY + 15;
      }

      // Orders detail section (if available)
      if (orders && orders.length > 0) {
        pdf.addPage();
        yPos = 20;

        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('CHI TIET DON HANG', margin, yPos);
        yPos += 8;

        pdf.autoTable({
          startY: yPos,
          head: [['Ma DH', 'Ngay dat', 'Khach hang', 'Trang thai', 'Tong tien']],
          body: orders.map(order => [
            order.id?.toString() || '',
            order.orderDate ? new Date(order.orderDate).toLocaleDateString('vi-VN') : '',
            order.customerName || order.userName || '',
            this.removeVietnameseDiacritics(this.getStatusDisplayName(order.status)),
            this.formatCurrency(order.totalAmount || 0)
          ]),
          theme: 'striped',
          headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
          styles: { fontSize: 8, cellPadding: 2 },
          columnStyles: {
            0: { cellWidth: 20, halign: 'center' },
            1: { cellWidth: 30 },
            2: { cellWidth: 50 },
            3: { cellWidth: 35, halign: 'center' },
            4: { cellWidth: 40, halign: 'right' }
          },
          margin: { left: margin, right: margin }
        });
      }

      // Add footer with date to all pages
      const totalPages = pdf.internal.getNumberOfPages();
      const pageHeight = pdf.internal.pageSize.getHeight();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(128, 128, 128);
        pdf.text(
          `Xuat ngay: ${new Date().toLocaleDateString('vi-VN')} - Trang ${i}/${totalPages}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }

      pdf.save(`${filename}.pdf`);
      return true;
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      throw new Error('Khong the xuat PDF: ' + error.message);
    }
  }

  /**
   * Remove Vietnamese diacritics for PDF compatibility
   * @param {string} str - Vietnamese string
   * @returns {string} String without diacritics
   */
  removeVietnameseDiacritics(str) {
    if (!str) return '';
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D');
  }

  /**
   * Get display name for order status
   * @param {string} status - Order status code
   * @returns {string} Display name
   */
  getStatusDisplayName(status) {
    const statusMap = {
      'PENDING': 'Cho xac nhan',
      'CONFIRMED': 'Da xac nhan',
      'PROCESSING': 'Dang xu ly',
      'SHIPPED': 'Dang giao',
      'DELIVERED': 'Hoan thanh',
      'CANCELLED': 'Da huy'
    };
    return statusMap[status] || status || '';
  }

  /**
   * Legacy method - Export element to PDF (kept for backward compatibility)
   * @deprecated Use exportSalesReportToPDF instead
   */
  async exportToPDF(_element, filename = 'report', options = {}) {
    // Redirect to the new method if reportData is available in options
    if (options.reportData) {
      return this.exportSalesReportToPDF(options.reportData, filename, options);
    }
    
    // Fallback: create a simple PDF with message
    const pdf = new jsPDF(options.orientation || 'portrait', 'mm', options.format || 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    
    pdf.setFontSize(16);
    pdf.text(options.title || 'Report', pageWidth / 2, 20, { align: 'center' });
    
    if (options.subtitle) {
      pdf.setFontSize(12);
      pdf.text(options.subtitle, pageWidth / 2, 30, { align: 'center' });
    }
    
    pdf.save(`${filename}.pdf`);
    return true;
  }

  /**
   * Export data to Excel
   * @param {Object} data - Data to export
   * @param {string} filename - Output filename
   * @param {Object} options - Export options
   */
  exportToExcel(data, filename = 'report', options = {}) {
    const { sheetName = 'Report', includeHeaders = true } = options;

    try {
      const workbook = XLSX.utils.book_new();

      // If data is an array of objects, convert to sheet
      if (Array.isArray(data)) {
        const worksheet = XLSX.utils.json_to_sheet(data, { header: includeHeaders });
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      } 
      // If data has multiple sheets
      else if (typeof data === 'object') {
        Object.keys(data).forEach((key) => {
          const worksheet = XLSX.utils.json_to_sheet(data[key], { header: includeHeaders });
          XLSX.utils.book_append_sheet(workbook, worksheet, key);
        });
      }

      XLSX.writeFile(workbook, `${filename}.xlsx`);
      return true;
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      throw new Error('Không thể xuất Excel: ' + error.message);
    }
  }

  /**
   * Export sales report data to Excel with multiple sheets
   * @param {Object} reportData - Sales report data
   * @param {string} filename - Output filename
   */
  exportSalesReportToExcel(reportData, filename = 'sales-report') {
    const {
      totalRevenue = 0,
      totalOrders = 0,
      averageRevenue = 0,
      revenueByPeriod = [],
      topCars = [],
      orderStatusStats = [],
      orders = [],
      dateRange = {}
    } = reportData;

    try {
      const workbook = XLSX.utils.book_new();

      // Sheet 1: Summary
      const summaryData = [
        ['BÁO CÁO BÁN HÀNG'],
        [''],
        ['Từ ngày:', dateRange.fromDate || ''],
        ['Đến ngày:', dateRange.toDate || ''],
        [''],
        ['TỔNG QUAN'],
        ['Tổng doanh thu:', this.formatCurrency(totalRevenue)],
        ['Tổng đơn hàng:', totalOrders],
        ['Doanh thu trung bình:', this.formatCurrency(averageRevenue)],
        [''],
        ['THỐNG KÊ TRẠNG THÁI ĐƠN HÀNG'],
        ...orderStatusStats.map(item => [
          item.displayName || item.status || '',
          item.count || 0
        ])
      ];
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      
      // Set column widths for summary sheet
      summarySheet['!cols'] = [{ wch: 25 }, { wch: 30 }];
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Tong quan');

      // Sheet 2: Revenue by Period
      if (revenueByPeriod.length > 0) {
        const periodData = revenueByPeriod.map(item => ({
          'Kỳ': item.period,
          'Số đơn hàng': item.orders || 0,
          'Doanh thu (số)': item.revenue || 0,
          'Doanh thu (VNĐ)': this.formatCurrency(item.revenue || 0),
        }));
        const periodSheet = XLSX.utils.json_to_sheet(periodData);
        periodSheet['!cols'] = [{ wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 25 }];
        XLSX.utils.book_append_sheet(workbook, periodSheet, 'Doanh thu theo ky');
      }

      // Sheet 3: Top Selling Cars
      if (topCars.length > 0) {
        const carsData = topCars.map((car, index) => ({
          'STT': index + 1,
          'Tên xe': car.carName || car.name || '',
          'Danh mục': car.categoryName || '',
          'Số lượng bán': car.totalSold || 0,
          'Doanh thu (số)': car.totalRevenue || 0,
          'Doanh thu (VNĐ)': this.formatCurrency(car.totalRevenue || 0),
        }));
        const carsSheet = XLSX.utils.json_to_sheet(carsData);
        carsSheet['!cols'] = [{ wch: 5 }, { wch: 30 }, { wch: 20 }, { wch: 15 }, { wch: 20 }, { wch: 25 }];
        XLSX.utils.book_append_sheet(workbook, carsSheet, 'Xe ban chay');
      }

      // Sheet 4: Order Details (NEW - detailed order list)
      if (orders && orders.length > 0) {
        const ordersData = orders.map((order, index) => ({
          'STT': index + 1,
          'Mã đơn hàng': order.id || '',
          'Ngày đặt': order.orderDate ? new Date(order.orderDate).toLocaleDateString('vi-VN') : '',
          'Khách hàng': order.customerName || order.userName || '',
          'Email': order.customerEmail || order.email || '',
          'Số điện thoại': order.customerPhone || order.phone || '',
          'Địa chỉ': order.shippingAddress || order.address || '',
          'Trạng thái': this.getStatusDisplayNameVN(order.status),
          'Phương thức TT': order.paymentMethod || '',
          'Tổng tiền (số)': order.totalAmount || 0,
          'Tổng tiền (VNĐ)': this.formatCurrency(order.totalAmount || 0),
          'Ghi chú': order.notes || order.note || ''
        }));
        const ordersSheet = XLSX.utils.json_to_sheet(ordersData);
        ordersSheet['!cols'] = [
          { wch: 5 },  // STT
          { wch: 12 }, // Mã đơn
          { wch: 12 }, // Ngày đặt
          { wch: 25 }, // Khách hàng
          { wch: 25 }, // Email
          { wch: 15 }, // SĐT
          { wch: 40 }, // Địa chỉ
          { wch: 15 }, // Trạng thái
          { wch: 15 }, // PTTT
          { wch: 18 }, // Tổng tiền số
          { wch: 22 }, // Tổng tiền VNĐ
          { wch: 30 }  // Ghi chú
        ];
        XLSX.utils.book_append_sheet(workbook, ordersSheet, 'Chi tiet don hang');
      }

      // Sheet 5: Order Items (if available)
      const allOrderItems = [];
      if (orders && orders.length > 0) {
        orders.forEach(order => {
          if (order.items && order.items.length > 0) {
            order.items.forEach(item => {
              allOrderItems.push({
                'Mã đơn hàng': order.id || '',
                'Ngày đặt': order.orderDate ? new Date(order.orderDate).toLocaleDateString('vi-VN') : '',
                'Tên xe': item.carName || item.name || '',
                'Số lượng': item.quantity || 1,
                'Đơn giá (số)': item.price || 0,
                'Đơn giá (VNĐ)': this.formatCurrency(item.price || 0),
                'Thành tiền (số)': (item.price || 0) * (item.quantity || 1),
                'Thành tiền (VNĐ)': this.formatCurrency((item.price || 0) * (item.quantity || 1))
              });
            });
          } else if (order.orderDetails && order.orderDetails.length > 0) {
            order.orderDetails.forEach(item => {
              allOrderItems.push({
                'Mã đơn hàng': order.id || '',
                'Ngày đặt': order.orderDate ? new Date(order.orderDate).toLocaleDateString('vi-VN') : '',
                'Tên xe': item.carName || item.name || '',
                'Số lượng': item.quantity || 1,
                'Đơn giá (số)': item.price || item.unitPrice || 0,
                'Đơn giá (VNĐ)': this.formatCurrency(item.price || item.unitPrice || 0),
                'Thành tiền (số)': item.subtotal || (item.price || item.unitPrice || 0) * (item.quantity || 1),
                'Thành tiền (VNĐ)': this.formatCurrency(item.subtotal || (item.price || item.unitPrice || 0) * (item.quantity || 1))
              });
            });
          }
        });
      }

      if (allOrderItems.length > 0) {
        const itemsSheet = XLSX.utils.json_to_sheet(allOrderItems);
        itemsSheet['!cols'] = [
          { wch: 12 }, // Mã đơn
          { wch: 12 }, // Ngày đặt
          { wch: 35 }, // Tên xe
          { wch: 10 }, // Số lượng
          { wch: 18 }, // Đơn giá số
          { wch: 22 }, // Đơn giá VNĐ
          { wch: 18 }, // Thành tiền số
          { wch: 22 }  // Thành tiền VNĐ
        ];
        XLSX.utils.book_append_sheet(workbook, itemsSheet, 'Chi tiet san pham');
      }

      XLSX.writeFile(workbook, `${filename}.xlsx`);
      return true;
    } catch (error) {
      console.error('Error exporting sales report to Excel:', error);
      throw new Error('Không thể xuất báo cáo Excel: ' + error.message);
    }
  }

  /**
   * Get Vietnamese display name for order status
   * @param {string} status - Order status code
   * @returns {string} Vietnamese display name
   */
  getStatusDisplayNameVN(status) {
    const statusMap = {
      'PENDING': 'Chờ xác nhận',
      'CONFIRMED': 'Đã xác nhận',
      'PROCESSING': 'Đang xử lý',
      'SHIPPED': 'Đang giao',
      'DELIVERED': 'Hoàn thành',
      'CANCELLED': 'Đã hủy'
    };
    return statusMap[status] || status || '';
  }

  /**
   * Format currency for display
   * @param {number} value - Value to format
   * @returns {string} Formatted currency string
   */
  formatCurrency(value) {
    if (value === null || value === undefined) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  }

  /**
   * Export table data to Excel
   * @param {Array} headers - Table headers
   * @param {Array} rows - Table rows
   * @param {string} filename - Output filename
   * @param {string} sheetName - Sheet name
   */
  exportTableToExcel(headers, rows, filename = 'table-export', sheetName = 'Data') {
    try {
      const workbook = XLSX.utils.book_new();
      
      // Create data array with headers
      const data = [headers, ...rows];
      const worksheet = XLSX.utils.aoa_to_sheet(data);
      
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      XLSX.writeFile(workbook, `${filename}.xlsx`);
      
      return true;
    } catch (error) {
      console.error('Error exporting table to Excel:', error);
      throw new Error('Không thể xuất Excel: ' + error.message);
    }
  }
}

const exportService = new ExportService();
export default exportService;
