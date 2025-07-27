import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { 
  Palette, 
  Eye, 
  Save, 
  RotateCcw,
  Sparkles,
  Zap,
  Circle,
  Square,
  Triangle,
  Star
} from "lucide-react";

interface CustomTheme {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  particle_color: string;
  glow_intensity: number;
  animation_speed: number;
  border_radius: number;
  grid_opacity: number;
}

interface ParticleEffect {
  type: 'sparkles' | 'neurons' | 'quantum' | 'matrix' | 'minimal';
  intensity: number;
  color: string;
  speed: number;
}

export default function ThemeCustomizer() {
  const [customTheme, setCustomTheme] = useState<CustomTheme>({
    name: "Mi Tema Personalizado",
    primary: "#00f5ff",
    secondary: "#9d4edd", 
    accent: "#ff6b9d",
    background: "#0a0a0a",
    particle_color: "#00f5ff",
    glow_intensity: 80,
    animation_speed: 100,
    border_radius: 8,
    grid_opacity: 20
  });

  const [particleEffect, setParticleEffect] = useState<ParticleEffect>({
    type: 'sparkles',
    intensity: 50,
    color: '#00f5ff',
    speed: 100
  });

  const [savedThemes, setSavedThemes] = useState<CustomTheme[]>([
    {
      name: "Neon Dreams",
      primary: "#00f5ff",
      secondary: "#9d4edd",
      accent: "#ff6b9d",
      background: "#0a0a0a",
      particle_color: "#00f5ff",
      glow_intensity: 90,
      animation_speed: 120,
      border_radius: 12,
      grid_opacity: 30
    },
    {
      name: "Forest Mystic",
      primary: "#10b981",
      secondary: "#059669",
      accent: "#34d399",
      background: "#064e3b",
      particle_color: "#6ee7b7",
      glow_intensity: 60,
      animation_speed: 80,
      border_radius: 6,
      grid_opacity: 15
    }
  ]);

  const presetThemes = [
    { name: "Cyberpunk", colors: ["#00f5ff", "#9d4edd", "#ff6b9d"] },
    { name: "Matrix", colors: ["#10b981", "#059669", "#34d399"] },
    { name: "Sunset", colors: ["#f59e0b", "#ef4444", "#ec4899"] },
    { name: "Ocean", colors: ["#3b82f6", "#06b6d4", "#8b5cf6"] },
    { name: "Fire", colors: ["#ef4444", "#f97316", "#eab308"] },
    { name: "Ice", colors: ["#06b6d4", "#3b82f6", "#a855f7"] }
  ];

  const updateThemeProperty = (property: keyof CustomTheme, value: string | number) => {
    setCustomTheme(prev => ({ ...prev, [property]: value }));
    // Apply theme in real-time to CSS variables
    if (typeof value === 'string' && property.includes('color') || property === 'primary' || property === 'secondary' || property === 'accent') {
      document.documentElement.style.setProperty(`--${property.replace('_', '-')}`, value);
    }
  };

  const applyPreset = (preset: typeof presetThemes[0]) => {
    const newTheme = {
      ...customTheme,
      name: preset.name,
      primary: preset.colors[0],
      secondary: preset.colors[1],
      accent: preset.colors[2]
    };
    setCustomTheme(newTheme);
  };

  const saveTheme = () => {
    const newSavedThemes = [...savedThemes, { ...customTheme, name: customTheme.name || `Tema ${savedThemes.length + 1}` }];
    setSavedThemes(newSavedThemes);
    localStorage.setItem('mindmirror-custom-themes', JSON.stringify(newSavedThemes));
  };

  const loadTheme = (theme: CustomTheme) => {
    setCustomTheme(theme);
  };

  const getParticleIcon = (type: string) => {
    const icons = {
      sparkles: <Sparkles className="w-4 h-4" />,
      neurons: <Circle className="w-4 h-4" />,
      quantum: <Zap className="w-4 h-4" />,
      matrix: <Square className="w-4 h-4" />,
      minimal: <Triangle className="w-4 h-4" />
    };
    return icons[type as keyof typeof icons];
  };

  return (
    <div className="space-y-6">
      <Card className="bg-card/30 backdrop-blur-sm border-neon-cyan/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-neon-cyan" />
            Personalizador de Tema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="colors" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="colors">Colores</TabsTrigger>
              <TabsTrigger value="effects">Efectos</TabsTrigger>
              <TabsTrigger value="layout">Layout</TabsTrigger>
              <TabsTrigger value="presets">Presets</TabsTrigger>
            </TabsList>

            <TabsContent value="colors" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="theme-name">Nombre del Tema</Label>
                    <Input
                      id="theme-name"
                      value={customTheme.name}
                      onChange={(e) => updateThemeProperty('name', e.target.value)}
                      placeholder="Mi tema personalizado"
                    />
                  </div>

                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="primary-color">Color Primario</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          id="primary-color"
                          type="color"
                          value={customTheme.primary}
                          onChange={(e) => updateThemeProperty('primary', e.target.value)}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          value={customTheme.primary}
                          onChange={(e) => updateThemeProperty('primary', e.target.value)}
                          placeholder="#00f5ff"
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="secondary-color">Color Secundario</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          id="secondary-color"
                          type="color"
                          value={customTheme.secondary}
                          onChange={(e) => updateThemeProperty('secondary', e.target.value)}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          value={customTheme.secondary}
                          onChange={(e) => updateThemeProperty('secondary', e.target.value)}
                          placeholder="#9d4edd"
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="accent-color">Color de Acento</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          id="accent-color"
                          type="color"
                          value={customTheme.accent}
                          onChange={(e) => updateThemeProperty('accent', e.target.value)}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          value={customTheme.accent}
                          onChange={(e) => updateThemeProperty('accent', e.target.value)}
                          placeholder="#ff6b9d"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Live Preview */}
                <div className="space-y-4">
                  <Label>Vista Previa</Label>
                  <div 
                    className="p-4 rounded-lg border-2 relative overflow-hidden"
                    style={{
                      borderColor: customTheme.primary,
                      background: `linear-gradient(45deg, ${customTheme.background}, ${customTheme.secondary}20)`
                    }}
                  >
                    <div className="space-y-3">
                      <div 
                        className="h-6 rounded"
                        style={{ background: customTheme.primary }}
                      />
                      <div 
                        className="h-4 rounded w-3/4"
                        style={{ background: customTheme.secondary }}
                      />
                      <div 
                        className="h-4 rounded w-1/2"
                        style={{ background: customTheme.accent }}
                      />
                    </div>
                    
                    {/* Particle effect preview */}
                    <div className="absolute top-2 right-2">
                      <div 
                        className="w-3 h-3 rounded-full animate-pulse"
                        style={{ background: customTheme.particle_color }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="effects" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Intensidad del Brillo ({customTheme.glow_intensity}%)</Label>
                    <Slider
                      value={[customTheme.glow_intensity]}
                      onValueChange={([value]) => updateThemeProperty('glow_intensity', value)}
                      min={0}
                      max={200}
                      step={10}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Velocidad de Animación ({customTheme.animation_speed}%)</Label>
                    <Slider
                      value={[customTheme.animation_speed]}
                      onValueChange={([value]) => updateThemeProperty('animation_speed', value)}
                      min={25}
                      max={300}
                      step={25}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Opacidad de la Grilla ({customTheme.grid_opacity}%)</Label>
                    <Slider
                      value={[customTheme.grid_opacity]}
                      onValueChange={([value]) => updateThemeProperty('grid_opacity', value)}
                      min={0}
                      max={100}
                      step={5}
                      className="mt-2"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Tipo de Partículas</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {['sparkles', 'neurons', 'quantum', 'matrix', 'minimal'].map(type => (
                        <Button
                          key={type}
                          variant={particleEffect.type === type ? "default" : "outline"}
                          size="sm"
                          onClick={() => setParticleEffect(prev => ({ ...prev, type: type as any }))}
                          className="flex items-center gap-1"
                        >
                          {getParticleIcon(type)}
                          <span className="capitalize text-xs">{type}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="particle-color">Color de Partículas</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="particle-color"
                        type="color"
                        value={customTheme.particle_color}
                        onChange={(e) => updateThemeProperty('particle_color', e.target.value)}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={customTheme.particle_color}
                        onChange={(e) => updateThemeProperty('particle_color', e.target.value)}
                        placeholder="#00f5ff"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="layout" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label>Radio de Bordes ({customTheme.border_radius}px)</Label>
                  <Slider
                    value={[customTheme.border_radius]}
                    onValueChange={([value]) => updateThemeProperty('border_radius', value)}
                    min={0}
                    max={24}
                    step={2}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="background-color">Color de Fondo</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="background-color"
                      type="color"
                      value={customTheme.background}
                      onChange={(e) => updateThemeProperty('background', e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={customTheme.background}
                      onChange={(e) => updateThemeProperty('background', e.target.value)}
                      placeholder="#0a0a0a"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="presets" className="space-y-6">
              <div>
                <Label className="text-base font-semibold">Temas Predefinidos</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                  {presetThemes.map((preset) => (
                    <motion.div
                      key={preset.name}
                      whileHover={{ scale: 1.02 }}
                      className="p-3 rounded-lg border border-border cursor-pointer hover:border-border/60"
                      onClick={() => applyPreset(preset)}
                    >
                      <div className="flex gap-2 mb-2">
                        {preset.colors.map((color, index) => (
                          <div
                            key={index}
                            className="w-4 h-4 rounded"
                            style={{ background: color }}
                          />
                        ))}
                      </div>
                      <div className="text-sm font-medium">{preset.name}</div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-base font-semibold">Temas Guardados</Label>
                <div className="grid gap-3 mt-3">
                  {savedThemes.map((theme, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg border border-border"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex gap-1">
                          <div className="w-3 h-3 rounded" style={{ background: theme.primary }} />
                          <div className="w-3 h-3 rounded" style={{ background: theme.secondary }} />
                          <div className="w-3 h-3 rounded" style={{ background: theme.accent }} />
                        </div>
                        <span className="text-sm font-medium">{theme.name}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => loadTheme(theme)}
                      >
                        Cargar
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6 pt-4 border-t border-border">
            <Button onClick={saveTheme} className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              Guardar Tema
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Resetear
            </Button>
            <Button variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              Vista Previa
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
