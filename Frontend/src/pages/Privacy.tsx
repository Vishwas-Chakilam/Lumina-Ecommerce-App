interface PrivacyProps {
  onNavigate: (page: string) => void;
}

export default function Privacy({ onNavigate }: PrivacyProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Privacy Policy</h1>

        <div className="space-y-6 text-gray-600">
          <p>
            This Privacy Policy describes how a future production version of Lumina would handle
            your information. The current project is a demo storefront and does not process real
            payments or store real customer data.
          </p>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Information We Collect</h2>
            <p>
              In a live deployment, we would collect only the information needed to process your
              orders, such as your name, contact details, shipping address, and order history.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">How We Use Information</h2>
            <p>
              Typical uses include fulfilling orders, providing customer support, improving the
              store experience, and sending important updates about your purchases when necessary.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Your Choices</h2>
            <p>
              Customers would be able to update their details, request data exports, or ask for
              account deletion in compliance with the privacy regulations applicable in their
              region.
            </p>
          </section>
        </div>

        <button
          onClick={() => onNavigate('home')}
          className="mt-10 text-emerald-600 hover:text-emerald-700 font-medium"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}

