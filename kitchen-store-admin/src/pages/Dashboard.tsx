import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Tag, Spin } from 'antd';
import {
  ShoppingCartOutlined,
  UserOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import axios from 'axios';
import StatCard from '../components/StatCard';

const API_URL = 'http://localhost:3001';

interface Statistics {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: number;
}

const DashboardPage: React.FC = () => {
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const statsResponse = await axios.get(`${API_URL}/orders/statistics`);
      setStatistics(statsResponse.data);

      const ordersResponse = await axios.get(`${API_URL}/orders`);
      setRecentOrders(ordersResponse.data.slice(0, 5));
    } catch (error) {
      console.error('Ошибка загрузки данных дашборда:', error);
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
            title="Всего заказов"
            value={statistics?.totalOrders || 0}
            prefix={<ShoppingCartOutlined />}
            trend={12}
            trendText={`В ожидании: ${statistics?.pendingOrders || 0}`}
            color="#3f8600"
            loading={loading}
          />
        </Col>
        <Col span={6}>
          <StatCard
            title="Выручка"
            value={statistics?.totalRevenue || 0}
            prefix={<DollarOutlined />}
            suffix="₽"
            trend={18}
            trendText={`Завершено: ${statistics?.completedOrders || 0}`}
            color="#3f8600"
            loading={loading}
          />
        </Col>
        <Col span={6}>
          <StatCard
            title="Новых клиентов"
            value={342}
            prefix={<UserOutlined />}
            trend={8}
            trendText="За последний месяц"
            color="#1890ff"
            loading={loading}
          />
        </Col>
        <Col span={6}>
          <StatCard
            title="Средний чек"
            value={statistics?.totalOrders ? Math.round(statistics.totalRevenue / statistics.totalOrders) : 0}
            suffix="₽"
            trend={-3}
            trendText="За все время"
            color="#cf1322"
            loading={loading}
          />
        </Col>
      </Row>

      <Card title="Последние заказы" style={{ marginBottom: 24 }}>
        <Table
          columns={columns}
          dataSource={recentOrders}
          rowKey="id"
          pagination={false}
          size="small"
        />
      </Card>

      <Row gutter={16}>
        <Col span={12}>
          <Card title="Статистика по статусам">
            <div style={{ padding: '20px 0' }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span>Ожидают обработки</span>
                  <strong>{statistics?.pendingOrders || 0}</strong>
                </div>
                <div style={{ height: 8, background: '#f0f0f0', borderRadius: 4 }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${statistics?.totalOrders ? (statistics.pendingOrders / statistics.totalOrders) * 100 : 0}%`,
                      background: '#faad14',
                      borderRadius: 4,
                    }}
                  />
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span>Завершены</span>
                  <strong>{statistics?.completedOrders || 0}</strong>
                </div>
                <div style={{ height: 8, background: '#f0f0f0', borderRadius: 4 }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${statistics?.totalOrders ? (statistics.completedOrders / statistics.totalOrders) * 100 : 0}%`,
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
              <Link to="/admin/orders" style={{ padding: '12px', border: '1px solid #d9d9d9', borderRadius: 6, textAlign: 'center' }}>
                Просмотреть все заказы
              </Link>
              <Link to="/admin/products" style={{ padding: '12px', border: '1px solid #d9d9d9', borderRadius: 6, textAlign: 'center' }}>
                Управление товарами
              </Link>
              <Link to="/admin/promotions" style={{ padding: '12px', border: '1px solid #d9d9d9', borderRadius: 6, textAlign: 'center' }}>
                Создать акцию
              </Link>
              <Link to="/admin/banners" style={{ padding: '12px', border: '1px solid #d9d9d9', borderRadius: 6, textAlign: 'center' }}>
                Управление баннерами
              </Link>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;

