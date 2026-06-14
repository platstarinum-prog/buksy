import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { editorialPage } from '../data/content';

export function EditorialPage() {
  const { t } = useTranslation();
  const hero = editorialPage.hero || {};
  const bs = editorialPage.behindScenes || {};
  const fn = editorialPage.finale || {};

  return (
    <div className="min-h-screen bg-noir pt-24">
      <section className="relative h-[80vh] overflow-hidden">
        <div className="absolute inset-0"><img src={hero.image} alt="" className="w-full h-full object-cover" /><div className="absolute inset-0 bg-gradient-to-r from-noir via-noir/60 to-transparent" /><div className="absolute inset-0 bg-gradient-to-t from-noir via-transparent to-noir/50" /></div>
        <div className="relative z-10 h-full flex flex-col justify-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <p className="section-subtitle mb-4">{hero.subtitle}</p>
            <h1 className="section-title max-w-2xl">{hero.title} <span className="text-blood">.</span></h1>
            <p className="text-lg text-white/70 leading-relaxed max-w-xl mt-6 mb-10 font-body">{hero.description}</p>
            <Link to="/shop" className="btn-primary inline-flex items-center gap-3">{hero.button}<ArrowRight size={18} /></Link>
          </motion.div>
        </div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-white/40 text-xs tracking-[0.2em] font-body">{hero.scroll}</span>
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity }}><ChevronDown size={20} className="text-blood" /></motion.div>
        </motion.div>
      </section>

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
          {(editorialPage.lookbook || []).map((item: any, i: number) => (
            <motion.div key={i} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className={`flex flex-col ${i % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12`}>
              <div className="lg:w-2/3"><div className="aspect-[4/3] overflow-hidden"><img src={item.image} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" /></div></div>
              <div className="lg:w-1/3"><p className="font-display text-2xl font-light text-white/80 leading-relaxed italic">"{item.caption}"</p></div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-24 bg-ash">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}><div className="aspect-[4/3] overflow-hidden"><img src={bs.image} alt="" className="w-full h-full object-cover" /></div></motion.div>
            <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
              <h2 className="font-heading text-3xl tracking-wider mb-4">{bs.title}</h2>
              <p className="text-white/70 font-body leading-relaxed mb-8">{bs.description}</p>
              <Link to="/about" className="btn-secondary inline-flex items-center gap-3">{bs.button}<ArrowRight size={18} /></Link>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="h-screen relative overflow-hidden">
        <img src={fn.image} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-noir via-noir/30 to-transparent" />
        <div className="absolute bottom-16 left-8 lg:left-16 max-w-xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-display text-4xl md:text-5xl font-light text-white mb-4">{fn.title}</h2>
            <Link to="/shop" className="btn-primary inline-flex items-center gap-3">{fn.button}<ArrowRight size={18} /></Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
