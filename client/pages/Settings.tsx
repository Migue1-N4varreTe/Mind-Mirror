import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft,
  Palette,
  Zap,
  Brain,
  Shield,
  Volume2,
  VolumeX,
  Monitor,
  Smartphone,
  Settings as SettingsIcon,
  Gamepad2,
  Eye,
  Timer
} from "lucide-react";

interface GameSettings {
  difficulty: 'novice' | 'intermediate' | 'expert' | 'master' | 'quantum';
  theme: 'neon' | 'matrix' | 'cyberpunk' | 'retro' | 'minimal';
  soundEnabled: boolean;
  musicVolume: number;
  effectsVolume: number;
  visualEffects: boolean;
  animationSpeed: number;
  aiPersonality: 'adaptive' | 'aggressive' | 'defensive' | 'unpredictable';
  boardSize: '6x6' | '8x8' | '10x10';
  timeLimit: number; // seconds
  specialCellFrequency: number; // 0-100%
  comboMultiplier: number;
}

export default function Settings() {
  const [settings, setSettings] = useState<GameSettings>(() => {
    const saved = localStorage.getItem('mindmirror-settings');
    return saved ? JSON.parse(saved) : {
      difficulty: 'intermediate',
      theme: 'neon',
      soundEnabled: true,
      musicVolume: 70,
      effectsVolume: 85,
      visualEffects: true,
      animationSpeed: 100,
      aiPersonality: 'adaptive',
      boardSize: '8x8',
      timeLimit: 30,
      specialCellFrequency: 20,
      comboMultiplier: 2
    };
  });

  const updateSetting = <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('mindmirror-settings', JSON.stringify(newSettings));
  };

  const difficultyDescriptions = {
    novice: {
      name: 'Novato',
      description: 'IA básica, reacciones lentas, patrones simples',
      color: 'text-green-400 border-green-400',
      features: ['IA predictible', 'Tiempo extra', 'Más habilidades especiales']
    },
    intermediate: {
      name: 'Intermedio',
      description: 'IA estándar con aprendizaje básico',
      color: 'text-blue-400 border-blue-400',
      features: ['Aprendizaje básico', 'Personalidades simples', 'Combos habilitados']
    },
    expert: {
      name: 'Experto',
      description: 'IA avanzada con patrones complejos',
      color: 'text-purple-400 border-purple-400',
      features: ['Predicción avanzada', 'Personalidades múltiples', 'Contraataques']
    },
    master: {
      name: 'Maestro',
      description: 'IA casi perfecta, adaptación en tiempo real',
      color: 'text-orange-400 border-orange-400',
      features: ['Adaptación cuántica', 'Psicología avanzada', 'Trampas complejas']
    },
    quantum: {
      name: 'Cuántico',
      description: 'IA transcendente, múltiples estrategias simultáneas',
      color: 'text-neon-cyan border-neon-cyan',
      features: ['Superposición de estrategias', 'Predicción temporal', 'Imposible de vencer']
    }
  };

  const themes = {
    neon: {
      name: 'Neon Cyberpunk',
      description: 'Colores vibrantes estilo cyberpunk',
      preview: 'from-neon-cyan to-neon-purple'
    },
    matrix: {
      name: 'Matrix Digital',
      description: 'Verde fosforescente estilo Matrix',
      preview: 'from-green-400 to-emerald-600'
    },
    cyberpunk: {
      name: 'Cyberpunk 2077',
      description: 'Amarillo y rosa futurista',
      preview: 'from-yellow-400 to-pink-500'
    },
    retro: {
      name: 'Retro Wave',
      description: 'Estética años 80 synthwave',
      preview: 'from-purple-500 to-pink-500'
    },
    minimal: {
      name: 'Minimal Dark',
      description: 'Diseño limpio y minimalista',
      preview: 'from-gray-600 to-gray-800'
    }
  };

  const personalityDescriptions = {
    adaptive: 'Se adapta a tu estilo de juego',
    aggressive: 'Ataca constantemente y toma riesgos',
    defensive: 'Juega defensivamente y espera errores',
    unpredictable: 'Cambia de estrategia constantemente'
  };

  return (
    <div className="min-h-screen bg-background neural-grid p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </Link>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
              Configuración
            </h1>
          </div>
          
          <Button 
            onClick={() => {
              localStorage.removeItem('mindmirror-settings');
              window.location.reload();
            }}
            variant="outline" 
            size="sm"
          >
            Resetear
          </Button>
        </div>

        <div className="space-y-8">
          {/* Difficulty Settings */}
          <Card className="bg-card/30 backdrop-blur-sm border-neon-cyan/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-neon-cyan" />
                Dificultad de la IA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                {Object.entries(difficultyDescriptions).map(([key, diff]) => (
                  <motion.div
                    key={key}
                    whileHover={{ scale: 1.02 }}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      settings.difficulty === key 
                        ? `${diff.color} bg-current/10` 
                        : 'border-border hover:border-border/60'
                    }`}
                    onClick={() => updateSetting('difficulty', key as any)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold">{diff.name}</h3>
                      {settings.difficulty === key && (
                        <Badge variant="outline" className={diff.color}>
                          Seleccionado
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{diff.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {diff.features.map((feature, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Theme Settings */}
          <Card className="bg-card/30 backdrop-blur-sm border-neon-purple/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-neon-purple" />
                Tema Visual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(themes).map(([key, theme]) => (
                  <motion.div
                    key={key}
                    whileHover={{ scale: 1.02 }}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      settings.theme === key 
                        ? 'border-neon-purple bg-neon-purple/10' 
                        : 'border-border hover:border-border/60'
                    }`}
                    onClick={() => updateSetting('theme', key as any)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold">{theme.name}</h3>
                      {settings.theme === key && (
                        <Badge variant="outline" className="text-neon-purple border-neon-purple">
                          Activo
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{theme.description}</p>
                    <div className={`h-4 rounded bg-gradient-to-r ${theme.preview}`} />
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Game Settings */}
          <Card className="bg-card/30 backdrop-blur-sm border-neon-pink/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gamepad2 className="w-5 h-5 text-neon-pink" />
                Configuración de Juego
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Personalidad IA</label>
                    <Select value={settings.aiPersonality} onValueChange={(value) => updateSetting('aiPersonality', value as any)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(personalityDescriptions).map(([key, desc]) => (
                          <SelectItem key={key} value={key}>
                            <div>
                              <div className="font-medium">{key.charAt(0).toUpperCase() + key.slice(1)}</div>
                              <div className="text-xs text-muted-foreground">{desc}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Tamaño del Tablero</label>
                    <Select value={settings.boardSize} onValueChange={(value) => updateSetting('boardSize', value as any)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6x6">6x6 (Rápido)</SelectItem>
                        <SelectItem value="8x8">8x8 (Estándar)</SelectItem>
                        <SelectItem value="10x10">10x10 (Épico)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Tiempo por Turno</span>
                      <span className="text-neon-cyan">{settings.timeLimit}s</span>
                    </div>
                    <Slider
                      value={[settings.timeLimit]}
                      onValueChange={([value]) => updateSetting('timeLimit', value)}
                      min={10}
                      max={60}
                      step={5}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Frecuencia Celdas Especiales</span>
                      <span className="text-neon-purple">{settings.specialCellFrequency}%</span>
                    </div>
                    <Slider
                      value={[settings.specialCellFrequency]}
                      onValueChange={([value]) => updateSetting('specialCellFrequency', value)}
                      min={0}
                      max={50}
                      step={5}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Multiplicador de Combo</span>
                      <span className="text-neon-pink">x{settings.comboMultiplier}</span>
                    </div>
                    <Slider
                      value={[settings.comboMultiplier]}
                      onValueChange={([value]) => updateSetting('comboMultiplier', value)}
                      min={1}
                      max={5}
                      step={0.5}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Audio & Visual Settings */}
          <Card className="bg-card/30 backdrop-blur-sm border-neon-green/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-neon-green" />
                Audio y Visuales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Sonido Habilitado</span>
                    <Switch
                      checked={settings.soundEnabled}
                      onCheckedChange={(checked) => updateSetting('soundEnabled', checked)}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Volumen Música</span>
                      <span className="text-neon-cyan">{settings.musicVolume}%</span>
                    </div>
                    <Slider
                      value={[settings.musicVolume]}
                      onValueChange={([value]) => updateSetting('musicVolume', value)}
                      min={0}
                      max={100}
                      step={5}
                      className="w-full"
                      disabled={!settings.soundEnabled}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Volumen Efectos</span>
                      <span className="text-neon-purple">{settings.effectsVolume}%</span>
                    </div>
                    <Slider
                      value={[settings.effectsVolume]}
                      onValueChange={([value]) => updateSetting('effectsVolume', value)}
                      min={0}
                      max={100}
                      step={5}
                      className="w-full"
                      disabled={!settings.soundEnabled}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Efectos Visuales</span>
                    <Switch
                      checked={settings.visualEffects}
                      onCheckedChange={(checked) => updateSetting('visualEffects', checked)}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Velocidad de Animación</span>
                      <span className="text-neon-pink">{settings.animationSpeed}%</span>
                    </div>
                    <Slider
                      value={[settings.animationSpeed]}
                      onValueChange={([value]) => updateSetting('animationSpeed', value)}
                      min={25}
                      max={200}
                      step={25}
                      className="w-full"
                      disabled={!settings.visualEffects}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            <Link to="/game">
              <Button size="lg" className="bg-neon-cyan text-background hover:bg-neon-cyan/90">
                <Gamepad2 className="w-5 h-5 mr-2" />
                Jugar Ahora
              </Button>
            </Link>
            <Link to="/analytics">
              <Button variant="outline" size="lg" className="border-neon-purple text-neon-purple">
                <Eye className="w-5 h-5 mr-2" />
                Ver Estadísticas
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
