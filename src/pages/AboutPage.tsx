import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const editorialImages = [
  'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/1126964/pexels-photo-1126964.jpeg?auto=compress&cs=tinysrgb&w=800',
];

const valueKeys = [
  { titleKey: 'about.valueIntentionality', descKey: 'about.valueIntentionalityDesc' },
  { titleKey: 'about.valueQuality', descKey: 'about.valueQualityDesc' },
  { titleKey: 'about.valueRebellion', descKey: 'about.valueRebellionDesc' },
  { titleKey: 'about.valueSustainable', descKey: 'about.valueSustainableDesc' },
];

const timelineEvents = [
  { year: '2019', eventKey: 'about.event2019' },
  { year: '2020', eventKey: 'about.event2020' },
  { year: '2021', eventKey: 'about.event2021' },
  { year: '2022', eventKey: 'about.event2022' },
  { year: '2023', eventKey: 'about.event2023' },
  { year: '2024', eventKey: 'about.event2024' },
];

export function AboutPage() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-noir pt-24">
      {/* Hero */}
      <section className="relative h-[70vh] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={editorialImages[0]}
            alt="BUKSY Editorial"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-noir via-noir/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-noir via-transparent to-noir/50" />
        </div>
        <div className="relative z-10 h-full flex flex-col justify-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="section-subtitle mb-4">{t('about.ourStory')}</p>
            <h1 className="section-title max-w-2xl">
              {t('about.heroTitle1')} <br />
              <span className="text-blood">{t('about.heroTitle2')}</span>
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <p className="font-heading text-6xl md:text-7xl lg:text-8xl font-light text-white/5 absolute -left-4 top-0 select-none">
                " "
              </p>
              <blockquote className="relative">
                <p className="font-display text-2xl md:text-3xl font-light text-white leading-relaxed mb-6">
                  {t('about.philosophyQuote')}
                </p>
                <footer className="text-white/60 font-body">
                  <span className="text-blood">—</span> {t('about.theFounders')}
                </footer>
              </blockquote>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="aspect-[3/4] overflow-hidden">
                <img
                  src={editorialImages[1]}
                  alt="Atelier craftsmanship"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-8 -left-8 w-32 h-32 border border-blood/30" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-ash">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="section-subtitle mb-3">{t('about.whatWeStandFor')}</p>
            <h2 className="section-title">
              {t('about.ourValues')} <span className="text-blood">.</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {valueKeys.map((v, index) => (
              <motion.div
                key={v.titleKey}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group p-6 border border-white/5 hover:border-blood/30 transition-colors duration-500"
              >
                <span className="font-mono text-blood text-sm mb-4 block">0{index + 1}</span>
                <h3 className="font-heading text-lg tracking-wider mb-3 group-hover:text-blood transition-colors duration-300">
                  {t(v.titleKey)}
                </h3>
                <p className="text-white/60 font-body text-sm leading-relaxed">
                  {t(v.descKey)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Editorial */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-2"
            >
              <div className="aspect-[16/9] overflow-hidden">
                <img
                  src={editorialImages[2]}
                  alt="BUKSY Studio"
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-col justify-center space-y-6"
            >
              <h3 className="font-heading text-2xl tracking-wider">
                {t('about.theAtelier')}
              </h3>
              <p className="text-white/70 font-body leading-relaxed">
                {t('about.atelierDesc1')}
              </p>
              <p className="text-white/70 font-body leading-relaxed">
                {t('about.atelierDesc2')}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24 bg-ash">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="section-subtitle mb-3">{t('about.ourJourney')}</p>
            <h2 className="section-title">
              {t('about.milestones')} <span className="text-blood">.</span>
            </h2>
          </motion.div>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-blood/20 hidden md:block" />

            <div className="space-y-12">
              {timelineEvents.map((item, index) => (
                <motion.div
                  key={item.year}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex flex-col md:flex-row items-center gap-6"
                >
                  <div className={`flex-1 text-center ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                    {index % 2 === 0 ? (
                      <>
                        <span className="font-mono text-blood text-3xl">{item.year}</span>
                        <h4 className="font-heading text-lg mt-2">{t(item.eventKey)}</h4>
                      </>
                    ) : (
                      <div className="hidden md:block" />
                    )}
                  </div>
                  <div className="w-4 h-4 bg-blood rounded-full relative z-10 hidden md:block flex-shrink-0" />
                  <div className={`flex-1 text-center ${index % 2 === 1 ? 'md:text-left' : 'md:text-right'}`}>
                    {index % 2 === 1 ? (
                      <>
                        <span className="font-mono text-blood text-3xl">{item.year}</span>
                        <h4 className="font-heading text-lg mt-2">{t(item.eventKey)}</h4>
                      </>
                    ) : (
                      <div className="hidden md:block" />
                    )}
                  </div>
                  {/* Mobile view */}
                  <div className="flex items-center gap-4 md:hidden">
                    <span className="font-mono text-blood text-2xl">{item.year}</span>
                    <h4 className="font-heading text-base">{t(item.eventKey)}</h4>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-light mb-6">
              {t('about.joinMovement')} <span className="text-blood">{t('about.movement')}</span>
            </h2>
            <p className="text-white/60 font-body max-w-xl mx-auto mb-10">
              {t('about.joinDesc')}
            </p>
            <Link to="/shop" className="btn-primary inline-flex items-center gap-3">
              {t('about.exploreCollection')}
              <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
