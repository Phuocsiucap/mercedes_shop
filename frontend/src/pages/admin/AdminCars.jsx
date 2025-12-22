import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash, FaPlus, FaEye } from 'react-icons/fa';
// Thêm import hàm tiện ích
import { uploadImagesToCloudinary } from '../../utils/cloudinary';
import { searchCars } from '../../api/carApi';


const AdminCars = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [cars, setCars] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]); // State mới để giữ file từ máy tính
  
  
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    price: '',
    manufactureYear: '',
    color: '',
    engine: '',
    transmission: '',
    seats: '',
    images: [], // Đổi từ 'image' (string) thành 'images' (mảng)
    description: '',
  });
  const [error, setError] = useState(null);

  const [pagination, setPagination] = useState({
  currentPage: 0,
  size: 5, // Mặc định hiển thị 5 xe
  totalPages: 0,
  totalElements: 0
  });

  const [filters, setFilters] = useState({
    keyword: searchParams.get('keyword') || '',
    categoryId: searchParams.get('categoryId') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    year: searchParams.get('year') || '',
    color: searchParams.get('color') || '',
    sortBy: searchParams.get('sortBy') || 'id',
    sortDir: searchParams.get('sortDir') || 'DESC',
  });

  const [showFilters, setShowFilters] = useState(false);


  useEffect(() => {
  fetchCars();
}, [pagination.currentPage, pagination.size,filters.keyword,
  filters.categoryId,
  filters.minPrice,
  filters.maxPrice,
  filters.year,
  filters.color,
  filters.sortBy,
  filters.sortDir]); // Chạy lại mỗi khi trang hoặc size thay đổi

useEffect(() => {
  fetchCategories();
}, []);

  const navigate = useNavigate();

  const fetchCars = async () => {
  try {
    setLoading(true);
    // Truyền params page và size vào API
    const params = {
      page: pagination.currentPage,
      size: pagination.size,
      sortBy: filters.sortBy,
      sortDir: filters.sortDir,
      ...(filters.keyword && { keyword: filters.keyword }),
      ...(filters.categoryId && { categoryId: filters.categoryId }),
      ...(filters.minPrice && { minPrice: filters.minPrice }),
      ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
      ...(filters.year && { year: filters.year }),
      ...(filters.color && { color: filters.color }),
    };

    const response = await searchCars(params);

    // Giả sử Backend trả về theo cấu trúc chuẩn Spring Boot: response.data.data.content
    const result = response.data?.data|| response.data;

    if (result && result.content) {
      setCars(result.content);
      // Cập nhật lại thông tin phân trang từ Backend trả về
      setPagination(prev => ({
        ...prev,
        totalPages: result.totalPages,
        totalElements: result.totalElements
      }));
    } else {
      // Fallback nếu data trả về là mảng trực tiếp
      setCars(Array.isArray(response.data?.data) ? response.data.data : []);
    }
    setError(null);
  } catch (err) {
    console.error('Error fetching cars:', err);
    setError('Không thể tải danh sách xe');
    setCars([]);
  } finally {
    setLoading(false);
  }
};

const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPagination((prev) => ({ ...prev, currentPage: 0 }));

    // Update URL params
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(name, value);
    } else {
      newParams.delete(name);
    }
    setSearchParams(newParams);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, currentPage: 0 }));
    fetchCars();
  };

  const clearFilters = () => {
    setFilters({
      keyword: '',
      categoryId: '',
      minPrice: '',
      maxPrice: '',
      year: '',
      color: '',
      sortBy: 'id',
      sortDir: 'DESC',
    });
    
    setSearchParams({});
    setPagination((prev) => ({ ...prev, currentPage: 0 }));
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/categories');
      // Handle both response.data.data and response.data formats
      const data = Array.isArray(response.data?.data) 
        ? response.data.data 
        : Array.isArray(response.data) 
        ? response.data 
        : [];
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setCategories([]); // Set empty array on error
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.categoryId || !formData.price) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      setLoading(true);
      let finalImageUrls = formData.images || [];

      // Bước 1: Nếu có chọn file mới, upload lên Cloudinary
      if (selectedFiles.length > 0) {
        const uploadedUrls = await uploadImagesToCloudinary(selectedFiles);
        // Kết hợp ảnh cũ (nếu có) và ảnh mới
        finalImageUrls = [...finalImageUrls, ...uploadedUrls];
      }

      // Bước 2: Chuẩn bị dữ liệu gửi về Backend Java
      const submitData = {
        ...formData,
        images: finalImageUrls.filter(url => url !== ''), // Đảm bảo gửi mảng images
        categoryId: formData.categoryId.toString(),
        price: parseFloat(formData.price),
        manufactureYear: parseInt(formData.manufactureYear),
        seats: parseInt(formData.seats),
      };

      if (editingId) {
        await axios.put(`/cars/${editingId}`, submitData);
        alert('Cập nhật thành công');
      } else {
        await axios.post('/cars', submitData);
        alert('Thêm mới thành công');
      }

      resetForm();
      setSelectedFiles([]); // Reset danh sách file sau khi xong
      fetchCars();
    } catch (err) {
      console.error('Error:', err);
      setError(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (car) => {
    setFormData({
      ...car,
      // Đảm bảo images là mảng, nếu car.image cũ là string thì đưa vào mảng
      images: Array.isArray(car.images) ? car.images : (car.image ? [car.image] : []),
    });
    setEditingId(car.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn chắc chắn muốn xóa?')) {
      try {
        await axios.delete(`/cars/${id}`);
        alert('Xóa thành công');
        fetchCars();
      } catch (err) {
        console.error('Error:', err);
        alert('Có lỗi xảy ra khi xóa');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      categoryId: '',
      price: '',
      manufactureYear: '',
      color: '',
      engine: '',
      transmission: '',
      seats: '',
      images: [], // Reset về mảng rỗng
      description: '',
    });
    setSelectedFiles([]);
    setEditingId(null);
    setShowForm(false);
    setError(null);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Quản Lý Ô Tô</h1>
        <button
          onClick={() => (showForm ? resetForm() : setShowForm(true))}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition font-semibold"
        >
          <FaPlus /> {showForm ? 'Hủy' : 'Thêm Ô Tô'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200">
            {editingId ? '✏️ Cập Nhật Ô Tô' : '➕ Thêm Ô Tô Mới'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tên Xe <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="Nhập tên xe"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Danh Mục <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Giá <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Năm Sản Xuất
              </label>
              <input
                type="number"
                value={formData.manufactureYear}
                onChange={(e) => setFormData({ ...formData, manufactureYear: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="2024"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Màu Sắc
              </label>
              <input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="Đen, Trắng, ..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Động Cơ
              </label>
              <input
                type="text"
                value={formData.engine}
                onChange={(e) => setFormData({ ...formData, engine: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="2.0L, 3.0L, ..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Hộp Số
              </label>
              <input
                type="text"
                value={formData.transmission}
                onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="Tự động, Số tay, ..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Số Chỗ Ngồi
              </label>
              <input
                type="number"
                value={formData.seats}
                onChange={(e) => setFormData({ ...formData, seats: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="5"
              />
            </div>

            <div className="md:col-span-2 space-y-4">
              <label className="block text-sm font-semibold text-gray-700">
                Hình ảnh xe
              </label>
              
              {/* Chọn file từ máy tính */}
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setSelectedFiles(Array.from(e.target.files))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500">Đã chọn {selectedFiles.length} file mới</p>

              {/* Hiển thị các URL ảnh hiện có (để có thể xóa bớt link nếu muốn) */}
              <div className="space-y-2">
                {formData.images.map((url, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={url}
                      readOnly
                      className="flex-1 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded text-sm text-gray-600"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newImages = formData.images.filter((_, i) => i !== index);
                        setFormData({ ...formData, images: newImages });
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FaTrash size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mô Tả
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                rows="3"
                placeholder="Nhập mô tả chi tiết về xe..."
              />
            </div>

            <div className="md:col-span-2 flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg transition font-semibold flex items-center justify-center gap-2"
              >
                {editingId ? '💾 Cập Nhật' : '➕ Thêm Mới'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2.5 rounded-lg transition font-semibold"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Bộ lọc</h2>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden text-blue-600"
                >
                  {showFilters ? 'Ẩn' : 'Hiện'}
                </button>
              </div>

              <div className={`space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tìm kiếm
                  </label>
                  <input
                    type="text"
                    value={filters.keyword}
                    onChange={(e) => handleFilterChange('keyword', e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
                    placeholder="Tên xe..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Danh mục
                  </label>
                  <select
                    value={filters.categoryId}
                    onChange={(e) => handleFilterChange('categoryId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Tất cả</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Khoảng giá (VNĐ)
                  </label>
                  <div className="space-y-2">
                    <input
                      type="number"
                      value={filters.minPrice}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                      placeholder="Từ"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                      placeholder="Đến"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Year */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Năm sản xuất
                  </label>
                  <input
                    type="number"
                    value={filters.year}
                    onChange={(e) => handleFilterChange('year', e.target.value)}
                    placeholder="2024"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Màu sắc
                  </label>
                  <input
                    type="text"
                    value={filters.color}
                    onChange={(e) => handleFilterChange('color', e.target.value)}
                    placeholder="Đen, Trắng..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sắp xếp theo
                  </label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="id">Mới nhất</option>
                    <option value="price">Giá</option>
                    <option value="name">Tên</option>
                    <option value="manufactureYear">Năm sản xuất</option>
                  </select>
                </div>

                {/* Sort Direction */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thứ tự
                  </label>
                  <select
                    value={filters.sortDir}
                    onChange={(e) => handleFilterChange('sortDir', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="DESC">Giảm dần</option>
                    <option value="ASC">Tăng dần</option>
                  </select>
                </div>

                {/* Clear Filters */}
                <button
                  onClick={clearFilters}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition"
                >
                  Xóa bộ lọc
                </button>
              </div>
            </div>
          </div>

      
      {/* Table */}
      <div className=" lg:w-3/4 flex-1 bg-white rounded-lg shadow-lg overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b-2 border-gray-300">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">
                    Tên
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">
                    Danh Mục
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">
                    Giá
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">
                    Năm
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">
                    Hành Động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {cars.map((car) => (
                  <tr key={car.id} className="hover:bg-blue-50 transition">
                    <td className="px-6 py-4 text-sm text-gray-800 font-medium">{car.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
  <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
    {/* Sử dụng == thay vì === để tự động ép kiểu, hoặc String() */}
    {categories.find((c) => c.id == car.categoryId)?.name || 
     car.categoryName || 
     car.category?.name || 
     '-'}
  </span>
</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {formatPrice(car.price)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {car.manufactureYear}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-3">
                        <button
                          onClick={() => navigate(`/cars/${car.id}`)} // Điều hướng đến trang chi tiết
                          className="text-green-600 hover:text-green-800 hover:bg-green-100 p-2 rounded-lg transition font-semibold"
                          title="Xem chi tiết"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => handleEdit(car)}
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 p-2 rounded-lg transition font-semibold"
                          title="Cập nhật"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(car.id)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-100 p-2 rounded-lg transition font-semibold"
                          title="Xóa"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Pagination Controls */}
<div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
  {/* Chọn số lượng hiển thị */}
  <div className="flex items-center gap-2">
    <span className="text-sm text-gray-600">Hiển thị:</span>
    <select
      value={pagination.size}
      onChange={(e) => {
        setPagination(prev => ({ ...prev, size: Number(e.target.value), currentPage: 0 }));
      }}
      className="border rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
    >
      <option value={5}>5</option>
      <option value={10}>10</option>
      <option value={20}>20</option>
    </select>
    <span className="text-sm text-gray-600">trên tổng số {pagination.totalElements} xe</span>
  </div>

  {/* Điều hướng trang */}
  {pagination.totalPages > 1 && (
    <div className="flex items-center space-x-1">
      <button
        onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
        disabled={pagination.currentPage === 0}
        className="px-3 py-1 border rounded text-sm hover:bg-gray-100 disabled:opacity-50 transition"
      >
        Trước
      </button>

      {[...Array(pagination.totalPages)].map((_, index) => (
        <button
          key={index}
          onClick={() => setPagination(prev => ({ ...prev, currentPage: index }))}
          className={`px-3 py-1 border rounded text-sm transition ${
            pagination.currentPage === index
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          {index + 1}
        </button>
      ))}

      <button
        onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
        disabled={pagination.currentPage === pagination.totalPages - 1}
        className="px-3 py-1 border rounded text-sm hover:bg-gray-100 disabled:opacity-50 transition"
      >
        Sau
      </button>
    </div>
  )}
</div>
            {cars.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg">Chưa có ô tô nào</p>
                <p className="text-sm">Nhấn nút "Thêm Ô Tô" để thêm mới</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
    </div>
  );
};

export default AdminCars;

