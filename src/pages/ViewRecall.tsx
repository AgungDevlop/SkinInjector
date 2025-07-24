import { useState, useEffect, useRef, useContext, useCallback } from "react";
import axios, { AxiosError } from "axios";
import { FaAngleDoubleRight } from "react-icons/fa";
import { ThemeContext } from "../components/ThemeContext";
import { ThemeColors } from "../components/ThemeColors";

interface RecallData {
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
}

const ViewRecall: React.FC = () => {
  const { isDarkMode, theme } = useContext(ThemeContext);
  const { colors } = ThemeColors(theme, isDarkMode);
  const [recalls, setRecalls] = useState<RecallData[]>([]);
  const [filteredRecalls, setFilteredRecalls] = useState<RecallData[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [progress, setProgress] = useState<ProgressState>({
    isVisible: false,
    percentage: 0,
    status: "",
  });
  const timeoutRefs = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    (window as any).updateProgress = (data: {
      percentage: number;
      status: string;
      error?: string;
    }) => {
      if (data.status === "Downloading..." || data.status === "Extracting..." || data.status === "Completed" || (data.status === "Error" && data.error)) {
        setProgress({
          isVisible: true,
          percentage: Math.min(data.percentage, 100),
          status: data.status,
          error: data.error,
        });
      } else if (data.status === "Error" && !data.error) {
        setProgress((prev) => ({ ...prev, isVisible: false }));
      }
    };

    return () => {
      delete (window as any).updateProgress;
    };
  }, []);

  useEffect(() => {
    if (progress.status === "Completed") {
      const timer = setTimeout(() => {
        setProgress((prev) => ({ ...prev, isVisible: false }));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [progress.status]);

  const getImageUrl = useCallback((url: string): string => {
    try {
      const decodedUrl = url.replace(/\\+/g, "");
      if (decodedUrl.includes("static.wikia.nocookie.net")) {
        return decodedUrl.split("/revision/latest")[0];
      }
      return decodedUrl;
    } catch {
      return "https://via.placeholder.com/40?text=Recall";
    }
  }, []);

  const preloadImages = useCallback((data: RecallData[]) => {
    timeoutRefs.current.forEach((timeout) => clearTimeout(timeout));
    timeoutRefs.current.clear();
    setLoadedImages(new Set());

    data.forEach((recall) => {
      const imgTypes: ("img1" | "img2")[] = ["img1", "img2"];
      imgTypes.forEach((imgType) => {
        const img = new Image();
        const imgSrc = recall[imgType];
        if (typeof imgSrc === "string") {
          img.src = getImageUrl(imgSrc);
          img.onload = () => {
            setLoadedImages((prev) => new Set(prev).add(`${recall.id}-${imgType}`));
            clearTimeout(timeoutRefs.current.get(`${recall.id}-${imgType}`));
          };
          img.onerror = () => {
            setLoadedImages((prev) => new Set(prev).add(`${recall.id}-${imgType}`));
            clearTimeout(timeoutRefs.current.get(`${recall.id}-${imgType}`));
          };
          const timeout = setTimeout(() => {
            setLoadedImages((prev) => new Set(prev).add(`${recall.id}-${imgType}`));
          }, 3000);
          timeoutRefs.current.set(`${recall.id}-${imgType}`, timeout);
        }
      });
    });
  }, [getImageUrl]);

  const fetchRecalls = useCallback(async () => {
    try {
      const response = await axios.get(
        "https://raw.githubusercontent.com/AgungDevlop/InjectorMl/main/Recall.json",
        { timeout: 5000 }
      );
      const recallsData = response.data;
      if (!Array.isArray(recallsData)) {
        throw new Error("Recall.json is not a valid array");
      }
      setRecalls(recallsData);
      setFilteredRecalls(recallsData);
      preloadImages(recallsData);
    } catch (err) {
      const errorMessage =
        err instanceof AxiosError
          ? `${err.message}${err.response ? ` (Status: ${err.response.status})` : ''}`
          : "Unknown error";
      setError(`Failed to fetch recalls: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [preloadImages]);

  useEffect(() => {
    fetchRecalls();
    return () => {
      timeoutRefs.current.forEach((timeout) => clearTimeout(timeout));
      timeoutRefs.current.clear();
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [fetchRecalls]);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      const filtered = recalls
        .filter((recall) =>
          recall.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => a.name.localeCompare(b.name));
      setFilteredRecalls(filtered);
      preloadImages(filtered);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [recalls, searchQuery, preloadImages]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleInstallClick = useCallback((url: string) => {
    if ((window as any).Android) {
      setProgress({ isVisible: false, percentage: 0, status: "" });
      (window as any).Android.startDownload(url);
    } else {
      const message = `Antarmuka Android tidak tersedia. Silakan unduh file secara manual dari:\n${url}`;
      alert(message);
      window.open(url, "_blank");
    }
  }, []);

  return (
    <div className="container mx-auto p-2 sm:p-4 relative">
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
          @keyframes fade-in {
            0% { opacity: 0; transform: scale(0.9); }
            100% { opacity: 1; transform: scale(1); }
          }
          @keyframes fade-out {
            0% { opacity: 1; transform: scale(1); }
            100% { opacity: 0; transform: scale(0.9); }
          }
          @keyframes pulse-glow {
            0% { box-shadow: 0 0 10px rgba(${hexToRgb(colors.glow).join(', ')}, 0.3), 0 0 20px rgba(${hexToRgb(colors.glow).join(', ')}, 0.1); }
            50% { box-shadow: 0 0 20px rgba(${hexToRgb(colors.glow).join(', ')}, 0.6), 0 0 30px rgba(${hexToRgb(colors.glow).join(', ')}, 0.3); }
            100% { box-shadow: 0 0 10px rgba(${hexToRgb(colors.glow).join(', ')}, 0.3), 0 0 20px rgba(${hexToRgb(colors.glow).join(', ')}, 0.1); }
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
          .progress-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.75);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            backdrop-filter: blur(8px);
            will-change: opacity, transform;
          }
          .progress-container {
            background: ${isDarkMode ? 'linear-gradient(135deg, #1a1a1a, #2d2d2d)' : 'linear-gradient(135deg, #ffffff, #f5f5f5)'};
            padding: 24px;
            border-radius: 20px;
            box-shadow: 0 12px 24px rgba(0, 0, 0, 0.4), 0 0 40px rgba(${hexToRgb(colors.glow).join(', ')}, 0.1);
            width: 90%;
            max-width: 420px;
            text-align: center;
            border: 2px solid ${colors.border};
            animation: fade-in 0.4s ease-out forwards;
            will-change: transform, opacity;
            transition: transform 0.3s ease, opacity 0.3s ease;
          }
          .progress-container.out {
            animation: fade-out 0.4s ease-out forwards;
          }
          .progress-circle-container {
            position: relative;
            width: 100px;
            height: 100px;
            margin: 0 auto 20px;
          }
          .progress-circle {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background: conic-gradient(
              ${colors.glow} ${progress.percentage}%,
              ${isDarkMode ? '#333' : '#e0e0e0'} ${progress.percentage}%
            );
            transition: background 0.3s ease-out;
          }
          .progress-circle-inner {
            position: absolute;
            top: 10px;
            left: 10px;
            right: 10px;
            bottom: 10px;
            background: ${isDarkMode ? 'linear-gradient(135deg, #1a1a1a, #2d2d2d)' : 'linear-gradient(135deg, #ffffff, #f0f0f0)'};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            font-weight: 700;
            color: ${isDarkMode ? colors.textDark : colors.textLight};
            text-shadow: 0 0 6px ${isDarkMode ? `rgba(${hexToRgb(colors.glow).join(', ')}, 0.7)` : `rgba(${hexToRgb(colors.glow).join(', ')}, 0.7)`};
          }
          .info-text {
            font-size: 18px;
            font-weight: 600;
            color: ${isDarkMode ? colors.textDark : colors.textLight};
            text-shadow: 0 0 6px ${isDarkMode ? `rgba(${hexToRgb(colors.glow).join(', ')}, 0.7)` : `rgba(${hexToRgb(colors.glow).join(', ')}, 0.7)`};
            margin-bottom: 16px;
            transition: color 0.3s ease;
          }
          .warning-text {
            font-size: 14px;
            color: ${isDarkMode ? '#a0a0a0' : '#757575'};
            text-align: left;
            line-height: 1.6;
            text-shadow: 0 0 4px ${isDarkMode ? `rgba(${hexToRgb(colors.glow).join(', ')}, 0.4)` : `rgba(${hexToRgb(colors.glow).join(', ')}, 0.4)`};
            margin-top: 8px;
            transition: color 0.3s ease;
          }
          .error-text {
            font-size: 14px;
            color: #ff4d4d;
            text-align: center;
            margin-top: 16px;
            text-shadow: 0 0 6px rgba(255, 77, 77, 0.6);
            transition: color 0.3s ease;
          }
          ${filteredRecalls.map(
            (_, i) => `
            .animate-delay-${i * 100} {
              animation-delay: ${i * 0.1}s;
            }
          `
          ).join("")}
        `}
      </style>
      {progress.isVisible && (
        <div className="progress-overlay">
          <div className={`progress-container ${!progress.isVisible ? 'out' : ''}`}>
            {progress.error ? (
              <p className="error-text">{progress.error}</p>
            ) : (
              <>
                <div className="progress-circle-container">
                  <div className="progress-circle">
                    <div className="progress-circle-inner">{progress.percentage}%</div>
                  </div>
                </div>
                <p className="info-text">
                  {progress.status === "Downloading..."
                    ? "Mengunduh Recall..."
                    : progress.status === "Extracting..."
                    ? "Mengekstrak Recall..."
                    : "Pemasangan Selesai"}
                </p>
                {progress.status !== "Completed" && (
                  <p className="warning-text">
                    <strong>Indonesia:</strong> Jangan close aplikasi sebelum script recall selesai dipasang.<br />
                    <strong>Inggris:</strong> Do not close the app until the recall script is fully installed.
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      )}
      <h1 className={`text-2xl sm:text-3xl font-extrabold ${isDarkMode ? colors.primaryDark : colors.primaryLight} mb-4 text-center`}>
        View Recalls
      </h1>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by Recall Name..."
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
          <div className={`w-6 h-6 border-2 ${colors.border} rounded-full animate-spin`} />
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
          {filteredRecalls.length === 0 && !error && (
            <p className={`text-center text-sm ${isDarkMode ? colors.primaryDark : colors.primaryLight}`}>
              No recalls found.
            </p>
          )}
          {filteredRecalls.map((recall, index) => (
            <div
              key={recall.id}
              className={`flex items-center justify-between bg-transparent border-2 ${
                colors.border
              } rounded-lg shadow-md p-2 transition-all duration-200 hover:scale-[1.02] animate-slide-in-right animate-delay-${
                index * 100
              } animate-fade-scroll`}
            >
              <div className="flex items-center gap-2">
                {!loadedImages.has(`${recall.id}-img1`) && (
                  <div className="w-9 h-9 flex items-center justify-center">
                    <div className={`w-5 h-5 border-2 ${colors.border} rounded-full animate-spin`} />
                  </div>
                )}
                <img
                  src={getImageUrl(recall.img1)}
                  alt={`${recall.name} img1`}
                  className={`w-9 h-9 object-cover rounded-full border-2 ${
                    colors.border
                  } ${loadedImages.has(`${recall.id}-img1`) ? "" : "hidden"}`}
                  loading="lazy"
                  decoding="async"
                />
                <FaAngleDoubleRight
                  className={`text-base ${isDarkMode ? colors.primaryDark : colors.primaryLight}`}
                />
                {!loadedImages.has(`${recall.id}-img2`) && (
                  <div className="w-9 h-9 flex items-center justify-center">
                    <div className={`w-5 h-5 border-2 ${colors.border} rounded-full animate-spin`} />
                  </div>
                )}
                <img
                  src={getImageUrl(recall.img2)}
                  alt={`${recall.name} img2`}
                  className={`w-9 h-9 object-cover rounded-full border-2 ${
                    colors.border
                  } ${loadedImages.has(`${recall.id}-img2`) ? "" : "hidden"}`}
                  loading="lazy"
                  decoding="async"
                />
                <h2
                  className={`font-bold text-sm ${
                    isDarkMode ? colors.primaryDark : colors.primaryLight
                  } truncate max-w-[120px] sm:max-w-[200px]`}
                >
                  {recall.name}
                </h2>
              </div>
              <button
                onClick={() => handleInstallClick(recall.url)}
                className={`bg-transparent ${
                  isDarkMode ? colors.primaryDark : colors.primaryLight
                } py-1 px-2 rounded-lg text-sm font-semibold border ${
                  colors.border
                } hover:${isDarkMode ? colors.accentDark : colors.accentLight} transition-all duration-200 disabled:opacity-50`}
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

// Helper function to convert hex to RGB
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [0, 0, 0];
};

export default ViewRecall;
