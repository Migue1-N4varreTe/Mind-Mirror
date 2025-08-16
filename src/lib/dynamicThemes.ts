// Motor de temas dinámicos para Mind Mirror

export interface ThemeConfig {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
  };
  mood: 'calm' | 'energetic' | 'focused' | 'creative' | 'mystical';
  effects: {
    glow: boolean;
    particles: boolean;
    blur: boolean;
    gradients: boolean;
  };
}

export const THEMES: Record<string, ThemeConfig> = {
  NEURAL_CALM: {
    id: 'NEURAL_CALM',
    name: 'Calma Neural',
    colors: {
      primary: '#87CEEB',
      secondary: '#4682B4',
      accent: '#B0E0E6',
      background: '#0A0E1A',
      surface: '#1A1F2E',
      text: '#E8F4F8'
    },
    mood: 'calm',
    effects: {
      glow: true,
      particles: false,
      blur: true,
      gradients: true
    }
  },
  QUANTUM_ENERGY: {
    id: 'QUANTUM_ENERGY',
    name: 'Energía Cuántica',
    colors: {
      primary: '#FF6B35',
      secondary: '#F7931E',
      accent: '#FFD23F',
      background: '#1A0A0F',
      surface: '#2E1A1F',
      text: '#FFF8E8'
    },
    mood: 'energetic',
    effects: {
      glow: true,
      particles: true,
      blur: false,
      gradients: true
    }
  },
  MYSTIC_PURPLE: {
    id: 'MYSTIC_PURPLE',
    name: 'Púrpura Místico',
    colors: {
      primary: '#9370DB',
      secondary: '#663399',
      accent: '#DDA0DD',
      background: '#0F0A1A',
      surface: '#1F1A2E',
      text: '#F8E8FF'
    },
    mood: 'mystical',
    effects: {
      glow: true,
      particles: true,
      blur: true,
      gradients: true
    }
  },
  FOCUS_GREEN: {
    id: 'FOCUS_GREEN',
    name: 'Verde Enfoque',
    colors: {
      primary: '#00FF7F',
      secondary: '#32CD32',
      accent: '#98FB98',
      background: '#0A1A0F',
      surface: '#1A2E1F',
      text: '#E8FFF0'
    },
    mood: 'focused',
    effects: {
      glow: false,
      particles: false,
      blur: false,
      gradients: false
    }
  },
  CREATIVE_RAINBOW: {
    id: 'CREATIVE_RAINBOW',
    name: 'Arcoíris Creativo',
    colors: {
      primary: '#FF69B4',
      secondary: '#00CED1',
      accent: '#FFD700',
      background: '#1A1A1A',
      surface: '#2E2E2E',
      text: '#FFFFFF'
    },
    mood: 'creative',
    effects: {
      glow: true,
      particles: true,
      blur: false,
      gradients: true
    }
  }
};

export class DynamicThemeEngine {
  private currentTheme: ThemeConfig;
  private transitionDuration: number = 1000; // ms
  private moodHistory: Array<{ mood: string; timestamp: number }> = [];

  constructor(initialTheme: string = 'NEURAL_CALM') {
    this.currentTheme = THEMES[initialTheme] || THEMES.NEURAL_CALM;
    this.applyTheme(this.currentTheme);
  }

  setTheme(themeId: string): void {
    const theme = THEMES[themeId];
    if (!theme) {
      console.warn(`Theme ${themeId} not found`);
      return;
    }

    this.transitionToTheme(theme);
  }

  setThemeByMood(mood: ThemeConfig['mood']): void {
    const availableThemes = Object.values(THEMES).filter(theme => theme.mood === mood);
    if (availableThemes.length === 0) {
      console.warn(`No themes found for mood: ${mood}`);
      return;
    }

    const randomTheme = availableThemes[Math.floor(Math.random() * availableThemes.length)];
    this.transitionToTheme(randomTheme);
  }

  adaptThemeToEmotion(emotion: string, intensity: number): void {
    this.recordMood(emotion);
    
    let targetMood: ThemeConfig['mood'] = 'calm';

    switch (emotion.toLowerCase()) {
      case 'alegría':
      case 'felicidad':
      case 'euforia':
        targetMood = intensity > 0.7 ? 'energetic' : 'creative';
        break;
      case 'calma':
      case 'paz':
      case 'serenidad':
        targetMood = 'calm';
        break;
      case 'concentración':
      case 'enfoque':
      case 'determinación':
        targetMood = 'focused';
        break;
      case 'creatividad':
      case 'inspiración':
      case 'imaginación':
        targetMood = 'creative';
        break;
      case 'misterio':
      case 'introspección':
      case 'reflexión':
        targetMood = 'mystical';
        break;
      default:
        // Mantener tema actual para emociones no mapeadas
        return;
    }

    this.setThemeByMood(targetMood);
  }

  getCurrentTheme(): ThemeConfig {
    return { ...this.currentTheme };
  }

  getAvailableThemes(): ThemeConfig[] {
    return Object.values(THEMES);
  }

  private transitionToTheme(newTheme: ThemeConfig): void {
    if (newTheme.id === this.currentTheme.id) return;

    // Aplicar transición suave
    this.animateThemeTransition(this.currentTheme, newTheme);
    this.currentTheme = newTheme;
  }

  private applyTheme(theme: ThemeConfig): void {
    const root = document.documentElement;
    
    // Aplicar variables CSS
    root.style.setProperty('--theme-primary', theme.colors.primary);
    root.style.setProperty('--theme-secondary', theme.colors.secondary);
    root.style.setProperty('--theme-accent', theme.colors.accent);
    root.style.setProperty('--theme-background', theme.colors.background);
    root.style.setProperty('--theme-surface', theme.colors.surface);
    root.style.setProperty('--theme-text', theme.colors.text);

    // Aplicar efectos
    root.style.setProperty('--theme-glow', theme.effects.glow ? '1' : '0');
    root.style.setProperty('--theme-particles', theme.effects.particles ? '1' : '0');
    root.style.setProperty('--theme-blur', theme.effects.blur ? '1' : '0');
    root.style.setProperty('--theme-gradients', theme.effects.gradients ? '1' : '0');

    // Aplicar clase de tema al body
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    document.body.classList.add(`theme-${theme.id.toLowerCase()}`);
  }

  private animateThemeTransition(fromTheme: ThemeConfig, toTheme: ThemeConfig): void {
    // Crear overlay para transición suave
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(45deg, ${fromTheme.colors.primary}, ${toTheme.colors.primary});
      opacity: 0;
      transition: opacity ${this.transitionDuration}ms ease-in-out;
      pointer-events: none;
      z-index: 9999;
    `;

    document.body.appendChild(overlay);

    // Iniciar transición
    requestAnimationFrame(() => {
      overlay.style.opacity = '0.3';
      
      setTimeout(() => {
        this.applyTheme(toTheme);
        
        setTimeout(() => {
          overlay.style.opacity = '0';
          setTimeout(() => {
            document.body.removeChild(overlay);
          }, this.transitionDuration);
        }, this.transitionDuration / 2);
      }, this.transitionDuration / 2);
    });
  }

  private recordMood(mood: string): void {
    this.moodHistory.push({
      mood,
      timestamp: Date.now()
    });

    // Limitar historial a las últimas 20 entradas
    if (this.moodHistory.length > 20) {
      this.moodHistory.shift();
    }
  }

  getMoodAnalytics() {
    if (this.moodHistory.length === 0) return null;

    const recentMoods = this.moodHistory.slice(-10);
    const moodCounts = new Map<string, number>();
    
    recentMoods.forEach(entry => {
      moodCounts.set(entry.mood, (moodCounts.get(entry.mood) || 0) + 1);
    });

    let dominantMood = '';
    let maxCount = 0;
    moodCounts.forEach((count, mood) => {
      if (count > maxCount) {
        maxCount = count;
        dominantMood = mood;
      }
    });

    return {
      dominantMood,
      moodFrequency: Object.fromEntries(moodCounts),
      totalEntries: this.moodHistory.length,
      recentTrend: recentMoods.map(entry => entry.mood)
    };
  }

  reset(): void {
    this.moodHistory = [];
    this.setTheme('NEURAL_CALM');
  }
}

export default DynamicThemeEngine;
