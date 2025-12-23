# Hướng Dẫn Import Dữ Liệu Ô Tô

## Tổng Quan
Tính năng Import cho phép bạn nhập dữ liệu ô tô hàng loạt từ file Excel (.xlsx, .xls) hoặc CSV (.csv).

## Cách Sử Dụng

### 1. Truy Cập Tính Năng Import
- Vào trang **Quản Lý Ô Tô** (Admin Cars)
- Nhấn nút **"Import Excel/CSV"** màu xanh lá

### 2. Tải Template
- Trong modal Import, nhấn **"Tải Template Excel"**
- File template sẽ được tải về với:
  - Các cột bắt buộc đã định sẵn
  - Dữ liệu mẫu để tham khảo

### 3. Chuẩn Bị Dữ Liệu

#### Các Cột Bắt Buộc:
- **Tên xe**: Tên của xe (bắt buộc)
- **Danh mục**: Tên danh mục xe (bắt buộc)
- **Giá**: Giá xe bằng số (bắt buộc)

#### Các Cột Tùy Chọn:
- **Năm sản xuất**: Năm từ 1900 đến hiện tại
- **Màu sắc**: Màu của xe
- **Động cơ**: Thông tin động cơ
- **Hộp số**: Loại hộp số
- **Số chỗ ngồi**: Từ 1-50 chỗ
- **URL Ảnh**: Đường dẫn ảnh xe (có thể nhiều URL cách nhau bằng dấu phẩy)
- **Mô tả**: Mô tả chi tiết về xe

### 4. Định Dạng Dữ Liệu

#### Ví Dụ Dữ Liệu Hợp Lệ:
```
Tên xe                  | Danh mục | Giá        | Năm sản xuất | Màu sắc | Động cơ    | Hộp số   | Số chỗ ngồi | URL Ảnh                                    | Mô tả
Mercedes-Benz C-Class   | Sedan    | 1500000000 | 2024         | Đen     | 2.0L Turbo | Tự động  | 5           | https://example.com/mercedes-c-class.jpg   | Sedan hạng sang
BMW X5                  | SUV      | 2800000000 | 2023         | Trắng   | 3.0L       | Tự động  | 7           | https://example.com/bmw-x5-1.jpg,https://example.com/bmw-x5-2.jpg | SUV cao cấp
```

#### Lưu Ý Quan Trọng:
- **Giá**: Nhập số nguyên (VD: 1500000000 cho 1.5 tỷ VNĐ)
- **Danh mục**: Phải khớp chính xác với tên danh mục có sẵn
- **Năm sản xuất**: Phải là số từ 1900 đến năm hiện tại + 1
- **Số chỗ ngồi**: Phải là số từ 1 đến 50
- **URL Ảnh**: 
  - Phải là URL hợp lệ (http:// hoặc https://)
  - Hỗ trợ định dạng: .jpg, .jpeg, .png, .gif, .webp, .bmp
  - Nhiều URL cách nhau bằng dấu phẩy (,) hoặc xuống dòng
  - VD: `https://example.com/image1.jpg,https://example.com/image2.png`

### 5. Import Dữ Liệu
1. Chọn file Excel/CSV đã chuẩn bị
2. Xem trước dữ liệu (hiển thị 5 dòng đầu)
3. Kiểm tra thông tin và nhấn **"Import"**

### 6. Xử Lý Kết Quả
- **Thành công**: Hiển thị số lượng xe đã import thành công
- **Có lỗi**: Hiển thị chi tiết lỗi từng dòng để sửa chữa
- **Thất bại**: Hiển thị lý do và hướng dẫn khắc phục

## Các Lỗi Thường Gặp

### 1. Lỗi Dữ Liệu Bắt Buộc
```
Dòng 3: Tên xe không được để trống
Dòng 5: Giá không được để trống
```
**Khắc phục**: Điền đầy đủ thông tin bắt buộc

### 2. Lỗi Định Dạng Số
```
Dòng 4: Giá phải là số dương
Dòng 7: Năm sản xuất không hợp lệ
```
**Khắc phục**: Kiểm tra định dạng số, không có ký tự đặc biệt

### 3. Lỗi Danh Mục
```
Dòng 6: Danh mục không tồn tại
```
**Khắc phục**: Sử dụng tên danh mục chính xác từ hệ thống

### 4. Lỗi File
```
Lỗi khi đọc file. Vui lòng kiểm tra định dạng file.
```
**Khắc phục**: 
- Đảm bảo file là Excel (.xlsx, .xls) hoặc CSV (.csv)
- File không bị hỏng hoặc có mật khẩu bảo vệ

### 5. Lỗi URL Ảnh
```
Dòng 8: URL ảnh không hợp lệ: invalid-url, not-an-image
```
**Khắc phục**:
- Sử dụng URL đầy đủ với http:// hoặc https://
- Đảm bảo URL trỏ đến file ảnh (.jpg, .png, .gif, etc.)
- Kiểm tra URL có thể truy cập được
- Nhiều URL cách nhau bằng dấu phẩy

## Mẹo Sử Dụng Hiệu Quả

### 1. Chuẩn Bị Dữ Liệu
- Sử dụng template có sẵn để tránh lỗi định dạng
- Kiểm tra danh mục có sẵn trước khi import
- Chuẩn bị dữ liệu theo từng batch nhỏ (50-100 dòng)

### 2. Kiểm Tra Trước Khi Import
- Xem trước dữ liệu trong modal
- Đảm bảo các cột hiển thị đúng
- Kiểm tra một vài dòng mẫu

### 3. Xử Lý Lỗi
- Đọc kỹ thông báo lỗi
- Sửa từng lỗi theo dòng được chỉ ra
- Import lại sau khi sửa

### 4. Backup Dữ Liệu
- Xuất dữ liệu hiện tại trước khi import
- Giữ file gốc để tham khảo
- Test với dữ liệu nhỏ trước

## Hỗ Trợ Kỹ Thuật

Nếu gặp vấn đề:
1. Kiểm tra lại định dạng file và dữ liệu
2. Thử với file template mẫu
3. Liên hệ admin để được hỗ trợ

---
*Cập nhật lần cuối: December 2024*