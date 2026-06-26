import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, Phone, Send, Instagram, Music2 } from 'lucide-react';
import { contactInfo } from '../data/content';
import { useSeo } from '../hooks/useSeo';
import { apiHeaders } from '../data/settings';

export function ContactPage() {
  const hero = contactInfo.hero || {};
  useSeo({ title: hero.title || 'Контакти', description: hero.tagline });
  const form = contactInfo.form || {};
  const info = contactInfo.info || {};
  const soc = contactInfo.social || {};
  const faq = contactInfo.faq || {};
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true); setSubmitError('');
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) { setSubmitError('Enter a valid email'); setIsSubmitting(false); return; }
    if (!formData.message.trim()) { setSubmitError('Message is required'); setIsSubmitting(false); return; }
    if (formData.message.length > 4096) { setSubmitError('Message too long'); setIsSubmitting(false); return; }
    try {
      const res = await fetch('/api/contact', { method: 'POST', headers: apiHeaders(), body: JSON.stringify(formData) });
      if (!res.ok) throw new Error('Failed');
      setIsSubmitted(true); setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      console.error('Contact form error:', err);
      setSubmitError('Сталася помилка. Спробуйте ще раз.');
    } finally { setIsSubmitting(false); }
  };

  return (
    <div className="min-h-screen bg-noir pt-24">
      <section className="py-16"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"><motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}><p className="section-subtitle mb-3">{hero.tagline}</p><h1 className="section-title">{hero.title} <span className="text-blood">.</span></h1></motion.div></div></section>

      <section className="py-16"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div className="grid lg:grid-cols-2 gap-16">
        <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
          <h2 className="font-heading text-2xl tracking-wider mb-8">{form.title}</h2>
          {isSubmitted ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-8 border border-blood/30 bg-blood/5">
              <div className="w-16 h-16 border border-blood rounded-full flex items-center justify-center mb-6 mx-auto"><Send className="w-8 h-8 text-blood" /></div>
              <h3 className="font-heading text-xl text-center mb-2">{form.successTitle}</h3><p className="text-white/60 text-center font-body">{form.successText}</p>
            </motion.div>
          ) : (
            <>
            {submitError && <div className="p-3 border border-red-500/30 bg-red-500/5 text-red-400 font-body text-sm text-center">{submitError}</div>}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div><label className="block font-body text-sm text-white/60 mb-2">{form.nameLabel}</label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="w-full px-4 py-3 bg-ash border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-blood/50 transition-colors duration-300" placeholder={form.namePlaceholder} /></div>
                <div><label className="block font-body text-sm text-white/60 mb-2">{form.emailLabel}</label><input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required className="w-full px-4 py-3 bg-ash border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-blood/50 transition-colors duration-300" placeholder={form.emailPlaceholder} /></div>
              </div>
              <div><label className="block font-body text-sm text-white/60 mb-2">{form.subjectLabel}</label>
                <select value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} required className="w-full px-4 py-3 bg-ash border border-white/10 text-white focus:outline-none focus:border-blood/50 transition-colors duration-300 appearance-none">
                  <option value="" className="bg-noir">{form.subjectPlaceholder}</option>
                  {(form.subjectOptions || []).map((opt: { value: string; label: string }) => (<option key={opt.value} value={opt.value} className="bg-noir">{opt.label}</option>))}
                </select></div>
              <div><label className="block font-body text-sm text-white/60 mb-2">{form.messageLabel}</label><textarea value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} required rows={6} className="w-full px-4 py-3 bg-ash border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-blood/50 transition-colors duration-300 resize-none" placeholder={form.messagePlaceholder} /></div>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={isSubmitting} className="btn-primary w-full flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed">{isSubmitting ? '...' : form.submitButton}<Send size={18} /></motion.button>
            </form>
            </>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
          <h2 className="font-heading text-2xl tracking-wider mb-8">{info.title}</h2>
          <div className="space-y-8">
            <div className="flex items-start gap-4"><div className="w-12 h-12 border border-blood/30 flex items-center justify-center flex-shrink-0"><Mail className="w-5 h-5 text-blood" /></div><div><h3 className="font-heading text-sm tracking-wider mb-1">{info.emailLabel}</h3><a href={`mailto:${info.email || ''}`} className="text-white/70 font-body hover:text-blood transition-colors duration-300">{info.email}</a></div></div>
            <div className="flex items-start gap-4"><div className="w-12 h-12 border border-blood/30 flex items-center justify-center flex-shrink-0"><Phone className="w-5 h-5 text-blood" /></div><div><h3 className="font-heading text-sm tracking-wider mb-1">{info.phoneLabel}</h3><p className="text-white/70 font-body">{info.phone}</p></div></div>
            <div className="flex items-start gap-4"><div className="w-12 h-12 border border-blood/30 flex items-center justify-center flex-shrink-0"><MapPin className="w-5 h-5 text-blood" /></div><div><h3 className="font-heading text-sm tracking-wider mb-1">{info.studioLabel}</h3><p className="text-white/70 font-body whitespace-pre-line">{info.studio}</p></div></div>
          </div>
          <div className="mt-12"><h3 className="font-heading text-sm tracking-wider mb-4 text-white/40">{soc.title}</h3><div className="flex gap-4"><a href={soc.instagram} target="_blank" rel="noopener noreferrer" className="w-12 h-12 border border-white/10 flex items-center justify-center text-white/60 hover:border-blood hover:text-blood transition-all duration-300"><Instagram size={20} /></a><a href={soc.tiktok} target="_blank" rel="noopener noreferrer" className="w-12 h-12 border border-white/10 flex items-center justify-center text-white/60 hover:border-blood hover:text-blood transition-all duration-300"><Music2 size={20} /></a><a href={soc.telegram} target="_blank" rel="noopener noreferrer" className="w-12 h-12 border border-white/10 flex items-center justify-center text-white/60 hover:border-blood hover:text-blood transition-all duration-300"><Send size={20} /></a></div></div>
        </motion.div>
      </div></div></section>

      <section className="py-24 bg-ash"><div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12"><p className="section-subtitle mb-3">{faq.tagline}</p><h2 className="section-title">{faq.title} <span className="text-blood">.</span></h2></motion.div>
        <div className="space-y-4">{(faq.items || []).map((item: { question: string; answer: string }, i: number) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="border border-white/5">
            <button onClick={() => setExpandedFaq(expandedFaq === i ? null : i)} className="w-full flex items-center justify-between p-6 text-left hover:bg-white/[0.02] transition-colors duration-300"><span className="font-heading text-sm tracking-wider pr-8">{item.question}</span><motion.span animate={{ rotate: expandedFaq === i ? 45 : 0 }} className="text-blood text-2xl font-light">+</motion.span></button>
            <motion.div initial={false} animate={{ height: expandedFaq === i ? 'auto' : 0, opacity: expandedFaq === i ? 1 : 0 }} transition={{ duration: 0.3 }} className="overflow-hidden"><div className="px-6 pb-6 pt-0"><p className="text-white/60 font-body text-sm leading-relaxed">{item.answer}</p></div></motion.div>
          </motion.div>))}</div>
      </div></section>
    </div>
  );
}
