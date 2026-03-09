import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Product } from '../types';
import { fetchFeaturedProducts } from '../api';

interface HomeProps {
  onNavigate: (page: string, productId?: string) => void;
}

export default function Home({ onNavigate }: HomeProps) {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedProducts();
  }, []);

  const loadFeaturedProducts = async () => {
    try {
      const data = await fetchFeaturedProducts(4);
      setFeaturedProducts(data);
    } catch (error) {
      console.error('Error loading featured products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <section className="relative bg-gradient-to-br from-emerald-50 to-teal-50 py-20 animate-fade-in-up">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Discover Your
                <span className="text-emerald-600"> Lumina</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Curated lifestyle products that match your unique energy. Explore our collection of premium items designed to elevate your everyday.
              </p>
              <button
                onClick={() => onNavigate('products')}
                className="bg-emerald-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-emerald-700 transition inline-flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <span>Shop Now</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
            <div className="hidden md:block">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="bg-white rounded-2xl shadow-lg overflow-hidden transform hover:scale-105 transition duration-300 ease-out">
                    <img
                      src="https://images.pexels.com/photos/1927259/pexels-photo-1927259.jpeg?auto=compress&cs=tinysrgb&w=400"
                      alt="Fashion"
                      className="w-full h-48 object-cover"
                    />
                  </div>
                  <div className="bg-white rounded-2xl shadow-lg overflow-hidden transform hover:scale-105 transition duration-300 ease-out">
                    <img
                      src="https://images.pexels.com/photos/1037995/pexels-photo-1037995.jpeg?auto=compress&cs=tinysrgb&w=400"
                      alt="Electronics"
                      className="w-full h-32 object-cover"
                    />
                  </div>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="bg-white rounded-2xl shadow-lg overflow-hidden transform hover:scale-105 transition duration-300 ease-out">
                    <img
                      src="https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=400"
                      alt="Lifestyle"
                      className="w-full h-32 object-cover"
                    />
                  </div>
                  <div className="bg-white rounded-2xl shadow-lg overflow-hidden transform hover:scale-105 transition duration-300 ease-out">
                    <img
                      src="https://images.pexels.com/photos/1034597/pexels-photo-1034597.jpeg?auto=compress&cs=tinysrgb&w=400"
                      alt="Home"
                      className="w-full h-48 object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Products
            </h2>
            <p className="text-gray-600">
              Handpicked items that define your lifestyle
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in-up">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-gray-100 rounded-lg h-96 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
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
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-emerald-600 transition">
                      {product.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-emerald-600">
                        ${product.price}
                      </span>
                      <span className="text-sm text-gray-500">
                        {product.stock} in stock
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <button
              onClick={() => onNavigate('products')}
              className="bg-gray-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
            >
              View All Products
            </button>
          </div>
        </div>
      </section>

      <section className="py-16 bg-emerald-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">Free Shipping</div>
              <p className="text-emerald-100">On orders over $100</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">Easy Returns</div>
              <p className="text-emerald-100">30-day return policy</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">Secure Payment</div>
              <p className="text-emerald-100">100% secure checkout</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
