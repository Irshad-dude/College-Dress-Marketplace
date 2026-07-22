import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { NotificationProvider } from './context/NotificationContext';

import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';
import PrivateRoute from './components/PrivateRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Dashboard from './pages/Dashboard';
import AddProduct from './pages/AddProduct';
import MyProducts from './pages/MyProducts';
import Chat from './pages/Chat';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <SocketProvider>
            <Routes>
              {/* Public pages */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:id" element={<ProductDetail />} />
              </Route>

              {/* Auth pages (no layout) */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected dashboard pages */}
              <Route element={<PrivateRoute />}>
                <Route element={<DashboardLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/dashboard/admin" element={<AdminDashboard />} />
                  <Route path="/dashboard/add-product" element={<AddProduct />} />
                  <Route path="/dashboard/my-products" element={<MyProducts />} />
                  <Route path="/dashboard/chat" element={<Chat />} />
                  <Route path="/dashboard/notifications" element={<Notifications />} />
                  <Route path="/dashboard/profile" element={<Profile />} />
                </Route>
              </Route>

              {/* Catch all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
              toastClassName="!rounded-xl !font-sans !text-sm"
            />
          </SocketProvider>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
