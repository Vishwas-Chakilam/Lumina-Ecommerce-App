import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { fetchAllOrders, fetchOrderItems } from '../api';
import type { Order, OrderItem } from '../types';

interface TrackOrderProps {
  onNavigate: (page: string) => void;
}

export default function TrackOrder({ onNavigate }: TrackOrderProps) {
  const location = useLocation();
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const orderIdFromQuery = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('orderId')?.trim() || '';
  }, [location.search]);

  useEffect(() => {
    setError('');
    setOrder(null);
    setItems([]);
  }, [orderId]);

  useEffect(() => {
    if (!orderIdFromQuery) return;
    setOrderId(orderIdFromQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderIdFromQuery]);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!orderId.trim()) return;

    setLoading(true);
    setError('');
    setOrder(null);
    setItems([]);

    try {
      const all = await fetchAllOrders();
      const found = all.find((o) => o.id === orderId.trim());
      if (!found) {
        setError('No order found with that ID. Please check and try again.');
        return;
      }
      setOrder(found);
      const orderItems = await fetchOrderItems(found.id);
      setItems(orderItems || []);
    } catch (err) {
      console.error('Error tracking order:', err);
      setError('Something went wrong while looking up that order.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!orderIdFromQuery) return;
    if (!orderIdFromQuery.trim()) return;
    handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderIdFromQuery]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Track Your Order</h1>
        <p className="text-gray-600 mb-8">
          Enter your order ID exactly as shown in your order confirmation or in the My Orders page.
        </p>

        <form onSubmit={handleSearch} className="mb-8 space-y-3">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Search className="w-5 h-5" />
            </span>
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="e.g. ORD-1719400000000-abc123"
              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-mono text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-6 py-3 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition disabled:bg-gray-400"
          >
            <Search className="w-4 h-4 mr-2" />
            {loading ? 'Checking...' : 'Check Status'}
          </button>
        </form>

        {error && (
          <div className="mb-6 bg-red-50 text-red-700 border border-red-100 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {order && (
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
              <div>
                <p className="text-sm text-gray-600">Order ID</p>
                <p className="text-xs font-mono text-gray-900 break-all">{order.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    order.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : order.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Total</p>
                <p className="font-bold text-gray-900">${order.total.toFixed(2)}</p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm text-gray-600 mb-2">Items</p>
              {items.length === 0 ? (
                <p className="text-sm text-gray-500">No item details available.</p>
              ) : (
                <ul className="space-y-2 text-sm text-gray-700">
                  {items.map((item) => (
                    <li key={item.id} className="flex justify-between">
                      <span>
                        {item.product?.name || item.product_id} × {item.quantity}
                      </span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <button
              onClick={() => onNavigate('home')}
              className="mt-4 text-emerald-600 hover:text-emerald-700 text-sm font-medium"
            >
              Back to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

