import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Spin, Select, DatePicker, message } from 'antd';
import {
  ShoppingCartOutlined,
  UserOutlined,
  DollarOutlined,
  RiseOutlined,
  FallOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { api } from '../lib/api';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface AnalyticsData {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  averageCheck: number;
  topProducts: Array<{
    id: number;
    name: string;
    sales: number;
    revenue: number;
  }>;
  trends: {
    orders: number;
    revenue: number;
    customers: number;
    averageCheck: number;
  };
}

const AnalyticsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(1, 'month'),
    dayjs(),
  ]);
  const trends = analyticsData?.trends ?? {
    orders: 0,
    revenue: 0,
    customers: 0,
    averageCheck: 0,
  };

  useEffect(() => {
    fetchAnalytics();
  }, [period, dateRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await api.get('/analytics', {
        params: {
          period,
          startDate: dateRange[0].format('YYYY-MM-DD'),
          endDate: dateRange[1].format('YYYY-MM-DD'),
        },
      });
      setAnalyticsData(response.data);
    } catch {
      message.error('Не удалось загрузить аналитику');
      setAnalyticsData(null);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Товар',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Продано',
      dataIndex: 'sales',
      key: 'sales',
      align: 'center' as const,
    },
    {
      title: 'Выручка',
      dataIndex: 'revenue',
      key: 'revenue',
      render: (value: number) => `${value.toLocaleString('ru-RU')} ₽`,
    },
  ];

  if (loading && !analyticsData) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>Аналитика</h1>
        <div style={{ display: 'flex', gap: 16 }}>
          <Select
            value={period}
            onChange={setPeriod}
            style={{ width: 150 }}
          >
            <Option value="week">Неделя</Option>
            <Option value="month">Месяц</Option>
            <Option value="year">Год</Option>
          </Select>
          <RangePicker
            value={dateRange}
            onChange={(dates) => dates && setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
            format="DD.MM.YYYY"
          />
        </div>
      </div>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Всего заказов"
              value={analyticsData?.totalOrders || 0}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#3f8600' }}
              suffix={trends.orders > 0 ? <RiseOutlined style={{ fontSize: 14 }} /> : <FallOutlined style={{ fontSize: 14 }} />}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
              {trends.orders > 0 ? '+' : ''}
              {trends.orders}% за период
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Выручка"
              value={analyticsData?.totalRevenue || 0}
              prefix={<DollarOutlined />}
              suffix="₽"
              valueStyle={{ color: '#3f8600' }}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
              {trends.revenue > 0 ? '+' : ''}
              {trends.revenue}% за период
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Новых клиентов"
              value={analyticsData?.totalCustomers || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
              {trends.customers > 0 ? '+' : ''}
              {trends.customers}% за период
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Средний чек"
              value={analyticsData?.averageCheck || 0}
              suffix="₽"
              valueStyle={{ color: trends.averageCheck < 0 ? '#cf1322' : '#3f8600' }}
              prefix={trends.averageCheck < 0 ? <FallOutlined style={{ fontSize: 14 }} /> : <RiseOutlined style={{ fontSize: 14 }} />}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
              {trends.averageCheck > 0 ? '+' : ''}
              {trends.averageCheck}% за период
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Card title="Топ-3 товаров по продажам">
            <Table
              columns={columns}
              dataSource={analyticsData?.topProducts || []}
              rowKey="id"
              pagination={false}
              size="small"
              loading={loading}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Статистика по категориям">
            <Table
              columns={[
                {
                  title: 'Категория',
                  dataIndex: 'category',
                  key: 'category',
                },
                {
                  title: 'Товаров',
                  dataIndex: 'count',
                  key: 'count',
                  align: 'center' as const,
                },
                {
                  title: 'Доля',
                  dataIndex: 'percentage',
                  key: 'percentage',
                  render: (value: number) => `${value}%`,
                },
              ]}
              dataSource={[]}
              rowKey="id"
              pagination={false}
              size="small"
              loading={loading}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AnalyticsPage;

