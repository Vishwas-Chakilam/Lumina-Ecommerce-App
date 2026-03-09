import { ShoppingCart, User, Search, Menu, X, Heart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

interface HeaderProps {
  onNavigate: (page: string) => void;
  cartItemCount: number;
}

export default function Header({ onNavigate, cartItemCount }: HeaderProps) {
  const { user, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <button
              onClick={() => onNavigate('home')}
              className="text-2xl font-bold text-emerald-600 hover:text-emerald-700 transition"
            >
              Lumina
            </button>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => onNavigate('home')}
              className="text-gray-700 hover:text-emerald-600 transition font-medium"
            >
              Home
            </button>
            <button
              onClick={() => onNavigate('products')}
              className="text-gray-700 hover:text-emerald-600 transition font-medium"
            >
              Shop
            </button>
          </nav>

          <div className="flex items-center space-x-4">
            <button
              className="hidden md:block text-gray-700 hover:text-emerald-600 transition"
              onClick={() => onNavigate('products')}
            >
              <Search className="w-5 h-5" />
            </button>

            <button
              onClick={() => onNavigate('wishlist')}
              className="relative text-gray-700 hover:text-emerald-600 transition"
            >
              <Heart className="w-5 h-5" />
            </button>

            <button
              onClick={() => onNavigate('cart')}
              className="relative text-gray-700 hover:text-emerald-600 transition"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-emerald-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </button>

            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="text-gray-700 hover:text-emerald-600 transition"
              >
                <User className="w-5 h-5" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2">
                  {user ? (
                    <>
                      <button
                        onClick={() => {
                          onNavigate('profile');
                          setShowUserMenu(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Profile
                      </button>
                      {user.role === 'admin' && (
                        <button
                          onClick={() => {
                            onNavigate('admin');
                            setShowUserMenu(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Admin Dashboard
                        </button>
                      )}
                      <button
                        onClick={() => {
                          signOut();
                          setShowUserMenu(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          onNavigate('login');
                          setShowUserMenu(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Sign In
                      </button>
                      <button
                        onClick={() => {
                          onNavigate('signup');
                          setShowUserMenu(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Sign Up
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden text-gray-700"
            >
              {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {showMobileMenu && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-2">
              <button
                onClick={() => {
                  onNavigate('home');
                  setShowMobileMenu(false);
                }}
                className="text-left py-2 text-gray-700 hover:text-emerald-600 transition font-medium"
              >
                Home
              </button>
              <button
                onClick={() => {
                  onNavigate('products');
                  setShowMobileMenu(false);
                }}
                className="text-left py-2 text-gray-700 hover:text-emerald-600 transition font-medium"
              >
                Shop
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
