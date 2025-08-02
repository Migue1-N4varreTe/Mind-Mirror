export interface EmotionalState {
  primary: 'calm' | 'excited' | 'frustrated' | 'confident' | 'focused' | 'stressed';
  intensity: number; // 0-1
  stability: number; // 0-1, how consistent the emotion is
  timestamp: number;
}

export interface DynamicTheme {
  id: string;
  name: string;
  emotionalTrigger: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    muted: string;
  };
  effects: {
    particles: boolean;
    animations: 'subtle' | 'moderate' | 'intense';
    blur: number;
    glow: boolean;
    shadows: boolean;
  };
  typography: {
    fontWeight: 'light' | 'normal' | 'medium' | 'bold';
    letterSpacing: number;
    lineHeight: number;
  };
  layout: {
    borderRadius: number;
    spacing: number;
    transition: number; // ms
  };
}

export class DynamicThemeEngine {
  private currentTheme: DynamicTheme;
  private emotionalHistory: EmotionalState[] = [];
  private themes: Map<string, DynamicTheme> = new Map();
  private transitionCallbacks: Array<(theme: DynamicTheme) => void> = [];

  constructor() {
    this.initializeThemes();
    this.currentTheme = this.themes.get('calm')!;
  }

  private initializeThemes(): void {
    // Calm Theme - Default state
    this.themes.set('calm', {
      id: 'calm',
      name: 'Serenidad',
      emotionalTrigger: 'calm',
      colors: {
        primary: '#0ea5e9', // sky-500
        secondary: '#06b6d4', // cyan-500
        accent: '#10b981', // emerald-500
        background: '#0f172a', // slate-900
        surface: '#1e293b', // slate-800
        text: '#f8fafc', // slate-50
        muted: '#64748b' // slate-500
      },
      effects: {
        particles: false,
        animations: 'subtle',
        blur: 0,
        glow: false,
        shadows: true
      },
      typography: {
        fontWeight: 'normal',
        letterSpacing: 0,
        lineHeight: 1.5
      },
      layout: {
        borderRadius: 8,
        spacing: 16,
        transition: 300
      }
    });

    // Excited Theme - High energy, positive
    this.themes.set('excited', {
      id: 'excited',
      name: 'Euforia',
      emotionalTrigger: 'excited',
      colors: {
        primary: '#f59e0b', // amber-500
        secondary: '#f97316', // orange-500
        accent: '#eab308', // yellow-500
        background: '#1c1917', // stone-900
        surface: '#292524', // stone-800
        text: '#fbbf24', // amber-400
        muted: '#a3a3a3' // neutral-400
      },
      effects: {
        particles: true,
        animations: 'intense',
        blur: 2,
        glow: true,
        shadows: true
      },
      typography: {
        fontWeight: 'bold',
        letterSpacing: 0.5,
        lineHeight: 1.4
      },
      layout: {
        borderRadius: 12,
        spacing: 20,
        transition: 150
      }
    });

    // Frustrated Theme - Tension, stress
    this.themes.set('frustrated', {
      id: 'frustrated',
      name: 'Tensión',
      emotionalTrigger: 'frustrated',
      colors: {
        primary: '#dc2626', // red-600
        secondary: '#b91c1c', // red-700
        accent: '#f97316', // orange-500
        background: '#1f1f1f', // neutral-800
        surface: '#2d2d2d', // neutral-700
        text: '#fca5a5', // red-300
        muted: '#737373' // neutral-500
      },
      effects: {
        particles: true,
        animations: 'intense',
        blur: 1,
        glow: true,
        shadows: false
      },
      typography: {
        fontWeight: 'medium',
        letterSpacing: 0.3,
        lineHeight: 1.3
      },
      layout: {
        borderRadius: 4,
        spacing: 12,
        transition: 100
      }
    });

    // Confident Theme - Bold, assertive
    this.themes.set('confident', {
      id: 'confident',
      name: 'Dominio',
      emotionalTrigger: 'confident',
      colors: {
        primary: '#7c3aed', // violet-600
        secondary: '#a855f7', // purple-500
        accent: '#ec4899', // pink-500
        background: '#0c0a09', // stone-950
        surface: '#1c1917', // stone-900
        text: '#e879f9', // fuchsia-400
        muted: '#8b5cf6' // violet-400
      },
      effects: {
        particles: false,
        animations: 'moderate',
        blur: 0,
        glow: true,
        shadows: true
      },
      typography: {
        fontWeight: 'bold',
        letterSpacing: 1,
        lineHeight: 1.6
      },
      layout: {
        borderRadius: 16,
        spacing: 24,
        transition: 400
      }
    });

    // Focused Theme - Concentration, flow state
    this.themes.set('focused', {
      id: 'focused',
      name: 'Flujo',
      emotionalTrigger: 'focused',
      colors: {
        primary: '#0891b2', // cyan-600
        secondary: '#0e7490', // cyan-700
        accent: '#06b6d4', // cyan-500
        background: '#001122', // dark blue
        surface: '#002244', // slightly lighter
        text: '#67e8f9', // cyan-300
        muted: '#155e75' // cyan-800
      },
      effects: {
        particles: false,
        animations: 'subtle',
        blur: 0,
        glow: false,
        shadows: false
      },
      typography: {
        fontWeight: 'light',
        letterSpacing: -0.5,
        lineHeight: 1.8
      },
      layout: {
        borderRadius: 20,
        spacing: 32,
        transition: 800
      }
    });

    // Stressed Theme - Pressure, urgency
    this.themes.set('stressed', {
      id: 'stressed',
      name: 'Presión',
      emotionalTrigger: 'stressed',
      colors: {
        primary: '#e11d48', // rose-600
        secondary: '#be123c', // rose-700
        accent: '#f43f5e', // rose-500
        background: '#1a0a0a', // very dark red
        surface: '#2a1515', // dark red
        text: '#fda4af', // rose-300
        muted: '#881337' // rose-900
      },
      effects: {
        particles: true,
        animations: 'intense',
        blur: 3,
        glow: false,
        shadows: false
      },
      typography: {
        fontWeight: 'medium',
        letterSpacing: 0.8,
        lineHeight: 1.2
      },
      layout: {
        borderRadius: 2,
        spacing: 8,
        transition: 50
      }
    });
  }

  updateEmotionalState(emotionalData: {
    reactionTime: number;
    confidence: number;
    consecutiveErrors?: number;
    consecutiveSuccesses?: number;
    patternComplexity?: number;
  }): void {
    const newState = this.analyzeEmotionalState(emotionalData);
    
    this.emotionalHistory.push(newState);
    
    // Keep only last 20 states
    if (this.emotionalHistory.length > 20) {
      this.emotionalHistory.shift();
    }

    // Check if theme should change
    this.evaluateThemeChange();
  }

  private analyzeEmotionalState(data: {
    reactionTime: number;
    confidence: number;
    consecutiveErrors?: number;
    consecutiveSuccesses?: number;
    patternComplexity?: number;
  }): EmotionalState {
    let primary: EmotionalState['primary'] = 'calm';
    let intensity = 0.5;

    // Analyze reaction time
    if (data.reactionTime < 1000) {
      if (data.confidence > 0.8) {
        primary = 'excited';
        intensity = 0.8;
      } else {
        primary = 'stressed';
        intensity = 0.7;
      }
    } else if (data.reactionTime > 4000) {
      if (data.confidence > 0.6) {
        primary = 'focused';
        intensity = 0.6;
      } else {
        primary = 'frustrated';
        intensity = 0.5;
      }
    }

    // Analyze confidence
    if (data.confidence > 0.8) {
      primary = 'confident';
      intensity = Math.min(1, intensity + 0.3);
    } else if (data.confidence < 0.3) {
      primary = 'frustrated';
      intensity = Math.min(1, intensity + 0.4);
    }

    // Analyze consecutive patterns
    if (data.consecutiveErrors && data.consecutiveErrors >= 3) {
      primary = 'frustrated';
      intensity = Math.min(1, 0.8 + (data.consecutiveErrors - 3) * 0.1);
    }

    if (data.consecutiveSuccesses && data.consecutiveSuccesses >= 3) {
      primary = 'confident';
      intensity = Math.min(1, 0.7 + (data.consecutiveSuccesses - 3) * 0.1);
    }

    // Calculate stability based on recent history
    const recentEmotions = this.emotionalHistory.slice(-5);
    const stability = this.calculateEmotionalStability(recentEmotions);

    return {
      primary,
      intensity,
      stability,
      timestamp: Date.now()
    };
  }

  private calculateEmotionalStability(recentStates: EmotionalState[]): number {
    if (recentStates.length < 2) return 1;

    let changes = 0;
    for (let i = 1; i < recentStates.length; i++) {
      if (recentStates[i].primary !== recentStates[i - 1].primary) {
        changes++;
      }
    }

    return Math.max(0, 1 - (changes / (recentStates.length - 1)));
  }

  private evaluateThemeChange(): void {
    const currentState = this.emotionalHistory[this.emotionalHistory.length - 1];
    if (!currentState) return;

    // Get dominant emotion from recent history
    const recentStates = this.emotionalHistory.slice(-5);
    const emotionCounts = recentStates.reduce((acc, state) => {
      acc[state.primary] = (acc[state.primary] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const dominantEmotion = Object.keys(emotionCounts).reduce((a, b) => 
      emotionCounts[a] > emotionCounts[b] ? a : b
    );

    // Check if we should change theme
    const shouldChangeTheme = 
      this.currentTheme.emotionalTrigger !== dominantEmotion &&
      currentState.intensity > 0.6 &&
      currentState.stability > 0.4;

    if (shouldChangeTheme) {
      this.changeTheme(dominantEmotion);
    }
  }

  private changeTheme(emotionalTrigger: string): void {
    const newTheme = this.themes.get(emotionalTrigger);
    if (newTheme && newTheme.id !== this.currentTheme.id) {
      const oldTheme = this.currentTheme;
      this.currentTheme = newTheme;
      
      // Notify all callbacks
      this.transitionCallbacks.forEach(callback => callback(newTheme));
      
      console.log(`🎨 Tema cambiado: ${oldTheme.name} → ${newTheme.name}`);
    }
  }

  getCurrentTheme(): DynamicTheme {
    return this.currentTheme;
  }

  getThemeCSS(): string {
    const theme = this.currentTheme;
    
    return `
      :root {
        --theme-primary: ${theme.colors.primary};
        --theme-secondary: ${theme.colors.secondary};
        --theme-accent: ${theme.colors.accent};
        --theme-background: ${theme.colors.background};
        --theme-surface: ${theme.colors.surface};
        --theme-text: ${theme.colors.text};
        --theme-muted: ${theme.colors.muted};
        
        --theme-border-radius: ${theme.layout.borderRadius}px;
        --theme-spacing: ${theme.layout.spacing}px;
        --theme-transition: ${theme.layout.transition}ms;
        
        --theme-font-weight: ${theme.typography.fontWeight};
        --theme-letter-spacing: ${theme.typography.letterSpacing}px;
        --theme-line-height: ${theme.typography.lineHeight};
        
        --theme-blur: ${theme.effects.blur}px;
        --theme-glow: ${theme.effects.glow ? '0 0 20px var(--theme-accent)' : 'none'};
        --theme-shadow: ${theme.effects.shadows ? '0 4px 20px rgba(0,0,0,0.3)' : 'none'};
      }
      
      .dynamic-theme {
        background: var(--theme-background);
        color: var(--theme-text);
        transition: all var(--theme-transition)ms ease;
        font-weight: var(--theme-font-weight);
        letter-spacing: var(--theme-letter-spacing);
        line-height: var(--theme-line-height);
      }
      
      .dynamic-surface {
        background: var(--theme-surface);
        border-radius: var(--theme-border-radius);
        box-shadow: var(--theme-shadow);
        transition: all var(--theme-transition)ms ease;
      }
      
      .dynamic-primary {
        color: var(--theme-primary);
        text-shadow: var(--theme-glow);
      }
      
      .dynamic-accent {
        color: var(--theme-accent);
        text-shadow: var(--theme-glow);
      }
      
      .dynamic-blur {
        backdrop-filter: blur(var(--theme-blur));
      }
      
      .dynamic-button {
        background: var(--theme-primary);
        color: var(--theme-background);
        border-radius: var(--theme-border-radius);
        padding: var(--theme-spacing);
        transition: all var(--theme-transition)ms ease;
        box-shadow: var(--theme-shadow);
        font-weight: var(--theme-font-weight);
      }
      
      .dynamic-button:hover {
        background: var(--theme-accent);
        box-shadow: var(--theme-glow);
        transform: translateY(-2px);
      }
      
      .dynamic-card {
        background: var(--theme-surface);
        border: 1px solid var(--theme-primary);
        border-radius: var(--theme-border-radius);
        padding: calc(var(--theme-spacing) * 1.5);
        box-shadow: var(--theme-shadow);
        transition: all var(--theme-transition)ms ease;
      }
      
      .dynamic-card:hover {
        border-color: var(--theme-accent);
        box-shadow: var(--theme-glow);
      }
    `;
  }

  getParticleConfig(): any {
    const theme = this.currentTheme;
    
    if (!theme.effects.particles) return null;

    return {
      particles: {
        number: {
          value: theme.id === 'excited' ? 50 : theme.id === 'stressed' ? 30 : 20,
        },
        color: {
          value: theme.colors.accent,
        },
        shape: {
          type: theme.id === 'frustrated' ? 'triangle' : 'circle',
        },
        opacity: {
          value: 0.1 + (this.emotionalHistory[this.emotionalHistory.length - 1]?.intensity || 0.5) * 0.4,
          random: true,
        },
        size: {
          value: theme.id === 'excited' ? 8 : 4,
          random: true,
        },
        move: {
          enable: true,
          speed: theme.effects.animations === 'intense' ? 3 : 1,
          direction: 'none',
          random: true,
          out_mode: 'out',
        },
      },
      interactivity: {
        detect_on: 'canvas',
        events: {
          onhover: {
            enable: true,
            mode: 'repulse',
          },
          onclick: {
            enable: true,
            mode: 'push',
          },
        },
      },
    };
  }

  onThemeChange(callback: (theme: DynamicTheme) => void): void {
    this.transitionCallbacks.push(callback);
  }

  forceTheme(themeId: string): boolean {
    const theme = this.themes.get(themeId);
    if (theme) {
      this.currentTheme = theme;
      this.transitionCallbacks.forEach(callback => callback(theme));
      return true;
    }
    return false;
  }

  getAvailableThemes(): DynamicTheme[] {
    return Array.from(this.themes.values());
  }

  getEmotionalAnalysis(): any {
    const recentStates = this.emotionalHistory.slice(-10);
    
    if (recentStates.length === 0) {
      return {
        dominantEmotion: 'calm',
        averageIntensity: 0.5,
        stability: 1,
        trends: {}
      };
    }

    const emotionCounts = recentStates.reduce((acc, state) => {
      acc[state.primary] = (acc[state.primary] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const dominantEmotion = Object.keys(emotionCounts).reduce((a, b) => 
      emotionCounts[a] > emotionCounts[b] ? a : b
    );

    const averageIntensity = recentStates.reduce((sum, state) => sum + state.intensity, 0) / recentStates.length;
    const averageStability = recentStates.reduce((sum, state) => sum + state.stability, 0) / recentStates.length;

    return {
      dominantEmotion,
      averageIntensity,
      stability: averageStability,
      emotionDistribution: emotionCounts,
      recentTrend: this.getEmotionalTrend(),
      currentTheme: this.currentTheme.name
    };
  }

  private getEmotionalTrend(): string {
    if (this.emotionalHistory.length < 5) return 'stable';

    const recent = this.emotionalHistory.slice(-5);
    const intensities = recent.map(s => s.intensity);
    
    let increasing = 0;
    let decreasing = 0;
    
    for (let i = 1; i < intensities.length; i++) {
      if (intensities[i] > intensities[i - 1]) increasing++;
      else if (intensities[i] < intensities[i - 1]) decreasing++;
    }

    if (increasing > decreasing + 1) return 'escalating';
    if (decreasing > increasing + 1) return 'calming';
    return 'stable';
  }

  exportThemeData(): any {
    return {
      currentTheme: this.currentTheme,
      emotionalHistory: this.emotionalHistory.slice(-20),
      analysis: this.getEmotionalAnalysis(),
      themeCSS: this.getThemeCSS(),
      timestamp: Date.now()
    };
  }
}
