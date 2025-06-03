import { useState, useEffect } from "react";

interface SplashAnimationProps {
  onAnimationComplete: () => void;
}

const SplashAnimation: React.FC<SplashAnimationProps> = ({ onAnimationComplete }) => {
  const [showPulse, setShowPulse] = useState(false);
  const [showLogo, setShowLogo] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);

  useEffect(() => {
    // Start pulse animation after 300ms
    const startPulse = setTimeout(() => {
      setShowPulse(true);
    }, 300);

    // Show logo after 500ms
    const startLogo = setTimeout(() => {
      setShowLogo(true);
    }, 500);

    // Show spinner after 2.5s (for transition)
    const startSpinner = setTimeout(() => {
      setShowSpinner(true);
    }, 2500);

    // Complete animation after 3s
    const completeAnimation = setTimeout(() => {
      onAnimationComplete();
    }, 3000);

    return () => {
      clearTimeout(startPulse);
      clearTimeout(startLogo);
      clearTimeout(startSpinner);
      clearTimeout(completeAnimation);
    };
  }, [onAnimationComplete]);

  // Handle logo load or error
  const handleLogoLoad = () => {
    setLogoLoaded(true);
  };

  // Fallback timeout to ensure spinner doesn't persist indefinitely
  const setLogoTimeout = () => {
    setTimeout(() => {
      setLogoLoaded(true);
    }, 5000); // 5 seconds fallback
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-gradient-to-br from-gray-900 via-blue-950 to-purple-950 overflow-hidden">
      <style>
        {`
          @keyframes radial-pulse {
            0% { transform: scale(0); opacity: 0.8; }
            100% { transform: scale(3); opacity: 0; }
          }
          @keyframes logo-reveal {
            0% { transform: scale(0.5); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
          }
          @keyframes spin-slow {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
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
          .pulse-effect {
            position: absolute;
            width: 200px;
            height: 200px;
            background: radial-gradient(circle, rgba(59,130,246,0.5) 0%, transparent 70%);
            border-radius: 50%;
            animation: radial-pulse 2s ease-out forwards;
          }
        `}
      </style>
      {/* Pulse Effect */}
      {showPulse && (
        <div className="pulse-effect"></div>
      )}
      {/* Logo and Ring */}
      <div className="relative z-50 flex justify-center items-center">
        {!logoLoaded && (
          <div className="w-36 h-36 sm:w-40 sm:h-40 flex items-center justify-center">
            <div className="custom-spinner w-12 h-12 sm:w-14 sm:h-14"></div>
          </div>
        )}
        <img
          src="icon.webp"
          alt="Skin Tools ML Logo"
          className={`w-36 h-36 sm:w-40 sm:h-40 rounded-full object-cover ring-4 ring-blue-400 bg-gray-900 p-1 transition-all duration-1000 ${showLogo && logoLoaded ? 'animate-[logo-reveal_1s_ease-out_forwards]' : 'opacity-0 scale-50'}`}
          onLoad={handleLogoLoad}
          onError={(e) => {
            e.currentTarget.src = "https://via.placeholder.com/150?text=Logo";
            handleLogoLoad(); // Mark as loaded to hide spinner
          }}
          onLoadStart={setLogoTimeout} // Set timeout on load start
        />
        <div
          className={`absolute w-44 h-44 sm:w-48 sm:h-48 rounded-full border-2 border-blue-400 opacity-30 animate-spin-slow ${showLogo ? 'opacity-30' : 'opacity-0'}`}
        ></div>
      </div>
      {/* Spinner at End */}
      {showSpinner && (
        <div className="absolute bottom-10 w-8 h-8 sm:w-10 sm:h-10">
          <div className="custom-spinner"></div>
        </div>
      )}
    </div>
  );
};

export default SplashAnimation;
