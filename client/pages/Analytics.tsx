import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Brain, 
  Target, 
  Timer, 
  TrendingUp, 
  Zap, 
  Trophy,
  ArrowLeft,
  Eye,
  Shield,
  Star,
  Award,
  BarChart3,
  Activity,
  Clock,
  Gamepad2
} from "lucide-react";

interface PlayerStats {
  totalGames: number;
  gamesWon: number;
  totalMoves: number;
  averageReactionTime: number;
  bestReactionTime: number;
  totalScore: number;
  combosAchieved: number;
  specialCellsActivated: number;
  aiPhaseReached: 'learning' | 'mirror' | 'evolution';
  preferredQuadrants: number[];
  playtime: number; // in minutes
  winStreak: number;
  bestWinStreak: number;
  difficulty: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  reward?: string;
}

export default function Analytics() {
  const [playerStats, setPlayerStats] = useState<PlayerStats>(() => {
    const saved = localStorage.getItem('mindmirror-stats');
    return saved ? JSON.parse(saved) : {
      totalGames: 12,
      gamesWon: 8,
      totalMoves: 324,
      averageReactionTime: 1840,
      bestReactionTime: 890,
      totalScore: 2456,
      combosAchieved: 23,
      specialCellsActivated: 67,
      aiPhaseReached: 'evolution',
      preferredQuadrants: [45, 32, 28, 39],
      playtime: 127,
      winStreak: 3,
      bestWinStreak: 6,
      difficulty: 0.72
    };
  });

  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: 'first-win',
      name: 'Primera Victoria',
      description: 'Gana tu primera partida contra la IA',
      icon: 'trophy',
      rarity: 'common',
      unlocked: true,
      progress: 1,
      maxProgress: 1,
      reward: 'Título: Novato'
    },
    {
      id: 'speed-demon',
      name: 'Demonio de Velocidad',
      description: 'Realiza un movimiento en menos de 1 segundo',
      icon: 'zap',
      rarity: 'rare',
      unlocked: true,
      progress: 1,
      maxProgress: 1,
      reward: 'Habilidad: Reflejos Mejorados'
    },
    {
      id: 'combo-master',
      name: 'Maestro de Combos',
      description: 'Realiza 10 combos en una sola partida',
      icon: 'star',
      rarity: 'epic',
      unlocked: false,
      progress: 7,
      maxProgress: 10
    },
    {
      id: 'ai-whisperer',
      name: 'Susurrador de IA',
      description: 'Alcanza la fase Evolución 5 veces',
      icon: 'brain',
      rarity: 'legendary',
      unlocked: false,
      progress: 3,
      maxProgress: 5,
      reward: 'Acceso: Modo IA Avanzada'
    },
    {
      id: 'quantum-master',
      name: 'Maestro Cuántico',
      description: 'Activa 50 celdas especiales',
      icon: 'sparkles',
      rarity: 'epic',
      unlocked: false,
      progress: 67,
      maxProgress: 50
    },
    {
      id: 'streak-hunter',
      name: 'Cazador de Rachas',
      description: 'Consigue una racha de 10 victorias',
      icon: 'target',
      rarity: 'legendary',
      unlocked: false,
      progress: 6,
      maxProgress: 10,
      reward: 'Título: Imparable'
    }
  ]);

  const winRate = (playerStats.gamesWon / playerStats.totalGames) * 100;
  const averageScore = playerStats.totalScore / playerStats.totalGames;
  const movesPerGame = playerStats.totalMoves / playerStats.totalGames;

  const getAchievementIcon = (iconName: string) => {
    const icons = {
      trophy: <Trophy className="w-6 h-6" />,
      zap: <Zap className="w-6 h-6" />,
      star: <Star className="w-6 h-6" />,
      brain: <Brain className="w-6 h-6" />,
      sparkles: <Sparkles className="w-6 h-6" />,
      target: <Target className="w-6 h-6" />
    };
    return icons[iconName as keyof typeof icons] || <Award className="w-6 h-6" />;
  };

  const getRarityColor = (rarity: string) => {
    const colors = {
      common: 'text-gray-400 border-gray-400',
      rare: 'text-blue-400 border-blue-400',
      epic: 'text-purple-400 border-purple-400',
      legendary: 'text-yellow-400 border-yellow-400'
    };
    return colors[rarity as keyof typeof colors] || 'text-gray-400 border-gray-400';
  };

  const getPerformanceRating = () => {
    const score = (winRate * 0.4) + (playerStats.difficulty * 100 * 0.3) + 
                  (playerStats.combosAchieved * 0.2) + (playerStats.bestWinStreak * 0.1);
    
    if (score >= 80) return { rating: 'Maestro', color: 'text-yellow-400', level: 'S' };
    if (score >= 65) return { rating: 'Experto', color: 'text-purple-400', level: 'A' };
    if (score >= 50) return { rating: 'Avanzado', color: 'text-blue-400', level: 'B' };
    if (score >= 35) return { rating: 'Intermedio', color: 'text-green-400', level: 'C' };
    return { rating: 'Novato', color: 'text-gray-400', level: 'D' };
  };

  const performance = getPerformanceRating();

  return (
    <div className="min-h-screen bg-background neural-grid p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Juego
            </Button>
          </Link>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
              Perfil de Jugador
            </h1>
            <div className="flex items-center justify-center gap-2 mt-2">
              <Badge variant="outline" className={performance.color}>
                Nivel {performance.level} - {performance.rating}
              </Badge>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Tiempo Total</div>
            <div className="text-lg font-bold">{Math.floor(playerStats.playtime / 60)}h {playerStats.playtime % 60}m</div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="achievements">Logros</TabsTrigger>
            <TabsTrigger value="patterns">Patrones</TabsTrigger>
            <TabsTrigger value="history">Historial</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Stats */}
            <div className="grid md:grid-cols-4 gap-6">
              <Card className="bg-card/30 backdrop-blur-sm border-neon-cyan/20">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Trophy className="w-4 h-4 text-neon-cyan" />
                    Tasa de Victoria
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-neon-cyan">{winRate.toFixed(1)}%</div>
                  <div className="text-xs text-muted-foreground">{playerStats.gamesWon}/{playerStats.totalGames} partidas</div>
                  <Progress value={winRate} className="h-2 mt-2" />
                </CardContent>
              </Card>

              <Card className="bg-card/30 backdrop-blur-sm border-neon-purple/20">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Target className="w-4 h-4 text-neon-purple" />
                    Puntuación Media
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-neon-purple">{averageScore.toFixed(0)}</div>
                  <div className="text-xs text-muted-foreground">puntos por partida</div>
                  <div className="text-xs text-neon-purple mt-1">Total: {playerStats.totalScore.toLocaleString()}</div>
                </CardContent>
              </Card>

              <Card className="bg-card/30 backdrop-blur-sm border-neon-pink/20">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Timer className="w-4 h-4 text-neon-pink" />
                    Reacción Media
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-neon-pink">{(playerStats.averageReactionTime / 1000).toFixed(1)}s</div>
                  <div className="text-xs text-muted-foreground">Mejor: {(playerStats.bestReactionTime / 1000).toFixed(1)}s</div>
                  <Progress value={Math.max(0, 100 - (playerStats.averageReactionTime / 3000 * 100))} className="h-2 mt-2" />
                </CardContent>
              </Card>

              <Card className="bg-card/30 backdrop-blur-sm border-neon-green/20">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Zap className="w-4 h-4 text-neon-green" />
                    Racha Actual
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-neon-green">{playerStats.winStreak}</div>
                  <div className="text-xs text-muted-foreground">Mejor: {playerStats.bestWinStreak}</div>
                  <Progress value={(playerStats.winStreak / playerStats.bestWinStreak) * 100} className="h-2 mt-2" />
                </CardContent>
              </Card>
            </div>

            {/* Detailed Analytics */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-card/30 backdrop-blur-sm border-neural-gray/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-neon-cyan" />
                    Estadísticas Avanzadas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Movimientos por partida:</span>
                    <span className="font-mono">{movesPerGame.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Combos realizados:</span>
                    <span className="font-mono text-neon-purple">{playerStats.combosAchieved}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Celdas especiales:</span>
                    <span className="font-mono text-neon-pink">{playerStats.specialCellsActivated}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Dificultad IA:</span>
                    <Badge variant="outline" className="text-neon-green border-neon-green">
                      {(playerStats.difficulty * 100).toFixed(0)}%
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Fase máxima:</span>
                    <Badge variant="outline" className="text-quantum-violet border-quantum-violet">
                      {playerStats.aiPhaseReached === 'evolution' ? 'Evolución' : 
                       playerStats.aiPhaseReached === 'mirror' ? 'Espejo' : 'Aprendizaje'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/30 backdrop-blur-sm border-neural-gray/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-neon-purple" />
                    Análisis de Juego
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Cuadrante Superior Izq.</span>
                      <span>{playerStats.preferredQuadrants[0]}</span>
                    </div>
                    <Progress value={(playerStats.preferredQuadrants[0] / Math.max(...playerStats.preferredQuadrants)) * 100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Cuadrante Superior Der.</span>
                      <span>{playerStats.preferredQuadrants[1]}</span>
                    </div>
                    <Progress value={(playerStats.preferredQuadrants[1] / Math.max(...playerStats.preferredQuadrants)) * 100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Cuadrante Inferior Izq.</span>
                      <span>{playerStats.preferredQuadrants[2]}</span>
                    </div>
                    <Progress value={(playerStats.preferredQuadrants[2] / Math.max(...playerStats.preferredQuadrants)) * 100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Cuadrante Inferior Der.</span>
                      <span>{playerStats.preferredQuadrants[3]}</span>
                    </div>
                    <Progress value={(playerStats.preferredQuadrants[3] / Math.max(...playerStats.preferredQuadrants)) * 100} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map(achievement => (
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
                          <Badge variant="outline" className={`text-xs ${getRarityColor(achievement.rarity)}`}>
                            {achievement.rarity}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground mb-3">{achievement.description}</p>
                      {!achievement.unlocked && (
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

          <TabsContent value="patterns" className="space-y-6">
            <Card className="bg-card/30 backdrop-blur-sm border-neural-gray/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-neon-cyan" />
                  Patrones de Comportamiento Detectados
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-3 bg-neon-cyan/10 rounded-lg border border-neon-cyan/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="w-4 h-4 text-neon-cyan" />
                      <span className="font-semibold">Estilo de Juego: Agresivo</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Tiendes a jugar rápidamente y tomar riesgos. Tu tiempo de reacción promedio es 15% más rápido que la media.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-neon-purple/10 rounded-lg border border-neon-purple/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-neon-purple" />
                      <span className="font-semibold">Preferencia: Centro del Tablero</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Prefieres controlar el centro del tablero, una estrategia típica de jugadores experimentados.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-neon-pink/10 rounded-lg border border-neon-pink/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-neon-pink" />
                      <span className="font-semibold">Adaptabilidad: Alta</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Cambias de estrategia frecuentemente, lo que hace difícil para la IA predecir tus movimientos.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card className="bg-card/30 backdrop-blur-sm border-neural-gray/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-neon-green" />
                  Historial de Partidas Recientes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { date: '2024-01-15', result: 'Victoria', score: '34-28', phase: 'Evolución', time: '8:42' },
                    { date: '2024-01-15', result: 'Victoria', score: '29-31', phase: 'Espejo', time: '6:18' },
                    { date: '2024-01-14', result: 'Derrota', score: '22-35', phase: 'Evolución', time: '11:05' },
                    { date: '2024-01-14', result: 'Victoria', score: '40-25', phase: 'Espejo', time: '7:33' },
                    { date: '2024-01-13', result: 'Victoria', score: '31-29', phase: 'Evolución', time: '9:47' }
                  ].map((game, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-card/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge 
                          variant="outline" 
                          className={game.result === 'Victoria' ? 'text-neon-green border-neon-green' : 'text-red-400 border-red-400'}
                        >
                          {game.result}
                        </Badge>
                        <span className="text-sm">{game.date}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{game.score}</span>
                        <span>{game.phase}</span>
                        <span>{game.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
