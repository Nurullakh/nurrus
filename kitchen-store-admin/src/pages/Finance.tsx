import React, { useEffect, useState } from 'react';
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Row,
  Select,
  Statistic,
  Table,
  Tag,
} from 'antd';
import { DollarOutlined } from '@ant-design/icons';
import { api } from '../lib/api';
import { getCurrentAdminUser } from '../lib/auth';

interface FinanceSummary {
  commissionRate: number;
  grossRevenue?: number;
  commissionAmount?: number;
  netRevenue?: number;
  paidOut?: number;
  pendingPayouts?: number;
  availableBalance?: number;
  totalGrossRevenue?: number;
  totalCommissionAmount?: number;
  totalNetRevenue?: number;
  totalPaidOut?: number;
  totalPendingPayouts?: number;
  totalAvailableBalance?: number;
}

interface Payout {
  id: number;
  sellerId: number;
  grossAmount: number;
  commissionAmount: number;
  netAmount: number;
  status: 'requested' | 'approved' | 'paid' | 'rejected';
  comment?: string | null;
  createdAt: string;
  seller?: {
    id: number;
    name: string;
    email: string;
  } | null;
}

const FinancePage: React.FC = () => {
  const currentUser = getCurrentAdminUser();
  const isAdmin = currentUser?.role === 'admin';
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);
  const [statusValue, setStatusValue] = useState<'approved' | 'paid' | 'rejected'>(
    'approved',
  );
  const [statusComment, setStatusComment] = useState('');
  const [form] = Form.useForm();

  const loadData = async () => {
    setLoading(true);
    try {
      const [summaryResponse, payoutsResponse] = await Promise.all([
        api.get('/finance/summary'),
        api.get('/finance/payouts', { params: { page: 1, limit: 100 } }),
      ]);
      setSummary(summaryResponse.data);
      setPayouts(payoutsResponse.data?.data ?? []);
    } catch {
      message.error('Не удалось загрузить финансы');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const requestPayout = async (values: { amount?: number; comment?: string }) => {
    try {
      await api.post('/finance/payouts/request', values);
      message.success('Запрос на выплату отправлен');
      setIsRequestOpen(false);
      form.resetFields();
      loadData();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Ошибка запроса выплаты');
    }
  };

  const updatePayoutStatus = async () => {
    if (!selectedPayout) {
      return;
    }

    try {
      await api.put(`/finance/payouts/${selectedPayout.id}/status`, {
        status: statusValue,
        comment: statusComment || undefined,
      });
      message.success('Статус выплаты обновлен');
      setIsStatusOpen(false);
      setSelectedPayout(null);
      setStatusComment('');
      loadData();
    } catch {
      message.error('Ошибка обновления статуса выплаты');
    }
  };

  const statusColors: Record<Payout['status'], string> = {
    requested: 'orange',
    approved: 'blue',
    paid: 'green',
    rejected: 'red',
  };

  const statusTexts: Record<Payout['status'], string> = {
    requested: 'Запрошена',
    approved: 'Подтверждена',
    paid: 'Оплачена',
    rejected: 'Отклонена',
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>Финансы</h1>
        {!isAdmin && (
          <Button type="primary" icon={<DollarOutlined />} onClick={() => setIsRequestOpen(true)}>
            Запросить выплату
          </Button>
        )}
      </div>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic title="Комиссия" value={`${Math.round((summary?.commissionRate || 0) * 100)}%`} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title={isAdmin ? 'Общая выручка' : 'Выручка'}
              value={isAdmin ? summary?.totalGrossRevenue || 0 : summary?.grossRevenue || 0}
              suffix="₽"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title={isAdmin ? 'К выплате всего' : 'Доступно к выплате'}
              value={
                isAdmin ? summary?.totalAvailableBalance || 0 : summary?.availableBalance || 0
              }
              suffix="₽"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title={isAdmin ? 'Выплачено всего' : 'Выплачено'}
              value={isAdmin ? summary?.totalPaidOut || 0 : summary?.paidOut || 0}
              suffix="₽"
            />
          </Card>
        </Col>
      </Row>

      <Card title="История выплат">
        <Table
          rowKey="id"
          loading={loading}
          dataSource={payouts}
          columns={[
            ...(isAdmin
              ? [
                  {
                    title: 'Продавец',
                    key: 'seller',
                    render: (_: unknown, row: Payout) =>
                      row.seller ? `${row.seller.name} (${row.seller.email})` : `#${row.sellerId}`,
                  },
                ]
              : []),
            {
              title: 'Сумма к выплате',
              dataIndex: 'netAmount',
              key: 'netAmount',
              render: (value: number) => `${Number(value).toLocaleString('ru-RU')} ₽`,
            },
            {
              title: 'Статус',
              dataIndex: 'status',
              key: 'status',
              render: (status: Payout['status']) => (
                <Tag color={statusColors[status]}>{statusTexts[status]}</Tag>
              ),
            },
            {
              title: 'Комментарий',
              dataIndex: 'comment',
              key: 'comment',
              render: (value: string | null) => value || '—',
            },
            {
              title: 'Дата',
              dataIndex: 'createdAt',
              key: 'createdAt',
              render: (value: string) => new Date(value).toLocaleString('ru-RU'),
            },
            ...(isAdmin
              ? [
                  {
                    title: 'Действия',
                    key: 'actions',
                    render: (_: unknown, row: Payout) =>
                      row.status === 'paid' || row.status === 'rejected' ? null : (
                        <Button
                          size="small"
                          onClick={() => {
                            setSelectedPayout(row);
                            setStatusValue('approved');
                            setStatusComment('');
                            setIsStatusOpen(true);
                          }}
                        >
                          Изменить статус
                        </Button>
                      ),
                  },
                ]
              : []),
          ]}
        />
      </Card>

      <Modal
        title="Запрос выплаты"
        open={isRequestOpen}
        onCancel={() => setIsRequestOpen(false)}
        onOk={() => form.submit()}
        okText="Отправить"
        cancelText="Отмена"
      >
        <Form form={form} layout="vertical" onFinish={requestPayout}>
          <Form.Item name="amount" label="Сумма" rules={[{ required: false }]}>
            <InputNumber style={{ width: '100%' }} min={0.01} />
          </Form.Item>
          <Form.Item name="comment" label="Комментарий">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Обновить статус выплаты"
        open={isStatusOpen}
        onCancel={() => setIsStatusOpen(false)}
        onOk={updatePayoutStatus}
        okText="Сохранить"
        cancelText="Отмена"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Select
            value={statusValue}
            onChange={(value) => setStatusValue(value as 'approved' | 'paid' | 'rejected')}
            options={[
              { value: 'approved', label: 'Подтвердить' },
              { value: 'paid', label: 'Отметить как выплачено' },
              { value: 'rejected', label: 'Отклонить' },
            ]}
          />
          <Input.TextArea
            rows={3}
            value={statusComment}
            onChange={(event) => setStatusComment(event.target.value)}
            placeholder="Комментарий"
          />
        </div>
      </Modal>
    </div>
  );
};

export default FinancePage;
