import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import carService from '../services/carService'; // Sử dụng service của bạn
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

const CarDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const { formatCurrency } = useApp();

  // States
  const [car, setCar] = useState(null);
  const [mainImage, setMainImage] = useState(''); // State cho ảnh lớn
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState({ content: '', rating: 5 });
  const [displayedReviews, setDisplayedReviews] = useState(5);

  useEffect(() => {
    fetchCarDetail();
    fetchReviews();
  }, [id]);

  const fetchCarDetail = async () => {
    try {
      setLoading(true);
      const response = await carService.getCarById(id);
      const data = response.data;
      setCar(data);

      // Thiết lập ảnh chính ban đầu
      if (data.images && data.images.length > 0) {
        setMainImage(data.images[0]);
      } else {
        setMainImage('/placeholder-car.jpg');
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching car:', err);
      setError('Không thể tải thông tin xe. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await carService.getCarReviews(id);
      setReviews(response.data || []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  };

  const handleAddToCart = () => {
    if (!car) return;
    addItem({
      id: car.id,
      name: car.name,
      price: car.price,
      image: mainImage, // Sử dụng ảnh đang hiển thị
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
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setIsFavorited(!isFavorited);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      const response = await carService.addReview(id, {
        rating: reviewData.rating,
        comment: reviewData.content,
      });
      
      if (response.success) {
        setReviewData({ content: '', rating: 5 });
setShowReviewForm(false);
        fetchReviews();
        alert('Đánh giá thành công!');
      }
    } catch (err) {
      alert('Có lỗi xảy ra khi đánh giá');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">{error || 'Không tìm thấy xe'}</h1>
        <button onClick={() => navigate('/cars')} className="bg-blue-600 text-white px-6 py-2 rounded-lg">
          Quay lại danh sách
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-600">
          <span className="cursor-pointer hover:text-blue-600" onClick={() => navigate('/')}>Trang chủ</span>
          <span className="mx-2">/</span>
          <span className="cursor-pointer hover:text-blue-600" onClick={() => navigate('/cars')}>Danh sách xe</span>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">{car.name}</span>
        </nav>

        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
            
            {/* Cột Trái: Ảnh */}
            <div className="flex flex-col gap-4">
              <div className="relative aspect-video overflow-hidden rounded-xl bg-gray-100 border shadow-sm">
                <img 
                  src={mainImage} 
                  alt={car.name} 
                  className="w-full h-full object-cover transition-all duration-500"
                  onError={(e) => { e.target.src = '/placeholder-car.jpg'; }}
                />
                <button
                  onClick={handleToggleFavorite}
                  className={`absolute top-4 right-4 p-3 rounded-full shadow-lg hover:scale-110 transition ${
                    isFavorited ? 'bg-red-500 text-white' : 'bg-white text-gray-600'
                  }`}
                >
                  ❤️
                </button>
              </div>

              {/* Thumbnails */}
              {car.images && car.images.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                  {car.images.map((imgUrl, index) => (
                    <div 
                      key={index} 
                      onClick={() => setMainImage(imgUrl)}
                      className={`min-w-[100px] h-20 rounded-md overflow-hidden border-2 cursor-pointer transition-all ${
mainImage === imgUrl ? 'border-blue-600 scale-105' : 'border-gray-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={imgUrl} className="w-full h-full object-cover" alt={`Thumbnail ${index}`} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cột Phải: Thông tin */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{car.name}</h1>
              
              <div className="flex items-center mb-4">
                <span className="text-yellow-500 font-bold">
                  {car.averageRating > 0 ? `⭐ ${car.averageRating.toFixed(1)}` : '☆☆☆☆☆'}
                </span>
                <span className="ml-3 text-gray-500 text-sm">({reviews.length} đánh giá)</span>
              </div>

              <div className="mb-4">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {car.category?.name || 'Ô tô'}
                </span>
              </div>

              <div className="text-4xl font-bold text-blue-600 mb-6">
                {formatCurrency(car.price)}
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  { label: 'Năm sản xuất', value: car.manufactureYear, icon: '📆' },
                  { label: 'Màu sắc', value: car.color, icon: '🎨' },
                  { label: 'Động cơ', value: car.engine, icon: '🔧' },
                  { label: 'Hộp số', value: car.transmission, icon: '⚡' },
                  { label: 'Số chỗ ngồi', value: `${car.seats} chỗ`, icon: '👥', span: true },
                ].map((spec, i) => (
                  <div key={i} className={`bg-gray-50 p-3 rounded-lg flex items-center gap-3 ${spec.span ? 'col-span-2' : ''}`}>
                    <span className="text-xl">{spec.icon}</span>
                    <div>
                      <p className="text-xs text-gray-500">{spec.label}</p>
                      <p className="font-semibold text-sm">{spec.value || 'Đang cập nhật'}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quantity & Actions */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">Số lượng:</span>
                  <div className="flex items-center border rounded-lg">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-1 hover:bg-gray-100">-</button>
                    <input 
                      type="number" 
                      value={quantity} 
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
className="w-12 text-center border-x py-1 focus:outline-none"
                    />
                    <button onClick={() => setQuantity(quantity + 1)} className="px-3 py-1 hover:bg-gray-100">+</button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={handleBuyNow} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition">
                    MUA NGAY
                  </button>
                  <button onClick={handleAddToCart} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 rounded-lg transition">
                    THÊM GIỎ HÀNG
                  </button>
                </div>

                <button
                  onClick={() => navigate(`/test-drive?carId=${car.id}&carName=${encodeURIComponent(car.name)}`)}
                  className="w-full border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
                >
                  🚗 ĐĂNG KÝ LÁI THỬ
                </button>
              </div>
            </div>
          </div>

          {/* Description */}
          {car.description && (
            <div className="border-t p-6">
              <h2 className="text-xl font-bold mb-3">Mô tả sản phẩm</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{car.description}</p>
            </div>
          )}
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Đánh giá từ khách hàng</h2>
            {isAuthenticated && !showReviewForm && (
              <button onClick={() => setShowReviewForm(true)} className="text-blue-600 hover:underline font-medium">
                Viết đánh giá của bạn
              </button>
            )}
          </div>

          {showReviewForm && (
            <form onSubmit={handleSubmitReview} className="mb-8 p-4 bg-gray-50 rounded-xl border">
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Số sao:</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewData({ ...reviewData, rating: star })}
                      className={`text-2xl ${reviewData.rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                value={reviewData.content}
onChange={(e) => setReviewData({ ...reviewData, content: e.target.value })}
                className="w-full p-3 border rounded-lg mb-3"
                placeholder="Cảm nhận của bạn về chiếc xe này..."
                rows="3"
                required
              />
              <div className="flex gap-2">
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold">Gửi đánh giá</button>
                <button type="button" onClick={() => setShowReviewForm(false)} className="bg-gray-300 px-4 py-2 rounded-lg text-sm">Hủy</button>
              </div>
            </form>
          )}

          <div className="space-y-6">
            {reviews.length === 0 ? (
              <p className="text-gray-500 italic">Chưa có đánh giá nào cho xe này.</p>
            ) : (
              reviews.slice(0, displayedReviews).map((review) => (
                <div key={review.id} className="border-b pb-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-bold text-gray-800">{review.userName || 'Người dùng'}</p>
                      <div className="text-yellow-500 text-xs">
                        {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                      </div>
                    </div>
                    <span className="text-gray-400 text-xs">
                      {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm">{review.comment || review.content}</p>
                </div>
              ))
            )}
            {displayedReviews < reviews.length && (
              <button 
                onClick={() => setDisplayedReviews(prev => prev + 5)}
                className="w-full py-2 text-blue-600 hover:bg-blue-50 rounded-lg text-sm transition"
              >
                Xem thêm đánh giá
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarDetailPage;