import { useState, useEffect, useRef, useContext, useCallback } from "react";
import axios, { AxiosError } from "axios";
import { FaAngleDoubleRight } from "react-icons/fa";
import { ThemeContext } from "../components/ThemeContext";
import { ThemeColors } from "../components/ThemeColors";

interface BattleEmoteData {
  id: string;
  name: string;
  img1: string;
  img2: string;
  url: string;
}

const ViewBattleEmote: React.FC = () => {
  const { isDarkMode, theme } = useContext(ThemeContext);
  const { colors } = ThemeColors(theme, isDarkMode);
  const [battleEmotes, setBattleEmotes] = useState<BattleEmoteData[]>([]);
  const [filteredBattleEmotes, setFilteredBattleEmotes] = useState<BattleEmoteData[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const timeoutRefs = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const preloadImages = useCallback((data: BattleEmoteData[]) => {
    data.forEach((battleEmote) => {
      ['img1', 'img2'].forEach((imgType) => {
        const img = new Image();
        img.src = battleEmote[imgType as keyof BattleEmoteData];
        img.onload = () => {
          setLoadedImages((prev) => new Set(prev).add(`${battleEmote.id}-${imgType}`));
          clearTimeout(timeoutRefs.current.get(`${battleEmote.id}-${imgType}`));
        };
        img.onerror = () => {
          setLoadedImages((prev) => new Set(prev).add(`${battleEmote.id}-${imgType}`));
          clearTimeout(timeoutRefs.current.get(`${battleEmote.id}-${imgType}`));
        };
        const timeout = setTimeout(() => {
          setLoadedImages((prev) => new Set(prev).add(`${battleEmote.id}-${imgType}`));
        }, 3000);
        timeoutRefs.current.set(`${battleEmote.id}-${imgType}`, timeout);
      });
    });
  }, []);

  const fetchBattleEmotes = useCallback(async () => {
    try {
      const response = await axios.get(
        "https://raw.githubusercontent.com/AgungDevlop/InjectorMl/main/BattleEmote.json",
        { timeout: 5000 }
      );
      const battleEmotesData = response.data;
      if (!Array.isArray(battleEmotesData)) {
        throw new Error("BattleEmote.json is not a valid array");
      }
      setBattleEmotes(battleEmotesData);
      setFilteredBattleEmotes(battleEmotesData);
      preloadImages(battleEmotesData);
    } catch (err) {
      const errorMessage =
        err instanceof AxiosError
          ? `${err.message}${err.response ? ` (Status: ${err.response.status})` : ''}`
          : "Unknown error";
      setError(`Failed to fetch battle emotes: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [preloadImages]);

  useEffect(() => {
    fetchBattleEmotes();
    return () => {
      timeoutRefs.current.forEach((timeout) => clearTimeout(timeout));
      timeoutRefs.current.clear();
    };
  }, [fetchBattleEmotes]);

  useEffect(() => {
    const filtered = battleEmotes
      .filter((battleEmote) =>
        battleEmote.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => a.name.localeCompare(b.name));
    setFilteredBattleEmotes(filtered);
  }, [searchQuery, battleEmotes]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  return (
    <div className="container mx-auto p-2 sm:p-4">
      <style>
        {`
          @keyframes slide-in-right {
            0% { transform: translateX(100%); opacity: 0; }
            100% { transform: translateX(0); opacity: 1; }
          }
          @keyframes fade-scroll {
            0% { transform: translateY(20px); opacity: 0; }
            100% { transform: translateY(0); opacity: 1; }
          }
          .animate-slide-in-right {
            animation: slide-in-right 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
          }
          .animate-fade-scroll {
            animation: fade-scroll 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
            animation-play-state: paused;
          }
          .animate-fade-scroll.visible {
            animation-play-state: running;
          }
          ${filteredBattleEmotes.map((_, i) => `
            .animate-delay-${i * 100} {
              animation-delay: ${i * 0.1}s;
            }
          `).join('')}
        `}
      </style>
      <h1 className={`text-2xl sm:text-3xl font-extrabold ${isDarkMode ? colors.primaryDark : colors.primaryLight} mb-4 text-center`}>
        View Battle Emotes
      </h1>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by Battle Emote Name..."
          value={searchQuery}
          onChange={handleSearchChange}
          className={`w-full bg-transparent border-2 ${colors.border} ${isDarkMode ? colors.primaryDark : colors.primaryLight} rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-[${colors.glow}] outline-none transition-colors duration-200`}
        />
      </div>
      {error && (
        <div className="mb-4 p-3 bg-red-900/60 text-red-200 rounded-lg text-sm border border-red-400/50">
          {error}
        </div>
      )}
      {isLoading ? (
        <div className="flex justify-center">
          <div className={`w-6 h-6 border-2 ${colors.border} rounded-full animate-spin`} />
        </div>
      ) : (
        <div className="flex flex-col gap-2" ref={(el) => {
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
          {filteredBattleEmotes.length === 0 && !error && (
            <p className={`text-center text-sm ${isDarkMode ? colors.primaryDark : colors.primaryLight}`}>
              No battle emotes found.
            </p>
          )}
          {filteredBattleEmotes.map((battleEmote, index) => (
            <div
              key={battleEmote.id}
              className={`flex items-center justify-between bg-transparent border-2 ${colors.border} rounded-lg shadow-md p-2 transition-all duration-200 hover:scale-[1.02] animate-slide-in-right animate-delay-${index * 100} animate-fade-scroll`}
            >
              <div className="flex items-center gap-2">
                {!loadedImages.has(`${battleEmote.id}-img1`) && (
                  <div className="w-9 h-9 flex items-center justify-center">
                    <div className={`w-5 h-5 border-2 ${colors.border} rounded-full animate-spin`} />
                  </div>
                )}
                <img
                  src={battleEmote.img1}
                  alt={`${battleEmote.name} img1`}
                  className={`w-9 h-9 object-cover rounded-full border-2 ${colors.border} ${loadedImages.has(`${battleEmote.id}-img1`) ? '' : 'hidden'}`}
                  loading="lazy"
                  decoding="async"
                />
                <FaAngleDoubleRight className={`text-base ${isDarkMode ? colors.primaryDark : colors.primaryLight}`} />
                {!loadedImages.has(`${battleEmote.id}-img2`) && (
                  <div className="w-9 h-9 flex items-center justify-center">
                    <div className={`w-5 h-5 border-2 ${colors.border} rounded-full animate-spin`} />
                  </div>
                )}
                <img
                  src={battleEmote.img2}
                  alt={`${battleEmote.name} img2`}
                  className={`w-9 h-9 object-cover rounded-full border-2 ${colors.border} ${loadedImages.has(`${battleEmote.id}-img2`) ? '' : 'hidden'}`}
                  loading="lazy"
                  decoding="async"
                />
                <h2 className={`font-bold text-sm ${isDarkMode ? colors.primaryDark : colors.primaryLight} truncate max-w-[120px] sm:max-w-[200px]`}>
                  {battleEmote.name}
                </h2>
              </div>
              <a
                href={battleEmote.url}
                target="_blank"
                rel="noreferrer"
                className={`bg-transparent ${isDarkMode ? colors.primaryDark : colors.primaryLight} py-1 px-2 rounded-lg text-sm font-semibold border ${colors.border} hover:${isDarkMode ? colors.accentDark : colors.accentLight} transition-all duration-200`}
              >
                Pasang
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ViewBattleEmote;
