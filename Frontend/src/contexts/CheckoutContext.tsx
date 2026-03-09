import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

export type CheckoutPaymentMethod = 'upi' | 'cod' | 'card';

interface CheckoutState {
  selectedAddressId: string | null;
  paymentMethod: CheckoutPaymentMethod;
}

interface CheckoutContextValue extends CheckoutState {
  setSelectedAddressId: (id: string | null) => void;
  setPaymentMethod: (method: CheckoutPaymentMethod) => void;
  resetCheckout: () => void;
}

const STORAGE_KEY = 'lumina_checkout_state_v1';

const CheckoutContext = createContext<CheckoutContextValue | undefined>(undefined);

function safeLoad(): CheckoutState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CheckoutState>;
    const paymentMethod =
      parsed.paymentMethod === 'upi' || parsed.paymentMethod === 'cod' || parsed.paymentMethod === 'card'
        ? parsed.paymentMethod
        : 'upi';
    const selectedAddressId =
      typeof parsed.selectedAddressId === 'string' ? parsed.selectedAddressId : null;
    return { selectedAddressId, paymentMethod };
  } catch {
    return null;
  }
}

function safeSave(state: CheckoutState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function CheckoutProvider({ children }: { children: ReactNode }) {
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<CheckoutPaymentMethod>('upi');

  useEffect(() => {
    const loaded = safeLoad();
    if (!loaded) return;
    setSelectedAddressId(loaded.selectedAddressId);
    setPaymentMethod(loaded.paymentMethod);
  }, []);

  useEffect(() => {
    safeSave({ selectedAddressId, paymentMethod });
  }, [selectedAddressId, paymentMethod]);

  const value = useMemo<CheckoutContextValue>(
    () => ({
      selectedAddressId,
      paymentMethod,
      setSelectedAddressId,
      setPaymentMethod,
      resetCheckout: () => {
        setSelectedAddressId(null);
        setPaymentMethod('upi');
        try {
          window.localStorage.removeItem(STORAGE_KEY);
        } catch {
          // ignore
        }
      }
    }),
    [selectedAddressId, paymentMethod]
  );

  return <CheckoutContext.Provider value={value}>{children}</CheckoutContext.Provider>;
}

export function useCheckout() {
  const ctx = useContext(CheckoutContext);
  if (!ctx) throw new Error('useCheckout must be used within a CheckoutProvider');
  return ctx;
}

