import { useState, useEffect } from "react";

interface SplashAnimationProps {
  onAnimationComplete: () => void;
}

const SplashAnimation: React.FC<SplashAnimationProps> = ({ onAnimationComplete }) => {
  const [animateCurtains, setAnimateCurtains] = useState(false);
  const [showLogo, setShowLogo] = useState(false);

  useEffect(() => {
    const startAnimation = setTimeout(() => {
      setAnimateCurtains(true);
      setShowLogo(true);
    }, 1000);

    const hideSplash = setTimeout(() => {
      onAnimationComplete();
    }, 2500); // Slower transition: 5s total (1s delay + 4s animation)

    return () => {
      clearTimeout(startAnimation);
      clearTimeout(hideSplash);
    };
  }, [onAnimationComplete]);

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-black overflow-hidden">
      {/* Left Curtain */}
      <div className="absolute left-0 w-1/2 h-full overflow-hidden z-40">
        <div
          className={`w-full h-full bg-gradient-to-r from-gray-900 via-blue-950 to-purple-950 transition-transform duration-[1500ms] [transition-timing-function:cubic-bezier(0.33,0,0.67,1)] ${
            animateCurtains ? "-translate-x-full" : "translate-x-0"
          }`}
        >
          <div className="absolute inset-0 border-r-4 border-blue-400 opacity-50 animate-neon-pulse"></div>
        </div>
      </div>
      {/* Right Curtain */}
      <div className="absolute right-0 w-1/2 h-full overflow-hidden z-40">
        <div
          className={`w-full h-full bg-gradient-to-l from-gray-900 via-blue-950 to-purple-950 transition-transform duration-[1500ms] [transition-timing-function:cubic-bezier(0.33,0,0.67,1)] ${
            animateCurtains ? "translate-x-full" : "translate-x-0"
          }`}
        >
          <div className="absolute inset-0 border-l-4 border-blue-400 opacity-50 animate-neon-pulse"></div>
        </div>
      </div>
      {/* Logo in Center */}
      <div className="relative z-50 flex justify-center items-center">
        <img
          src="https://images.dwncdn.net/images/t_app-icon-l/p/99017561-4e15-42b5-9538-a6f4b1f0f1eb/259597479/skin-tools-ml-oti-logo"
          alt="Skin Tools ML Logo"
          className={`w-40 h-40 rounded-full object-cover ring-4 ring-blue-400 bg-gray-900 p-1 transition-opacity duration-[4000ms] ${
            showLogo ? "opacity-100" : "opacity-0"
          }`}
          loading="lazy"
        />
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[168px] h-[168px] rounded-full border-2 border-blue-400 opacity-40 animate-spin-slow transition-opacity duration-[4000ms] ${
            showLogo ? "opacity-100" : "opacity-0"
          }`}
        ></div>
      </div>
    </div>
  );
};

export default SplashAnimation;
