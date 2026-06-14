import { readFileSync, readdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const prodDir = join(root, 'content', 'products');
const outPath = join(root, 'src', 'data', 'products.ts');

const files = readdirSync(prodDir).filter(f => f.endsWith('.json'));

const products = files.map(f => {
  const raw = readFileSync(join(prodDir, f), 'utf-8');
  return JSON.parse(raw);
});

const getCatName = (cat) => {
  const m = { hoodies: 'Hoodies', 't-shirts': 'T-Shirts', jackets: 'Jackets', pants: 'Pants', accessories: 'Accessories', footwear: 'Footwear' };
  return m[cat] || cat;
};

const categories = [{ id: 'all', name: 'All' }, ...[...new Set(products.map(p => p.category))].map(id => ({ id, name: getCatName(id) }))];

const heroImage = 'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=1200';
const editorialImage = 'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=800';

const content = `import { Product, Review } from '../types';

export const products: Product[] = ${JSON.stringify(products, null, 2)};

export const reviews: Review[] = products.flatMap(p => (p.reviews || []).map((r: Review) => ({ ...r, productId: p.id, productSlug: p.slug })));

export const getCategoryName = (category: string): string => {
  const names: Record<string, string> = ${JSON.stringify(Object.fromEntries([...new Set(products.map(p => p.category))].map(c => [c, getCatName(c)])))};
  return names[category] || category;
};

export const categories = ${JSON.stringify(categories)};

export const heroImage = '${heroImage}';
export const editorialImage = '${editorialImage}';
`;

writeFileSync(outPath, content, 'utf-8');
console.log(`✅ Generated products.ts from ${files.length} products`);
