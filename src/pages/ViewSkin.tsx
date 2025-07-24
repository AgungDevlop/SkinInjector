import { useState, useEffect, useRef, useContext, useCallback } from "react";
import axios, { AxiosError } from "axios";
import { FaAngleDoubleRight } from "react-icons/fa";
import { ThemeContext } from "../components/ThemeContext";
import { ThemeColors } from "../components/ThemeColors";
import ProgressDialog from "./ProgressDialog";

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

interface ProgressState {
  isVisible: boolean;
  percentage: number;
  status: string;
  error?: string;
  itemType: string;
}

const ViewSkin: React.FC = () => {
  const { isDarkMode, theme } = useContext(ThemeContext);
  const { colors } = ThemeColors(theme, isDarkMode);
  const [skins, setSkins] = useState<SkinData[]>([]);
  const [filteredSkins, setFilteredSkins] = useState<SkinData[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [selectedHero, setSelectedHero] = useState<string | null>(null);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [progress, setProgress] = useState<ProgressState>({
    isVisible: false,
    percentage: 0,
    status: "",
    itemType: "Skin",
  });
  const timeoutRefs = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getImageUrl = useCallback((url: string): string => {
    try {
      const decodedUrl = url.replace(/\\+/g, "");
      if (decodedUrl.includes("static.wikia.nocookie.net")) {
        return decodedUrl.split("/revision/latest")[0];
      }
      return decodedUrl;
    } catch {
      return "https://via.placeholder.com/40?text=Skin";
    }
  }, []);

  const preloadImages = useCallback(
    (skinsData: SkinData[]) => {
      timeoutRefs.current.forEach((timeout) => clearTimeout(timeout));
      timeoutRefs.current.clear();
      setLoadedImages(new Set());

      skinsData.forEach((skin) => {
        const imgTypes: ("img1" | "img2")[] = ["img1", "img2"];
        imgTypes.forEach((imgType) => {
          const img = new Image();
          const imgSrc = skin[imgType];
          if (typeof imgSrc === "string") {
            img.src = getImageUrl(imgSrc);
            img.onload = () => {
              setLoadedImages((prev) =>
                new Set(prev).add(`${skin.id}-${imgType}`)
              );
              clearTimeout(timeoutRefs.current.get(`${skin.id}-${imgType}`));
            };
            img.onerror = () => {
              setLoadedImages((prev) =>
                new Set(prev).add(`${skin.id}-${imgType}`)
              );
              clearTimeout(timeoutRefs.current.get(`${skin.id}-${imgType}`));
            };
            const timeout = setTimeout(() => {
              setLoadedImages((prev) =>
                new Set(prev).add(`${skin.id}-${imgType}`)
              );
            }, 3000);
            timeoutRefs.current.set(`${skin.id}-${imgType}`, timeout);
          }
        });
      });
    },
    [getImageUrl]
  );

  const fetchSkins = useCallback(
    async (hero: string | null) => {
      if (!hero) {
        setSkins([]);
        setFilteredSkins([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const response = await axios.get(
          "https://raw.githubusercontent.com/AgungDevlop/InjectorMl/main/Skin.json",
          { timeout: 5000 }
        );
        const skinsData = response.data;
        if (!Array.isArray(skinsData)) {
          throw new Error("Skin.json is not a valid array");
        }

        const filteredSkinsData = skinsData
          .filter((skin: SkinData) => skin.hero === hero)
          .sort((a: SkinData, b: SkinData) => a.name.localeCompare(b.name));

        setSkins(filteredSkinsData);
        setFilteredSkins(filteredSkinsData);
        preloadImages(filteredSkinsData);
      } catch (err) {
        const errorMessage =
          err instanceof AxiosError
            ? `${err.message}${
                err.response ? ` (Status: ${err.response.status})` : ""
              }`
            : "Unknown error";
        setError(`Gagal mengambil skin: ${errorMessage}`);
        setSkins([]);
        setFilteredSkins([]);
      } finally {
        setIsLoading(false);
      }
    },
    [preloadImages]
  );

  useEffect(() => {
    const hero = sessionStorage.getItem("selectedHero");
    setSelectedHero(hero);
    fetchSkins(hero);

    return () => {
      timeoutRefs.current.forEach((timeout) => clearTimeout(timeout));
      timeoutRefs.current.clear();
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [fetchSkins]);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      const filtered = skins
        .filter((skin) =>
          skin.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => a.name.localeCompare(b.name));
      setFilteredSkins(filtered);
      preloadImages(filtered);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [skins, searchQuery, preloadImages]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    []
  );

  const handleInstallClick = useCallback(
    (url: string) => {
      if ((window as any).Android) {
        setProgress({ isVisible: false, percentage: 0, status: "", itemType: "Skin" });
        (window as any).Android.startDownload(url);
      } else {
        const message = `Antarmuka Android tidak tersedia. Silakan unduh file secara manual dari:\n${url}`;
        alert(message);
        window.open(url, "_blank");
      }
    },
    []
  );

  return (
    <div className="container mx-auto p-2 sm:p-4 relative">
      <ProgressDialog progress={progress} setProgress={setProgress} />
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
            will-change: transform, opacity;
          }
          .animate-fade-scroll {
            animation: fade-scroll 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
            animation-play-state: paused;
            will-change: transform, opacity;
          }
          .animate-fade-scroll.visible {
            animation-play-state: running;
          }
          .list-item {
            border-bottom-left-radius: 12px;
            border-top-right-radius: 12px;
            border-top-left-radius: 0;
            border-bottom-right-radius: 0;
            border: 2px solid ${colors.border.replace('border-', '')};
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          }
          .list-item:hover {
            box-shadow: 0 4px 12px rgba(${isDarkMode ? '255, 255, 255, 0.2' : '0, 0, 0, 0.3'});
          }
          ${filteredSkins
            .map(
              (_, i) => `
            .animate-delay-${i * 100} {
              animation-delay: ${i * 0.1}s;
            }
          `
            )
            .join("")}
        `}
      </style>
      <h1
        className={`text-2xl sm:text-3xl font-extrabold ${
          isDarkMode ? colors.primaryDark : colors.primaryLight
        } mb-4 text-center`}
      >
        Lihat Skin {selectedHero ? `untuk ${selectedHero}` : ""}
      </h1>
      {!selectedHero && !isLoading && !error && (
        <p
          className={`text-center text-sm ${
            isDarkMode ? colors.primaryDark : colors.primaryLight
          }`}
        >
          Silakan pilih hero untuk melihat skin.
        </p>
      )}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Cari berdasarkan Nama Skin..."
          value={searchQuery}
          onChange={handleSearchChange}
          className={`w-full bg-transparent border-2 ${colors.border} ${
            isDarkMode ? colors.primaryDark : colors.primaryLight
          } rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-[${colors.glow}] outline-none transition-colors duration-200`}
          disabled={!selectedHero || progress.isVisible}
        />
      </div>
      {error && (
        <div className="mb-4 p-3 bg-red-900/60 text-red-200 rounded-lg text-sm border border-red-400/50">
          {error}
        </div>
      )}
      {isLoading ? (
        <div className="flex justify-center">
          <div
            className={`w-6 h-6 border-2 ${colors.border} rounded-full animate-spin`}
          />
        </div>
      ) : (
        <div
          className="flex flex-col gap-2"
          ref={(el) => {
            if (el) {
              const items = el.querySelectorAll(".animate-fade-scroll");
              const observer = new IntersectionObserver(
                (entries) => {
                  entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                      entry.target.classList.add("visible");
                      observer.unobserve(entry.target);
                    }
                  });
                },
                { threshold: 0.2 }
              );
              items.forEach((item) => observer.observe(item));
              return () => items.forEach((item) => observer.unobserve(item));
            }
          }}
        >
          {filteredSkins.length === 0 && selectedHero && !error && (
            <p
              className={`text-center text-sm ${
                isDarkMode ? colors.primaryDark : colors.primaryLight
              }`}
            >
              Tidak ada skin ditemukan untuk {selectedHero}.
            </p>
          )}
          {filteredSkins.map((skin, index) => (
            <div
              key={skin.id}
              className={`list-item flex items-center justify-between bg-transparent border-2 ${
                colors.border
              } shadow-md p-2 animate-slide-in-right animate-delay-${
                index * 100
              } animate-fade-scroll`}
            >
              <div className="flex items-center gap-2">
                {!loadedImages.has(`${skin.id}-img1`) && (
                  <div className="w-9 h-9 flex items-center justify-center">
                    <div
                      className={`w-5 h-5 border-2 ${colors.border} rounded-full animate-spin`}
                    />
                  </div>
                )}
                <img
                  src={getImageUrl(skin.img1)}
                  alt={`${skin.name} img1`}
                  className={`w-9 h-9 object-cover rounded-full border-2 ${
                    colors.border
                  } ${loadedImages.has(`${skin.id}-img1`) ? "" : "hidden"}`}
                  loading="lazy"
                  decoding="async"
                />
                <FaAngleDoubleRight
                  className={`text-base ${
                    isDarkMode ? colors.primaryDark : colors.primaryLight
                  }`}
                />
                {!loadedImages.has(`${skin.id}-img2`) && (
                  <div className="w-9 h-9 flex items-center justify-center">
                    <div
                      className={`w-5 h-5 border-2 ${colors.border} rounded-full animate-spin`}
                    />
                  </div>
                )}
                <img
                  src={getImageUrl(skin.img2)}
                  alt={`${skin.name} img2`}
                  className={`w-9 h-9 object-cover rounded-full border-2 ${
                    colors.border
                  } ${loadedImages.has(`${skin.id}-img2`) ? "" : "hidden"}`}
                  loading="lazy"
                  decoding="async"
                />
                <h2
                  className={`font-bold text-sm ${
                    isDarkMode ? colors.primaryDark : colors.primaryLight
                  } truncate max-w-[120px] sm:max-w-[200px]`}
                >
                  {skin.name}
                </h2>
              </div>
              <button
                onClick={() => handleInstallClick(skin.url)}
                className={`bg-transparent ${
                  isDarkMode ? colors.primaryDark : colors.primaryLight
                } py-1 px-2 rounded-lg text-sm font-semibold border ${
                  colors.border
                } hover:${
                  isDarkMode ? colors.accentDark : colors.accentLight
                } transition-all duration-200 disabled:opacity-50`}
                disabled={progress.isVisible}
              >
                Pasang
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ViewSkin;
