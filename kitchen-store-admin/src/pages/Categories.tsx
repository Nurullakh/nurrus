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
  Switch,
  Upload,
  message,
  Select,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import { API_URL, api } from '../lib/api';

const { TextArea } = Input;
const { Option } = Select;

interface Category {
  id: number;
  name: string;
  slug: string;
  parentId?: number;
  order: number;
  productCount: number;
  description?: string;
  image?: string;
  isActive: boolean;
}

const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (error) {
      message.error('Ошибка загрузки категорий');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingCategory(null);
    form.resetFields();
    setFileList([]);
    setIsModalOpen(true);
  };

  const handleEdit = (record: Category) => {
    setEditingCategory(record);
    form.setFieldsValue(record);
    setFileList([]);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: 'Удалить категорию?',
      content: 'Вы уверены что хотите удалить эту категорию?',
      okText: 'Да',
      cancelText: 'Нет',
      okType: 'danger',
      onOk: async () => {
        try {
          await api.delete(`/categories/${id}`);
          message.success('Категория удалена');
          fetchCategories();
        } catch (error: any) {
          message.error(error.response?.data?.message || 'Ошибка удаления категории');
        }
      },
    });
  };

  const handleSubmit = async (values: any) => {
    try {
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('slug', values.slug);
      if (values.parentId) formData.append('parentId', values.parentId.toString());
      formData.append('order', values.order?.toString() || '1');
      if (values.description) formData.append('description', values.description);
      formData.append('isActive', values.isActive?.toString() || 'true');

      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append('image', fileList[0].originFileObj);
      } else if (editingCategory && editingCategory.image) {
        formData.append('image', editingCategory.image);
      }

      if (editingCategory) {
        await api.put(`/categories/${editingCategory.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        message.success('Категория обновлена');
      } else {
        await api.post('/categories', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        message.success('Категория создана');
      }

      setIsModalOpen(false);
      fetchCategories();
    } catch (error) {
      message.error('Ошибка сохранения категории');
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
      title: 'Изображение',
      dataIndex: 'image',
      key: 'image',
      width: 100,
      render: (image: string) => (
        <div
          style={{
            width: 60,
            height: 60,
            background: '#f0f0f0',
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {image ? (
            <img
              src={`${API_URL}${image}`}
              alt="Category"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            '-'
          )}
        </div>
      ),
    },
    {
      title: 'Название',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
      width: 150,
      render: (slug: string) => <Tag color="blue">{slug}</Tag>,
    },
    {
      title: 'Родитель',
      dataIndex: 'parentId',
      key: 'parentId',
      width: 120,
      render: (parentId?: number) => {
        if (!parentId) return '-';
        const parent = categories.find(c => c.id === parentId);
        return parent ? <Tag>{parent.name}</Tag> : '-';
      },
    },
    {
      title: 'Порядок',
      dataIndex: 'order',
      key: 'order',
      width: 100,
    },
    {
      title: 'Товаров',
      dataIndex: 'productCount',
      key: 'productCount',
      width: 100,
      align: 'center' as const,
    },
    {
      title: 'Статус',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Активна' : 'Неактивна'}
        </Tag>
      ),
    },
    {
      title: 'Действия',
      key: 'actions',
      width: 120,
      fixed: 'right' as const,
      render: (_: any, record: Category) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
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

  const parentCategories = categories.filter(cat => !cat.parentId);

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h1 style={{ margin: 0 }}>Категории</h1>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchCategories}>
            Обновить
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            Добавить категорию
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={categories}
        rowKey="id"
        scroll={{ x: 1200 }}
        loading={loading}
      />

      <Modal
        title={editingCategory ? 'Редактировать категорию' : 'Создать категорию'}
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
            label="Название категории"
            rules={[{ required: true, message: 'Введите название' }]}
          >
            <Input placeholder="Кухни" />
          </Form.Item>

          <Form.Item
            name="slug"
            label="Slug (URL)"
            rules={[{ required: true, message: 'Введите slug' }]}
          >
            <Input placeholder="kuhni" />
          </Form.Item>

          <Form.Item name="parentId" label="Родительская категория">
            <Select placeholder="Выберите родителя (необязательно)" allowClear>
              {parentCategories.map(cat => (
                <Option key={cat.id} value={cat.id}>
                  {cat.name}
                </Option>
              ))}
            </Select>
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
            name="order"
            label="Порядок отображения"
            initialValue={1}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="description" label="Описание">
            <TextArea rows={3} placeholder="Описание категории" />
          </Form.Item>

          <Form.Item
            name="isActive"
            label="Активна"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CategoriesPage;

