import { existsSync, readFileSync, readdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const prodDir = join(root, 'content', 'products');
const outPath = join(root, 'src', 'data', 'products.ts');

const entries = existsSync(prodDir) ? readdirSync(prodDir) : [];
const jsonFiles = entries.filter(f => f.endsWith('.json'));
const mdFiles = entries.filter(f => f.endsWith('.md'));

function processEntry(rawData) {
  const p = rawData;
  if (!p.images) p.images = [p.image1, p.image2, p.image3].filter(Boolean);
  else if (p.images[0] && typeof p.images[0] === 'object') p.images = p.images.map(img => img.src || img.url || img.image || '');
  if (Array.isArray(p.details)) p.details = p.details.map(d => typeof d === 'object' ? (d.detail || '') : d);
  if (Array.isArray(p.care)) p.care = p.care.map(c => typeof c === 'object' ? (c.instruction || '') : c);
  p.reviewCount = (p.reviews || []).length;
  if (p.stock === undefined || p.stock === null) p.stock = 99;
  return p;
}

const products = [];

for (const f of jsonFiles) {
  let raw = readFileSync(join(prodDir, f), 'utf-8');
  if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);
  products.push(processEntry(JSON.parse(raw)));
}

for (const f of mdFiles) {
  const raw = readFileSync(join(prodDir, f), 'utf-8');
  const { data } = matter(raw);
  if (data && data.name) {
    products.push(processEntry(data));
  }
}

const getCatName = (cat) => {
  const m = { hoodies: 'Hoodies', 't-shirts': 'T-Shirts', jackets: 'Jackets', pants: 'Pants', accessories: 'Accessories', footwear: 'Footwear' };
  return m[cat] || cat;
};

const categories = [{ id: 'all', name: 'All' }, ...[...new Set(products.map(p => p.category))].map(id => ({ id, name: getCatName(id) }))];

const homepagePath = join(root, 'content', 'pages', 'homepage.json');
let heroImage = 'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=1200';
let editorialImage = 'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=800';

if (existsSync(homepagePath)) {
  const homepage = JSON.parse(readFileSync(homepagePath, 'utf-8'));
  heroImage = homepage.hero?.image || heroImage;
  editorialImage = homepage.philosophy?.image || editorialImage;
}

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
console.log(`✅ Generated products.ts — ${jsonFiles.length} JSON + ${mdFiles.length} Markdown = ${products.length} products`);

const catalogPath = join(root, '_catalog.json');
const catalog = {};
for (const p of products) {
  catalog[p.slug] = { name: p.name, price: Number(p.price), stock: Number(p.stock ?? 99) };
}
writeFileSync(catalogPath, JSON.stringify(catalog), 'utf-8');
console.log(`✅ Generated _catalog.json — ${Object.keys(catalog).length} products`);
