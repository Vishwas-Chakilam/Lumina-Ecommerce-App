interface FooterProps {
  onNavigate: (page: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white text-xl font-bold mb-4">Lumina</h3>
            <p className="text-sm">
              Your destination for premium lifestyle products that brighten every moment.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('products')}
                  className="hover:text-white transition"
                >
                  All Products
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-white transition"
                >
                  About Lumina
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('faq')}
                  className="hover:text-white transition"
                >
                  FAQs
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('privacy')}
                  className="hover:text-white transition"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('terms')}
                  className="hover:text-white transition"
                >
                  Terms of Service
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('contact')}
                  className="hover:text-white transition"
                >
                  Contact Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('shipping')}
                  className="hover:text-white transition"
                >
                  Shipping &amp; Returns
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('track')}
                  className="hover:text-white transition"
                >
                  Track Your Order
                </button>
              </li>
              <li>
              <button
              onClick={() => onNavigate('developer')}
              className="hover:text-white transition"
            >
              Developer
            </button>
              </li>
              <li>
              <button
              className="hover:text-white transition"
            >
              <a href="https://www.google.com">Whatsapp Support</a>
            </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Connect</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button className="hover:text-white transition">Instagram</button>
              </li>
              <li>
                <button className="hover:text-white transition">Facebook</button>
              </li>
              <li>
                <button className="hover:text-white transition">Twitter</button>
              </li>
              <li>
                <button className="hover:text-white transition">Pinterest</button>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
            <p>&copy; 2024 Lumina. All rights reserved.</p>
            
          </div>
        </div>
      </div>
    </footer>
  );
}
