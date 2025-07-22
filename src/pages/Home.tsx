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

const Home: React.FC = memo(() => {
  const { isDarkMode, theme } = useContext(ThemeContext);
  const { colors } = ThemeColors(theme, isDarkMode);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const timeoutRefs = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const cards: Card[] = [
    { title: "Unlock Skin", image: "https://i.ibb.co/zh728dBT/Unlock-Skin.jpg", route: "view-hero" },
    { title: "Recall Animation", image: "https://i.ibb.co/FkDvrq3q/Recall.webp", route: "/recall-animation" },
    { title: "Spawn Effect", image: "https://i.ibb.co/Ps7FVtzZ/Spawn.jpg", route: "/spawn-effect" },
    { title: "Elimination Effect", image: "https://i.ibb.co/Rkhf6YRM/Elimination.jpg", route: "/elimination-effect" },
    { title: "Battle Emote", image: "https://i.ibb.co/MxN52LH6/Emote.jpg", route: "/battle-emote" },
    { title: "Fix Bug", image: "https://i.ibb.co/5xzdQn7R/fixed-bug.png", route: "custom://fixBug" },
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
      <div className="container mx-auto p-2 sm:p-3 relative">
        <Banner />
        <div className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fit,minmax(180px,1fr))] md:grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3" ref={(el) => {
          if (el) {
            const items = el.querySelectorAll('.animate-fade-scroll');
            const observer = new IntersectionObserver(
              (entries) => {
                entries.forEach((entry) => {
                  if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                  }
                });
              },
              { threshold: 0.2 }
            );
            items.forEach((item) => observer.observe(item));
            return () => items.forEach((item) => observer.unobserve(item));
          }
        }}>
          <style>
            {`
              @keyframes slide-in {
                0% { transform: translateX(-100%); opacity: 0; }
                100% { transform: translateX(0); opacity: 1; }
              }
              @keyframes fade-scroll {
                0% { transform: translateY(20px); opacity: 0; }
                100% { transform: translateY(0); opacity: 1; }
              }
              .animate-slide-in {
                animation: slide-in 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
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
              ${cards.map((_, i) => `
                .animate-delay-${i * 100} {
                  animation-delay: ${i * 0.1}s;
                }
              `).join('')}
              .card-hover {
                transition: transform 0.2s ease-out;
              }
              .card-hover:hover {
                transform: scale(1.05);
              }
            `}
          </style>
          {cards.map((card, index) => (
            <div
              key={card.title}
              className={`bg-transparent border-2 ${colors.border} rounded-lg shadow-md overflow-hidden animate-fade-scroll animate-delay-${index * 100} card-hover`}
            >
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
});

export default Home;
