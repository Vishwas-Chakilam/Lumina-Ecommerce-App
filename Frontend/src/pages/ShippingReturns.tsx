interface ShippingReturnsProps {
  onNavigate: (page: string) => void;
}

export default function ShippingReturns({ onNavigate }: ShippingReturnsProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
          Shipping &amp; Returns
        </h1>

        <div className="space-y-8 text-gray-600">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Shipping</h2>
            <p className="mb-2">
              This Lumina storefront is currently a demo experience. In a production environment,
              orders would be processed within 1–2 business days and shipped via trusted carriers.
            </p>
            <p>
              Any thresholds for free shipping (for example, orders over $100) and estimated
              delivery windows would be clearly displayed at checkout and in your order
              confirmation.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Returns</h2>
            <p className="mb-2">
              We aim to make returns straightforward and fair. For a real store, eligible items
              could typically be returned within 30 days of delivery in their original condition
              and packaging.
            </p>
            <p>
              To initiate a return in a live environment, you would contact our support team with
              your order number and details. They would provide a return label and next steps.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Exclusions</h2>
            <p>
              Certain items may be final sale or have special return conditions. These would always
              be clearly marked on the product page prior to purchase.
            </p>
          </section>
        </div>

        <button
          onClick={() => onNavigate('faq')}
          className="mt-10 text-emerald-600 hover:text-emerald-700 font-medium"
        >
          View FAQs
        </button>
      </div>
    </div>
  );
}

