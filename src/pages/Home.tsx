import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

interface Card {
  title: string;
  image: string;
  route: string;
}

const Home: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [animateDoors, setAnimateDoors] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean[]>(new Array(6).fill(true));

  const cards: Card[] = [
    {
      title: "Unlock Skin",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbni:ANd9GcQULKxdP7uXsWMptLAosgCv47Zc3MAkSX4eZlhjfSjlch9DJ1r5MxvRA&s=10",
      route: "/unlock-skin",
    },
    {
      title: "Recall Animation",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbni:ANd9GcQwynRhGBYW_piueXA82dDlJmr9OjPq14M8SxQa9YvdloHdTGF25CTNqxI0&s=10",
      route: "/recall-animation",
    },
    {
      title: "Spawn Effect",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbni:ANd9GcQVFd58AqHDakOVhqxBg4OT1qxl16VJ8XiQ7A&usqp=CAU",
      route: "/spawn-effect",
    },
    {
      title: "Elimination Effect",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbni:ANd9GcR5xyhh1nGbhJuFdUCskmK_kXdOS-bWDdSsBA&usqp=CAU",
      route: "/elimination-effect",
    },
    {
      title: "Battle Emote",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbni:ANd9GcRI74xL8cMMjEpGD1B36wHjjW6VnLP56sAENQ&usqp=CAU",
      route: "/battle-emote",
    },
    {
      title: "Fix Bug",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbni:ANd9GcSA7l4R0DbVRJgaagYGVy_8iRllPIvE6GqeTA&usqp=CAU",
      route: "/fix-bug",
    },
  ];

  useEffect(() => {
    const startAnimation = setTimeout(() => {
      setAnimateDoors(true);
    }, 1000);

    const hideSplash = setTimeout(() => {
      setShowSplash(false);
    }, 1300);

    const loadingTimers = cards.map((_, index) =>
      setTimeout(() => {
        setIsLoading((prev) => {
          const newLoading = [...prev];
          newLoading[index] = false;
          return newLoading;
        });
      }, 3000)
    );

    return () => {
      clearTimeout(startAnimation);
      clearTimeout(hideSplash);
      loadingTimers.forEach(clearTimeout);
    };
  }, [cards]);

  return (
    <>
      <div className="relative bg-gray-900">
        {showSplash && (
          <div className="fixed inset-0 z-50 flex justify-center items-center bg-black animate-glitch overflow-hidden">
            <div className="absolute left-0 w-1/2 h-full overflow-hidden z-40">
              <div
                className={`w-full h-full bg-gradient-to-r from-gray-900 via-blue-950 to-purple-950 transition-transform duration-1200 ease-in-out animate-scanline ${
                  animateDoors ? "-translate-x-full" : "translate-x-0"
                }`}
              >
                <div className="absolute inset-0 border-r-4 border-blue-400 opacity-50 animate-neon-pulse"></div>
              </div>
            </div>
            <div className="absolute right-0 w-1/2 h-full overflow-hidden z-40">
              <div
                className={`w-full h-full bg-gradient-to-l from-gray-900 via-blue-950 to-purple-950 transition-transform duration-1200 ease-in-out animate-scanline ${
                  animateDoors ? "translate-x-full" : "translate-x-0"
                }`}
              >
                <div className="absolute inset-0 border-l-4 border-blue-400 opacity-50 animate-neon-pulse"></div>
              </div>
            </div>
            <div className="relative z-50 flex justify-center items-center">
              <img
                src="https://images.dwncdn.net/images/t_app-icon-l/p/99017561-4e15-42b5-9538-a6f4b1f0f1eb/259597479/skin-tools-ml-oti-logo"
                alt="Skin Tools ML Logo"
                className="w-40 h-40 rounded-full object-cover ring-4 ring-blue-400 bg-gray-900 p-1"
                loading="lazy"
              />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[168px] h-[168px] rounded-full border-2 border-blue-400 opacity-40 animate-spin-slow"></div>
            </div>
          </div>
        )}

        <div className="container mx-auto p-3 text-white">
          <h1 className="text-4xl font-extrabold text-blue-400 mb-8 tracking-tight text-center drop-shadow-[0_2px_4px_rgba(59,130,246,0.8)]">
            Skin Tools ML Features
          </h1>
          <div className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
            {cards.map((card, index) => (
              <div
                key={card.title}
                className="relative bg-gradient-to-br from-gray-900 via-blue-950 to-purple-950 border-2 border-blue-400 rounded-tl-none rounded-tr-2xl rounded-bl-2xl rounded-br-none shadow-2xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(59,130,246,0.7)] hover:animate-glitch"
              >
                <div className="absolute inset-0 border-2 border-blue-400 opacity-30 rounded-tl-none rounded-tr-2xl rounded-bl-2xl rounded-br-none animate-neon-pulse pointer-events-none"></div>
                <div className="relative z-10 p-3">
                  <div className="relative">
                    {isLoading[index] && (
                      <div className="w-full h-28 flex items-center justify-center bg-gray-800 rounded-lg">
                        <div className="w-8 h-8 relative animate-ios-spinner">
                          <div className="absolute inset-0 rounded-full border-t-2 border-gray-400 opacity-20"></div>
                          <div className="absolute inset-0 rounded-full border-t-2 border-gray-400 animate-spin"></div>
                        </div>
                      </div>
                    )}
                    {!isLoading[index] && (
                      <img
                        src={card.image}
                        alt={card.title}
                        className="w-full h-28 object-cover rounded-lg mb-4"
                        loading="lazy"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-30 rounded-lg"></div>
                  </div>
                  <h2 className="text-center font-extrabold text-blue-300 mb-4 tracking-tight drop-shadow-[0_1px_2px_rgba(59,130,246,0.8)]">
                    {card.title}
                  </h2>
                  <Link to={card.route}>
                    <button className="w-full bg-gradient-to-r from-gray-900 via-blue-950 to-purple-950 text-blue-300 py-1.5 px-3 rounded-xl text-sm font-semibold border border-blue-400 animate-neon-pulse hover:bg-gradient-to-r hover:from-blue-950 hover:via-purple-950 hover:to-gray-900 hover:shadow-[0_0_10px_rgba(59,130,246,0.8),0_0_20px_rgba(59,130,246,0.6),0_0_30px_rgba(59,130,246,0.4)] hover:scale-105 hover:animate-shake focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 transition-all duration-300">
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