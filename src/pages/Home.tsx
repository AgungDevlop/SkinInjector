import { Link } from "react-router-dom";
import { useState } from "react";
import SplashAnimation from "../components/SplashAnimation";
import Banner from "../components/Banner";

interface Card {
  title: string;
  image: string;
  route: string;
}

const Home: React.FC = () => {
  const [showSplash, setShowSplash] = useState(!sessionStorage.getItem("hasSeenSplash"));
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  const cards: Card[] = [
    {
      title: "Unlock Skin",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQULKxdP7uXsWMptLAosgCv47Zc3MAkSX4eZlhfjfSjlch9DJ1r5MxvRA&s=10",
      route: "view-hero",
    },
    {
      title: "Recall Animation",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQwynRhGBYW_piueXA82dDlJmr9OjPq14M8SxQa9YvdloHdTGF25CTNqxI0&s=10",
      route: "/recall-animation",
    },
    {
      title: "Spawn Effect",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQVFd58AqHDakOVhqxBg4OT1qxl16VJ8XiQ7A&usqp=CAU",
      route: "/spawn-effect",
    },
    {
      title: "Elimination Effect",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR5xyhh1nGbhJuFdUCskmK_kXdOS-bWDdSsBA&usqp=CAU",
      route: "/elimination-effect",
    },
    {
      title: "Battle Emote",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRI74xL8cMMjEpGD1B36wHjjW6VnLP56sAENQ&usqp=CAU",
      route: "/battle-emote",
    },
    {
      title: "Fix Bug",
      image: "https://cdn-icons-png.flaticon.com/512/4677/4677647.png",
      route: "custom://fixBug",
    },
  ];

  // Handle image load or error
  const handleImageLoad = (title: string) => {
    setLoadedImages((prev) => new Set(prev).add(title));
  };

  // Fallback timeout to ensure spinner doesn't persist indefinitely
  const setImageTimeout = (title: string) => {
    setTimeout(() => {
      setLoadedImages((prev) => new Set(prev).add(title));
    }, 5000); // 5 seconds fallback
  };

  const handleAnimationComplete = () => {
    setShowSplash(false);
    sessionStorage.setItem("hasSeenSplash", "true");
  };

  return (
    <>
      <div className="relative">
        {showSplash && <SplashAnimation onAnimationComplete={handleAnimationComplete} />}
        <div className="container mx-auto p-2 sm:p-3 text-white">
          <style>
            {`
              @keyframes orbit {
                0% { transform: rotate(0deg) translateX(20px) rotate(0deg); }
                100% { transform: rotate(360deg) translateX(20px) rotate(-360deg); }
              }
              @keyframes glow-pulse {
                0%, 100% { opacity: 0.5; }
                50% { opacity: 1; }
              }
              .orbit-spinner {
                position: relative;
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              .orbit-spinner .particle {
                position: absolute;
                width: 8px;
                height: 8px;
                background: linear-gradient(45deg, #3b82f6, #a5b4fc);
                border-radius: 50%;
                box-shadow: 0 0 8px rgba(59, 130, 246, 0.8);
                animation: orbit 1.5s linear infinite, glow-pulse 1.5s ease-in-out infinite;
              }
              .orbit-spinner .particle:nth-child(1) { animation-delay: 0s; }
              .orbit-spinner .particle:nth-child(2) { animation-delay: -0.3s; transform: rotate(120deg) translateX(20px); }
              .orbit-spinner .particle:nth-child(3) { animation-delay: -0.6s; transform: rotate(240deg) translateX(20px); }
              .orbit-spinner::after {
                content: '';
                position: absolute;
                width: 16px;
                height: 16px;
                background: #3b82f6;
                border-radius: 50%;
                box-shadow: 0 0 12px rgba(59, 130, 246, 0.6);
                animation: glow-pulse 1.5s ease-in-out infinite;
              }
            `}
          </style>
          <Banner />
          <div className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fit,minmax(180px,1fr))] md:grid-cols-[repeat(auto-fit,minmax(220px,1fr))] lg:grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-3 sm:gap-4">
            {cards.map((card) => (
              <div
                key={card.title}
                className="relative bg-gradient-to-br from-gray-900 via-blue-950 to-purple-950 border-2 border-blue-400 rounded-tl-none rounded-tr-xl rounded-bl-xl rounded-br-none shadow-xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(59,130,246,0.7)] hover:animate-glitch"
              >
                <div className="absolute inset-0 border-2 border-blue-400 opacity-30 rounded-tl-none rounded-tr-xl rounded-bl-xl rounded-br-none animate-neon-pulse pointer-events-none"></div>
                <div className="relative z-10 p-3 sm:p-3 lg:p-4">
                  <div className="relative">
                    {!loadedImages.has(card.title) && (
                      <div className="w-full h-20 sm:h-20 md:h-24 lg:h-28 flex items-center justify-center bg-gray-800 rounded-md">
                        <div className="orbit-spinner w-12 h-12 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16">
                          <div className="particle"></div>
                          <div className="particle"></div>
                          <div className="particle"></div>
                        </div>
                      </div>
                    )}
                    <img
                      src={card.image}
                      alt={card.title}
                      className={`w-full h-20 sm:h-20 md:h-24 lg:h-28 object-cover rounded-md mb-3 sm:mb-3 lg:mb-4 ${loadedImages.has(card.title) ? '' : 'hidden'}`}
                      loading="lazy"
                      onLoad={() => handleImageLoad(card.title)}
                      onError={(e) => {
                        e.currentTarget.src = "https://via.placeholder.com/150?text=Image";
                        handleImageLoad(card.title); // Mark as loaded to hide spinner
                      }}
                      onLoadStart={() => setImageTimeout(card.title)} // Set timeout on load start
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-30 rounded-md"></div>
                  </div>
                  <h2 className="text-center font-bold text-sm sm:text-sm md:text-base lg:text-lg text-blue-300 mb-3 sm:mb-3 lg:mb-4 tracking-tight drop-shadow-[0_1px_2px_rgba(59,130,246,0.8)]">
                    {card.title}
                  </h2>
                  <Link to={card.route}>
                    <button className="w-full bg-gradient-to-r from-gray-900 via-blue-950 to-purple-950 text-blue-300 py-1.5 px-3 sm:py-1.5 sm:px-3 md:py-2 md:px-4 lg:py-2.5 lg:px-5 rounded-lg text-sm sm:text-sm md:text-base lg:text-lg font-semibold border border-blue-400 animate-neon-pulse hover:bg-gradient-to-r hover:from-blue-950 hover:via-purple-950 hover:to-gray-900 hover:shadow-[0_0_8px_rgba(59,130,246,0.8),0_0_15px_rgba(59,130,246,0.6)] hover:scale-105 hover:animate-shake focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 transition-all duration-300">
                      View
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
