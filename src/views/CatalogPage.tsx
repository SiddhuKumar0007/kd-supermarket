import React, { useState, useEffect } from 'react';
import { 
  Filter, 
  X, 
  Search, 
  SlidersHorizontal, 
  ArrowUpDown, 
  Check, 
  Package, 
  ChevronRight,
  RotateCcw
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/products/ProductCard';
import { api } from '../services/api';
import { Product, Category } from '../types';

export const CatalogPage: React.FC = () => {
  const { 
    selectedCategory, 
    setSelectedCategory, 
    searchQuery, 
    setSearchQuery,
    setCurrentView 
  } = useStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<string>('popularity');
  const [priceRange, setPriceRange] = useState<number>(1000);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [cats, prods] = await Promise.all([
          api.getCategories(),
          api.getProducts({
            category: selectedCategory || undefined,
            search: searchQuery || undefined,
            sort: sortBy,
            inStock: inStockOnly || undefined
          })
        ]);
        setCategories(cats);
        setProducts(prods);
      } catch (err) {
        console.error('Error fetching catalog data', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [selectedCategory, searchQuery, sortBy, inStockOnly]);

  // Extract unique brands
  const brands = Array.from(new Set(products.map(p => p.brand).filter(Boolean)));

  // Client-side filtering for brand and price range
  const filteredProducts = products.filter(p => {
    if (selectedBrand !== 'all' && p.brand !== selectedBrand) return false;
    if (p.price > priceRange) return false;
    return true;
  });

  const resetFilters = () => {
    setSelectedCategory(null);
    setSelectedBrand('all');
    setInStockOnly(false);
    setSearchQuery('');
    setSortBy('popularity');
    setPriceRange(1000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-8 space-y-6">
      {/* Breadcrumb & Title */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs text-charcoal-muted">
          <button onClick={() => setCurrentView('home')} className="hover:text-forest">Home</button>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-forest font-semibold">Product Catalogue</span>
          {selectedCategory && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-charcoal font-bold">{selectedCategory}</span>
            </>
          )}
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="font-heading font-extrabold text-lg sm:text-2xl md:text-3xl text-charcoal">
              {selectedCategory ? selectedCategory : searchQuery ? `Search Results for "${searchQuery}"` : 'All Supermarket Groceries'}
            </h1>
            <p className="text-[11px] sm:text-xs text-charcoal-muted mt-0.5">
              Showing {filteredProducts.length} verified products available at KD Supermarket Madhubani
            </p>
          </div>

          {/* Mobile Filter Toggle & Sort Dropdown */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-charcoal hover:bg-ivory transition-colors"
            >
              <Filter className="w-4 h-4 text-forest" />
              <span>Filters</span>
            </button>

            <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-charcoal-muted" />
              <label htmlFor="sort-select" className="text-charcoal-muted font-medium">Sort:</label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent font-bold text-forest focus:outline-none cursor-pointer"
              >
                <option value="popularity">Popularity</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Customer Rating</option>
                <option value="name">Name: A to Z</option>
                <option value="newest">Newest First</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout: Sidebar Filters + Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block bg-white p-5 rounded-2xl border border-gray-200 shadow-card space-y-6 sticky top-28">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="font-heading font-bold text-sm text-charcoal flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-forest" />
              <span>Filter Catalog</span>
            </h3>
            <button
              onClick={resetFilters}
              className="text-[11px] text-forest hover:underline font-semibold flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Reset All
            </button>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-charcoal uppercase tracking-wider">
              Category
            </h4>
            <div className="max-h-52 overflow-y-auto space-y-1 pr-1 text-xs">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`w-full text-left py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                  !selectedCategory ? 'bg-forest text-white' : 'text-charcoal hover:bg-ivory'
                }`}
              >
                <span>All Categories</span>
                <span>{products.length}</span>
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`w-full text-left py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                    selectedCategory === cat.name ? 'bg-forest text-white' : 'text-charcoal hover:bg-ivory'
                  }`}
                >
                  <span className="truncate">{cat.name}</span>
                  <span className="text-[10px] opacity-80">{cat.itemCount}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Brand Filter */}
          {brands.length > 0 && (
            <div className="space-y-2 border-t border-gray-100 pt-4">
              <h4 className="text-xs font-bold text-charcoal uppercase tracking-wider">
                Brand
              </h4>
              <div className="max-h-40 overflow-y-auto space-y-1 text-xs pr-1">
                <button
                  onClick={() => setSelectedBrand('all')}
                  className={`w-full text-left py-1 px-2 rounded-lg text-xs ${
                    selectedBrand === 'all' ? 'text-forest font-bold bg-forest/5' : 'text-charcoal-muted hover:text-charcoal'
                  }`}
                >
                  All Brands
                </button>
                {brands.map((b) => (
                  <button
                    key={b}
                    onClick={() => setSelectedBrand(b)}
                    className={`w-full text-left py-1 px-2 rounded-lg text-xs ${
                      selectedBrand === b ? 'text-forest font-bold bg-forest/5' : 'text-charcoal-muted hover:text-charcoal'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Price Range */}
          <div className="space-y-2 border-t border-gray-100 pt-4">
            <div className="flex justify-between items-center text-xs">
              <h4 className="font-bold text-charcoal uppercase tracking-wider">Max Price</h4>
              <span className="font-bold text-forest">₹{priceRange}</span>
            </div>
            <input
              type="range"
              min="30"
              max="1000"
              step="10"
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="w-full accent-forest cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-charcoal-muted">
              <span>₹30</span>
              <span>₹1000</span>
            </div>
          </div>

          {/* In Stock Only */}
          <div className="border-t border-gray-100 pt-4">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-charcoal select-none">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-4 h-4 rounded text-forest focus:ring-forest accent-forest"
              />
              <span>In Stock Items Only</span>
            </label>
          </div>
        </aside>

        {/* Product Grid Area */}
        <main className="lg:col-span-3 space-y-4">
          {/* Active Filter Chips */}
          {(selectedCategory || selectedBrand !== 'all' || inStockOnly || searchQuery) && (
            <div className="flex flex-wrap items-center gap-2 p-3 bg-white rounded-xl border border-gray-100 text-xs">
              <span className="text-charcoal-muted font-bold text-[11px]">Active Filters:</span>
              {selectedCategory && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-forest/10 text-forest rounded-lg font-semibold">
                  Category: {selectedCategory}
                  <button onClick={() => setSelectedCategory(null)}><X className="w-3 h-3" /></button>
                </span>
              )}
              {selectedBrand !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-forest/10 text-forest rounded-lg font-semibold">
                  Brand: {selectedBrand}
                  <button onClick={() => setSelectedBrand('all')}><X className="w-3 h-3" /></button>
                </span>
              )}
              {inStockOnly && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-forest/10 text-forest rounded-lg font-semibold">
                  In Stock Only
                  <button onClick={() => setInStockOnly(false)}><X className="w-3 h-3" /></button>
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-warmYellow/30 text-charcoal rounded-lg font-semibold">
                  Search: "{searchQuery}"
                  <button onClick={() => setSearchQuery('')}><X className="w-3 h-3" /></button>
                </span>
              )}
              <button
                onClick={resetFilters}
                className="text-[11px] text-red-600 hover:underline font-bold ml-auto"
              >
                Clear All
              </button>
            </div>
          )}

          {/* Grid or Empty State */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3.5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 space-y-2 sm:space-y-3 border border-gray-100 shadow-sm animate-pulse">
                  <div className="pt-[80%] bg-gray-200 rounded-lg sm:rounded-xl" />
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-6 bg-gray-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3.5">
              {filteredProducts.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-ivory-100 flex items-center justify-center text-charcoal-light mx-auto">
                <Package className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-base text-charcoal">No products match your criteria</h3>
                <p className="text-xs text-charcoal-muted mt-1 max-w-sm mx-auto">
                  Try clearing your search query or selecting a different category filter.
                </p>
              </div>
              <button
                onClick={resetFilters}
                className="px-5 py-2.5 bg-forest hover:bg-forest-dark text-white rounded-xl text-xs font-bold transition-colors shadow"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filter Drawer */}
      {mobileFilterOpen && (
        <div className="lg:hidden fixed inset-0 z-50 overflow-hidden">
          <div 
            onClick={() => setMobileFilterOpen(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-xs" 
          />
          <div className="absolute inset-y-0 right-0 max-w-xs w-full bg-white shadow-2xl p-4 overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-heading font-bold text-sm text-charcoal">Filter Catalogue</h3>
              <button onClick={() => setMobileFilterOpen(false)}>
                <X className="w-5 h-5 text-charcoal" />
              </button>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-charcoal uppercase">Categories</h4>
              <div className="space-y-1 text-xs max-h-48 overflow-y-auto">
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setMobileFilterOpen(false);
                  }}
                  className={`w-full text-left p-1.5 rounded ${!selectedCategory ? 'bg-forest text-white' : 'text-charcoal'}`}
                >
                  All Categories
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedCategory(c.name);
                      setMobileFilterOpen(false);
                    }}
                    className={`w-full text-left p-1.5 rounded truncate ${selectedCategory === c.name ? 'bg-forest text-white' : 'text-charcoal'}`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* In stock */}
            <div className="border-t pt-4">
              <label className="flex items-center gap-2 text-xs font-bold text-charcoal">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="w-4 h-4 accent-forest"
                />
                <span>In Stock Items Only</span>
              </label>
            </div>

            <button
              onClick={() => setMobileFilterOpen(false)}
              className="w-full py-2.5 bg-forest text-white rounded-xl text-xs font-bold"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
