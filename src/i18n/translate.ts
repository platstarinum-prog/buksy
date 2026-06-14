const cache = new Map<string, string>();

function cacheKey(text: string, to: string): string {
  return `buksy_tr_${to}_${text}`;
}

function loadCache() {
  try {
    const raw = localStorage.getItem('buksy_translations');
    if (raw) {
      const data = JSON.parse(raw);
      for (const [k, v] of Object.entries(data)) {
        cache.set(k, v as string);
      }
    }
  } catch { /* ignore */ }
}

function saveCache() {
  try {
    const obj: Record<string, string> = {};
    for (const [k, v] of cache.entries()) {
      obj[k] = v;
    }
    localStorage.setItem('buksy_translations', JSON.stringify(obj));
  } catch { /* quota exceeded, ok */ }
}

loadCache();

export async function translateText(text: string, to: string): Promise<string> {
  if (!text || to === 'uk') return text;

  const key = cacheKey(text, to);
  if (cache.has(key)) return cache.get(key)!;

  try {
    // Dynamic import to avoid build issues
    const { translate } = await import('@vitalets/google-translate-api');
    const result = await translate(text, { to });
    const translated = result.text;
    cache.set(key, translated);
    saveCache();
    return translated;
  } catch {
    return text;
  }
}

export async function translateMany(texts: string[], to: string): Promise<string[]> {
  if (to === 'uk') return texts;

  const results: string[] = [];
  const uncached: { idx: number; text: string }[] = [];

  for (let i = 0; i < texts.length; i++) {
    const text = texts[i];
    if (!text) { results[i] = text; continue; }
    const key = cacheKey(text, to);
    if (cache.has(key)) {
      results[i] = cache.get(key)!;
    } else {
      uncached.push({ idx: i, text });
    }
  }

  if (uncached.length > 0) {
    try {
      const { translate } = await import('@vitalets/google-translate-api');
      // Batch: join with separator, translate, split back
      const separator = '\n---\n';
      const batch = uncached.map(u => u.text).join(separator);
      const { text: translated } = await translate(batch, { to });

      const parts = translated.split(separator);
      for (let i = 0; i < uncached.length; i++) {
        const tr = (parts[i] || uncached[i].text).trim();
        results[uncached[i].idx] = tr;
        cache.set(cacheKey(uncached[i].text, to), tr);
      }
      saveCache();
    } catch {
      for (const u of uncached) {
        results[u.idx] = u.text;
      }
    }
  }

  return results;
}

// Deeply translate all string values in an object
export async function translateObject<T extends Record<string, any>>(
  obj: T,
  to: string
): Promise<T> {
  if (to === 'uk' || !obj) return obj;

  const strings: { path: string[]; text: string }[] = [];

  function collect(o: any, path: string[]) {
    if (typeof o === 'string' && o.trim()) {
      strings.push({ path: [...path], text: o });
    } else if (Array.isArray(o)) {
      o.forEach((item, i) => collect(item, [...path, String(i)]));
    } else if (o && typeof o === 'object') {
      for (const [k, v] of Object.entries(o)) {
        collect(v, [...path, k]);
      }
    }
  }

  collect(obj, []);

  if (strings.length === 0) return obj;

  const translated = await translateMany(strings.map(s => s.text), to);

  const result = JSON.parse(JSON.stringify(obj));

  function setAt(o: any, path: string[], value: string) {
    let cur = o;
    for (let i = 0; i < path.length - 1; i++) {
      cur = cur[path[i]];
    }
    cur[path[path.length - 1]] = value;
  }

  for (let i = 0; i < strings.length; i++) {
    setAt(result, strings[i].path, translated[i]);
  }

  return result;
}
