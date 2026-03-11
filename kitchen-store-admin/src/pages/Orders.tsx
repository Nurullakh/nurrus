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
} from 'antd';
import type { BadgeProps } from 'antd';
import {
  EyeOutlined,
  SearchOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import { API_URL } from '../lib/constants';

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
  }>;
  total: number;
  status: 'pending' | 'processing' | 'shipping' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  createdAt: string;
}

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/orders`);
      setOrders(response.data);
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
      await axios.put(`${API_URL}/orders/${orderId}/status`, {
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

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchText.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = !statusFilter || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
      render: (value: number) => `${value?.toLocaleString('ru-RU')} ₽`,
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
        <h1 style={{ margin: 0 }}>Заказы</h1>
        <Button icon={<ReloadOutlined />} onClick={fetchOrders}>
          Обновить
        </Button>
      </div>

      <div style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
        <Input
          placeholder="Поиск по номеру заказа или клиенту..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300 }}
        />
        <Select
          placeholder="Фильтр по статусу"
          allowClear
          style={{ width: 200 }}
          value={statusFilter}
          onChange={setStatusFilter}
        >
          <Option value="pending">Ожидает</Option>
          <Option value="processing">Обработка</Option>
          <Option value="shipping">Доставка</Option>
          <Option value="completed">Завершен</Option>
          <Option value="cancelled">Отменен</Option>
        </Select>
      </div>

      <Table
        columns={columns}
        dataSource={filteredOrders}
        rowKey="id"
        scroll={{ x: 1200 }}
        loading={loading}
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
                <strong>{selectedOrder.total?.toLocaleString('ru-RU')} ₽</strong>
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

