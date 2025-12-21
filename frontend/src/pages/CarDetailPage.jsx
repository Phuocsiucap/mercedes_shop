import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCarById } from '../api/carApi';
import axios from '../api/axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';



const CarDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const [mainImage, setMainImage] = useState('');
  const [car, setCar] = useState(null);
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
    const response = await getCarById(id);
    const data = response.data; // Lấy dữ liệu từ response
    
    setCar(data); // Lưu thông tin xe

    // CẬP NHẬT ẢNH CHÍNH
    if (data.images && data.images.length > 0) {
      setMainImage(data.images[0]);
    } else if (data.image) {
      setMainImage(data.image); // Fallback cho trường đơn lẻ
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
      const response = await axios.get(`/reviews/car/${id}`);
      setReviews(response.data.data || []);
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
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    // TODO: Implement favorite toggle
    setIsFavorited(!isFavorited);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      await axios.post('/reviews', {
        carId: id,
        content: reviewData.content,
        rating: reviewData.rating,
      });
      setReviewData({ content: '', rating: 5 });
      setShowReviewForm(false);
      fetchReviews();
      alert('Đánh giá thành công!');
    } catch (err) {
      alert('Có lỗi xảy ra khi đánh giá');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
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
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            {error || 'Không tìm thấy xe'}
          </h1>
          <button
            onClick={() => navigate('/cars')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg"
          >
            Quay lại danh sách xe
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-600">
          <a href="/" className="hover:text-blue-600">Trang chủ</a>
          <span className="mx-2">/</span>
          <a href="/cars" className="hover:text-blue-600">Danh sách xe</a>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{car.name}</span>
        </nav>

        {/* Car Detail */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
            {/* Image */}
            <div className="relative">
              <div className="flex flex-col md:flex-row gap-8"> {/* Container chia 2 cột chính */}

  {/* CỘT BÊN TRÁI: KHUNG CHỨA TẤT CẢ ẢNH */}
  <div className="w-full  flex flex-col gap-4">
    {car.images && car.images.length > 0 ? (
      <>
        {/* 1. Khung ảnh lớn - Luôn hiển thị giá trị của mainImage */}
        <div className="w-full aspect-video overflow-hidden rounded-xl bg-gray-100 border shadow-sm">
          <img 
            src={mainImage} 
            alt={car.name} 
            className="w-full h-full object-cover transition-all duration-500"
            onError={(e) => { e.target.src = 'https://via.placeholder.com/600x400?text=Error'; }}
          />
        </div>

        {/* 2. Hàng ảnh nhỏ bên dưới */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {car.images.map((imgUrl, index) => (
            <div 
              key={index} 
              // Khi click vào đây, setMainImage sẽ đổi ảnh lớn phía trên
              onClick={() => setMainImage(imgUrl)} 
              className={`min-w-[100px] h-20 rounded-md overflow-hidden border-2 cursor-pointer transition-all ${
                mainImage === imgUrl ? 'border-blue-600 scale-105' : 'border-gray-200'
              }`}
            >
              <img 
                src={imgUrl} 
                className="w-full h-full object-cover"
                alt="Thumbnail"
              />
            </div>
          ))}
        </div>
      </>
    ) : (
      // ... (Phần hiển thị khi không có ảnh giữ nguyên)
      <div className="h-64 bg-gray-100 flex items-center justify-center">Chưa có ảnh</div>
    )}
  </div>

  
</div>


              <button
                onClick={handleToggleFavorite}
                className={`absolute top-4 right-4 p-3 rounded-full ${
                  isFavorited ? 'bg-red-500 text-white' : 'bg-white text-gray-600'
                } shadow-lg hover:scale-110 transition`}
              >
                ❤️
              </button>
            </div>

            {/* Info */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{car.name}</h1>

              <div className="flex items-center mb-4">
                <div className="flex items-center text-yellow-500 px-3 py-1 rounded-full">
                  <span className="text-sm font-semibold">
                    {car.averageRating > 0 
                      ? `⭐ ${car.averageRating.toFixed(1)}` 
                      : '☆☆☆☆☆'}
                  </span>
                </div>
                <span className="ml-3 text-gray-600">({car.reviewCount || 0} đánh giá)</span>
              </div>

              <div className="mb-6">
                <span className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-semibold">
                  {car.category?.name || 'N/A'}
                </span>
              </div>

              <div className="text-4xl font-bold text-blue-600 mb-6">
                {formatPrice(car.price)}
              </div>

              {/* Specifications */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-start gap-2">
                    <span className="text-lg">📆</span>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Năm sản xuất</p>
                      <p className="font-semibold">{car.manufactureYear}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-start gap-2">
                    <span className="text-lg">🎨</span>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Màu sắc</p>
                      <p className="font-semibold">{car.color}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-start gap-2">
                    <span className="text-lg">🔧</span>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Động cơ</p>
                      <p className="font-semibold">{car.engine}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-start gap-2">
                    <span className="text-lg">⚡</span>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Hộp số</p>
                      <p className="font-semibold">{car.transmission}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg col-span-2">
                  <div className="flex items-start gap-2">
                    <span className="text-lg">👥</span>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Số chỗ ngồi</p>
                      <p className="font-semibold">{car.seats} chỗ</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quantity */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số lượng
                </label>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold w-10 h-10 rounded-lg"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 text-center border border-gray-300 rounded-lg py-2"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold w-10 h-10 rounded-lg"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={handleBuyNow}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
                >
                  Mua ngay
                </button>
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-lg transition"
                >
                  Thêm vào giỏ
                </button>
              </div>
            </div>
          </div>

          {/* Description */}
          {car.description && (
            <div className="border-t p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Mô tả</h2>
              <p className="text-gray-700 whitespace-pre-line">{car.description}</p>
            </div>
          )}
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Đánh giá ({reviews.length})
            </h2>
            {isAuthenticated && (
              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg"
              >
                Viết đánh giá
              </button>
            )}
          </div>

          {/* Review Form */}
          {showReviewForm && (
            <form onSubmit={handleSubmitReview} className="mb-8 p-4 bg-gray-50 rounded-lg">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Đánh giá của bạn (1-5 sao)
                </label>
                <select
                  value={reviewData.rating}
                  onChange={(e) => setReviewData({ ...reviewData, rating: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="5">⭐⭐⭐⭐⭐ (5 sao)</option>
                  <option value="4">⭐⭐⭐⭐ (4 sao)</option>
                  <option value="3">⭐⭐⭐ (3 sao)</option>
                  <option value="2">⭐⭐ (2 sao)</option>
                  <option value="1">⭐ (1 sao)</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nội dung đánh giá
                </label>
                <textarea
                  value={reviewData.content}
                  onChange={(e) => setReviewData({ ...reviewData, content: e.target.value })}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Chia sẻ trải nghiệm của bạn..."
                  required
                ></textarea>
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg"
                >
                  Gửi đánh giá
                </button>
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-6 py-2 rounded-lg"
                >
                  Hủy
                </button>
              </div>
            </form>
          )}

          {/* Reviews List */}
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <p className="text-center text-gray-600 py-8">Chưa có đánh giá nào</p>
            ) : (
              <>
                {reviews.slice(0, displayedReviews).map((review) => (
                  <div key={review.id} className="border-b pb-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">{review.userName}</p>
                        <div className="flex items-center mt-1">
                          <span className="text-yellow-500">
                            {'⭐'.repeat(review.rating)}
                          </span>
                          <span className="text-gray-500 text-sm ml-2">
                            {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700">{review.content}</p>
                  </div>
                ))}
                {displayedReviews < reviews.length && (
                  <div className="text-center mt-6">
                    <button
                      onClick={() => setDisplayedReviews(displayedReviews + 5)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg"
                    >
                      Xem thêm đánh giá
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarDetailPage;
