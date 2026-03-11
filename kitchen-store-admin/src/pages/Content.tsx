import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Switch,
  message,
  Select,
  Popconfirm,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ReloadOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import axios from 'axios';

const { TextArea } = Input;
const { Option } = Select;

const API_URL = 'http://localhost:3001';

interface ContentPage {
  id: number;
  title: string;
  slug: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  isPublished: boolean;
  pageType: 'about' | 'contacts' | 'delivery' | 'payment' | 'privacy' | 'terms' | 'custom';
  createdAt: string;
  updatedAt: string;
}

const ContentPage: React.FC = () => {
  const [pages, setPages] = useState<ContentPage[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<ContentPage | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/content`);
      setPages(response.data);
    } catch (error) {
      message.error('Ошибка загрузки страниц');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingPage(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (record: ContentPage) => {
    setEditingPage(record);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`${API_URL}/content/${id}`);
      message.success('Страница удалена');
      fetchPages();
    } catch (error) {
      message.error('Ошибка удаления страницы');
      console.error(error);
    }
  };

  const handleTogglePublish = async (id: number) => {
    try {
      await axios.put(`${API_URL}/content/${id}/toggle`);
      message.success('Статус публикации изменен');
      fetchPages();
    } catch (error) {
      message.error('Ошибка изменения статуса');
      console.error(error);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingPage) {
        await axios.put(`${API_URL}/content/${editingPage.id}`, values);
        message.success('Страница обновлена');
      } else {
        await axios.post(`${API_URL}/content`, values);
        message.success('Страница создана');
      }
      setIsModalOpen(false);
      fetchPages();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Ошибка сохранения страницы');
      console.error(error);
    }
  };

  const pageTypeMap: Record<ContentPage['pageType'], { text: string; color: string }> = {
    about: { text: 'О нас', color: 'blue' },
    contacts: { text: 'Контакты', color: 'cyan' },
    delivery: { text: 'Доставка', color: 'green' },
    payment: { text: 'Оплата', color: 'orange' },
    privacy: { text: 'Политика', color: 'purple' },
    terms: { text: 'Условия', color: 'magenta' },
    custom: { text: 'Другое', color: 'default' },
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 70,
    },
    {
      title: 'Заголовок',
      dataIndex: 'title',
      key: 'title',
      width: 250,
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
      width: 200,
      render: (slug: string) => <Tag color="blue">{slug}</Tag>,
    },
    {
      title: 'Тип',
      dataIndex: 'pageType',
      key: 'pageType',
      width: 150,
      render: (type: ContentPage['pageType']) => (
        <Tag color={pageTypeMap[type]?.color}>{pageTypeMap[type]?.text}</Tag>
      ),
    },
    {
      title: 'Статус',
      dataIndex: 'isPublished',
      key: 'isPublished',
      width: 120,
      render: (isPublished: boolean, record: ContentPage) => (
        <Switch
          checked={isPublished}
          onChange={() => handleTogglePublish(record.id)}
          checkedChildren="Опубликована"
          unCheckedChildren="Черновик"
        />
      ),
    },
    {
      title: 'Обновлена',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 150,
      render: (date: string) => new Date(date).toLocaleDateString('ru-RU'),
    },
    {
      title: 'Действия',
      key: 'actions',
      width: 150,
      fixed: 'right' as const,
      render: (_: any, record: ContentPage) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => window.open(`/pages/${record.slug}`, '_blank')}
            title="Просмотр"
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Удалить страницу?"
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

  return (
    <div>
      <div
        style={{
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <FileTextOutlined style={{ fontSize: 24 }} />
          <h1 style={{ margin: 0 }}>Контент страниц</h1>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchPages}>
            Обновить
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            Создать страницу
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={pages}
        rowKey="id"
        scroll={{ x: 1200 }}
        loading={loading}
      />

      <Modal
        title={editingPage ? 'Редактировать страницу' : 'Создать страницу'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        width={900}
        okText="Сохранить"
        cancelText="Отмена"
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="title"
            label="Заголовок"
            rules={[{ required: true, message: 'Введите заголовок' }]}
          >
            <Input placeholder="О компании" />
          </Form.Item>

          <Form.Item
            name="slug"
            label="Slug (URL)"
            rules={[
              { required: true, message: 'Введите slug' },
              {
                pattern: /^[a-z0-9-]+$/,
                message: 'Только латиница, цифры и дефис',
              },
            ]}
          >
            <Input placeholder="about-us" />
          </Form.Item>

          <Form.Item
            name="pageType"
            label="Тип страницы"
            rules={[{ required: true, message: 'Выберите тип' }]}
          >
            <Select placeholder="Выберите тип страницы">
              <Option value="about">О нас</Option>
              <Option value="contacts">Контакты</Option>
              <Option value="delivery">Доставка</Option>
              <Option value="payment">Оплата</Option>
              <Option value="privacy">Политика конфиденциальности</Option>
              <Option value="terms">Условия использования</Option>
              <Option value="custom">Другое</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="content"
            label="Контент страницы"
            rules={[{ required: true, message: 'Введите контент' }]}
          >
            <TextArea
              rows={12}
              placeholder="Введите текст страницы (поддерживается HTML)"
            />
          </Form.Item>

          <Form.Item name="metaTitle" label="Meta Title (SEO)">
            <Input placeholder="Заголовок для поисковиков" />
          </Form.Item>

          <Form.Item name="metaDescription" label="Meta Description (SEO)">
            <TextArea
              rows={2}
              placeholder="Описание для поисковиков (до 160 символов)"
              maxLength={160}
              showCount
            />
          </Form.Item>

          <Form.Item
            name="isPublished"
            label="Опубликовать"
            valuePropName="checked"
            initialValue={false}
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ContentPage;


