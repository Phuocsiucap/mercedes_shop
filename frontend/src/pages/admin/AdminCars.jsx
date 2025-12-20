import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { FaEdit, FaTrash, FaPlus, FaSort, FaSortUp, FaSortDown, FaEye } from 'react-icons/fa';
import AdminFilter from '../../components/AdminFilter';
import AdminPagination from '../../components/AdminPagination';
import CarDetailModal from '../../components/CarDetailModal';
import { useAdminFilter } from '../../hooks/useAdminFilter';
import { exportToExcel, exportConfigs } from '../../utils/exportUtils';

const AdminCars = () => {
  const [cars, setCars] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    price: '',
    manufactureYear: '',
    color: '',
    engine: '',
    transmission: '',
    seats: '',
    image: '',
    description: '',
  });
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
    size: 10
  });
  const [selectedCar, setSelectedCar] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  // Filter hook
  const {
    filters,
    searchTerm,
    sortBy,
    sortDir,
    page,
    size,
    handleFilterChange,
    handleSearch,
    handleSort,
    handlePageChange,
    handleSizeChange,
    queryParams
  } = useAdminFilter();

  useEffect(() => {
    fetchCars();
    fetchCategories();
  }, [queryParams]);

  const fetchCars = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams(queryParams);
      const response = await axios.get(`/admin/cars?${params.toString()}`);
      
      // Handle paginated response format
      if (response.data?.data?.content) {
        setCars(response.data.data.content);
        setPagination({
          totalElements: response.data.data.totalElements,
          totalPages: response.data.data.totalPages,
          currentPage: response.data.data.number,
          size: response.data.data.size
        });
      } else {
        setCars([]);
        setPagination({ totalElements: 0, totalPages: 0, currentPage: 0, size: 10 });
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching cars:', err);
      setError('Không thể tải danh sách xe');
      setCars([]);
      setPagination({ totalElements: 0, totalPages: 0, currentPage: 0, size: 10 });
    } finally {
      setLoading(false);
    }
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
      const submitData = {
        ...formData,
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
      fetchCars();
    } catch (err) {
      console.error('Error:', err);
      setError(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleEdit = (car) => {
    setFormData({
      name: car.name,
      categoryId: car.categoryId || '',
      price: car.price,
      manufactureYear: car.manufactureYear,
      color: car.color,
      engine: car.engine,
      transmission: car.transmission,
      seats: car.seats,
      image: car.image,
      description: car.description,
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
      image: '',
      description: '',
    });
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

  const getSortIcon = (field) => {
    if (sortBy !== field) return <FaSort className="opacity-50" />;
    return sortDir === 'ASC' ? <FaSortUp /> : <FaSortDown />;
  };

  // Filter configuration
  const filterConfig = [
    {
      key: 'categoryId',
      label: 'Danh mục',
      type: 'select',
      options: categories.map(cat => ({ value: cat.id, label: cat.name }))
    },
    {
      key: 'price',
      label: 'Giá (VND)',
      type: 'range'
    },
    {
      key: 'year',
      label: 'Năm sản xuất',
      type: 'number',
      placeholder: 'Nhập năm'
    },
    {
      key: 'color',
      label: 'Màu sắc',
      type: 'text',
      placeholder: 'Nhập màu sắc'
    },
    {
      key: 'engine',
      label: 'Động cơ',
      type: 'text',
      placeholder: 'Nhập loại động cơ'
    },
    {
      key: 'transmission',
      label: 'Hộp số',
      type: 'text',
      placeholder: 'Nhập loại hộp số'
    },
    {
      key: 'seats',
      label: 'Số chỗ ngồi',
      type: 'number',
      placeholder: 'Nhập số chỗ'
    },
    {
      key: 'status',
      label: 'Trạng thái',
      type: 'select',
      options: [
        { value: 'ACTIVE', label: 'Hoạt động' },
        { value: 'INACTIVE', label: 'Không hoạt động' }
      ]
    }
  ];

  const handleExport = () => {
    exportToExcel(cars, exportConfigs.cars.filename, exportConfigs.cars.headers);
  };

  const handleViewDetail = (car) => {
    setSelectedCar(car);
    setShowDetail(true);
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

      {/* Filter Component */}
      <AdminFilter
        filters={filterConfig}
        onFilterChange={handleFilterChange}
        onSearch={handleSearch}
        searchPlaceholder="Tìm kiếm theo tên xe, mô tả..."
        showExport={true}
        onExport={handleExport}
      />

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
                URL Hình Ảnh
              </label>
              <input
                type="text"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="https://example.com/image.jpg"
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
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b-2 border-gray-300">
                <tr>
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
                    Đơn Hàng
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
                        {car.categoryName || '-'}
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
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                        {car.totalOrders || 0} đơn
                      </span>
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
            {cars.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg">Chưa có ô tô nào</p>
                <p className="text-sm">Nhấn nút "Thêm Ô Tô" để thêm mới</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      <AdminPagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        totalElements={pagination.totalElements}
        size={pagination.size}
        onPageChange={handlePageChange}
        onSizeChange={handleSizeChange}
      />

      {/* Car Detail Modal */}
      <CarDetailModal
        car={selectedCar}
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
      />
    </div>
  );
};

export default AdminCars;
