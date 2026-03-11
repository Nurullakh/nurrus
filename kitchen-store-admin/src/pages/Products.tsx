import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Input,
  Space,
  Tag,
  Modal,
  Form,
  InputNumber,
  Select,
  Upload,
  Switch,
  message,
  Popconfirm,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import axios from 'axios';

const { TextArea } = Input;
const { Option } = Select;

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  brand: string;
  images: string[];
  is_available: boolean;
  rating?: number;
  reviews_count?: number;
  specifications?: any;
}

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [form] = Form.useForm();

  const API_URL = 'http://localhost:3001';

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [pagination.current, searchText]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/products`, {
        params: {
          page: pagination.current,
          limit: pagination.pageSize,
          search: searchText || undefined,
        },
      });
      setProducts(response.data.data);
      setPagination({ ...pagination, total: response.data.total });
    } catch (error) {
      message.error('Ошибка загрузки товаров');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error('Ошибка загрузки категорий:', error);
    }
  };

  const handleCreate = () => {
    setEditingProduct(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (record: Product) => {
    setEditingProduct(record);
    form.setFieldsValue({
      ...record,
      specifications: JSON.stringify(record.specifications || {}, null, 2),
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`${API_URL}/products/${id}`);
      message.success('Товар удален');
      fetchProducts();
    } catch (error) {
      message.error('Ошибка удаления товара');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('description', values.description);
      formData.append('price', values.price.toString());
      formData.append('category', values.category);
      formData.append('brand', values.brand);
      formData.append('specifications', values.specifications || '{}');

      if (values.images?.fileList) {
        values.images.fileList.forEach((file: any) => {
          if (file.originFileObj) {
            formData.append('images', file.originFileObj);
          }
        });
      }

      if (editingProduct) {
        await axios.put(`${API_URL}/products/${editingProduct.id}`, formData);
        message.success('Товар обновлен');
      } else {
        await axios.post(`${API_URL}/products`, formData);
        message.success('Товар создан');
      }

      setIsModalOpen(false);
      fetchProducts();
    } catch (error) {
      message.error('Ошибка сохранения товара');
    }
  };

  const handleExport = () => {
    message.info('Экспорт в разработке');
  };

  const handleImport = () => {
    message.info('Импорт в разработке');
  };

  const columns: ColumnsType<Product> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 70,
    },
    {
      title: 'Фото',
      dataIndex: 'images',
      key: 'images',
      width: 80,
      render: (images: string[]) => (
        images && images.length > 0 ? (
          <img
            src={`${API_URL}/uploads/${images[0]}`}
            alt="product"
            style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }}
          />
        ) : (
          <div style={{ width: 50, height: 50, background: '#f0f0f0', borderRadius: 4 }} />
        )
      ),
    },
    {
      title: 'Название',
      dataIndex: 'name',
      key: 'name',
      width: 250,
    },
    {
      title: 'Категория',
      dataIndex: 'category',
      key: 'category',
      width: 150,
      render: (category: string) => <Tag color="blue">{category}</Tag>,
    },
    {
      title: 'Цена',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      render: (price: number) => `${price?.toLocaleString('ru-RU')} ₽`,
    },
    {
      title: 'Бренд',
      dataIndex: 'brand',
      key: 'brand',
      width: 120,
    },
    {
      title: 'Статус',
      dataIndex: 'is_available',
      key: 'is_available',
      width: 120,
      render: (available: boolean) => (
        <Tag color={available ? 'green' : 'red'}>
          {available ? 'В наличии' : 'Нет в наличии'}
        </Tag>
      ),
    },
    {
      title: 'Действия',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Удалить товар?"
            onConfirm={() => handleDelete(record.id)}
            okText="Да"
            cancelText="Нет"
          >
            <Button type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h1 style={{ margin: 0 }}>Товары</h1>
        <Space>
          <Button icon={<UploadOutlined />} onClick={handleImport}>
            Импорт
          </Button>
          <Button icon={<DownloadOutlined />} onClick={handleExport}>
            Экспорт
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            Добавить товар
          </Button>
        </Space>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Input
          placeholder="Поиск товаров..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300 }}
        />
      </div>

      <Table
        columns={columns}
        dataSource={products}
        loading={loading}
        rowKey="id"
        pagination={{
          ...pagination,
          onChange: (page, pageSize) => {
            setPagination({ ...pagination, current: page, pageSize: pageSize || 10 });
          },
        }}
        scroll={{ x: 1200 }}
      />

      <Modal
        title={editingProduct ? 'Редактировать товар' : 'Создать товар'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        width={800}
        okText="Сохранить"
        cancelText="Отмена"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="Название"
            rules={[{ required: true, message: 'Введите название' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="description"
            label="Описание"
            rules={[{ required: true, message: 'Введите описание' }]}
          >
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name="price"
            label="Цена"
            rules={[{ required: true, message: 'Введите цену' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
            />
          </Form.Item>

          <Form.Item
            name="category"
            label="Категория"
            rules={[{ required: true, message: 'Выберите категорию' }]}
          >
            <Select placeholder="Выберите категорию">
              {categories.map((cat) => (
                <Option key={cat.id} value={cat.name}>
                  {cat.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="brand"
            label="Бренд"
            rules={[{ required: true, message: 'Введите бренд' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="specifications"
            label="Характеристики (JSON)"
          >
            <TextArea rows={4} placeholder='{"материал": "дерево", "цвет": "белый"}' />
          </Form.Item>

          <Form.Item
            name="images"
            label="Изображения"
            valuePropName="file"
          >
            <Upload
              listType="picture-card"
              maxCount={10}
              beforeUpload={() => false}
              multiple
            >
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Загрузить</div>
              </div>
            </Upload>
          </Form.Item>

          <Form.Item
            name="is_available"
            label="В наличии"
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

export default ProductsPage;

