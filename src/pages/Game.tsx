import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Brain, 
  Eye, 
  Gamepad2, 
  Settings, 
  BarChart3,
  Users,
  Sparkles,
  Play,
  User
} from "lucide-react";
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../config/firebase';
import { useGameStore } from '../store/gameStore';
import EnhancedGameBoard from '../components/game/EnhancedGameBoard';
import GameEndModal from '@/components/GameEndModal';
import AuthModal from '../components/auth/AuthModal';
import { AchievementSystem, type Achievement, type GameEndData } from '@/lib/achievementSystem';

export default function Game() {
  const [user, loading] = useAuthState(auth);
  const { currentGame, startGame, endGame, showHeatmap, showPredictions, mentorMode, toggleHeatmap, togglePredictions, toggleMentorMode } = useGameStore();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeTab, setActiveTab] = useState('play');
  const [gameEndData, setGameEndData] = useState<GameEndData | null>(null);
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);
  const [showGameEndModal, setShowGameEndModal] = useState(false);
  const [achievementSystem] = useState(new AchievementSystem());

  const handleGameStart = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    startGame();
    setActiveTab('play');
  };

  const handleGameEnd = (gameData: any) => {
    const achievements = achievementSystem.checkAchievements(gameData);
    setGameEndData(gameData);
    setNewAchievements(achievements);
    setShowGameEndModal(false);
    endGame();
    setTimeout(() => setShowGameEndModal(true), 500);
  };

  const playAgain = () => {
    setGameEndData(null);
    setNewAchievements([]);
    setShowGameEndModal(false);
    handleGameStart();
  };

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
              Mind Mirror
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              El juego que aprende de ti
            </p>
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <Badge variant="outline" className="text-neon-cyan border-neon-cyan">
                {user.displayName || 'Jugador'}
              </Badge>
            ) : (
              <Button 
                onClick={() => setShowAuthModal(true)}
                variant="outline"
                size="sm"
              >
                <User className="w-4 h-4 mr-2" />
                Iniciar Sesión
              </Button>
            )}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="play">Jugar</TabsTrigger>
            <TabsTrigger value="modes">Modos</TabsTrigger>
            <TabsTrigger value="analysis">Análisis</TabsTrigger>
            <TabsTrigger value="settings">Configuración</TabsTrigger>
          </TabsList>

          <TabsContent value="play" className="space-y-6">
            {currentGame?.isActive ? (
              <EnhancedGameBoard onGameEnd={handleGameEnd} />
            ) : (
              <div className="text-center py-20">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Brain className="w-24 h-24 mx-auto text-neon-cyan mb-6 animate-pulse" />
                  <h2 className="text-2xl font-bold mb-4">¿Listo para el Desafío?</h2>
                  <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                    Enfréntate a una IA que aprende de cada movimiento que haces
                  </p>
                  <Button 
                    size="lg" 
                    onClick={handleGameStart}
                    className="bg-neon-cyan text-background hover:bg-neon-cyan/90 glow"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Iniciar Partida
                  </Button>
                </motion.div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="modes" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-card/30 backdrop-blur-sm border-neon-cyan/20 hover:border-neon-cyan/40 transition-all duration-300 cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gamepad2 className="w-5 h-5 text-neon-cyan" />
                    Modo Clásico
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Tablero 8x8 tradicional con todas las mecánicas básicas
                  </p>
                  <Button className="w-full" onClick={handleGameStart}>
                    Jugar Clásico
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-card/30 backdrop-blur-sm border-neon-purple/20 hover:border-neon-purple/40 transition-all duration-300 cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-neon-purple" />
                    Modo Hexagonal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Tablero hexagonal con mecánicas temporales avanzadas
                  </p>
                  <Button variant="outline" className="w-full">
                    Próximamente
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-card/30 backdrop-blur-sm border-neon-pink/20 hover:border-neon-pink/40 transition-all duration-300 cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-neon-pink" />
                    Modo Infinito
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Tablero que se expande dinámicamente según el juego
                  </p>
                  <Button variant="outline" className="w-full">
                    Próximamente
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-card/30 backdrop-blur-sm border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Eye className="w-4 h-4 text-neon-cyan" />
                    Heatmap de Decisiones
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Mostrar heatmap</span>
                    <Button
                      size="sm"
                      variant={showHeatmap ? "default" : "outline"}
                      onClick={toggleHeatmap}
                    >
                      {showHeatmap ? 'Activado' : 'Desactivado'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/30 backdrop-blur-sm border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <BarChart3 className="w-4 h-4 text-neon-purple" />
                    Predicciones IA
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Mostrar predicciones</span>
                    <Button
                      size="sm"
                      variant={showPredictions ? "default" : "outline"}
                      onClick={togglePredictions}
                    >
                      {showPredictions ? 'Activado' : 'Desactivado'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/30 backdrop-blur-sm border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Brain className="w-4 h-4 text-neon-green" />
                    Modo Mentor
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Consejos de IA</span>
                    <Button
                      size="sm"
                      variant={mentorMode ? "default" : "outline"}
                      onClick={toggleMentorMode}
                    >
                      {mentorMode ? 'Activado' : 'Desactivado'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-card/30 backdrop-blur-sm border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-neon-cyan" />
                  Configuración del Juego
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    Personaliza tu experiencia de juego
                  </p>
                  <Link to="/settings">
                    <Button variant="outline">
                      <Settings className="w-4 h-4 mr-2" />
                      Ir a Configuración
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Game End Modal */}
      {gameEndData && (
        <GameEndModal
          isOpen={showGameEndModal}
          gameEndData={gameEndData}
          newAchievements={newAchievements}
          onPlayAgain={playAgain}
          onClose={() => setShowGameEndModal(false)}
        />
      )}

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </div>
  );
}