import React, { useEffect, useState } from 'react';
import { Table, Button, Tag, Space, Modal, Input, Rate, message, Tooltip, Badge } from 'antd';
import { CheckOutlined, CloseOutlined, MessageOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { api } from '../lib/api';

interface Review {
  id: number;
  productId: number;
  userName: string;
  userEmail: string;
  rating: number;
  comment: string;
  isVerified: boolean;
  isPublished: boolean;
  isModerated: boolean;
  adminComment?: string;
  helpfulCount: number;
  createdAt: string;
}

interface ReviewsResponse {
  data: Review[];
  total: number;
  page: number;
  totalPages: number;
}

const ReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<'all' | 'pending' | 'published'>('pending');
  const [replyModal, setReplyModal] = useState<{ open: boolean; review: Review | null }>({ open: false, review: null });
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);

  const fetchReviews = async (p = page) => {
    setLoading(true);
    try {
      const params: Record<string, string> = {
        page: String(p),
        limit: '20',
        includeUnpublished: 'true',
      };
      const res = await api.get<ReviewsResponse>('/reviews', { params });
      let data = res.data.data;
      if (filter === 'pending') data = data.filter((r) => !r.isPublished);
      if (filter === 'published') data = data.filter((r) => r.isPublished);
      setReviews(data);
      setTotal(filter === 'all' ? res.data.total : data.length);
    } catch {
      message.error('Ошибка загрузки отзывов');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReviews(1); setPage(1); }, [filter]);

  const handlePublish = async (id: number, publish: boolean) => {
    try {
      await api.put(`/reviews/${id}`, { isPublished: publish, isModerated: true });
      message.success(publish ? 'Отзыв опубликован' : 'Отзыв скрыт');
      fetchReviews();
    } catch {
      message.error('Ошибка');
    }
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: 'Удалить отзыв?',
      okText: 'Удалить',
      okType: 'danger',
      cancelText: 'Отмена',
      onOk: async () => {
        await api.delete(`/reviews/${id}`);
        message.success('Удалено');
        fetchReviews();
      },
    });
  };

  const handleReply = async () => {
    if (!replyModal.review) return;
    setReplyLoading(true);
    try {
      await api.put(`/reviews/${replyModal.review.id}`, {
        adminComment: replyText,
        isPublished: true,
        isModerated: true,
      });
      message.success('Ответ сохранён, отзыв опубликован');
      setReplyModal({ open: false, review: null });
      setReplyText('');
      fetchReviews();
    } catch {
      message.error('Ошибка');
    } finally {
      setReplyLoading(false);
    }
  };

  const pendingCount = reviews.filter((r) => !r.isPublished).length;

  const columns: ColumnsType<Review> = [
    {
      title: 'Товар',
      dataIndex: 'productId',
      width: 80,
      render: (id) => <a href={`/product/${id}`} target="_blank" rel="noreferrer">#{id}</a>,
    },
    {
      title: 'Автор',
      width: 160,
      render: (_, r) => (
        <div>
          <div className="font-medium">{r.userName}</div>
          <div className="text-xs text-gray-400">{r.userEmail}</div>
        </div>
      ),
    },
    {
      title: 'Оценка',
      dataIndex: 'rating',
      width: 130,
      render: (rating) => <Rate disabled defaultValue={rating} style={{ fontSize: 14 }} />,
    },
    {
      title: 'Отзыв',
      dataIndex: 'comment',
      render: (comment, r) => (
        <div>
          <div className="line-clamp-2 text-sm">{comment}</div>
          {r.adminComment && (
            <div className="text-xs text-green-600 mt-1">↳ {r.adminComment}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Статус',
      width: 130,
      render: (_, r) => (
        <Space direction="vertical" size={2}>
          <Tag color={r.isPublished ? 'green' : 'orange'}>
            {r.isPublished ? 'Опубликован' : 'На модерации'}
          </Tag>
          {r.isVerified && <Tag color="blue">Покупка подтв.</Tag>}
        </Space>
      ),
    },
    {
      title: 'Дата',
      dataIndex: 'createdAt',
      width: 110,
      render: (date) => new Date(date).toLocaleDateString('ru-RU'),
    },
    {
      title: 'Действия',
      width: 160,
      render: (_, r) => (
        <Space>
          {!r.isPublished ? (
            <Tooltip title="Опубликовать">
              <Button
                type="primary"
                icon={<CheckOutlined />}
                size="small"
                onClick={() => handlePublish(r.id, true)}
              />
            </Tooltip>
          ) : (
            <Tooltip title="Скрыть">
              <Button
                icon={<CloseOutlined />}
                size="small"
                onClick={() => handlePublish(r.id, false)}
              />
            </Tooltip>
          )}
          <Tooltip title="Ответить">
            <Button
              icon={<MessageOutlined />}
              size="small"
              onClick={() => { setReplyModal({ open: true, review: r }); setReplyText(r.adminComment || ''); }}
            />
          </Tooltip>
          <Tooltip title="Удалить">
            <Button danger icon={<DeleteOutlined />} size="small" onClick={() => handleDelete(r.id)} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>Отзывы</h2>
        <Space>
          <Button
            type={filter === 'pending' ? 'primary' : 'default'}
            onClick={() => setFilter('pending')}
          >
            На модерации
            {filter !== 'pending' && pendingCount === 0 ? null : (
              <Badge count={filter === 'pending' ? undefined : pendingCount} offset={[4, -2]} />
            )}
          </Button>
          <Button
            type={filter === 'published' ? 'primary' : 'default'}
            onClick={() => setFilter('published')}
          >
            Опубликованные
          </Button>
          <Button
            type={filter === 'all' ? 'primary' : 'default'}
            onClick={() => setFilter('all')}
          >
            Все
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={reviews}
        rowKey="id"
        loading={loading}
        pagination={{
          current: page,
          total,
          pageSize: 20,
          onChange: (p) => { setPage(p); fetchReviews(p); },
          showTotal: (t) => `Всего: ${t}`,
        }}
      />

      <Modal
        title={`Ответ на отзыв от ${replyModal.review?.userName}`}
        open={replyModal.open}
        onCancel={() => setReplyModal({ open: false, review: null })}
        onOk={handleReply}
        okText="Сохранить и опубликовать"
        cancelText="Отмена"
        confirmLoading={replyLoading}
      >
        {replyModal.review && (
          <div style={{ marginBottom: 12, padding: 12, background: '#f5f5f5', borderRadius: 8 }}>
            <Rate disabled value={replyModal.review.rating} style={{ fontSize: 14 }} />
            <p style={{ margin: '8px 0 0', fontSize: 13 }}>{replyModal.review.comment}</p>
          </div>
        )}
        <Input.TextArea
          rows={4}
          placeholder="Ответ от магазина..."
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default ReviewsPage;
