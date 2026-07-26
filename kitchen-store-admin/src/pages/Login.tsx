import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Card, message, Tabs } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { api, ADMIN_TOKEN_KEY, ADMIN_USER_KEY } from '../lib/api';
import { AdminUser } from '../lib/auth';

interface LoginFormValues {
  email: string;
  password: string;
}

interface RegisterSellerFormValues extends LoginFormValues {
  name: string;
  phone?: string;
}

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem(ADMIN_TOKEN_KEY)) {
      navigate('/admin', { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (values: LoginFormValues) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', {
        email: values.email,
        password: values.password,
      });

      const token = response.data?.access_token ?? response.data?.token;
      const user = response.data?.user as AdminUser | undefined;
      if (!token) {
        throw new Error('Токен не получен');
      }
      if (!user || (user.role !== 'admin' && user.role !== 'seller')) {
        throw new Error('Доступ в админку есть только у админа или продавца');
      }

      localStorage.setItem(ADMIN_TOKEN_KEY, token);
      localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));

      message.success('Вход выполнен успешно');
      navigate('/admin');
    } catch (error: unknown) {
      const errorMessage =
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        typeof (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message === 'string'
          ? (error as { response?: { data?: { message?: string } } }).response?.data
              ?.message
          : 'Ошибка входа';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSeller = async (values: RegisterSellerFormValues) => {
    setLoading(true);
    try {
      await api.post('/auth/register-seller', {
        name: values.name,
        email: values.email,
        password: values.password,
        phone: values.phone,
      });

      message.success(
        'Заявка создана. Дождитесь подтверждения администратором и войдите.',
      );
      setActiveTab('login');
    } catch (error: unknown) {
      const errorMessage =
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        typeof (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message === 'string'
          ? (error as { response?: { data?: { message?: string } } }).response?.data
              ?.message
          : 'Ошибка регистрации';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Card
        style={{
          width: 450,
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          borderRadius: 12,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 32, fontWeight: 'bold', marginBottom: 8 }}>
            NURRUS
          </h1>
          <p style={{ color: '#666', fontSize: 16 }}>Панель администратора</p>
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'login',
              label: 'Вход',
              children: (
                <Form
                  name="login"
                  onFinish={handleLogin}
                  autoComplete="off"
                  size="large"
                >
                  <Form.Item
                    name="email"
                    rules={[
                      { required: true, message: 'Введите email' },
                      { type: 'email', message: 'Некорректный email' },
                    ]}
                  >
                    <Input
                      prefix={<UserOutlined />}
                      placeholder="Email"
                      autoComplete="username"
                    />
                  </Form.Item>

                  <Form.Item
                    name="password"
                    rules={[{ required: true, message: 'Введите пароль' }]}
                  >
                    <Input.Password
                      prefix={<LockOutlined />}
                      placeholder="Пароль"
                      autoComplete="current-password"
                    />
                  </Form.Item>

                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      block
                      style={{ height: 45 }}
                    >
                      Войти
                    </Button>
                  </Form.Item>
                </Form>
              ),
            },
            {
              key: 'register',
              label: 'Регистрация продавца',
              children: (
                <Form
                  name="register-seller"
                  onFinish={handleRegisterSeller}
                  autoComplete="off"
                  size="large"
                >
                  <Form.Item
                    name="name"
                    rules={[
                      { required: true, message: 'Введите имя' },
                      { min: 2, message: 'Минимум 2 символа' },
                    ]}
                  >
                    <Input prefix={<UserOutlined />} placeholder="Имя продавца" />
                  </Form.Item>

                  <Form.Item
                    name="email"
                    rules={[
                      { required: true, message: 'Введите email' },
                      { type: 'email', message: 'Некорректный email' },
                    ]}
                  >
                    <Input prefix={<UserOutlined />} placeholder="Email" />
                  </Form.Item>

                  <Form.Item name="phone">
                    <Input placeholder="Телефон (опционально)" />
                  </Form.Item>

                  <Form.Item
                    name="password"
                    rules={[
                      { required: true, message: 'Введите пароль' },
                      { min: 6, message: 'Минимум 6 символов' },
                    ]}
                  >
                    <Input.Password prefix={<LockOutlined />} placeholder="Пароль" />
                  </Form.Item>

                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      block
                      style={{ height: 45 }}
                    >
                      Создать аккаунт продавца
                    </Button>
                  </Form.Item>
                </Form>
              ),
            },
          ]}
        />

        <div style={{ textAlign: 'center', color: '#666', fontSize: 12 }}>
          © 2024 NURRUS. Все права защищены.
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;


