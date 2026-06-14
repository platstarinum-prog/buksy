import { Link } from 'react-router-dom';
import { Instagram, Twitter, Youtube, Send } from 'lucide-react';

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Shop', href: '/shop' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
];



export function Footer() {
  return (
    <footer className="bg-ash border-t border-white/5">
      {/* Newsletter Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blood/10 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-left">
              <div className="flex items-center gap-4">
                <a href="https://t.me/+OQrO3Aya1NQ4YmZi" target="_blank" rel="noopener noreferrer" className="inline-block">
                  <h3 className="font-heading text-2xl tracking-wider hover:text-blood transition-colors duration-300">
                    JOIN THE DARK SIDE
                  </h3>
                </a>
                <a
                  href="https://t.me/+OQrO3Aya1NQ4YmZi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <Send size={20} />
                  TG
                </a>
              </div>
              <p className="text-white/60 font-body">
                Subscribe for exclusive drops, early access, and 10% off your first order.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="w-14 h-14">
                <img src="/logo.png" alt="BUKSY" className="w-full h-full object-contain" />
              </div>
              <span className="font-heading text-xl tracking-[0.2em]">BUKSY</span>
            </Link>
            <p className="text-white/60 font-body text-sm leading-relaxed mb-6">
              Premium dark streetwear for those who embrace the shadows.
              Crafted with intention, designed for the unconventional.
            </p>
            <div className="flex gap-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 border border-white/10 flex items-center justify-center text-white/60
                         hover:border-blood hover:text-blood transition-all duration-300"
              >
                <Instagram size={18} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 border border-white/10 flex items-center justify-center text-white/60
                         hover:border-blood hover:text-blood transition-all duration-300"
              >
                <Twitter size={18} />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 border border-white/10 flex items-center justify-center text-white/60
                         hover:border-blood hover:text-blood transition-all duration-300"
              >
                <Youtube size={18} />
              </a>

            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-heading text-sm tracking-[0.3em] mb-6 text-white/40">
              NAVIGATION
            </h4>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-white/70 hover:text-blood transition-colors duration-300 font-body"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>


        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/40 font-body">
            <p>&copy; 2024 BUKSY. All rights reserved.</p>
            <p className="flex items-center gap-2">
              Designed for the <span className="text-blood">dark</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
