import { useEffect, useState } from 'react';
import { Package, User } from 'lucide-react';
import type { Order, OrderItem, UserProfile, Address } from '../types';
import { useAuth } from '../contexts/AuthContext';
import {
  fetchOrders,
  fetchOrderItems,
  updateOrderStatus,
  fetchUserProfile,
  saveUserProfile,
  fetchAddresses,
  addAddress,
  updateAddress,
  deleteAddress
} from '../api';

interface ProfileProps {
  onNavigate: (page: string) => void;
}

export default function Profile({ onNavigate }: ProfileProps) {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<{ [key: string]: OrderItem[] }>({});
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [profileForm, setProfileForm] = useState({ name: '', mobile: '', country: '' });
  const [newAddress, setNewAddress] = useState({ label: '', line1: '', country: '' });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);

  useEffect(() => {
    if (user) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      const [ordersData, profileData, addressesData] = await Promise.all([
        fetchOrders(user.id),
        fetchUserProfile(user.id),
        fetchAddresses(user.id)
      ]);

      setOrders(ordersData || []);
      const itemsMap: { [key: string]: OrderItem[] } = {};
      for (const order of ordersData || []) {
        const items = await fetchOrderItems(order.id);
        itemsMap[order.id] = items || [];
      }

      setOrderItems(itemsMap);
      setProfile(profileData);
      setProfileForm({
        name: profileData?.name ?? '',
        mobile: profileData?.mobile ?? '',
        country: profileData?.country ?? ''
      });
      setAddresses(addressesData || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    await updateOrderStatus(orderId, 'cancelled');
    await loadData();
  };

  const handleProfileSave = async () => {
    if (!user) return;
    await saveUserProfile(user.id, {
      name: profileForm.name.trim(),
      mobile: profileForm.mobile.trim(),
      country: profileForm.country.trim()
    });
    await loadData();
  };

  const handleAddAddress = async () => {
    if (!user || !newAddress.line1.trim() || !newAddress.country.trim()) return;
    await addAddress(user.id, {
      label: newAddress.label.trim() || 'Address',
      line1: newAddress.line1.trim(),
      country: newAddress.country.trim()
    });
    setNewAddress({ label: '', line1: '', country: '' });
    setShowNewAddressForm(false);
    await loadData();
  };

  const handleUpdateAddress = async (addressId: string, updates: Partial<Address>) => {
    if (!user) return;
    await updateAddress(user.id, addressId, {
      label: updates.label,
      line1: updates.line1,
      country: updates.country
    });
    await loadData();
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!user) return;
    await deleteAddress(user.id, addressId);
    await loadData();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in to view profile</h2>
          <p className="text-gray-600 mb-6">Please sign in to access your orders</p>
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
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-gray-600">Loading your profile...</div>
      </div>
    );
  }

  const primaryAddress = addresses[0] ?? null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Your Lumina profile
          </h1>
          <p className="text-gray-600">
            Manage your account details, addresses, and order history in one place.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Account */}
          <div className="bg-white/90 rounded-2xl shadow-sm border border-emerald-50 overflow-hidden lg:col-span-1">
            <div className="relative h-20 bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500">
              <div className="absolute -bottom-8 left-6 h-16 w-16 rounded-full bg-white shadow-lg flex items-center justify-center">
                <div className="h-14 w-14 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-semibold text-lg">
                  {(profileForm.name || user.email || 'U').charAt(0).toUpperCase()}
                </div>
              </div>
            </div>
            <div className="pt-10 px-6 pb-4 border-b border-gray-100">
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Account overview
              </p>
              <p className="mt-1 text-sm font-semibold text-gray-900">
                {profileForm.name || 'Your name'}
              </p>
              <p className="text-xs font-mono text-gray-500 truncate max-w-[220px]">
                {user.email}
              </p>
            </div>

            <div className="px-6 py-4">
              {!isEditingProfile ? (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Mobile</span>
                    <span className="text-gray-900">
                      {profileForm.mobile || 'Add your mobile'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Country</span>
                    <span className="text-gray-900">
                      {profileForm.country || 'Add your country'}
                    </span>
                  </div>
                  {primaryAddress && (
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Default address</p>
                      <p className="text-gray-900">
                        {primaryAddress.line1}
                      </p>
                      <p className="text-xs text-gray-500">{primaryAddress.country}</p>
                    </div>
                  )}
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="mt-3 inline-flex items-center justify-center w-full px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition shadow-sm hover:shadow"
                  >
                    Edit profile
                  </button>
                </div>
              ) : (
                <div className="space-y-3 text-sm">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) =>
                        setProfileForm((f) => ({ ...f, name: e.target.value }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Mobile
                    </label>
                    <input
                      type="tel"
                      value={profileForm.mobile}
                      onChange={(e) =>
                        setProfileForm((f) => ({ ...f, mobile: e.target.value }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      value={profileForm.country}
                      onChange={(e) =>
                        setProfileForm((f) => ({ ...f, country: e.target.value }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Email:{' '}
                    <span className="font-mono text-gray-800">{user.email}</span>{' '}
                    (cannot be changed)
                  </p>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={async () => {
                        await handleProfileSave();
                        setIsEditingProfile(false);
                      }}
                      className="inline-flex flex-1 items-center justify-center px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition shadow-sm hover:shadow"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setProfileForm({
                          name: profile?.name ?? '',
                          mobile: profile?.mobile ?? '',
                          country: profile?.country ?? ''
                        });
                        setIsEditingProfile(false);
                      }}
                      className="inline-flex flex-1 items-center justify-center px-4 py-2 rounded-lg bg-gray-100 text-gray-800 text-sm font-semibold hover:bg-gray-200 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Addresses */}
          <div className="bg-white/90 rounded-2xl shadow-sm p-6 border border-emerald-50 lg:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Addresses</h2>
            <p className="text-xs text-gray-500 mb-4">
              Save multiple delivery locations and quickly pick one when you check out.
            </p>
            <div className="space-y-4">
              {addresses.length === 0 ? (
                <p className="text-sm text-gray-600">
                  No addresses yet. Add one below to use at checkout.
                </p>
              ) : (
                addresses.map((addr) => (
                  <AddressCard
                    key={addr.id}
                    address={addr}
                    onSave={handleUpdateAddress}
                    onDelete={handleDeleteAddress}
                  />
                ))
              )}

              <div className="border-t border-gray-200 pt-4 mt-2">
                {!showNewAddressForm ? (
                  <button
                    onClick={() => {
                      setNewAddress({ label: '', line1: '', country: '' });
                      setShowNewAddressForm(true);
                    }}
                    className="inline-flex items-center px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition shadow-sm hover:shadow"
                  >
                    Add new address
                  </button>
                ) : (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-gray-900">
                      New address
                    </h3>
                    <input
                      type="text"
                      placeholder="Label (optional, e.g. Home)"
                      value={newAddress.label}
                      onChange={(e) =>
                        setNewAddress((a) => ({ ...a, label: e.target.value }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                    />
                    <textarea
                      placeholder="Address line"
                      value={newAddress.line1}
                      onChange={(e) =>
                        setNewAddress((a) => ({ ...a, line1: e.target.value }))
                      }
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Country"
                      value={newAddress.country}
                      onChange={(e) =>
                        setNewAddress((a) => ({ ...a, country: e.target.value }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                    />
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={handleAddAddress}
                        className="inline-flex items-center px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition shadow-sm hover:shadow"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setNewAddress({ label: '', line1: '', country: '' });
                          setShowNewAddressForm(false);
                        }}
                        className="inline-flex items-center px-4 py-2 rounded-lg bg-gray-100 text-gray-800 text-sm font-semibold hover:bg-gray-200 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Orders */}
        <div className="bg-white/90 rounded-2xl shadow-sm p-6 border border-emerald-50">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">My Orders</h2>
              <p className="text-sm text-gray-600">
                View status, items, and totals for your previous purchases.
              </p>
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="py-10 text-center">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-1">No orders yet</h3>
              <p className="text-sm text-gray-600 mb-4">
                Start shopping to see your orders appear here.
              </p>
              <button
                onClick={() => onNavigate('products')}
                className="bg-emerald-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition shadow-sm hover:shadow"
              >
                Browse products
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="border border-gray-100 rounded-xl overflow-hidden hover:shadow-sm transition bg-white"
                >
                  <div className="bg-gray-50 px-4 sm:px-6 py-4 border-b border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500">
                          Order placed
                        </p>
                        <p className="font-medium text-gray-900">
                          {new Date(order.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p className="text-xs uppercase tracking-wide">Order ID</p>
                        <p className="font-mono text-xs break-all">{order.id}</p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-xs uppercase tracking-wide text-gray-500">
                          Total
                        </p>
                        <p className="font-bold text-gray-900">
                          ${order.total.toFixed(2)}
                        </p>
                        <div className="flex items-center justify-end gap-2">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                              order.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : order.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                          {order.status === 'pending' && (
                            <button
                              onClick={() => handleCancelOrder(order.id)}
                              className="text-xs text-red-600 hover:text-red-700"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="px-4 sm:px-6 py-4">
                    <div className="space-y-3">
                      {orderItems[order.id]?.map((item) => (
                        <div key={item.id} className="flex gap-4">
                          <img
                            src={item.product?.image_url}
                            alt={item.product?.name}
                            className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">
                              {item.product?.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Quantity: {item.quantity}
                            </p>
                            <p className="text-sm text-gray-600">
                              ${item.price.toFixed(2)} each
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-gray-900">
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface AddressCardProps {
  address: Address;
  onSave: (id: string, updates: Partial<Address>) => void;
  onDelete: (id: string) => void;
}

function AddressCard({ address, onSave, onDelete }: AddressCardProps) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    label: address.label ?? '',
    line1: address.line1,
    country: address.country
  });

  const handleSave = async () => {
    await onSave(address.id, form);
    setEditing(false);
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 flex flex-col gap-2">
      {editing ? (
        <>
          <input
            type="text"
            value={form.label}
            onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm mb-1"
            placeholder="Label"
          />
          <textarea
            value={form.line1}
            onChange={(e) => setForm((f) => ({ ...f, line1: e.target.value }))}
            rows={2}
            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm mb-1"
          />
          <input
            type="text"
            value={form.country}
            onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm mb-2"
          />
        </>
      ) : (
        <>
          <p className="text-sm font-semibold text-gray-900">
            {address.label || 'Address'}
          </p>
          <p className="text-sm text-gray-700 whitespace-pre-line">{address.line1}</p>
          <p className="text-xs text-gray-500">{address.country}</p>
        </>
      )}

      <div className="flex justify-between pt-1">
        <button
          onClick={() => (editing ? handleSave() : setEditing(true))}
          className="text-xs text-emerald-600 hover:text-emerald-700"
        >
          {editing ? 'Save' : 'Edit'}
        </button>
        <button
          onClick={() => onDelete(address.id)}
          className="text-xs text-red-600 hover:text-red-700"
        >
          Remove
        </button>
      </div>
    </div>
  );
}
