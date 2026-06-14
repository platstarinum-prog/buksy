import { Link } from 'react-router-dom';
import { Instagram, Twitter, Youtube, Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { footerData } from '../data/content';

const ft = footerData;

const navLinks = [
  { nameKey: 'footer.home', href: '/' },
  { nameKey: 'footer.shop', href: '/shop' },
  { nameKey: 'footer.about', href: '/about' },
  { nameKey: 'footer.contact', href: '/contact' },
];

const supportLinks = [
  { nameKey: 'footer.shippingReturns', href: '/shipping' },
  { nameKey: 'footer.sizeGuide', href: '/size-guide' },
  { nameKey: 'footer.faq', href: '/faq' },
  { nameKey: 'footer.trackOrder', href: '/track' },
];

const legalLinks = [
  { nameKey: 'footer.privacyPolicy', href: '/privacy' },
  { nameKey: 'footer.termsOfService', href: '/terms' },
  { nameKey: 'footer.cookiePolicy', href: '/cookies' },
];

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-ash border-t border-white/5">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blood/10 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <p className="text-white/50 font-body text-sm text-center sm:text-left max-w-md">
              {t('footer.joinTelegram')}
            </p>
            <div className="flex items-center gap-4">
              <a href={ft.newsletter.telegramUrl} target="_blank" rel="noopener noreferrer"
                className="font-heading text-xl sm:text-2xl tracking-wider hover:text-blood transition-colors duration-300">
                {t('footer.joinDarkSide')}
              </a>
              <a href={ft.newsletter.telegramUrl} target="_blank" rel="noopener noreferrer"
                className="btn-primary inline-flex items-center gap-2 text-xs">
                <Send size={18} />{t('footer.tg')}
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="w-14 h-14">
                <img src="/logo.png" alt="BUKSY" className="w-full h-full object-contain brightness-0 invert" />
              </div>
              <span className="font-heading text-xl tracking-[0.2em]">BUKSY</span>
            </Link>
            <p className="text-white/60 font-body text-sm leading-relaxed mb-6">{t('footer.premiumStreetwear')}</p>
            <div className="flex gap-4">
              <a href={ft.social.instagram} target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 border border-white/10 flex items-center justify-center text-white/60 hover:border-blood hover:text-blood transition-all duration-300">
                <Instagram size={18} />
              </a>
              <a href={ft.social.twitter} target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 border border-white/10 flex items-center justify-center text-white/60 hover:border-blood hover:text-blood transition-all duration-300">
                <Twitter size={18} />
              </a>
              <a href={ft.social.youtube} target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 border border-white/10 flex items-center justify-center text-white/60 hover:border-blood hover:text-blood transition-all duration-300">
                <Youtube size={18} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-heading text-sm tracking-[0.3em] mb-6 text-white/40">{t('footer.navigation')}</h4>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-white/70 hover:text-blood transition-colors duration-300 font-body">{t(link.nameKey)}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-sm tracking-[0.3em] mb-6 text-white/40">{t('footer.support')}</h4>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-white/70 hover:text-blood transition-colors duration-300 font-body">{t(link.nameKey)}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-sm tracking-[0.3em] mb-6 text-white/40">{t('footer.legal')}</h4>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-white/70 hover:text-blood transition-colors duration-300 font-body">{t(link.nameKey)}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col items-center gap-4">
            <div className="relative overflow-hidden rounded-full w-full md:w-auto max-w-xs mx-auto px-5 py-3 md:py-2.5 bg-white shadow-lg">
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-4 -right-3 w-16 h-16 bg-rose-300/50 rounded-full blur-xl" />
                <div className="absolute -bottom-4 -left-3 w-12 h-12 bg-rose-400/40 rounded-full blur-lg" />
                <div className="absolute top-1/4 left-1/3 w-8 h-8 bg-rose-200/30 rounded-full blur-md" />
              </div>
              <a
                href="https://krvtsv.netlify.app"
                target="_blank"
                rel="noopener noreferrer"
                className="relative block text-center text-rose-600 font-bold text-[11px] md:text-[10px] uppercase tracking-widest whitespace-nowrap hover:text-rose-500 transition-colors"
              >
                {t('footer.made_by')}
              </a>
            </div>
            <div className="text-center text-sm text-white/40 font-body">
              <p>&copy; {new Date().getFullYear()} BUKSY. {t('footer.allRightsReserved')}</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
