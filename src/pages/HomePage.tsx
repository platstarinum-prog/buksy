import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { products } from '../data/products';
import { homepage } from '../data/content';
import { ProductCard } from '../components/ProductCard';

export function HomePage() {
  const { t } = useTranslation();
  const featuredProducts = products.filter((p) => p.isFeatured);
  const bestsellers = products.filter((p) => p.isBestseller);
  const hero = homepage.hero || {};
  const feat = homepage.featured || {};
  const phil = homepage.philosophy || {};
  const best = homepage.bestsellers || {};
  const coll = homepage.collections || {};
  const heroImg = hero.image || 'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=1200';
  const philImg = phil.image || 'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=800';

  return (
    <div className="overflow-hidden">
      <section className="relative h-screen">
        <div className="absolute inset-0"><img src={heroImg} alt="" className="w-full h-full object-cover" /><div className="absolute inset-0 bg-gradient-to-r from-noir via-noir/80 to-noir/40" /><div className="absolute inset-0 bg-gradient-to-t from-noir via-transparent to-noir/50" /></div>
        <div className="relative z-10 h-full flex flex-col justify-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2 }} className="max-w-2xl">
            <p className="font-heading text-sm tracking-[0.4em] text-blood mb-4">{hero.tagline}</p>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-light text-white leading-tight mb-6">{hero.title1}<br /><span className="text-blood">{hero.title2}</span></h1>
            <p className="text-lg text-white/70 leading-relaxed mb-10 max-w-lg">{hero.description}</p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.6 }} className="flex flex-wrap gap-4">
              <Link to="/shop" className="btn-primary flex items-center gap-3">{hero.shopNow}<ArrowRight size={18} /></Link>
              <Link to="/about" className="btn-secondary">{hero.ourStory}</Link>
            </motion.div>
          </motion.div>
        </div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-white/40 text-xs tracking-[0.2em] font-body">{hero.scroll}</span>
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity }}><ChevronDown size={20} className="text-blood" /></motion.div>
        </motion.div>
      </section>

      <section className="py-24 bg-noir">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-12">
            <div><p className="section-subtitle mb-3">{feat.tagline}</p><h2 className="section-title">{feat.title} <span className="text-blood">.</span></h2></div>
            <Link to="/shop" className="group flex items-center gap-2 text-white/60 hover:text-white transition-colors duration-300"><span className="font-body text-sm tracking-wider">{feat.viewAll}</span><ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" /></Link>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">{featuredProducts.map((p, i) => (<ProductCard key={p.id} product={p} index={i} />))}</div>
        </div>
      </section>

      <section className="relative py-32 bg-ash">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="relative"><div className="aspect-[4/5] overflow-hidden"><img src={philImg} alt="" className="w-full h-full object-cover" /></div><div className="absolute -bottom-6 -right-6 w-48 h-48 border border-blood/30 hidden lg:block" /></motion.div>
          <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }} className="lg:pl-8">
            <p className="section-subtitle mb-3">{phil.tagline}</p><h2 className="section-title mb-8">{phil.title1} <br />{phil.title2}</h2>
            <div className="space-y-6 text-white/70 font-body leading-relaxed"><p>{phil.text1}</p><p>{phil.text2}</p><p>{phil.text3}</p></div>
            <Link to="/about" className="btn-primary inline-flex items-center gap-3 mt-10">{phil.button}<ArrowRight size={18} /></Link>
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-noir">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12"><p className="section-subtitle mb-3">{best.tagline}</p><h2 className="section-title">{best.title} <span className="text-blood">.</span></h2></motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">{bestsellers.map((p, i) => (<ProductCard key={p.id} product={p} index={i} />))}</div>
        </div>
      </section>

      <section className="py-24 bg-ash">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12"><p className="section-subtitle mb-3">{coll.tagline}</p><h2 className="section-title">{coll.title} <span className="text-blood">.</span></h2></motion.div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {[{ nameKey: 'shop.categoryHoodies', slug: 'hoodies', image: products.find(p => p.category === 'hoodies')?.images[0] },{ nameKey: 'shop.categoryTShirts', slug: 't-shirts', image: products.find(p => p.category === 't-shirts')?.images[0] },{ nameKey: 'shop.categoryJackets', slug: 'jackets', image: products.find(p => p.category === 'jackets')?.images[0] },{ nameKey: 'shop.categoryPants', slug: 'pants', image: products.find(p => p.category === 'pants')?.images[0] },{ nameKey: 'shop.categoryAccessories', slug: 'accessories', image: products.find(p => p.category === 'accessories')?.images[0] },{ nameKey: 'shop.categoryFootwear', slug: 'footwear', image: products.find(p => p.category === 'footwear')?.images[0] }].map((cat, i) => (
              <motion.div key={cat.slug} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Link to={`/shop?category=${cat.slug}`} className="group relative block aspect-[4/3] overflow-hidden bg-noir"><img src={cat.image} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" /><div className="absolute inset-0 bg-gradient-to-t from-noir via-noir/40 to-transparent" /><div className="absolute bottom-4 left-4 right-4"><h3 className="font-heading text-lg tracking-[0.2em] text-white group-hover:text-blood transition-colors duration-300">{t(cat.nameKey).toUpperCase()}</h3></div></Link>
              </motion.div>))}
          </div>
        </div>
      </section>
    </div>
  );
}
