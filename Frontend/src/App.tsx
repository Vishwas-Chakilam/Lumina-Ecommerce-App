import { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { getCartItemCount } from './api';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Admin from './pages/Admin';
import About from './pages/About';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import ShippingReturns from './pages/ShippingReturns';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Wishlist from './pages/Wishlist';
import TrackOrder from './pages/TrackOrder';
import Developer from './pages/Developer';
import Checkout from './pages/Checkout.tsx';
import Payment from './pages/Payment.tsx';

function App() {
  const { user } = useAuth();
  const [cartItemCount, setCartItemCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      loadCartCount();
    } else {
      setCartItemCount(0);
    }
  }, [user]);

  const loadCartCount = async () => {
    if (!user) return;

    try {
      const total = await getCartItemCount(user.id);
      setCartItemCount(total);
    } catch (error) {
      console.error('Error loading cart count:', error);
    }
  };

  const handleNavigate = (page: string, productId?: string) => {
    let path = '/';
    switch (page) {
      case 'home':
        path = '/';
        break;
      case 'products':
        path = '/products';
        break;
      case 'product':
        path = productId ? `/products/${productId}` : '/products';
        break;
      case 'cart':
        path = '/cart';
        break;
      case 'profile':
        path = '/profile';
        break;
      case 'login':
        path = '/login';
        break;
      case 'signup':
        path = '/signup';
        break;
      case 'admin':
        path = '/admin';
        break;
      case 'about':
        path = '/about';
        break;
      case 'contact':
        path = '/contact';
        break;
      case 'faq':
        path = '/faq';
        break;
      case 'shipping':
        path = '/shipping-returns';
        break;
      case 'privacy':
        path = '/privacy';
        break;
      case 'terms':
        path = '/terms';
        break;
      case 'wishlist':
        path = '/wishlist';
        break;
      case 'track':
        path = '/track-your-order';
        break;
      case 'developer':
        path = '/developer';
        break;
      case 'checkout':
        path = '/checkout';
        break;
      case 'payment':
        path = '/payment';
        break;
      default:
        path = '/';
    }
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  return (
    <div className="min-h-screen flex flex-col">
      {!isAuthPage && (
        <Header onNavigate={handleNavigate} cartItemCount={cartItemCount} />
      )}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home onNavigate={handleNavigate} />} />
          <Route path="/products" element={<Products onNavigate={handleNavigate} />} />
          <Route
            path="/products/:productId"
            element={
              <ProductDetailRoute onNavigate={handleNavigate} onAddToCart={loadCartCount} />
            }
          />
          <Route
            path="/cart"
            element={<Cart onNavigate={handleNavigate} onCartUpdate={loadCartCount} />}
          />
          <Route path="/profile" element={<Profile onNavigate={handleNavigate} />} />
          <Route path="/login" element={<Login onNavigate={handleNavigate} />} />
          <Route path="/signup" element={<Signup onNavigate={handleNavigate} />} />
          <Route path="/admin" element={<Admin onNavigate={handleNavigate} />} />
          <Route path="/about" element={<About onNavigate={handleNavigate} />} />
          <Route path="/contact" element={<Contact onNavigate={handleNavigate} />} />
          <Route path="/faq" element={<FAQ onNavigate={handleNavigate} />} />
          <Route
            path="/shipping-returns"
            element={<ShippingReturns onNavigate={handleNavigate} />}
          />
          <Route path="/privacy" element={<Privacy onNavigate={handleNavigate} />} />
          <Route path="/terms" element={<Terms onNavigate={handleNavigate} />} />
          <Route path="/wishlist" element={<Wishlist onNavigate={handleNavigate} />} />
          <Route path="/track-your-order" element={<TrackOrder onNavigate={handleNavigate} />} />
          <Route path="/developer" element={<Developer onNavigate={handleNavigate} />} />
          <Route path="/checkout" element={<Checkout onNavigate={handleNavigate} />} />
          <Route
            path="/payment"
            element={<Payment onNavigate={handleNavigate} onOrderComplete={loadCartCount} />}
          />
          <Route path="*" element={<Home onNavigate={handleNavigate} />} />
        </Routes>
      </main>
      {!isAuthPage && (
        <Footer onNavigate={handleNavigate} />
      )}
    </div>
  );
}

function ProductDetailRoute({
  onNavigate,
  onAddToCart
}: {
  onNavigate: (page: string, productId?: string) => void;
  onAddToCart: () => void;
}) {
  const { productId } = useParams();
  return (
    <ProductDetail
      productId={productId || ''}
      onNavigate={onNavigate}
      onAddToCart={onAddToCart}
    />
  );
}

export default App;
