import { useEffect, useState } from 'react';
import { ArrowLeft, ShoppingCart, Minus, Plus } from 'lucide-react';
import { Product } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { addToCart, fetchProductById } from '../api';
import { useToast } from '../components/ToastProvider';

interface ProductDetailProps {
  productId: string;
  onNavigate: (page: string) => void;
  onAddToCart: () => void;
}

export default function ProductDetail({ productId, onNavigate, onAddToCart }: ProductDetailProps) {
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    try {
      const data = await fetchProductById(productId);
      setProduct(data);
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      onNavigate('login');
      return;
    }

    if (!product) return;

    setAdding(true);
    try {
      await addToCart(user.id, product.id, quantity);
      onAddToCart();
      showToast({
        variant: 'success',
        title: 'Added to cart',
        message: `${product.name} (x${quantity}) has been added to your cart.`
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      showToast({
        variant: 'error',
        message: 'Failed to add this product to your cart. Please try again.'
      });
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Product not found</p>
          <button
            onClick={() => onNavigate('products')}
            className="text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-up">
        <button
          onClick={() => onNavigate('products')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Shop</span>
        </button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden animate-scale-in">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="relative">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <p className="text-xs font-mono text-gray-500 mb-4">
                Product ID: {product.id}
              </p>

              <div className="flex items-center space-x-4 mb-6">
                <span className="text-4xl font-bold text-emerald-600">
                  ${product.price}
                </span>
                {product.stock > 0 ? (
                  <span className="text-sm text-gray-600">
                    {product.stock} in stock
                  </span>
                ) : (
                  <span className="text-sm text-red-600 font-medium">
                    Out of Stock
                  </span>
                )}
              </div>

              <p className="text-gray-700 mb-8 leading-relaxed">
                {product.description}
              </p>

              {product.stock > 0 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity
                    </label>
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-xl font-semibold w-12 text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    disabled={adding}
                    className="w-full bg-emerald-600 text-white py-4 rounded-lg font-semibold hover:bg-emerald-700 transition flex items-center justify-center space-x-2 disabled:bg-gray-400"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span>{adding ? 'Adding...' : 'Add to Cart'}</span>
                  </button>
                </div>
              )}

              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">Product Details</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>Free shipping on orders over $100</li>
                  <li>30-day return policy</li>
                  <li>Secure payment processing</li>
                  <li>Customer support available 24/7</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
