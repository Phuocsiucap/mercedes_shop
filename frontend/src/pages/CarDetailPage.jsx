import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCarById } from '../api/carApi';
import * as drivertestApi from '../api/drivertestApi';
import { createVNPayPayment } from '../api/paymentApi';
import axiosInstance from '../api/axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { FaStar, FaRegStar, FaHeart, FaRegHeart, FaCar, FaCalendarAlt, FaMapMarkerAlt, FaMoneyBillWave, FaCheck } from 'react-icons/fa';

const CarDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();

  // Data State
  const [car, setCar] = useState(null);
  const [reviews, setReviews] = useState([]);
  
  // UI State
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isFavorited, setIsFavorited] = useState(false);
  const [displayedReviews, setDisplayedReviews] = useState(5);

  // Modal State
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showTestDriveForm, setShowTestDriveForm] = useState(false);
  const [showDepositForm, setShowDepositForm] = useState(false);
  const [testDrivePaymentMethod, setTestDrivePaymentMethod] = useState('direct'); // 'direct' or 'vnpay'
  const [depositPaymentMethod, setDepositPaymentMethod] = useState('direct'); // 'direct' or 'vnpay'

  // Form Data State
  const [reviewData, setReviewData] = useState({ content: '', rating: 5 });
  const [testDriveData, setTestDriveData] = useState({
    testDate: '',
    testLocation: '',
  });
  
  // State cho phần đặt cọc
  const [depositData, setDepositData] = useState({
    depositAmount: 0,
    selectedPercent: null // Lưu lại % đang chọn để highlight nút
  });

  const DEPOSIT_OPTIONS = [20, 30, 40, 50]; // Các mức phần trăm cọc

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchCarDetail(), fetchReviews()]);
      setLoading(false);
    };
    loadData();
    window.scrollTo(0, 0);
  }, [id]);

  // --- API CALLS ---
  const fetchCarDetail = async () => {
    try {
      const response = await getCarById(id);
      if (response && response.data) {
        setCar(response.data);
      } else {
        setCar(response);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching car:', err);
      setError('Không thể tải thông tin xe. Vui lòng thử lại sau.');
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await axiosInstance.get(`/reviews/car/${id}`);
      const data = response.data?.data || response.data || [];
      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  };

  // --- HANDLERS ---
  const handleAddToCart = () => {
    if (!car) return;
    addItem({
      id: car.id,
      name: car.name,
      price: car.price,
      image: car.image,
      color: car.color,
      quantity: quantity,
    });
    alert('Đã thêm xe vào giỏ hàng!');
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) return navigate('/login');
    setIsFavorited(!isFavorited);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return navigate('/login');

    try {
      setSubmitting(true);
      await axiosInstance.post('/reviews', {
        carId: id,
        content: reviewData.content,
        rating: reviewData.rating,
      });
      setReviewData({ content: '', rating: 5 });
      setShowReviewForm(false);
      await fetchReviews();
      alert('Cảm ơn bạn đã đánh giá!');
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi đánh giá');
    } finally {
      setSubmitting(false);
    }
  };

  const handleScheduleTestDrive = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return navigate('/login');

    if (!testDriveData.testDate || !testDriveData.testLocation) {
        return alert('Vui lòng điền đầy đủ thông tin');
    }

    try {
      setSubmitting(true);
      const testDriveFee = Math.floor(car.price * 0.03); // 3% of car price
      const response = await drivertestApi.createDrivertest({
        carId: id,
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
            orderInfo: `Thanh toan phi lai thu xe ${car.name}`,
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

      alert('Đặt lịch lái thử thành công! Chúng tôi sẽ liên hệ sớm.');
      setShowTestDriveForm(false);
      setTestDriveData({ testDate: '', testLocation: '' });
    } catch (err) {
        console.error(err);
        alert(err.message || 'Lỗi khi đặt lịch lái thử');
    } finally {
      setSubmitting(false);
    }
  };

  // Xử lý khi chọn phần trăm cọc
  const handleSelectDepositPercent = (percent) => {
      if (!car) return;
      const amount = (car.price * percent) / 100;
      setDepositData({
          selectedPercent: percent,
          depositAmount: amount
      });
  };

  const handleMakeDeposit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return navigate('/login');

    if (!depositData.depositAmount || depositData.depositAmount <= 0) {
      return alert('Vui lòng chọn mức đặt cọc');
    }

    try {
      setSubmitting(true);
      
      // If VNPay payment selected, redirect to payment
      if (depositPaymentMethod === 'vnpay') {
        try {
          const paymentResponse = await createVNPayPayment({
            orderId: `DEPOSIT_${id}`,
            amount: depositData.depositAmount,
            orderInfo: `Thanh toan dat coc xe ${car.name} (${depositData.selectedPercent}%)`,
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

      // Direct payment
      alert(`Đã gửi yêu cầu cọc ${formatPrice(depositData.depositAmount)} (${depositData.selectedPercent}%) thành công!`);
      setShowDepositForm(false);
      setDepositData({ depositAmount: 0, selectedPercent: null });
    } catch (err) {
      alert('Lỗi khi xử lý đặt cọc');
    } finally {
      setSubmitting(false);
    }
  };

  // --- HELPERS ---
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  // --- RENDER ---
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">{error || 'Không tìm thấy thông tin xe'}</h1>
        <button onClick={() => navigate('/cars')} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
          Quay lại danh sách
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-500">
          <span className="cursor-pointer hover:text-blue-600" onClick={() => navigate('/')}>Trang chủ</span>
          <span className="mx-2">/</span>
          <span className="cursor-pointer hover:text-blue-600" onClick={() => navigate('/cars')}>Sản phẩm</span>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">{car.name}</span>
        </nav>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-8">
            {/* Left: Image */}
            <div className="p-6 relative bg-gray-100 flex items-center justify-center">
              {car.image ? (
                <img 
                  src={car.image} 
                  alt={car.name} 
                  className="w-full h-auto max-h-[500px] object-contain mix-blend-multiply hover:scale-105 transition duration-500" 
                />
              ) : (
                <FaCar className="text-9xl text-gray-300" />
              )}
              <button
                onClick={handleToggleFavorite}
                className="absolute top-6 right-6 p-3 bg-white rounded-full shadow hover:bg-gray-50 transition z-10"
              >
                {isFavorited ? <FaHeart className="text-red-500 text-xl" /> : <FaRegHeart className="text-gray-400 text-xl" />}
              </button>
            </div>

            {/* Right: Info */}
            <div className="p-8">
              <div className="mb-4">
                <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                  {car.category?.name || 'Sedan'}
                </span>
              </div>
              
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">{car.name}</h1>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center text-yellow-400">
                   <span className="font-bold text-gray-900 mr-1">{car.averageRating?.toFixed(1) || 0}</span>
                   <FaStar />
                </div>
                <span className="text-gray-400">|</span>
                <span className="text-gray-600">{car.reviewCount || reviews.length} đánh giá</span>
                <span className="text-gray-400">|</span>
                <span className={car.status === 'AVAILABLE' ? 'text-green-600' : 'text-red-600'}>
                    {car.status === 'AVAILABLE' ? 'Còn hàng' : 'Hết hàng'}
                </span>
              </div>

              <div className="text-4xl font-bold text-blue-600 mb-8">
                {formatPrice(car.price)}
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <SpecItem label="Năm SX" value={car.manufactureYear} icon="📅" />
                <SpecItem label="Màu sắc" value={car.color} icon="🎨" />
                <SpecItem label="Động cơ" value={car.engine} icon="🔧" />
                <SpecItem label="Hộp số" value={car.transmission} icon="⚡" />
                <SpecItem label="Số chỗ" value={`${car.seats} chỗ`} icon="💺" />
                <SpecItem label="Nhiên liệu" value={car.fuelType || 'Xăng'} icon="⛽" />
              </div>

              {/* Actions */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <span className="text-gray-700 font-medium">Số lượng:</span>
                    <div className="flex items-center border border-gray-300 rounded-lg">
                        <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-1 hover:bg-gray-100 text-gray-600 font-bold">-</button>
                        <input 
                            type="number" 
                            className="w-12 text-center border-x border-gray-300 py-1 focus:outline-none" 
                            value={quantity} 
                            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        />
                        <button onClick={() => setQuantity(quantity + 1)} className="px-3 py-1 hover:bg-gray-100 text-gray-600 font-bold">+</button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button onClick={handleBuyNow} className="bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-bold shadow-sm transition">
                        MUA NGAY
                    </button>
                    <button onClick={handleAddToCart} className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold shadow-sm transition">
                        THÊM VÀO GIỎ
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button onClick={() => setShowTestDriveForm(true)} className="border border-green-600 text-green-600 hover:bg-green-50 py-3 rounded-lg font-semibold transition flex justify-center items-center gap-2">
                        <FaCalendarAlt /> ĐẶT LỊCH LÁI THỬ
                    </button>
                    <button onClick={() => setShowDepositForm(true)} className="border border-orange-500 text-orange-500 hover:bg-orange-50 py-3 rounded-lg font-semibold transition flex justify-center items-center gap-2">
                        <FaMoneyBillWave /> ĐẶT CỌC GIỮ XE
                    </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Description */}
          {car.description && (
            <div className="border-t border-gray-200 p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Mô tả chi tiết</h3>
                <div className="prose max-w-none text-gray-700 whitespace-pre-line leading-relaxed">
                    {car.description}
                </div>
            </div>
          )}
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Đánh giá từ khách hàng</h2>
                <button 
                    onClick={() => {
                        if(!isAuthenticated) return navigate('/login');
                        setShowReviewForm(true);
                    }} 
                    className="text-blue-600 font-semibold hover:underline"
                >
                    Viết đánh giá của bạn
                </button>
            </div>

            <div className="space-y-6">
                {reviews.length > 0 ? (
                    reviews.slice(0, displayedReviews).map((review) => (
                        <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-600">
                                        {review.userName ? review.userName.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">{review.userName || 'Người dùng ẩn danh'}</h4>
                                        <div className="flex text-yellow-400 text-sm">
                                            {[...Array(5)].map((_, i) => (
                                                <span key={i}>{i < review.rating ? <FaStar /> : <FaRegStar />}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <span className="text-sm text-gray-500">
                                    {review.createdAt ? new Date(review.createdAt).toLocaleDateString('vi-VN') : ''}
                                </span>
                            </div>
                            <p className="text-gray-700 mt-2 pl-13">{review.content}</p>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                        Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá chiếc xe này!
                    </div>
                )}
                
                {reviews.length > displayedReviews && (
                    <div className="text-center pt-4">
                        <button onClick={() => setDisplayedReviews(prev => prev + 5)} className="text-gray-600 hover:text-blue-600 font-medium">
                            Xem thêm đánh giá
                        </button>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* --- MODALS --- */}
      
      {/* Review Modal */}
      {showReviewForm && (
        <Modal onClose={() => setShowReviewForm(false)} title="Viết đánh giá">
            <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mức độ hài lòng</label>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                type="button"
                                key={star}
                                onClick={() => setReviewData({ ...reviewData, rating: star })}
                                className={`text-2xl focus:outline-none transition ${reviewData.rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                            >
                                <FaStar />
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nội dung đánh giá</label>
                    <textarea
                        value={reviewData.content}
                        onChange={(e) => setReviewData({ ...reviewData, content: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none h-32"
                        placeholder="Chia sẻ trải nghiệm của bạn về chiếc xe này..."
                        required
                    />
                </div>
                <div className="flex gap-3 justify-end pt-2">
                    <button type="button" onClick={() => setShowReviewForm(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Hủy</button>
                    <button 
                        type="submit" 
                        disabled={submitting}
                        className={`px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                    </button>
                </div>
            </form>
        </Modal>
      )}

      {/* Test Drive Modal */}
      {showTestDriveForm && (
        <Modal onClose={() => setShowTestDriveForm(false)} title="Đăng ký lái thử">
            <form onSubmit={handleScheduleTestDrive} className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                        <img src={car.image} alt="" className="w-16 h-12 object-cover rounded" />
                        <div>
                            <p className="font-bold text-gray-800">{car.name}</p>
                            <p className="text-sm text-gray-600">Giá: <span className="text-blue-600 font-semibold">{formatPrice(car.price)}</span></p>
                        </div>
                    </div>
                    <div className="border-t border-blue-100 pt-3">
                        <p className="text-xs text-gray-600 mb-1">Phí lái thử (3% giá xe):</p>
                        <p className="text-lg font-bold text-blue-600">{formatPrice(Math.floor(car.price * 0.03))}</p>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian dự kiến <span className="text-red-500">*</span></label>
                    <input
                        type="datetime-local"
                        value={testDriveData.testDate}
                        min={getMinDateTime()}
                        onChange={(e) => setTestDriveData({ ...testDriveData, testDate: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Địa điểm <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        value={testDriveData.testLocation}
                        onChange={(e) => setTestDriveData({ ...testDriveData, testLocation: e.target.value })}
                        placeholder="Nhập địa chỉ hoặc Showroom mong muốn"
                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
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
                <div className="flex gap-3 justify-end pt-4">
                    <button type="button" onClick={() => setShowTestDriveForm(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Hủy</button>
                    <button type="submit" disabled={submitting} className={`px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 ${submitting ? 'opacity-50' : ''}`}>
                        {submitting ? 'Đang xử lý...' : 'Xác nhận đặt lịch'}
                    </button>
                </div>
            </form>
        </Modal>
      )}

      {/* Deposit Modal (Đã chỉnh sửa theo yêu cầu) */}
      {showDepositForm && (
        <Modal onClose={() => setShowDepositForm(false)} title="Đặt cọc giữ xe">
            <form onSubmit={handleMakeDeposit} className="space-y-5">
                {/* Info Giá xe */}
                <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="text-sm text-gray-500 uppercase tracking-wide">Giá trị xe niêm yết</p>
                    <p className="text-2xl font-bold text-blue-700 mt-1">{formatPrice(car.price)}</p>
                </div>

                {/* Chọn mức % cọc */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Chọn mức đặt cọc <span className="text-red-500">*</span></label>
                    <div className="grid grid-cols-4 gap-3">
                        {DEPOSIT_OPTIONS.map((percent) => (
                            <button
                                key={percent}
                                type="button"
                                onClick={() => handleSelectDepositPercent(percent)}
                                className={`py-3 rounded-lg border font-semibold transition-all duration-200 flex flex-col items-center justify-center
                                    ${depositData.selectedPercent === percent 
                                        ? 'bg-orange-500 text-white border-orange-500 shadow-md transform scale-105' 
                                        : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                                    }`}
                            >
                                <span className="text-lg">{percent}%</span>
                                {depositData.selectedPercent === percent && <FaCheck className="text-xs mt-1" />}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Hiển thị số tiền tính toán */}
                <div className="bg-orange-50 border border-orange-100 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-orange-800 mb-1">Số tiền cần thanh toán:</label>
                    {depositData.depositAmount > 0 ? (
                        <p className="text-2xl font-bold text-orange-600 animate-fade-in">
                            {formatPrice(depositData.depositAmount)}
                        </p>
                    ) : (
                        <p className="text-gray-400 italic text-sm">Vui lòng chọn mức đặt cọc ở trên</p>
                    )}
                </div>

                <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
                    * Số tiền cọc này sẽ được khấu trừ trực tiếp vào tổng giá trị xe khi ký hợp đồng mua bán chính thức.
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phương thức thanh toán
                    </label>
                    <div className="space-y-2">
                        <label className="flex items-center p-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                            <input
                                type="radio"
                                name="depositPayment"
                                value="direct"
                                checked={depositPaymentMethod === 'direct'}
                                onChange={(e) => setDepositPaymentMethod(e.target.value)}
                                className="w-4 h-4 text-blue-600"
                            />
                            <span className="ml-2 text-sm text-gray-700">Thanh toán trực tiếp</span>
                        </label>
                        <label className="flex items-center p-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                            <input
                                type="radio"
                                name="depositPayment"
                                value="vnpay"
                                checked={depositPaymentMethod === 'vnpay'}
                                onChange={(e) => setDepositPaymentMethod(e.target.value)}
                                className="w-4 h-4 text-blue-600"
                            />
                            <span className="ml-2 text-sm text-gray-700">VNPay</span>
                        </label>
                    </div>
                </div>

                <div className="flex gap-3 justify-end pt-2">
                    <button type="button" onClick={() => setShowDepositForm(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Hủy</button>
                    <button 
                        type="submit" 
                        disabled={submitting || depositData.depositAmount <= 0} 
                        className={`px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium shadow-sm transition
                            ${(submitting || depositData.depositAmount <= 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {submitting ? 'Đang xử lý...' : 'Xác nhận cọc'}
                    </button>
                </div>
            </form>
        </Modal>
      )}

    </div>
  );
};

// Sub-components
const SpecItem = ({ label, value, icon }) => (
    <div className="bg-gray-50 p-3 rounded-lg flex items-center gap-3">
        <span className="text-xl">{icon}</span>
        <div>
            <p className="text-xs text-gray-500">{label}</p>
            <p className="font-semibold text-gray-900 text-sm truncate">{value || 'N/A'}</p>
        </div>
    </div>
);

const Modal = ({ onClose, title, children }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                <h3 className="text-lg font-bold text-gray-800">{title}</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            <div className="p-5">
                {children}
            </div>
        </div>
    </div>
);

export default CarDetailPage;