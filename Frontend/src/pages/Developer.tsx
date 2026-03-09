interface DeveloperProps {
  onNavigate: (page: string) => void;
}

export default function Developer({ onNavigate }: DeveloperProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <button
          onClick={() => onNavigate('home')}
          className="text-sm text-gray-600 hover:text-gray-900 mb-6"
        >
          ← Back to Home
        </button>

        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Developer</h1>
            <p className="text-gray-600">The mind behind Lumina.</p>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-gray-500 uppercase tracking-wide">Name</p>
            <p className="text-lg font-semibold text-gray-900">Vishwas Chakilam</p>
            <p className="text-gray-600">Full Stack Developer</p>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-gray-500 uppercase tracking-wide">Links</p>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://github.com/vishwas-chakilam"
                  className="text-emerald-600 hover:text-emerald-700"
                  target="_blank"
                  rel="noreferrer"
                >
                  github.com/vishwas-chakilam
                </a>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/in/vishwas-chakilam"
                  className="text-emerald-600 hover:text-emerald-700"
                  target="_blank"
                  rel="noreferrer"
                >
                  linkedin.com/in/vishwas-chakilam
                </a>
              </li>
              <li>
                <a
                  href="mailto:work.vishwas1@gmail.com"
                  className="text-emerald-600 hover:text-emerald-700"
                >
                  work.vishwas1@gmail.com
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-gray-500 uppercase tracking-wide">Interests & Domains</p>
            <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
              <li>Full stack web development (React, Spring Boot, TypeScript)</li>
              <li>Scalable backend APIs and domain-driven design</li>
              <li>Modern UI/UX, design systems, and micro-interactions</li>
              <li>E‑commerce platforms and payment flows</li>
              <li>Cloud-native architectures and DevOps practices</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

