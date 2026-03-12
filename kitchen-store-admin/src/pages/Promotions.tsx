import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Switch,
  message,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  StopOutlined,
  PlayCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { api } from '../lib/api';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { TextArea } = Input;

interface Promotion {
  id: number;
  name: string;
  description?: string;
  type: string;
  value: number;
  category?: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'paused' | 'ended';
  code?: string;
  isActive: boolean;
}

const PromotionsPage: React.FC = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchPromotions();
    fetchCategories();
  }, []);

  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const response = await api.get('/promotions');
      setPromotions(response.data);
    } catch (error) {
      message.error('Ошибка загрузки акций');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Ошибка загрузки категорий:', error);
    }
  };

  const handleCreate = () => {
    setEditingPromotion(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (record: Promotion) => {
    setEditingPromotion(record);
    form.setFieldsValue({
      ...record,
      dateRange: [dayjs(record.startDate), dayjs(record.endDate)],
    });
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await api.put(`/promotions/${id}/toggle`);
      message.success('Статус акции изменен');
      fetchPromotions();
    } catch (error) {
      message.error('Ошибка изменения статуса');
    }
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: 'Удалить акцию?',
      content: 'Вы уверены что хотите удалить эту акцию?',
      okText: 'Да',
      cancelText: 'Нет',
      okType: 'danger',
      onOk: async () => {
        try {
          await api.delete(`/promotions/${id}`);
          message.success('Акция удалена');
          fetchPromotions();
        } catch (error) {
          message.error('Ошибка удаления акции');
        }
      },
    });
  };

  const handleSubmit = async (values: any) => {
    try {
      const [startDate, endDate] = values.dateRange;
      const promotionData = {
        name: values.name,
        description: values.description,
        type: values.type,
        value: values.value || 0,
        category: values.category,
        startDate: startDate.format('YYYY-MM-DD'),
        endDate: endDate.format('YYYY-MM-DD'),
        status: values.status ? 'active' : 'paused',
        code: values.code,
        isActive: values.status,
      };

      if (editingPromotion) {
        await api.put(`/promotions/${editingPromotion.id}`, promotionData);
        message.success('Акция обновлена');
      } else {
        await api.post('/promotions', promotionData);
        message.success('Акция создана');
      }

      setIsModalOpen(false);
      fetchPromotions();
    } catch (error) {
      message.error('Ошибка сохранения акции');
      console.error(error);
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 70,
    },
    {
      title: 'Название',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: 'Тип',
      dataIndex: 'type',
      key: 'type',
      width: 150,
      render: (type: string) => {
        const typeMap: Record<string, string> = {
          percent: 'Скидка %',
          fixed: 'Фикс. сумма',
          '3for2': '3 по цене 2',
        };
        return <Tag color="blue">{typeMap[type]}</Tag>;
      },
    },
    {
      title: 'Значение',
      dataIndex: 'value',
      key: 'value',
      width: 120,
      render: (value: number, record: Promotion) => {
        if (record.type === 'percent') return `${value}%`;
        if (record.type === 'fixed') return `${value} ₽`;
        return '-';
      },
    },
    {
      title: 'Категория',
      dataIndex: 'category',
      key: 'category',
      width: 150,
      render: (category?: string) => category ? <Tag>{category}</Tag> : '-',
    },
    {
      title: 'Период',
      key: 'period',
      width: 200,
      render: (_: any, record: Promotion) =>
        `${new Date(record.startDate).toLocaleDateString('ru-RU')} — ${new Date(record.endDate).toLocaleDateString('ru-RU')}`,
    },
    {
      title: 'Промокод',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      render: (code?: string) => code || '-',
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          active: 'green',
          paused: 'orange',
          ended: 'red',
        };
        const textMap: Record<string, string> = {
          active: 'Активна',
          paused: 'Пауза',
          ended: 'Завершена',
        };
        return <Tag color={colorMap[status]}>{textMap[status]}</Tag>;
      },
    },
    {
      title: 'Действия',
      key: 'actions',
      width: 150,
      fixed: 'right' as const,
      render: (_: any, record: Promotion) => (
        <Space>
          <Button
            type="text"
            icon={record.status === 'active' ? <StopOutlined /> : <PlayCircleOutlined />}
            onClick={() => handleToggleStatus(record.id)}
            disabled={record.status === 'ended'}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h1 style={{ margin: 0 }}>Акции и скидки</h1>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchPromotions}>
            Обновить
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            Создать акцию
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={promotions}
        rowKey="id"
        scroll={{ x: 1200 }}
        loading={loading}
      />

      <Modal
        title={editingPromotion ? 'Редактировать акцию' : 'Создать акцию'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        width={700}
        okText="Сохранить"
        cancelText="Отмена"
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Название акции"
            rules={[{ required: true, message: 'Введите название' }]}
          >
            <Input placeholder="Летняя распродажа" />
          </Form.Item>

          <Form.Item
            name="type"
            label="Тип скидки"
            rules={[{ required: true, message: 'Выберите тип' }]}
          >
            <Select placeholder="Выберите тип скидки">
              <Option value="percent">Скидка в процентах (%)</Option>
              <Option value="fixed">Фиксированная сумма (₽)</Option>
              <Option value="3for2">3 по цене 2</Option>
            </Select>
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.type !== currentValues.type}
          >
            {({ getFieldValue }) => {
              const type = getFieldValue('type');
              if (type === 'percent') {
                return (
                  <Form.Item name="value" label="Процент скидки">
                    <InputNumber
                      min={0}
                      max={100}
                      style={{ width: '100%' }}
                      addonAfter="%"
                    />
                  </Form.Item>
                );
              }
              if (type === 'fixed') {
                return (
                  <Form.Item name="value" label="Сумма скидки">
                    <InputNumber
                      min={0}
                      style={{ width: '100%' }}
                      formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
                      addonAfter="₽"
                    />
                  </Form.Item>
                );
              }
              return null;
            }}
          </Form.Item>

          <Form.Item name="category" label="Категория">
            <Select placeholder="Применить к категории" allowClear>
              {categories.map((cat) => (
                <Option key={cat.id} value={cat.name}>
                  {cat.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="dateRange"
            label="Период действия"
            rules={[{ required: true, message: 'Выберите период' }]}
          >
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="code" label="Промокод">
            <Input placeholder="SAVE2024 (необязательно)" />
          </Form.Item>

          <Form.Item name="status" label="Активировать сразу" valuePropName="checked" initialValue={true}>
            <Switch />
          </Form.Item>

          <Form.Item name="description" label="Описание">
            <TextArea rows={3} placeholder="Описание акции (необязательно)" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PromotionsPage;

