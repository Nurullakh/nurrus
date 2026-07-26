import React, { useRef, useState, useEffect } from 'react';
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
import type { UploadFile } from 'antd/es/upload/interface';
import { API_URL, api } from '../lib/api';
import { getCurrentAdminUser } from '../lib/auth';

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
  specifications?: Record<string, unknown>;
  ownerId?: number | null;
  moderationStatus?: 'draft' | 'pending' | 'approved' | 'rejected';
  moderationComment?: string | null;
}

interface Category {
  id: number;
  name: string;
}

interface ProductFormValues {
  name: string;
  description: string;
  price: number;
  category: string;
  brand: string;
  specifications?: string;
  images?: UploadFile[];
  is_available?: boolean;
}

type BulkPriceStockFormValues = {
  priceMode?: 'set' | 'delta';
  priceValue?: number;
  stockMode?: 'set' | 'delta';
  stockValue?: number;
};

const ProductsPage: React.FC = () => {
  const currentUser = getCurrentAdminUser();
  const isAdmin = currentUser?.role === 'admin';
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchText, setSearchText] = useState('');
  const [moderationFilter, setModerationFilter] = useState<string | undefined>();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [form] = Form.useForm();
  const [bulkForm] = Form.useForm<BulkPriceStockFormValues>();
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [isBulkPriceStockModalOpen, setIsBulkPriceStockModalOpen] = useState(false);
  const [isBulkRejectModalOpen, setIsBulkRejectModalOpen] = useState(false);
  const [bulkRejectReason, setBulkRejectReason] = useState('');
  const importInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [pagination.current, searchText, moderationFilter]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/products/admin/list', {
        params: {
          page: pagination.current,
          limit: pagination.pageSize,
          search: searchText || undefined,
          moderationStatus: moderationFilter || undefined,
        },
      });
      setProducts(response.data.data);
      setPagination((prev) => ({ ...prev, total: response.data.total }));
    } catch (error) {
      message.error('Ошибка загрузки товаров');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch {
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
      await api.delete(`/products/${id}`);
      message.success('Товар удален');
      fetchProducts();
    } catch (error) {
      message.error('Ошибка удаления товара');
    }
  };

  const handleSubmitForModeration = async (id: number) => {
    try {
      await api.post(`/products/${id}/submit-moderation`);
      message.success('Товар отправлен на модерацию');
      fetchProducts();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Ошибка отправки на модерацию');
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await api.put(`/products/admin/${id}/approve`);
      message.success('Товар одобрен');
      fetchProducts();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Ошибка одобрения');
    }
  };

  const handleReject = async (id: number, reason?: string) => {
    try {
      await api.put(`/products/admin/${id}/reject`, { reason });
      message.success('Товар отклонен');
      fetchProducts();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Ошибка отклонения');
    }
  };

  const handleBulkSubmitForModeration = async () => {
    if (!selectedProductIds.length) {
      message.warning('Выберите товары');
      return;
    }

    try {
      await api.post('/products/admin/bulk/submit-moderation', {
        productIds: selectedProductIds,
      });
      message.success('Товары отправлены на модерацию');
      setSelectedProductIds([]);
      fetchProducts();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Ошибка массовой отправки');
    }
  };

  const handleBulkApprove = async () => {
    if (!selectedProductIds.length) {
      message.warning('Выберите товары');
      return;
    }

    try {
      await api.put('/products/admin/bulk/approve', {
        productIds: selectedProductIds,
      });
      message.success('Товары одобрены');
      setSelectedProductIds([]);
      fetchProducts();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Ошибка массового одобрения');
    }
  };

  const handleBulkReject = async () => {
    if (!selectedProductIds.length) {
      message.warning('Выберите товары');
      return;
    }

    try {
      await api.put('/products/admin/bulk/reject', {
        productIds: selectedProductIds,
        reason: bulkRejectReason || undefined,
      });
      message.success('Товары отклонены');
      setIsBulkRejectModalOpen(false);
      setBulkRejectReason('');
      setSelectedProductIds([]);
      fetchProducts();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Ошибка массового отклонения');
    }
  };

  const handleBulkUpdatePriceStock = async (values: BulkPriceStockFormValues) => {
    if (!selectedProductIds.length) {
      message.warning('Выберите товары');
      return;
    }

    try {
      await api.put('/products/admin/bulk/price-stock', {
        productIds: selectedProductIds,
        priceMode: values.priceMode,
        priceValue: values.priceValue,
        stockMode: values.stockMode,
        stockValue: values.stockValue,
      });
      message.success('Массовое обновление выполнено');
      setIsBulkPriceStockModalOpen(false);
      bulkForm.resetFields();
      setSelectedProductIds([]);
      fetchProducts();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Ошибка массового обновления');
    }
  };

  const handleSubmit = async (values: ProductFormValues) => {
    try {
      if (values.specifications) {
        JSON.parse(values.specifications);
      }

      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('description', values.description);
      formData.append('price', values.price.toString());
      formData.append('category', values.category);
      formData.append('brand', values.brand);
      formData.append('specifications', values.specifications || '{}');

      if (values.images) {
        values.images.forEach((file) => {
          if (file.originFileObj) {
            formData.append('images', file.originFileObj);
          }
        });
      }

      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        message.success('Товар обновлен');
      } else {
        await api.post('/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        message.success('Товар создан');
      }

      setIsModalOpen(false);
      fetchProducts();
    } catch (error) {
      message.error('Ошибка сохранения товара. Проверь JSON характеристик');
    }
  };

  const handleExport = async () => {
    try {
      const response = await api.get('/products/admin/export', {
        params: {
          search: searchText || undefined,
          moderationStatus: moderationFilter || undefined,
        },
        responseType: 'blob',
      });

      const blob = new Blob([response.data], {
        type: 'text/csv;charset=utf-8;',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `products-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      message.success('Экспорт выполнен');
    } catch {
      message.error('Ошибка экспорта');
    }
  };

  const handleImport = () => {
    importInputRef.current?.click();
  };

  const handleImportFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/products/admin/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const errors = response.data?.errors as string[] | undefined;
      if (errors?.length) {
        message.warning(
          `Импортированo: ${response.data?.createdCount}. Ошибок: ${errors.length}`,
        );
      } else {
        message.success(`Импортировано товаров: ${response.data?.createdCount || 0}`);
      }
      fetchProducts();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Ошибка импорта');
    }
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
      title: 'Модерация',
      dataIndex: 'moderationStatus',
      key: 'moderationStatus',
      width: 170,
      render: (status: Product['moderationStatus'], record: Product) => {
        const colorMap: Record<string, string> = {
          draft: 'default',
          pending: 'gold',
          approved: 'green',
          rejected: 'red',
        };
        const textMap: Record<string, string> = {
          draft: 'Черновик',
          pending: 'На модерации',
          approved: 'Одобрен',
          rejected: 'Отклонен',
        };
        return (
          <div>
            <Tag color={colorMap[status || 'draft']}>
              {textMap[status || 'draft']}
            </Tag>
            {record.moderationComment ? (
              <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>
                {record.moderationComment}
              </div>
            ) : null}
          </div>
        );
      },
    },
    {
      title: 'Действия',
      key: 'actions',
      width: 260,
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
          {!isAdmin &&
          (record.moderationStatus === 'draft' ||
            record.moderationStatus === 'rejected') ? (
            <Button type="link" onClick={() => handleSubmitForModeration(record.id)}>
              На модерацию
            </Button>
          ) : null}
          {isAdmin && record.moderationStatus === 'pending' ? (
            <>
              <Button type="link" onClick={() => handleApprove(record.id)}>
                Одобрить
              </Button>
              <Button
                type="link"
                danger
                onClick={() => {
                  let reason = '';
                  Modal.confirm({
                    title: 'Отклонить товар',
                    content: (
                      <Input.TextArea
                        rows={3}
                        placeholder="Причина отклонения"
                        onChange={(event) => {
                          reason = event.target.value;
                        }}
                      />
                    ),
                    onOk: () => handleReject(record.id, reason),
                    okText: 'Отклонить',
                    cancelText: 'Отмена',
                    okButtonProps: { danger: true },
                  });
                }}
              >
                Отклонить
              </Button>
            </>
          ) : null}
        </Space>
      ),
    },
  ];

  if (isAdmin) {
    columns.splice(columns.length - 1, 0, {
      title: 'Владелец',
      dataIndex: 'ownerId',
      key: 'ownerId',
      width: 120,
      render: (ownerId: number | null | undefined) =>
        ownerId ? `#${ownerId}` : 'Система',
    });
  }

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h1 style={{ margin: 0 }}>{isAdmin ? 'Товары' : 'Мои товары'}</h1>
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
      <input
        ref={importInputRef}
        type="file"
        accept=".csv,text/csv"
        style={{ display: 'none' }}
        onChange={handleImportFileChange}
      />

      <div style={{ marginBottom: 12 }}>
        <Space wrap>
          <Tag color={selectedProductIds.length ? 'blue' : 'default'}>
            Выбрано: {selectedProductIds.length}
          </Tag>
          {!isAdmin ? (
            <Button
              disabled={!selectedProductIds.length}
              onClick={handleBulkSubmitForModeration}
            >
              Массово на модерацию
            </Button>
          ) : (
            <>
              <Button disabled={!selectedProductIds.length} onClick={handleBulkApprove}>
                Массово одобрить
              </Button>
              <Button
                danger
                disabled={!selectedProductIds.length}
                onClick={() => setIsBulkRejectModalOpen(true)}
              >
                Массово отклонить
              </Button>
            </>
          )}
          <Button
            disabled={!selectedProductIds.length}
            onClick={() => setIsBulkPriceStockModalOpen(true)}
          >
            Массово изменить цену/остаток
          </Button>
          <Button disabled={!selectedProductIds.length} onClick={() => setSelectedProductIds([])}>
            Сбросить выбор
          </Button>
        </Space>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Space>
          <Input
            placeholder="Поиск товаров..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
          <Select
            allowClear
            placeholder="Фильтр модерации"
            value={moderationFilter}
            onChange={(value) => setModerationFilter(value)}
            style={{ width: 220 }}
          >
            <Option value="draft">Черновик</Option>
            <Option value="pending">На модерации</Option>
            <Option value="approved">Одобрен</Option>
            <Option value="rejected">Отклонен</Option>
          </Select>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={products}
        loading={loading}
        rowKey="id"
        rowSelection={{
          selectedRowKeys: selectedProductIds,
          onChange: (keys) => setSelectedProductIds(keys as number[]),
        }}
        pagination={{
          ...pagination,
          onChange: (page, pageSize) => {
            setPagination((prev) => ({
              ...prev,
              current: page,
              pageSize: pageSize || 10,
            }));
          },
        }}
        scroll={{ x: 1200 }}
      />

      <Modal
        title="Массовое изменение цены и остатка"
        open={isBulkPriceStockModalOpen}
        onCancel={() => setIsBulkPriceStockModalOpen(false)}
        onOk={() => bulkForm.submit()}
        okText="Применить"
        cancelText="Отмена"
      >
        <Form<BulkPriceStockFormValues>
          form={bulkForm}
          layout="vertical"
          onFinish={handleBulkUpdatePriceStock}
        >
          <Form.Item name="priceMode" label="Режим изменения цены">
            <Select allowClear placeholder="Не менять цену">
              <Option value="set">Установить значение</Option>
              <Option value="delta">Изменить на значение (+/-)</Option>
            </Select>
          </Form.Item>
          <Form.Item name="priceValue" label="Значение цены">
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="stockMode" label="Режим изменения остатка">
            <Select allowClear placeholder="Не менять остаток">
              <Option value="set">Установить значение</Option>
              <Option value="delta">Изменить на значение (+/-)</Option>
            </Select>
          </Form.Item>
          <Form.Item name="stockValue" label="Значение остатка">
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Массовое отклонение товаров"
        open={isBulkRejectModalOpen}
        onCancel={() => setIsBulkRejectModalOpen(false)}
        onOk={handleBulkReject}
        okText="Отклонить"
        cancelText="Отмена"
        okButtonProps={{ danger: true }}
      >
        <Input.TextArea
          rows={4}
          placeholder="Причина отклонения (опционально)"
          value={bulkRejectReason}
          onChange={(event) => setBulkRejectReason(event.target.value)}
        />
      </Modal>

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
            valuePropName="fileList"
            getValueFromEvent={(event) => event?.fileList}
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

