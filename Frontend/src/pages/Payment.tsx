import { useEffect, useMemo, useState } from 'react';
import { CreditCard, Smartphone, Wallet, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fetchCart, fetchAddresses, fetchUserProfile, createOrderFromCart } from '../api';
import type { CartItem, Address, UserProfile } from '../types';
import { useToast } from '../components/ToastProvider';
import { useCheckout } from '../contexts/CheckoutContext';

type PaymentMethod = 'upi' | 'cod' | 'card';

interface PaymentProps {
  onNavigate: (page: string) => void;
  onOrderComplete: () => void;
}

export default function Payment({ onNavigate, onOrderComplete }: PaymentProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { selectedAddressId, paymentMethod, setPaymentMethod, resetCheckout } = useCheckout();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [method, setMethod] = useState<PaymentMethod>(paymentMethod);
  const [processing, setProcessing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [upiId, setUpiId] = useState('');
  const [cardForm, setCardForm] = useState({
    name: '',
    number: '',
    expiry: '',
    cvc: ''
  });

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
        setAddresses(userAddresses || []);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user]);

  const selectedAddress = useMemo(() => {
    if (!addresses.length) return null;
    if (!selectedAddressId) return addresses[0];
    return addresses.find((a) => a.id === selectedAddressId) ?? addresses[0];
  }, [addresses, selectedAddressId]);

  const validatePaymentDetails = () => {
    if (method === 'cod') return true;
    if (method === 'upi') {
      const val = upiId.trim();
      return val.length >= 6 && val.includes('@');
    }
    const digits = cardForm.number.replace(/\s+/g, '');
    const expiry = cardForm.expiry.trim();
    const cvc = cardForm.cvc.trim();
    if (!cardForm.name.trim()) return false;
    if (digits.length < 12 || digits.length > 19) return false;
    if (!/^\d+$/.test(digits)) return false;
    if (!/^\d{2}\/\d{2}$/.test(expiry)) return false;
    if (!/^\d{3,4}$/.test(cvc)) return false;
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      onNavigate('login');
      return;
    }

    if (!selectedAddress) {
      showToast({
        variant: 'error',
        title: 'Add a delivery address',
        message: 'Please add and select a delivery address before placing the order.'
      });
      onNavigate('checkout');
      return;
    }

    if (!cartItems.length) {
      showToast({
        variant: 'error',
        title: 'Cart is empty',
        message: 'Please add some products before placing an order.'
      });
      onNavigate('products');
      return;
    }

    if (!validatePaymentDetails()) {
      showToast({
        variant: 'error',
        title: 'Check your payment details',
        message:
          method === 'upi'
            ? 'Please enter a valid UPI ID (e.g. name@bank).'
            : method === 'card'
            ? 'Please enter valid card details (name, number, expiry MM/YY, and CVC).'
            : 'Please verify your payment details.'
      });
      return;
    }

    setProcessing(true);
    try {
      const order = await createOrderFromCart(user.id);
      onOrderComplete();
      resetCheckout();

      const prettyMethod =
        method === 'upi' ? 'UPI' : method === 'cod' ? 'Cash on Delivery' : 'Card';

      showToast({
        variant: 'success',
        title: 'Order placed',
        message: `Your order has been placed successfully using ${prettyMethod}.`
      });
      navigate(`/track-your-order?orderId=${encodeURIComponent(order.id)}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error: any) {
      showToast({
        variant: 'error',
        message: error?.message || 'Failed to process your order. Please try again.'
      });
    } finally {
      setProcessing(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShieldCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in to pay securely</h2>
          <p className="text-gray-600 mb-6">Please sign in to complete your payment.</p>
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
        <div className="text-gray-600">Loading payment options...</div>
      </div>
    );
  }

  if (!cartItems.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShieldCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No items to pay for</h2>
          <p className="text-gray-600 mb-6">
            Your cart is empty. Add products before going to payment.
          </p>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in-up">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-wide text-emerald-600 uppercase">
              Step 2 of 2
            </p>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">
              Choose how you want to pay
            </h1>
            <p className="text-sm text-gray-600">
              Securely complete your order using your preferred payment method.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2 text-xs font-medium text-gray-600">
            <span className="text-gray-500">Pre‑order</span>
            <span className="h-px w-6 bg-gray-300" />
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="text-gray-900">Payment</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white/95 rounded-2xl shadow-sm border border-emerald-50 p-6">
              <h2 className="text-sm font-semibold text-gray-900 mb-1">Payment methods</h2>
              <p className="text-xs text-gray-500 mb-4">
                Select one option below. All payments are processed securely.
              </p>
              <div className="grid md:grid-cols-3 gap-3">
                <PaymentOption
                  icon={Smartphone}
                  label="UPI"
                  description="Pay with any UPI app"
                  selected={method === 'upi'}
                  onClick={() => {
                    setMethod('upi');
                    setPaymentMethod('upi');
                  }}
                />
                <PaymentOption
                  icon={Wallet}
                  label="Cash on Delivery"
                  description="Pay when the order arrives"
                  selected={method === 'cod'}
                  onClick={() => {
                    setMethod('cod');
                    setPaymentMethod('cod');
                  }}
                />
                <PaymentOption
                  icon={CreditCard}
                  label="Card"
                  description="Credit or debit card"
                  selected={method === 'card'}
                  onClick={() => {
                    setMethod('card');
                    setPaymentMethod('card');
                  }}
                />
              </div>
            </div>

            <div className="bg-white/95 rounded-2xl shadow-sm border border-emerald-50 p-6">
              <h2 className="text-sm font-semibold text-gray-900 mb-1">
                {method === 'upi'
                  ? 'UPI details'
                  : method === 'card'
                  ? 'Card details'
                  : 'Cash on Delivery'}
              </h2>
              <p className="text-xs text-gray-500 mb-4">
                {method === 'upi'
                  ? 'Enter your UPI ID. We’ll redirect you to your UPI app on real integration.'
                  : method === 'card'
                  ? 'Enter your card details to complete payment securely.'
                  : 'No online payment needed. Pay when the order is delivered.'}
              </p>

              {method === 'upi' && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-gray-700">UPI ID</label>
                  <input
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="name@bank"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm font-mono"
                  />
                  <p className="text-[11px] text-gray-500">Example: yourname@okhdfcbank</p>
                </div>
              )}

              {method === 'card' && (
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="block text-xs font-medium text-gray-700">Name on card</label>
                    <input
                      value={cardForm.name}
                      onChange={(e) => setCardForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="Full name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="block text-xs font-medium text-gray-700">Card number</label>
                    <input
                      value={cardForm.number}
                      onChange={(e) => setCardForm((f) => ({ ...f, number: e.target.value }))}
                      placeholder="1234 5678 9012 3456"
                      inputMode="numeric"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-gray-700">
                      Expiry (MM/YY)
                    </label>
                    <input
                      value={cardForm.expiry}
                      onChange={(e) => setCardForm((f) => ({ ...f, expiry: e.target.value }))}
                      placeholder="07/29"
                      inputMode="numeric"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-gray-700">CVC</label>
                    <input
                      value={cardForm.cvc}
                      onChange={(e) => setCardForm((f) => ({ ...f, cvc: e.target.value }))}
                      placeholder="123"
                      inputMode="numeric"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm font-mono"
                    />
                  </div>
                </div>
              )}

              {method === 'cod' && (
                <div className="rounded-xl border border-dashed border-emerald-200 bg-emerald-50/60 px-4 py-3 text-sm text-gray-800">
                  You&apos;ll pay the delivery partner when your order arrives.
                </div>
              )}
            </div>

            <div className="bg-white/95 rounded-2xl shadow-sm border border-emerald-50 p-6">
              <h2 className="text-sm font-semibold text-gray-900 mb-1">Delivering to</h2>
              <p className="text-xs text-gray-500 mb-3">
                Double‑check your delivery location before placing the order.
              </p>
              {selectedAddress ? (
                <div className="rounded-xl border border-dashed border-emerald-200 bg-emerald-50/60 px-4 py-3 text-sm text-gray-800">
                  <p className="font-semibold text-gray-900 mb-0.5">
                    {selectedAddress.label || 'Selected address'}
                  </p>
                  <p className="whitespace-pre-line">{selectedAddress.line1}</p>
                  <p className="text-xs text-gray-500 mt-1">{selectedAddress.country}</p>
                  {profile && (
                    <p className="text-xs text-gray-500 mt-1">
                      {profile.name && <span className="mr-1.5">{profile.name} •</span>}
                      {profile.mobile && <span>{profile.mobile}</span>}
                    </p>
                  )}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-amber-200 bg-amber-50/70 px-4 py-3 text-sm text-amber-800">
                  <p className="font-semibold mb-1">No address selected</p>
                  <p className="text-xs mb-2">
                    You have not saved any delivery address yet. Add one in your profile before
                    placing the order.
                  </p>
                  <button
                    onClick={() => onNavigate('checkout')}
                    className="inline-flex text-xs font-semibold text-amber-900 underline underline-offset-2"
                  >
                    Go back to checkout
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white/95 rounded-2xl shadow-sm border border-emerald-50 p-6 sticky top-24 space-y-4">
              <h2 className="text-sm font-semibold text-gray-900">Order summary</h2>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Items ({cartItems.length})</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                </div>
                {shipping === 0 && (
                  <p className="text-xs text-emerald-600">
                    You&apos;re getting free shipping on this order.
                  </p>
                )}
              </div>
              <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Total payable</span>
                <span className="text-xl font-bold text-gray-900">${total.toFixed(2)}</span>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={processing}
                className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold text-sm hover:bg-emerald-700 transition disabled:bg-gray-400"
              >
                {processing ? 'Placing your order...' : 'Place order securely'}
              </button>
              <button
                onClick={() => onNavigate('checkout')}
                className="w-full text-sm mt-1 text-gray-600 hover:text-gray-900"
              >
                Back to pre‑order details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface PaymentOptionProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}

function PaymentOption({ icon: Icon, label, description, selected, onClick }: PaymentOptionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-start gap-1 rounded-xl border px-4 py-3 text-left text-sm transition shadow-sm ${
        selected
          ? 'border-emerald-500 bg-emerald-50/80 text-gray-900 ring-1 ring-emerald-200'
          : 'border-gray-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/40'
      }`}
    >
      <div className="flex items-center gap-2">
        <Icon className="w-5 h-5 text-emerald-600" />
        <span className="font-semibold">{label}</span>
      </div>
      <p className="text-xs text-gray-600">{description}</p>
    </button>
  );
}

