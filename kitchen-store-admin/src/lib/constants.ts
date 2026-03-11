export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPING: 'shipping',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const ORDER_STATUS_COLORS = {
  pending: 'default',
  processing: 'processing',
  shipping: 'warning',
  completed: 'success',
  cancelled: 'error',
} as const;

export const ORDER_STATUS_TEXTS = {
  pending: 'Ожидает',
  processing: 'Обработка',
  shipping: 'Доставка',
  completed: 'Завершен',
  cancelled: 'Отменен',
} as const;

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  REFUNDED: 'refunded',
} as const;

export const PAYMENT_STATUS_COLORS = {
  pending: 'warning',
  paid: 'success',
  refunded: 'default',
} as const;

export const PAYMENT_STATUS_TEXTS = {
  pending: 'Ожидает оплаты',
  paid: 'Оплачен',
  refunded: 'Возврат',
} as const;

export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  CUSTOMER: 'customer',
} as const;

export const USER_ROLE_COLORS = {
  admin: 'red',
  manager: 'orange',
  customer: 'blue',
} as const;

export const USER_ROLE_TEXTS = {
  admin: 'Администратор',
  manager: 'Менеджер',
  customer: 'Клиент',
} as const;

export const REVIEW_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

export const REVIEW_STATUS_COLORS = {
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
} as const;

export const REVIEW_STATUS_TEXTS = {
  pending: 'На модерации',
  approved: 'Одобрен',
  rejected: 'Отклонен',
} as const;

export const PROMOTION_TYPES = {
  PERCENT: 'percent',
  FIXED: 'fixed',
  THREE_FOR_TWO: '3for2',
} as const;

export const PROMOTION_TYPE_TEXTS = {
  percent: 'Скидка %',
  fixed: 'Фикс. сумма',
  '3for2': '3 по цене 2',
} as const;

export const PAGE_TYPES = {
  ABOUT: 'about',
  CONTACTS: 'contacts',
  DELIVERY: 'delivery',
  PAYMENT: 'payment',
  PRIVACY: 'privacy',
  TERMS: 'terms',
  CUSTOM: 'custom',
} as const;

export const PAGE_TYPE_MAP = {
  about: { text: 'О нас', color: 'blue' },
  contacts: { text: 'Контакты', color: 'cyan' },
  delivery: { text: 'Доставка', color: 'green' },
  payment: { text: 'Оплата', color: 'orange' },
  privacy: { text: 'Политика', color: 'purple' },
  terms: { text: 'Условия', color: 'magenta' },
  custom: { text: 'Другое', color: 'default' },
} as const;

export const BANNER_POSITIONS = {
  MAIN: 'main',
  SIDEBAR: 'sidebar',
  FOOTER: 'footer',
} as const;

export const BANNER_POSITION_MAP = {
  main: { text: 'Главная', color: 'blue' },
  sidebar: { text: 'Сайдбар', color: 'cyan' },
  footer: { text: 'Футер', color: 'purple' },
} as const;

export const BANNER_DEVICES = {
  ALL: 'all',
  DESKTOP: 'desktop',
  MOBILE: 'mobile',
} as const;

export const BANNER_DEVICE_MAP = {
  all: { text: 'Все', color: 'green' },
  desktop: { text: 'Desktop', color: 'geekblue' },
  mobile: { text: 'Mobile', color: 'orange' },
} as const;


