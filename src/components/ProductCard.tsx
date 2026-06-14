import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, ShoppingBag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Product } from '../types';
import { useCart } from '../store/CartContext';


interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { t } = useTranslation();
  const { addItem } = useCart();
  const navigate = useNavigate();
  const firstAvailableSize = product.sizes.find((s) => s.available)?.name || 'M';

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, firstAvailableSize);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/product/${product.slug}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link to={`/product/${product.slug}`} className="group block">
        {/* Image Container */}
        <div className="relative aspect-[3/4] overflow-hidden bg-ash mb-4">
          {/* Main Image */}
          <motion.img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />

          {/* Hover Image */}
          {product.images[1] && (
            <img
              src={product.images[1]}
              alt={`${product.name} - alternate view`}
              className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-noir/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.isNew && (
              <span className="px-2 py-1 bg-blood text-white text-xs font-heading tracking-wider">
{t('common.new')}
              </span>
            )}
            {product.isBestseller && (
              <span className="px-2 py-1 bg-white/90 text-noir text-xs font-heading tracking-wider">
                {t('home.bestsellers').toUpperCase()}
              </span>
            )}
            {product.originalPrice && (
              <span className="px-2 py-1 bg-blood/80 text-white text-xs font-heading tracking-wider">
{t('common.sale')}
              </span>
            )}
          </div>

          {/* Quick Actions */}
          <div className="absolute bottom-4 left-4 right-4 flex gap-2 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleQuickAdd}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-blood text-white font-heading text-xs tracking-wider transition-all duration-300 hover:shadow-blood"
            >
              <ShoppingBag size={16} />
              {t('product.addToCart')}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleQuickView}
              className="p-3 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors duration-300"
            >
              <Eye size={16} />
            </motion.button>
          </div>

          {/* Blood glow effect on hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
            <div className="absolute inset-0 shadow-inner-blood" />
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-4">
            <h3 className="font-heading text-sm tracking-wider text-white group-hover:text-blood transition-colors duration-300">
              {product.name}
            </h3>
            {product.rating > 0 && (
              <div className="flex items-center gap-1 text-xs text-white/60">
                <svg className="w-3 h-3 fill-blood" viewBox="0 0 12 12">
                  <path d="M6 0l1.5 3.5L12 4.5l-3 3 1 4.5-4-2.5L2 12l1-4.5-3-3 4.5-1z" />
                </svg>
                {product.rating}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-lg text-white">
              ${product.price}
            </span>
            {product.originalPrice && (
              <span className="font-mono text-sm text-white/40 line-through">
                ${product.originalPrice}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
