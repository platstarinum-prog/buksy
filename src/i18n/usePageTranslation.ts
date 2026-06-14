import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { translateObject } from './translate';

export function usePageTranslation<T extends Record<string, any>>(
  obj: T,
  lang: string
): T {
  const { i18n } = useTranslation();
  const [data, setData] = useState<T>(obj);
  const busy = useRef(false);

  useEffect(() => {
    const targetLang = i18n.language?.split('-')[0] || 'uk';

    if (targetLang === 'uk') {
      setData(obj);
      return;
    }

    let cancelled = false;
    busy.current = true;

    translateObject(obj, targetLang).then((translated) => {
      if (!cancelled) {
        setData(translated);
        busy.current = false;
      }
    });

    return () => { cancelled = true; };
  }, [i18n.language, obj]);

  return data;
}
