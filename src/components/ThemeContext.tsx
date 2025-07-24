import { createContext, useState, useEffect, ReactNode } from 'react';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  theme: 'cyberpurple' | 'neonblue' | 'electricpink' | 'cosmicteal' | 'solarorange' | 'lunargreen' | 'starred' | 'galacticgold' | 'quantumglow';
  setTheme: (theme: 'cyberpurple' | 'neonblue' | 'electricpink' | 'cosmicteal' | 'solarorange' | 'lunargreen' | 'starred' | 'galacticgold' | 'quantumglow') => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: true,
  toggleDarkMode: () => {},
  theme: 'cyberpurple',
  setTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const themes: ThemeContextType['theme'][] = [
    'cyberpurple',
    'neonblue',
    'electricpink',
    'cosmicteal',
    'solarorange',
    'lunargreen',
    'starred',
    'galacticgold',
    'quantumglow',
  ];

  const getRandomTheme = (): ThemeContextType['theme'] => themes[Math.floor(Math.random() * themes.length)];

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('darkMode');
      return saved !== null ? JSON.parse(saved) as boolean : true;
    } catch {
      return true;
    }
  });

  const [theme, setTheme] = useState<ThemeContextType['theme']>(() => {
    try {
      const saved = localStorage.getItem('theme');
      return saved && themes.includes(saved as ThemeContextType['theme'])
        ? saved as ThemeContextType['theme']
        : getRandomTheme();
    } catch {
      return 'cyberpurple';
    }
  });

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const saveTheme = () => {
      try {
        localStorage.setItem('theme', theme);
      } catch {
        console.warn('Failed to save theme to localStorage');
      }
    };
    timeoutId = setTimeout(saveTheme, 100);
    return () => clearTimeout(timeoutId);
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    } catch {
      console.warn('Failed to save darkMode to localStorage');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev: boolean) => !prev);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode, theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
