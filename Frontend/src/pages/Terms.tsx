interface TermsProps {
  onNavigate: (page: string) => void;
}

export default function Terms({ onNavigate }: TermsProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Terms &amp; Conditions</h1>

        <div className="space-y-6 text-gray-600">
          <p>
            These Terms describe how a production-ready version of Lumina would outline your rights
            and responsibilities as a customer. This project is a demo and does not represent a
            live store.
          </p>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Use of the Site</h2>
            <p>
              In a live environment, by placing an order you would confirm that the information
              provided is accurate and that you have the legal capacity to enter into a purchase
              agreement.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Pricing &amp; Availability</h2>
            <p>
              Product descriptions, prices, and availability would be kept as accurate as possible.
              However, a real store may reserve the right to correct errors or update listings when
              needed.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Limitation of Liability</h2>
            <p>
              Standard terms often include reasonable limits on liability regarding indirect or
              consequential losses, always within the boundaries of applicable law.
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

