import { FaGamepad } from 'react-icons/fa';
import { ReactNode } from 'react';

const Layout: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-900 via-blue-950 to-purple-950 relative overflow-hidden">
      {/* Animated Background Effect */}
      <div className="absolute inset-0 pointer-events-none animate-glitch">
        <div className="absolute w-full h-full bg-gradient-to-b from-transparent via-blue-950/20 to-transparent animate-scanline"></div>
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 w-full p-4 text-white flex items-center justify-between z-50 bg-gradient-to-r from-gray-900 via-blue-950 to-purple-950 backdrop-blur-md shadow-lg border-b-2 border-blue-400 animate-neon-pulse">
        <div className="flex items-center group">
          <FaGamepad className="mr-2 text-3xl text-blue-300 group-hover:text-blue-200 transition-colors duration-300" />
          <h1 className="text-2xl font-extrabold tracking-tight text-blue-300 group-hover:text-blue-200 transition-colors duration-300 drop-shadow-[0_2px_4px_rgba(59,130,246,0.8)]">
            Skin Tools ML
          </h1>
        </div>
        <div className="flex items-center">
          <button
            onClick={() => (window.location.href = 'https://www.tiktok.com/@yourusername')}
            className="bg-blue-700 text-blue-100 font-semibold py-1.5 px-3 rounded-xl text-sm hover:bg-blue-600 hover:shadow-[0_0_20px_rgba(59,130,246,0.8)] hover:scale-110 hover:animate-shake focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 transition-all duration-300"
          >
            Follow
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 text-white pt-20 relative z-10">
        {children}
      </main>
    </div>
  );
};

export default Layout;