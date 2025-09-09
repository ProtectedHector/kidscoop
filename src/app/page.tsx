import Home from '../components/Home';
import Image from 'next/image';

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header with Logo */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-2">
            <div className="flex items-center">
              <Image
                src="/logo.png"
                alt="KidScoop Logo"
                width={240}
                height={240}
                className="rounded-lg shadow-md"
              />
              <h1 className="sr-only">
                KidScoop
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            Welcome to KidScoop
          </h2>
          <p className="text-gray-600">
            Discover amazing articles and stories for kids
          </p>
        </div>
        
        <Home />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-500">
            <p>&copy; 2024 KidScoop. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}