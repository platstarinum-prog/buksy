import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CreditCard,
  Lock,
  Check,
  ArrowLeft,
  Truck,
  Shield,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCart } from '../store/CartContext';

type CheckoutStep = 'information' | 'shipping' | 'payment';

export function CheckoutPage() {
  const { t } = useTranslation();
  const { items, totalPrice, clearCart } = useCart();
  const [step, setStep] = useState<CheckoutStep>('information');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    apartment: '',
    city: '',
    country: '',
    postalCode: '',
  });

  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    cardHolder: '',
    expiry: '',
    cvv: '',
  });

  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');

  const shippingCost = totalPrice >= 150 ? 0 : shippingMethod === 'express' ? 25 : 15;
  const tax = totalPrice * 0.08;
  const total = totalPrice + shippingCost + tax;

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    // Simulate processing — replace with real payment API
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsProcessing(false);
    setIsComplete(true);
    clearCart();
  };

  if (items.length === 0 && !isComplete) {
    return (
      <div className="min-h-screen bg-noir pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="font-heading text-2xl mb-4">{t('checkout.yourCartEmpty')}</h1>
          <Link to="/shop" className="btn-primary">
            {t('checkout.continueShopping')}
          </Link>
        </div>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="min-h-screen bg-noir pt-24">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <div className="w-20 h-20 border-2 border-blood rounded-full flex items-center justify-center mx-auto">
              <Check size={40} className="text-blood" />
            </div>
            <h1 className="font-display text-4xl font-light">{t('checkout.orderConfirmed')}</h1>
            <p className="text-white/60 font-body max-w-md mx-auto">
              {t('checkout.orderConfirmedDesc')}
            </p>
            <p className="text-white/40 font-mono text-sm">{t('checkout.orderPrefix')}{Date.now().toString().slice(-6)}</p>
            <div className="pt-8">
              <Link
                to="/shop"
                onClick={() => clearCart()}
                className="btn-primary"
              >
                {t('checkout.continueShopping2')}
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  const steps: { id: CheckoutStep; nameKey: string }[] = [
    { id: 'information', nameKey: 'checkout.information' },
    { id: 'shipping', nameKey: 'checkout.shippingStep' },
    { id: 'payment', nameKey: 'checkout.paymentStep' },
  ];

  return (
    <div className="min-h-screen bg-noir pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <Link
            to="/cart"
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors duration-300"
          >
            <ArrowLeft size={18} />
            <span className="font-body text-sm">{t('checkout.returnToCart')}</span>
          </Link>
          <Link to="/" className="font-heading text-2xl tracking-[0.2em] text-blood">
            BUKSY
          </Link>
          <div className="flex items-center gap-2 text-white/40">
            <Lock size={14} />
            <span className="font-body text-xs">{t('checkout.secureCheckout')}</span>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          {steps.map((s, index) => (
            <div key={s.id} className="flex items-center">
              <div
                className={`flex items-center gap-2 ${
                  steps.findIndex((st) => st.id === step) >= index
                    ? 'text-blood'
                    : 'text-white/40'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full border flex items-center justify-center ${
                    steps.findIndex((st) => st.id === step) > index
                      ? 'border-blood bg-blood text-white'
                      : step === s.id
                        ? 'border-blood'
                        : 'border-white/20'
                  }`}
                >
                  {steps.findIndex((st) => st.id === step) > index ? (
                    <Check size={14} />
                  ) : (
                    <span className="font-mono text-sm">{index + 1}</span>
                  )}
                </div>
                <span className="font-body text-sm hidden sm:block">{t(s.nameKey)}</span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-12 lg:w-24 h-px mx-4 ${
                    steps.findIndex((st) => st.id === step) > index
                      ? 'bg-blood'
                      : 'bg-white/10'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-5 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              {step === 'information' && (
                <div className="space-y-6">
                  <h2 className="font-heading text-xl tracking-wider mb-6">
                    {t('checkout.contactInfo')}
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder={t('checkout.firstName')}
                      value={shippingInfo.firstName}
                      onChange={(e) =>
                        setShippingInfo({ ...shippingInfo, firstName: e.target.value })
                      }
                      className="checkout-input"
                    />
                    <input
                      type="text"
                      placeholder={t('checkout.lastName')}
                      value={shippingInfo.lastName}
                      onChange={(e) =>
                        setShippingInfo({ ...shippingInfo, lastName: e.target.value })
                      }
                      className="checkout-input"
                    />
                  </div>
                  <input
                    type="email"
                    placeholder={t('checkout.email')}
                    value={shippingInfo.email}
                    onChange={(e) =>
                      setShippingInfo({ ...shippingInfo, email: e.target.value })
                    }
                    className="checkout-input w-full"
                  />
                  <input
                    type="tel"
                    placeholder={t('checkout.phone')}
                    value={shippingInfo.phone}
                    onChange={(e) =>
                      setShippingInfo({ ...shippingInfo, phone: e.target.value })
                    }
                    className="checkout-input w-full"
                  />

                  <h3 className="font-heading text-xl tracking-wider mt-8 mb-6">
                    {t('checkout.shippingAddress')}
                  </h3>
                  <input
                    type="text"
                    placeholder={t('checkout.address')}
                    value={shippingInfo.address}
                    onChange={(e) =>
                      setShippingInfo({ ...shippingInfo, address: e.target.value })
                    }
                    className="checkout-input w-full"
                  />
                  <input
                    type="text"
                    placeholder={t('checkout.apartment')}
                    value={shippingInfo.apartment}
                    onChange={(e) =>
                      setShippingInfo({ ...shippingInfo, apartment: e.target.value })
                    }
                    className="checkout-input w-full"
                  />
                  <div className="grid sm:grid-cols-3 gap-4">
                    <input
                      type="text"
                      placeholder={t('checkout.city')}
                      value={shippingInfo.city}
                      onChange={(e) =>
                        setShippingInfo({ ...shippingInfo, city: e.target.value })
                      }
                      className="checkout-input"
                    />
                    <input
                      type="text"
                      placeholder={t('checkout.country')}
                      value={shippingInfo.country}
                      onChange={(e) =>
                        setShippingInfo({ ...shippingInfo, country: e.target.value })
                      }
                      className="checkout-input"
                    />
                    <input
                      type="text"
                      placeholder={t('checkout.postalCode')}
                      value={shippingInfo.postalCode}
                      onChange={(e) =>
                        setShippingInfo({ ...shippingInfo, postalCode: e.target.value })
                      }
                      className="checkout-input"
                    />
                  </div>

                  <button
                    onClick={() => setStep('shipping')}
                    className="btn-primary w-full mt-8"
                  >
                    {t('checkout.continueToShipping')}
                  </button>
                </div>
              )}

              {step === 'shipping' && (
                <div className="space-y-6">
                  <h2 className="font-heading text-xl tracking-wider mb-6">
                    {t('checkout.shippingMethod')}
                  </h2>
                  <div className="space-y-4">
                    <label
                      className={`flex items-center justify-between p-6 border cursor-pointer transition-colors duration-300 ${
                        shippingMethod === 'standard'
                          ? 'border-blood bg-blood/5'
                          : 'border-white/10 hover:border-white/30'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <input
                          type="radio"
                          name="shipping"
                          value="standard"
                          checked={shippingMethod === 'standard'}
                          onChange={() => setShippingMethod('standard')}
                          className="w-4 h-4 accent-blood"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <Truck size={18} className="text-blood" />
                            <span className="font-heading text-sm tracking-wider">
                              {t('checkout.standardShipping')}
                            </span>
                          </div>
                          <p className="text-white/60 font-body text-sm mt-1">
                            {t('checkout.standardDays')}
                          </p>
                        </div>
                      </div>
                      <span className="font-mono">
                        {totalPrice >= 150 ? (
                          <span className="text-blood">{t('common.free')}</span>
                        ) : (
                          '$15'
                        )}
                      </span>
                    </label>
                    <label
                      className={`flex items-center justify-between p-6 border cursor-pointer transition-colors duration-300 ${
                        shippingMethod === 'express'
                          ? 'border-blood bg-blood/5'
                          : 'border-white/10 hover:border-white/30'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <input
                          type="radio"
                          name="shipping"
                          value="express"
                          checked={shippingMethod === 'express'}
                          onChange={() => setShippingMethod('express')}
                          className="w-4 h-4 accent-blood"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <Truck size={18} className="text-blood" />
                            <span className="font-heading text-sm tracking-wider">
                              {t('checkout.expressShipping')}
                            </span>
                          </div>
                          <p className="text-white/60 font-body text-sm mt-1">
                            {t('checkout.expressDays')}
                          </p>
                        </div>
                      </div>
                      <span className="font-mono">$25</span>
                    </label>
                  </div>

                  <div className="flex gap-4 mt-8">
                    <button onClick={() => setStep('information')} className="btn-secondary flex-1">
                      {t('checkout.back')}
                    </button>
                    <button
                      onClick={() => setStep('payment')}
                      className="btn-primary flex-1"
                    >
                      {t('checkout.continueToPayment')}
                    </button>
                  </div>
                </div>
              )}

              {step === 'payment' && (
                <div className="space-y-6">
                  <h2 className="font-heading text-xl tracking-wider mb-6">
                    {t('checkout.payment')}
                  </h2>
                  <div className="p-6 border border-white/10 bg-ash">
                    <div className="flex items-center gap-3 mb-6">
                      <CreditCard className="text-blood" size={24} />
                      <span className="font-heading tracking-wider">{t('checkout.creditCard')}</span>
                      <div className="ml-auto flex gap-2">
                        <img
                          src="https://cdn.jsdelivr.net/gh/lipis/flag-icons@6.6.6/flags/4x3/us.svg"
                          alt="Visa"
                          className="w-8 h-5 object-contain opacity-60"
                        />
                        <img
                          src="https://cdn.jsdelivr.net/gh/lipis/flag-icons@6.6.6/flags/4x3/gb.svg"
                          alt="Mastercard"
                          className="w-8 h-5 object-contain opacity-60"
                        />
                        <img
                          src="https://cdn.jsdelivr.net/gh/lipis/flag-icons@6.6.6/flags/4x3/de.svg"
                          alt="Amex"
                          className="w-8 h-5 object-contain opacity-60"
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <input
                        type="text"
                        placeholder={t('checkout.cardNumber')}
                        value={paymentInfo.cardNumber}
                        onChange={(e) =>
                          setPaymentInfo({ ...paymentInfo, cardNumber: e.target.value })
                        }
                        className="checkout-input w-full"
                      />
                      <input
                        type="text"
                        placeholder={t('checkout.cardHolder')}
                        value={paymentInfo.cardHolder}
                        onChange={(e) =>
                          setPaymentInfo({ ...paymentInfo, cardHolder: e.target.value })
                        }
                        className="checkout-input w-full"
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder={t('checkout.expiry')}
                          value={paymentInfo.expiry}
                          onChange={(e) =>
                            setPaymentInfo({ ...paymentInfo, expiry: e.target.value })
                          }
                          className="checkout-input"
                        />
                        <input
                          type="text"
                          placeholder={t('checkout.cvv')}
                          value={paymentInfo.cvv}
                          onChange={(e) =>
                            setPaymentInfo({ ...paymentInfo, cvv: e.target.value })
                          }
                          className="checkout-input"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 mt-8">
                    <button onClick={() => setStep('shipping')} className="btn-secondary flex-1">
                      {t('checkout.back2')}
                    </button>
                    <button
                      onClick={handlePlaceOrder}
                      disabled={isProcessing}
                      className="btn-primary flex-1 flex items-center justify-center gap-2"
                    >
                      {isProcessing ? (
                        <span className="animate-spin">{t('checkout.processing')}</span>
                      ) : (
                        <>
                          <Lock size={16} />
                          {t('checkout.placeOrder')}
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-center gap-6 text-white/40 text-xs font-body mt-6">
                    <span className="flex items-center gap-1">
                      <Shield size={14} />
                      {t('checkout.secureSSL')}
                    </span>
                    <span>{t('checkout.protectedStripe')}</span>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="sticky top-28 p-6 border border-white/5 bg-ash">
              <h3 className="font-heading text-sm tracking-wider mb-4 text-white/40">
                {t('checkout.orderSummary')}
              </h3>
              <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                {items.map((item) => (
                  <div
                    key={`${item.product.id}-${item.size}`}
                    className="flex gap-4 py-3 border-b border-white/5"
                  >
                    <div className="relative">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-16 h-20 object-cover"
                      />
                      <span className="absolute -top-2 -right-2 w-5 h-5 bg-blood text-white text-xs rounded-full flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-body text-sm">{item.product.name}</p>
                      <p className="text-white/40 font-body text-xs mt-1">{item.size}</p>
                    </div>
                    <span className="font-mono text-sm">
                      ${item.product.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>
              <div className="space-y-3 pt-4 mt-4 border-t border-white/5">
                <div className="flex justify-between text-sm font-body">
                  <span className="text-white/60">{t('checkout.subtotal')}</span>
                  <span className="font-mono">${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-body">
                  <span className="text-white/60">{t('checkout.shipping')}</span>
                  <span className="font-mono">
                    {shippingCost === 0 ? t('common.free') : `$${shippingCost.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-body">
                  <span className="text-white/60">{t('checkout.tax')}</span>
                  <span className="font-mono">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg border-t border-white/5 pt-3">
                  <span className="font-heading tracking-wider">{t('checkout.total')}</span>
                  <span className="font-mono text-xl">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
