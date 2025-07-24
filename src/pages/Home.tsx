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
      <div className="container mx-auto p-2 sm:p-4 relative">
        <Banner />
        <div
          className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fit,minmax(160px,1fr))] md:grid-cols-[repeat(auto-fit,minmax(200px,1fr))] lg:grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-2 sm:gap-3 md:gap-4"
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
              ${cards
                .map(
                  (_, i) => `
                .animate-delay-${i * 100} {
                  animation-delay: ${i * 0.1}s;
                }
              `
                )
                .join("")}
              .card-hover {
                transition: transform 0.2s ease-out;
              }
              @media (hover: hover) {
                .card-hover:hover {
                  transform: scale(1.05);
                }
              }
              @media (min-width: 640px) {
                .card-img {
                  height: 6rem;
                }
                .card-title {
                  font-size: 1rem;
                }
                .card-button {
                  padding: 0.5rem 1rem;
                  font-size: 0.9rem;
                }
              }
              @media (min-width: 768px) {
                .card-img {
                  height: 7rem;
                }
                .card-title {
                  font-size: 1.1rem;
                }
                .card-button {
                  padding: 0.6rem 1.2rem;
                  font-size: 1rem;
                }
              }
              @media (min-width: 1024px) {
                .card-img {
                  height: 8rem;
                }
                .card-title {
                  font-size: 1.2rem;
                }
                .card-button {
                  padding: 0.75rem 1.5rem;
                  font-size: 1.1rem;
                }
              }
              @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
                .card-img {
                  image-rendering: crisp-edges;
                }
                .card-title {
                  font-weight: 600;
                }
              }
            `}
          </style>
          {cards.map((card, index) => (
            <div
              key={card.title}
              className={`list-item bg-transparent border-2 ${colors.border} shadow-md overflow-hidden animate-fade-scroll animate-delay-${
                index * 100
              } card-hover`}
            >
              {!loadedImages.has(card.title) && (
                <div className="w-full h-20 sm:h-24 md:h-28 lg:h-32 bg-transparent rounded-t-lg flex items-center justify-center">
                  <div className={`w-8 h-8 border-2 ${colors.border} rounded-full animate-spin`} />
                </div>
              )}
              <img
                src={card.image}
                srcSet={`${card.image} 1x, ${card.image.replace("150", "100")} 0.5x, ${card.image.replace("150", "200")} 2x`}
                alt={card.title}
                className={`w-full h-20 sm:h-24 md:h-28 lg:h-32 object-cover rounded-t-lg card-img ${
                  loadedImages.has(card.title) ? "" : "hidden"
                }`}
                loading="lazy"
                decoding="async"
              />
              <h2
                className={`text-center font-bold text-sm sm:text-base ${isDarkMode ? colors.primaryDark : colors.primaryLight} p-2 bg-transparent card-title`}
              >
                {card.title}
              </h2>
              <Link to={card.route} onClick={card.title === "Unlock Skin" ? handleClearRole : undefined}>
                <button
                  className={`w-full bg-transparent ${
                    isDarkMode ? colors.primaryDark : colors.primaryLight
                  } py-1.5 px-3 rounded-b-lg font-semibold border-t ${colors.border} hover:${
                    isDarkMode ? colors.accentDark : colors.accentLight
                  } transition-all duration-200 card-button`}
                >
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
