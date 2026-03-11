import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Switch, Select, message, Divider, Spin } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;
const { TextArea } = Input;

const API_URL = 'http://localhost:3001';

const SettingsPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/settings`);
      form.setFieldsValue(response.data);
    } catch (error) {
      console.error('Ошибка загрузки настроек:', error);
      // Если настроек нет, используем значения по умолчанию
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    setSaving(true);
    try {
      await axios.put(`${API_URL}/settings`, values);
      message.success('Настройки сохранены');
    } catch (error) {
      message.error('Ошибка сохранения настроек');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>Настройки</h1>

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            siteName: 'NURRUS',
            siteUrl: 'https://kitchenstore.ru',
            supportEmail: 'support@kitchenstore.ru',
            phone: '+7 (999) 123-45-67',
            currency: 'RUB',
            language: 'ru',
            enableRegistration: true,
            enableReviews: true,
            moderateReviews: true,
            emailNotifications: true,
            smsNotifications: false,
          }}
        >
          <Divider orientation="left">Основные настройки</Divider>

          <Form.Item
            name="siteName"
            label="Название сайта"
            rules={[{ required: true, message: 'Введите название' }]}
          >
            <Input placeholder="NURRUS" />
          </Form.Item>

          <Form.Item
            name="siteUrl"
            label="URL сайта"
            rules={[
              { required: true, message: 'Введите URL' },
              { type: 'url', message: 'Введите корректный URL' },
            ]}
          >
            <Input placeholder="https://kitchenstore.ru" />
          </Form.Item>

          <Form.Item
            name="supportEmail"
            label="Email поддержки"
            rules={[
              { required: true, message: 'Введите email' },
              { type: 'email', message: 'Введите корректный email' },
            ]}
          >
            <Input placeholder="support@kitchenstore.ru" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Телефон"
            rules={[{ required: true, message: 'Введите телефон' }]}
          >
            <Input placeholder="+7 (999) 123-45-67" />
          </Form.Item>

          <Divider orientation="left">Локализация</Divider>

          <Form.Item name="currency" label="Валюта">
            <Select>
              <Option value="RUB">Рубль (₽)</Option>
              <Option value="USD">Доллар ($)</Option>
              <Option value="EUR">Евро (€)</Option>
            </Select>
          </Form.Item>

          <Form.Item name="language" label="Язык">
            <Select>
              <Option value="ru">Русский</Option>
              <Option value="en">English</Option>
            </Select>
          </Form.Item>

          <Divider orientation="left">Функциональность</Divider>

          <Form.Item name="enableRegistration" valuePropName="checked" label="Регистрация пользователей">
            <Switch />
          </Form.Item>

          <Form.Item name="enableReviews" valuePropName="checked" label="Отзывы о товарах">
            <Switch />
          </Form.Item>

          <Form.Item name="moderateReviews" valuePropName="checked" label="Модерация отзывов">
            <Switch />
          </Form.Item>

          <Divider orientation="left">Уведомления</Divider>

          <Form.Item name="emailNotifications" valuePropName="checked" label="Email уведомления">
            <Switch />
          </Form.Item>

          <Form.Item name="smsNotifications" valuePropName="checked" label="SMS уведомления">
            <Switch />
          </Form.Item>

          <Divider orientation="left">SEO</Divider>

          <Form.Item name="metaTitle" label="Meta Title">
            <Input placeholder="Интернет-магазин мебели NURRUS" />
          </Form.Item>

          <Form.Item name="metaDescription" label="Meta Description">
            <TextArea rows={3} placeholder="Большой выбор мебели для кухни..." />
          </Form.Item>

          <Form.Item name="metaKeywords" label="Meta Keywords">
            <Input placeholder="мебель, кухни, диваны, шкафы" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              size="large"
              loading={saving}
            >
              Сохранить настройки
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default SettingsPage;

