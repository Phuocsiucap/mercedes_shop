import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyDrivertests, createDrivertest } from '../api/drivertestApi';
import { getAllCars } from '../api/carApi';
import { FaCalendarAlt, FaMapMarkerAlt, FaCar, FaMoneyBillWave, FaClock, FaPlus, FaHistory } from 'react-icons/fa';

const DrivertestPage = () => {
  // Initialize as empty array to avoid map errors on first render
  const [drivertests, setDrivertests] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    carId: '',
    testDate: '',
    testTime: '',
    location: '',
    notes: '', 
    fee: 500000 
  });
  
  const [cars, setCars] = useState([]);

  useEffect(() => {
    let isMounted = true; // Flag to prevent state updates on unmounted component

    const fetchData = async () => {
      try {
        setLoading(true);
        // Execute API calls in parallel
        const [driverRes, carRes] = await Promise.allSettled([
            getMyDrivertests(),
            getAllCars({ page: 0, size: 100 })
        ]);

        if (isMounted) {
            // Handle Driver Tests Response
            if (driverRes.status === 'fulfilled') {
                const res = driverRes.value;
                // Check if response has data property or is the array itself
                const data = res?.data || res; 
                setDrivertests(Array.isArray(data) ? data : []);
            } else {
                console.error("Failed to load driver tests", driverRes.reason);
                setDrivertests([]); // Fallback to empty array
                setError("Không thể tải danh sách lái thử.");
            }

            // Handle Cars Response
            if (carRes.status === 'fulfilled') {
                const res = carRes.value;
                let carData = [];
                if (res?.data?.content) carData = res.data.content;
                else if (Array.isArray(res?.data)) carData = res.data;
                else if (Array.isArray(res)) carData = res;
                setCars(carData);
            } else {
                console.error("Failed to load cars", carRes.reason);
                setCars([]);
            }
        }
      } catch (err) {
        if (isMounted) {
            console.error('Unexpected error:', err);
            setError('Đã xảy ra lỗi không mong muốn.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => { isMounted = false; }; // Cleanup function
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price || 0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
      case 'SCHEDULED': return 'bg-blue-100 text-blue-700 border border-blue-200';
      case 'COMPLETED': return 'bg-green-100 text-green-700 border border-green-200';
      case 'CANCELLED': return 'bg-red-100 text-red-700 border border-red-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status) => {
    const map = {
        'PENDING': 'Chờ Xác Nhận',
        'SCHEDULED': 'Đã Lên Lịch',
        'COMPLETED': 'Hoàn Thành',
        'CANCELLED': 'Đã Hủy'
    };
    return map[status] || status || 'Không rõ';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.carId || !formData.testDate || !formData.testTime || !formData.location) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    try {
      setFormLoading(true);
      const isoDateTime = `${formData.testDate}T${formData.testTime}:00`;
      const payload = {
        carId: formData.carId,
        testDate: isoDateTime,
        testLocation: formData.location,
        fee: formData.fee
      };
      
      await createDrivertest(payload);
      alert('Đăng ký lái thử thành công!');
      
      setFormData({ carId: '', testDate: '', testTime: '', location: '', notes: '', fee: 500000 });
      setShowScheduleForm(false);
      setError(null);
      
      // Refresh list
      const res = await getMyDrivertests();
      const data = res?.data || res;
      setDrivertests(Array.isArray(data) ? data : []);

    } catch (err) {
      console.error('Error:', err);
      setError(err.response?.data?.message || err.message || 'Không thể đăng ký lái thử');
    } finally {
      setFormLoading(false);
    }
  };

  const getMinDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date.toISOString().split('T')[0];
  };

  // Helper an toàn để lấy ID
  const getSafeId = (id) => {
      if (!id) return '---';
      return String(id).substring(0, 8);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <FaCar className="text-blue-600" /> Quản Lý Lái Thử
            </h1>
            <p className="text-gray-600 mt-1 ml-1">Xem lịch sử và đăng ký trải nghiệm xe mới</p>
          </div>
          <button
            onClick={() => setShowScheduleForm(!showScheduleForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition shadow-lg flex items-center gap-2"
          >
            {showScheduleForm ? '✕ Đóng biểu mẫu' : <><FaPlus /> Đăng ký lái thử</>}
          </button>
        </div>

        {/* Form */}
        {showScheduleForm && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100 animate-fade-in">
            <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2 flex items-center gap-2">
              <FaPlus className="text-blue-500" /> Đăng Ký Lái Thử Mới
            </h2>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
                <span>⚠️</span> {error}
              </div>
            )}

            <form onSubmit={handleScheduleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Chọn xe <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select name="carId" value={formData.carId} onChange={handleInputChange} required className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white">
                        <option value="">-- Chọn dòng xe muốn thử --</option>
                        {cars.map((car) => (
                        <option key={car.id} value={car.id}>{car.name} {car.year ? `(${car.year})` : ''}</option>
                        ))}
                    </select>
                    <FaCar className="absolute left-3 top-3.5 text-gray-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Địa điểm <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input type="text" name="location" value={formData.location} onChange={handleInputChange} placeholder="VD: Showroom Hà Nội" required className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                    <FaMapMarkerAlt className="absolute left-3 top-3.5 text-gray-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Ngày lái thử <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input type="date" name="testDate" value={formData.testDate} onChange={handleInputChange} min={getMinDate()} required className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                    <FaCalendarAlt className="absolute left-3 top-3.5 text-gray-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Giờ lái thử <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input type="time" name="testTime" value={formData.testTime} onChange={handleInputChange} required className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                    <FaClock className="absolute left-3 top-3.5 text-gray-400" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Ghi chú thêm</label>
                <textarea name="notes" value={formData.notes} onChange={handleInputChange} placeholder="Nhập yêu cầu đặc biệt..." rows="3" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="bg-blue-50 p-4 rounded-lg flex items-center justify-between border border-blue-100">
                  <div className="flex items-center gap-2 text-blue-800"><FaMoneyBillWave className="text-xl" /><span className="font-medium">Phí dự kiến:</span></div>
                  <span className="font-bold text-blue-700 text-lg">{formatPrice(formData.fee)}</span>
              </div>
              <div className="flex gap-4 pt-2">
                <button type="submit" disabled={formLoading} className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold px-6 py-3 rounded-lg transition shadow-md">
                  {formLoading ? 'Đang xử lý...' : 'Xác Nhận Đăng Ký'}
                </button>
                <button type="button" onClick={() => setShowScheduleForm(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-6 py-3 rounded-lg transition">Hủy Bỏ</button>
              </div>
            </form>
          </div>
        )}

        {/* List Data */}
        {!drivertests || drivertests.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-16 text-center border border-gray-100">
            <div className="text-6xl mb-6 bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto text-gray-400"><FaHistory /></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Chưa có lịch lái thử nào</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">Bạn chưa đăng ký lịch lái thử nào.</p>
            <Link to="/cars" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition shadow-sm"><FaCar /> Xem Danh Sách Xe</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {drivertests.map((dt) => {
              // *** FIX CRITICAL: Skip invalid items to prevent crash ***
              if (!dt || typeof dt !== 'object') return null;
              
              return (
                <div key={dt.id || Math.random()} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition duration-300">
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-bold text-gray-800">
                             {dt.carName || 'Xe không xác định'}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getStatusColor(dt.status)}`}>
                            {getStatusText(dt.status)}
                          </span>
                        </div>
                        {/* Safe ID rendering */}
                        <p className="text-sm text-gray-500">Mã đơn: #{getSafeId(dt.id)}</p>
                      </div>
                      <div className="text-right">
                         <span className="block text-xs text-gray-500 uppercase font-semibold">Phí dịch vụ</span>
                         <span className="text-lg font-bold text-blue-600">{formatPrice(dt.fee)}</span>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="flex items-start gap-3">
                          <div className="mt-1 text-gray-400"><FaCalendarAlt /></div>
                          <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Ngày lái thử</p>
                              <p className="text-gray-800 font-medium">
                                  {dt.testDate ? new Date(dt.testDate).toLocaleDateString('vi-VN') : 'N/A'}
                              </p>
                          </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                          <div className="mt-1 text-gray-400"><FaClock /></div>
                          <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Giờ</p>
                              <p className="text-gray-800 font-medium">
                                  {dt.testDate ? new Date(dt.testDate).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'}) : 'N/A'}
                              </p>
                          </div>
                      </div>

                      <div className="flex items-start gap-3 md:col-span-2">
                          <div className="mt-1 text-gray-400"><FaMapMarkerAlt /></div>
                          <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Địa điểm</p>
                              <p className="text-gray-800 font-medium">{dt.testLocation || dt.location || 'Chưa xác định'}</p>
                          </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DrivertestPage;