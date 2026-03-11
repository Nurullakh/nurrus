import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/AdminLayout';
import LoginPage from './pages/Login';
import DashboardPage from './pages/Dashboard';
import AnalyticsPage from './pages/Analytics';
import ProductsPage from './pages/Products';
import CategoriesPage from './pages/Categories';
import OrdersPage from './pages/Orders';
import PromotionsPage from './pages/Promotions';
import BannersPage from './pages/Banners';
import UsersPage from './pages/Users';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/admin/login" element={<LoginPage />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="promotions" element={<PromotionsPage />} />
        <Route path="banners" element={<BannersPage />} />
        <Route path="users" element={<UsersPage />} />
      </Route>
    </Routes>
  );
};

export default App;

