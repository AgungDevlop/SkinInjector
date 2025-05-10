import { FaGamepad, FaTiktok, FaHome, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

const Layout: React.FC<{ children: ReactNode }> = ({ children }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  const handleForward = () => {
    navigate(1);
  };

  const handleHome = () => {
    navigate('/');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-900 via-blue-950 to-purple-950 relative overflow-hidden">
      {/* Animated Background Effect */}
      <div className="absolute inset-0 pointer-events-none animate-glitch">
        <div className="absolute w-full h-full bg-gradient-to-b from-transparent via-blue-950/20 to-transparent animate-scanline"></div>
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 w-full p-4 text-white flex items-center justify-between z-50 bg-gradient-to-r from-gray-900 via-blue-950 to-purple-950 backdrop-blur-md shadow-lg border-b-2 border-blue-400 animate-neon-pulse">
        <div className="flex items-center group">
          <FaGamepad className="mr-2 text-3xl text-blue-300 border-2 border-blue-400 rounded-full p-1 animate-neon-pulse group-hover:text-blue-200 group-hover:shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-300" />
          <h1 className="text-2xl font-extrabold tracking-tight text-blue-300 group-hover:text-blue-200 transition-colors duration-300 drop-shadow-[0_2px_4px_rgba(59,130,246,0.8)]">
            Skin Tools ML
          </h1>
        </div>
        <div className="flex items-center">
          <button
            onClick={() => (window.location.href = 'https://www.tiktok.com/@yourusername')}
            className="bg-gradient-to-r from-gray-900 via-blue-950 to-purple-950 text-blue-300 font-semibold p-2 rounded-xl border border-blue-400 animate-neon-pulse hover:bg-gradient-to-r hover:from-blue-950 hover:via-purple-950 hover:to-gray-900 hover:shadow-[0_0_10px_rgba(59,130,246,0.8),0_0_20px_rgba(59,130,246,0.6)] hover:scale-110 hover:animate-shake focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 transition-all duration-300"
          >
            <FaTiktok className="text-xl" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 text-white pt-20 pb-16 relative z-10">
        {children}
      </main>

      {/* Navigation Footer */}
      <footer className="fixed bottom-0 left-0 w-full p-4 bg-gradient-to-r from-gray-900 via-blue-950 to-purple-950 backdrop-blur-md shadow-lg border-t-2 border-blue-400 z-50 flex justify-around items-center">
        <button
          onClick={handleBack}
          className="text-blue-300 hover:text-blue-200 transition-colors duration-300"
        >
          <FaArrowLeft className="text-2xl" />
        </button>
        <button
          onClick={handleHome}
          className="text-blue-300 hover:text-blue-200 transition-colors duration-300"
        >
          <FaHome className="text-2xl" />
        </button>
        <button
          onClick={handleForward}
          className="text-blue-300 hover:text-blue-200 transition-colors duration-300"
        >
          <FaArrowRight className="text-2xl" />
        </button>
      </footer>
    </div>
  );
};

export default Layout;
