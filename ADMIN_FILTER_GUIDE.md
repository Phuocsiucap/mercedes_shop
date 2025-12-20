# Hướng Dẫn Sử Dụng Bộ Lọc Admin

## Tổng Quan

Hệ thống bộ lọc admin đã được nâng cấp với các tính năng chuyên nghiệp:

- **Tìm kiếm nâng cao**: Tìm kiếm theo từ khóa với nhiều trường dữ liệu
- **Bộ lọc đa tiêu chí**: Lọc theo danh mục, giá, trạng thái, ngày tháng
- **Sắp xếp linh hoạt**: Sắp xếp theo các cột với hướng tăng/giảm dần
- **Phân trang thông minh**: Điều hướng trang với tùy chọn số lượng hiển thị
- **Xuất dữ liệu**: Xuất danh sách ra file CSV/Excel

## Các Trang Đã Được Nâng Cấp

### 1. Quản Lý Ô Tô (`/admin/cars`)

**Tính năng tìm kiếm:**
- Tìm theo tên xe, mô tả
- Lọc theo danh mục xe
- Lọc theo khoảng giá (từ - đến)
- Lọc theo năm sản xuất
- Lọc theo màu sắc
- Lọc theo loại động cơ
- Lọc theo loại hộp số
- Lọc theo số chỗ ngồi

**Sắp xếp:**
- Theo tên xe
- Theo giá
- Theo năm sản xuất

### 2. Quản Lý Người Dùng (`/admin/users`)

**Tính năng tìm kiếm:**
- Tìm theo tên, email, số điện thoại
- Lọc theo vai trò (Admin/Khách hàng)
- Lọc theo khoảng thời gian đăng ký

**Sắp xếp:**
- Theo tên
- Theo email
- Theo vai trò

### 3. Quản Lý Đơn Hàng (`/admin/orders`)

**Tính năng tìm kiếm:**
- Tìm theo tên khách hàng, email, địa chỉ
- Lọc theo trạng thái đơn hàng
- Lọc theo khoảng thời gian đặt hàng
- Lọc theo khoảng tổng tiền

**Sắp xếp:**
- Theo ID đơn hàng
- Theo ngày đặt
- Theo tổng tiền
- Theo trạng thái

## Cách Sử Dụng

### Bộ Lọc Cơ Bản

1. **Tìm kiếm nhanh**: Nhập từ khóa vào ô tìm kiếm và nhấn "Tìm"
2. **Mở rộng bộ lọc**: Nhấn nút "Mở rộng" để hiển thị các tùy chọn lọc nâng cao
3. **Chọn tiêu chí lọc**: Chọn các giá trị trong dropdown hoặc nhập khoảng giá trị
4. **Xóa bộ lọc**: Nhấn "Xóa bộ lọc" để reset về trạng thái ban đầu

### Sắp Xếp Dữ Liệu

- Nhấn vào tiêu đề cột để sắp xếp
- Nhấn lần đầu: sắp xếp tăng dần (↑)
- Nhấn lần hai: sắp xếp giảm dần (↓)
- Icon hiển thị hướng sắp xếp hiện tại

### Phân Trang

- Sử dụng các nút điều hướng: ⏮️ ⏪ [số trang] ⏩ ⏭️
- Thay đổi số lượng hiển thị: 5, 10, 20, 50, 100 mục/trang
- Hiển thị thông tin: "Hiển thị X đến Y trong Z kết quả"

### Xuất Dữ Liệu

- Nhấn nút "Xuất Excel" để tải file CSV
- File sẽ chứa dữ liệu đã được lọc hiện tại
- Tên file tự động thêm ngày xuất

## API Endpoints Mới

### Cars
```
GET /api/cars/admin/filter?keyword=&categoryId=&minPrice=&maxPrice=&year=&color=&engine=&transmission=&seats=&page=0&size=10&sortBy=id&sortDir=DESC
```

### Users
```
GET /api/users/admin/filter?keyword=&role=&fromDate=&toDate=&page=0&size=10&sortBy=id&sortDir=DESC
```

### Orders
```
GET /api/orders/admin/filter?keyword=&status=&fromDate=&toDate=&minAmount=&maxAmount=&page=0&size=10&sortBy=id&sortDir=DESC
```

## Cấu Trúc Code

### Frontend Components

- `AdminFilter.jsx`: Component bộ lọc chung
- `AdminPagination.jsx`: Component phân trang
- `useAdminFilter.js`: Hook quản lý state filter
- `exportUtils.js`: Utilities xuất dữ liệu

### Backend

- Controllers đã được mở rộng với endpoints `/admin/filter`
- Services có thêm methods `getFilteredXxx()`
- Repositories có thêm queries MongoDB với `$and`, `$or`

## Lưu Ý Kỹ Thuật

1. **Performance**: Các query đã được tối ưu với index MongoDB
2. **Security**: Tất cả endpoints admin đều yêu cầu role ADMIN
3. **Validation**: Dữ liệu đầu vào được validate ở cả frontend và backend
4. **Responsive**: Giao diện tương thích với mobile và desktop
5. **Accessibility**: Hỗ trợ keyboard navigation và screen readers

## Mở Rộng Tương Lai

- Thêm filter cho các trang admin khác
- Lưu bộ lọc yêu thích
- Xuất PDF với template tùy chỉnh
- Dashboard analytics với charts
- Bulk actions (xóa/cập nhật nhiều mục)