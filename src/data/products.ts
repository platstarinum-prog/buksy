import { Product, Review } from '../types';

export const products: Product[] = [];

export const reviews: Review[] = [];

export const getCategoryName = (category: string): string => {
  const names: Record<string, string> = {
    hoodies: 'Hoodies',
    't-shirts': 'T-Shirts',
    jackets: 'Jackets',
    pants: 'Pants',
    accessories: 'Accessories',
    footwear: 'Footwear',
  };
  return names[category] || category;
};

export const categories = [
  { id: 'all', name: 'All' },
];

export const heroImage = 'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=1200';
export const editorialImage = 'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=800';
