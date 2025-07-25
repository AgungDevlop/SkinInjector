import { FaGamepad, FaTiktok, FaHome, FaArrowLeft, FaArrowRight, FaMoon, FaSun } from 'react-icons/fa';
import { ReactNode, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import ParticlesBackground from '../components/ParticlesBackground';
import { ThemeContext } from '../components/ThemeContext';
import { ThemeColors } from '../components/ThemeColors';

const Layout: React.FC<{ children: ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode, theme, setTheme } = useContext(ThemeContext);
  const { colors } = ThemeColors(theme, isDarkMode);

  const handleBack = () => navigate(-1);
  const handleForward = () => navigate(1);
  const handleHome = () => navigate('/');

  const themeOptions = [
    { value: 'cyberpurple', label: 'Cyber Purple' },
    { value: 'neonblue', label: 'Neon Blue' },
    { value: 'electricpink', label: 'Electric Pink' },
    { value: 'cosmicteal', label: 'Cosmic Teal' },
    { value: 'solarorange', label: 'Solar Orange' },
    { value: 'lunargreen', label: 'Lunar Green' },
    { value: 'starred', label: 'Star Red' },
    { value: 'galacticgold', label: 'Galactic Gold' },
    { value: 'quantumglow', label: 'Quantum Glow' },
  ];

  return (
    <div className={`flex flex-col min-h-screen ${isDarkMode ? colors.dark : colors.light} relative overflow-hidden font-sans`}>
      <style>
        {`
          .custom-select {
            appearance: none;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='${encodeURIComponent(colors.glow)}' viewBox='0 0 24 24'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 6px center;
            background-size: 12px;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            box-shadow: 0 0 4px ${colors.glow};
            font-family: 'Inter', sans-serif;
            font-weight: 500;
          }
          .custom-select:hover, .custom-select:focus {
            box-shadow: 0 0 8px ${colors.glow};
            outline: none;
            transform: scale(1.02);
          }
          .custom-select option {
            background: ${isDarkMode ? colors.dropdownBgDark : colors.dropdownBgLight};
            color: ${isDarkMode ? colors.dropdownTextDark : colors.dropdownTextLight};
          }
          h1, button, select {
            text-shadow: 0 0 2px ${colors.glow}80;
            transition: text-shadow 0.2s ease, transform 0.2s ease;
          }
          h1:hover, button:hover, select:hover {
            text-shadow: 0 0 4px ${colors.glow};
          }
        `}
      </style>
      <ParticlesBackground />
      <header className={`fixed top-0 left-0 w-full p-2 ${isDarkMode ? colors.headerDark : colors.headerLight} flex items-center justify-between z-50 backdrop-blur-md shadow-sm border-b-2 ${colors.border}`}>
        <div className="flex items-center group">
          <FaGamepad className={`mr-1.5 text-lg ${isDarkMode ? colors.textDark : colors.textLight} border-2 ${colors.border} rounded-full p-0.5 group-hover:${isDarkMode ? colors.hoverDark : colors.hoverLight} transition-transform duration-200`} />
          <h1 className={`text-base font-bold tracking-tight ${isDarkMode ? colors.textDark : colors.textLight} group-hover:${isDarkMode ? colors.hoverDark : colors.hoverLight} transition-transform duration-200`}>
            Neon Visual App
          </h1>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value as any)}
            className={`custom-select p-1.5 text-xs rounded-lg ${isDarkMode ? `${colors.dropdownBgDark} ${colors.dropdownTextDark}` : `${colors.dropdownBgLight} ${colors.dropdownTextLight}`} ${colors.dropdownBorder} focus:ring-0 outline-none pr-6`}
            >
            {themeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            onClick={toggleDarkMode}
            className={`p-1.5 rounded-full ${isDarkMode ? colors.buttonDark : colors.buttonLight} text-white hover:scale-105 transition-transform duration-200`}
            aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
            {isDarkMode ? <FaSun className="text-sm" /> : <FaMoon className="text-sm" />}
          </button>
          <button
            onClick={() => (window.location.href = 'https://www.tiktok.com/@agungdev')}
            className={`p-1.5 rounded-lg border ${colors.border} ${isDarkMode ? `${colors.textDark} ${colors.headerDark} ${colors.hoverDark}` : `${colors.textLight} ${colors.headerLight} ${colors.hoverLight}`} font-semibold hover:scale-105 transition-transform duration-200 text-xs`}
            >
            <FaTiktok className="text-sm" />
          </button>
        </div>
      </header>
      <main className={`flex-1 ${isDarkMode ? 'text-white' : 'text-gray-900'} pt-12 pb-12 relative z-10 font-medium`}>
        {children}
      </main>
      <footer className={`fixed bottom-0 left-0 w-full p-2 ${isDarkMode ? colors.headerDark : colors.headerLight} backdrop-blur-md shadow-sm border-t-2 ${colors.border} z-50 flex justify-around items-center`}>
        <button onClick={handleBack} className={`${isDarkMode ? colors.textDark : colors.textLight} ${isDarkMode ? colors.hoverDark : colors.hoverLight} hover:scale-110 transition-transform duration-200 text-base`}>
          <FaArrowLeft />
        </button>
        <button onClick={handleHome} className={`${isDarkMode ? colors.textDark : colors.textLight} ${isDarkMode ? colors.hoverDark : colors.hoverLight} hover:scale-110 transition-transform duration-200 text-base`}>
          <FaHome />
        </button>
        <button onClick={handleForward} className={`${isDarkMode ? colors.textDark : colors.textLight} ${isDarkMode ? colors.hoverDark : colors.hoverLight} hover:scale-110 transition-transform duration-200 text-base`}>
          <FaArrowRight />
        </button>
      </footer>
    </div>
  );
};

export default Layout;
