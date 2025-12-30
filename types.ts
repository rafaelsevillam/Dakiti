
export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  oldPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  description: string;
  volume: string;
  abv: string;
  origin: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface NightlifeEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  image: string;
  price: number;
  tags: string[];
  capacity: number;
  booked: number;
}

export interface Trend {
  id: string;
  label: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: string;
}

export type UserRole = 'client' | 'seller' | 'admin';

export interface UserProfile {
  id: string;
  full_name: string;
  role: UserRole;
  created_at: string;
}
