/**
 * @fileoverview Driver Test (Test Drive) type definitions
 * Định nghĩa các kiểu dữ liệu cho lái thử
 */

/**
 * Test drive entity
 * @typedef {Object} TestDrive
 * @property {string} id - Test drive ID
 * @property {string} userId - User ID
 * @property {string} userName - Tên khách hàng
 * @property {string} userEmail - Email
 * @property {string} userPhone - SĐT
 * @property {string} carId - Car ID
 * @property {string} carName - Tên xe
 * @property {string} [carImage] - Ảnh xe
 * @property {string} testDate - Ngày lái thử
 * @property {string} testTime - Giờ lái thử
 * @property {string} status - Trạng thái
 * @property {string} [notes] - Ghi chú
 * @property {string} createdAt - Ngày tạo
 * @property {string} [updatedAt] - Ngày cập nhật
 */

/**
 * Create test drive request
 * @typedef {Object} CreateTestDriveRequest
 * @property {string} carId - Car ID
 * @property {string} testDate - Ngày lái thử (YYYY-MM-DD)
 * @property {string} testTime - Giờ lái thử (HH:mm)
 * @property {string} [notes] - Ghi chú
 */

/**
 * Update test drive request
 * @typedef {Object} UpdateTestDriveRequest
 * @property {string} [testDate] - Ngày mới
 * @property {string} [testTime] - Giờ mới
 * @property {string} [notes] - Ghi chú mới
 */

/**
 * Test drive filter params
 * @typedef {Object} TestDriveFilterParams
 * @property {string} [status] - Lọc theo trạng thái
 * @property {string} [fromDate] - Từ ngày
 * @property {string} [toDate] - Đến ngày
 * @property {string} [keyword] - Tìm kiếm
 * @property {number} [page] - Trang
 * @property {number} [size] - Số lượng/trang
 * @property {string} [sortBy] - Sắp xếp theo
 * @property {string} [sortDir] - Hướng sắp xếp
 */

export const TestDriveStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

export const TestDriveStatusDisplay = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy'
};

export const TestDriveTypes = {
  CreateTestDriveRequest: {
    carId: '',
    testDate: '',
    testTime: '',
    notes: ''
  },
  UpdateTestDriveRequest: {
    testDate: '',
    testTime: '',
    notes: ''
  }
};
