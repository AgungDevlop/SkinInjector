import { useState, useEffect } from "react";
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
    <div className="container mx-auto p-2 sm:p-3 text-white">
      <h1 className="text-3xl sm:text-3xl md:text-4xl font-extrabold text-blue-400 mb-4 sm:mb-6 md:mb-8 tracking-tight text-center drop-shadow-[0_2px_4px_rgba(59,130,246,0.8)]">
        View Battle Emotes
      </h1>

      {/* Search Section */}
      <div className="mb-6">
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
        <div className="mb-6 p-4 bg-red-900/60 text-red-200 rounded-lg text-sm backdrop-blur-sm border border-red-400/50 animate-neon-pulse">
          {error}
        </div>
      )}

      {/* Battle Emote List */}
      {isLoading ? (
        <div className="flex justify-center">
          <div className="w-8 h-8 relative animate-ios-spinner">
            <div className="absolute inset-0 rounded-full border-t-2 border-gray-400 opacity-20"></div>
            <div className="absolute inset-0 rounded-full border-t-2 border-gray-400 animate-spin"></div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] sm:grid-cols-[repeat(auto-fit,minmax(180px,1fr))] md:grid-cols-[repeat(auto-fit,minmax(220px,1fr))] lg:grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-3 sm:gap-4">
          {filteredBattleEmotes.length === 0 && !error && (
            <p className="text-center text-blue-300 col-span-full">
              No battle emotes found.
            </p>
          )}
          {filteredBattleEmotes.map((battleEmote) => (
            <div
              key={battleEmote.id}
              className="relative bg-gradient-to-br from-gray-900 via-blue-950 to-purple-950 border-2 border-blue-400 rounded-tl-none rounded-tr-xl rounded-bl-xl rounded-br-none shadow-xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(59,130,246,0.7)] hover:animate-glitch"
            >
              <div className="absolute inset-0 border-2 border-blue-400 opacity-30 rounded-tl-none rounded-tr-xl rounded-bl-xl rounded-br-none animate-neon-pulse pointer-events-none"></div>
              <div className="relative z-10 pt-6 sm:pt-6 lg:pt-7 p-3 sm:p-3 lg:p-4">
                <div className="flex items-center justify-center mb-2 sm:mb-2 lg:mb-3">
                  <img
                    src={battleEmote.img1}
                    alt={`${battleEmote.name} img1`}
                    className="w-12 sm:w-12 md:w-16 lg:w-20 h-12 sm:h-12 md:h-16 lg:h-20 object-cover rounded-full border-2 border-blue-400 animate-neon-pulse"
                    loading="lazy"
                  />
                  <FaArrowRight className="text-blue-300 mx-2 text-xl sm:text-xl md:text-2xl lg:text-3xl animate-neon-pulse" />
                  <img
                    src={battleEmote.img2}
                    alt={`${battleEmote.name} img2`}
                    className="w-12 sm:w-12 md:w-16 lg:w-20 h-12 sm:h-12 md:h-16 lg:h-20 object-cover rounded-full border-2 border-blue-400 animate-neon-pulse"
                    loading="lazy"
                  />
                </div>
                <h2 className="text-center font-bold text-sm sm:text-sm md:text-base lg:text-lg text-blue-300 mb-2 sm:mb-2 lg:mb-3 tracking-tight drop-shadow-[0_1px_2px_rgba(59,130,246,0.8)]">
                  {battleEmote.name}
                </h2>
                <a href={battleEmote.url} target="_blank" rel="noreferrer">
                  <button className="w-full bg-gradient-to-r from-gray-900 via-blue-950 to-purple-950 text-blue-300 py-1.5 px-3 sm:py-1.5 sm:px-3 md:py-2 md:px-4 lg:py-2.5 lg:px-5 rounded-lg text-sm sm:text-sm md:text-base lg:text-lg font-semibold border border-blue-400 animate-neon-pulse hover:bg-gradient-to-r hover:from-blue-950 hover:via-purple-950 hover:to-gray-900 hover:shadow-[0_0_8px_rgba(59,130,246,0.8),0_0_15px_rgba(59,130,246,0.6)] hover:scale-105 hover:animate-shake focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 transition-all duration-300">
                    Inject
                  </button>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ViewBattleEmote;
