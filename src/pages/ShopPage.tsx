import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { products, categories } from '../data/products';
import { ProductCard } from '../components/ProductCard';
import { useSearchParams } from 'react-router-dom';

const sortOptions = [
  { value: 'featured', labelKey: 'shop.sortFeatured' },
  { value: 'newest', labelKey: 'shop.sortNewest' },
  { value: 'price-asc', labelKey: 'shop.sortPriceLow' },
  { value: 'price-desc', labelKey: 'shop.sortPriceHigh' },
  { value: 'rating', labelKey: 'shop.sortRating' },
];

const categoryKeys: Record<string, string> = {
  all: 'shop.categoryAll',
  hoodies: 'shop.categoryHoodies',
  't-shirts': 'shop.categoryTShirts',
  jackets: 'shop.categoryJackets',
  pants: 'shop.categoryPants',
  accessories: 'shop.categoryAccessories',
  footwear: 'shop.categoryFootwear',
};

export function ShopPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  const searchQuery = searchParams.get('q') || '';
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState('featured');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];

    // Filter by category
    if (selectedCategory !== 'all') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      default:
        result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }

    return result;
  }, [selectedCategory, sortBy]);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    if (categoryId === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', categoryId);
    }
    setSearchParams(searchParams);
    setIsFilterOpen(false);
  };

  const productCount = filteredAndSortedProducts.length;

  return (
    <div className="min-h-screen bg-noir pt-24">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <p className="section-subtitle mb-3">{t('shop.theCollection')}</p>
          <h1 className="section-title">
            {t('shop.theShop')} <span className="text-blood">.</span>
          </h1>
        </motion.div>

        {/* Filters & Sort Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-6 border-b border-white/5"
        >
          {/* Categories - Desktop */}
          <div className="hidden lg:flex flex-wrap items-center gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={`px-4 py-2 font-body text-sm tracking-wider transition-all duration-300 ${
                  selectedCategory === category.id
                    ? 'text-blood border-b-2 border-blood'
                    : 'text-white/60 hover:text-white border-b-2 border-transparent'
                }`}
              >
                {t(categoryKeys[category.id])}
              </button>
            ))}
          </div>

          {/* Mobile Filter Button */}
          <button
            onClick={() => setIsFilterOpen(true)}
            className="lg:hidden flex items-center gap-2 px-4 py-2 border border-white/10 text-white/70"
          >
            <SlidersHorizontal size={16} />
            <span className="font-body text-sm">{t('shop.filters')}</span>
            {selectedCategory !== 'all' && (
              <span className="w-2 h-2 bg-blood rounded-full" />
            )}
          </button>

          {/* Sort & Count */}
          <div className="flex items-center gap-6">
            <span className="text-white/40 font-body text-sm hidden sm:block">
              {productCount} {productCount === 1 ? t('shop.product') : t('shop.products')}
            </span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-transparent border border-white/10 px-4 py-2 pr-10 font-body text-sm text-white/70 focus:outline-none focus:border-blood/50 cursor-pointer"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value} className="bg-noir">
                    {t(option.labelKey)}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
            </div>
          </div>
        </motion.div>

        {/* Active Filters */}
        {(selectedCategory !== 'all' || searchQuery) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 py-4"
          >
            <span className="text-white/40 font-body text-sm">{t('shop.showing')}</span>
            {selectedCategory !== 'all' && (
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-blood/20 border border-blood/30 text-blood font-body text-sm">
                {t(categoryKeys[selectedCategory])}
                <button
                  onClick={() => handleCategoryChange('all')}
                  className="hover:text-white transition-colors duration-200"
                >
                  <X size={14} />
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-blood/20 border border-blood/30 text-blood font-body text-sm">
                "{searchQuery}"
                <button
                  onClick={() => {
                    searchParams.delete('q');
                    setSearchParams(searchParams);
                  }}
                  className="hover:text-white transition-colors duration-200"
                >
                  <X size={14} />
                </button>
              </span>
            )}
          </motion.div>
        )}
      </div>

      {/* Product Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {filteredAndSortedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
            {filteredAndSortedProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="w-16 h-16 border border-white/10 rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl text-white/20">?</span>
            </div>
            <p className="text-white/60 font-body mb-4">
              {searchQuery ? `${t('shop.noSearchResults')} "${searchQuery}"` : t('shop.noProductsFound')}
            </p>
            <button
              onClick={() => handleCategoryChange('all')}
              className="text-blood hover:text-white transition-colors duration-300 font-body text-sm"
            >
              {t('shop.viewAllProducts')}
            </button>
          </motion.div>
        )}
      </div>

      {/* Mobile Filter Drawer */}
      <motion.div
        initial={false}
        animate={isFilterOpen ? 'open' : 'closed'}
        variants={{
          open: { opacity: 1 },
          closed: { opacity: 0 },
        }}
        className={`fixed inset-0 z-50 lg:hidden ${isFilterOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
      >
        {/* Backdrop */}
        <motion.div
          variants={{ open: { opacity: 1 }, closed: { opacity: 0 } }}
          onClick={() => setIsFilterOpen(false)}
          className="absolute inset-0 bg-noir/90 backdrop-blur-sm"
        />
        {/* Drawer */}
        <motion.div
          variants={{
            open: { y: 0 },
            closed: { y: '100%' },
          }}
          transition={{ type: 'tween', duration: 0.3 }}
          className="absolute bottom-0 left-0 right-0 bg-ash rounded-t-3xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-heading text-lg tracking-wider">{t('shop.filters')}</h3>
            <button onClick={() => setIsFilterOpen(false)} className="p-2">
              <X size={24} className="text-white/60" />
            </button>
          </div>
          <div className="space-y-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={`w-full py-4 px-4 flex items-center justify-between border ${
                  selectedCategory === category.id
                    ? 'border-blood bg-blood/10 text-blood'
                    : 'border-white/10 text-white/70'
                } transition-all duration-300`}
              >
                <span className="font-body">{t(categoryKeys[category.id])}</span>
                <span className="font-mono text-sm">
                  {category.id === 'all'
                    ? products.length
                    : products.filter((p) => p.category === category.id).length}
                </span>
              </button>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
