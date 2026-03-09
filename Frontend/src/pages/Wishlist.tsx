import { useEffect, useState } from 'react';
import { Heart, HeartOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { fetchWishlist, toggleWishlist } from '../api';
import type { Product } from '../types';
import { useToast } from '../components/ToastProvider';

interface WishlistProps {
  onNavigate: (page: string, productId?: string) => void;
}

export default function Wishlist({ onNavigate }: WishlistProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    loadWishlist();
  }, [user]);

  const loadWishlist = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await fetchWishlist(user.id);
      setItems(data || []);
    } catch (error) {
      console.error('Error loading wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (productId: string) => {
    if (!user) return;
    await toggleWishlist(user.id, productId);
    await loadWishlist();
    showToast({
      variant: 'success',
      title: 'Wishlist updated',
      message: 'Your saved items have been updated.'
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in to view wishlist</h2>
          <p className="text-gray-600 mb-6">Please sign in to see and manage your saved items.</p>
          <button
            onClick={() => onNavigate('login')}
            className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading wishlist...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Wishlist</h1>
            <p className="text-gray-600">
              {items.length === 0
                ? 'You have no saved items yet.'
                : `You have ${items.length} saved item${items.length > 1 ? 's' : ''}.`}
            </p>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <HeartOff className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No favorites yet</h2>
            <p className="text-gray-600 mb-6">
              Browse the catalog and tap the heart icon on any product to add it here.
            </p>
            <button
              onClick={() => onNavigate('products')}
              className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition"
            >
              Explore Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition group relative"
              >
                <button
                  onClick={() => handleToggle(product.id)}
                  className="absolute top-3 right-3 z-10 bg-white/80 rounded-full p-1.5 shadow-sm hover:bg-white transition"
                >
                  <Heart className="w-4 h-4 text-emerald-600 fill-emerald-600" />
                </button>
                <div
                  onClick={() => onNavigate('product', product.id)}
                  className="cursor-pointer"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-64 object-cover group-hover:scale-110 transition duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-emerald-600 transition">
                      {product.name}
                    </h3>
                    <p className="text-xs font-mono text-gray-400 mb-2">
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
                        {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

