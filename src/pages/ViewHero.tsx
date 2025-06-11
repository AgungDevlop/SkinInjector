import { useState, useEffect, useRef, memo, useCallback, useContext } from "react";
import axios, { AxiosError } from "axios";
import { Link } from "react-router-dom";
import { ThemeContext } from "../components/ThemeContext";
import { ThemeColors } from "../components/ThemeColors";

interface HeroData {
  her: string;
  roll: string;
  URL: string;
}

const ViewHero: React.FC = () => {
  const { isDarkMode, theme } = useContext(ThemeContext);
  const { colors } = ThemeColors(theme, isDarkMode);
  const [heroes, setHeroes] = useState<HeroData[]>([]);
  const [filteredHeroes, setFilteredHeroes] = useState<HeroData[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const timeoutRefs = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const roleOptions = ["Fighter", "Tank", "Mage", "Marksman", "Assassin", "Support"];

  const fetchHeroes = useCallback(async () => {
    try {
      const response = await axios.get("https://ml.anehgaminginjector.click/list.json", { timeout: 5000 });
      const heroesData = response.data;
      if (!Array.isArray(heroesData)) {
        throw new Error("Invalid data format: Expected an array");
      }
      setHeroes(heroesData);
      setFilteredHeroes(heroesData);

      heroesData.forEach((hero: HeroData) => {
        const img = new Image();
        const imageUrl = getImageUrl(hero.URL);
        img.src = imageUrl;
        img.srcset = `${imageUrl} 1x, ${imageUrl.replace('50', '40')} 0.5x`;
        img.loading = "lazy";
        img.decoding = "async";
        img.onload = () => {
          setLoadedImages((prev) => new Set(prev).add(hero.her));
          clearTimeout(timeoutRefs.current.get(hero.her));
        };
        img.onerror = () => {
          setLoadedImages((prev) => new Set(prev).add(hero.her));
          clearTimeout(timeoutRefs.current.get(hero.her));
        };
        const timeout = setTimeout(() => {
          setLoadedImages((prev) => new Set(prev).add(hero.her));
        }, 3000);
        timeoutRefs.current.set(hero.her, timeout);
      });
    } catch (err) {
      const errorMessage = err instanceof AxiosError
        ? `Network error: ${err.message}${err.response ? ` (Status: ${err.response.status})` : ''}`
        : `Unexpected error: ${err}`;
      setError(`Failed to fetch heroes: ${errorMessage}`);
      console.error("Fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const storedRole = sessionStorage.getItem("selectedRole") || "";
    setRoleFilter(storedRole);

    const handleStorageChange = () => {
      const newRole = sessionStorage.getItem("selectedRole") || "";
      setRoleFilter(newRole);
    };

    window.addEventListener("storage", handleStorageChange);
    fetchHeroes();

    return () => {
      timeoutRefs.current.forEach((timeout) => clearTimeout(timeout));
      timeoutRefs.current.clear();
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [fetchHeroes]);

  useEffect(() => {
    const filtered = heroes
      .filter((hero) => {
        const matchesSearch = hero.her.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             hero.roll.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter ? hero.roll === roleFilter : true;
        return matchesSearch && matchesRole;
      })
      .sort((a, b) => a.her.localeCompare(b.her));
    setFilteredHeroes(filtered);
  }, [searchQuery, roleFilter, heroes]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleRoleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value;
    setRoleFilter(newRole);
    sessionStorage.setItem("selectedRole", newRole);
  }, []);

  const handleViewClick = useCallback((heroName: string) => {
    sessionStorage.setItem("selectedHero", heroName);
  }, []);

  const getImageUrl = useCallback((url: string): string => {
    try {
      const decodedUrl = url.replace(/\\+/g, '');
      if (decodedUrl.includes("wikia.nocookie.net")) {
        return decodedUrl.split("/revision/latest")[0];
      }
      return decodedUrl;
    } catch {
      return "https://via.placeholder.com/40?text=Hero";
    }
  }, []);

  return (
    <div className="container mx-auto p-2 sm:p-3">
      <style>
        {`
          @keyframes slide-in-right {
            0% { transform: translateX(100%); opacity: 0; }
            100% { transform: translateX(0); opacity: 1; }
          }
          @keyframes fade-scroll {
            0% { transform: translateY(30px); opacity: 0; }
            100% { transform: translateY(0); opacity: 1; }
          }
          .animate-slide-in-right {
            animation: slide-in-right 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
          }
          .animate-fade-scroll {
            animation: fade-scroll 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
            animation-play-state: paused;
          }
          .animate-fade-scroll.visible {
            animation-play-state: running;
          }
          ${filteredHeroes.map((_, i) => `
            .animate-delay-${i * 100} {
              animation-delay: ${i * 0.1}s;
            }
          `).join('')}
        `}
      </style>
      <h1 className={`text-3xl sm:text-4xl font-extrabold ${isDarkMode ? colors.primaryDark : colors.primaryLight} mb-6 text-center`}>
        View Heroes
      </h1>
      <div className="mb-6 space-y-4">
        <input
          type="text"
          placeholder="Search by Hero or Role..."
          value={searchQuery}
          onChange={handleSearchChange}
          className={`w-full bg-transparent border-2 ${colors.border} ${isDarkMode ? colors.primaryDark : colors.primaryLight} rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[${colors.glow}] outline-none transition-colors duration-200`}
        />
        <select
          value={roleFilter}
          onChange={handleRoleChange}
          className={`w-full bg-transparent border-2 ${colors.border} ${isDarkMode ? colors.primaryDark : colors.primaryLight} rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[${colors.glow}] outline-none transition-colors duration-200`}
        >
          <option value="" className={`${isDarkMode ? colors.dropdownBgDark : colors.dropdownBgLight} ${isDarkMode ? colors.dropdownTextDark : colors.dropdownTextLight}`}>
            All Roles
          </option>
          {roleOptions.map((role) => (
            <option key={role} value={role} className={`${isDarkMode ? colors.dropdownBgDark : colors.dropdownBgLight} ${isDarkMode ? colors.dropdownTextDark : colors.dropdownTextLight}`}>
              {role}
            </option>
          ))}
        </select>
      </div>
      {error && (
        <div className="mb-6 p-4 bg-red-900/60 text-red-200 rounded-lg text-sm border border-red-400/50">
          {error}
        </div>
      )}
      {isLoading ? (
        <div className="flex justify-center">
          <div className={`w-8 h-8 border-2 ${colors.border} rounded-full animate-spin`} />
        </div>
      ) : (
        <div className="flex flex-col gap-3" ref={(el) => {
          if (el) {
            const items = el.querySelectorAll('.animate-fade-scroll');
            const observer = new IntersectionObserver(
              (entries) => {
                entries.forEach((entry) => {
                  if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                  }
                });
              },
              { threshold: 0.2 }
            );
            items.forEach((item) => observer.observe(item));
            return () => items.forEach((item) => observer.unobserve(item));
          }
        }}>
          {filteredHeroes.length === 0 && !error && (
            <p className={`text-center ${isDarkMode ? colors.primaryDark : colors.primaryLight}`}>
              No heroes found.
            </p>
          )}
          {filteredHeroes.map((hero, index) => (
            <div
              key={hero.her}
              className={`flex items-center justify-between bg-transparent border-2 ${colors.border} rounded-lg shadow-md p-3 transition-transform duration-200 hover:scale-[1.02] animate-slide-in-right animate-delay-${index * 100} animate-fade-scroll`}
            >
              <div className="flex items-center gap-3">
                {!loadedImages.has(hero.her) && (
                  <div className="w-10 h-10 flex items-center justify-center">
                    <div className={`w-6 h-6 border-2 ${colors.border} rounded-full animate-spin`} />
                  </div>
                )}
                <img
                  src={getImageUrl(hero.URL)}
                  srcSet={`${getImageUrl(hero.URL)} 1x, ${getImageUrl(hero.URL).replace('50', '40')} 0.5x`}
                  alt={`${hero.her} image`}
                  className={`w-10 h-10 object-cover rounded-full border-2 ${colors.border} ${loadedImages.has(hero.her) ? '' : 'hidden'}`}
                  loading="lazy"
                  decoding="async"
                />
                <h2 className={`font-bold text-sm sm:text-base ${isDarkMode ? colors.primaryDark : colors.primaryLight}`}>
                  {hero.her}
                </h2>
              </div>
              <Link
                to="/unlock-skin"
                onClick={() => handleViewClick(hero.her)}
                className={`bg-transparent ${isDarkMode ? colors.primaryDark : colors.primaryLight} py-1.5 px-3 rounded-lg text-sm font-semibold border ${colors.border} hover:${isDarkMode ? colors.accentDark : colors.accentLight} transition-all duration-200`}
              >
                View
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default memo(ViewHero);