import { useState, useEffect } from "react";
import axios, { AxiosError } from "axios";

interface SkinData {
  id: string;
  hero: string;
  name: string;
  type: string;
  role: string[];
  img1: string;
  img2: string;
  url: string;
}

const ViewSkin: React.FC = () => {
  const [skins, setSkins] = useState<SkinData[]>([]);
  const [filteredSkins, setFilteredSkins] = useState<SkinData[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [selectedHero, setSelectedHero] = useState<string | null>(null);

  const roleOptions = [
    "Fighter",
    "Tank",
    "Mage",
    "Marksman",
    "Assassin",
    "Support",
  ];

  const typeOptions = [
    "Backup",
    "Original",
    "Upgrade",
    "Custom Skin",
    "Painted Skin",
  ];

  useEffect(() => {
    // Get the selected hero from sessionStorage
    const hero = sessionStorage.getItem("selectedHero");
    setSelectedHero(hero);

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
    const filtered = skins
      .filter((skin) => {
        // Filter by selected hero from sessionStorage
        const matchesHero = selectedHero ? skin.hero === selectedHero : true;
        const matchesSearch =
          skin.hero.toLowerCase().includes(searchQuery.toLowerCase()) ||
          skin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          skin.role.some((role) =>
            role.toLowerCase().includes(searchQuery.toLowerCase())
          );
        const matchesType = typeFilter ? skin.type === typeFilter : true;
        const matchesRole = roleFilter ? skin.role.includes(roleFilter) : true;
        return matchesHero && matchesSearch && matchesType && matchesRole;
      })
      .sort((a, b) => a.hero.localeCompare(b.hero)); // Sort by hero name A-Z
    setFilteredSkins(filtered);
  }, [searchQuery, typeFilter, roleFilter, skins, selectedHero]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTypeFilter(e.target.value);
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRoleFilter(e.target.value);
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
        return baseUrl;
      }
      // For other URLs (e.g., ibb.co), return decoded URL
      return decodedUrl;
    } catch (e) {
      // Fallback to a placeholder if URL processing fails
      return "https://via.placeholder.com/50?text=Skin";
    }
  };

  return (
    <div className="container mx-auto p-2 sm:p-3 text-white">
      <h1 className="text-3xl sm:text-3xl md:text-4xl font-extrabold text-blue-400 mb-4 sm:mb-6 md:mb-8 tracking-tight text-center drop-shadow-[0_2px_4px_rgba(59,130,246,0.8)]">
        View Skins {selectedHero ? `for ${selectedHero}` : ""}
      </h1>

      {/* Search and Filter Section */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by Hero, Name, or Role..."
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
            <option value="" className="bg-gray-900 text-blue-300">
              All Types
            </option>
            {typeOptions.map((type) => (
              <option
                key={type}
                value={type}
                className="bg-gray-900 text-blue-300"
              >
                {type}
              </option>
            ))}
          </select>
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

      {/* Skin List */}
      {isLoading ? (
        <div className="flex justify-center">
          <div className="w-8 h-8 relative animate-ios-spinner">
            <div className="absolute inset-0 rounded-full border-t-2 border-gray-400 opacity-20"></div>
            <div className="absolute inset-0 rounded-full border-t-2 border-gray-400 animate-spin"></div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3 sm:gap-4">
          {filteredSkins.length === 0 && !error && (
            <p className="text-center text-blue-300">
              No skins found{selectedHero ? ` for ${selectedHero}` : ""}.
            </p>
          )}
          {filteredSkins.map((skin) => (
            <div
              key={skin.id}
              className="flex items-center justify-between bg-gradient-to-br from-gray-900 via-blue-950 to-purple-950 border-2 border-blue-400 rounded-tl-none rounded-tr-xl rounded-bl-xl rounded-br-none shadow-xl p-3 sm:p-4 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(59,130,246,0.7)]"
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <img
                  src={getImageUrl(skin.img1)}
                  alt={`${skin.name} image`}
                  className="w-10 sm:w-12 md:w-14 h-10 sm:h-12 md:h-14 object-cover rounded-full border-2 border-blue-400 animate-neon-pulse"
                  loading="lazy"
                  onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/50?text=Skin")}
                />
                <h2 className="font-bold text-sm sm:text-base md:text-lg text-blue-300 tracking-tight drop-shadow-[0_1px_2px_rgba(59,130,246,0.8)]">
                  {skin.name}
                </h2>
              </div>
              <a
                href={skin.url}
                target="_blank"
                rel="noreferrer"
                className="bg-gradient-to-r from-gray-900 via-blue-950 to-purple-950 text-blue-300 py-1.5 px-3 sm:py-1.5 sm:px-4 md:py-2 md:px-5 rounded-lg text-sm sm:text-sm md:text-base font-semibold border border-blue-400 animate-neon-pulse hover:bg-gradient-to-r hover:from-blue-950 hover:via-purple-950 hover:to-gray-900 hover:shadow-[0_0_8px_rgba(59,130,246,0.8),0_0_15px_rgba(59,130,246,0.6)] hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 transition-all duration-300"
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

export default ViewSkin;
