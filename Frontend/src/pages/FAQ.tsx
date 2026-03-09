interface FAQProps {
  onNavigate: (page: string) => void;
}

const faqs = [
  {
    q: 'When will my order ship?',
    a: 'Orders are typically processed within 1–2 business days. You’ll receive a confirmation email with tracking details once your order has shipped.'
  },
  {
    q: 'Do you ship internationally?',
    a: 'This is a demo store, but in a production environment we would support multiple regions with transparent shipping fees shown at checkout.'
  },
  {
    q: 'How do returns work?',
    a: 'Eligible items can be returned within the return window defined in our Shipping & Returns policy as long as they are unused and in original packaging.'
  },
  {
    q: 'How can I contact support?',
    a: 'You can use the contact form on our Contact page or reach out via the placeholder email listed there.'
  }
];

export default function FAQ({ onNavigate }: FAQProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
          <p className="text-gray-600">
            Quick answers to common questions about orders, shipping, and shopping with Lumina.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((item) => (
            <div key={item.q} className="bg-white rounded-lg shadow-sm p-5">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">{item.q}</h2>
              <p className="text-gray-600">{item.a}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center text-gray-600">
          <p>
            Still need help?{' '}
            <button
              onClick={() => onNavigate('contact')}
              className="text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Contact us
            </button>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

