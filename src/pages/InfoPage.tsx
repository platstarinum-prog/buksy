import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

const pages: Record<string, { title: string; content: string }> = {
  faq: {
    title: 'FAQ',
    content: 'Find answers to common questions about shipping, returns, sizing, and more. If you need further assistance, feel free to contact our support team.',
  },
  shipping: {
    title: 'Shipping & Returns',
    content: 'We offer free worldwide shipping on orders over $150. Standard shipping takes 5-7 business days. Express shipping (2-3 days) is available for an additional fee. Returns are accepted within 30 days of delivery for unworn items in original packaging.',
  },
  'size-guide': {
    title: 'Size Guide',
    content: '',
  },
  track: {
    title: 'Track Order',
    content: 'Once your order ships, you will receive an email with tracking information. You can also track your order through your account dashboard or contact our support team for assistance.',
  },
  privacy: {
    title: 'Privacy Policy',
    content: 'We respect your privacy and are committed to protecting your personal data. This policy outlines how we collect, use, and safeguard your information when you use our website and services.',
  },
  terms: {
    title: 'Terms of Service',
    content: 'By using our website and purchasing our products, you agree to these terms. Please read them carefully. We reserve the right to update these terms at any time.',
  },
  cookies: {
    title: 'Cookie Policy',
    content: 'We use cookies to enhance your browsing experience, analyze site traffic, and provide personalized content. By continuing to use our site, you consent to our use of cookies.',
  },
};

function SizeGuide() {
  const tops = [
    { size: 'XS', chest: '34-36', waist: '28-30', length: '26' },
    { size: 'S', chest: '36-38', waist: '30-32', length: '27' },
    { size: 'M', chest: '38-40', waist: '32-34', length: '28' },
    { size: 'L', chest: '40-42', waist: '34-36', length: '29' },
    { size: 'XL', chest: '42-44', waist: '36-38', length: '30' },
    { size: 'XXL', chest: '44-46', waist: '38-40', length: '31' },
  ];

  const bottoms = [
    { size: '28', waist: '28-29', hip: '34-35', inseam: '30' },
    { size: '30', waist: '30-31', hip: '36-37', inseam: '30' },
    { size: '32', waist: '32-33', hip: '38-39', inseam: '31' },
    { size: '34', waist: '34-35', hip: '40-41', inseam: '31' },
    { size: '36', waist: '36-37', hip: '42-43', inseam: '32' },
  ];

  const footwear = [
    { size: '39', us: '6', uk: '5.5', cm: '24.5' },
    { size: '40', us: '7', uk: '6.5', cm: '25' },
    { size: '41', us: '8', uk: '7.5', cm: '26' },
    { size: '42', us: '9', uk: '8.5', cm: '26.5' },
    { size: '43', us: '10', uk: '9.5', cm: '27' },
    { size: '44', us: '11', uk: '10.5', cm: '28' },
  ];

  return (
    <div className="space-y-12">
      <p className="text-white/70 font-body leading-relaxed text-lg">
        Find your perfect fit. Measurements are in inches. If you're between sizes,
        we recommend sizing up for a relaxed fit or down for a more fitted look.
      </p>

      {/* Tops */}
      <div>
        <h2 className="font-heading text-xl tracking-wider text-blood mb-4">Tops — Hoodies, T-Shirts, Jackets</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse font-body text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="py-3 px-4 text-left text-white/40 tracking-wider uppercase">Size</th>
                <th className="py-3 px-4 text-left text-white/40 tracking-wider uppercase">Chest (in)</th>
                <th className="py-3 px-4 text-left text-white/40 tracking-wider uppercase">Waist (in)</th>
                <th className="py-3 px-4 text-left text-white/40 tracking-wider uppercase">Length (in)</th>
              </tr>
            </thead>
            <tbody>
              {tops.map((row) => (
                <tr key={row.size} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4 text-white font-heading tracking-wider">{row.size}</td>
                  <td className="py-3 px-4 text-white/70">{row.chest}</td>
                  <td className="py-3 px-4 text-white/70">{row.waist}</td>
                  <td className="py-3 px-4 text-white/70">{row.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottoms */}
      <div>
        <h2 className="font-heading text-xl tracking-wider text-blood mb-4">Bottoms — Pants</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse font-body text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="py-3 px-4 text-left text-white/40 tracking-wider uppercase">Size</th>
                <th className="py-3 px-4 text-left text-white/40 tracking-wider uppercase">Waist (in)</th>
                <th className="py-3 px-4 text-left text-white/40 tracking-wider uppercase">Hip (in)</th>
                <th className="py-3 px-4 text-left text-white/40 tracking-wider uppercase">Inseam (in)</th>
              </tr>
            </thead>
            <tbody>
              {bottoms.map((row) => (
                <tr key={row.size} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4 text-white font-heading tracking-wider">{row.size}</td>
                  <td className="py-3 px-4 text-white/70">{row.waist}</td>
                  <td className="py-3 px-4 text-white/70">{row.hip}</td>
                  <td className="py-3 px-4 text-white/70">{row.inseam}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footwear */}
      <div>
        <h2 className="font-heading text-xl tracking-wider text-blood mb-4">Footwear</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse font-body text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="py-3 px-4 text-left text-white/40 tracking-wider uppercase">EU</th>
                <th className="py-3 px-4 text-left text-white/40 tracking-wider uppercase">US</th>
                <th className="py-3 px-4 text-left text-white/40 tracking-wider uppercase">UK</th>
                <th className="py-3 px-4 text-left text-white/40 tracking-wider uppercase">Foot (cm)</th>
              </tr>
            </thead>
            <tbody>
              {footwear.map((row) => (
                <tr key={row.size} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4 text-white font-heading tracking-wider">{row.size}</td>
                  <td className="py-3 px-4 text-white/70">{row.us}</td>
                  <td className="py-3 px-4 text-white/70">{row.uk}</td>
                  <td className="py-3 px-4 text-white/70">{row.cm}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Measuring Instructions */}
      <div className="p-6 border border-white/10 bg-ash">
        <h3 className="font-heading text-lg tracking-wider text-blood mb-3">How to Measure</h3>
        <ul className="space-y-2 text-white/70 font-body text-sm">
          <li><strong className="text-white">Chest:</strong> Measure around the fullest part of your chest, keeping the tape horizontal.</li>
          <li><strong className="text-white">Waist:</strong> Measure around your natural waistline, just above the belly button.</li>
          <li><strong className="text-white">Hip:</strong> Measure around the fullest part of your hips, about 8 inches below your waist.</li>
          <li><strong className="text-white">Inseam:</strong> Measure from the top of your inner thigh down to your ankle bone.</li>
          <li><strong className="text-white">Foot:</strong> Stand on a piece of paper, trace your foot, and measure from heel to longest toe.</li>
        </ul>
      </div>

      <div>
        <Link to="/contact" className="btn-primary inline-flex items-center gap-3">
          Contact Support
        </Link>
      </div>
    </div>
  );
}

export function InfoPage() {
  const { slug } = useParams<{ slug: string }>();
  const page = slug ? pages[slug] : undefined;

  if (slug === 'size-guide') {
    return (
      <div className="min-h-screen bg-noir pt-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors duration-300 mb-8 font-body text-sm"
          >
            <ArrowLeft size={18} />
            Back to Home
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-display text-4xl md:text-5xl font-light mb-2">Size Guide</h1>
            <div className="h-px bg-blood/30 mb-8" />
            <SizeGuide />
          </motion.div>
        </div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen bg-noir pt-24 flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-4xl font-light mb-4">Page Not Found</h1>
          <p className="text-white/60 font-body mb-6">"{slug}" — this page doesn't exist.</p>
          <Link to="/" className="text-blood hover:underline">Return Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-noir pt-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors duration-300 mb-8 font-body text-sm"
        >
          <ArrowLeft size={18} />
          Back to Home
        </Link>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="font-display text-4xl md:text-5xl font-light mb-6">{page.title}</h1>
          <div className="h-px bg-blood/30 mb-8" />
          <p className="text-white/70 font-body leading-relaxed text-lg">
            {page.content}
          </p>
          <div className="mt-12">
            <Link to="/contact" className="btn-primary inline-flex items-center gap-3">
              Contact Support
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
