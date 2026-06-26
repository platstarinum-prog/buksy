import { sanitize } from './utils.js';
import { getStock } from './supabase.js';
import { FIELD_LIMITS, ORDER_LIMITS, PAYMENT } from './constants.js';

// The _catalog.json will be generated at build time by transform-products.mjs
// We import it dynamically since it's in the project root for CF build
let catalogCache = null;
async function getCatalog() {
  if (catalogCache) return catalogCache;
  // Try importing the generated catalog
  try {
    const mod = await import('../../_catalog.json');
    catalogCache = mod.default || mod;
  } catch {
    catalogCache = {};
  }
  return catalogCache;
}

export async function validateCatalogItems(env, items, shape) {
  shape = shape || 'monobank';
  const catalog = await getCatalog();
  const result = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const product = item.product;
    if (!product || typeof product !== 'object') throw { statusCode: 400, body: JSON.stringify({ error: 'Missing product info at ' + i }) };
    const slug = product.slug;
    if (!slug || typeof slug !== 'string') throw { statusCode: 400, body: JSON.stringify({ error: 'Missing slug at ' + i }) };

    const entry = catalog[slug];
    if (!entry) throw { statusCode: 400, body: JSON.stringify({ error: 'Unknown product: ' + slug }) };

    const qty = Number(item.quantity);
    if (isNaN(qty) || qty < ORDER_LIMITS.MIN_QUANTITY || qty > ORDER_LIMITS.MAX_QUANTITY) {
      throw { statusCode: 400, body: JSON.stringify({ error: 'Invalid qty for ' + slug }) };
    }

    const catStock = Number(entry.stock) || 0;
    if (catStock < qty) throw { statusCode: 400, body: JSON.stringify({ error: 'Insufficient stock for ' + entry.name + ': ' + catStock }) };

    const dbStock = await getStock(env, slug);
    if (dbStock !== null && dbStock < qty) throw { statusCode: 400, body: JSON.stringify({ error: 'Insufficient stock (DB): ' + dbStock }) };

    const sizeVal = item.size ? sanitize(String(item.size), FIELD_LIMITS.PRODUCT_SIZE) : '';
    const price = Number(entry.price) || 0;

    if (shape === 'order') {
      result.push({ product: { slug, name: entry.name, price, images: product.images || [] }, size: sizeVal, quantity: qty, pricePerUnit: price });
    } else {
      result.push({ slug, name: entry.name, size: sizeVal, qty, price });
    }
  }
  return result;
}

export function getCatalogStock(env, slug) {
  // Synchronous fallback — we use PAYMENT.DEFAULT_STOCK
  // The actual catalog stock is used via validateCatalogItems which is async
  return PAYMENT.DEFAULT_STOCK;
}
