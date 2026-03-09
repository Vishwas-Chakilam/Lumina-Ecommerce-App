import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, MapPin, ShoppingBag } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { fetchCart, fetchAddresses, fetchUserProfile } from '../api';
import type { CartItem, Address, UserProfile } from '../types';
import { useToast } from '../components/ToastProvider';
import { useCheckout } from '../contexts/CheckoutContext';

interface CheckoutProps {
  onNavigate: (page: string) => void;
}

export default function Checkout({ onNavigate }: CheckoutProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { selectedAddressId, setSelectedAddressId } = useCheckout();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const selectedAddress = useMemo(() => {
    if (!addresses.length) return null;
    if (!selectedAddressId) return addresses[0];
    return addresses.find((a) => a.id === selectedAddressId) ?? addresses[0];
  }, [addresses, selectedAddressId]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const [cart, userProfile, userAddresses] = await Promise.all([
          fetchCart(user.id),
          fetchUserProfile(user.id),
          fetchAddresses(user.id)
        ]);
        setCartItems(cart || []);
        setProfile(userProfile);
        const addrList = userAddresses || [];
        setAddresses(addrList);
        if (!selectedAddressId && addrList.length) {
          setSelectedAddressId(addrList[0].id);
        } else if (selectedAddressId && addrList.length) {
          const exists = addrList.some((a) => a.id === selectedAddressId);
          if (!exists) setSelectedAddressId(addrList[0].id);
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in to check out</h2>
          <p className="text-gray-600 mb-6">Please sign in to review your order and address.</p>
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
        <div className="text-gray-600">Preparing your checkout...</div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some products before proceeding to checkout.</p>
          <button
            onClick={() => onNavigate('products')}
            className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition"
          >
            Browse products
          </button>
        </div>
      </div>
    );
  }

  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0
  );
  const shipping = subtotal > 100 ? 0 : 10;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in-up">
        <button
          onClick={() => onNavigate('cart')}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-2"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to cart
        </button>

        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Pre‑order summary</h1>
            <p className="text-sm text-gray-600">
              Review your items and delivery details before choosing how you want to pay.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2 text-xs font-medium text-gray-600">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="text-gray-900">Pre‑order</span>
            </div>
            <span className="h-px w-6 bg-gray-300" />
            <span className="text-gray-500">Payment</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white/90 rounded-2xl shadow-sm border border-emerald-50 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Items in your order</h2>
              <p className="text-xs text-gray-500 mb-4">
                This is the final list before you proceed to payment.
              </p>
              <div className="divide-y divide-gray-100">
                {cartItems.map((item) => (
                  <div key={item.id} className="py-4 flex gap-4">
                    <img
                      src={item.product?.image_url}
                      alt={item.product?.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.product?.name}</p>
                      <p className="text-xs text-gray-500">
                        Qty {item.quantity} • ${item.product?.price?.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/90 rounded-2xl shadow-sm border border-emerald-50 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Delivery details</h2>
              <p className="text-xs text-gray-500 mb-4">
                Select an address for this order. You can manage addresses in your profile.
              </p>

              {addresses.length ? (
                <div className="space-y-3">
                  <div className="grid sm:grid-cols-2 gap-3">
                    {addresses.map((addr) => {
                      const selected = (selectedAddress?.id ?? null) === addr.id;
                      return (
                        <button
                          key={addr.id}
                          type="button"
                          onClick={() => {
                            setSelectedAddressId(addr.id);
                            showToast({
                              variant: 'success',
                              title: 'Address selected',
                              message: `${addr.label || 'Address'} will be used for delivery.`
                            });
                          }}
                          className={`text-left rounded-xl border px-4 py-3 transition ${
                            selected
                              ? 'border-emerald-500 bg-emerald-50/70 ring-1 ring-emerald-200'
                              : 'border-gray-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/40'
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            <MapPin className="w-4 h-4 text-emerald-600 mt-0.5" />
                            <div className="space-y-0.5">
                              <p className="text-sm font-semibold text-gray-900">
                                {addr.label || 'Address'}
                              </p>
                              <p className="text-xs text-gray-700 whitespace-pre-line">
                                {addr.line1}
                              </p>
                              <p className="text-[11px] text-gray-500">{addr.country}</p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {profile && (
                    <p className="text-xs text-gray-500">
                      Delivering for:{' '}
                      <span className="text-gray-800 font-medium">
                        {profile.name || 'Customer'}
                      </span>
                      {profile.mobile ? <span className="text-gray-500"> • {profile.mobile}</span> : null}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => onNavigate('profile')}
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 underline underline-offset-2"
                  >
                    Manage addresses in profile
                  </button>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-amber-200 bg-amber-50/70 px-4 py-3 text-sm text-amber-800">
                  <p className="font-semibold mb-1">No delivery address yet</p>
                  <p className="text-xs mb-2">
                    Add at least one address in your profile so we know where to deliver your
                    order.
                  </p>
                  <button
                    onClick={() => onNavigate('profile')}
                    className="inline-flex text-xs font-semibold text-amber-900 underline underline-offset-2"
                  >
                    Go to profile & add address
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white/90 rounded-2xl shadow-sm border border-emerald-50 p-6 sticky top-24 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Order summary</h2>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                </div>
                {shipping === 0 && (
                  <p className="text-xs text-emerald-600">
                    You qualify for free shipping on this order.
                  </p>
                )}
              </div>
              <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Total to pay</span>
                <span className="text-xl font-bold text-gray-900">${total.toFixed(2)}</span>
              </div>

              <button
                onClick={() => {
                  if (!addresses.length) {
                    showToast({
                      variant: 'error',
                      title: 'Add a delivery address',
                      message: 'Please add and select a delivery address before proceeding to payment.'
                    });
                    return;
                  }
                  onNavigate('payment');
                }}
                className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold text-sm hover:bg-emerald-700 transition disabled:bg-gray-400"
                disabled={!addresses.length}
              >
                Reconfirm & proceed to payment
              </button>
              <button
                onClick={() => onNavigate('products')}
                className="w-full text-sm mt-1 text-gray-600 hover:text-gray-900"
              >
                Continue shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

