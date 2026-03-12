import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Popconfirm,
  Form,
  Input,
  Select,
  Switch,
  Upload,
  message,
  Image,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  EyeOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import { API_URL, api } from '../lib/api';

const { Option } = Select;

interface Banner {
  id: number;
  title: string;
  subtitle?: string;
  imageUrl: string;
  link?: string;
  device: 'desktop' | 'mobile' | 'all';
  position: 'main' | 'sidebar' | 'footer';
  order: number;
  isActive: boolean;
}

const BannersPage: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [previewImage, setPreviewImage] = useState<string>('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const response = await api.get('/banners/admin');
      setBanners(response.data);
    } catch (error) {
      message.error('Ошибка загрузки баннеров');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingBanner(null);
    form.resetFields();
    setFileList([]);
    setIsModalOpen(true);
  };

  const handleEdit = (record: Banner) => {
    setEditingBanner(record);
    form.setFieldsValue(record);
    setFileList([]);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/banners/${id}`);
      message.success('Баннер удален');
      fetchBanners();
    } catch (error: any) {
      const serverMessage = error?.response?.data?.message;
      message.error(
        Array.isArray(serverMessage)
          ? serverMessage.join(', ')
          : serverMessage || 'Ошибка удаления баннера',
      );
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await api.put(`/banners/${id}/toggle`);
      message.success('Статус баннера изменен');
      fetchBanners();
    } catch (error) {
      message.error('Ошибка изменения статуса');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (!editingBanner && fileList.length === 0) {
        message.error('Для создания баннера загрузите изображение');
        return;
      }

      const formData = new FormData();
      formData.append('title', values.title);
      if (values.subtitle) formData.append('subtitle', values.subtitle);
      if (values.link) formData.append('link', values.link);
      formData.append('device', values.device);
      formData.append('position', values.position);
      formData.append('order', values.order.toString());
      formData.append('isActive', values.isActive.toString());

      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append('image', fileList[0].originFileObj);
      } else if (editingBanner) {
        formData.append('imageUrl', editingBanner.imageUrl);
      }

      if (editingBanner) {
        await api.put(`/banners/${editingBanner.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        message.success('Баннер обновлен');
      } else {
        await api.post('/banners', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        message.success('Баннер создан');
      }

      setIsModalOpen(false);
      fetchBanners();
    } catch (error: any) {
      const serverMessage = error?.response?.data?.message;
      message.error(Array.isArray(serverMessage) ? serverMessage.join(', ') : serverMessage || 'Ошибка сохранения баннера');
      console.error(error);
    }
  };

  const handlePreview = (imageUrl: string) => {
    setPreviewImage(`${API_URL}${imageUrl}`);
    setPreviewOpen(true);
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 70,
    },
    {
      title: 'Превью',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      width: 120,
      render: (imageUrl: string) => (
        <div
          style={{
            width: 100,
            height: 60,
            background: '#f0f0f0',
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            overflow: 'hidden',
          }}
          onClick={() => handlePreview(imageUrl)}
        >
          {imageUrl ? (
            <img
              src={`${API_URL}${imageUrl}`}
              alt="Banner"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <EyeOutlined style={{ fontSize: 24, color: '#999' }} />
          )}
        </div>
      ),
    },
    {
      title: 'Название',
      dataIndex: 'title',
      key: 'title',
      width: 200,
    },
    {
      title: 'Позиция',
      dataIndex: 'position',
      key: 'position',
      width: 120,
      render: (position: string) => {
        const positionMap: Record<string, { text: string; color: string }> = {
          main: { text: 'Главная', color: 'blue' },
          sidebar: { text: 'Сайдбар', color: 'cyan' },
          footer: { text: 'Футер', color: 'purple' },
        };
        return <Tag color={positionMap[position]?.color}>{positionMap[position]?.text}</Tag>;
      },
    },
    {
      title: 'Устройство',
      dataIndex: 'device',
      key: 'device',
      width: 120,
      render: (device: string) => {
        const deviceMap: Record<string, { text: string; color: string }> = {
          all: { text: 'Все', color: 'green' },
          desktop: { text: 'Desktop', color: 'geekblue' },
          mobile: { text: 'Mobile', color: 'orange' },
        };
        return <Tag color={deviceMap[device]?.color}>{deviceMap[device]?.text}</Tag>;
      },
    },
    {
      title: 'Порядок',
      dataIndex: 'order',
      key: 'order',
      width: 100,
    },
    {
      title: 'Ссылка',
      dataIndex: 'link',
      key: 'link',
      width: 200,
      ellipsis: true,
    },
    {
      title: 'Статус',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 120,
      render: (isActive: boolean, record: Banner) => (
        <Switch
          checked={isActive}
          onChange={() => handleToggleStatus(record.id)}
          checkedChildren="Вкл"
          unCheckedChildren="Выкл"
        />
      ),
    },
    {
      title: 'Действия',
      key: 'actions',
      width: 120,
      fixed: 'right' as const,
      render: (_: any, record: Banner) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Popconfirm
            title="Удалить баннер?"
            description="Вы уверены что хотите удалить этот баннер?"
            okText="Да"
            cancelText="Нет"
            okButtonProps={{ danger: true }}
            onConfirm={() => handleDelete(record.id)}
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
        <h1 style={{ margin: 0 }}>Баннеры</h1>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchBanners}>
            Обновить
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            Добавить баннер
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={banners}
        rowKey="id"
        scroll={{ x: 1200 }}
        loading={loading}
      />

      <Modal
        title={editingBanner ? 'Редактировать баннер' : 'Создать баннер'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        width={700}
        okText="Сохранить"
        cancelText="Отмена"
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="title"
            label="Название"
            rules={[{ required: true, message: 'Введите название' }]}
          >
            <Input placeholder="Летняя распродажа" />
          </Form.Item>

          <Form.Item name="subtitle" label="Подзаголовок">
            <Input placeholder="Скидки до 50%" />
          </Form.Item>

          <Form.Item label="Изображение">
            <Upload
              listType="picture-card"
              maxCount={1}
              fileList={fileList}
              onChange={({ fileList }) => setFileList(fileList)}
              beforeUpload={() => false}
            >
              {fileList.length === 0 && (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Загрузить</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          <Form.Item
            name="position"
            label="Позиция на сайте"
            rules={[{ required: true, message: 'Выберите позицию' }]}
            initialValue="main"
          >
            <Select>
              <Option value="main">Главная страница</Option>
              <Option value="sidebar">Сайдбар</Option>
              <Option value="footer">Футер</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="device"
            label="Устройство"
            rules={[{ required: true, message: 'Выберите устройство' }]}
            initialValue="all"
          >
            <Select>
              <Option value="all">Все устройства</Option>
              <Option value="desktop">Только Desktop</Option>
              <Option value="mobile">Только Mobile</Option>
            </Select>
          </Form.Item>

          <Form.Item name="link" label="Ссылка">
            <Input placeholder="/catalog?category=sale" />
          </Form.Item>

          <Form.Item
            name="order"
            label="Порядок отображения"
            initialValue={1}
            rules={[{ required: true, message: 'Введите порядок' }]}
          >
            <Input type="number" min={1} />
          </Form.Item>

          <Form.Item
            name="isActive"
            label="Активировать сразу"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={previewOpen}
        footer={null}
        onCancel={() => setPreviewOpen(false)}
      >
        <Image
          alt="Banner preview"
          style={{ width: '100%' }}
          src={previewImage}
          preview={false}
        />
      </Modal>
    </div>
  );
};

export default BannersPage;

