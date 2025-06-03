import { useState, useEffect } from "react";
import axios, { AxiosError } from "axios";
import { Link } from "react-router-dom";

interface HeroData {
  her: string;
  roll: string;
  URL: string;
}

const ViewHero: React.FC = () => {
  const [heroes, setHeroes] = useState<HeroData[]>([]);
  const [filteredHeroes, setFilteredHeroes] = useState<HeroData[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const roleOptions = [
    "Fighter",
    "Tank",
    "Mage",
    "Marksman",
    "Assassin",
    "Support",
  ];

  useEffect(() => {
    const fetchHeroes = async () => {
      try {
        const response = await axios.get(
          "https://ml.anehgaminginjector.click/list.json"
        );
        const heroesData = response.data;
        if (!Array.isArray(heroesData)) {
          throw new Error("list.json is not a valid array");
        }
        setHeroes(heroesData);
        setFilteredHeroes(heroesData);
      } catch (err) {
        const errorMessage =
          err instanceof AxiosError
            ? `${err.message} (Status: ${err.response?.status})`
            : "Unknown error";
        setError(`Failed to fetch heroes: ${errorMessage}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHeroes();
  }, []);

  useEffect(() => {
    const filtered = heroes
      .filter((hero) => {
        const matchesSearch =
          hero.her.toLowerCase().includes(searchQuery.toLowerCase()) ||
          hero.roll.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter ? hero.roll === roleFilter : true;
        return matchesSearch && matchesRole;
      })
      .sort((a, b) => a.her.localeCompare(b.her)); // Sort by hero name A-Z
    setFilteredHeroes(filtered);
  }, [searchQuery, roleFilter, heroes]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRoleFilter(e.target.value);
  };

  const handleViewClick = (heroName: string) => {
    // Save the hero name to sessionStorage for use in ViewSkin
    sessionStorage.setItem("selectedHero", heroName);
  };

  // Function to clean and optimize image URL for display
  const getImageUrl = (url: string): string => {
    try {
      // Decode escaped characters (e.g., \/ to /)
      const decodedUrl = url.replace(/\\+/g, '');
      // Check if the URL is from wikia.nocookie.net
      if (decodedUrl.includes("static.wikia.nocookie.net")) {
        // Remove /revision/latest and query params to get a cleaner URL
        const baseUrl = decodedUrl.split("/revision/latest")[0];
        // Ensure the URL ends with a common image extension or adjust as needed
        // Some wikia URLs work better without query params
        return baseUrl;
      }
      // For other URLs (e.g., ibb.co), return decoded URL
      return decodedUrl;
    } catch (e) {
      // Fallback to a placeholder if URL processing fails
      return "https://via.placeholder.com/50?text=Hero";
    }
  };

  return (
    <div className="container mx-auto p-2 sm:p-3 text-white">
      <h1 className="text-3xl sm:text-3xl md:text-4xl font-extrabold text-blue-400 mb-4 sm:mb-6 md:mb-8 tracking-tight text-center drop-shadow-[0_2px_4px_rgba(59,130,246,0.8)]">
        View Heroes
      </h1>

      {/* Search and Filter Section */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by Hero or Role..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full bg-gray-900/50 border border-blue-400 text-blue-300 rounded-lg px-4 py-2 mb-4 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all duration-300 hover:shadow-[0_0_10px_rgba(59,130,246,0.5)]"
        />
        <div className="grid grid-cols-1 gap-4">
          <select
            value={roleFilter}
            onChange={handleRoleChange}
            className="w-full bg-gray-900/50 border border-blue-400 text-blue-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all duration-300 hover:shadow-[0_0_10px_rgba(59,130,246,0.5)]"
          >
            <option value="" className="bg-gray-900 text-blue-300">
              All Roles
            </option>
            {roleOptions.map((role) => (
              <option
                key={role}
                value={role}
                className="bg-gray-900 text-blue-300"
              >
                {role}
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

      {/* Hero List */}
      {isLoading ? (
        <div className="flex justify-center">
          <div className="w-8 h-8 relative animate-ios-spinner">
            <div className="absolute inset-0 rounded-full border-t-2 border-gray-400 opacity-20"></div>
            <div className="absolute inset-0 rounded-full border-t-2 border-gray-400 animate-spin"></div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3 sm:gap-4">
          {filteredHeroes.length === 0 && !error && (
            <p className="text-center text-blue-300">
              No heroes found.
            </p>
          )}
          {filteredHeroes.map((hero) => (
            <div
              key={hero.her}
              className="flex items-center justify-between bg-gradient-to-br from-gray-900 via-blue-950 to-purple-950 border-2 border-blue-400 rounded-tl-none rounded-tr-xl rounded-bl-xl rounded-br-none shadow-xl p-3 sm:p-4 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(59,130,246,0.7)]"
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <img
                  src={getImageUrl(hero.URL)}
                  alt={`${hero.her} image`}
                  className="w-10 sm:w-12 md:w-14 h-10 sm:h-12 md:h-14 object-cover rounded-full border-2 border-blue-400 animate-neon-pulse"
                  loading="lazy"
                  onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/50?text=Hero")}
                />
                <h2 className="font-bold text-sm sm:text-base md:text-lg text-blue-300 tracking-tight drop-shadow-[0_1px_2px_rgba(59,130,246,0.8)]">
                  {hero.her}
                </h2>
              </div>
              <Link
                to="/unlock-skin"
                onClick={() => handleViewClick(hero.her)}
                className="bg-gradient-to-r from-gray-900 via-blue-950 to-purple-950 text-blue-300 py-1.5 px-3 sm:py-1.5 sm:px-4 md:py-2 md:px-5 rounded-lg text-sm sm:text-sm md:text-base font-semibold border border-blue-400 animate-neon-pulse hover:bg-gradient-to-r hover:from-blue-950 hover:via-purple-950 hover:to-gray-900 hover:shadow-[0_0_8px_rgba(59,130,246,0.8),0_0_15px_rgba(59,130,246,0.6)] hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 transition-all duration-300"
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

export default ViewHero;
