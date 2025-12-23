import { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaPlus, FaSort, FaSortUp, FaSortDown, FaEye, FaFileImport } from 'react-icons/fa';
import { carService, categoryService } from '../../services';
import { useApp } from '../../context/AppContext';
import ImageUploader from '../../components/ui/ImageUploader';
import ImportModal from '../../components/modals/ImportModal';

const AdminCars = () => {
  const { formatCurrency, addNotification } = useApp();
  
  const [cars, setCars] = useState({
    content: [],
    totalElements: 0,
    totalPages: 0,
    number: 0,
    size: 10,
    loading: false,
    error: null
  });
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '', categoryId: '', price: '', manufactureYear: '',
    color: '', engine: '', transmission: '', seats: '', images: [], imageUrls: '', description: '',
  });
  const [error, setError] = useState(null);
  const [selectedCar, setSelectedCar] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [filters, setFilters] = useState({
    keyword: '',
    categoryId: '',
    minPrice: '',
    maxPrice: '',
    year: '',
    color: '',
  });
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState('DESC');
  const [showImportModal, setShowImportModal] = useState(false);

  useEffect(() => {
    fetchCars();
    fetchCategories();
  }, [filters, page, size, sortBy, sortDir]);

  const fetchCars = async () => {
    try {
      setCars(prev => ({ ...prev, loading: true, error: null }));
      
      const params = {
        page,
        size,
        sortBy,
        sortDir: sortDir.toLowerCase(),
        ...(filters.keyword && { keyword: filters.keyword }),
        ...(filters.categoryId && { categoryId: filters.categoryId }),
        ...(filters.minPrice && { minPrice: filters.minPrice }),
        ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
        ...(filters.year && { year: filters.year }),
        ...(filters.color && { color: filters.color }),
      };

      console.log('Admin fetching cars with params:', params);
      
      const response = await carService.getFilteredAndSortedCars(params);
        
      setCars(prev => ({
        ...prev,
        loading: false,
        content: response.data?.content || [],
        totalElements: response.data?.totalElements || 0,
        totalPages: response.data?.totalPages || 0,
        number: response.data?.number || 0,
        size: response.data?.size || 10
      }));
    } catch (error) {
      console.error('Error fetching cars:', error);
      setCars(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to load cars'
      }));
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getAllCategories();
      setCategories(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setCategories([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.categoryId || !formData.price) {
      setError('Vui lòng điền đầy đủ thông tin');
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: 'Vui lòng điền đầy đủ thông tin'
      });
      return;
    }

    try {
      const submitData = {
        ...formData,
        categoryId: formData.categoryId.toString(),
        price: parseFloat(formData.price),
        manufactureYear: parseInt(formData.manufactureYear),
        seats: parseInt(formData.seats),
      };

      if (editingId) {
        await carService.updateCar(editingId, submitData);
        addNotification({
          type: 'success',
          title: 'Thành công',
          message: 'Cập nhật xe thành công'
        });
      } else {
        await carService.createCar(submitData);
        addNotification({
          type: 'success',
          title: 'Thành công',
          message: 'Thêm xe mới thành công'
        });
      }

      resetForm();
      fetchCars();
    } catch (err) {
      console.error('Error:', err);
      const errorMessage = err.message || 'Có lỗi xảy ra';
      setError(errorMessage);
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: errorMessage
      });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn chắc chắn muốn xóa?')) {
      try {
        await carService.deleteCar(id);
        addNotification({
          type: 'success',
          title: 'Thành công',
          message: 'Xóa xe thành công'
        });
        fetchCars();
      } catch (err) {
        console.error('Error:', err);
        addNotification({
          type: 'error',
          title: 'Lỗi',
          message: err.message || 'Có lỗi xảy ra khi xóa'
        });
      }
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(0); // Reset to first page when filter changes
  };

  const clearFilters = () => {
    setFilters({
      keyword: '',
      categoryId: '',
      minPrice: '',
      maxPrice: '',
      year: '',
      color: '',
    });
    setPage(0);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDir(sortDir === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(field);
      setSortDir('ASC');
    }
    setPage(0);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEdit = (car) => {
    const imageUrls = car.images ? car.images.join(', ') : '';
    setFormData({
      name: car.name,
      categoryId: car.categoryId || '',
      price: car.price,
      manufactureYear: car.manufactureYear,
      color: car.color,
      engine: car.engine,
      transmission: car.transmission,
      seats: car.seats,
      images: car.images || [],
      imageUrls: imageUrls,
      description: car.description,
    });
    setEditingId(car.id);
    setShowForm(true);
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
      images: [],
      imageUrls: '',
      description: '',
    });
    setEditingId(null);
    setShowForm(false);
    setError(null);
  };

  const formatPrice = (price) => {
    return formatCurrency(price);
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return <FaSort className="opacity-50" />;
    return sortDir === 'ASC' ? <FaSortUp /> : <FaSortDown />;
  };

  const handleViewDetail = (car) => {
    setSelectedCar(car);
    setShowDetail(true);
  };

  const handleImport = async (importData) => {
    try {
      // Lấy danh sách categories để map tên thành ID
      const categoriesResponse = await categoryService.getAllCategories();
      const categories = categoriesResponse.data || [];

      const result = await carService.importCars(importData, categories);

      if (result.data.errors.length > 0) {
        // Hiển thị chi tiết lỗi
        const errorMessage = result.data.errors.slice(0, 5).map(err => 
          `Dòng ${err.row}: ${err.message}`
        ).join('\n');
        
        addNotification({
          type: 'warning',
          title: 'Import hoàn tất với lỗi',
          message: `${result.message}\n\nMột số lỗi:\n${errorMessage}${result.data.errors.length > 5 ? '\n...' : ''}`
        });
      } else {
        addNotification({
          type: 'success',
          title: 'Import thành công',
          message: result.message
        });
      }

      // Refresh danh sách xe
      fetchCars();
      
    } catch (error) {
      console.error('Import error:', error);
      addNotification({
        type: 'error',
        title: 'Lỗi Import',
        message: error.message || 'Có lỗi xảy ra khi import dữ liệu'
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Quản Lý Ô Tô</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition font-semibold"
          >
            <FaFileImport /> Import Excel/CSV
          </button>
          <button
            onClick={() => (showForm ? resetForm() : setShowForm(true))}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition font-semibold"
          >
            <FaPlus /> {showForm ? 'Hủy' : 'Thêm Ô Tô'}
          </button>
        </div>
      </div>

      {/* Filter Component */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Bộ lọc tìm kiếm</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tìm kiếm
            </label>
            <input
              type="text"
              placeholder="Tên xe..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.keyword}
              onChange={(e) => handleFilterChange('keyword', e.target.value)}
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Danh mục
            </label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.categoryId}
              onChange={(e) => handleFilterChange('categoryId', e.target.value)}
            >
              <option value="">Tất cả danh mục</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Year */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Năm sản xuất
            </label>
            <input
              type="number"
              placeholder="2024"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.year}
              onChange={(e) => handleFilterChange('year', e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {/* Min Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Giá từ (VNĐ)
            </label>
            <input
              type="number"
              placeholder="Từ"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange('minPrice', e.target.value)}
            />
          </div>

          {/* Max Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Giá đến (VNĐ)
            </label>
            <input
              type="number"
              placeholder="Đến"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
            />
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Màu sắc
            </label>
            <input
              type="text"
              placeholder="Đen, Trắng..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.color}
              onChange={(e) => handleFilterChange('color', e.target.value)}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={clearFilters}
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition font-semibold"
          >
            Xóa bộ lọc
          </button>
          <div className="text-sm text-gray-600 flex items-center">
            Tìm thấy {cars.totalElements} kết quả
          </div>
        </div>
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

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Hình Ảnh Xe
              </label>
              <ImageUploader
                key={`image-uploader-${editingId || 'new'}-${formData.imageUrls}`}
                images={formData.images}
                onImagesChange={(newImages) => {
                  setFormData({ 
                    ...formData, 
                    images: newImages,
                    imageUrls: newImages.join(', ')
                  });
                }}
                folder="cars"
                multiple={true}
                maxImages={10}
                initialUrlInput={formData.imageUrls}
              />
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

      {/* Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {cars.loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b-2 border-gray-300">
                <tr>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-800">
                    Ảnh
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-sm font-semibold text-gray-800 cursor-pointer hover:bg-gray-200 transition"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center gap-2">
                      Tên {getSortIcon('name')}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">
                    Danh Mục
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-sm font-semibold text-gray-800 cursor-pointer hover:bg-gray-200 transition"
                    onClick={() => handleSort('price')}
                  >
                    <div className="flex items-center gap-2">
                      Giá {getSortIcon('price')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-sm font-semibold text-gray-800 cursor-pointer hover:bg-gray-200 transition"
                    onClick={() => handleSort('manufactureYear')}
                  >
                    <div className="flex items-center gap-2">
                      Năm {getSortIcon('manufactureYear')}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">
                    Đánh Giá
                  </th>
                 
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">
                    Hành Động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {(cars?.content || []).map((car) => (
                  <tr key={car.id} className="hover:bg-blue-50 transition">
                    <td className="px-4 py-4">
                      {car.images && car.images.length > 0 ? (
                        <img
                          src={car.images[0]}
                          alt={car.name}
                          className="w-16 h-12 object-cover rounded border"
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml;base64,' + btoa(`
                              <svg width="64" height="48" xmlns="http://www.w3.org/2000/svg">
                                <rect width="100%" height="100%" fill="#f3f4f6"/>
                                <text x="50%" y="50%" font-family="Arial" font-size="10" fill="#9ca3af" text-anchor="middle" dy=".3em">🚗</text>
                              </svg>
                            `);
                          }}
                        />
                      ) : (
                        <div className="w-16 h-12 bg-gray-100 rounded border flex items-center justify-center text-gray-400 text-xs">
                          🚗
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800 font-medium">{car.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
                        {car.category.name || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {formatPrice(car.price)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {car.manufactureYear}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500">⭐</span>
                        <span>{car.averageRating?.toFixed(1) || '0.0'}</span>
                        <span className="text-gray-400">({car.reviewCount || 0})</span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewDetail(car)}
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
            {(!cars?.content || cars.content.length === 0) && (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg">Chưa có ô tô nào</p>
                <p className="text-sm">Nhấn nút "Thêm Ô Tô" để thêm mới</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pagination - Like CarsPage */}
      {cars.totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-8">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 0}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Trước
          </button>
          <div className="flex space-x-2">
            {[...Array(cars.totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => handlePageChange(index)}
                className={`px-4 py-2 rounded-lg ${
                  page === index
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= cars.totalPages - 1}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Sau →
          </button>
        </div>
      )}

      {/* Car Detail Modal - Enhanced with Images */}
      {showDetail && selectedCar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-800">Chi Tiết Xe: {selectedCar.name}</h2>
              <button
                onClick={() => setShowDetail(false)}
                className="text-gray-600 hover:text-gray-800 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              {/* Images Gallery */}
              {selectedCar.images && selectedCar.images.length > 0 && (
                <div className="mb-6">
                  <p className="text-gray-600 text-sm mb-2">Hình ảnh ({selectedCar.images.length})</p>
                  <div className="grid grid-cols-4 gap-2">
                    {selectedCar.images.map((url, index) => (
                      <div key={index} className="relative">
                        <img
                          src={url}
                          alt={`${selectedCar.name} - Ảnh ${index + 1}`}
                          className="w-full h-24 object-cover rounded border cursor-pointer hover:opacity-80 transition"
                          onClick={() => window.open(url, '_blank')}
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml;base64,' + btoa(`
                              <svg width="100" height="96" xmlns="http://www.w3.org/2000/svg">
                                <rect width="100%" height="100%" fill="#f3f4f6"/>
                                <text x="50%" y="50%" font-family="Arial" font-size="10" fill="#9ca3af" text-anchor="middle" dy=".3em">Lỗi ảnh</text>
                              </svg>
                            `);
                          }}
                        />
                        {index === 0 && (
                          <span className="absolute top-1 left-1 bg-blue-600 text-white text-xs px-1 rounded">
                            Chính
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Car Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600 text-sm">Danh mục</p>
                  <p className="font-semibold">{selectedCar.categoryName || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Giá</p>
                  <p className="font-semibold text-blue-600">{formatPrice(selectedCar.price)}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Năm sản xuất</p>
                  <p className="font-semibold">{selectedCar.manufactureYear || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Màu sắc</p>
                  <p className="font-semibold">{selectedCar.color || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Động cơ</p>
                  <p className="font-semibold">{selectedCar.engine || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Hộp số</p>
                  <p className="font-semibold">{selectedCar.transmission || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Số chỗ ngồi</p>
                  <p className="font-semibold">{selectedCar.seats || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Đánh giá</p>
                  <p className="font-semibold">
                    ⭐ {selectedCar.averageRating?.toFixed(1) || '0.0'} ({selectedCar.reviewCount || 0} đánh giá)
                  </p>
                </div>
              </div>
              
              {selectedCar.description && (
                <div className="mt-4">
                  <p className="text-gray-600 text-sm">Mô tả</p>
                  <p className="font-semibold">{selectedCar.description}</p>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end gap-2">
              <button
                onClick={() => {
                  handleEdit(selectedCar);
                  setShowDetail(false);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
              >
                ✏️ Chỉnh sửa
              </button>
              <button
                onClick={() => setShowDetail(false)}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImport}
        title="Import Dữ Liệu Ô Tô"
        templateColumns={carService.getImportTemplate().columns}
        sampleData={carService.getImportTemplate().sampleData}
      />
    </div>
  );
};

export default AdminCars;
