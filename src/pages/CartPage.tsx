import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Minus, Plus, X, ShoppingBag, ArrowRight, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCart } from '../store/CartContext';

export function CartPage() {
  const { t } = useTranslation();
  const { items, removeItem, updateQuantity, totalPrice, totalItems, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-noir pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center text-center py-24"
          >
            <div className="w-24 h-24 border border-white/10 rounded-full flex items-center justify-center mb-6">
              <ShoppingBag size={40} className="text-white/40" />
            </div>
            <h1 className="font-heading text-2xl tracking-wider mb-4">{t('cart.yourCartEmpty')}</h1>
            <p className="text-white/60 font-body mb-8 max-w-md">
              {t('cart.cartEmptyDesc')}
            </p>
            <Link to="/shop" className="btn-primary flex items-center gap-3">
              {t('cart.startShopping')}
              <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  const shippingCost = totalPrice >= 150 ? 0 : 15;
  const totalWithShipping = totalPrice + shippingCost;

  return (
    <div className="min-h-screen bg-noir pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-12"
        >
          <div>
            <p className="section-subtitle mb-2">{t('cart.shopping')}</p>
            <h1 className="section-title">
              {t('cart.yourCartTitle')} <span className="text-blood">.</span>
            </h1>
          </div>
          <Link
            to="/shop"
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors duration-300"
          >
            <ArrowLeft size={18} />
            <span className="font-body text-sm">{t('cart.continueShopping')}</span>
          </Link>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Clear Cart */}
            <div className="flex justify-end">
              <button
                onClick={clearCart}
                className="text-sm text-white/40 hover:text-blood transition-colors duration-300 font-body"
              >
{t('cart.clearCart')}
              </button>
            </div>

            {/* Items List */}
            {items.map((item, index) => (
              <motion.div
                key={`${item.product.id}-${item.size}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-6 p-6 border border-white/5 bg-ash"
              >
                <Link
                  to={`/product/${item.product.slug}`}
                  className="w-32 h-40 flex-shrink-0 overflow-hidden"
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
                      className="font-heading text-lg tracking-wider hover:text-blood transition-colors duration-300"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-white/60 font-body mt-1">{t('cart.size')}: {item.size}</p>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center border border-white/10">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1)}
                        className="p-3 text-white/60 hover:text-white transition-colors duration-200"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-12 text-center font-mono">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1)}
                        className="p-3 text-white/60 hover:text-white transition-colors duration-200"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <p className="font-mono text-xl text-white">
                      ${item.product.price * item.quantity}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeItem(item.product.id, item.size)}
                  className="self-start p-2 text-white/40 hover:text-blood transition-colors duration-300"
                >
                  <X size={20} />
                </button>
              </motion.div>
            ))}
          </div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="sticky top-28 p-8 border border-white/5 bg-ash space-y-6">
              <h2 className="font-heading text-xl tracking-wider mb-6">
                {t('checkout.orderSummary')}
              </h2>

              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/60 font-body">{t('cart.subtotal')} ({totalItems} items)</span>
                  <span className="font-mono">${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60 font-body">{t('cart.shipping')}</span>
                  <span className="font-mono">
                    {shippingCost === 0 ? (
                      <span className="text-blood">{t('common.free')}</span>
                    ) : (
                      `$${shippingCost.toFixed(2)}`
                    )}
                  </span>
                </div>
                {totalPrice < 150 && (
                  <p className="text-white/40 text-xs font-body">
                    {t('cart.freeShippingHint').replace('{{amount}}', (150 - totalPrice).toFixed(2))}
                  </p>
                )}
                <div className="border-t border-white/5 pt-4">
                  <div className="flex justify-between text-lg">
                    <span className="font-heading tracking-wider">{t('cart.total')}</span>
                    <span className="font-mono">${totalWithShipping.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Promo Code */}
              <div className="pt-4">
                <label className="block text-white/40 text-xs font-body mb-2">
                  {t('cart.promoCode')}
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder={t('cart.promoPlaceholder')}
                    className="flex-1 px-4 py-3 bg-noir border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-blood/50 transition-colors duration-300"
                  />
                  <button
                    onClick={(e) => {
                      const input = (e.currentTarget as HTMLElement).previousElementSibling as HTMLInputElement;
                      if (input.value.trim()) {
                        alert(t('cart.promoInvalid') + ' "' + input.value + '"');
                        input.value = '';
                      }
                    }}
                    className="px-4 py-3 border border-white/10 text-white/70 hover:border-blood hover:text-blood transition-colors duration-300 font-body text-sm"
                  >
                    {t('cart.apply')}
                  </button>
                </div>
              </div>

              <Link
                to="/checkout"
                className="btn-primary w-full flex items-center justify-center gap-3 mt-6"
              >
                {t('common.checkout')}
                <ArrowRight size={18} />
              </Link>

              <p className="text-center text-white/40 text-xs font-body pt-4">
                {t('checkout.secureSSL')}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
