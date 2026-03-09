import type { Product, Order, OrderItem, CartItem, UserProfile, Address } from './types';

// Simple IDs for in-memory data
export const uuid = () => Math.random().toString(36).slice(2);

const PRODUCTS_KEY = 'lumina_products_cache';

let productsStore: Product[] | null = null;

function loadProductsFromStorage(): Product[] {
  if (productsStore) return productsStore;

  try {
    if (typeof window !== 'undefined') {
      const raw = window.localStorage.getItem(PRODUCTS_KEY);
      if (raw) {
        productsStore = JSON.parse(raw) as Product[];
        return productsStore;
      }
    }
  } catch {
    // ignore storage errors
  }

  productsStore = [];
  return productsStore;
}

function saveProductsToStorage(products: Product[]) {
  productsStore = products;
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
    }
  } catch {
    // ignore storage errors
  }
}

export function getProductsStore(): Product[] {
  return loadProductsFromStorage();
}

export function setProductsStore(products: Product[]) {
  saveProductsToStorage(products);
}

export function addProductToStore(product: Product) {
  const current = loadProductsFromStorage();
  const next = [product, ...current];
  saveProductsToStorage(next);
}

export function updateProductInStore(id: string, updates: Partial<Product>) {
  const current = loadProductsFromStorage();
  const next = current.map((p) => (p.id === id ? { ...p, ...updates } : p));
  saveProductsToStorage(next);
}

export function deleteProductFromStore(id: string) {
  const current = loadProductsFromStorage();
  const next = current.filter((p) => p.id !== id);
  saveProductsToStorage(next);
}

// Per-user in-memory state for mock carts, wishlists, profiles, addresses and orders.
// In a real app this would live in your Spring Boot + database backend.
const cartsByUser: Record<string, CartItem[]> = {};
const wishlistsByUser: Record<string, string[]> = {};
const ordersByUser: Record<string, Order[]> = {};
const orderItemsByOrder: Record<string, OrderItem[]> = {};
const profilesByUser: Record<string, UserProfile> = {};
const addressesByUser: Record<string, Address[]> = {};

export function getMockCart(userId: string): CartItem[] {
  return cartsByUser[userId] ?? [];
}

export function setMockCart(userId: string, items: CartItem[]) {
  cartsByUser[userId] = items;
}

export function getMockWishlist(userId: string): string[] {
  return wishlistsByUser[userId] ?? [];
}

export function setMockWishlist(userId: string, productIds: string[]) {
  wishlistsByUser[userId] = productIds;
}

export function getMockProfile(userId: string): UserProfile | null {
  return profilesByUser[userId] ?? null;
}

export function setMockProfile(userId: string, profile: UserProfile) {
  profilesByUser[userId] = profile;
}

export function getMockAddresses(userId: string): Address[] {
  return addressesByUser[userId] ?? [];
}

export function setMockAddresses(userId: string, addresses: Address[]) {
  addressesByUser[userId] = addresses;
}

export function getMockOrders(userId: string): Order[] {
  return ordersByUser[userId] ?? [];
}

export function getAllMockOrders(): Order[] {
  return Object.values(ordersByUser).flat();
}

export function addMockOrder(userId: string, order: Order, items: OrderItem[]) {
  if (!ordersByUser[userId]) {
    ordersByUser[userId] = [];
  }
  ordersByUser[userId].unshift(order);
  orderItemsByOrder[order.id] = items;
}

export function getMockOrderItems(orderId: string): OrderItem[] {
  return orderItemsByOrder[orderId] ?? [];
}

export function updateMockOrder(orderId: string, updates: Partial<Order>) {
  Object.keys(ordersByUser).forEach((userId) => {
    const list = ordersByUser[userId];
    const index = list.findIndex((o) => o.id === orderId);
    if (index !== -1) {
      list[index] = { ...list[index], ...updates };
    }
  });
}
