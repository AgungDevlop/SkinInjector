const Banner: React.FC = () => {
  const bannerUrl = "https://www.mobilelegends.com"; // Replace with your desired URL

  return (
    <a href={bannerUrl} target="_blank" rel="noopener noreferrer">
      <div className="relative bg-gradient-to-r from-gray-900 via-blue-950 to-purple-950 border-2 border-blue-400 rounded-xl shadow-xl overflow-hidden mb-6 sm:mb-8 md:mb-10 transform transition-all duration-300 hover:shadow-[0_0_20px_rgba(59,130,246,0.7)] hover:scale-105">
        <div className="absolute inset-0 border-2 border-blue-400 opacity-30 rounded-xl animate-neon-pulse pointer-events-none"></div>
        <div className="relative z-10 p-4 sm:p-6 md:p-8 text-center">
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSVIYNo4f76H8-IkNCzc3rH-6rYWIU35eCkfg&s"
            alt="Banner"
            className="w-full h-32 sm:h-40 md:h-48 object-cover rounded-md mb-3 sm:mb-4"
            loading="lazy"
          />
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-blue-300 mb-2 sm:mb-3 tracking-tight drop-shadow-[0_1px_2px_rgba(59,130,246,0.8)]">
            Welcome to Skin Tools ML
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-300 max-w-2xl mx-auto">
            Klik banner ini untuk cara menggunakan Injector ML di Android 13/14/15
          </p>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-20 rounded-xl"></div>
      </div>
    </a>
  );
};

export default Banner;
