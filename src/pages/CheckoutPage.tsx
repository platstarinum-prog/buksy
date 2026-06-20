import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CreditCard,
  Lock,
  Check,
  ArrowLeft,
  Shield,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCart } from '../store/CartContext';
import { formatPrice } from '../data/settings';

type CheckoutStep = 'information' | 'payment';

export function CheckoutPage() {
  const { t } = useTranslation();
  const { items, totalPrice, clearCart } = useCart();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState<CheckoutStep>('information');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [orderId, setOrderId] = useState('');

  // Show confirmation only if returning from Monobank payment with valid orderId
  useEffect(() => {
    var paidOrderId = searchParams.get('orderId');
    if (paidOrderId && items.length === 0) {
      if (/^BUK-[A-Z0-9]+-[A-Z0-9]+$/.test(paidOrderId)) {
        setOrderId(paidOrderId);
        setIsComplete(true);
      }
    }
  }, []);

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
    novaPoshtaBranch: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');

  const total = totalPrice;

  const validateInformation = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!shippingInfo.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingInfo.email)) newErrors.email = 'Invalid email format';
    if (!shippingInfo.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!shippingInfo.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!shippingInfo.address.trim()) newErrors.address = 'Address is required';
    if (!shippingInfo.city.trim()) newErrors.city = 'City is required';
    if (!shippingInfo.country.trim()) newErrors.country = 'Country is required';
    if (!shippingInfo.novaPoshtaBranch.trim()) newErrors.novaPoshtaBranch = 'Відділення НП обов\'язкове';
    if (shippingInfo.phone.trim() && !/^\+?[\d\s\-()]{6,20}$/.test(shippingInfo.phone.trim()))
      newErrors.phone = 'Invalid phone format';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCardPayment = async () => {
    if (!validateInformation()) { setStep('information'); return; }
    setIsProcessing(true);
    setSubmitError('');
    try {
      var idempotencyKey = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2);
      const res = await fetch('/.netlify/functions/monobank-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, shippingInfo, email: shippingInfo.email, idempotencyKey }),
      });
      const data = await res.json();
      if (data.error) {
        if (data.duplicate) {
          setSubmitError('Це замовлення вже оформлено. Перевірте пошту.');
        } else {
          setSubmitError(data.error);
        }
        setIsProcessing(false);
        return;
      }
      if (data.redirectUrl) {
        clearCart();
        window.location.href = data.redirectUrl;
      }
    } catch {
      setSubmitError('Помилка оплати. Спробуйте ще раз.');
    } finally {
      setIsProcessing(false);
    }
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
            {orderId && (
              <p className="text-blood font-mono text-sm">
                #{orderId}
              </p>
            )}
            <p className="text-white/60 font-body max-w-md mx-auto">
              {t('checkout.orderConfirmedDesc')}
            </p>
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
          <Link to="/" className="flex items-center">
            <div className="w-12 h-12">
              <img src="/logo.png" alt="BUKSY" className="w-full h-full object-contain brightness-0 invert" />
            </div>
          </Link>
          <div className="flex items-center gap-2 text-white/40">
            <Lock size={14} />
            <span className="font-body text-xs">{t('checkout.secureCheckout')}</span>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8 sm:mb-12">
          {steps.map((s, index) => (
            <div key={s.id} className="flex items-center">
              <div
                className={`flex items-center gap-1.5 sm:gap-2 ${
                  steps.findIndex((st) => st.id === step) >= index
                    ? 'text-blood'
                    : 'text-white/40'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full border flex items-center justify-center flex-shrink-0 ${
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
                <span className="font-body text-xs sm:text-sm hidden xs:inline">{t(s.nameKey)}</span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-6 sm:w-12 lg:w-24 h-px mx-2 sm:mx-4 ${
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
                  {Object.keys(errors).length > 0 && (
                    <div className="p-3 border border-red-500/30 bg-red-500/5">
                      <p className="text-red-400 font-body text-sm">{Object.values(errors).join('; ')}</p>
                    </div>
                  )}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Олександр"
                      value={shippingInfo.firstName}
                      onChange={(e) =>
                        setShippingInfo({ ...shippingInfo, firstName: e.target.value })
                      }
                      className="checkout-input"
                    />
                    <input
                      type="text"
                      placeholder="Коваленко"
                      value={shippingInfo.lastName}
                      onChange={(e) =>
                        setShippingInfo({ ...shippingInfo, lastName: e.target.value })
                      }
                      className="checkout-input"
                    />
                  </div>
                  <input
                    type="email"
                    placeholder="example@email.com"
                    value={shippingInfo.email}
                    onChange={(e) =>
                      setShippingInfo({ ...shippingInfo, email: e.target.value })
                    }
                    className="checkout-input w-full"
                  />
                  <input
                    type="tel"
                    placeholder="+38 095 599 0719"
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
                    placeholder="вул. Хрещатик, 1"
                    value={shippingInfo.address}
                    onChange={(e) =>
                      setShippingInfo({ ...shippingInfo, address: e.target.value })
                    }
                    className="checkout-input w-full"
                  />
                  <input
                    type="text"
                    placeholder="Кв. 42"
                    value={shippingInfo.apartment}
                    onChange={(e) =>
                      setShippingInfo({ ...shippingInfo, apartment: e.target.value })
                    }
                    className="checkout-input w-full"
                  />
                   <div className="grid sm:grid-cols-3 gap-4">
                    <input
                      type="text"
                      placeholder="Київ"
                      value={shippingInfo.city}
                      onChange={(e) =>
                        setShippingInfo({ ...shippingInfo, city: e.target.value })
                      }
                      className="checkout-input"
                    />
                    <input
                      type="text"
                      placeholder="Україна"
                      value={shippingInfo.country}
                      onChange={(e) =>
                        setShippingInfo({ ...shippingInfo, country: e.target.value })
                      }
                      className="checkout-input"
                    />
                    <input
                      type="text"
                      placeholder="01001"
                      value={shippingInfo.postalCode}
                      onChange={(e) =>
                        setShippingInfo({ ...shippingInfo, postalCode: e.target.value })
                      }
                      className="checkout-input"
                    />
                  </div>

                  <input
                    type="text"
                    placeholder="Відділення Нової Пошти №"
                    value={shippingInfo.novaPoshtaBranch}
                    onChange={(e) =>
                      setShippingInfo({ ...shippingInfo, novaPoshtaBranch: e.target.value })
                    }
                    className="checkout-input w-full"
                  />

                  <button
                    onClick={() => {
                      if (validateInformation()) setStep('payment');
                    }}
                    className="btn-primary w-full mt-8"
                  >
                    {t('checkout.continueToPayment')}
                  </button>
                </div>
              )}

              {step === 'payment' && (
                <div className="space-y-5">
                   <h2 className="font-heading text-xl tracking-wider">{t('checkout.payment')}</h2>

                  {submitError && (
                    <p className="text-red-400 text-sm font-body text-center">{submitError}</p>
                  )}

                  {/* Card Payment — единственный способ */}
                  <button
                    onClick={handleCardPayment}
                    disabled={isProcessing}
                    className="w-full py-5 bg-blood text-white font-heading text-base tracking-widest hover:bg-blood/90 transition-colors duration-300 disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    {isProcessing ? (
                      <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <><CreditCard size={22} /> {t('checkout.cardPayButton')}</>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-6 pt-2 text-white/20 text-xs font-body">
                    <span className="flex items-center gap-1.5">
                      <Shield size={14} />
                      {t('checkout.secureSSL')}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CreditCard size={14} />
                      Monobank
                    </span>
                  </div>

                  <button onClick={() => setStep('information')} className="w-full py-3 border border-white/5 text-white/40 font-body text-sm hover:text-white hover:border-white/20 transition-colors duration-300">
                    ← {t('checkout.back2')}
                  </button>
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
                        src={item.product.images?.[0] || '/placeholder.png'}
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
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="space-y-3 pt-4 mt-4 border-t border-white/5">
                <div className="flex justify-between text-lg">
                  <span className="font-heading tracking-wider">{t('checkout.total')}</span>
                  <span className="font-mono text-xl">{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
