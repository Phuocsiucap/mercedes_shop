import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";

// Lazy load other pages
import { lazy, Suspense } from "react";

const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const CarsPage = lazy(() => import("./pages/CarsPage"));
const CarDetailPage = lazy(() => import("./pages/CarDetailPage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const FavoritesPage = lazy(() => import("./pages/FavoritesPage"));
const OrdersPage = lazy(() => import("./pages/OrdersPage"));
const OrderDetailPage = lazy(() => import("./pages/OrderDetailPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const DrivertestPage = lazy(() => import("./pages/DrivertestPage"));

// Loading component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center min-h-screen">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Admin Route Component
const AdminRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Layout Component
const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
};

// Footer Component
const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8 mt-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Mercedes Shop</h3>
            <p className="text-gray-400">
              Đại lý xe Mercedes-Benz chính hãng uy tín hàng đầu Việt Nam
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Liên hệ</h3>
            <ul className="space-y-2 text-gray-400">
              <li>📞 Hotline: 1900 xxxx</li>
              <li>📧 Email: contact@mercedes-shop.vn</li>
              <li>📍 Địa chỉ: TP. Hồ Chí Minh</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Thông tin</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="#" className="hover:text-white transition">
                  Về chúng tôi
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Chính sách bảo hành
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Điều khoản sử dụng
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 Mercedes Shop. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* Public Routes */}
            <Route
              path="/"
              element={
                <Layout>
                  <HomePage />
                </Layout>
              }
            />
            <Route
              path="/login"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <LoginPage />
                </Suspense>
              }
            />
            <Route
              path="/register"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <RegisterPage />
                </Suspense>
              }
            />
            <Route
              path="/cars"
              element={
                <Layout>
                  <Suspense fallback={<LoadingSpinner />}>
                    <CarsPage />
                  </Suspense>
                </Layout>
              }
            />
            <Route
              path="/cars/:id"
              element={
                <Layout>
                  <Suspense fallback={<LoadingSpinner />}>
                    <CarDetailPage />
                  </Suspense>
                </Layout>
              }
            />
            <Route
              path="/cart"
              element={
                <Layout>
                  <Suspense fallback={<LoadingSpinner />}>
                    <CartPage />
                  </Suspense>
                </Layout>
              }
            />

            {/* Protected Routes */}
            <Route
              path="/favorites"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Suspense fallback={<LoadingSpinner />}>
                      <FavoritesPage />
                    </Suspense>
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Suspense fallback={<LoadingSpinner />}>
                      <OrdersPage />
                    </Suspense>
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Suspense fallback={<LoadingSpinner />}>
                      <OrderDetailPage />
                    </Suspense>
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Suspense fallback={<LoadingSpinner />}>
                      <ProfilePage />
                    </Suspense>
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/drivertests"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Suspense fallback={<LoadingSpinner />}>  
                      <DrivertestPage />
                    </Suspense>
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin/*"
              element={
                <AdminRoute>
                  <Suspense fallback={<LoadingSpinner />}>
                    <AdminDashboard />
                  </Suspense>
                </AdminRoute>
              }
            />

            {/* 404 Not Found */}
            <Route
              path="*"
              element={
                <Layout>
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                      <h1 className="text-6xl font-bold text-gray-800 mb-4">
                        404
                      </h1>
                      <p className="text-xl text-gray-600 mb-8">
                        Trang không tồn tại
                      </p>
                      <a
                        href="/"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition"
                      >
                        Về trang chủ
                      </a>
                    </div>
                  </div>
                </Layout>
              }
            />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
