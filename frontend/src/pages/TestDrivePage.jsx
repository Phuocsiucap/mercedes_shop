import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FaCar, FaCalendarAlt, FaMapMarkerAlt, FaClock, FaTrash, FaCreditCard } from 'react-icons/fa';
import { driverTestService, carService } from '../services';
import paymentService from '../services/paymentService';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { toast } from 'react-toastify';

const TestDrivePage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { formatDate, addNotification } = useApp();

  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cars, setCars] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const carIdFromUrl = searchParams.get('carId');
  const carNameFromUrl = searchParams.get('carName');

  const [formData, setFormData] = useState({
    carId: carIdFromUrl || '',
    location: '',
    testDriveTime: '',
    notes: ''
  });

  const [selectedCar, setSelectedCar] = useState(null);
  const [depositAmount, setDepositAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('VNPAY'); // VNPAY or SHOWROOM

  useEffect(() => {
    if (!isAuthenticated) {
      addNotification({ type: 'warning', title: 'Thông báo', message: 'Vui lòng đăng nhập để đăng ký lái thử' });
      navigate('/login');
      return;
    }
    fetchMyBookings();
    fetchCars();
    if (carIdFromUrl) setShowForm(true);
  }, [isAuthenticated]);

  const fetchMyBookings = async () => {
    try {
      setLoading(true);
      const response = await driverTestService.getMyTestDrives();
      setMyBookings(response.data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCars = async () => {
    try {
      const response = await carService.getAllCars({ size: 100 });
      setCars(response.data?.content || []);
      
      // If carId from URL, find and set selected car
      if (carIdFromUrl) {
        const car = (response.data?.content || []).find(c => c.id === carIdFromUrl);
        if (car) {
          setSelectedCar(car);
          calculateDeposit(car.price);
        }
      }
    } catch (error) {
      console.error('Error fetching cars:', error);
    }
  };

  const calculateDeposit = (carPrice) => {
    // Calculate 1% of car price as deposit
    const deposit = Math.round(carPrice * 0.01);
    setDepositAmount(Math.max(5000, deposit)); // Minimum 5,000 VND
  };

  const handleCarChange = (carId) => {
    setFormData({ ...formData, carId });
    const car = cars.find(c => c.id === carId);
    if (car) {
      setSelectedCar(car);
      calculateDeposit(car.price);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.carId || !formData.location || !formData.testDriveTime) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    const selectedTime = new Date(formData.testDriveTime);
    if (selectedTime <= new Date()) {
      toast.error('Vui lòng chọn thời gian trong tương lai');
      return;
    }

    if (!selectedCar) {
      toast.error('Không tìm thấy thông tin xe');
      return;
    }

    try {
      setSubmitting(true);
      
      // Step 1: Create test drive booking first
      const bookingResponse = await driverTestService.createTestDrive({
        ...formData,
        depositAmount: depositAmount,
        paymentMethod: paymentMethod
      });
      
      if (!bookingResponse.success) {
        throw new Error(bookingResponse.message || 'Không thể tạo lịch đặt xe');
      }
      
      const bookingId = bookingResponse.data.id;
      
      // Step 2: Handle payment based on method
      if (paymentMethod === 'VNPAY') {
        // Create VNPay payment
        const paymentRequest = {
          orderId: bookingId,
          amount: depositAmount,
          orderInfo: `Dat coc lai thu xe ${selectedCar.name}`,
          returnUrl: `${window.location.origin}/test-drive-payment-return`,
          locale: 'vn'
        };
        
        console.log('Creating test drive payment:', paymentRequest);
        
        const paymentResponse = await paymentService.createTestDrivePayment(paymentRequest);
        
        console.log('Payment response:', paymentResponse);
        
        if (paymentResponse.success && paymentResponse.paymentUrl) {
          // Redirect to VNPay
          toast.info('Đang chuyển đến trang thanh toán...');
          window.location.href = paymentResponse.paymentUrl;
        } else {
          throw new Error(paymentResponse.message || 'Không thể tạo link thanh toán');
        }
      } else {
        // SHOWROOM payment - just show success message
        toast.success('Đăng ký lái thử thành công! Vui lòng thanh toán đặt cọc tại showroom khi đến lái thử.');
        setShowForm(false);
        setFormData({ carId: '', location: '', testDriveTime: '', notes: '' });
        setPaymentMethod('VNPAY');
        fetchMyBookings();
        setSubmitting(false);
      }
      
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message || 'Có lỗi xảy ra khi đặt lịch');
      setSubmitting(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Bạn có chắc muốn hủy lịch lái thử này?')) return;
    try {
      await driverTestService.cancelTestDrive(id);
      addNotification({ type: 'success', title: 'Thành công', message: 'Đã hủy lịch lái thử' });
      fetchMyBookings();
    } catch (error) {
      addNotification({ type: 'error', title: 'Lỗi', message: error.response?.data?.message || 'Hủy thất bại' });
    }
  };

  const getStatusColor = (status) => {
    const colors = { PENDING: 'bg-yellow-100 text-yellow-800', CONFIRMED: 'bg-blue-100 text-blue-800', COMPLETED: 'bg-green-100 text-green-800', CANCELLED: 'bg-red-100 text-red-800' };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status) => {
    const texts = { PENDING: 'Chờ xác nhận', CONFIRMED: 'Đã xác nhận', COMPLETED: 'Hoàn thành', CANCELLED: 'Đã hủy' };
    return texts[status] || status;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Đăng Ký Lái Thử</h1>
        <button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-semibold">
          <FaCar /> Đăng Ký Ngay
        </button>
      </div>

      {/* My Bookings */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Lịch Sử Đăng Ký</h2>
        {loading ? (
          <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div></div>
        ) : myBookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <FaCalendarAlt className="mx-auto text-4xl text-gray-400 mb-4" />
            <p className="text-gray-500">Bạn chưa có lịch đăng ký lái thử nào</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {myBookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
                {booking.carImage && <img src={booking.carImage} alt={booking.carName} className="w-full h-40 object-cover" />}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-800">{booking.carName}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}>{getStatusText(booking.status)}</span>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2"><FaClock className="text-blue-500" />{formatDate(booking.testDriveTime)}</div>
                    <div className="flex items-center gap-2"><FaMapMarkerAlt className="text-red-500" />{booking.location}</div>
                    {booking.depositAmount && (
                      <div className="flex items-center gap-2">
                        <FaCreditCard className="text-green-500" />
                        <span>Đặt cọc: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(booking.depositAmount)}</span>
                      </div>
                    )}
                    {booking.paymentStatus && (
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          booking.paymentStatus === 'SUCCESS' ? 'bg-green-100 text-green-800' :
                          booking.paymentStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {booking.paymentStatus === 'SUCCESS' ? 'Đã thanh toán' :
                           booking.paymentStatus === 'PENDING' ? 'Chờ thanh toán' :
                           'Thanh toán thất bại'}
                        </span>
                      </div>
                    )}
                  </div>
                  {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                    <button onClick={() => handleCancel(booking.id)} className="mt-4 w-full py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 flex items-center justify-center gap-2">
                      <FaTrash /> Hủy Lịch
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Registration Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full my-8 max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center flex-shrink-0">
              <h2 className="text-xl font-bold text-gray-800">Đăng Ký Lái Thử</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-600 hover:text-gray-800 text-2xl font-bold">×</button>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chọn Xe *</label>
                <select 
                  value={formData.carId} 
                  onChange={(e) => handleCarChange(e.target.value)} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                  required
                >
                  <option value="">-- Chọn xe muốn lái thử --</option>
                  {cars.map(car => (
                    <option key={car.id} value={car.id}>
                      {car.name} - {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(car.price)}
                    </option>
                  ))}
                </select>
                {carNameFromUrl && <p className="text-sm text-blue-600 mt-1">Đã chọn: {carNameFromUrl}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Thời Gian Lái Thử *</label>
                <input type="datetime-local" value={formData.testDriveTime} onChange={(e) => setFormData({ ...formData, testDriveTime: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required min={new Date().toISOString().slice(0, 16)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Địa Điểm *</label>
                <select value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required>
                  <option value="">-- Chọn địa điểm --</option>
                  <option value="Showroom Quận 1">Showroom Quận 1</option>
                  <option value="Showroom Quận 7">Showroom Quận 7</option>
                  <option value="Showroom Thủ Đức">Showroom Thủ Đức</option>
                  <option value="Showroom Bình Dương">Showroom Bình Dương</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ghi Chú</label>
                <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" rows="3" placeholder="Yêu cầu đặc biệt (nếu có)..."></textarea>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800"><strong>Thông tin của bạn:</strong></p>
                <p className="text-sm text-blue-700">Họ tên: {user?.fullName}</p>
                <p className="text-sm text-blue-700">Email: {user?.email}</p>
                <p className="text-sm text-blue-700">SĐT: {user?.phoneNumber || 'Chưa cập nhật'}</p>
              </div>
              
              {selectedCar && depositAmount > 0 && (
                <>
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                    <div className="flex items-start gap-2">
                      <FaCreditCard className="text-yellow-600 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-yellow-800 mb-2">
                          Yêu cầu đặt cọc trước
                        </p>
                        <p className="text-sm text-yellow-700 mb-2">
                          Để xác nhận lịch lái thử, bạn cần thanh toán trước <strong>1% giá trị xe</strong> (đặt cọc).
                          Số tiền này sẽ được hoàn lại sau khi hoàn thành lái thử.
                        </p>
                        <div className="flex justify-between items-center pt-2 border-t border-yellow-200">
                          <span className="text-sm font-medium text-yellow-800">Số tiền đặt cọc:</span>
                          <span className="text-lg font-bold text-yellow-900">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(depositAmount)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Phương thức thanh toán *</label>
                    <div className="space-y-3">
                      {/* VNPay */}
                      <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:border-blue-500 transition">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="VNPAY"
                          checked={paymentMethod === 'VNPAY'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="mt-1 mr-3"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-gray-800">Thanh toán online qua VNPay</span>
                            <img 
                              src="https://vnpay.vn/s1/statics.vnpay.vn/2023/9/06ncktiwd6dc1694418196384.png" 
                              alt="VNPay" 
                              className="h-6"
                            />
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            Thanh toán ngay qua ATM, Visa, MasterCard, QR Code
                          </p>
                        </div>
                      </label>

                      {/* Showroom */}
                      <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:border-blue-500 transition">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="SHOWROOM"
                          checked={paymentMethod === 'SHOWROOM'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="mt-1 mr-3"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-gray-800">Thanh toán tại showroom</span>
                            <span className="text-2xl">🏢</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            Thanh toán tiền mặt hoặc chuyển khoản khi đến showroom
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>
                </>
              )}
              </div>
              
              <div className="p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold bg-white">Hủy</button>
                  <button type="submit" disabled={submitting || !selectedCar} className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Đang xử lý...
                      </>
                    ) : paymentMethod === 'VNPAY' ? (
                      <>
                        <FaCreditCard />
                        Thanh toán VNPay
                      </>
                    ) : (
                      <>
                        <FaCalendarAlt />
                        Xác nhận đặt lịch
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestDrivePage;
