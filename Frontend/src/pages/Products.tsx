import { useEffect, useMemo, useState } from 'react';
import { Filter, Search } from 'lucide-react';
import { Product, Category } from '../types';
import { fetchCategories, fetchProducts } from '../api';

interface ProductsProps {
  onNavigate: (page: string, productId?: string) => void;
}

export default function Products({ onNavigate }: ProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [selectedCategory]);

  const loadData = async () => {
    try {
      const categoriesData = await fetchCategories();
      setCategories(categoriesData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await fetchProducts(selectedCategory === 'all' ? undefined : selectedCategory);
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return products;

    return products.filter((product) => {
      const idMatch = product.id.toLowerCase().includes(term);
      const nameMatch = product.name.toLowerCase().includes(term);
      const descriptionMatch = product.description.toLowerCase().includes(term);
      return idMatch || nameMatch || descriptionMatch;
    });
  }, [products, searchTerm]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Shop All Products</h1>
              <p className="text-gray-600 mt-2">
                {selectedCategory === 'all'
                  ? `${filteredProducts.length} products available`
                  : `${filteredProducts.length} products in this category`}
              </p>
            </div>
            <div className="w-full lg:w-80">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search by ID, name, or description
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Search className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="e.g. lamp, prod-123..."
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-up">
        <div className="flex gap-8">
          <aside className={`${showFilters ? 'block' : 'hidden'} lg:block w-64 flex-shrink-0`}>
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">Filters</h2>
                <Filter className="w-5 h-5 text-gray-500" />
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-3">Categories</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`block w-full text-left px-3 py-2 rounded-md transition ${
                      selectedCategory === 'all'
                        ? 'bg-emerald-50 text-emerald-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    All Products
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`block w-full text-left px-3 py-2 rounded-md transition ${
                        selectedCategory === category.id
                          ? 'bg-emerald-50 text-emerald-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <div className="flex-1">
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg shadow-sm"
              >
                <Filter className="w-5 h-5" />
                <span>Filters</span>
              </button>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-lg h-96 animate-pulse" />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <p className="text-gray-600">
                  No products match that search. Try a different name, ID, or description.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => onNavigate('product', product.id)}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition cursor-pointer group transform hover:-translate-y-1 duration-300 ease-out"
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-64 object-cover group-hover:scale-110 transition duration-300"
                      />
                      {product.stock < 10 && product.stock > 0 && (
                        <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">
                          Low Stock
                        </div>
                      )}
                      {product.stock === 0 && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                          Out of Stock
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-emerald-600 transition">
                        {product.name}
                      </h3>
                      <p className="text-xs font-mono text-gray-400 mb-1">
                        ID: {product.id}
                      </p>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {product.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-emerald-600">
                          ${product.price}
                        </span>
                        <span className="text-sm text-gray-500">
                          {product.stock} left
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
