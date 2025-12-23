import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { AppProvider } from "./context/AppContext";
import ReduxProvider from "./redux/Provider";
import { useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ErrorBoundary from "./components/ui/ErrorBoundary";
import AdminLayout from "./components/layouts/AdminLayout";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";

// Lazy load other pages
import { lazy, Suspense } from "react";

const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const CarsPage = lazy(() => import("./pages/CarsPage"));
const CarDetailPage = lazy(() => import("./pages/CarDetailPage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const FavoritesPage = lazy(() => import("./pages/FavoritesPage"));
const OrdersPage = lazy(() => import("./pages/OrdersPage"));
const OrderDetailPage = lazy(() => import("./pages/OrderDetailPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminCars = lazy(() => import("./pages/admin/AdminCars"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminPayments = lazy(() => import("./pages/admin/AdminPayments"));
const AdminCategories = lazy(() => import("./pages/admin/AdminCategories"));
const AdminReports = lazy(() => import("./pages/admin/AdminReports"));
const AdminTestDrive = lazy(() => import("./pages/admin/AdminTestDrive"));
const TestDrivePage = lazy(() => import("./pages/TestDrivePage"));
const GitHubCallbackPage = lazy(() => import("./pages/GitHubCallbackPage"));
const VNPayReturnPage = lazy(() => import("./pages/VNPayReturnPage"));
const TestDrivePaymentReturnPage = lazy(() => import("./pages/TestDrivePaymentReturnPage"));


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

  // Check for admin role - handle both "ADMIN" and "ROLE_ADMIN" formats
  const isAdmin = user?.role === "ADMIN" || user?.role === "ROLE_ADMIN";
  if (!isAdmin) {
    // Show alert for non-admin users
    alert('Bạn không có quyền truy cập trang quản trị. Chỉ tài khoản Admin mới có thể truy cập.');
    return <Navigate to="/" replace />;
  }

  return children;
};

// Admin Page Wrapper Component
const AdminPageWrapper = ({ children, activeTab }) => {
  const navigate = useNavigate();

  const handleTabChange = (tab) => {
    const pathMap = {
      'home': '/admin',
      'cars': '/admin/cars',
      'users': '/admin/users',
      'orders': '/admin/orders',
      'payments': '/admin/payments',
      'categories': '/admin/categories',
      'reports': '/admin/reports',
      'test-drives': '/admin/test-drives'
    };
    navigate(pathMap[tab] || '/admin');
  };

  return (
    <AdminLayout activeTab={activeTab} onTabChange={handleTabChange}>
      {children}
    </AdminLayout>
  );
};

// Layout Component with Error Boundary
const Layout = ({ children }) => {
  return (
    <ErrorBoundary
      title="Lỗi trang"
      message="Có lỗi xảy ra khi tải trang. Vui lòng thử lại."
      onGoHome={() => window.location.href = '/'}
    >
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main>{children}</main>
        <Footer />
      </div>
    </ErrorBoundary>
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
    <ReduxProvider>
      <Router>
        <AppProvider>
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
            {/* OAuth Callback Routes */}
            <Route
              path="/auth/github/callback"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <GitHubCallbackPage />
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
            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Suspense fallback={<LoadingSpinner />}>
                      <CheckoutPage />
                    </Suspense>
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/vnpay-return"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Suspense fallback={<LoadingSpinner />}>
                      <VNPayReturnPage />
                    </Suspense>
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/test-drive-payment-return"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Suspense fallback={<LoadingSpinner />}>
                      <TestDrivePaymentReturnPage />
                    </Suspense>
                  </Layout>
                </ProtectedRoute>
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
              path="/test-drive"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Suspense fallback={<LoadingSpinner />}>
                      <TestDrivePage />
                    </Suspense>
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <Suspense fallback={<LoadingSpinner />}>
                    <AdminPageWrapper activeTab="home">
                      <AdminDashboard />
                    </AdminPageWrapper>
                  </Suspense>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/cars"
              element={
                <AdminRoute>
                  <Suspense fallback={<LoadingSpinner />}>
                    <AdminPageWrapper activeTab="cars">
                      <AdminCars />
                    </AdminPageWrapper>
                  </Suspense>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <AdminRoute>
                  <Suspense fallback={<LoadingSpinner />}>
                    <AdminPageWrapper activeTab="users">
                      <AdminUsers />
                    </AdminPageWrapper>
                  </Suspense>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <AdminRoute>
                  <Suspense fallback={<LoadingSpinner />}>
                    <AdminPageWrapper activeTab="orders">
                      <AdminOrders />
                    </AdminPageWrapper>
                  </Suspense>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/payments"
              element={
                <AdminRoute>
                  <Suspense fallback={<LoadingSpinner />}>
                    <AdminPageWrapper activeTab="payments">
                      <AdminPayments />
                    </AdminPageWrapper>
                  </Suspense>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/categories"
              element={
                <AdminRoute>
                  <Suspense fallback={<LoadingSpinner />}>
                    <AdminPageWrapper activeTab="categories">
                      <AdminCategories />
                    </AdminPageWrapper>
                  </Suspense>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <AdminRoute>
                  <Suspense fallback={<LoadingSpinner />}>
                    <AdminPageWrapper activeTab="reports">
                      <AdminReports />
                    </AdminPageWrapper>
                  </Suspense>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/test-drives"
              element={
                <AdminRoute>
                  <Suspense fallback={<LoadingSpinner />}>
                    <AdminPageWrapper activeTab="test-drives">
                      <AdminTestDrive />
                    </AdminPageWrapper>
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
    </AppProvider>
  </Router>
</ReduxProvider>
);
}

export default App;
