import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  Upload,
  message,
  Avatar,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  StopOutlined,
  CheckCircleOutlined,
  UploadOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import { API_URL, api } from '../lib/api';

const { Option } = Select;

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  status: string;
  avatar?: string;
  address?: string;
  registeredAt: string;
}

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      message.error('Ошибка загрузки пользователей');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingUser(null);
    form.resetFields();
    setFileList([]);
    setIsModalOpen(true);
  };

  const handleEdit = (record: User) => {
    setEditingUser(record);
    form.setFieldsValue(record);
    setFileList([]);
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await api.put(`/users/${id}/toggle-status`);
      message.success('Статус пользователя изменен');
      fetchUsers();
    } catch (error) {
      message.error('Ошибка изменения статуса');
    }
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: 'Удалить пользователя?',
      content: 'Вы уверены что хотите удалить этого пользователя?',
      okText: 'Да',
      cancelText: 'Нет',
      okType: 'danger',
      onOk: async () => {
        try {
          await api.delete(`/users/${id}`);
          message.success('Пользователь удален');
          fetchUsers();
        } catch (error) {
          message.error('Ошибка удаления пользователя');
        }
      },
    });
  };

  const handleSubmit = async (values: any) => {
    try {
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('email', values.email);
      if (values.password) formData.append('password', values.password);
      if (values.phone) formData.append('phone', values.phone);
      formData.append('role', values.role || 'customer');
      formData.append('status', values.status || 'active');
      if (values.address) formData.append('address', values.address);

      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append('avatar', fileList[0].originFileObj);
      } else if (editingUser && editingUser.avatar) {
        formData.append('avatar', editingUser.avatar);
      }

      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        message.success('Пользователь обновлен');
      } else {
        await api.post('/users', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        message.success('Пользователь создан');
      }

      setIsModalOpen(false);
      fetchUsers();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Ошибка сохранения пользователя');
      console.error(error);
    }
  };

  const roleColors: Record<string, string> = {
    admin: 'red',
    manager: 'orange',
    customer: 'blue',
  };

  const roleTexts: Record<string, string> = {
    admin: 'Администратор',
    manager: 'Менеджер',
    customer: 'Клиент',
  };

  const statusColors: Record<string, string> = {
    active: 'green',
    blocked: 'red',
  };

  const statusTexts: Record<string, string> = {
    active: 'Активен',
    blocked: 'Заблокирован',
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 70,
    },
    {
      title: 'Аватар',
      dataIndex: 'avatar',
      key: 'avatar',
      width: 80,
      render: (avatar: string, record: User) => (
        <Avatar
          size={48}
          src={avatar ? `${API_URL}${avatar}` : undefined}
          icon={!avatar && <UserOutlined />}
        >
          {!avatar && record.name[0]?.toUpperCase()}
        </Avatar>
      ),
    },
    {
      title: 'Имя',
      dataIndex: 'name',
      key: 'name',
      width: 180,
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 220,
    },
    {
      title: 'Телефон',
      dataIndex: 'phone',
      key: 'phone',
      width: 150,
      render: (phone?: string) => phone || '-',
    },
    {
      title: 'Роль',
      dataIndex: 'role',
      key: 'role',
      width: 140,
      render: (role: string) => (
        <Tag color={roleColors[role]}>{roleTexts[role] || role}</Tag>
      ),
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status: string) => (
        <Tag color={statusColors[status]}>{statusTexts[status] || status}</Tag>
      ),
    },
    {
      title: 'Регистрация',
      dataIndex: 'registeredAt',
      key: 'registeredAt',
      width: 120,
      render: (date: string) => new Date(date).toLocaleDateString('ru-RU'),
    },
    {
      title: 'Действия',
      key: 'actions',
      width: 150,
      fixed: 'right' as const,
      render: (_: any, record: User) => (
        <Space>
          <Button
            type="text"
            icon={record.status === 'active' ? <StopOutlined /> : <CheckCircleOutlined />}
            onClick={() => handleToggleStatus(record.id)}
            title={record.status === 'active' ? 'Заблокировать' : 'Активировать'}
          />
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

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h1 style={{ margin: 0 }}>Пользователи</h1>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchUsers}>
            Обновить
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            Добавить пользователя
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        scroll={{ x: 1200 }}
        loading={loading}
      />

      <Modal
        title={editingUser ? 'Редактировать пользователя' : 'Создать пользователя'}
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
            label="Имя"
            rules={[{ required: true, message: 'Введите имя' }]}
          >
            <Input placeholder="Иван Иванов" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Введите email' },
              { type: 'email', message: 'Некорректный email' },
            ]}
          >
            <Input placeholder="user@example.com" />
          </Form.Item>

          <Form.Item
            name="password"
            label={editingUser ? 'Пароль (оставьте пустым для сохранения текущего)' : 'Пароль'}
            rules={editingUser ? [] : [{ required: true, message: 'Введите пароль' }]}
          >
            <Input.Password placeholder="********" />
          </Form.Item>

          <Form.Item name="phone" label="Телефон">
            <Input placeholder="+7 (999) 123-45-67" />
          </Form.Item>

          <Form.Item
            name="role"
            label="Роль"
            initialValue="customer"
            rules={[{ required: true, message: 'Выберите роль' }]}
          >
            <Select>
              <Option value="customer">Клиент</Option>
              <Option value="manager">Менеджер</Option>
              <Option value="admin">Администратор</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label="Статус"
            initialValue="active"
            rules={[{ required: true, message: 'Выберите статус' }]}
          >
            <Select>
              <Option value="active">Активен</Option>
              <Option value="blocked">Заблокирован</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Аватар">
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

          <Form.Item name="address" label="Адрес">
            <Input.TextArea rows={2} placeholder="Адрес доставки" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UsersPage;

