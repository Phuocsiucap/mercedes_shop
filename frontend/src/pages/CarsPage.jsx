import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { searchCars } from '../api/carApi';
import * as drivertestApi from '../api/drivertestApi';
import { createVNPayPayment } from '../api/paymentApi';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';

const CarsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const [cars, setCars] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTestDriveForm, setShowTestDriveForm] = useState(false);
  const [selectedCarForTestDrive, setSelectedCarForTestDrive] = useState(null);
  const [testDrivePaymentMethod, setTestDrivePaymentMethod] = useState('direct');
  const [testDriveData, setTestDriveData] = useState({
    testDate: '',
    testLocation: '',
  });
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    size: 12,
  });

  const [filters, setFilters] = useState({
    keyword: searchParams.get('keyword') || '',
    categoryId: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    year: searchParams.get('year') || '',
    color: searchParams.get('color') || '',
    sortBy: searchParams.get('sortBy') || 'id',
    sortDir: searchParams.get('sortDir') || 'DESC',
  });

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchCars();
  }, [pagination.currentPage, filters]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/categories');
      setCategories(response.data.data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchCars = async () => {
    try {
      setLoading(true);
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
      const data = response.data;

      setCars(data.content || []);
      setPagination((prev) => ({
        ...prev,
        totalPages: data.totalPages || 0,
        totalElements: data.totalElements || 0,
      }));
      setError(null);
    } catch (err) {
      console.error('Error fetching cars:', err);
      setError('Không thể tải danh sách xe. Vui lòng thử lại sau.');
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

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, currentPage: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const handleScheduleTestDrive = (car) => {
    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để đặt lịch lái thử');
      return;
    }
    setSelectedCarForTestDrive(car);
    setTestDriveData({ testDate: '', testLocation: '' });
    setShowTestDriveForm(true);
  };

  const handleSubmitTestDrive = async (e) => {
    e.preventDefault();
    try {
      if (!testDriveData.testDate || !testDriveData.testLocation) {
        alert('Vui lòng điền đầy đủ thông tin');
        return;
      }
      const testDriveFee = Math.floor(selectedCarForTestDrive.price * 0.03); // 3% of car price
      const response = await drivertestApi.createDrivertest({
        carId: selectedCarForTestDrive.id,
        testDate: new Date(testDriveData.testDate).toISOString(),
        testLocation: testDriveData.testLocation,
        fee: testDriveFee,
      });

      // If VNPay payment selected, redirect to payment
      if (testDrivePaymentMethod === 'vnpay' && response.data) {
        try {
          const paymentResponse = await createVNPayPayment({
            orderId: `TESTDRIVE_${response.data.id}`,
            amount: testDriveFee,
            orderInfo: `Thanh toan phi lai thu xe ${selectedCarForTestDrive.name}`,
            returnUrl: window.location.origin + '/payment',
          });

          if (paymentResponse.data && paymentResponse.data.paymentUrl) {
            window.location.href = paymentResponse.data.paymentUrl;
            return;
          }
        } catch (paymentErr) {
          console.error('Error creating VNPay payment:', paymentErr);
          alert('Lỗi khi tạo yêu cầu thanh toán VNPay');
          return;
        }
      }

      alert('Đặt lịch lái thử thành công!');
      setShowTestDriveForm(false);
      setTestDriveData({ testDate: '', testLocation: '' });
      setSelectedCarForTestDrive(null);
    } catch (err) {
      alert('Lỗi khi đặt lịch lái thử');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Danh Sách Xe Mercedes-Benz</h1>
          <p className="text-gray-600">
            Tìm thấy {pagination.totalElements} xe phù hợp
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-1/4">
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
          </aside>

          {/* Cars Grid */}
          <main className="lg:w-3/4">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
              </div>
            ) : error ? (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            ) : cars.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">Không tìm thấy xe phù hợp</p>
                <button
                  onClick={clearFilters}
                  className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Xóa bộ lọc
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {cars.map((car) => (
                    <Link
                      key={car.id}
                      to={`/cars/${car.id}`}
                      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition duration-300 transform hover:-translate-y-1"
                    >
                      <div className="relative h-48 bg-gray-200">
                        {car.image ? (
                          <img
                            src={car.image}
                            alt={car.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-400">
                            <span className="text-6xl">🚗</span>
                          </div>
                        )}
                        {car.averageRating > 0 && (
                          <div className="absolute top-2 right-2 bg-yellow-400 text-white px-2 py-1 rounded-full text-xs font-semibold">
                            ⭐ {car.averageRating.toFixed(1)}
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-semibold mb-2 text-gray-800 line-clamp-1">
                          {car.name}
                        </h3>
                        <div className="mb-3">
                          <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">
                            {car.category?.name || 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                          <span>Năm: {car.manufactureYear}</span>
                          <span>{car.seats} chỗ</span>
                        </div>
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-xl font-bold text-blue-600">
                            {formatPrice(car.price)}
                          </span>
                          <span className="text-blue-600 font-semibold">Chi tiết →</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleScheduleTestDrive(car);
                          }}
                          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition text-sm"
                        >
                          Đặt lịch lái thử
                        </button>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-2 mt-8">
                    <button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={pagination.currentPage === 0}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ← Trước
                    </button>
                    <div className="flex space-x-2">
                      {[...Array(pagination.totalPages)].map((_, index) => (
                        <button
                          key={index}
                          onClick={() => handlePageChange(index)}
                          className={`px-4 py-2 rounded-lg ${
                            pagination.currentPage === index
                              ? 'bg-blue-600 text-white'
                              : 'bg-white border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {index + 1}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={pagination.currentPage === pagination.totalPages - 1}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Sau →
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Test Drive Modal */}
      {showTestDriveForm && selectedCarForTestDrive && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Đặt lịch lái thử</h2>
              <button
                onClick={() => setShowTestDriveForm(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmitTestDrive} className="p-6 space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Xe: <span className="font-semibold text-gray-900">{selectedCarForTestDrive.name}</span>
                </label>
                <label className="block text-sm font-medium text-gray-700 mb-1">Giá xe</label>
                <div className="text-2xl font-bold text-blue-600 mb-3">
                  {formatPrice(selectedCarForTestDrive.price)}
                </div>
                <div className="border-t border-blue-100 pt-3">
                  <p className="text-xs text-gray-600 mb-1">Phí lái thử (3% giá xe):</p>
                  <p className="text-lg font-bold text-blue-600">
                    {formatPrice(Math.floor(selectedCarForTestDrive.price * 0.03))}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày và giờ lái <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={testDriveData.testDate}
                  onChange={(e) => setTestDriveData({ ...testDriveData, testDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Địa điểm <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={testDriveData.testLocation}
                  onChange={(e) => setTestDriveData({ ...testDriveData, testLocation: e.target.value })}
                  placeholder="VD: Showroom Mercedes Hà Nội"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phương thức thanh toán
                </label>
                <div className="space-y-2">
                  <label className="flex items-center p-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="testDrivePayment"
                      value="direct"
                      checked={testDrivePaymentMethod === 'direct'}
                      onChange={(e) => setTestDrivePaymentMethod(e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="ml-2 text-sm text-gray-700">Thanh toán trực tiếp</span>
                  </label>
                  <label className="flex items-center p-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="testDrivePayment"
                      value="vnpay"
                      checked={testDrivePaymentMethod === 'vnpay'}
                      onChange={(e) => setTestDrivePaymentMethod(e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="ml-2 text-sm text-gray-700">VNPay</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition"
                >
                  Đặt lịch
                </button>
                <button
                  type="button"
                  onClick={() => setShowTestDriveForm(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 rounded-lg transition"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarsPage;
