import React, { useCallback, useContext } from 'react';
import Particles from 'react-tsparticles';
import { loadSlim } from 'tsparticles-slim';
import { ThemeContext } from './ThemeContext';
import { ThemeColors } from './ThemeColors';

const ParticlesBackground: React.FC = () => {
  const { isDarkMode, theme } = useContext(ThemeContext);
  const { particleColors } = ThemeColors(theme, isDarkMode);

  const particlesInit = useCallback(async (engine: any) => {
    await loadSlim(engine);
  }, []);

  const particlesLoaded = useCallback(async () => {}, []);

  const options = {
    background: {
      color: {
        value: isDarkMode ? particleColors.backgroundDark : particleColors.backgroundLight,
      },
    },
    fpsLimit: 60,
    interactivity: {
      events: {
        onClick: { enable: false },
        onHover: { enable: false },
        resize: true,
      },
      modes: {
        push: { quantity: 0 },
        grab: { distance: 0 },
      },
    },
    particles: {
      color: {
        value: isDarkMode ? particleColors.particleDark : particleColors.particleLight,
      },
      links: {
        color: isDarkMode ? particleColors.particleDark : particleColors.particleLight,
        distance: 120,
        enable: true,
        opacity: 0.3,
        width: 0.8,
      },
      move: {
        direction: 'none' as const,
        enable: true,
        outModes: {
          default: 'bounce' as const,
        },
        random: false,
        speed: 1,
        straight: false,
      },
      number: {
        density: {
          enable: true,
          area: 1000,
        },
        value: 40,
      },
      opacity: {
        value: 0.4,
      },
      shape: {
        type: 'circle',
      },
      size: {
        value: { min: 1, max: 4 },
      },
    },
    detectRetina: false,
  };

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      loaded={particlesLoaded}
      options={options}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
      }}
    />
  );
};

export default ParticlesBackground;