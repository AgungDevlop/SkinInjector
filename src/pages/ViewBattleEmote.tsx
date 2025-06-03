import { useState, useEffect, useRef } from "react";
import axios, { AxiosError } from "axios";
import { FaArrowRight } from "react-icons/fa";

interface BattleEmoteData {
  id: string;
  name: string;
  img1: string;
  img2: string;
  url: string;
}

const ViewBattleEmote: React.FC = () => {
  const [battleEmotes, setBattleEmotes] = useState<BattleEmoteData[]>([]);
  const [filteredBattleEmotes, setFilteredBattleEmotes] = useState<BattleEmoteData[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const timeoutRefs = useRef<Map<string, NodeJS.Timeout>>(new Map()); // Track timeouts per image

  useEffect(() => {
    const fetchBattleEmotes = async () => {
      try {
        const response = await axios.get(
          "https://raw.githubusercontent.com/AgungDevlop/InjectorMl/main/BattleEmote.json"
        );
        const battleEmotesData = response.data;
        if (!Array.isArray(battleEmotesData)) {
          throw new Error("BattleEmote.json is not a valid array");
        }
        setBattleEmotes(battleEmotesData);
        setFilteredBattleEmotes(battleEmotesData);

        // Preload images after fetching battle emotes
        battleEmotesData.forEach((battleEmote: BattleEmoteData) => {
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

            // Set fallback timeout
            const timeout = setTimeout(() => {
              setLoadedImages((prev) => new Set(prev).add(`${battleEmote.id}-${imgType}`));
            }, 5000);
            timeoutRefs.current.set(`${battleEmote.id}-${imgType}`, timeout);
          });
        });
      } catch (err) {
        const errorMessage =
          err instanceof AxiosError
            ? `${err.message} (Status: ${err.response?.status})`
            : "Unknown error";
        setError(`Failed to fetch battle emotes: ${errorMessage}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBattleEmotes();

    // Cleanup timeouts on unmount
    return () => {
      timeoutRefs.current.forEach((timeout) => clearTimeout(timeout));
      timeoutRefs.current.clear();
    };
  }, []);

  useEffect(() => {
    const filtered = battleEmotes
      .filter((battleEmote) =>
        battleEmote.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => a.name.localeCompare(b.name)); // Sort by name A-Z
    setFilteredBattleEmotes(filtered);
  }, [searchQuery, battleEmotes]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 text-white">
      <style>
        {`
          @keyframes pulse-ring {
            0% { transform: scale(0.33); opacity: 1; }
            80%, 100% { opacity: 0; }
          }
          @keyframes pulse-dot {
            0% { transform: scale(0.8); }
            50% { transform: scale(1); }
            100% { transform: scale(0.8); }
          }
          .custom-spinner {
            position: relative;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .custom-spinner::before {
            content: '';
            width: 100%;
            height: 100%;
            border-radius: 50%;
            border: 4px solid transparent;
            border-top-color: #3b82f6;
            animation: pulse-ring 1.2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
            position: absolute;
          }
          .custom-spinner::after {
            content: '';
            width: 50%;
            height: 50%;
            background: #3b82f6;
            border-radius: 50%;
            animation: pulse-dot 1.2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite;
            position: absolute;
          }
        `}
      </style>
      <h1 className="text-4xl sm:text-4xl md:text-5xl font-extrabold text-blue-400 mb-6 sm:mb-8 md:mb-10 tracking-tight text-center drop-shadow-[0_2px_4px_rgba(59,130,246,0.8)]">
        View Battle Emotes
      </h1>

      {/* Search Section */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="Search by Battle Emote Name..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full bg-gray-900/50 border border-blue-400 text-blue-300 rounded-lg px-4 py-2 mb-4 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all duration-300 hover:shadow-[0_0_10px_rgba(59,130,246,0.5)]"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-8 p-6 bg-red-900/60 text-red-200 rounded-lg text-base backdrop-blur-sm border border-red-400/50 animate-neon-pulse">
          {error}
        </div>
      )}

      {/* Battle Emote List */}
      {isLoading ? (
        <div className="flex justify-center">
          <div className="w-10 h-10 relative animate-ios-spinner">
            <div className="absolute inset-0 rounded-full border-t-4 border-gray-400 opacity-20"></div>
            <div className="absolute inset-0 rounded-full border-t-4 border-gray-400 animate-spin"></div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4 sm:gap-6">
          {filteredBattleEmotes.length === 0 && !error && (
            <p className="text-center text-blue-300 text-lg sm:text-xl">
              No battle emotes found.
            </p>
          )}
          {filteredBattleEmotes.map((battleEmote) => (
            <div
              key={battleEmote.id}
              className="flex items-center justify-between bg-gradient-to-br from-gray-900 via-blue-950 to-purple-950 border-2 border-blue-400 rounded-tl-none rounded-tr-xl rounded-bl-xl rounded-br-none shadow-2xl p-4 sm:p-6 md:p-8 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(59,130,246,0.8)]"
            >
              <div className="flex items-center gap-4 sm:gap-6 md:gap-8">
                {!loadedImages.has(`${battleEmote.id}-img1`) && (
                  <div className="w-12 sm:w-16 md:w-20 h-12 sm:h-16 md:h-20 flex items-center justify-center">
                    <div className="custom-spinner"></div>
                  </div>
                )}
                <img
                  src={battleEmote.img1}
                  alt={`${battleEmote.name} img1`}
                  className={`w-12 sm:w-16 md:w-20 h-12 sm:h-16 md:h-20 object-cover rounded-full border-2 border-blue-400 animate-neon-pulse ${loadedImages.has(`${battleEmote.id}-img1`) ? '' : 'hidden'}`}
                  loading="lazy"
                />
                <FaArrowRight className="text-blue-300 mx-2 text-xl sm:text-2xl md:text-3xl animate-neon-pulse" />
                {!loadedImages.has(`${battleEmote.id}-img2`) && (
                  <div className="w-12 sm:w-16 md:w-20 h-12 sm:h-16 md:h-20 flex items-center justify-center">
                    <div className="custom-spinner"></div>
                  </div>
                )}
                <img
                  src={battleEmote.img2}
                  alt={`${battleEmote.name} img2`}
                  className={`w-12 sm:w-16 md:w-20 h-12 sm:h-16 md:h-20 object-cover rounded-full border-2 border-blue-400 animate-neon-pulse ${loadedImages.has(`${battleEmote.id}-img2`) ? '' : 'hidden'}`}
                  loading="lazy"
                />
                <h2 className="font-bold text-base sm:text-lg md:text-xl lg:text-2xl text-blue-300 tracking-tight drop-shadow-[0_1px_2px_rgba(59,130,246,0.8)]">
                  {battleEmote.name}
                </h2>
              </div>
              <a
                href={battleEmote.url}
                target="_blank"
                rel="noreferrer"
                className="bg-gradient-to-r from-gray-900 via-blue-950 to-purple-950 text-blue-300 py-2 px-4 sm:py-2.5 sm:px-5 md:py-3 md:px-6 rounded-lg text-base sm:text-base md:text-lg font-semibold border border-blue-400 animate-neon-pulse hover:bg-gradient-to-r hover:from-blue-950 hover:via-purple-950 hover:to-gray-900 hover:shadow-[0_0_10px_rgba(59,130,246,0.8),0_0_20px_rgba(59,130,246,0.6)] hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 transition-all duration-300"
              >
                Inject
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ViewBattleEmote;
