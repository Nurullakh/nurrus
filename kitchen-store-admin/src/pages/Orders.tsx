import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Tag,
  Modal,
  Descriptions,
  Select,
  Input,
  message,
  Badge,
  Space,
} from 'antd';
import type { BadgeProps } from 'antd';
import {
  EyeOutlined,
  SearchOutlined,
  ReloadOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import { api } from '../lib/api';
import { getCurrentAdminUser } from '../lib/auth';

const { Option } = Select;

interface Order {
  id: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  city: string;
  items: Array<{
    productId: number;
    name: string;
    price: number;
    quantity: number;
    ownerId?: number | null;
  }>;
  total: number;
  sellerTotal?: number;
  status: 'pending' | 'processing' | 'shipping' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  createdAt: string;
}

const OrdersPage: React.FC = () => {
  const currentUser = getCurrentAdminUser();
  const isAdmin = currentUser?.role === 'admin';
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string | undefined>();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  useEffect(() => {
    fetchOrders();
  }, [pagination.current, pagination.pageSize, statusFilter, paymentStatusFilter]);

  const fetchOrders = async (search?: string) => {
    setLoading(true);
    try {
      const response = await api.get('/orders/admin/list', {
        params: {
          page: pagination.current,
          limit: pagination.pageSize,
          search: (search ?? searchText) || undefined,
          status: statusFilter || undefined,
          paymentStatus: paymentStatusFilter || undefined,
        },
      });
      setOrders(response.data?.data || []);
      setPagination((prev) => ({ ...prev, total: response.data?.total || 0 }));
    } catch (error) {
      message.error('Ошибка загрузки заказов');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (record: Order) => {
    setSelectedOrder(record);
    setIsModalOpen(true);
  };

  const handleStatusChange = async (orderId: number, newStatus: Order['status']) => {
    try {
      await api.put(`/orders/admin/${orderId}/status`, {
        status: newStatus,
      });
      message.success('Статус заказа обновлен');
      fetchOrders();
    } catch (error) {
      message.error('Ошибка обновления статуса');
      console.error(error);
    }
  };

  const statusColors: Record<Order['status'], BadgeProps['status']> = {
    pending: 'default',
    processing: 'processing',
    shipping: 'warning',
    completed: 'success',
    cancelled: 'error',
  };

  const statusTexts: Record<Order['status'], string> = {
    pending: 'Ожидает',
    processing: 'Обработка',
    shipping: 'Доставка',
    completed: 'Завершен',
    cancelled: 'Отменен',
  };

  const paymentStatusColors: Record<Order['paymentStatus'], string> = {
    pending: 'warning',
    paid: 'success',
    refunded: 'default',
  };

  const paymentStatusTexts: Record<Order['paymentStatus'], string> = {
    pending: 'Ожидает оплаты',
    paid: 'Оплачен',
    refunded: 'Возврат',
  };

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, current: 1 }));
    fetchOrders(searchText);
  };

  const handleExport = async () => {
    try {
      const response = await api.get('/orders/admin/list', {
        params: {
          page: 1,
          limit: 1000,
          search: searchText || undefined,
          status: statusFilter || undefined,
          paymentStatus: paymentStatusFilter || undefined,
        },
      });

      const rows = (response.data?.data || []) as Order[];
      const header = [
        'ID',
        'Номер заказа',
        'Клиент',
        'Email',
        'Телефон',
        'Статус',
        'Оплата',
        'Сумма',
        'Дата',
      ];

      const csvRows = rows.map((order) => [
        order.id,
        order.orderNumber,
        order.customerName,
        order.customerEmail,
        order.customerPhone,
        statusTexts[order.status],
        paymentStatusTexts[order.paymentStatus],
        (isAdmin ? order.total : order.sellerTotal || 0).toFixed(2),
        new Date(order.createdAt).toISOString(),
      ]);

      const content = [header, ...csvRows]
        .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\n');

      const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      message.error('Ошибка экспорта заказов');
    }
  };

  const columns = [
    {
      title: '№ Заказа',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      width: 120,
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: 'Клиент',
      dataIndex: 'customerName',
      key: 'customerName',
      width: 180,
    },
    {
      title: 'Товаров',
      dataIndex: 'items',
      key: 'items',
      width: 100,
      align: 'center' as const,
      render: (items: any[]) => items?.length || 0,
    },
    {
      title: 'Сумма',
      dataIndex: 'total',
      key: 'total',
      width: 150,
      render: (_: number, record: Order) =>
        `${Number(isAdmin ? record.total : record.sellerTotal || 0).toLocaleString('ru-RU')} ₽`,
    },
    {
      title: 'Статус заказа',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (status: Order['status'], record: Order) => (
        <Select
          value={status}
          style={{ width: '100%' }}
          onChange={(value) => handleStatusChange(record.id, value)}
        >
          <Option value="pending">
            <Badge status={statusColors.pending} text={statusTexts.pending} />
          </Option>
          <Option value="processing">
            <Badge status={statusColors.processing} text={statusTexts.processing} />
          </Option>
          <Option value="shipping">
            <Badge status={statusColors.shipping} text={statusTexts.shipping} />
          </Option>
          <Option value="completed">
            <Badge status={statusColors.completed} text={statusTexts.completed} />
          </Option>
          <Option value="cancelled">
            <Badge status={statusColors.cancelled} text={statusTexts.cancelled} />
          </Option>
        </Select>
      ),
    },
    {
      title: 'Оплата',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      width: 150,
      render: (paymentStatus: Order['paymentStatus']) => (
        <Tag color={paymentStatusColors[paymentStatus]}>
          {paymentStatusTexts[paymentStatus]}
        </Tag>
      ),
    },
    {
      title: 'Дата',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date: string) => new Date(date).toLocaleDateString('ru-RU'),
    },
    {
      title: 'Действия',
      key: 'actions',
      width: 100,
      fixed: 'right' as const,
      render: (_: any, record: Order) => (
        <Button type="text" icon={<EyeOutlined />} onClick={() => handleView(record)} />
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h1 style={{ margin: 0 }}>{isAdmin ? 'Заказы' : 'Мои заказы'}</h1>
        <Space>
          <Button icon={<DownloadOutlined />} onClick={handleExport}>
            Экспорт
          </Button>
          <Button icon={<ReloadOutlined />} onClick={() => fetchOrders()}>
            Обновить
          </Button>
        </Space>
      </div>

      <div style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
        <Input
          placeholder="Поиск по номеру заказа или клиенту..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onPressEnter={handleSearch}
          style={{ width: 320 }}
        />
        <Button onClick={handleSearch}>Найти</Button>
        <Select
          placeholder="Фильтр по статусу"
          allowClear
          style={{ width: 200 }}
          value={statusFilter}
          onChange={(value) => {
            setStatusFilter(value);
            setPagination((prev) => ({ ...prev, current: 1 }));
          }}
        >
          <Option value="pending">Ожидает</Option>
          <Option value="processing">Обработка</Option>
          <Option value="shipping">Доставка</Option>
          <Option value="completed">Завершен</Option>
          <Option value="cancelled">Отменен</Option>
        </Select>
        <Select
          placeholder="Фильтр по оплате"
          allowClear
          style={{ width: 200 }}
          value={paymentStatusFilter}
          onChange={(value) => {
            setPaymentStatusFilter(value);
            setPagination((prev) => ({ ...prev, current: 1 }));
          }}
        >
          <Option value="pending">Ожидает оплаты</Option>
          <Option value="paid">Оплачен</Option>
          <Option value="refunded">Возврат</Option>
        </Select>
      </div>

      <Table
        columns={columns}
        dataSource={orders}
        rowKey="id"
        scroll={{ x: 1200 }}
        loading={loading}
        pagination={{
          ...pagination,
          onChange: (page, pageSize) => {
            setPagination((prev) => ({
              ...prev,
              current: page,
              pageSize: pageSize || prev.pageSize,
            }));
          },
        }}
      />

      <Modal
        title={`Заказ ${selectedOrder?.orderNumber}`}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsModalOpen(false)}>
            Закрыть
          </Button>,
        ]}
        width={700}
      >
        {selectedOrder && (
          <>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="№ Заказа" span={2}>
                <strong>{selectedOrder.orderNumber}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Клиент" span={2}>
                {selectedOrder.customerName}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {selectedOrder.customerEmail}
              </Descriptions.Item>
              <Descriptions.Item label="Телефон">
                {selectedOrder.customerPhone}
              </Descriptions.Item>
              <Descriptions.Item label="Адрес" span={2}>
                {selectedOrder.city}, {selectedOrder.address}
              </Descriptions.Item>
              <Descriptions.Item label="Количество товаров">
                {selectedOrder.items?.length}
              </Descriptions.Item>
              <Descriptions.Item label="Сумма">
                <strong>
                  {Number(
                    isAdmin ? selectedOrder.total : selectedOrder.sellerTotal || 0,
                  ).toLocaleString('ru-RU')}{' '}
                  ₽
                </strong>
              </Descriptions.Item>
              <Descriptions.Item label="Статус заказа">
                <Badge
                  status={statusColors[selectedOrder.status]}
                  text={statusTexts[selectedOrder.status]}
                />
              </Descriptions.Item>
              <Descriptions.Item label="Статус оплаты">
                <Tag color={paymentStatusColors[selectedOrder.paymentStatus]}>
                  {paymentStatusTexts[selectedOrder.paymentStatus]}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Дата создания" span={2}>
                {new Date(selectedOrder.createdAt).toLocaleString('ru-RU')}
              </Descriptions.Item>
            </Descriptions>

            <div style={{ marginTop: 24 }}>
              <h3>Товары в заказе:</h3>
              {selectedOrder.items?.map((item, index) => (
                <div key={index} style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{item.name}</span>
                    <span>{item.quantity} × {item.price?.toLocaleString('ru-RU')} ₽</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default OrdersPage;

