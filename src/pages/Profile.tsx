import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  Crown, 
  Edit3, 
  Camera,
  Star,
  Zap,
  Brain,
  Target,
  Trophy,
  Award,
  ArrowLeft,
  Sparkles,
  Eye,
  Shield,
  Calendar,
  TrendingUp,
  Users,
  Heart,
  Flame,
  Gamepad2,
  Settings
} from "lucide-react";

interface UserProfile {
  username: string;
  displayName: string;
  bio: string;
  avatar: string;
  level: number;
  xp: number;
  nextLevelXp: number;
  titles: string[];
  activeTitle: string;
  joinDate: string;
  favoriteAiPersonality: string;
  playStyle: 'aggressive' | 'defensive' | 'balanced' | 'unpredictable';
  publicProfile: boolean;
  showStats: boolean;
  preferredTheme: string;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  category: 'gameplay' | 'social' | 'special' | 'hidden' | 'seasonal';
  unlocked: boolean;
  unlockedDate?: string;
  progress: number;
  maxProgress: number;
  reward?: string;
  secret: boolean;
}

interface PlayerDNA {
  aggression: number;    // 0-100
  patience: number;      // 0-100
  creativity: number;    // 0-100
  adaptability: number;  // 0-100
  risk_tolerance: number; // 0-100
  pattern_complexity: number; // 0-100
}

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('mindmirror-profile');
    return saved ? JSON.parse(saved) : {
      username: "Player_001",
      displayName: "Maestro Cuántico",
      bio: "Domino las fases de evolución de la IA. Mi especialidad es predecir lo impredecible.",
      avatar: "quantum",
      level: 12,
      xp: 2847,
      nextLevelXp: 3200,
      titles: ["Novato", "Estratega", "Espejo Perfecto", "Maestro Cuántico", "Susurrador de IA"],
      activeTitle: "Maestro Cuántico",
      joinDate: "2024-01-10",
      favoriteAiPersonality: "Camaleón",
      playStyle: "unpredictable",
      publicProfile: true,
      showStats: true,
      preferredTheme: "neon"
    };
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(profile);

  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: 'first-win',
      name: 'Primera Victoria',
      description: 'Consigue tu primera victoria contra la IA',
      icon: 'trophy',
      rarity: 'common',
      category: 'gameplay',
      unlocked: true,
      unlockedDate: '2024-01-10',
      progress: 1,
      maxProgress: 1,
      reward: 'Título: Novato',
      secret: false
    },
    {
      id: 'quantum-master',
      name: 'Maestro Cuántico',
      description: 'Alcanza la fase Evolución 10 veces consecutivas',
      icon: 'atom',
      rarity: 'legendary',
      category: 'gameplay',
      unlocked: true,
      unlockedDate: '2024-01-15',
      progress: 10,
      maxProgress: 10,
      reward: 'Título: Maestro Cuántico + Avatar Cuántico',
      secret: false
    },
    {
      id: 'ai-whisperer',
      name: 'Susurrador de IA',
      description: 'Haz que la IA cambie de personalidad 50 veces',
      icon: 'brain',
      rarity: 'epic',
      category: 'special',
      unlocked: true,
      unlockedDate: '2024-01-18',
      progress: 50,
      maxProgress: 50,
      reward: 'Acceso: Modo IA Personalizada',
      secret: false
    },
    {
      id: 'speedster',
      name: 'Rayo Cuántico',
      description: 'Completa 100 movimientos en menos de 0.5 segundos',
      icon: 'zap',
      rarity: 'rare',
      category: 'gameplay',
      unlocked: false,
      progress: 67,
      maxProgress: 100,
      secret: false
    },
    {
      id: 'pattern-breaker',
      name: 'Rompedor de Patrones',
      description: 'Confunde a la IA por 5 turnos consecutivos',
      icon: 'sparkles',
      rarity: 'epic',
      category: 'special',
      unlocked: false,
      progress: 3,
      maxProgress: 5,
      secret: false
    },
    {
      id: 'time-bender',
      name: 'Doblegador del Tiempo',
      description: '???',
      icon: 'clock',
      rarity: 'mythic',
      category: 'hidden',
      unlocked: false,
      progress: 0,
      maxProgress: 1,
      secret: true
    },
    {
      id: 'perfect-mirror',
      name: 'Espejo Perfecto',
      description: 'Imita perfectamente a la IA por 10 turnos',
      icon: 'mirror',
      rarity: 'legendary',
      category: 'special',
      unlocked: false,
      progress: 7,
      maxProgress: 10,
      reward: 'Habilidad: Modo Espejo',
      secret: false
    }
  ]);

  const [playerDNA] = useState<PlayerDNA>({
    aggression: 78,
    patience: 45,
    creativity: 92,
    adaptability: 85,
    risk_tolerance: 71,
    pattern_complexity: 88
  });

  const saveProfile = () => {
    setProfile(editForm);
    localStorage.setItem('mindmirror-profile', JSON.stringify(editForm));
    setIsEditing(false);
  };

  const getAchievementIcon = (iconName: string) => {
    const icons = {
      trophy: <Trophy className="w-6 h-6" />,
      atom: <Sparkles className="w-6 h-6" />,
      brain: <Brain className="w-6 h-6" />,
      zap: <Zap className="w-6 h-6" />,
      sparkles: <Sparkles className="w-6 h-6" />,
      clock: <Calendar className="w-6 h-6" />,
      mirror: <Eye className="w-6 h-6" />
    };
    return icons[iconName as keyof typeof icons] || <Award className="w-6 h-6" />;
  };

  const getRarityColor = (rarity: string) => {
    const colors = {
      common: 'text-gray-400 border-gray-400 bg-gray-400/10',
      rare: 'text-blue-400 border-blue-400 bg-blue-400/10',
      epic: 'text-purple-400 border-purple-400 bg-purple-400/10',
      legendary: 'text-yellow-400 border-yellow-400 bg-yellow-400/10',
      mythic: 'text-neon-cyan border-neon-cyan bg-neon-cyan/10'
    };
    return colors[rarity as keyof typeof colors] || 'text-gray-400 border-gray-400';
  };

  const getPlayStyleDescription = (style: string) => {
    const descriptions = {
      aggressive: "Atacas constantemente y tomas riesgos calculados",
      defensive: "Prefieres estrategias seguras y esperas oportunidades",
      balanced: "Adaptas tu estilo según la situación",
      unpredictable: "Cambias constantemente de estrategia para confundir a la IA"
    };
    return descriptions[style as keyof typeof descriptions];
  };

  const getAvatar = (avatarType: string) => {
    const avatars = {
      quantum: "⚛️",
      neural: "🧠", 
      cyber: "🤖",
      mystic: "🔮",
      warrior: "⚔️",
      sage: "📚"
    };
    return avatars[avatarType as keyof typeof avatars] || "👤";
  };

  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const totalAchievements = achievements.filter(a => !a.secret).length;

  return (
    <div className="min-h-screen bg-background neural-grid p-6">
      <div className="max-w-6xl mx-auto">
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
              Perfil de Jugador
            </h1>
          </div>
          
          <Button 
            onClick={() => setIsEditing(!isEditing)} 
            variant={isEditing ? "default" : "outline"}
          >
            <Edit3 className="w-4 h-4 mr-2" />
            {isEditing ? 'Guardar' : 'Editar'}
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card className="bg-card/30 backdrop-blur-sm border-neon-cyan/20 relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="w-full h-full bg-gradient-to-br from-neon-cyan via-neon-purple to-neon-pink" />
              </div>
              
              <CardHeader className="text-center relative z-10">
                <div className="relative mx-auto w-24 h-24 mb-4">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center text-4xl">
                    {getAvatar(profile.avatar)}
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-neon-cyan rounded-full flex items-center justify-center text-sm font-bold">
                    {profile.level}
                  </div>
                </div>
                
                {isEditing ? (
                  <div className="space-y-3">
                    <Input
                      value={editForm.displayName}
                      onChange={(e) => setEditForm(prev => ({ ...prev, displayName: e.target.value }))}
                      className="text-center"
                      placeholder="Nombre a mostrar"
                    />
                    <Textarea
                      value={editForm.bio}
                      onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Biografía"
                      rows={3}
                    />
                  </div>
                ) : (
                  <>
                    <CardTitle className="text-xl">{profile.displayName}</CardTitle>
                    <Badge variant="outline" className="text-neon-purple border-neon-purple">
                      {profile.activeTitle}
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-2">{profile.bio}</p>
                  </>
                )}
              </CardHeader>
              
              <CardContent className="relative z-10">
                <div className="space-y-4">
                  {/* XP Progress */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Nivel {profile.level}</span>
                      <span>{profile.xp}/{profile.nextLevelXp} XP</span>
                    </div>
                    <Progress value={(profile.xp / profile.nextLevelXp) * 100} className="h-3" />
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 bg-card/20 rounded-lg">
                      <div className="text-2xl font-bold text-neon-cyan">{unlockedAchievements.length}</div>
                      <div className="text-xs text-muted-foreground">Logros</div>
                    </div>
                    <div className="p-3 bg-card/20 rounded-lg">
                      <div className="text-2xl font-bold text-neon-purple">{profile.level}</div>
                      <div className="text-xs text-muted-foreground">Nivel</div>
                    </div>
                  </div>

                  {/* Play Style */}
                  <div className="p-3 bg-card/20 rounded-lg">
                    <div className="text-sm font-semibold mb-1">Estilo de Juego</div>
                    <Badge variant="outline" className="text-neon-pink border-neon-pink mb-2">
                      {profile.playStyle}
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      {getPlayStyleDescription(profile.playStyle)}
                    </p>
                  </div>

                  {isEditing && (
                    <div className="space-y-3 pt-4 border-t border-border">
                      <Button onClick={saveProfile} className="w-full">
                        Guardar Cambios
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsEditing(false)}
                        className="w-full"
                      >
                        Cancelar
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="achievements" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="achievements">Logros</TabsTrigger>
                <TabsTrigger value="dna">DNA Jugador</TabsTrigger>
                <TabsTrigger value="titles">Títulos</TabsTrigger>
                <TabsTrigger value="stats">Estadísticas</TabsTrigger>
              </TabsList>

              <TabsContent value="achievements" className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">Colección de Logros</h3>
                  <Badge variant="outline" className="text-neon-cyan border-neon-cyan">
                    {unlockedAchievements.length}/{totalAchievements}
                  </Badge>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {achievements.filter(a => !a.secret || a.unlocked).map(achievement => (
                    <motion.div
                      key={achievement.id}
                      whileHover={{ scale: 1.02 }}
                      className={`${achievement.unlocked ? 'opacity-100' : 'opacity-60'}`}
                    >
                      <Card className={`bg-card/30 backdrop-blur-sm border-2 ${getRarityColor(achievement.rarity)} ${achievement.unlocked ? 'glow' : ''}`}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${achievement.unlocked ? 'bg-current/20' : 'bg-muted/20'}`}>
                              {getAchievementIcon(achievement.icon)}
                            </div>
                            <div className="flex-1">
                              <CardTitle className="text-sm">{achievement.name}</CardTitle>
                              <div className="flex gap-2 mt-1">
                                <Badge variant="outline" className={`text-xs ${getRarityColor(achievement.rarity)}`}>
                                  {achievement.rarity}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {achievement.category}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-xs text-muted-foreground mb-3">{achievement.description}</p>
                          
                          {achievement.unlocked ? (
                            <div className="text-xs text-neon-green">
                              ✓ Desbloqueado {achievement.unlockedDate && new Date(achievement.unlockedDate).toLocaleDateString()}
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs">
                                <span>Progreso</span>
                                <span>{achievement.progress}/{achievement.maxProgress}</span>
                              </div>
                              <Progress value={(achievement.progress / achievement.maxProgress) * 100} className="h-2" />
                            </div>
                          )}
                          
                          {achievement.reward && (
                            <div className="mt-2 text-xs text-neon-cyan">
                              🎁 {achievement.reward}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="dna" className="space-y-4">
                <Card className="bg-card/30 backdrop-blur-sm border-neon-purple/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="w-5 h-5 text-neon-purple" />
                      DNA de Jugador
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Análisis de tu personalidad de juego generado por IA
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {Object.entries(playerDNA).map(([trait, value]) => (
                      <div key={trait}>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="capitalize">{trait.replace('_', ' ')}</span>
                          <span className="font-mono">{value}%</span>
                        </div>
                        <Progress value={value} className="h-3" />
                      </div>
                    ))}
                    
                    <div className="mt-6 p-4 bg-neon-purple/10 rounded-lg border border-neon-purple/20">
                      <h4 className="font-semibold text-neon-purple mb-2">Análisis IA</h4>
                      <p className="text-sm text-muted-foreground">
                        "Eres un jugador excepcionalmente creativo con alta adaptabilidad. Tu tendencia a ser impredecible 
                        hace que seas un desafío fascinante. Recomiendo enfrentarte a la IA en modo Evolucionado para 
                        maximizar tu potencial de crecimiento."
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="titles" className="space-y-4">
                <Card className="bg-card/30 backdrop-blur-sm border-neon-cyan/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Crown className="w-5 h-5 text-neon-cyan" />
                      Títulos Desbloqueados
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      {profile.titles.map((title, index) => (
                        <div 
                          key={title}
                          className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            profile.activeTitle === title 
                              ? 'border-neon-cyan bg-neon-cyan/10' 
                              : 'border-border hover:border-border/60'
                          }`}
                          onClick={() => !isEditing && setProfile(prev => ({ ...prev, activeTitle: title }))}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold">{title}</h4>
                              <p className="text-xs text-muted-foreground">
                                Desbloqueado en nivel {(index + 1) * 3}
                              </p>
                            </div>
                            {profile.activeTitle === title && (
                              <Badge variant="outline" className="text-neon-cyan border-neon-cyan">
                                Activo
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="stats" className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="bg-card/30 backdrop-blur-sm border-neural-gray/20">
                    <CardHeader>
                      <CardTitle className="text-sm">Estadísticas Generales</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Partidas jugadas:</span>
                        <span className="font-mono">127</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Victorias:</span>
                        <span className="font-mono text-neon-green">89</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Tasa de victoria:</span>
                        <span className="font-mono text-neon-cyan">70.1%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Tiempo total:</span>
                        <span className="font-mono">24h 17m</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-card/30 backdrop-blur-sm border-neural-gray/20">
                    <CardHeader>
                      <CardTitle className="text-sm">Records Personales</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Mejor racha:</span>
                        <span className="font-mono text-neon-purple">12 victorias</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Movimiento más rápido:</span>
                        <span className="font-mono text-neon-pink">0.3s</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Mejor puntuación:</span>
                        <span className="font-mono text-neon-green">2,847</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Combos máximos:</span>
                        <span className="font-mono text-yellow-400">7 en una partida</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mt-8">
          <Link to="/game">
            <Button size="lg" className="bg-neon-cyan text-background hover:bg-neon-cyan/90">
              <Gamepad2 className="w-5 h-5 mr-2" />
              Jugar Ahora
            </Button>
          </Link>
          <Link to="/analytics">
            <Button variant="outline" size="lg" className="border-neon-purple text-neon-purple">
              <TrendingUp className="w-5 h-5 mr-2" />
              Analytics Detallados
            </Button>
          </Link>
          <Link to="/achievements">
            <Button variant="outline" size="lg" className="border-yellow-400 text-yellow-400">
              <Award className="w-5 h-5 mr-2" />
              Ver Logros
            </Button>
          </Link>
          <Link to="/settings">
            <Button variant="outline" size="lg" className="border-neon-green text-neon-green">
              <Settings className="w-5 h-5 mr-2" />
              Personalizar
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
