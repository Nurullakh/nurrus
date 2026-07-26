import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  AppstoreOutlined,
  ShoppingOutlined,
  TagsOutlined,
  GiftOutlined,
  PictureOutlined,
  UserOutlined,
  BarChartOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  StarOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import { Layout, Menu, Button, theme, Avatar, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { ADMIN_TOKEN_KEY, ADMIN_USER_KEY } from '../lib/api';
import { getCurrentAdminUser } from '../lib/auth';

const { Header, Sider, Content } = Layout;

const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const currentUser = getCurrentAdminUser();
  const isAdmin = currentUser?.role === 'admin';

  const adminMenuItems: MenuProps['items'] = [
    {
      key: '/admin',
      icon: <BarChartOutlined />,
      label: 'Дашборд',
    },
    {
      key: '/admin/analytics',
      icon: <BarChartOutlined />,
      label: 'Аналитика',
    },
    {
      key: '/admin/products',
      icon: <ShoppingOutlined />,
      label: 'Товары',
    },
    {
      key: '/admin/categories',
      icon: <AppstoreOutlined />,
      label: 'Категории',
    },
    {
      key: '/admin/orders',
      icon: <TagsOutlined />,
      label: 'Заказы',
    },
    {
      key: '/admin/finance',
      icon: <DollarOutlined />,
      label: 'Финансы',
    },
    {
      key: '/admin/promotions',
      icon: <GiftOutlined />,
      label: 'Акции и скидки',
    },
    {
      key: '/admin/banners',
      icon: <PictureOutlined />,
      label: 'Баннеры',
    },
    {
      key: '/admin/users',
      icon: <UserOutlined />,
      label: 'Пользователи',
    },
    {
      key: '/admin/reviews',
      icon: <StarOutlined />,
      label: 'Отзывы',
    },
  ];

  const sellerMenuItems: MenuProps['items'] = [
    {
      key: '/admin',
      icon: <BarChartOutlined />,
      label: 'Дашборд',
    },
    {
      key: '/admin/analytics',
      icon: <BarChartOutlined />,
      label: 'Аналитика',
    },
    {
      key: '/admin/orders',
      icon: <TagsOutlined />,
      label: 'Мои заказы',
    },
    {
      key: '/admin/finance',
      icon: <DollarOutlined />,
      label: 'Финансы',
    },
    {
      key: '/admin/products',
      icon: <ShoppingOutlined />,
      label: 'Мои товары',
    },
  ];

  const menuItems = isAdmin ? adminMenuItems : sellerMenuItems;

  const handleUserMenuClick = ({ key }: { key: string }) => {
    if (key === 'logout') {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
      localStorage.removeItem(ADMIN_USER_KEY);
      navigate('/admin/login');
    }
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      label: 'Профиль',
      icon: <UserOutlined />,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: 'Выйти',
      icon: <LogoutOutlined />,
      danger: true,
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: collapsed ? 20 : 24,
            fontWeight: 'bold',
          }}
        >
          {collapsed ? 'KS' : 'NURRUS'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: '0 24px', background: colorBgContainer, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />
          <Dropdown
            menu={{ items: userMenuItems, onClick: handleUserMenuClick }}
            placement="bottomRight"
          >
            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar icon={<UserOutlined />} />
              <span>{currentUser?.name || 'Пользователь'}</span>
            </div>
          </Dropdown>
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;

