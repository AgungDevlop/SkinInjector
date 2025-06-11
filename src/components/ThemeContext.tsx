import React, { createContext, useState, ReactNode } from 'react';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  theme: 'cyberpurple' | 'neonblue' | 'electricpink' | 'cosmicteal';
  setTheme: (theme: 'cyberpurple' | 'neonblue' | 'electricpink' | 'cosmicteal') => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: true,
  toggleDarkMode: () => {},
  theme: 'cyberpurple',
  setTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [theme, setTheme] = useState<'cyberpurple' | 'neonblue' | 'electricpink' | 'cosmicteal'>('cyberpurple');

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode, theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};