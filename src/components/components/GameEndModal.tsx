import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Trophy, 
  Star, 
  Crown, 
  Target,
  Zap,
  Clock,
  TrendingUp,
  Award,
  Sparkles,
  RotateCcw,
  Home,
  User,
  ChevronRight,
  Gift,
  Medal
} from "lucide-react";
import type { Achievement, GameEndData } from "@/lib/achievementSystem";

interface GameEndModalProps {
  isOpen: boolean;
  gameEndData: GameEndData;
  newAchievements: Achievement[];
  onPlayAgain: () => void;
  onClose: () => void;
}

export default function GameEndModal({ 
  isOpen, 
  gameEndData, 
  newAchievements, 
  onPlayAgain, 
  onClose 
}: GameEndModalProps) {
  const [showingAchievements, setShowingAchievements] = useState(false);

  const getWinnerDisplay = () => {
    switch (gameEndData.winner) {
      case 'player':
        return {
          title: '¡VICTORIA!',
          subtitle: 'Has dominado a la IA',
          color: 'text-neon-cyan',
          bgColor: 'from-neon-cyan/20 to-neon-green/20',
          icon: <Crown className="w-16 h-16 text-neon-cyan" />
        };
      case 'ai':
        return {
          title: 'DERROTA',
          subtitle: 'La IA fue superior esta vez',
          color: 'text-neon-purple',
          bgColor: 'from-neon-purple/20 to-neon-pink/20',
          icon: <Target className="w-16 h-16 text-neon-purple" />
        };
      case 'tie':
        return {
          title: 'EMPATE',
          subtitle: 'Equilibrio perfecto alcanzado',
          color: 'text-yellow-400',
          bgColor: 'from-yellow-400/20 to-orange-400/20',
          icon: <Star className="w-16 h-16 text-yellow-400" />
        };
    }
  };

  const winner = getWinnerDisplay();

  const statsData = [
    {
      label: 'Puntuación Final',
      value: `${gameEndData.playerScore} - ${gameEndData.aiScore}`,
      icon: <Trophy className="w-4 h-4" />,
      color: 'text-neon-cyan'
    },
    {
      label: 'Movimientos Totales',
      value: gameEndData.totalMoves.toString(),
      icon: <Target className="w-4 h-4" />,
      color: 'text-neon-purple'
    },
    {
      label: 'Duración',
      value: `${Math.floor(gameEndData.gameDuration / 60)}:${String(Math.floor(gameEndData.gameDuration % 60)).padStart(2, '0')}`,
      icon: <Clock className="w-4 h-4" />,
      color: 'text-neon-pink'
    },
    {
      label: 'Fase Final IA',
      value: gameEndData.phase === 'evolution' ? 'Evolución' : 
             gameEndData.phase === 'mirror' ? 'Espejo' : 'Aprendizaje',
      icon: <Sparkles className="w-4 h-4" />,
      color: 'text-neon-green'
    },
    {
      label: 'Combos Realizados',
      value: gameEndData.combosUsed.toString(),
      icon: <Zap className="w-4 h-4" />,
      color: 'text-yellow-400'
    },
    {
      label: 'Reacción Promedio',
      value: `${(gameEndData.averageReactionTime / 1000).toFixed(1)}s`,
      icon: <TrendingUp className="w-4 h-4" />,
      color: 'text-orange-400'
    }
  ];

  const getAchievementIcon = (achievement: Achievement) => {
    return <span className="text-2xl">{achievement.icon}</span>;
  };

  const getRarityColor = (rarity: string) => {
    const colors = {
      common: 'text-gray-400 border-gray-400 bg-gray-400/10',
      rare: 'text-blue-400 border-blue-400 bg-blue-400/10',
      epic: 'text-purple-400 border-purple-400 bg-purple-400/10',
      legendary: 'text-yellow-400 border-yellow-400 bg-yellow-400/10',
      mythic: 'text-neon-cyan border-neon-cyan bg-neon-cyan/10'
    };
    return colors[rarity as keyof typeof colors] || colors.common;
  };

  const totalPoints = newAchievements.reduce((sum, ach) => sum + ach.points, 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-card/95 backdrop-blur-sm border-2 border-neon-cyan/30">
        <DialogHeader>
          <DialogTitle className="sr-only">Resultado de la Partida</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header with Result */}
          <div className={`text-center p-8 rounded-lg bg-gradient-to-br ${winner.bgColor} border border-current/20`}>
            <div className="flex flex-col items-center gap-4">
              {winner.icon}
              <div>
                <h2 className={`text-4xl font-bold ${winner.color}`}>
                  {winner.title}
                </h2>
                <p className="text-lg text-muted-foreground mt-2">
                  {winner.subtitle}
                </p>
                {gameEndData.boardFull && (
                  <Badge variant="outline" className="mt-2 border-yellow-400 text-yellow-400">
                    Tablero Completo
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Game Stats */}
            <Card className="bg-card/30 backdrop-blur-sm border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-neon-cyan" />
                  Estadísticas de la Partida
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {statsData.map((stat, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={stat.color}>{stat.icon}</span>
                      <span className="text-sm text-muted-foreground">{stat.label}:</span>
                    </div>
                    <span className={`font-bold ${stat.color}`}>
                      {stat.value}
                    </span>
                  </div>
                ))}

                {/* Special Achievements */}
                <div className="pt-4 border-t border-border">
                  <div className="grid grid-cols-2 gap-3 text-center">
                    {gameEndData.perfectGame && (
                      <Badge variant="outline" className="border-neon-cyan text-neon-cyan">
                        Juego Perfecto
                      </Badge>
                    )}
                    {gameEndData.fastestMove < 500 && (
                      <Badge variant="outline" className="border-yellow-400 text-yellow-400">
                        Movimiento Relámpago
                      </Badge>
                    )}
                    {gameEndData.dominationRatio > 0.8 && (
                      <Badge variant="outline" className="border-neon-purple text-neon-purple">
                        Dominación
                      </Badge>
                    )}
                    {gameEndData.phase === 'evolution' && (
                      <Badge variant="outline" className="border-neon-green text-neon-green">
                        IA Evolucionada
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card className="bg-card/30 backdrop-blur-sm border-border">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-400" />
                    Logros Desbloqueados
                  </div>
                  {newAchievements.length > 0 && (
                    <Badge variant="outline" className="border-yellow-400 text-yellow-400">
                      +{totalPoints} pts
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {newAchievements.length > 0 ? (
                  <div className="space-y-3">
                    {newAchievements.slice(0, 3).map((achievement, index) => (
                      <motion.div
                        key={achievement.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.2 }}
                        className={`flex items-center gap-3 p-3 rounded-lg border-2 ${getRarityColor(achievement.rarity)}`}
                      >
                        {getAchievementIcon(achievement)}
                        <div className="flex-1">
                          <div className="font-bold text-sm">{achievement.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {achievement.description}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className={`text-xs ${getRarityColor(achievement.rarity)}`}>
                              {achievement.rarity}
                            </Badge>
                            <span className="text-xs text-yellow-400">+{achievement.points} pts</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    
                    {newAchievements.length > 3 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowingAchievements(!showingAchievements)}
                        className="w-full"
                      >
                        {showingAchievements ? 'Ocultar' : `Ver ${newAchievements.length - 3} más`}
                        <ChevronRight className={`w-4 h-4 ml-2 transition-transform ${showingAchievements ? 'rotate-90' : ''}`} />
                      </Button>
                    )}

                    <AnimatePresence>
                      {showingAchievements && newAchievements.length > 3 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-3 pt-3 border-t border-border"
                        >
                          {newAchievements.slice(3).map((achievement, index) => (
                            <motion.div
                              key={achievement.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className={`flex items-center gap-3 p-3 rounded-lg border-2 ${getRarityColor(achievement.rarity)}`}
                            >
                              {getAchievementIcon(achievement)}
                              <div className="flex-1">
                                <div className="font-bold text-sm">{achievement.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {achievement.description}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className={`text-xs ${getRarityColor(achievement.rarity)}`}>
                                    {achievement.rarity}
                                  </Badge>
                                  <span className="text-xs text-yellow-400">+{achievement.points} pts</span>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Medal className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No se desbloquearon logros nuevos</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      ¡Sigue jugando para desbloquear más logros!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Rewards Section */}
          {newAchievements.some(a => a.reward) && (
            <Card className="bg-card/30 backdrop-blur-sm border-yellow-400/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="w-5 h-5 text-yellow-400" />
                  Recompensas Desbloqueadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {newAchievements
                    .filter(a => a.reward)
                    .map((achievement, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-yellow-400/10 rounded-lg border border-yellow-400/20">
                        <span className="text-2xl">{achievement.icon}</span>
                        <div>
                          <div className="font-bold text-yellow-400">{achievement.reward!.value}</div>
                          <div className="text-sm text-muted-foreground">{achievement.reward!.description}</div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button onClick={onPlayAgain} className="flex-1 bg-neon-cyan text-background hover:bg-neon-cyan/90">
              <RotateCcw className="w-4 h-4 mr-2" />
              Jugar de Nuevo
            </Button>
            <Link to="/" className="flex-1">
              <Button variant="outline" className="w-full border-neon-purple text-neon-purple hover:bg-neon-purple/10">
                <Home className="w-4 h-4 mr-2" />
                Menú Principal
              </Button>
            </Link>
            <Link to="/profile" className="flex-1">
              <Button variant="outline" className="w-full border-neon-green text-neon-green hover:bg-neon-green/10">
                <User className="w-4 h-4 mr-2" />
                Ver Perfil
              </Button>
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
