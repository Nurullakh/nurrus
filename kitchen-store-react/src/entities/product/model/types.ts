export interface Product {
  id?: number;
  name: string;
  description: string;
  price: number;
  category: string;
  brand: string;
  specifications: Record<string, string>;
  images?: string[];
  rating?: number;
  reviews_count?: number;
  is_available?: boolean;
}
