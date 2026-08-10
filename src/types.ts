export type PageType = 'home' | 'catalog' | 'builder' | 'about' | 'faq' | 'contacts';

export interface Product {
  id: string;
  name: string;
  category: string; // 'cpu' | 'gpu' | 'motherboard' | 'ram' | 'storage' | 'psu' | 'cooler' | 'case'
  brand: string;
  price: number;
  oldPrice?: number;
  rating: number;
  reviewsCount: number;
  image: string;
  badge?: 'Хит' | 'Новинка' | 'Скидка' | 'ТОП';
  inStock: boolean;
  specs: Record<string, string>;
  // Compatibility specs
  socket?: string; // e.g. 'AM5', 'LGA1700'
  formFactor?: string; // 'ATX', 'mATX'
  memoryType?: string; // 'DDR5', 'DDR4'
  wattage?: number; // Power usage or PSU wattage rating
  description: string;
}

export interface CategoryInfo {
  id: string;
  name: string;
  slug: string;
  count: number;
  image: string;
  description: string;
  popularItem: string;
}

export interface Benefit {
  id: string;
  title: string;
  description: string;
  iconName: string;
  stat?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface PcBuildState {
  cpu: Product | null;
  gpu: Product | null;
  motherboard: Product | null;
  ram: Product | null;
  storage: Product | null;
  psu: Product | null;
  cooler: Product | null;
  case: Product | null;
}
