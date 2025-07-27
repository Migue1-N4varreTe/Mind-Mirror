import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { 
  Brain, 
  Eye, 
  Zap, 
  Shield, 
  Timer, 
  ArrowLeft,
  Cpu,
  Target,
  TrendingUp,
  Sparkles
} from "lucide-react";

// Game types
type CellType = 'empty' | 'player' | 'ai' | 'special';
type CellSpecial = 'bomb' | 'portal' | 'multiplier' | 'thief' | 'migrator' | 'contagious' | 'echo' | 'mirror';
type GamePhase = 'learning' | 'mirror' | 'evolution';
type AIPersonality = 'chameleon' | 'psychologist' | 'vengeful' | 'empathetic';

interface Cell {
  type: CellType;
  special?: CellSpecial;
  timer?: number;
  owner?: 'player' | 'ai';
  glow?: boolean;
}

interface GameState {
  board: Cell[][];
  currentPlayer: 'player' | 'ai';
  score: { player: number; ai: number };
  moves: number;
  phase: GamePhase;
  aiPersonality: AIPersonality;
  aiLearning: string[];
  playerAbilities: {
    vision: number;
    shield: number;
    timeExtra: number;
    steal: number;
  };
}

export default function Game() {
  const [gameState, setGameState] = useState<GameState>({
    board: Array(8).fill(null).map(() => 
      Array(8).fill(null).map(() => ({ type: 'empty' }))
    ),
    currentPlayer: 'player',
    score: { player: 0, ai: 0 },
    moves: 0,
    phase: 'learning',
    aiPersonality: 'chameleon',
    aiLearning: [],
    playerAbilities: {
      vision: 1,
      shield: 1,
      timeExtra: 1,
      steal: 1
    }
  });

  const [timeLeft, setTimeLeft] = useState(30);
  const [isThinking, setIsThinking] = useState(false);
  const [aiThought, setAiThought] = useState("Observando tus patrones...");
  const [lastClickTime, setLastClickTime] = useState<number[]>([]);
  const [showVision, setShowVision] = useState(false);

  // AI personalities and their behaviors
  const personalities = {
    chameleon: "Adapta su estilo mid-game",
    psychologist: "Detecta tu estado emocional",
    vengeful: "Recuerda tus movimientos ganadores",
    empathetic: "Se adapta a tu rendimiento"
  };

  const phases = {
    learning: { name: "Aprendizaje", color: "text-neon-cyan", progress: 33 },
    mirror: { name: "Espejo", color: "text-neon-purple", progress: 66 },
    evolution: { name: "Evolución", color: "text-neon-pink", progress: 100 }
  };

  // Initialize special cells
  useEffect(() => {
    const newBoard = [...gameState.board];
    // Add some special cells randomly
    for (let i = 0; i < 3; i++) {
      const row = Math.floor(Math.random() * 8);
      const col = Math.floor(Math.random() * 8);
      const specials: CellSpecial[] = ['bomb', 'portal', 'multiplier', 'migrator'];
      newBoard[row][col] = {
        type: 'special',
        special: specials[Math.floor(Math.random() * specials.length)]
      };
    }
    setGameState(prev => ({ ...prev, board: newBoard }));
  }, []);

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0 && gameState.currentPlayer === 'player') {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gameState.currentPlayer === 'player') {
      // Auto-play for player when time runs out
      aiMove();
    }
  }, [timeLeft, gameState.currentPlayer]);

  // AI thinking simulation
  useEffect(() => {
    if (isThinking) {
      const thoughts = [
        "Analizando tu patrón de clicks...",
        "Detectando estrés en tu timing...",
        "Calculando probabilidades cuánticas...",
        "Evolucionando contra-estrategia...",
        "Recordando tu último error...",
        "Prediciendo tu próximo movimiento..."
      ];
      
      const interval = setInterval(() => {
        setAiThought(thoughts[Math.floor(Math.random() * thoughts.length)]);
      }, 1500);

      return () => clearInterval(interval);
    }
  }, [isThinking]);

  // Phase progression
  useEffect(() => {
    if (gameState.moves < 10) {
      setGameState(prev => ({ ...prev, phase: 'learning' }));
    } else if (gameState.moves < 20) {
      setGameState(prev => ({ ...prev, phase: 'mirror' }));
    } else {
      setGameState(prev => ({ ...prev, phase: 'evolution' }));
    }
  }, [gameState.moves]);

  const handleCellClick = useCallback((row: number, col: number) => {
    if (gameState.currentPlayer !== 'player' || gameState.board[row][col].type !== 'empty') return;

    const now = Date.now();
    setLastClickTime(prev => [...prev.slice(-4), now]);
    
    const newBoard = [...gameState.board];
    newBoard[row][col] = { type: 'player', owner: 'player', glow: true };
    
    // Add to AI learning patterns
    const pattern = `${row},${col}:${now}`;
    const newLearning = [...gameState.aiLearning, pattern].slice(-20);
    
    setGameState(prev => ({
      ...prev,
      board: newBoard,
      currentPlayer: 'ai',
      score: { ...prev.score, player: prev.score.player + 1 },
      moves: prev.moves + 1,
      aiLearning: newLearning
    }));

    setTimeLeft(30);
    
    // Trigger AI move after delay
    setTimeout(() => {
      aiMove();
    }, Math.random() * 2000 + 1000);
  }, [gameState]);

  const aiMove = useCallback(() => {
    setIsThinking(true);
    
    setTimeout(() => {
      const newBoard = [...gameState.board];
      const emptyCells: [number, number][] = [];
      
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          if (newBoard[i][j].type === 'empty') {
            emptyCells.push([i, j]);
          }
        }
      }
      
      if (emptyCells.length > 0) {
        // AI decision based on phase and personality
        let targetCell: [number, number];
        
        switch (gameState.phase) {
          case 'learning':
            // Random with slight bias toward center
            targetCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            break;
          case 'mirror':
            // Try to mirror player patterns
            if (gameState.aiLearning.length > 0) {
              const lastPattern = gameState.aiLearning[gameState.aiLearning.length - 1];
              const [coords] = lastPattern.split(':');
              const [lastRow, lastCol] = coords.split(',').map(Number);
              // Mirror or adjacent to last player move
              const mirrorTargets = emptyCells.filter(([r, c]) => 
                Math.abs(r - lastRow) <= 1 && Math.abs(c - lastCol) <= 1
              );
              targetCell = mirrorTargets.length > 0 
                ? mirrorTargets[Math.floor(Math.random() * mirrorTargets.length)]
                : emptyCells[Math.floor(Math.random() * emptyCells.length)];
            } else {
              targetCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            }
            break;
          case 'evolution':
            // Strategic counters and predictions
            targetCell = emptyCells[0]; // More sophisticated logic would go here
            break;
          default:
            targetCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        }
        
        const [aiRow, aiCol] = targetCell;
        newBoard[aiRow][aiCol] = { type: 'ai', owner: 'ai', glow: true };
        
        setGameState(prev => ({
          ...prev,
          board: newBoard,
          currentPlayer: 'player',
          score: { ...prev.score, ai: prev.score.ai + 1 },
          moves: prev.moves + 1
        }));
      }
      
      setIsThinking(false);
      setTimeLeft(30);
    }, 2000);
  }, [gameState]);

  const useAbility = (ability: keyof typeof gameState.playerAbilities) => {
    if (gameState.playerAbilities[ability] <= 0) return;
    
    switch (ability) {
      case 'vision':
        setShowVision(true);
        setTimeout(() => setShowVision(false), 5000);
        break;
      case 'shield':
        // Implementation for shield
        break;
      case 'timeExtra':
        setTimeLeft(prev => prev + 5);
        break;
      case 'steal':
        // Implementation for steal
        break;
    }
    
    setGameState(prev => ({
      ...prev,
      playerAbilities: {
        ...prev.playerAbilities,
        [ability]: prev.playerAbilities[ability] - 1
      }
    }));
  };

  const getCellStyle = (cell: Cell, row: number, col: number) => {
    let baseClass = "w-12 h-12 border border-border rounded-lg transition-all duration-300 cursor-pointer ";
    
    switch (cell.type) {
      case 'empty':
        baseClass += "bg-card/20 hover:bg-card/40 hover:border-neon-cyan/50";
        break;
      case 'player':
        baseClass += "bg-neon-cyan/20 border-neon-cyan glow";
        break;
      case 'ai':
        baseClass += "bg-neon-purple/20 border-neon-purple glow";
        break;
      case 'special':
        baseClass += "bg-neon-pink/20 border-neon-pink animate-pulse";
        break;
    }
    
    if (cell.glow) {
      baseClass += " pulse-glow";
    }
    
    if (showVision && cell.type === 'empty') {
      // Show AI predictions
      const prediction = (row + col) % 3;
      if (prediction === 0) {
        baseClass += " bg-red-500/20 border-red-500";
      }
    }
    
    return baseClass;
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
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold">
              <span className="text-neon-cyan">{gameState.score.player}</span>
              <span className="text-muted-foreground mx-2">-</span>
              <span className="text-neon-purple">{gameState.score.ai}</span>
            </div>
            <div className="text-sm text-muted-foreground">Movimientos: {gameState.moves}</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Game Board */}
          <div className="lg:col-span-2">
            <Card className="bg-card/30 backdrop-blur-sm border-neon-cyan/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {gameState.currentPlayer === 'player' ? (
                      <>
                        <Target className="w-5 h-5 text-neon-cyan" />
                        Tu Turno
                      </>
                    ) : (
                      <>
                        <Cpu className="w-5 h-5 text-neon-purple animate-pulse" />
                        IA Pensando...
                      </>
                    )}
                  </CardTitle>
                  
                  {gameState.currentPlayer === 'player' && (
                    <div className="flex items-center gap-2">
                      <Timer className="w-4 h-4" />
                      <span className={`font-mono ${timeLeft <= 10 ? 'text-red-400' : 'text-foreground'}`}>
                        {timeLeft}s
                      </span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-8 gap-2 mb-4">
                  {gameState.board.map((row, rowIndex) =>
                    row.map((cell, colIndex) => (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        className={getCellStyle(cell, rowIndex, colIndex)}
                        onClick={() => handleCellClick(rowIndex, colIndex)}
                      >
                        {cell.special && (
                          <div className="w-full h-full flex items-center justify-center">
                            {cell.special === 'bomb' && <Zap className="w-4 h-4 text-neon-pink" />}
                            {cell.special === 'portal' && <Sparkles className="w-4 h-4 text-quantum-violet" />}
                            {cell.special === 'multiplier' && <TrendingUp className="w-4 h-4 text-neon-green" />}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
                
                {/* Player Abilities */}
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    disabled={gameState.playerAbilities.vision <= 0}
                    onClick={() => useAbility('vision')}
                    className="border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan/10"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Visión ({gameState.playerAbilities.vision})
                  </Button>
                  
                  <Button 
                    size="sm" 
                    variant="outline"
                    disabled={gameState.playerAbilities.shield <= 0}
                    onClick={() => useAbility('shield')}
                    className="border-neon-green/50 text-neon-green hover:bg-neon-green/10"
                  >
                    <Shield className="w-4 h-4 mr-1" />
                    Escudo ({gameState.playerAbilities.shield})
                  </Button>
                  
                  <Button 
                    size="sm" 
                    variant="outline"
                    disabled={gameState.playerAbilities.timeExtra <= 0}
                    onClick={() => useAbility('timeExtra')}
                    className="border-neon-purple/50 text-neon-purple hover:bg-neon-purple/10"
                  >
                    <Timer className="w-4 h-4 mr-1" />
                    +5s ({gameState.playerAbilities.timeExtra})
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Status Panel */}
          <div className="space-y-6">
            {/* Game Phase */}
            <Card className="bg-card/30 backdrop-blur-sm border-neural-gray/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Brain className="w-4 h-4 text-neon-cyan" />
                  Fase del Juego
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Progreso:</span>
                    <Badge variant="outline" className={`${phases[gameState.phase].color} border-current`}>
                      {phases[gameState.phase].name}
                    </Badge>
                  </div>
                  <Progress value={phases[gameState.phase].progress} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* AI Personality */}
            <Card className="bg-card/30 backdrop-blur-sm border-neural-gray/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Cpu className="w-4 h-4 text-neon-purple" />
                  Personalidad IA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge variant="outline" className="text-neon-purple border-neon-purple">
                    {gameState.aiPersonality}
                  </Badge>
                  <p className="text-xs text-muted-foreground">
                    {personalities[gameState.aiPersonality]}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* AI Thoughts */}
            <Card className="bg-card/30 backdrop-blur-sm border-neural-gray/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Brain className="w-4 h-4 text-quantum-violet animate-pulse" />
                  Pensamiento IA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-mono text-quantum-violet">
                  {aiThought}
                </p>
                {isThinking && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="w-2 h-2 bg-neon-cyan rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-neon-purple rounded-full animate-pulse delay-100"></div>
                    <div className="w-2 h-2 bg-neon-pink rounded-full animate-pulse delay-200"></div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Learning Patterns */}
            <Card className="bg-card/30 backdrop-blur-sm border-neural-gray/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Target className="w-4 h-4 text-neon-green" />
                  Patrones Detectados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {gameState.aiLearning.slice(-3).map((pattern, index) => {
                    const [coords] = pattern.split(':');
                    return (
                      <div key={index} className="text-xs font-mono text-muted-foreground">
                        Posición: {coords}
                      </div>
                    );
                  })}
                  {gameState.aiLearning.length === 0 && (
                    <div className="text-xs text-muted-foreground">
                      Recopilando datos...
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
