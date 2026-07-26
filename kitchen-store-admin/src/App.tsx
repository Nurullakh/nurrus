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
import ReviewsPage from './pages/Reviews';
import FinancePage from './pages/Finance';
import RequireAuth from './components/RequireAuth';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin" replace />} />
      <Route path="/admin/login" element={<LoginPage />} />
      <Route
        path="/admin"
        element={
          <RequireAuth allowedRoles={['admin', 'seller']}>
            <AdminLayout />
          </RequireAuth>
        }
      >
        <Route
          index
          element={
            <RequireAuth allowedRoles={['admin', 'seller']}>
              <DashboardPage />
            </RequireAuth>
          }
        />
        <Route path="dashboard" element={<Navigate to="/admin" replace />} />
        <Route
          path="analytics"
          element={
            <RequireAuth allowedRoles={['admin', 'seller']}>
              <AnalyticsPage />
            </RequireAuth>
          }
        />
        <Route
          path="products"
          element={
            <RequireAuth allowedRoles={['admin', 'seller']}>
              <ProductsPage />
            </RequireAuth>
          }
        />
        <Route
          path="categories"
          element={
            <RequireAuth allowedRoles={['admin']}>
              <CategoriesPage />
            </RequireAuth>
          }
        />
        <Route
          path="orders"
          element={
            <RequireAuth allowedRoles={['admin', 'seller']}>
              <OrdersPage />
            </RequireAuth>
          }
        />
        <Route
          path="finance"
          element={
            <RequireAuth allowedRoles={['admin', 'seller']}>
              <FinancePage />
            </RequireAuth>
          }
        />
        <Route
          path="promotions"
          element={
            <RequireAuth allowedRoles={['admin']}>
              <PromotionsPage />
            </RequireAuth>
          }
        />
        <Route
          path="banners"
          element={
            <RequireAuth allowedRoles={['admin']}>
              <BannersPage />
            </RequireAuth>
          }
        />
        <Route
          path="users"
          element={
            <RequireAuth allowedRoles={['admin']}>
              <UsersPage />
            </RequireAuth>
          }
        />
        <Route
          path="reviews"
          element={
            <RequireAuth allowedRoles={['admin']}>
              <ReviewsPage />
            </RequireAuth>
          }
        />
      </Route>
    </Routes>
  );
};

export default App;

