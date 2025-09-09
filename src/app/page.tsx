import Home from '../components/Home';
import Image from 'next/image';

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Floating Logo */}
      <div className="fixed top-8 left-8 z-50">
        <div className="relative">
          <Image
            src="/logo.png"
            alt="KidScoop Logo"
            width={80}
            height={80}
            className="rounded-full shadow-2xl hover:scale-110 transition-transform duration-300"
          />
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 opacity-20 animate-pulse"></div>
        </div>
        <h1 className="sr-only">KidScoop</h1>
      </div>

      {/* Floating Navigation */}
      <nav className="fixed top-8 right-8 z-50">
        <div className="bg-white/10 backdrop-blur-md rounded-full px-6 py-3 border border-white/20">
          <div className="flex space-x-4 text-white/80 text-sm">
            <a href="#" className="hover:text-white transition-colors">Home</a>
            <a href="#" className="hover:text-white transition-colors">About</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-16">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="mb-8">
            <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
              KidScoop
            </h1>
            <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto leading-relaxed">
              Where curiosity meets discovery. Dive into a world of amazing stories, 
              fascinating facts, and endless adventures designed just for young minds.
            </p>
          </div>
          
          {/* Floating Action Button */}
          <div className="mt-12">
            <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-2xl hover:shadow-purple-500/25 transform hover:scale-105 transition-all duration-300">
              Start Exploring
            </button>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="relative z-10 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <Home />
        </div>
      </section>

      {/* Floating Footer */}
      <footer className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-white/10 backdrop-blur-md rounded-full px-8 py-4 border border-white/20">
          <p className="text-white/60 text-sm">
            © 2024 KidScoop • Made with ❤️ for curious minds
          </p>
        </div>
      </footer>

    </div>
  );
}