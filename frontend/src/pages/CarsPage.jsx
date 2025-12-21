import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { searchCars } from '../api/carApi';
import * as drivertestApi from '../api/drivertestApi';
import { createVNPayPayment } from '../api/paymentApi';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { FaSearch, FaFilter, FaCar, FaCalendarAlt, FaMapMarkerAlt, FaMoneyBillWave, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

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
    size: 9, // Changed to 9 for a better grid layout (3x3)
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
  }, [pagination.currentPage, filters.sortBy, filters.sortDir]); // Re-fetch when page or sort changes

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/categories');
      // Handle different response structures
      const data = response.data?.data || (Array.isArray(response.data) ? response.data : []);
      setCategories(data);
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

      // Handle response structure
      const content = data.content || (Array.isArray(data) ? data : []);
      
      setCars(content);
      setPagination((prev) => ({
        ...prev,
        totalPages: data.totalPages || 1, // Default to 1 if not present
        totalElements: data.totalElements || content.length,
      }));
      setError(null);
    } catch (err) {
      console.error('Error fetching cars:', err);
      setError('Không thể tải danh sách xe. Vui lòng thử lại sau.');
      setCars([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Apply filters button handler
  const applyFilters = () => {
    setPagination((prev) => ({ ...prev, currentPage: 0 }));
    // Update URL
    const newParams = new URLSearchParams();
    Object.keys(filters).forEach(key => {
        if (filters[key]) newParams.set(key, filters[key]);
    });
    setSearchParams(newParams);
    fetchCars();
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < pagination.totalPages) {
        setPagination((prev) => ({ ...prev, currentPage: newPage }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const clearFilters = () => {
    setFilters({
      keyword: '', categoryId: '', minPrice: '', maxPrice: '', year: '', color: '', sortBy: 'id', sortDir: 'DESC',
    });
    setSearchParams({});
    setPagination((prev) => ({ ...prev, currentPage: 0 }));
    // We need to trigger fetch explicitly or via useEffect dependency if we added filters to it
    // For now, let's just reload the page state which will trigger useEffect
    setTimeout(() => fetchCars(), 0); 
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
      const testDriveFee = Math.floor(selectedCarForTestDrive.price * 0.03);
      const response = await drivertestApi.createDrivertest({
        carId: selectedCarForTestDrive.id,
        testDate: new Date(testDriveData.testDate).toISOString(),
        testLocation: testDriveData.testLocation,
        fee: testDriveFee,
      });

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
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-end gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Danh Sách Xe</h1>
            <p className="text-gray-600">Khám phá các dòng xe sang trọng và đẳng cấp</p>
          </div>
          <div className="flex items-center gap-2">
             <span className="text-sm text-gray-500">Sắp xếp:</span>
             <select 
                value={`${filters.sortBy}-${filters.sortDir}`}
                onChange={(e) => {
                    const [sortBy, sortDir] = e.target.value.split('-');
                    setFilters(prev => ({ ...prev, sortBy, sortDir }));
                }}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
             >
                 <option value="id-DESC">Mới nhất</option>
                 <option value="price-ASC">Giá: Thấp đến Cao</option>
                 <option value="price-DESC">Giá: Cao đến Thấp</option>
                 <option value="manufactureYear-DESC">Đời xe: Mới nhất</option>
             </select>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className={`lg:w-1/4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <FaFilter className="text-blue-600"/> Bộ lọc tìm kiếm
                </h2>
                <button onClick={clearFilters} className="text-sm text-blue-600 hover:underline">Đặt lại</button>
              </div>

              <div className="space-y-5">
                {/* Search Keyword */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tên xe</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={filters.keyword}
                      onChange={(e) => handleFilterChange('keyword', e.target.value)}
                      placeholder="Nhập tên xe..."
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                    />
                    <FaSearch className="absolute left-3 top-2.5 text-gray-400 text-sm" />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Dòng xe</label>
                  <select
                    value={filters.categoryId}
                    onChange={(e) => handleFilterChange('categoryId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                  >
                    <option value="">Tất cả dòng xe</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Khoảng giá (VNĐ)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={filters.minPrice}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                      placeholder="Min"
                      className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    />
                    <input
                      type="number"
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                      placeholder="Max"
                      className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    />
                  </div>
                </div>

                {/* Year & Color */}
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Năm SX</label>
                        <input
                            type="number"
                            value={filters.year}
                            onChange={(e) => handleFilterChange('year', e.target.value)}
                            placeholder="VD: 2024"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Màu sắc</label>
                        <input
                            type="text"
                            value={filters.color}
                            onChange={(e) => handleFilterChange('color', e.target.value)}
                            placeholder="VD: Đen"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        />
                    </div>
                </div>

                <button
                    onClick={applyFilters}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition shadow-sm"
                >
                    Áp dụng bộ lọc
                </button>
              </div>
            </div>
          </aside>

          {/* Mobile Filter Toggle */}
          <div className="lg:hidden mb-4">
            <button 
                onClick={() => setShowFilters(!showFilters)} 
                className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 py-2.5 rounded-lg font-medium text-gray-700 shadow-sm"
            >
                <FaFilter /> {showFilters ? 'Ẩn bộ lọc' : 'Hiển thị bộ lọc'}
            </button>
          </div>

          {/* Cars Grid */}
          <main className="lg:w-3/4">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {[...Array(6)].map((_, i) => (
                     <div key={i} className="bg-white rounded-xl shadow-sm h-80 animate-pulse">
                         <div className="h-48 bg-gray-200 rounded-t-xl"></div>
                         <div className="p-4 space-y-3">
                             <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                             <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                             <div className="h-8 bg-gray-200 rounded w-full"></div>
                         </div>
                     </div>
                 ))}
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-center">
                {error}
              </div>
            ) : cars.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <div className="text-gray-300 text-6xl mb-4 mx-auto"><FaCar /></div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Không tìm thấy xe phù hợp</h3>
                <p className="text-gray-500 mb-6">Vui lòng thử lại với các tiêu chí tìm kiếm khác.</p>
                <button onClick={clearFilters} className="text-blue-600 font-medium hover:underline">Xóa toàn bộ lọc</button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {cars.map((car) => (
                    <div key={car.id} className="group bg-white rounded-xl shadow-sm hover:shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 flex flex-col h-full">
                      {/* Image */}
                      <div className="relative h-48 bg-gray-100 overflow-hidden">
                        <Link to={`/cars/${car.id}`}>
                            {car.image ? (
                            <img
                                src={car.image}
                                alt={car.name}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            ) : (
                            <div className="flex items-center justify-center h-full text-gray-300 text-5xl">
                                <FaCar />
                            </div>
                            )}
                        </Link>
                        <div className="absolute top-3 right-3">
                            <span className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-gray-700 shadow-sm border border-gray-100">
                                {car.manufactureYear}
                            </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5 flex flex-col flex-1">
                        <div className="mb-auto">
                            <Link to={`/cars/${car.id}`}>
                                <h3 className="text-lg font-bold text-gray-900 mb-1 hover:text-blue-600 transition line-clamp-1" title={car.name}>
                                {car.name}
                                </h3>
                            </Link>
                            <p className="text-sm text-gray-500 mb-3">{car.category?.name || 'Sedan'}</p>
                            
                            <div className="flex items-center gap-4 text-xs text-gray-500 mb-4 border-t border-gray-50 pt-3">
                                <span className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-gray-400"></span> {car.color || 'Tiêu chuẩn'}
                                </span>
                                <span className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-gray-400"></span> {car.seats} Chỗ
                                </span>
                                <span className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-gray-400"></span> {car.transmission || 'Tự động'}
                                </span>
                            </div>
                        </div>

                        <div className="mt-2">
                            <div className="text-xl font-bold text-blue-700 mb-4">
                                {formatPrice(car.price)}
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <Link 
                                    to={`/cars/${car.id}`}
                                    className="text-center py-2 rounded-lg border border-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-50 transition"
                                >
                                    Chi tiết
                                </Link>
                                <button
                                    onClick={() => handleScheduleTestDrive(car)}
                                    className="bg-gray-900 hover:bg-black text-white font-medium py-2 rounded-lg text-sm transition"
                                >
                                    Lái thử
                                </button>
                            </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="mt-10 flex justify-center items-center gap-2">
                    <button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={pagination.currentPage === 0}
                      className="w-10 h-10 flex items-center justify-center rounded-lg border bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      <FaChevronLeft className="text-gray-600" />
                    </button>
                    
                    <span className="text-sm text-gray-600 font-medium px-2">
                        Trang {pagination.currentPage + 1} / {pagination.totalPages}
                    </span>

                    <button
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={pagination.currentPage === pagination.totalPages - 1}
                      className="w-10 h-10 flex items-center justify-center rounded-lg border bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      <FaChevronRight className="text-gray-600" />
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-800">Đăng Ký Lái Thử</h2>
              <button
                onClick={() => setShowTestDriveForm(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitTestDrive} className="p-6">
              <div className="flex items-start gap-4 mb-6 bg-blue-50 p-4 rounded-xl border border-blue-100">
                 <div className="w-20 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    {selectedCarForTestDrive.image ? (
                        <img src={selectedCarForTestDrive.image} alt="" className="w-full h-full object-cover" />
                    ) : <div className="w-full h-full flex items-center justify-center"><FaCar className="text-gray-400"/></div>}
                 </div>
                 <div>
                     <h3 className="font-bold text-gray-900 text-sm mb-1">{selectedCarForTestDrive.name}</h3>
                     <p className="text-xs text-gray-600 mb-1">Giá xe: {formatPrice(selectedCarForTestDrive.price)}</p>
                     <div className="flex items-center gap-1 text-blue-700 font-bold text-sm">
                        <FaMoneyBillWave /> Phí cọc: {formatPrice(Math.floor(selectedCarForTestDrive.price * 0.03))}
                     </div>
                 </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Thời gian lái thử</label>
                  <div className="relative">
                    <input
                      type="datetime-local"
                      value={testDriveData.testDate}
                      onChange={(e) => setTestDriveData({ ...testDriveData, testDate: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                      required
                    />
                    <FaCalendarAlt className="absolute left-3.5 top-3 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Địa điểm nhận xe</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={testDriveData.testLocation}
                      onChange={(e) => setTestDriveData({ ...testDriveData, testLocation: e.target.value })}
                      placeholder="VD: Showroom Hà Nội..."
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                      required
                    />
                    <FaMapMarkerAlt className="absolute left-3.5 top-3 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Thanh toán phí cọc</label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className={`cursor-pointer border rounded-lg p-3 flex items-center justify-center gap-2 text-sm font-medium transition ${testDrivePaymentMethod === 'direct' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300'}`}>
                        <input type="radio" name="payment" value="direct" checked={testDrivePaymentMethod === 'direct'} onChange={e=>setTestDrivePaymentMethod(e.target.value)} className="hidden" />
                        Tiền mặt
                    </label>
                    <label className={`cursor-pointer border rounded-lg p-3 flex items-center justify-center gap-2 text-sm font-medium transition ${testDrivePaymentMethod === 'vnpay' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300'}`}>
                        <input type="radio" name="payment" value="vnpay" checked={testDrivePaymentMethod === 'vnpay'} onChange={e=>setTestDrivePaymentMethod(e.target.value)} className="hidden" />
                        VNPay QR
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowTestDriveForm(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition text-sm"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 shadow-md transition text-sm"
                >
                  Xác nhận đặt lịch
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