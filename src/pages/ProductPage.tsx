import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
  Truck,
  RotateCcw,
  Shield,
  Check,
  Star,
  Minus,
  Plus,
} from 'lucide-react';
import { products, reviews } from '../data/products';
import { ProductCard } from '../components/ProductCard';
import { useCart } from '../store/CartContext';

export function ProductPage() {
  const { slug } = useParams();
  const product = products.find((p) => p.slug === slug);
  const { addItem } = useCart();

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'details' | 'care'>('description');
  const [isAddedToCart, setIsAddedToCart] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setSelectedImage(0);
    setSelectedSize(null);
    setQuantity(1);
  }, [slug]);

  if (!product) {
    return (
      <div className="min-h-screen bg-noir pt-24 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/60 mb-4">Product not found</p>
          <Link to="/shop" className="text-blood hover:underline">
            Return to shop
          </Link>
        </div>
      </div>
    );
  }

  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleAddToCart = () => {
    const size = selectedSize || product.sizes.find((s) => s.available)?.name;
    if (size) {
      addItem(product, size, quantity);
      setIsAddedToCart(true);
      setTimeout(() => setIsAddedToCart(false), 2000);
    }
  };

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  return (
    <div className="min-h-screen bg-noir pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 text-sm text-white/40 font-body mb-8"
        >
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-white transition-colors">Shop</Link>
          <span>/</span>
          <Link to={`/shop?category=${product.category}`} className="hover:text-white transition-colors">
            {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
          </Link>
          <span>/</span>
          <span className="text-white">{product.name}</span>
        </motion.div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {/* Main Image */}
            <div className="relative aspect-[3/4] overflow-hidden bg-ash">
              <AnimatePresence mode="wait">
                <motion.img
                  key={selectedImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  src={product.images[selectedImage]}
                  alt={`${product.name} - view ${selectedImage + 1}`}
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>

              {/* Navigation Arrows */}
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-noir/80 backdrop-blur-sm flex items-center justify-center text-white hover:bg-blood transition-colors duration-300"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-noir/80 backdrop-blur-sm flex items-center justify-center text-white hover:bg-blood transition-colors duration-300"
              >
                <ChevronRight size={24} />
              </button>

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.isNew && (
                  <span className="px-3 py-1 bg-blood text-white text-xs font-heading tracking-wider">
                    NEW
                  </span>
                )}
                {product.originalPrice && (
                  <span className="px-3 py-1 bg-blood/80 text-white text-xs font-heading tracking-wider">
                    SALE
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnails */}
            <div className="flex gap-3">
              {product.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative w-20 h-24 overflow-hidden transition-all duration-300 ${
                    selectedImage === index
                      ? 'ring-2 ring-blood'
                      : 'ring-1 ring-white/10 hover:ring-white/30'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Title & Price */}
            <div>
              <h1 className="font-heading text-3xl md:text-4xl tracking-wider mb-4">
                {product.name}
              </h1>
              <div className="flex items-center gap-4">
                <span className="font-mono text-3xl text-white">${product.price}</span>
                {product.originalPrice && (
                  <span className="font-mono text-xl text-white/40 line-through">
                    ${product.originalPrice}
                  </span>
                )}
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={i < Math.floor(product.rating) ? 'fill-blood text-blood' : 'text-white/20'}
                  />
                ))}
              </div>
              <span className="text-white/60 font-body text-sm">
                {product.rating} ({product.reviewCount} reviews)
              </span>
            </div>

            {/* Short Description */}
            <p className="text-white/70 font-body leading-relaxed">
              {product.shortDescription}
            </p>

            {/* Size Selector */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-heading text-sm tracking-wider text-white/60">SIZE</span>
                <Link to="/size-guide" className="text-blood text-sm hover:underline font-body">
                  Size Guide
                </Link>
              </div>
              <div className="flex flex-wrap gap-3">
                {product.sizes.map((size) => (
                  <button
                    key={size.name}
                    onClick={() => size.available && setSelectedSize(size.name)}
                    disabled={!size.available}
                    className={`min-w-[48px] h-12 border font-mono text-sm transition-all duration-300 ${
                      !size.available
                        ? 'border-white/10 text-white/20 cursor-not-allowed'
                        : selectedSize === size.name
                          ? 'border-blood bg-blood/20 text-blood'
                          : 'border-white/20 text-white hover:border-blood hover:text-blood'
                    }`}
                  >
                    {size.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity & Add to Cart */}
            <div className="flex gap-4 pt-4">
              <div className="flex items-center border border-white/20">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 text-white/60 hover:text-white transition-colors"
                >
                  <Minus size={18} />
                </button>
                <span className="w-12 text-center font-mono">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-3 text-white/60 hover:text-white transition-colors"
                >
                  <Plus size={18} />
                </button>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {isAddedToCart ? (
                  <>
                    <Check size={18} />
                    ADDED
                  </>
                ) : (
                  'ADD TO CART'
                )}
              </motion.button>

              <button
                onClick={async () => {
                  const url = window.location.href;
                  if (navigator.share) {
                    try { await navigator.share({ title: product.name, url }); } catch {}
                  } else {
                    try {
                      await navigator.clipboard.writeText(url);
                    } catch {
                      const input = document.createElement('input');
                      input.value = url;
                      document.body.appendChild(input);
                      input.select();
                      document.execCommand('copy');
                      document.body.removeChild(input);
                    }
                  }
                }}
                className="p-4 border border-white/10 text-white/60 hover:border-blood hover:text-blood transition-all duration-300"
              >
                <Share2 size={20} />
              </button>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-3 gap-4 pt-6">
              <div className="p-4 border border-white/5 text-center">
                <Truck size={20} className="mx-auto mb-2 text-blood" />
                <p className="text-xs text-white/60 font-body">Free Shipping over $150</p>
              </div>
              <div className="p-4 border border-white/5 text-center">
                <RotateCcw size={20} className="mx-auto mb-2 text-blood" />
                <p className="text-xs text-white/60 font-body">30-Day Returns</p>
              </div>
              <div className="p-4 border border-white/5 text-center">
                <Shield size={20} className="mx-auto mb-2 text-blood" />
                <p className="text-xs text-white/60 font-body">2-Year Warranty</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-white/10 mt-8">
              <div className="flex">
                {(['description', 'details', 'care'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-4 font-heading text-sm tracking-wider transition-all duration-300 ${
                      activeTab === tab
                        ? 'text-blood border-b-2 border-blood'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    {tab.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <div className="py-4">
              {activeTab === 'description' && (
                <p className="text-white/70 font-body leading-relaxed">
                  {product.description}
                </p>
              )}
              {activeTab === 'details' && product.details && (
                <ul className="space-y-2">
                  {product.details.map((detail, i) => (
                    <li key={i} className="flex items-start gap-3 text-white/70 font-body">
                      <span className="w-1.5 h-1.5 bg-blood rounded-full mt-2 flex-shrink-0" />
                      {detail}
                    </li>
                  ))}
                </ul>
              )}
              {activeTab === 'care' && product.care && (
                <ul className="space-y-2">
                  {product.care.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-white/70 font-body">
                      <span className="w-1.5 h-1.5 bg-blood rounded-full mt-2 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        </div>

        {/* Reviews */}
        <section className="mt-24">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-heading text-2xl tracking-wider">
              Customer Reviews <span className="text-blood">.</span>
            </h2>
            <button
              onClick={() => {
                const reviewSection = document.getElementById('reviews');
                reviewSection?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="btn-secondary text-sm px-4 py-2"
            >
              WRITE A REVIEW
            </button>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {reviews.map((review) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="p-6 border border-white/5 bg-ash"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-heading text-sm tracking-wider">{review.author}</span>
                      {review.verified && (
                        <span className="text-xs text-blood font-body">VERIFIED</span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          className={i < review.rating ? 'fill-blood text-blood' : 'text-white/20'}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-white/40 font-body">{review.date}</span>
                </div>
                <h3 className="font-heading text-sm tracking-wider mb-2">{review.title}</h3>
                <p className="text-white/70 font-body text-sm leading-relaxed">
                  {review.content}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-24">
            <h2 className="font-heading text-2xl tracking-wider mb-8">
              You May Also Like <span className="text-blood">.</span>
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p, index) => (
                <ProductCard key={p.id} product={p} index={index} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
