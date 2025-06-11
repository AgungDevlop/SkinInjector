import { Link } from "react-router-dom";
import { useState, useEffect, useRef, memo, useContext, useCallback } from "react";
import Banner from "../components/Banner";
import { ThemeContext } from "../components/ThemeContext";
import { ThemeColors } from "../components/ThemeColors";

interface Card {
  title: string;
  image: string;
  route: string;
}

const Home: React.FC = () => {
  const { isDarkMode, theme } = useContext(ThemeContext);
  const { colors } = ThemeColors(theme, isDarkMode);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const timeoutRefs = useRef<Map<string, NodeJS.Timeout>>(new Map());

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

  const handleClearRole = useCallback(() => {
    sessionStorage.removeItem("selectedRole");
    window.dispatchEvent(new Event("storage"));
  }, []);

  useEffect(() => {
    cards.forEach((card) => {
      const img = new Image();
      img.src = card.image;
      img.srcset = `${card.image} 1x, ${card.image.replace('150', '100')} 0.5x`;
      img.loading = "lazy";
      img.decoding = "async";
      img.onload = () => {
        setLoadedImages((prev) => new Set(prev).add(card.title));
        clearTimeout(timeoutRefs.current.get(card.title));
      };
      img.onerror = () => {
        setLoadedImages((prev) => new Set(prev).add(card.title));
        clearTimeout(timeoutRefs.current.get(card.title));
      };
      const timeout = setTimeout(() => {
        setLoadedImages((prev) => new Set(prev).add(card.title));
      }, 3000);
      timeoutRefs.current.set(card.title, timeout);
    });

    return () => {
      timeoutRefs.current.forEach((timeout) => clearTimeout(timeout));
      timeoutRefs.current.clear();
    };
  }, []);

  return (
    <>
      <div className="container mx-auto p-2 sm:p-3">
        <Banner />
        <div className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fit,minmax(180px,1fr))] md:grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3">
          {cards.map((card, index) => (
            <div
              key={card.title}
              className={`bg-transparent border-2 ${colors.border} rounded-lg shadow-md overflow-hidden transition-transform duration-500 hover:scale-105 animate-slide-in animate-delay-${index * 100}`}
            >
              <style>
                {`
                  @keyframes slide-in {
                    0% { transform: translateX(-100%); opacity: 0; }
                    100% { transform: translateX(0); opacity: 1; }
                  }
                  .animate-slide-in {
                    animation: slide-in 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
                  }
                  ${cards.map((_, i) => `
                    .animate-delay-${i * 100} {
                      animation-delay: ${i * 0.1}s;
                    }
                  `).join('')}
                `}
              </style>
              {!loadedImages.has(card.title) && (
                <div className="w-full h-20 sm:h-24 bg-transparent rounded-t-lg flex items-center justify-center">
                  <div className={`w-8 h-8 border-2 ${colors.border} rounded-full animate-spin`} />
                </div>
              )}
              <img
                src={card.image}
                srcSet={`${card.image} 1x, ${card.image.replace('150', '100')} 0.5x`}
                alt={card.title}
                className={`w-full h-20 sm:h-24 object-cover rounded-t-lg ${loadedImages.has(card.title) ? '' : 'hidden'}`}
                loading="lazy"
                decoding="async"
              />
              <h2 className={`text-center font-bold text-sm sm:text-base ${isDarkMode ? colors.primaryDark : colors.primaryLight} p-2 bg-transparent`}>
                {card.title}
              </h2>
              <Link to={card.route} onClick={card.title === "Unlock Skin" ? handleClearRole : undefined}>
                <button className={`w-full bg-transparent ${isDarkMode ? colors.primaryDark : colors.primaryLight} py-1.5 px-3 rounded-b-lg text-sm font-semibold border-t ${colors.border} hover:${isDarkMode ? colors.accentDark : colors.accentLight} transition-all duration-200`}>
                  View
                </button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default memo(Home);