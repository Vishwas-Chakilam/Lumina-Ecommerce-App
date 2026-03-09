interface AboutProps {
  onNavigate: (page: string) => void;
}

export default function About({ onNavigate }: AboutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">About Lumina</h1>
          <p className="text-gray-600 text-lg">
            Lumina is a curated marketplace for modern lifestyle essentials that brighten your
            everyday moments. We bring together design-led products with a focus on quality,
            comfort, and calm.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-10 mb-12">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Our Vision</h2>
            <p className="text-gray-600">
              We believe your space and the objects you interact with should help you feel grounded,
              inspired, and at ease. From ambient lighting to textiles and tech, our collections are
              chosen to create small moments of clarity in busy days.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Curated Collections</h2>
            <p className="text-gray-600">
              Every product in Lumina is reviewed for build quality, materials, and usability. We
              prioritize pieces that age well, feel good to use, and integrate seamlessly into
              different lifestyles and homes.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Why Shop with Lumina?</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li>Thoughtfully curated products from trusted makers</li>
            <li>Transparent pricing with no unexpected fees at checkout</li>
            <li>Fast, reliable shipping and responsive support</li>
            <li>Easy returns within our stated policy window</li>
          </ul>

          <button
            onClick={() => onNavigate('products')}
            className="mt-6 inline-flex items-center px-6 py-3 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition"
          >
            Explore Products
          </button>
        </div>
      </div>
    </div>
  );
}

