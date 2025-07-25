import { useState, useEffect, useRef, useContext, useCallback } from "react";
import axios, { AxiosError } from "axios";
import { FaAngleDoubleRight } from "react-icons/fa";
import { ThemeContext } from "../components/ThemeContext";
import { ThemeColors } from "../components/ThemeColors";
import ProgressDialog from "./ProgressDialog";

interface SpawnData {
  id: string;
  name: string;
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

const ViewSpawn: React.FC = () => {
  const { isDarkMode, theme } = useContext(ThemeContext);
  const { colors } = ThemeColors(theme, isDarkMode);
  const [spawns, setSpawns] = useState<SpawnData[]>([]);
  const [filteredSpawns, setFilteredSpawns] = useState<SpawnData[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [progress, setProgress] = useState<ProgressState>({
    isVisible: false,
    percentage: 0,
    status: "",
    itemType: "Spawn",
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
      return "https://via.placeholder.com/40?text=Spawn";
    }
  }, []);

  const preloadImages = useCallback(
    (data: SpawnData[]) => {
      timeoutRefs.current.forEach((timeout) => clearTimeout(timeout));
      timeoutRefs.current.clear();
      setLoadedImages(new Set());

      data.forEach((spawn) => {
        const imgTypes: ("img1" | "img2")[] = ["img1", "img2"];
        imgTypes.forEach((imgType) => {
          const img = new Image();
          const imgSrc = spawn[imgType];
          if (typeof imgSrc === "string") {
            img.src = getImageUrl(imgSrc);
            img.onload = () => {
              setLoadedImages((prev) =>
                new Set(prev).add(`${spawn.id}-${imgType}`)
              );
              clearTimeout(timeoutRefs.current.get(`${spawn.id}-${imgType}`));
            };
            img.onerror = () => {
              setLoadedImages((prev) =>
                new Set(prev).add(`${spawn.id}-${imgType}`)
              );
              clearTimeout(timeoutRefs.current.get(`${spawn.id}-${imgType}`));
            };
            const timeout = setTimeout(() => {
              setLoadedImages((prev) =>
                new Set(prev).add(`${spawn.id}-${imgType}`)
              );
            }, 3000);
            timeoutRefs.current.set(`${spawn.id}-${imgType}`, timeout);
          }
        });
      });
    },
    [getImageUrl]
  );

  const fetchSpawns = useCallback(async () => {
    try {
      const response = await axios.get(
        "https://raw.githubusercontent.com/AgungDevlop/InjectorMl/main/Spawn.json",
        { timeout: 5000 }
      );
      const spawnsData = response.data;
      if (!Array.isArray(spawnsData)) {
        throw new Error("Spawn.json is not a valid array");
      }
      setSpawns(spawnsData);
      setFilteredSpawns(spawnsData);
      preloadImages(spawnsData);
    } catch (err) {
      const errorMessage =
        err instanceof AxiosError
          ? `${err.message}${
              err.response ? ` (Status: ${err.response.status})` : ""
            }`
          : "Unknown error";
      setError(`Failed to fetch spawns: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [preloadImages]);

  useEffect(() => {
    fetchSpawns();
    return () => {
      timeoutRefs.current.forEach((timeout) => clearTimeout(timeout));
      timeoutRefs.current.clear();
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [fetchSpawns]);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      const filtered = spawns
        .filter((spawn) =>
          spawn.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => a.name.localeCompare(b.name));
      setFilteredSpawns(filtered);
      preloadImages(filtered);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [spawns, searchQuery, preloadImages]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    []
  );

  const handleInstallClick = useCallback(
    (url: string) => {
      if ((window as any).Android) {
        setProgress({ isVisible: false, percentage: 0, status: "", itemType: "Spawn" });
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
            display: flex;
            flex-wrap: nowrap;
            align-items: center;
            justify-content: space-between;
            min-width: 0;
          }
          .list-item:hover {
            box-shadow: 0 4px 12px rgba(${isDarkMode ? '255, 255, 255, 0.2' : '0, 0, 0, 0.3'});
          }
          .list-item-content {
            display: flex;
            align-items: center;
            gap: 8px;
            flex: 1;
            min-width: 0;
          }
          .list-item-text {
            flex: 1;
            min-width: 0;
            overflow: hidden;
          }
          .list-item-button {
            flex-shrink: 0;
            min-width: 80px;
            text-align: center;
          }
          ${filteredSpawns
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
        View Spawns
      </h1>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by Spawn Name..."
          value={searchQuery}
          onChange={handleSearchChange}
          className={`w-full bg-transparent border-2 ${colors.border} ${
            isDarkMode ? colors.primaryDark : colors.primaryLight
          } rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-[${colors.glow}] outline-none transition-colors duration-200`}
          disabled={progress.isVisible}
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
          {filteredSpawns.length === 0 && !error && (
            <p
              className={`text-center text-sm ${
                isDarkMode ? colors.primaryDark : colors.primaryLight
              }`}
            >
              No spawns found.
            </p>
          )}
          {filteredSpawns.map((spawn, index) => (
            <div
              key={spawn.id}
              className={`list-item bg-transparent border-2 ${
                colors.border
              } shadow-md p-2 animate-slide-in-right animate-delay-${
                index * 100
              } animate-fade-scroll`}
            >
              <div className="list-item-content">
                {!loadedImages.has(`${spawn.id}-img1`) && (
                  <div className="w-9 h-9 flex items-center justify-center flex-shrink-0">
                    <div
                      className={`w-5 h-5 border-2 ${colors.border} rounded-full animate-spin`}
                    />
                  </div>
                )}
                <img
                  src={getImageUrl(spawn.img1)}
                  alt={`${spawn.name} img1`}
                  className={`w-9 h-9 object-cover rounded-full border-2 ${
                    colors.border
                  } ${loadedImages.has(`${spawn.id}-img1`) ? "" : "hidden"} flex-shrink-0`}
                  loading="lazy"
                  decoding="async"
                />
                <FaAngleDoubleRight
                  className={`text-base ${
                    isDarkMode ? colors.primaryDark : colors.primaryLight
                  } flex-shrink-0`}
                />
                {!loadedImages.has(`${spawn.id}-img2`) && (
                  <div className="w-9 h-9 flex items-center justify-center flex-shrink-0">
                    <div
                      className={`w-5 h-5 border-2 ${colors.border} rounded-full animate-spin`}
                    />
                  </div>
                )}
                <img
                  src={getImageUrl(spawn.img2)}
                  alt={`${spawn.name} img2`}
                  className={`w-9 h-9 object-cover rounded-full border-2 ${
                    colors.border
                  } ${loadedImages.has(`${spawn.id}-img2`) ? "" : "hidden"} flex-shrink-0`}
                  loading="lazy"
                  decoding="async"
                />
                <h2
                  className={`font-bold text-sm ${
                    isDarkMode ? colors.primaryDark : colors.primaryLight
                  } truncate list-item-text`}
                >
                  {spawn.name}
                </h2>
              </div>
              <button
                onClick={() => handleInstallClick(spawn.url)}
                className={`bg-transparent ${
                  isDarkMode ? colors.primaryDark : colors.primaryLight
                } py-1 px-2 rounded-lg text-sm font-semibold border ${
                  colors.border
                } hover:${
                  isDarkMode ? colors.accentDark : colors.accentLight
                } transition-all duration-200 disabled:opacity-50 list-item-button`}
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

export default ViewSpawn;
