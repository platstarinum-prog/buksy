import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, Phone, Send, Instagram, Twitter, Youtube } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { contactInfo } from '../data/content';
import { usePageTranslation } from '../i18n/usePageTranslation';

export function ContactPage() {
  const { t } = useTranslation();
  const ci = usePageTranslation(contactInfo, 'uk');
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await fetch('/.netlify/functions/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
      setIsSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch { setIsSubmitted(true); }
    finally { setIsSubmitting(false); }
  };

  return (
    <div className="min-h-screen bg-noir pt-24">
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="section-subtitle mb-3">{ci.hero?.tagline}</p>
            <h1 className="section-title">{ci.hero?.title} <span className="text-blood">.</span></h1>
          </motion.div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
              <h2 className="font-heading text-2xl tracking-wider mb-8">{ci.form?.title}</h2>
              {isSubmitted ? (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-8 border border-blood/30 bg-blood/5">
                  <div className="w-16 h-16 border border-blood rounded-full flex items-center justify-center mb-6 mx-auto"><Send className="w-8 h-8 text-blood" /></div>
                  <h3 className="font-heading text-xl text-center mb-2">{ci.form?.successTitle}</h3>
                  <p className="text-white/60 text-center font-body">{ci.form?.successText}</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block font-body text-sm text-white/60 mb-2">{ci.form?.nameLabel}</label>
                      <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="w-full px-4 py-3 bg-ash border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-blood/50 transition-colors duration-300" placeholder={ci.form?.namePlaceholder} />
                    </div>
                    <div>
                      <label className="block font-body text-sm text-white/60 mb-2">{ci.form?.emailLabel}</label>
                      <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required className="w-full px-4 py-3 bg-ash border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-blood/50 transition-colors duration-300" placeholder={ci.form?.emailPlaceholder} />
                    </div>
                  </div>
                  <div>
                    <label className="block font-body text-sm text-white/60 mb-2">{ci.form?.subjectLabel}</label>
                    <select value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} required className="w-full px-4 py-3 bg-ash border border-white/10 text-white focus:outline-none focus:border-blood/50 transition-colors duration-300 appearance-none">
                      <option value="" className="bg-noir">{ci.form?.subjectPlaceholder}</option>
                      {(ci.form?.subjectOptions || []).map((opt: any) => (<option key={opt.value} value={opt.value} className="bg-noir">{opt.label}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-body text-sm text-white/60 mb-2">{ci.form?.messageLabel}</label>
                    <textarea value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} required rows={6} className="w-full px-4 py-3 bg-ash border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-blood/50 transition-colors duration-300 resize-none" placeholder={ci.form?.messagePlaceholder} />
                  </div>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={isSubmitting} className="btn-primary w-full flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed">
                    {isSubmitting ? '...' : ci.form?.submitButton}<Send size={18} />
                  </motion.button>
                </form>
              )}
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
              <h2 className="font-heading text-2xl tracking-wider mb-8">{ci.info?.title}</h2>
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 border border-blood/30 flex items-center justify-center flex-shrink-0"><Mail className="w-5 h-5 text-blood" /></div>
                  <div>
                    <h3 className="font-heading text-sm tracking-wider mb-1">{ci.info?.emailLabel}</h3>
                    <a href={`mailto:${ci.info?.email || ''}`} className="text-white/70 font-body hover:text-blood transition-colors duration-300">{ci.info?.email}</a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 border border-blood/30 flex items-center justify-center flex-shrink-0"><Phone className="w-5 h-5 text-blood" /></div>
                  <div>
                    <h3 className="font-heading text-sm tracking-wider mb-1">{ci.info?.phoneLabel}</h3>
                    <p className="text-white/70 font-body">{ci.info?.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 border border-blood/30 flex items-center justify-center flex-shrink-0"><MapPin className="w-5 h-5 text-blood" /></div>
                  <div>
                    <h3 className="font-heading text-sm tracking-wider mb-1">{ci.info?.studioLabel}</h3>
                    <p className="text-white/70 font-body whitespace-pre-line">{ci.info?.studio}</p>
                  </div>
                </div>
              </div>
              <div className="mt-12">
                <h3 className="font-heading text-sm tracking-wider mb-4 text-white/40">{ci.social?.title}</h3>
                <div className="flex gap-4">
                  <a href={ci.social?.instagram} target="_blank" rel="noopener noreferrer" className="w-12 h-12 border border-white/10 flex items-center justify-center text-white/60 hover:border-blood hover:text-blood transition-all duration-300"><Instagram size={20} /></a>
                  <a href={ci.social?.twitter} target="_blank" rel="noopener noreferrer" className="w-12 h-12 border border-white/10 flex items-center justify-center text-white/60 hover:border-blood hover:text-blood transition-all duration-300"><Twitter size={20} /></a>
                  <a href={ci.social?.youtube} target="_blank" rel="noopener noreferrer" className="w-12 h-12 border border-white/10 flex items-center justify-center text-white/60 hover:border-blood hover:text-blood transition-all duration-300"><Youtube size={20} /></a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-ash">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <p className="section-subtitle mb-3">{ci.faq?.tagline}</p>
            <h2 className="section-title">{ci.faq?.title} <span className="text-blood">.</span></h2>
          </motion.div>
          <div className="space-y-4">
            {(ci.faq?.items || []).map((item: any, idx: number) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.05 }} className="border border-white/5">
                <button onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)} className="w-full flex items-center justify-between p-6 text-left hover:bg-white/[0.02] transition-colors duration-300">
                  <span className="font-heading text-sm tracking-wider pr-8">{item.question}</span>
                  <motion.span animate={{ rotate: expandedFaq === idx ? 45 : 0 }} className="text-blood text-2xl font-light">+</motion.span>
                </button>
                <motion.div initial={false} animate={{ height: expandedFaq === idx ? 'auto' : 0, opacity: expandedFaq === idx ? 1 : 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                  <div className="px-6 pb-6 pt-0"><p className="text-white/60 font-body text-sm leading-relaxed">{item.answer}</p></div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
