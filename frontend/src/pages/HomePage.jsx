import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getFeaturedCars } from '../api/carApi';
import axios from '../api/axios';

const HomePage = () => {
  const [featuredCars, setFeaturedCars] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [carsResponse, categoriesResponse] = await Promise.all([
        getFeaturedCars(),
        axios.get('/categories')
      ]);

      setFeaturedCars(carsResponse.data || []);
      setCategories(categoriesResponse.data.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-gray-900 to-gray-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Mercedes-Benz
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-300">
              The Best or Nothing
            </p>
            <p className="text-lg mb-8 text-gray-400">
              Khám phá bộ sưu tập xe Mercedes-Benz cao cấp với công nghệ hiện đại và thiết kế sang trọng
            </p>
            <Link
              to="/cars"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition duration-300"
            >
              Xem tất cả xe
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      {categories.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Danh Mục Xe</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/cars?category=${category.id}`}
                  className="bg-gray-100 hover:bg-gray-200 rounded-lg p-6 text-center transition duration-300 transform hover:scale-105"
                >
                  <div className="text-4xl mb-4">🚗</div>
                  <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
                  {category.description && (
                    <p className="text-gray-600 text-sm">{category.description}</p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Cars Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Xe Nổi Bật</h2>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}
          {featuredCars.length === 0 && !error ? (
            <p className="text-center text-gray-600">Không có xe nổi bật</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredCars.map((car) => (
                <Link
                  key={car.id}
                  to={`/cars/${car.id}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition duration-300 transform hover:-translate-y-1"
                >
                  <div className="relative h-64 bg-gray-200">
                    {/* Kiểm tra mảng images mới thay vì car.image cũ */}
                    {car.images && car.images.length > 0 ? (
                      <img 
                        src={car.images[0]} 
                        alt={car.name} 
                        className="w-full h-full object-cover"
                        // Thêm xử lý lỗi nếu link ảnh từ Cloudinary bị hỏng
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/400x300?text=No+Image'; }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400 bg-gray-100">
                        <div className="text-center">
                          <span className="text-6xl block">🚗</span>
                          <span className="text-xs mt-2 block font-medium">Chưa có hình ảnh</span>
                        </div>
                      </div>
                    )}
                    {car.averageRating > 0 && (
                      <div className="absolute top-4 right-4 bg-yellow-400 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        ⭐ {car.averageRating.toFixed(1)}
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2 text-gray-800">
                      {car.name}
                    </h3>
                    <div className="mb-4">
                      <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
                        {car.category?.name || 'Chưa phân loại'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-gray-600 text-sm">Năm: {car.manufactureYear}</span>
                      <span className="text-gray-600 text-sm">{car.seats} chỗ</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-blue-600">
                        {formatPrice(car.price)}
                      </span>
                      <span className="text-blue-600 font-semibold">
                        Chi tiết →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          {featuredCars.length > 0 && (
            <div className="text-center mt-12">
              <Link
                to="/cars"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition duration-300"
              >
                Xem tất cả xe
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Tại Sao Chọn Chúng Tôi</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl mb-4">✓</div>
              <h3 className="text-xl font-semibold mb-3">Xe Chính Hãng</h3>
              <p className="text-gray-600">
                100% xe Mercedes-Benz chính hãng với đầy đủ giấy tờ và bảo hành
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">💎</div>
              <h3 className="text-xl font-semibold mb-3">Chất Lượng Cao</h3>
              <p className="text-gray-600">
                Xe được kiểm tra kỹ lưỡng và đảm bảo chất lượng tốt nhất
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">🛡️</div>
              <h3 className="text-xl font-semibold mb-3">Hỗ Trợ Tận Tâm</h3>
              <p className="text-gray-600">
                Đội ngũ tư vấn chuyên nghiệp, hỗ trợ 24/7
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
