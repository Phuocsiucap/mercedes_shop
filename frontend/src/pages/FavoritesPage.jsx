import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUserFavorites, removeFavorite } from '../api/favoriteApi';

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const response = await getUserFavorites();
      setFavorites(response.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching favorites:', err);
      setError('Không thể tải danh sách yêu thích');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (favoriteId) => {
    if (window.confirm('Bạn có chắc muốn xóa xe này khỏi danh sách yêu thích?')) {
      try {
        await removeFavorite(favoriteId);
        setFavorites(favorites.filter((fav) => fav.id !== favoriteId));
      } catch (err) {
        alert('Có lỗi xảy ra khi xóa');
      }
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Danh Sách Yêu Thích</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {favorites.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-6">❤️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Chưa có xe yêu thích
            </h2>
            <p className="text-gray-600 mb-8">
              Hãy thêm những chiếc xe bạn yêu thích vào danh sách này
            </p>
            <Link
              to="/cars"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition"
            >
              Khám phá xe
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((favorite) => (
              <div
                key={favorite.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition"
              >
                <Link to={`/cars/${favorite.carId}`} className="block">
                  <div className="relative h-48 bg-gray-200">
                    {favorite.carImage ? (
                      <img
                        src={favorite.carImage}
                        alt={favorite.carName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <span className="text-6xl">🚗</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {favorite.carName}
                    </h3>
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                      <span>Màu: {favorite.carColor}</span>
                      <span>{favorite.carSeats} chỗ</span>
                    </div>
                    <p className="text-xl font-bold text-blue-600 mb-2">
                      {formatPrice(favorite.carPrice)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Đã thêm: {new Date(favorite.addedAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </Link>
                <div className="p-4 border-t">
                  <button
                    onClick={() => handleRemove(favorite.id)}
                    className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-lg transition"
                  >
                    Xóa khỏi yêu thích
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
