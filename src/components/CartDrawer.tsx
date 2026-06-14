import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '../store/CartContext';

export function CartDrawer() {
  const { t } = useTranslation();
  const { items, isOpen, closeCart, removeItem, updateQuantity, totalPrice, totalItems } = useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-noir/80 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-ash z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
              <div className="flex items-center gap-3">
                <ShoppingBag size={20} className="text-blood" />
                <h2 className="font-heading text-lg tracking-wider">
                  {t('cart.yourCart')} ({totalItems})
                </h2>
              </div>
              <button
                onClick={closeCart}
                className="p-2 text-white/60 hover:text-white transition-colors duration-300"
              >
                <X size={24} />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-16 h-16 border border-white/10 rounded-full flex items-center justify-center mb-4">
                    <ShoppingBag size={24} className="text-white/40" />
                  </div>
                  <p className="text-white/60 font-body mb-6">{t('cart.cartEmpty')}</p>
                  <Link
                    to="/shop"
                    onClick={closeCart}
                    className="btn-secondary"
                  >
                    {t('common.continueShopping')}
                  </Link>
                </div>
              ) : (
                <ul className="space-y-6">
                  {items.map((item, index) => (
                    <motion.li
                      key={`${item.product.id}-${item.size}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex gap-4"
                    >
                      <Link
                        to={`/product/${item.product.slug}`}
                        onClick={closeCart}
                        className="w-24 h-32 bg-noir flex-shrink-0 overflow-hidden"
                      >
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </Link>
                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div>
                          <Link
                            to={`/product/${item.product.slug}`}
                            onClick={closeCart}
                            className="font-heading text-sm tracking-wider hover:text-blood transition-colors duration-300"
                          >
                            {item.product.name}
                          </Link>
                          <p className="text-white/60 text-sm mt-1">{t('cart.size')}: {item.size}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center border border-white/10">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1)}
                              className="p-2 text-white/60 hover:text-white transition-colors duration-200"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-10 text-center font-mono text-sm">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1)}
                              className="p-2 text-white/60 hover:text-white transition-colors duration-200"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          <p className="font-mono text-white">
                            ${item.product.price * item.quantity}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item.product.id, item.size)}
                        className="self-start p-1 text-white/40 hover:text-blood transition-colors duration-300"
                      >
                        <X size={18} />
                      </button>
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="px-6 py-5 border-t border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white/60 font-body">{t('cart.subtotal')}</span>
                  <span className="font-mono text-xl">${totalPrice.toFixed(2)}</span>
                </div>
                <p className="text-white/40 text-sm">
                  {t('cart.shippingTaxes')}
                </p>
                <Link
                  to="/checkout"
                  onClick={closeCart}
                  className="btn-primary w-full flex items-center justify-center gap-3"
                >
                  {t('common.checkout')}
                  <ArrowRight size={18} />
                </Link>
                <button
                  onClick={closeCart}
                  className="w-full py-3 text-white/60 hover:text-white font-body text-sm transition-colors duration-300"
                >
                  {t('cart.continueShopping')}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
