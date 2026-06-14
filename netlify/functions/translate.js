exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { texts, to } = JSON.parse(event.body);

    if (!texts || !texts.length || !to || to === 'uk') {
      return { statusCode: 200, body: JSON.stringify({ translations: texts || [] }) };
    }

    // Join with unique separator, translate as one batch
    const SEP = '\n===\n';
    const batch = texts.map((t) => t || ' ').join(SEP);
    const encoded = encodeURIComponent(batch);
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=uk&tl=${to}&dt=t&q=${encoded}`;

    const res = await fetch(url);
    const raw = await res.json();

    // Google returns sentences in raw[0] as [[text, orig], ...]
    // Rejoin all parts and split by our separator
    const fullText = (raw[0] || []).map((p) => (p[0] || '')).join('');
    const translations = fullText.split(SEP).map((t) => t.trim());

    // Ensure we have same count
    while (translations.length < texts.length) translations.push('');
    return {
      statusCode: 200,
      body: JSON.stringify({ translations: translations.slice(0, texts.length) }),
    };
  } catch (error) {
    console.error('Translate error:', error);
    return { statusCode: 200, body: JSON.stringify({ translations: [], error: error.message }) };
  }
};
