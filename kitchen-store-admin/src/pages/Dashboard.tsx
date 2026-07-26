import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Tag, Spin } from 'antd';
import {
  ShoppingCartOutlined,
  UserOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { getCurrentAdminUser } from '../lib/auth';
import StatCard from '../components/StatCard';

interface OrderStatistics {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: number;
}

interface ProductStatistics {
  totalProducts: number;
  availableProducts: number;
  outOfStockProducts: number;
  totalStock: number;
}

interface ProductListItem {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  is_available: boolean;
}

const DashboardPage: React.FC = () => {
  const currentUser = getCurrentAdminUser();
  const isAdmin = currentUser?.role === 'admin';
  const [orderStatistics, setOrderStatistics] = useState<OrderStatistics | null>(null);
  const [productStatistics, setProductStatistics] = useState<ProductStatistics | null>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [recentProducts, setRecentProducts] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const productStatsResponse = await api.get('/products/admin/statistics');
      setProductStatistics(productStatsResponse.data);

      const productsResponse = await api.get('/products/admin/list', {
        params: { page: 1, limit: 5 },
      });
      setRecentProducts(productsResponse.data?.data ?? []);

      if (isAdmin) {
        const statsResponse = await api.get('/orders/statistics');
        setOrderStatistics(statsResponse.data);

        const ordersResponse = await api.get('/orders');
        setRecentOrders(ordersResponse.data.slice(0, 5));
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: '№ Заказа',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: 'Клиент',
      dataIndex: 'customerName',
      key: 'customerName',
    },
    {
      title: 'Сумма',
      dataIndex: 'total',
      key: 'total',
      render: (value: number) => `${value?.toLocaleString('ru-RU')} ₽`,
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          pending: 'default',
          processing: 'processing',
          shipping: 'warning',
          completed: 'success',
          cancelled: 'error',
        };
        const textMap: Record<string, string> = {
          pending: 'Ожидает',
          processing: 'Обработка',
          shipping: 'Доставка',
          completed: 'Завершен',
          cancelled: 'Отменен',
        };
        return <Tag color={colorMap[status]}>{textMap[status]}</Tag>;
      },
    },
    {
      title: 'Дата',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('ru-RU'),
    },
  ];

  const productColumns = [
    {
      title: 'Товар',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: 'Категория',
      dataIndex: 'category',
      key: 'category',
      render: (value: string) => value || 'Без категории',
    },
    {
      title: 'Цена',
      dataIndex: 'price',
      key: 'price',
      render: (value: number) => `${value?.toLocaleString('ru-RU')} ₽`,
    },
    {
      title: 'Остаток',
      dataIndex: 'stock',
      key: 'stock',
    },
    {
      title: 'Статус',
      dataIndex: 'is_available',
      key: 'is_available',
      render: (isAvailable: boolean) => (
        <Tag color={isAvailable ? 'green' : 'red'}>
          {isAvailable ? 'В наличии' : 'Скрыт'}
        </Tag>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>Дашборд</h1>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <StatCard
            title="Всего товаров"
            value={productStatistics?.totalProducts || 0}
            prefix={<ShoppingCartOutlined />}
            trend={12}
            trendText={`В наличии: ${productStatistics?.availableProducts || 0}`}
            color="#3f8600"
            loading={loading}
          />
        </Col>
        <Col span={6}>
          <StatCard
            title="Остаток на складе"
            value={productStatistics?.totalStock || 0}
            prefix={<DollarOutlined />}
            trend={18}
            trendText={`Нет в наличии: ${productStatistics?.outOfStockProducts || 0}`}
            color="#3f8600"
            loading={loading}
          />
        </Col>
        <Col span={6}>
          <StatCard
            title={isAdmin ? 'Всего заказов' : 'Активных товаров'}
            value={isAdmin ? orderStatistics?.totalOrders || 0 : productStatistics?.availableProducts || 0}
            prefix={<UserOutlined />}
            trend={8}
            trendText={isAdmin ? `В ожидании: ${orderStatistics?.pendingOrders || 0}` : 'В продаже'}
            color="#1890ff"
            loading={loading}
          />
        </Col>
        <Col span={6}>
          <StatCard
            title={isAdmin ? 'Средний чек' : 'Скрытых товаров'}
            value={
              isAdmin
                ? orderStatistics?.totalOrders
                  ? Math.round((orderStatistics?.totalRevenue || 0) / orderStatistics.totalOrders)
                  : 0
                : productStatistics?.outOfStockProducts || 0
            }
            suffix={isAdmin ? '₽' : undefined}
            trend={-3}
            trendText="За все время"
            color="#cf1322"
            loading={loading}
          />
        </Col>
      </Row>

      <Card title={isAdmin ? 'Последние заказы' : 'Последние товары'} style={{ marginBottom: 24 }}>
        <Table
          columns={isAdmin ? columns : productColumns}
          dataSource={isAdmin ? recentOrders : recentProducts}
          rowKey="id"
          pagination={false}
          size="small"
        />
      </Card>

      <Row gutter={16}>
        <Col span={12}>
          <Card title={isAdmin ? 'Статистика по статусам заказов' : 'Статистика по товарам'}>
            <div style={{ padding: '20px 0' }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span>{isAdmin ? 'Ожидают обработки' : 'В наличии'}</span>
                  <strong>{isAdmin ? orderStatistics?.pendingOrders || 0 : productStatistics?.availableProducts || 0}</strong>
                </div>
                <div style={{ height: 8, background: '#f0f0f0', borderRadius: 4 }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${
                        isAdmin
                          ? orderStatistics?.totalOrders
                            ? ((orderStatistics.pendingOrders || 0) / orderStatistics.totalOrders) * 100
                            : 0
                          : productStatistics?.totalProducts
                            ? ((productStatistics.availableProducts || 0) / productStatistics.totalProducts) * 100
                            : 0
                      }%`,
                      background: '#faad14',
                      borderRadius: 4,
                    }}
                  />
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span>{isAdmin ? 'Завершены' : 'Нет в наличии'}</span>
                  <strong>{isAdmin ? orderStatistics?.completedOrders || 0 : productStatistics?.outOfStockProducts || 0}</strong>
                </div>
                <div style={{ height: 8, background: '#f0f0f0', borderRadius: 4 }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${
                        isAdmin
                          ? orderStatistics?.totalOrders
                            ? ((orderStatistics.completedOrders || 0) / orderStatistics.totalOrders) * 100
                            : 0
                          : productStatistics?.totalProducts
                            ? ((productStatistics.outOfStockProducts || 0) / productStatistics.totalProducts) * 100
                            : 0
                      }%`,
                      background: '#52c41a',
                      borderRadius: 4,
                    }}
                  />
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Быстрые действия">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Link to="/admin/products" style={{ padding: '12px', border: '1px solid #d9d9d9', borderRadius: 6, textAlign: 'center' }}>
                {isAdmin ? 'Управление товарами' : 'Управление моими товарами'}
              </Link>
              {isAdmin && (
                <>
                  <Link to="/admin/orders" style={{ padding: '12px', border: '1px solid #d9d9d9', borderRadius: 6, textAlign: 'center' }}>
                    Просмотреть все заказы
                  </Link>
                  <Link to="/admin/promotions" style={{ padding: '12px', border: '1px solid #d9d9d9', borderRadius: 6, textAlign: 'center' }}>
                    Создать акцию
                  </Link>
                  <Link to="/admin/banners" style={{ padding: '12px', border: '1px solid #d9d9d9', borderRadius: 6, textAlign: 'center' }}>
                    Управление баннерами
                  </Link>
                </>
              )}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;

