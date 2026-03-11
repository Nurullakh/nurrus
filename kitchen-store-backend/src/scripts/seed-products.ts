import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { Product } from '../products/products.entity';
import { Category } from '../categories/categories.entity';

// Загружаем переменные окружения из .env файла
config();

// Данные для генерации товаров
const kitchenNames = [
  'Кухня классическая "Элегант"',
  'Кухня современная "Минимализм"',
  'Кухня в стиле прованс "Лаванда"',
  'Кухня скандинавская "Норд"',
  'Кухня лофт "Индустриал"',
  'Кухня неоклассика "Ампир"',
  'Кухня модерн "Фьюжн"',
  'Кухня кантри "Деревня"',
  'Кухня хай-тек "Техно"',
  'Кухня ар-деко "Роскошь"',
  'Кухня средиземноморская "Италия"',
  'Кухня японская "Ваби-саби"',
  'Кухня английская "Виктория"',
  'Кухня французская "Шато"',
  'Кухня американская "Классик"',
  'Кухня угловая "Компакт"',
  'Кухня прямая "Стандарт"',
  'Кухня П-образная "Простор"',
  'Кухня островная "Премиум"',
  'Кухня линейная "Базис"',
];

const brands = [
  'KitchenPro',
  'EliteKitchen',
  'PremiumHome',
  'ModernKitchen',
  'ClassicDesign',
  'LuxuryKitchen',
  'SmartKitchen',
  'EcoKitchen',
  'StyleKitchen',
  'MasterKitchen',
];

const materials = [
  'МДФ',
  'Массив дуба',
  'Массив сосны',
  'Пластик',
  'Акрил',
  'Шпон',
  'Металл',
  'Стекло',
  'Камень',
  'Керамика',
];

const colors = [
  'Белый',
  'Бежевый',
  'Серый',
  'Коричневый',
  'Черный',
  'Кремовый',
  'Дуб',
  'Орех',
  'Вишня',
  'Венге',
];

const descriptions = [
  'Современная кухня с продуманной эргономикой и стильным дизайном. Идеально подходит для просторных помещений.',
  'Классическая кухня из натуральных материалов. Долговечная и практичная мебель для вашего дома.',
  'Элегантная кухня в европейском стиле. Высокое качество сборки и внимание к деталям.',
  'Функциональная кухня с большим количеством места для хранения. Удобная планировка и современные технологии.',
  'Роскошная кухня премиум-класса. Эксклюзивный дизайн и премиальные материалы.',
  'Компактная кухня для небольших помещений. Максимальная функциональность при минимальных размерах.',
  'Стильная кухня в современном дизайне. Яркие акценты и необычные решения.',
  'Традиционная кухня с элементами классики. Теплая атмосфера и уют.',
  'Минималистичная кухня в скандинавском стиле. Светлые тона и простота форм.',
  'Практичная кухня для большой семьи. Просторные шкафы и удобная рабочая зона.',
];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomPrice(): number {
  const prices = [
    50000, 75000, 100000, 125000, 150000, 175000, 200000, 250000, 300000,
    350000, 400000, 450000, 500000, 600000, 700000, 800000, 900000, 1000000,
  ];
  return getRandomElement(prices);
}

function getRandomRating(): number {
  return Math.round((Math.random() * 2 + 3) * 10) / 10; // От 3.0 до 5.0
}

function getRandomSpecifications() {
  return {
    'Материал': getRandomElement(materials),
    'Цвет': getRandomElement(colors),
    'Ширина (см)': getRandomNumber(200, 400),
    'Глубина (см)': getRandomNumber(50, 70),
    'Высота (см)': getRandomNumber(80, 95),
    'Количество фасадов': getRandomNumber(5, 15),
    'Фурнитура': 'Blum',
    'Столешница': getRandomElement(['МДФ', 'Кварц', 'Гранит', 'Дерево']),
    'Стиль': getRandomElement(['Классика', 'Модерн', 'Скандинавский', 'Лофт']),
  };
}

async function seedProducts(dataSource: DataSource) {
  const productRepository = dataSource.getRepository(Product);
  const categoryRepository = dataSource.getRepository(Category);

  // Получаем все категории
  const categories = await categoryRepository.find();
  
  if (categories.length === 0) {
    console.log('⚠️  Нет категорий в базе данных. Создайте категории сначала.');
    return;
  }

  console.log(`📦 Найдено категорий: ${categories.length}`);
  console.log('🚀 Начинаю создание товаров...\n');

  const productsToCreate = 100; // Количество товаров для создания
  const batchSize = 20; // Размер батча для вставки

  for (let i = 0; i < productsToCreate; i += batchSize) {
    const batch: Product[] = [];

    for (let j = 0; j < batchSize && i + j < productsToCreate; j++) {
      const category = getRandomElement(categories);
      const name = `${getRandomElement(kitchenNames)} ${getRandomNumber(1, 99)}`;
      const brand = getRandomElement(brands);
      const price = getRandomPrice();
      const rating = getRandomRating();
      const reviewsCount = getRandomNumber(5, 150);
      const stock = getRandomNumber(0, 50);
      const isAvailable = stock > 0;

      const product = productRepository.create({
        name,
        description: getRandomElement(descriptions),
        price,
        categoryId: category.id,
        category: category.name,
        brand,
        specifications: getRandomSpecifications(),
        images: [],
        rating,
        reviews_count: reviewsCount,
        is_available: isAvailable,
        article: `ART-${getRandomNumber(1000, 9999)}-${getRandomNumber(100, 999)}`,
        stock,
      });

      batch.push(product);
    }

    await productRepository.save(batch);
    console.log(`✅ Создано товаров: ${Math.min(i + batchSize, productsToCreate)}/${productsToCreate}`);
  }

  console.log(`\n🎉 Успешно создано ${productsToCreate} товаров!`);
}

async function run() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USER || 'postgres',
    password: String(process.env.DB_PASSWORD || ''),
    database: process.env.DB_NAME || 'kitchen_store',
    entities: [Product, Category],
    synchronize: false,
  });

  try {
    await dataSource.initialize();
    console.log('✅ Подключение к базе данных установлено\n');
    
    await seedProducts(dataSource);
    
    await dataSource.destroy();
    console.log('\n✅ Скрипт завершен успешно');
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка:', error);
    await dataSource.destroy();
    process.exit(1);
  }
}

run();

