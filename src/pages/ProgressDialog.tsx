import { useEffect, useContext } from "react";
import { ThemeContext } from "../components/ThemeContext";
import { ThemeColors } from "../components/ThemeColors";

interface ProgressState {
  isVisible: boolean;
  percentage: number;
  status: string;
  error?: string;
  itemType: string;
}

interface ProgressDialogProps {
  progress: ProgressState;
  setProgress: React.Dispatch<React.SetStateAction<ProgressState>>;
}

const ProgressDialog: React.FC<ProgressDialogProps> = ({ progress, setProgress }) => {
  const { isDarkMode, theme } = useContext(ThemeContext);
  const { colors } = ThemeColors(theme, isDarkMode);

  useEffect(() => {
    (window as any).updateProgress = (data: {
      percentage: number;
      status: string;
      error?: string;
    }) => {
      if (
        data.status === "Downloading..." ||
        data.status === "Extracting..." ||
        data.status === "Completed" ||
        (data.status === "Error" && data.error)
      ) {
        setProgress({
          isVisible: true,
          percentage: Math.min(data.percentage, 100),
          status: data.status,
          error: data.error,
          itemType: progress.itemType,
        });
      } else if (data.status === "Error" && !data.error) {
        setProgress((prev) => ({ ...prev, isVisible: false }));
      }
    };

    return () => {
      delete (window as any).updateProgress;
    };
  }, [setProgress, progress.itemType]);

  useEffect(() => {
    if (progress.status === "Completed") {
      const timer = setTimeout(() => {
        setProgress((prev) => ({ ...prev, isVisible: false }));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [progress.status, setProgress]);

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [
          parseInt(result[1], 16),
          parseInt(result[2], 16),
          parseInt(result[3], 16),
        ]
      : [0, 0, 0];
  };

  return (
    <>
      {progress.isVisible && (
        <div className="progress-overlay">
          <div
            className={`progress-container ${!progress.isVisible ? "out" : ""}`}
          >
            {progress.error ? (
              <p className="error-text">{progress.error}</p>
            ) : (
              <>
                <div className="progress-circle-container">
                  <div className="progress-circle">
                    <div className="progress-circle-inner">
                      {progress.percentage}%
                    </div>
                  </div>
                </div>
                <p className="info-text">
                  {progress.status === "Downloading..."
                    ? `Mengunduh ${progress.itemType}...`
                    : progress.status === "Extracting..."
                    ? `Mengekstrak ${progress.itemType}...`
                    : "Pemasangan Selesai"}
                </p>
                {progress.status !== "Completed" && (
                  <p className="warning-text">
                    <strong>Indonesia:</strong> Jangan close aplikasi sebelum
                    script {progress.itemType.toLowerCase()} selesai dipasang.
                    <br />
                    <strong>Inggris:</strong> Do not close the app until the{" "}
                    {progress.itemType.toLowerCase()} script is fully installed.
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      )}
      <style>
        {`
          @keyframes fade-in {
            0% { opacity: 0; transform: scale(0.9); }
            100% { opacity: 1; transform: scale(1); }
          }
          @keyframes fade-out {
            0% { opacity: 1; transform: scale(1); }
            100% { opacity: 0; transform: scale(0.9); }
          }
          @keyframes pulse-glow {
            0% { box-shadow: 0 0 10px rgba(${hexToRgb(colors.glow).join(
              ", "
            )}, 0.3), 0 0 20px rgba(${hexToRgb(colors.glow).join(
              ", "
            )}, 0.1); }
            50% { box-shadow: 0 0 20px rgba(${hexToRgb(colors.glow).join(
              ", "
            )}, 0.6), 0 0 30px rgba(${hexToRgb(colors.glow).join(
              ", "
            )}, 0.3); }
            100% { box-shadow: 0 0 10px rgba(${hexToRgb(colors.glow).join(
              ", "
            )}, 0.3), 0 0 20px rgba(${hexToRgb(colors.glow).join(
              ", "
            )}, 0.1); }
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
            background: ${
              isDarkMode
                ? "linear-gradient(135deg, #1a1a1a, #2d2d2d)"
                : "linear-gradient(135deg, #ffffff, #f5f5f5)"
            };
            padding: 24px;
            border-radius: 20px;
            box-shadow: 0 12px 24px rgba(0, 0, 0, 0.4), 0 0 40px rgba(${hexToRgb(
              colors.glow
            ).join(", ")}, 0.1);
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
              ${isDarkMode ? "#333" : "#e0e0e0"} ${progress.percentage}%
            );
            transition: background 0.3s ease-out;
          }
          .progress-circle-inner {
            position: absolute;
            top: 10px;
            left: 10px;
            right: 10px;
            bottom: 10px;
            background: ${
              isDarkMode
                ? "linear-gradient(135deg, #1a1a1a, #2d2d2d)"
                : "linear-gradient(135deg, #ffffff, #f0f0f0)"
            };
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            font-weight: 700;
            color: ${isDarkMode ? colors.textDark : colors.textLight};
            text-shadow: 0 0 6px ${isDarkMode ? `rgba(${hexToRgb(
              colors.glow
            ).join(", ")}, 0.7)` : `rgba(${hexToRgb(colors.glow).join(
              ", "
            )}, 0.7)`};
          }
          .info-text {
            font-size: 18px;
            font-weight: 600;
            color: ${isDarkMode ? colors.textDark : colors.textLight};
            text-shadow: 0 0 6px ${isDarkMode ? `rgba(${hexToRgb(
              colors.glow
            ).join(", ")}, 0.7)` : `rgba(${hexToRgb(colors.glow).join(
              ", "
            )}, 0.7)`};
            margin-bottom: 16px;
            transition: color 0.3s ease;
          }
          .warning-text {
            font-size: 14px;
            color: ${isDarkMode ? "#a0a0a0" : "#757575"};
            text-align: left;
            line-height: 1.6;
            text-shadow: 0 0 4px ${isDarkMode ? `rgba(${hexToRgb(
              colors.glow
            ).join(", ")}, 0.4)` : `rgba(${hexToRgb(colors.glow).join(
              ", "
            )}, 0.4)`};
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
        `}
      </style>
    </>
  );
};

export default ProgressDialog;
