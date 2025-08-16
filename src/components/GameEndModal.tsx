import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Star, Target, Clock, Brain } from "lucide-react";

interface GameEndModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameStats: {
    score: number;
    level: number;
    accuracy: number;
    timeElapsed: number;
    movesUsed: number;
    isWin: boolean;
  };
  onPlayAgain: () => void;
  onReturnToMenu: () => void;
}

export default function GameEndModal({
  isOpen,
  onClose,
  gameStats,
  onPlayAgain,
  onReturnToMenu,
}: GameEndModalProps) {
  const { score, level, accuracy, timeElapsed, movesUsed, isWin } = gameStats;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getPerformanceRating = () => {
    if (accuracy >= 95)
      return { rating: "Excelente", icon: "🏆", color: "text-yellow-400" };
    if (accuracy >= 80)
      return { rating: "Muy Bien", icon: "⭐", color: "text-blue-400" };
    if (accuracy >= 65)
      return { rating: "Bien", icon: "👍", color: "text-green-400" };
    return { rating: "Puede Mejorar", icon: "💪", color: "text-orange-400" };
  };

  const performance = getPerformanceRating();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-background/95 backdrop-blur-sm border-border/50">
        <DialogHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            {isWin ? (
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center">
                <Trophy className="w-8 h-8 text-white" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
                <Brain className="w-8 h-8 text-white" />
              </div>
            )}
          </div>
          <DialogTitle className="text-2xl font-bold">
            {isWin ? "¡Nivel Completado!" : "Fin del Juego"}
          </DialogTitle>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="text-4xl">{performance.icon}</span>
            <span className={`text-lg font-semibold ${performance.color}`}>
              {performance.rating}
            </span>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Estadísticas principales */}
          <Card className="bg-card/50 border-border/30">
            <CardContent className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {score.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Puntuación
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-neon-cyan">
                    {level}
                  </div>
                  <div className="text-sm text-muted-foreground">Nivel</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2 border-t border-border/30">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Target className="w-4 h-4 text-green-400" />
                    <span className="font-semibold text-green-400">
                      {accuracy}%
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">Precisión</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <span className="font-semibold text-blue-400">
                      {formatTime(timeElapsed)}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">Tiempo</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Star className="w-4 h-4 text-purple-400" />
                    <span className="font-semibold text-purple-400">
                      {movesUsed}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Movimientos
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Logros obtenidos */}
          {isWin && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                Logros Desbloqueados
              </h4>
              <div className="flex flex-wrap gap-2">
                {accuracy >= 90 && (
                  <Badge
                    variant="outline"
                    className="bg-yellow-500/10 text-yellow-300 border-yellow-500/30"
                  >
                    🎯 Tirador Experto
                  </Badge>
                )}
                {timeElapsed <= 120 && (
                  <Badge
                    variant="outline"
                    className="bg-blue-500/10 text-blue-300 border-blue-500/30"
                  >
                    ⚡ Velocidad Luz
                  </Badge>
                )}
                {movesUsed <= 50 && (
                  <Badge
                    variant="outline"
                    className="bg-green-500/10 text-green-300 border-green-500/30"
                  >
                    🧠 Estratega
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="space-y-2 pt-4">
            <Button
              onClick={onPlayAgain}
              className="w-full bg-gradient-to-r from-neon-cyan to-neon-purple hover:opacity-90"
            >
              {isWin ? "Siguiente Nivel" : "Intentar de Nuevo"}
            </Button>
            <Button
              onClick={onReturnToMenu}
              variant="outline"
              className="w-full border-border/50 hover:bg-muted/50"
            >
              Volver al Menú
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
