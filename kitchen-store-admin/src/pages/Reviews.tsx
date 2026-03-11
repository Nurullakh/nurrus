import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Rate,
  message,
  Input,
  Select,
  Avatar,
  Popconfirm,
} from 'antd';
import {
  EyeOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SearchOutlined,
  ReloadOutlined,
  UserOutlined,
} from '@ant-design/icons';
import axios from 'axios';

const { TextArea } = Input;
const { Option } = Select;

const API_URL = 'http://localhost:3001';

interface Review {
  id: number;
  productId: number;
  productName?: string;
  userId: number;
  userName?: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

const ReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>();

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/reviews`);
      setReviews(response.data);
    } catch (error) {
      message.error('Ошибка загрузки отзывов');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (record: Review) => {
    setSelectedReview(record);
    setIsModalOpen(true);
  };

  const handleApprove = async (id: number) => {
    try {
      await axios.put(`${API_URL}/reviews/${id}/approve`);
      message.success('Отзыв одобрен');
      fetchReviews();
    } catch (error) {
      message.error('Ошибка одобрения отзыва');
      console.error(error);
    }
  };

  const handleReject = async (id: number) => {
    try {
      await axios.put(`${API_URL}/reviews/${id}/reject`);
      message.success('Отзыв отклонен');
      fetchReviews();
    } catch (error) {
      message.error('Ошибка отклонения отзыва');
      console.error(error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`${API_URL}/reviews/${id}`);
      message.success('Отзыв удален');
      fetchReviews();
    } catch (error) {
      message.error('Ошибка удаления отзыва');
      console.error(error);
    }
  };

  const statusColors: Record<Review['status'], string> = {
    pending: 'warning',
    approved: 'success',
    rejected: 'error',
  };

  const statusTexts: Record<Review['status'], string> = {
    pending: 'На модерации',
    approved: 'Одобрен',
    rejected: 'Отклонен',
  };

  const filteredReviews = reviews.filter((review) => {
    const matchesSearch =
      review.productName?.toLowerCase().includes(searchText.toLowerCase()) ||
      review.userName?.toLowerCase().includes(searchText.toLowerCase()) ||
      review.comment.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = !statusFilter || review.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 70,
    },
    {
      title: 'Пользователь',
      key: 'user',
      width: 180,
      render: (_: any, record: Review) => (
        <Space>
          <Avatar
            size={32}
            src={record.userAvatar ? `${API_URL}${record.userAvatar}` : undefined}
            icon={!record.userAvatar && <UserOutlined />}
          >
            {!record.userAvatar && record.userName?.[0]?.toUpperCase()}
          </Avatar>
          <span>{record.userName || 'Аноним'}</span>
        </Space>
      ),
    },
    {
      title: 'Товар',
      dataIndex: 'productName',
      key: 'productName',
      width: 200,
      ellipsis: true,
    },
    {
      title: 'Рейтинг',
      dataIndex: 'rating',
      key: 'rating',
      width: 150,
      render: (rating: number) => <Rate disabled value={rating} />,
    },
    {
      title: 'Отзыв',
      dataIndex: 'comment',
      key: 'comment',
      width: 300,
      ellipsis: true,
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status: Review['status']) => (
        <Tag color={statusColors[status]}>{statusTexts[status]}</Tag>
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
      width: 180,
      fixed: 'right' as const,
      render: (_: any, record: Review) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          />
          {record.status === 'pending' && (
            <>
              <Button
                type="text"
                icon={<CheckCircleOutlined />}
                style={{ color: '#52c41a' }}
                onClick={() => handleApprove(record.id)}
                title="Одобрить"
              />
              <Button
                type="text"
                icon={<CloseCircleOutlined />}
                danger
                onClick={() => handleReject(record.id)}
                title="Отклонить"
              />
            </>
          )}
          <Popconfirm
            title="Удалить отзыв?"
            onConfirm={() => handleDelete(record.id)}
            okText="Да"
            cancelText="Нет"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const pendingCount = reviews.filter((r) => r.status === 'pending').length;

  return (
    <div>
      <div
        style={{
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <h1 style={{ margin: 0 }}>Отзывы</h1>
          {pendingCount > 0 && (
            <Tag color="warning" style={{ fontSize: 14, padding: '4px 12px' }}>
              На модерации: {pendingCount}
            </Tag>
          )}
        </div>
        <Button icon={<ReloadOutlined />} onClick={fetchReviews}>
          Обновить
        </Button>
      </div>

      <div style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
        <Input
          placeholder="Поиск по товару, пользователю или тексту отзыва..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 400 }}
        />
        <Select
          placeholder="Фильтр по статусу"
          allowClear
          style={{ width: 200 }}
          value={statusFilter}
          onChange={setStatusFilter}
        >
          <Option value="pending">На модерации</Option>
          <Option value="approved">Одобрен</Option>
          <Option value="rejected">Отклонен</Option>
        </Select>
      </div>

      <Table
        columns={columns}
        dataSource={filteredReviews}
        rowKey="id"
        scroll={{ x: 1400 }}
        loading={loading}
      />

      <Modal
        title="Просмотр отзыва"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsModalOpen(false)}>
            Закрыть
          </Button>,
          selectedReview?.status === 'pending' && (
            <Button
              key="approve"
              type="primary"
              onClick={() => {
                handleApprove(selectedReview.id);
                setIsModalOpen(false);
              }}
            >
              Одобрить
            </Button>
          ),
          selectedReview?.status === 'pending' && (
            <Button
              key="reject"
              danger
              onClick={() => {
                handleReject(selectedReview.id);
                setIsModalOpen(false);
              }}
            >
              Отклонить
            </Button>
          ),
        ]}
        width={600}
      >
        {selectedReview && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <Space>
                <Avatar
                  size={48}
                  src={
                    selectedReview.userAvatar
                      ? `${API_URL}${selectedReview.userAvatar}`
                      : undefined
                  }
                  icon={!selectedReview.userAvatar && <UserOutlined />}
                >
                  {!selectedReview.userAvatar &&
                    selectedReview.userName?.[0]?.toUpperCase()}
                </Avatar>
                <div>
                  <div>
                    <strong>{selectedReview.userName || 'Аноним'}</strong>
                  </div>
                  <div style={{ fontSize: 12, color: '#666' }}>
                    {new Date(selectedReview.createdAt).toLocaleString('ru-RU')}
                  </div>
                </div>
              </Space>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ marginBottom: 8 }}>
                <strong>Товар:</strong> {selectedReview.productName}
              </div>
              <div style={{ marginBottom: 8 }}>
                <strong>Рейтинг:</strong>{' '}
                <Rate disabled value={selectedReview.rating} />
              </div>
              <div style={{ marginBottom: 8 }}>
                <strong>Статус:</strong>{' '}
                <Tag color={statusColors[selectedReview.status]}>
                  {statusTexts[selectedReview.status]}
                </Tag>
              </div>
            </div>

            <div>
              <strong>Отзыв:</strong>
              <div
                style={{
                  marginTop: 8,
                  padding: 12,
                  background: '#f5f5f5',
                  borderRadius: 4,
                }}
              >
                {selectedReview.comment}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ReviewsPage;


