import type { Product, Category, CartItem, Order, OrderItem, UserProfile, Address } from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const TEST_USER_ID = import.meta.env.VITE_TEST_USER_ID || '';

const withApiBase = (path: string) => `${API_BASE_URL}${path}`;

const effectiveUserId = (userId: string) => {
  // During this phase, we always route through a stable backend UUID if provided.
  return TEST_USER_ID || userId;
};

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(withApiBase(path));
  if (!res.ok) {
    throw new Error(`GET ${path} failed with status ${res.status}`);
  }
  return (await res.json()) as T;
}

async function apiSend<T>(
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  path: string,
  body?: unknown
): Promise<T> {
  const res = await fetch(withApiBase(path), {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined
  });
  if (!res.ok) {
    throw new Error(`${method} ${path} failed with status ${res.status}`);
  }
  // Many endpoints return no body; guard for that.
  const text = await res.text();
  return text ? (JSON.parse(text) as T) : (undefined as T);
}

function normalizeProduct(raw: any): Product {
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    price: raw.price,
    image_url: raw.image_url ?? raw.imageUrl,
    category_id: raw.category_id ?? raw.categoryId,
    stock: raw.stock,
    featured: raw.featured,
    created_at: raw.created_at ?? raw.createdAt
  };
}

// Product & category queries
export async function fetchCategories(): Promise<Category[]> {
  const products = await fetchProducts();
  const map = new Map<string, Category>();

  products.forEach((product) => {
    const id = product.category_id;
    if (!id || map.has(id)) return;
    map.set(id, {
      id,
      name: id,
      slug: id,
      created_at: product.created_at
    });
  });

  return Array.from(map.values());
}

export async function fetchProducts(categoryId?: string): Promise<Product[]> {
  const search =
    !categoryId || categoryId === 'all'
      ? ''
      : `?category=${encodeURIComponent(categoryId)}`;
  const raw = await apiGet<any[]>(`/api/products${search}`);
  return raw.map(normalizeProduct);
}

export async function fetchFeaturedProducts(limit = 4): Promise<Product[]> {
  const raw = await apiGet<any[]>(`/api/products?featured=true`);
  const products = raw.map(normalizeProduct);
  return products.slice(0, limit);
}

export async function fetchProductById(id: string): Promise<Product | null> {
  try {
    const raw = await apiGet<any>(`/api/products/${encodeURIComponent(id)}`);
    return normalizeProduct(raw);
  } catch {
    return null;
  }
}

// Admin-side product mutations
export async function createProduct(data: Omit<Product, 'created_at'>): Promise<Product> {
  // For now, admin product management stays in-memory until backend admin APIs are defined.
  throw new Error('Admin product management via backend API not implemented yet.');
}

export async function updateProduct(
  id: string,
  updates: Partial<Omit<Product, 'id' | 'created_at'>>
): Promise<void> {
  throw new Error('Admin product management via backend API not implemented yet.');
}

export async function deleteProduct(id: string): Promise<void> {
  throw new Error('Admin product management via backend API not implemented yet.');
}

// Cart helpers
export async function fetchCart(userId: string): Promise<CartItem[]> {
  const uid = effectiveUserId(userId);
  return apiGet<CartItem[]>(`/api/cart?userId=${encodeURIComponent(uid)}`);
}

export async function getCartItemCount(userId: string): Promise<number> {
  const uid = effectiveUserId(userId);
  return apiGet<number>(`/api/cart/count?userId=${encodeURIComponent(uid)}`);
}

export async function addToCart(
  userId: string,
  productId: string,
  quantity: number
): Promise<void> {
  const uid = effectiveUserId(userId);
  await apiSend<void>(
    'POST',
    `/api/cart/add?userId=${encodeURIComponent(uid)}&productId=${encodeURIComponent(
      productId
    )}&quantity=${quantity}`
  );
}

// Wishlist helpers
export async function fetchWishlist(userId: string): Promise<Product[]> {
  const uid = effectiveUserId(userId);
  const raw = await apiGet<any[]>(`/api/wishlist?userId=${encodeURIComponent(uid)}`);
  return raw.map(normalizeProduct);
}

export async function toggleWishlist(userId: string, productId: string): Promise<void> {
  const uid = effectiveUserId(userId);
  await apiSend<void>(
    'POST',
    `/api/wishlist/toggle?userId=${encodeURIComponent(uid)}&productId=${encodeURIComponent(
      productId
    )}`
  );
}

// Profile & address helpers
export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  const uid = effectiveUserId(userId);
  try {
    return await apiGet<UserProfile>(`/api/profile/${encodeURIComponent(uid)}`);
  } catch {
    return null;
  }
}

export async function saveUserProfile(
  userId: string,
  data: Omit<UserProfile, 'userId'>
): Promise<void> {
  const uid = effectiveUserId(userId);
  await apiSend<UserProfile>('PUT', `/api/profile/${encodeURIComponent(uid)}`, {
    name: data.name,
    mobile: data.mobile,
    country: data.country
  });
}

export async function fetchAddresses(userId: string): Promise<Address[]> {
  const uid = effectiveUserId(userId);
  return apiGet<Address[]>(`/api/profile/${encodeURIComponent(uid)}/addresses`);
}

export async function addAddress(
  userId: string,
  data: Omit<Address, 'id' | 'userId'>
): Promise<Address> {
  const uid = effectiveUserId(userId);
  return apiSend<Address>('POST', `/api/profile/${encodeURIComponent(uid)}/addresses`, {
    label: data.label,
    line1: data.line1,
    country: data.country
  });
}

export async function updateAddress(
  userId: string,
  addressId: string,
  updates: Partial<Omit<Address, 'id' | 'userId'>>
): Promise<void> {
  const uid = effectiveUserId(userId);
  await apiSend<Address>(
    'PUT',
    `/api/profile/${encodeURIComponent(uid)}/addresses/${encodeURIComponent(addressId)}`,
    updates
  );
}

export async function deleteAddress(userId: string, addressId: string): Promise<void> {
  const uid = effectiveUserId(userId);
  await apiSend<void>(
    'DELETE',
    `/api/profile/${encodeURIComponent(uid)}/addresses/${encodeURIComponent(addressId)}`
  );
}

export async function updateCartItemQuantity(
  userId: string,
  itemId: string,
  newQuantity: number
): Promise<void> {
  const uid = effectiveUserId(userId);
  await apiSend<void>(
    'PATCH',
    `/api/cart/${encodeURIComponent(itemId)}/quantity?userId=${encodeURIComponent(
      uid
    )}&quantity=${newQuantity}`
  );
}

export async function removeCartItem(userId: string, itemId: string): Promise<void> {
  const uid = effectiveUserId(userId);
  await apiSend<void>(
    'DELETE',
    `/api/cart/${encodeURIComponent(itemId)}?userId=${encodeURIComponent(uid)}`
  );
}

export async function clearCart(userId: string): Promise<void> {
  const uid = effectiveUserId(userId);
  await apiSend<void>('DELETE', `/api/cart/clear?userId=${encodeURIComponent(uid)}`);
}

// Orders
export async function fetchOrders(userId: string): Promise<Order[]> {
  const uid = effectiveUserId(userId);
  return apiGet<Order[]>(`/api/orders?userId=${encodeURIComponent(uid)}`);
}

export async function fetchAllOrders(): Promise<Order[]> {
  return apiGet<Order[]>(`/api/orders/all`);
}

export async function fetchOrderItems(orderId: string): Promise<OrderItem[]> {
  return apiGet<OrderItem[]>(`/api/orders/${encodeURIComponent(orderId)}/items`);
}

export async function updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
  await apiSend<Order>(
    'PATCH',
    `/api/orders/${encodeURIComponent(orderId)}/status?status=${encodeURIComponent(status)}`
  );
}

export async function createOrderFromCart(userId: string): Promise<Order> {
  const uid = effectiveUserId(userId);
  return apiSend<Order>('POST', `/api/cart/checkout?userId=${encodeURIComponent(uid)}`);
}

