import { useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { FaFistRaised, FaShieldAlt, FaMagic, FaCrosshairs, FaSkull, FaHandsHelping } from "react-icons/fa";
import { ThemeContext } from "../components/ThemeContext";
import { ThemeColors } from "../components/ThemeColors";

const Banner: React.FC = () => {
  const { isDarkMode, theme } = useContext(ThemeContext);
  const { colors } = ThemeColors(theme, isDarkMode);
  const navigate = useNavigate();

  const handleRoleClick = useCallback((role: string) => {
    sessionStorage.setItem("selectedRole", role);
    window.dispatchEvent(new Event("storage"));
    navigate("/view-hero");
  }, [navigate]);

  const roles = [
    { name: "Assassin", icon: <FaSkull className="text-xl" />, color: `${isDarkMode ? 'text-red-500' : 'text-red-600'}` },
    { name: "Fighter", icon: <FaFistRaised className="text-xl" />, color: `${isDarkMode ? 'text-orange-400' : 'text-orange-600'}` },
    { name: "Marksman", icon: <FaCrosshairs className="text-xl" />, color: `${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}` },
    { name: "Tank", icon: <FaShieldAlt className="text-xl" />, color: `${isDarkMode ? 'text-blue-400' : 'text-blue-600'}` },
    { name: "Mage", icon: <FaMagic className="text-xl" />, color: `${isDarkMode ? colors.primaryDark : colors.primaryLight}` },
    { name: "Support", icon: <FaHandsHelping className="text-xl" />, color: `${isDarkMode ? 'text-green-400' : 'text-green-600'}` },
  ];

  return (
    <div className="container mx-auto mb-5 mt-5 sm:p-3">
      <style>
        {`
          @keyframes fade-in {
            0% { opacity: 0; transform: translateY(10px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fade-in 0.5s ease-out forwards;
          }
          ${roles.map((_, i) => `
            .animate-delay-${i * 100} {
              animation-delay: ${i * 0.1}s;
            }
          `).join('')}
        `}
      </style>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
        {roles.map((role, index) => (
          <button
            key={role.name}
            onClick={() => handleRoleClick(role.name)}
            className={`flex items-center gap-2 bg-transparent border-2 ${colors.border} rounded-lg p-2 sm:p-3 ${isDarkMode ? colors.primaryDark : colors.primaryLight} transition-all duration-200 hover:scale-[1.02] hover:${isDarkMode ? colors.accentDark : colors.accentLight} animate-fade-in animate-delay-${index * 100}`}
          >
            <span className={`${role.color} flex-shrink-0`}>{role.icon}</span>
            <span className={`text-sm sm:text-base font-semibold ${isDarkMode ? colors.primaryDark : colors.primaryLight}`}>
              {role.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Banner;