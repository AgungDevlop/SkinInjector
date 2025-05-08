import { useState, useEffect } from "react";
import axios, { AxiosError } from "axios";
import { FaArrowRight } from "react-icons/fa";

interface SkinData {
  id: string;
  hero: string;
  name: string;
  type: string;
  squad: string;
  img1: string;
  img2: string;
  url: string;
}

const ViewSkin: React.FC = () => {
  const [skins, setSkins] = useState<SkinData[]>([]);
  const [filteredSkins, setFilteredSkins] = useState<SkinData[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [squadFilter, setSquadFilter] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const squadOptions = [
    "No Squad",
    "Starlight",
    "Saber",
    "VENOM",
    "LIGHTBORN",
    "Dragon Tamer",
    "Aspirants",
    "ALLSTAR",
    "M-World",
    "Metro Zero",
    "F.O.R.C.E.",
    "Blazing West",
    "N.E.X.T.",
    "Oriental Fighters",
    "Constellation Heroes",
    "Zodiac",
    "Epic",
    "Summer",
    "Prime",
    "Legend",
    "Elite",
    "Special",
    "Seasonal",
    "Collector",
  ];

  const typeOptions = [
    "Backup",
    "Original",
    "Upgrade",
    "Custom Skin",
    "Painted Skin",
  ];

  const squadColors: { [key: string]: { bg: string; text: string; border: string } } = {
    "Starlight": { bg: "bg-purple-900/60", text: "text-purple-300", border: "border-purple-400/50" },
    "No Squad": { bg: "bg-blue-900/60", text: "text-blue-300", border: "border-blue-400/50" },
    "Saber": { bg: "bg-cyan-900/60", text: "text-cyan-300", border: "border-cyan-400/50" },
    "VENOM": { bg: "bg-green-900/60", text: "text-green-300", border: "border-green-400/50" },
    "LIGHTBORN": { bg: "bg-yellow-900/60", text: "text-yellow-300", border: "border-yellow-400/50" },
    "Dragon Tamer": { bg: "bg-red-900/60", text: "text-red-300", border: "border-red-400/50" },
    "Aspirants": { bg: "bg-pink-900/60", text: "text-pink-300", border: "border-pink-400/50" },
    "ALLSTAR": { bg: "bg-teal-900/60", text: "text-teal-300", border: "border-teal-400/50" },
    "M-World": { bg: "bg-orange-900/60", text: "text-orange-300", border: "border-orange-400/50" },
    "Metro Zero": { bg: "bg-indigo-900/60", text: "text-indigo-300", border: "border-indigo-400/50" },
    "F.O.R.C.E.": { bg: "bg-lime-900/60", text: "text-lime-300", border: "border-lime-400/50" },
    "Blazing West": { bg: "bg-rose-900/60", text: "text-rose-300", border: "border-rose-400/50" },
    "N.E.X.T.": { bg: "bg-emerald-900/60", text: "text-emerald-300", border: "border-emerald-400/50" },
    "Oriental Fighters": { bg: "bg-amber-900/60", text: "text-amber-300", border: "border-amber-400/50" },
    "Constellation Heroes": { bg: "bg-violet-900/60", text: "text-violet-300", border: "border-violet-400/50" },
    "Zodiac": { bg: "bg-fuchsia-900/60", text: "text-fuchsia-300", border: "border-fuchsia-400/50" },
    "Epic": { bg: "bg-blue-800/60", text: "text-blue-200", border: "border-blue-300/50" },
    "Summer": { bg: "bg-yellow-800/60", text: "text-yellow-200", border: "border-yellow-300/50" },
    "Prime": { bg: "bg-purple-800/60", text: "text-purple-200", border: "border-purple-300/50" },
    "Legend": { bg: "bg-red-800/60", text: "text-red-200", border: "border-red-300/50" },
    "Elite": { bg: "bg-green-800/60", text: "text-green-200", border: "border-green-300/50" },
    "Special": { bg: "bg-pink-800/60", text: "text-pink-200", border: "border-pink-300/50" },
    "Seasonal": { bg: "bg-orange-800/60", text: "text-orange-200", border: "border-orange-300/50" },
    "Collector": { bg: "bg-teal-800/60", text: "text-teal-200", border: "border-teal-300/50" },
  };

  useEffect(() => {
    const fetchSkins = async () => {
      try {
        const response = await axios.get(
          "https://raw.githubusercontent.com/AgungDevlop/InjectorMl/main/Skin.json"
        );
        const skinsData = response.data;
        if (!Array.isArray(skinsData)) {
          throw new Error("Skin.json is not a valid array");
        }
        setSkins(skinsData);
        setFilteredSkins(skinsData);
      } catch (err) {
        const errorMessage =
          err instanceof AxiosError
            ? `${err.message} (Status: ${err.response?.status})`
            : "Unknown error";
        setError(`Failed to fetch skins: ${errorMessage}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSkins();
  }, []);

  useEffect(() => {
    const filtered = skins.filter((skin) => {
      const matchesSearch =
        skin.hero.toLowerCase().includes(searchQuery.toLowerCase()) ||
        skin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        skin.squad.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter ? skin.type === typeFilter : true;
      const matchesSquad = squadFilter ? skin.squad === squadFilter : true;
      return matchesSearch && matchesType && matchesSquad;
    });
    setFilteredSkins(filtered);
  }, [searchQuery, typeFilter, squadFilter, skins]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTypeFilter(e.target.value);
  };

  const handleSquadChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSquadFilter(e.target.value);
  };

  return (
    <div className="container mx-auto p-2 sm:p-3 text-white">
      <h1 className="text-3xl sm:text-3xl md:text-4xl font-extrabold text-blue-400 mb-4 sm:mb-6 md:mb-8 tracking-tight text-center drop-shadow-[0_2px_4px_rgba(59,130,246,0.8)]">
        View Skins
      </h1>

      {/* Search and Filter Section */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by Hero, Name, or Squad..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full bg-gray-900/50 border border-blue-400 text-blue-300 rounded-lg px-4 py-2 mb-4 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all duration-300 hover:shadow-[0_0_10px_rgba(59,130,246,0.5)]"
        />
        <div className="grid grid-cols-2 gap-4">
          <select
            value={typeFilter}
            onChange={handleTypeChange}
            className="w-full bg-gray-900/50 border border-blue-400 text-blue-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all duration-300 hover:shadow-[0_0_10px_rgba(59,130,246,0.5)]"
          >
            <option value="" className="bg-gray-900 text-blue-300">All Types</option>
            {typeOptions.map((type) => (
              <option key={type} value={type} className="bg-gray-900 text-blue-300">
                {type}
              </option>
            ))}
          </select>
          <select
            value={squadFilter}
            onChange={handleSquadChange}
            className="w-full bg-gray-900/50 border border-blue-400 text-blue-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all duration-300 hover:shadow-[0_0_10px_rgba(59,130,246,0.5)]"
          >
            <option value="" className="bg-gray-900 text-blue-300">All Squads</option>
            {squadOptions.map((squad) => (
              <option key={squad} value={squad} className="bg-gray-900 text-blue-300">
                {squad}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-900/60 text-red-200 rounded-lg text-sm backdrop-blur-sm border border-red-400/50 animate-neon-pulse">
          {error}
        </div>
      )}

      {/* Skin List */}
      {isLoading ? (
        <div className="flex justify-center">
          <div className="w-8 h-8 relative animate-ios-spinner">
            <div className="absolute inset-0 rounded-full border-t-2 border-gray-400 opacity-20"></div>
            <div className="absolute inset-0 rounded-full border-t-2 border-gray-400 animate-spin"></div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] sm:grid-cols-[repeat(auto-fit,minmax(180px,1fr))] md:grid-cols-[repeat(auto-fit,minmax(220px,1fr))] lg:grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-3 sm:gap-4">
          {filteredSkins.length === 0 && !error && (
            <p className="text-center text-blue-300 col-span-full">No skins found.</p>
          )}
          {filteredSkins.map((skin) => {
            const colors = squadColors[skin.squad] || squadColors["No Squad"];
            return (
              <div
                key={skin.id}
                className="relative bg-gradient-to-br from-gray-900 via-blue-950 to-purple-950 border-2 border-blue-400 rounded-tl-none rounded-tr-xl rounded-bl-xl rounded-br-none shadow-xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(59,130,246,0.7)] hover:animate-glitch"
              >
                <div className="absolute inset-0 border-2 border-blue-400 opacity-30 rounded-tl-none rounded-tr-xl rounded-bl-xl rounded-br-none animate-neon-pulse pointer-events-none"></div>
                <div className={`absolute top-0 right-0 z-20 text-xs font-semibold px-1.5 py-0.5 rounded-bl-md backdrop-blur-sm animate-neon-pulse ${colors.bg} ${colors.text} ${colors.border}`}>
                  {skin.squad}
                </div>
                <div className="relative z-10 pt-6 sm:pt-6 lg:pt-7 p-3 sm:p-3 lg:p-4">
                  <div className="flex items-center justify-center mb-2 sm:mb-2 lg:mb-3">
                    <img
                      src={skin.img1}
                      alt={`${skin.name} img1`}
                      className="w-16 sm:w-16 md:w-20 lg:w-28 h-16 sm:h-16 md:h-20 lg:h-28 object-cover rounded-full border-2 border-blue-400 animate-neon-pulse"
                      loading="lazy"
                    />
                    <FaArrowRight className="text-blue-300 mx-2 text-xl sm:text-xl md:text-2xl lg:text-3xl animate-neon-pulse" />
                    <img
                      src={skin.img2}
                      alt={`${skin.name} img2`}
                      className="w-16 sm:w-16 md:w-20 lg:w-28 h-16 sm:h-16 md:h-20 lg:h-28 object-cover rounded-full border-2 border-blue-400 animate-neon-pulse"
                      loading="lazy"
                    />
                  </div>
                  <h2 className="text-center font-bold text-sm sm:text-sm md:text-base lg:text-lg text-blue-300 mb-2 sm:mb-2 lg:mb-3 tracking-tight drop-shadow-[0_1px_2px_rgba(59,130,246,0.8)]">
                    {skin.name}
                  </h2>
                  <a href={skin.url} target="_blank" rel="noopener noreferrer">
                    <button className="w-full bg-gradient-to-r from-gray-900 via-blue-950 to-purple-950 text-blue-300 py-1.5 px-3 sm:py-1.5 sm:px-3 md:py-2 md:px-4 lg:py-2.5 lg:px-5 rounded-lg text-sm sm:text-sm md:text-base lg:text-lg font-semibold border border-blue-400 animate-neon-pulse hover:bg-gradient-to-r hover:from-blue-950 hover:via-purple-950 hover:to-gray-900 hover:shadow-[0_0_8px_rgba(59,130,246,0.8),0_0_15px_rgba(59,130,246,0.6)] hover:scale-105 hover:animate-shake focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 transition-all duration-300">
                      Inject
                    </button>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ViewSkin;
