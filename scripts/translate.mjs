import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import translate from '@vitalets/google-translate-api';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const src = join(root, 'src', 'i18n');

const uaPath = join(src, 'uk.json');

if (!existsSync(uaPath)) {
  console.log('⏭ No uk.json found, skipping auto-translate');
  process.exit(0);
}

const ua = JSON.parse(readFileSync(uaPath, 'utf-8'));

async function translateObject(obj, to) {
  const result = {};
  for (const [key, val] of Object.entries(obj)) {
    if (typeof val === 'string' && val.trim()) {
      try {
        const res = await translate(val, { from: 'uk', to });
        result[key] = res.text;
        if (process.env.NETLIFY) {
          await new Promise(r => setTimeout(r, 300));
        }
      } catch {
        result[key] = val;
      }
    } else if (typeof val === 'object' && val !== null) {
      result[key] = await translateObject(val, to);
    } else {
      result[key] = val;
    }
  }
  return result;
}

async function main() {
  console.log('Translating UA → EN...');
  const en = await translateObject(ua, 'en');
  writeFileSync(join(src, 'en.json'), JSON.stringify(en, null, 2), 'utf-8');
  console.log('✅ en.json updated');

  console.log('Translating UA → RU...');
  const ru = await translateObject(ua, 'ru');
  writeFileSync(join(src, 'ru.json'), JSON.stringify(ru, null, 2), 'utf-8');
  console.log('✅ ru.json updated');
}

main().catch((err) => {
  console.error('Translate script failed:', err.message);
  console.log('Keeping original translations');
  process.exit(0);
});
