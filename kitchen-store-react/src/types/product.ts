export interface IProduct {
  id?: number; // ID товара (необязательный, так как сервер сам его создаст)
  name: string;
  description: string;
  price: number;
  category: string;
  brand: string;
  specifications: Record<string, string>; // JSONB-объект
  images?: string[]; // Массив путей к изображениям
  rating?: number;
  reviews_count?: number;
  is_available?: boolean;
}
