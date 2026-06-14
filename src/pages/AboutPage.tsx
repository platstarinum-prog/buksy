import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { aboutPage } from '../data/content';

export function AboutPage() {
  const { t } = useTranslation();
  const hero = aboutPage.hero || {};
  const phil = aboutPage.philosophy || {};
  const vals = aboutPage.values || {};
  const at = aboutPage.atelier || {};
  const tl = aboutPage.timeline || {};
  const cta = aboutPage.cta || {};

  return (
    <div className="min-h-screen bg-noir pt-24">
      <section className="relative h-[70vh] overflow-hidden">
        <div className="absolute inset-0"><img src={hero.image} alt="" className="w-full h-full object-cover" /><div className="absolute inset-0 bg-gradient-to-r from-noir via-noir/60 to-transparent" /><div className="absolute inset-0 bg-gradient-to-t from-noir via-transparent to-noir/50" /></div>
        <div className="relative z-10 h-full flex flex-col justify-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <p className="section-subtitle mb-4">{hero.tagline}</p>
            <h1 className="section-title max-w-2xl">{hero.title1} <br /><span className="text-blood">{hero.title2}</span></h1>
          </motion.div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
              <blockquote className="relative"><p className="font-display text-2xl md:text-3xl font-light text-white leading-relaxed mb-6">{phil.quote}</p><footer className="text-white/60 font-body"><span className="text-blood">—</span> {phil.author}</footer></blockquote>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }} className="relative"><div className="aspect-[3/4] overflow-hidden"><img src={phil.image} alt="" className="w-full h-full object-cover" /></div></motion.div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-ash">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <p className="section-subtitle mb-3">{vals.tagline}</p><h2 className="section-title">{vals.title} <span className="text-blood">.</span></h2>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">{(vals.items || []).map((v: any, i: number) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="group p-6 border border-white/5 hover:border-blood/30 transition-colors duration-500">
              <span className="font-mono text-blood text-sm mb-4 block">0{i + 1}</span><h3 className="font-heading text-lg tracking-wider mb-3 group-hover:text-blood transition-colors duration-300">{v.title}</h3><p className="text-white/60 font-body text-sm leading-relaxed">{v.description}</p>
            </motion.div>))}</div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="lg:col-span-2"><div className="aspect-[16/9] overflow-hidden"><img src={at.image} alt="" className="w-full h-full object-cover" /></div></motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="flex flex-col justify-center space-y-6">
              <h3 className="font-heading text-2xl tracking-wider">{at.title}</h3><p className="text-white/70 font-body leading-relaxed">{at.description1}</p><p className="text-white/70 font-body leading-relaxed">{at.description2}</p>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-ash">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16"><p className="section-subtitle mb-3">{tl.tagline}</p><h2 className="section-title">{tl.title} <span className="text-blood">.</span></h2></motion.div>
          <div className="relative"><div className="absolute left-1/2 top-0 bottom-0 w-px bg-blood/20 hidden md:block" />
            <div className="space-y-12">{(tl.events || []).map((item: any, i: number) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="flex flex-col md:flex-row items-center gap-6">
                <div className={`flex-1 text-center ${i % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>{i % 2 === 0 ? (<><span className="font-mono text-blood text-3xl">{item.year}</span><h4 className="font-heading text-lg mt-2">{item.event}</h4></>) : <div className="hidden md:block" />}</div>
                <div className="w-4 h-4 bg-blood rounded-full relative z-10 hidden md:block flex-shrink-0" />
                <div className={`flex-1 text-center ${i % 2 === 1 ? 'md:text-left' : 'md:text-right'}`}>{i % 2 === 1 ? (<><span className="font-mono text-blood text-3xl">{item.year}</span><h4 className="font-heading text-lg mt-2">{item.event}</h4></>) : <div className="hidden md:block" />}</div>
                <div className="flex items-center gap-4 md:hidden"><span className="font-mono text-blood text-2xl">{item.year}</span><h4 className="font-heading text-base">{item.event}</h4></div>
              </motion.div>))}</div>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-light mb-6">{cta.title1} <span className="text-blood">{cta.title2}</span></h2>
            <p className="text-white/60 font-body max-w-xl mx-auto mb-10">{cta.description}</p>
            <Link to="/shop" className="btn-primary inline-flex items-center gap-3">{cta.button}<ArrowRight size={18} /></Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
