/**
 * Форматирование числа как валюты
 */
export const formatCurrency = (value: number, currency: string = '₽'): string => {
  return `${value.toLocaleString('ru-RU')} ${currency}`;
};

/**
 * Форматирование даты
 */
export const formatDate = (date: string | Date, includeTime: boolean = false): string => {
  const d = new Date(date);
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  };

  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }

  return d.toLocaleString('ru-RU', options);
};

/**
 * Генерация slug из строки
 */
export const generateSlug = (text: string): string => {
  const translitMap: Record<string, string> = {
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo',
    ж: 'zh', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm',
    н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u',
    ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch',
    ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
  };

  return text
    .toLowerCase()
    .split('')
    .map((char) => translitMap[char] || char)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Получение токена из localStorage
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem('admin_token');
};

/**
 * Получение пользователя из localStorage
 */
export const getCurrentUser = (): any => {
  const userString = localStorage.getItem('admin_user');
  return userString ? JSON.parse(userString) : null;
};

/**
 * Проверка авторизации
 */
export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

/**
 * Валидация email
 */
export const isValidEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Валидация телефона
 */
export const isValidPhone = (phone: string): boolean => {
  const regex = /^[\d\s\-\+\(\)]+$/;
  return regex.test(phone);
};

/**
 * Сокращение строки
 */
export const truncate = (str: string, length: number = 50): string => {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
};

/**
 * Получение расширения файла
 */
export const getFileExtension = (filename: string): string => {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
};

/**
 * Проверка, является ли файл изображением
 */
export const isImageFile = (filename: string): boolean => {
  const ext = getFileExtension(filename).toLowerCase();
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext);
};

/**
 * Форматирование размера файла
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Дебаунс функции
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Получение цвета для статуса
 */
export const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    pending: 'warning',
    processing: 'processing',
    approved: 'success',
    completed: 'success',
    rejected: 'error',
    cancelled: 'error',
    active: 'green',
    inactive: 'red',
  };

  return colorMap[status] || 'default';
};


