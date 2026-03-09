import { useEffect, useMemo, useState } from 'react';
import { Package, ShoppingBag, Users } from 'lucide-react';
import {
  fetchProducts,
  fetchAllOrders,
  createProduct,
  updateProduct,
  deleteProduct,
  updateOrderStatus
} from '../api';
import type { Product, Order } from '../types';

interface AdminProps {
  onNavigate: (page: string) => void;
}

const ADMIN_PASSWORD = 'lumina-admin'; // can be moved to env later

export default function Admin({ onNavigate }: AdminProps) {
  const [authorized, setAuthorized] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<{
    id: string;
    name: string;
    description: string;
    price: string;
    image_url: string;
    category_id: string;
    stock: string;
    featured: boolean;
  }>({
    id: '',
    name: '',
    description: '',
    price: '',
    image_url: '',
    category_id: '',
    stock: '',
    featured: false
  });

  useEffect(() => {
    if (!authorized) return;
    loadData();
  }, [authorized]);

  const loadData = async () => {
    setLoading(true);
    const [productsData, ordersData] = await Promise.all([fetchProducts(), fetchAllOrders()]);
    setProducts(productsData);
    setOrders(ordersData);
    setLoading(false);
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthorized(true);
      setAuthError('');
    } else {
      setAuthError('Incorrect admin password.');
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({
      id: '',
      name: '',
      description: '',
      price: '',
      image_url: '',
      category_id: '',
      stock: '',
      featured: false
    });
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setForm({
      id: product.id,
      name: product.name,
      description: product.description,
      price: String(product.price),
      image_url: product.image_url,
      category_id: product.category_id,
      stock: String(product.stock),
      featured: product.featured
    });
  };

  const handleDelete = async (id: string) => {
    await deleteProduct(id);
    await loadData();
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const price = parseFloat(form.price);
    const stock = parseInt(form.stock || '0', 10);

    if (!form.id.trim() || !form.name || isNaN(price)) {
      return;
    }

    if (editingId) {
      await updateProduct(editingId, {
        name: form.name,
        description: form.description,
        price,
        image_url: form.image_url,
        category_id: form.category_id,
        stock,
        featured: form.featured
      });
    } else {
      await createProduct({
        id: form.id.trim(),
        name: form.name,
        description: form.description,
        price,
        image_url: form.image_url,
        category_id: form.category_id,
        stock,
        featured: form.featured
      });
    }

    resetForm();
    await loadData();
  };

  const totalRevenue = useMemo(
    () =>
      orders
        .filter((o) => o.status === 'completed')
        .reduce((sum, order) => sum + order.total, 0),
    [orders]
  );

  const totalStock = useMemo(
    () => products.reduce((sum, p) => sum + p.stock, 0),
    [products]
  );

  const stockByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    products.forEach((p) => {
      const key = p.category_id || 'Uncategorized';
      map[key] = (map[key] || 0) + p.stock;
    });
    return map;
  }, [products]);

  const pendingCount = useMemo(
    () => orders.filter((o) => o.status === 'pending').length,
    [orders]
  );

  const completedCount = useMemo(
    () => orders.filter((o) => o.status === 'completed').length,
    [orders]
  );

  const handleOrderStatusChange = async (orderId: string, status: Order['status']) => {
    await updateOrderStatus(orderId, status);
    await loadData();
  };

  if (!authorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-sm w-full bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">Admin Access</h1>
          <p className="text-gray-600 text-sm mb-6 text-center">
            Enter the admin password to access inventory management and analytics.
          </p>
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Admin password"
              />
            </div>
            {authError && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
                {authError}
              </div>
            )}
            <button
              type="submit"
              className="w-full bg-emerald-600 text-white py-2.5 rounded-lg font-semibold hover:bg-emerald-700 transition"
            >
              Enter Dashboard
            </button>
          </form>
          <button
            onClick={() => onNavigate('home')}
            className="mt-4 w-full text-sm text-gray-600 hover:text-gray-900"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Lumina Admin</h1>
            <p className="text-gray-600 text-sm">
              Inventory management and high-level store overview (cached, no live DB yet).
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-gray-600">Loading dashboard...</div>
        ) : (
          <>
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm p-6 flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
                  <Package className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Products</p>
                  <p className="text-2xl font-bold text-gray-900">{products.length}</p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pending Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Delivered Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{completedCount}</p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
                  <Users className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Revenue (delivered)</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${totalRevenue.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Simple stock distribution visualization */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Stock by Category (visual)
              </h2>
              {totalStock === 0 ? (
                <p className="text-sm text-gray-500">
                  No inventory yet. Add products below to see distribution.
                </p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(stockByCategory).map(([category, stock]) => {
                    const percentage = Math.round((stock / totalStock) * 100);
                    return (
                      <div key={category}>
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>{category}</span>
                          <span>
                            {stock} units ({percentage}%)
                          </span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Inventory management */}
            <div className="grid lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  {editingId ? 'Edit Product' : 'Add Product'}
                </h2>
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product ID
                    </label>
                    <input
                      type="text"
                      value={form.id}
                      onChange={(e) => setForm((f) => ({ ...f, id: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-mono text-sm"
                      placeholder="e.g. PROD-001"
                      required
                      disabled={!!editingId}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Set a unique product ID. This is how products are referenced in search and
                      admin tools.
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      value={form.description}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, description: e.target.value }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={form.price}
                        onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Stock
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={form.stock}
                        onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <input
                      type="text"
                      value={form.category_id}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, category_id: e.target.value }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="e.g. lighting, tech, home"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Image URL
                    </label>
                    <input
                      type="url"
                      value={form.image_url}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, image_url: e.target.value }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="https://..."
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      id="featured"
                      type="checkbox"
                      checked={form.featured}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, featured: e.target.checked }))
                      }
                      className="h-4 w-4 text-emerald-600 border-gray-300 rounded"
                    />
                    <label htmlFor="featured" className="text-sm text-gray-700">
                      Mark as featured
                    </label>
                  </div>
                  <div className="flex items-center space-x-3 pt-2">
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition"
                    >
                      {editingId ? 'Save Changes' : 'Add Product'}
                    </button>
                    {editingId && (
                      <button
                        type="button"
                        onClick={resetForm}
                        className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200 transition"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Inventory</h2>
                {products.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No products yet. Add your first item using the form on the left.
                  </p>
                ) : (
                  <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Product
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Product ID
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Category
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Price
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Stock
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {products.map((product) => (
                          <tr key={product.id}>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                              {product.name}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500 max-w-xs overflow-hidden text-ellipsis">
                              {product.id}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              {product.category_id || 'Uncategorized'}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                              ${product.price}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                              {product.stock}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-right space-x-2">
                              <button
                                onClick={() => handleEdit(product)}
                                className="text-emerald-600 hover:text-emerald-700"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(product.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Orders overview and status management */}
            <div className="bg-white rounded-lg shadow-sm p-6 mt-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Orders</h2>
              {orders.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No orders yet. Once customers check out, they will appear here.
                </p>
              ) : (
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Order ID
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Placed At
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {orders.map((order) => (
                        <tr key={order.id}>
                          <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500 max-w-xs overflow-hidden text-ellipsis">
                            {order.id}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                            <span
                              className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                order.status === 'completed'
                                  ? 'bg-green-100 text-green-800'
                                  : order.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                            ${order.total.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">
                            {new Date(order.created_at).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-right space-x-2">
                            {order.status !== 'completed' && (
                              <button
                                onClick={() => handleOrderStatusChange(order.id, 'completed')}
                                className="text-emerald-600 hover:text-emerald-700"
                              >
                                Mark delivered
                              </button>
                            )}
                            {order.status !== 'pending' && (
                              <button
                                onClick={() => handleOrderStatusChange(order.id, 'pending')}
                                className="text-gray-600 hover:text-gray-800"
                              >
                                Mark pending
                              </button>
                            )}
                            {order.status !== 'cancelled' && (
                              <button
                                onClick={() => handleOrderStatusChange(order.id, 'cancelled')}
                                className="text-red-600 hover:text-red-700"
                              >
                                Cancel
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

