import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, Eye, Zap, Shield, Timer, Target, Cpu, TrendingUp, 
  Sparkles, Atom, Biohazard, Circle, Hexagon, Grid3X3, Infinity
} from 'lucide-react';
import { HexagonalBoard } from '@/components/HexagonalBoard';
import { VisualEffects, CellRipple, FloatingText, NeuralNetwork } from '@/components/ui/visual-effects';
import { MindMirrorAI, ComboSystem } from '@/lib/gameEngine';
import { SPECIAL_CELLS, getRandomSpecialCell, getSpecialCellSpawnChance } from '@/lib/specialCells';
import { HeatmapAnalyzer, MovementPredictor } from '@/lib/heatmapSystem';
import { DynamicThemeEngine } from '@/lib/dynamicThemes';
import { ParticleStoryEngine } from '@/lib/particleStories';
import { InfiniteBoardEngine } from '@/lib/infiniteMode';
import { HexagonalBoard as HexBoard } from '@/lib/hexagonalGeometry';
import { useGameStore } from '../../store/gameStore';
import { saveGameSession, updateUserStats } from '../../services/gameService';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../config/firebase';

type CellType = 'empty' | 'player' | 'ai' | 'special';
type BoardMode = 'classic' | 'hexagonal' | 'infinite';
type GameMode = 'normal' | 'temporal' | 'heatmap' | 'story';

interface Cell {
  type: CellType;
  special?: string;
  timer?: number;
  owner?: 'player' | 'ai';
  glow?: boolean;
  temporalState?: 'appearing' | 'disappearing' | 'stable';
}

interface GameState {
  board: Cell[][];
  currentPlayer: 'player' | 'ai';
  score: { player: number; ai: number };
  moves: number;
  phase: 'learning' | 'mirror' | 'evolution';
  aiPersonality: string;
  boardMode: BoardMode;
  gameMode: GameMode;
  temporalCycle: number;
  gameEnded: boolean;
  specialCellsUsed: number;
  comboCount: number;
  maxComboChain: number;
  currentComboChain: number;
  playerAbilities: {
    vision: number;
    shield: number;
    timeExtra: number;
    steal: number;
  };
}

interface EnhancedGameBoardProps {
  onGameEnd: (gameData: any) => void;
}

export default function EnhancedGameBoard({ onGameEnd }: EnhancedGameBoardProps) {
  const [user] = useAuthState(auth);
  const { settings, currentGame, showHeatmap, showPredictions, mentorMode, updateGameState } = useGameStore();
  
  const [gameState, setGameState] = useState<GameState>({
    board: Array(8).fill(null).map(() => 
      Array(8).fill(null).map(() => ({ type: 'empty' }))
    ),
    currentPlayer: 'player',
    score: { player: 0, ai: 0 },
    moves: 0,
    phase: 'learning',
    aiPersonality: 'chameleon',
    boardMode: 'classic',
    gameMode: 'normal',
    temporalCycle: 0,
    gameEnded: false,
    specialCellsUsed: 0,
    comboCount: 0,
    maxComboChain: 0,
    currentComboChain: 0,
    playerAbilities: {
      vision: 3,
      shield: 2,
      timeExtra: 2,
      steal: 1
    }
  });

  const [timeLeft, setTimeLeft] = useState(settings.timeLimit);
  const [isThinking, setIsThinking] = useState(false);
  const [aiThought, setAiThought] = useState("Iniciando análisis...");
  const [visualEffects, setVisualEffects] = useState<any[]>([]);
  const [ripples, setRipples] = useState<any[]>([]);
  const [floatingTexts, setFloatingTexts] = useState<any[]>([]);
  const [clickStartTime, setClickStartTime] = useState<number>(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [showVision, setShowVision] = useState(false);
  const [heatmapData, setHeatmapData] = useState<Map<string, number>>(new Map());
  const [predictions, setPredictions] = useState<Map<string, number>>(new Map());

  // Game engines
  const aiEngine = useRef(new MindMirrorAI());
  const comboSystem = useRef(new ComboSystem());
  const heatmapAnalyzer = useRef(new HeatmapAnalyzer());
  const movementPredictor = useRef(new MovementPredictor());
  const themeEngine = useRef(new DynamicThemeEngine());
  const storyEngine = useRef(new ParticleStoryEngine());
  const hexBoard = useRef<HexBoard | null>(null);
  const infiniteBoard = useRef<InfiniteBoardEngine | null>(null);

  // Initialize board based on mode
  useEffect(() => {
    if (gameState.boardMode === 'hexagonal') {
      hexBoard.current = new HexBoard(3);
    } else if (gameState.boardMode === 'infinite') {
      infiniteBoard.current = new InfiniteBoardEngine(8);
    }
    
    // Add initial special cells
    const newBoard = [...gameState.board];
    const specialCellCount = Math.floor((settings.specialCellFrequency / 100) * 64 * 0.1);
    
    for (let i = 0; i < specialCellCount; i++) {
      const row = Math.floor(Math.random() * 8);
      const col = Math.floor(Math.random() * 8);
      if (newBoard[row][col].type === 'empty') {
        const specialType = getRandomSpecialCell(Math.random() > 0.7 ? 'rare' : 'common');
        newBoard[row][col] = {
          type: 'special',
          special: specialType,
          timer: SPECIAL_CELLS[specialType].duration
        };
      }
    }
    
    setGameState(prev => ({ ...prev, board: newBoard }));
  }, [settings.specialCellFrequency]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0 && gameState.currentPlayer === 'player' && !gameState.gameEnded) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gameState.currentPlayer === 'player') {
      // Auto-skip turn when time runs out
      setGameState(prev => ({ ...prev, currentPlayer: 'ai' }));
      setTimeout(() => aiMove(), 500);
    }
  }, [timeLeft, gameState.currentPlayer, gameState.gameEnded]);

  // AI thinking updates
  useEffect(() => {
    if (isThinking) {
      const interval = setInterval(() => {
        setAiThought(aiEngine.current.getAIThought());
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isThinking]);

  // Phase progression
  useEffect(() => {
    let newPhase: 'learning' | 'mirror' | 'evolution' = 'learning';
    if (gameState.moves >= 20) newPhase = 'evolution';
    else if (gameState.moves >= 10) newPhase = 'mirror';
    
    if (newPhase !== gameState.phase) {
      setGameState(prev => ({ ...prev, phase: newPhase }));
      
      // Add story event for phase change
      storyEngine.current.addGameEvent({
        type: 'milestone',
        player: 'ai',
        data: { phase: newPhase },
        intensity: 0.8
      });
    }
  }, [gameState.moves]);

  // Update heatmap and predictions
  useEffect(() => {
    if (showHeatmap) {
      const newHeatmap = heatmapAnalyzer.current.getHeatmapForBoard(8);
      setHeatmapData(newHeatmap);
    }
    
    if (showPredictions) {
      const newPredictions = movementPredictor.current.updatePredictions(
        gameState,
        reactionTimes.map((time, index) => ({
          position: [Math.floor(index / 8), index % 8] as [number, number],
          reactionTime: time,
          confidence: Math.random()
        })),
        aiEngine.current.exportAnalytics()
      );
      setPredictions(newPredictions);
    }
  }, [gameState.moves, showHeatmap, showPredictions]);

  const handleCellClick = useCallback((row: number, col: number) => {
    if (gameState.currentPlayer !== 'player' || gameState.gameEnded) return;

    const cell = gameState.board[row][col];
    if (cell.type !== 'empty' && cell.type !== 'special') return;

    const now = Date.now();
    const reactionTime = clickStartTime > 0 ? now - clickStartTime : 2000;
    setReactionTimes(prev => [...prev, reactionTime]);

    // Add to AI learning
    aiEngine.current.addPlayerMove([row, col], reactionTime);
    
    // Add to heatmap
    heatmapAnalyzer.current.addDataPoint({
      position: [row, col],
      intensity: 1,
      type: 'decision',
      timestamp: now
    });

    // Add story event
    storyEngine.current.addGameEvent({
      type: 'move',
      position: [row, col],
      player: 'human',
      data: { reactionTime, confidence: Math.random() },
      intensity: reactionTime < 1000 ? 0.8 : 0.4
    });

    const newBoard = [...gameState.board];
    let scoreGain = 1;
    let effectsToAdd: any[] = [];
    let textsToAdd: any[] = [];

    // Handle special cell activation
    if (cell.type === 'special' && cell.special) {
      const specialCell = SPECIAL_CELLS[cell.special];
      const effect = specialCell.effect.onActivate?.(newBoard, [row, col], 'player');

      if (effect) {
        if (effect.boardChanges) {
          effect.boardChanges.forEach(change => {
            newBoard[change.position[0]][change.position[1]] = change.newCell;
          });
        }
        if (effect.specialEffects) {
          effectsToAdd = effect.specialEffects;
        }
        if (effect.scoreChange) {
          scoreGain += effect.scoreChange.player;
        }
        if (effect.message) {
          textsToAdd.push({
            id: `msg-${now}`,
            text: effect.message,
            position: { x: col * 48 + 100, y: row * 48 + 24 },
            color: '#00f5ff'
          });
        }
      }
      
      setGameState(prev => ({ ...prev, specialCellsUsed: prev.specialCellsUsed + 1 }));
    } else {
      newBoard[row][col] = { type: 'player', owner: 'player', glow: true };
    }

    // Check for combos
    const combos = comboSystem.current.checkCombos(newBoard, [row, col], 'player');
    if (combos.length > 0) {
      const newComboChain = gameState.currentComboChain + 1;
      const maxChain = Math.max(gameState.maxComboChain, newComboChain);

      combos.forEach((combo, comboIndex) => {
        scoreGain *= settings.difficulty === 'quantum' ? 3 : 2;
        textsToAdd.push({
          id: `combo-text-${now}-${comboIndex}`,
          text: combo.name,
          position: { x: col * 48 + 24, y: row * 48 - 20 },
          color: '#ff6b9d',
          size: 'lg'
        });
        effectsToAdd.push({
          id: `combo-effect-${now}-${comboIndex}`,
          type: 'combo',
          position: { x: col * 48 + 24, y: row * 48 + 24 }
        });
      });

      setGameState(prev => ({
        ...prev,
        currentComboChain: newComboChain,
        maxComboChain: maxChain,
        comboCount: prev.comboCount + combos.length
      }));

      // Add story event for combo
      storyEngine.current.addGameEvent({
        type: 'combo',
        position: [row, col],
        player: 'human',
        data: { comboCount: combos.length, chain: newComboChain },
        intensity: 0.9
      });
    } else {
      setGameState(prev => ({ ...prev, currentComboChain: 0 }));
    }

    // Add ripple effect
    setRipples(prev => [...prev, {
      id: `ripple-${now}`,
      position: { x: col * 48 + 24, y: row * 48 + 24 },
      color: '#00f5ff'
    }]);

    const updatedGameState = {
      ...gameState,
      board: newBoard,
      currentPlayer: 'ai' as const,
      score: {
        ...gameState.score,
        player: gameState.score.player + scoreGain
      },
      moves: gameState.moves + 1
    };

    setGameState(updatedGameState);
    updateGameState({ moves: updatedGameState.moves, score: updatedGameState.score });

    // Add visual effects
    if (effectsToAdd.length > 0) {
      setVisualEffects(prev => [...prev, ...effectsToAdd]);
    }
    if (textsToAdd.length > 0) {
      setFloatingTexts(prev => [...prev, ...textsToAdd]);
    }

    setTimeLeft(settings.timeLimit);
    setClickStartTime(0);

    // Check if game should end
    const isEmpty = newBoard.flat().some(cell => cell.type === 'empty');
    if (!isEmpty) {
      endGame(updatedGameState);
      return;
    }

    // Trigger AI move
    setTimeout(() => aiMove(), Math.random() * 1500 + 800);
  }, [gameState, clickStartTime, settings]);

  const aiMove = useCallback(() => {
    setIsThinking(true);

    setTimeout(() => {
      const aiPosition = aiEngine.current.generateMove(gameState, getDifficultyValue());

      if (aiPosition) {
        const [aiRow, aiCol] = aiPosition;
        const newBoard = [...gameState.board];
        const cell = newBoard[aiRow][aiCol];

        let scoreGain = 1;
        let effectsToAdd: any[] = [];
        let textsToAdd: any[] = [];

        // Handle special cell activation by AI
        if (cell.type === 'special' && cell.special) {
          const specialCell = SPECIAL_CELLS[cell.special];
          const effect = specialCell.effect.onActivate?.(newBoard, [aiRow, aiCol], 'ai');

          if (effect) {
            if (effect.boardChanges) {
              effect.boardChanges.forEach(change => {
                newBoard[change.position[0]][change.position[1]] = change.newCell;
              });
            }
            if (effect.specialEffects) {
              effectsToAdd = effect.specialEffects;
            }
            if (effect.scoreChange) {
              scoreGain += effect.scoreChange.ai;
            }
            if (effect.message) {
              textsToAdd.push({
                id: `ai-msg-${Date.now()}`,
                text: effect.message,
                position: { x: aiCol * 48 + 100, y: aiRow * 48 + 24 },
                color: '#9d4edd'
              });
            }
          }
        } else {
          newBoard[aiRow][aiCol] = { type: 'ai', owner: 'ai', glow: true };
        }

        // Add AI story event
        storyEngine.current.addGameEvent({
          type: 'move',
          position: [aiRow, aiCol],
          player: 'ai',
          data: { personality: gameState.aiPersonality, phase: gameState.phase },
          intensity: 0.6
        });

        // Add AI ripple effect
        setRipples(prev => [...prev, {
          id: `ai-ripple-${Date.now()}`,
          position: { x: aiCol * 48 + 24, y: aiRow * 48 + 24 },
          color: '#9d4edd'
        }]);

        const updatedGameState = {
          ...gameState,
          board: newBoard,
          currentPlayer: 'player' as const,
          score: { ...gameState.score, ai: gameState.score.ai + scoreGain },
          moves: gameState.moves + 1
        };

        setGameState(updatedGameState);
        updateGameState({ moves: updatedGameState.moves, score: updatedGameState.score });

        // Add visual effects
        if (effectsToAdd.length > 0) {
          setVisualEffects(prev => [...prev, ...effectsToAdd]);
        }
        if (textsToAdd.length > 0) {
          setFloatingTexts(prev => [...prev, ...textsToAdd]);
        }

        // Check if game should end
        const isEmpty = newBoard.flat().some(cell => cell.type === 'empty');
        if (!isEmpty) {
          endGame(updatedGameState);
          return;
        }

        // Spawn new special cells occasionally
        if (Math.random() < getSpecialCellSpawnChance(gameState.moves / 50)) {
          spawnSpecialCell(newBoard);
        }
      }

      setIsThinking(false);
      setTimeLeft(settings.timeLimit);
    }, 1500 + Math.random() * 1000);
  }, [gameState, settings]);

  const spawnSpecialCell = (board: Cell[][]) => {
    const emptyCells: [number, number][] = [];
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (board[i][j].type === 'empty') {
          emptyCells.push([i, j]);
        }
      }
    }

    if (emptyCells.length > 0) {
      const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      const rarity = gameState.moves > 30 ? 'epic' : gameState.moves > 15 ? 'rare' : 'common';
      const specialType = getRandomSpecialCell(rarity);

      board[randomCell[0]][randomCell[1]] = {
        type: 'special',
        special: specialType,
        timer: SPECIAL_CELLS[specialType].duration
      };

      setGameState(prev => ({ ...prev, board }));
    }
  };

  const endGame = async (finalGameState: GameState) => {
    const gameData = {
      winner: finalGameState.score.player > finalGameState.score.ai ? 'player' : 
              finalGameState.score.ai > finalGameState.score.player ? 'ai' : 'tie',
      playerScore: finalGameState.score.player,
      aiScore: finalGameState.score.ai,
      totalMoves: finalGameState.moves,
      gameDuration: (Date.now() - (currentGame?.startTime || Date.now())) / 1000,
      phase: finalGameState.phase,
      combosUsed: finalGameState.comboCount,
      specialCellsActivated: finalGameState.specialCellsUsed,
      averageReactionTime: reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length || 0,
      fastestMove: Math.min(...reactionTimes) || 0,
      slowestMove: Math.max(...reactionTimes) || 0,
      difficultyLevel: getDifficultyValue(),
      aiPersonality: finalGameState.aiPersonality,
      boardFull: true,
      perfectGame: finalGameState.score.ai === 0,
      comboChain: finalGameState.maxComboChain,
      timeBonus: 0,
      dominationRatio: finalGameState.score.player / (finalGameState.score.player + finalGameState.score.ai)
    };

    setGameState(prev => ({ ...prev, gameEnded: true }));

    // Save to Firebase if user is logged in
    if (user) {
      try {
        await saveGameSession({
          userId: user.uid,
          gameData,
          timestamp: new Date().toISOString(),
          duration: gameData.gameDuration,
          aiPersonality: gameData.aiPersonality,
          difficulty: gameData.difficultyLevel,
          achievements: [],
          patterns: []
        });

        await updateUserStats(user.uid, gameData);
      } catch (error) {
        console.error('Error saving game data:', error);
      }
    }

    onGameEnd(gameData);
  };

  const getDifficultyValue = (): number => {
    const difficultyMap = {
      novice: 0.3,
      intermediate: 0.5,
      expert: 0.7,
      master: 0.85,
      quantum: 1.0
    };
    return difficultyMap[settings.difficulty];
  };

  const useAbility = (ability: keyof typeof gameState.playerAbilities) => {
    if (gameState.playerAbilities[ability] <= 0) return;

    switch (ability) {
      case 'vision':
        setShowVision(true);
        setTimeout(() => setShowVision(false), 5000);
        break;
      case 'shield':
        // Implementation for shield ability
        break;
      case 'timeExtra':
        setTimeLeft(prev => prev + 10);
        break;
      case 'steal':
        // Implementation for steal ability
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
    let baseClass = "w-12 h-12 border border-border rounded-lg transition-all duration-300 cursor-pointer relative overflow-hidden ";

    // Apply heatmap coloring
    if (showHeatmap && heatmapData.has(`${row},${col}`)) {
      const intensity = heatmapData.get(`${row},${col}`)! / 10;
      baseClass += `bg-red-500/${Math.floor(intensity * 50)} `;
    }

    // Apply prediction highlighting
    if (showPredictions && predictions.has(`${row},${col}`)) {
      const probability = predictions.get(`${row},${col}`)!;
      baseClass += `bg-green-500/${Math.floor(probability * 30)} `;
    }

    switch (cell.type) {
      case 'empty':
        baseClass += "bg-card/20 hover:bg-card/40 hover:border-neon-cyan/50 hover:scale-105";
        break;
      case 'player':
        baseClass += "bg-neon-cyan/20 border-neon-cyan glow";
        break;
      case 'ai':
        baseClass += "bg-neon-purple/20 border-neon-purple glow";
        break;
      case 'special':
        if (cell.special && SPECIAL_CELLS[cell.special]) {
          const specialConfig = SPECIAL_CELLS[cell.special];
          baseClass += `border-2 animate-pulse bg-gradient-to-br from-current/20 to-current/10`;
          baseClass += ` ${specialConfig.visual.baseColor.replace('#', 'text-')}`;
        }
        break;
    }

    if (showVision && cell.type === 'empty') {
      const prediction = aiEngine.current.generateMove(gameState, getDifficultyValue());
      if (prediction && prediction[0] === row && prediction[1] === col) {
        baseClass += " bg-red-500/30 border-red-500 animate-pulse";
      }
    }

    return baseClass;
  };

  const getCellIcon = (cell: Cell) => {
    if (cell.type !== 'special' || !cell.special) return null;

    const iconMap = {
      bomb: <Zap className="w-6 h-6 text-neon-pink" />,
      portal: <Sparkles className="w-6 h-6 text-neon-purple" />,
      multiplier: <TrendingUp className="w-6 h-6 text-yellow-400" />,
      thief: <Target className="w-6 h-6 text-orange-400" />,
      quantum: <Atom className="w-6 h-6 text-neon-cyan" />,
      neural: <Brain className="w-6 h-6 text-electric-blue" />,
      virus: <Biohazard className="w-6 h-6 text-neon-green" />,
      phoenix: <Circle className="w-6 h-6 text-orange-500" />,
      void: <Circle className="w-6 h-6 text-purple-900" />
    };

    return iconMap[cell.special as keyof typeof iconMap] || <Circle className="w-6 h-6" />;
  };

  const phases = {
    learning: { name: "Aprendizaje", color: "text-neon-cyan", progress: 33 },
    mirror: { name: "Espejo", color: "text-neon-purple", progress: 66 },
    evolution: { name: "Evolución", color: "text-neon-pink", progress: 100 }
  };

  return (
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

              <div className="flex items-center gap-4">
                {gameState.currentPlayer === 'player' && (
                  <div className="flex items-center gap-2">
                    <Timer className="w-4 h-4" />
                    <span className={`font-mono ${timeLeft <= 10 ? 'text-red-400' : 'text-foreground'}`}>
                      {timeLeft}s
                    </span>
                  </div>
                )}
                
                <div className="text-2xl font-bold">
                  <span className="text-neon-cyan">{gameState.score.player}</span>
                  <span className="text-muted-foreground mx-2">-</span>
                  <span className="text-neon-purple">{gameState.score.ai}</span>
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="relative">
              {/* Board Mode Selector */}
              <div className="flex gap-2 mb-4">
                <Button
                  size="sm"
                  variant={gameState.boardMode === 'classic' ? 'default' : 'outline'}
                  onClick={() => setGameState(prev => ({ ...prev, boardMode: 'classic' }))}
                >
                  <Grid3X3 className="w-4 h-4 mr-1" />
                  Clásico
                </Button>
                <Button
                  size="sm"
                  variant={gameState.boardMode === 'hexagonal' ? 'default' : 'outline'}
                  onClick={() => setGameState(prev => ({ ...prev, boardMode: 'hexagonal' }))}
                >
                  <Hexagon className="w-4 h-4 mr-1" />
                  Hexagonal
                </Button>
                <Button
                  size="sm"
                  variant={gameState.boardMode === 'infinite' ? 'default' : 'outline'}
                  onClick={() => setGameState(prev => ({ ...prev, boardMode: 'infinite' }))}
                >
                  <Infinity className="w-4 h-4 mr-1" />
                  Infinito
                </Button>
              </div>

              {/* Render appropriate board */}
              {gameState.boardMode === 'hexagonal' && hexBoard.current ? (
                <HexagonalBoard
                  board={hexBoard.current}
                  onCellClick={(coords) => {
                    // Convert hex coordinates to grid coordinates for compatibility
                    const row = coords.r + 3;
                    const col = coords.q + 3;
                    if (row >= 0 && row < 8 && col >= 0 && col < 8) {
                      handleCellClick(row, col);
                    }
                  }}
                  temporalCycle={gameState.temporalCycle}
                  playerTurn={gameState.currentPlayer === 'player'}
                  heatmapData={showHeatmap ? heatmapData : undefined}
                  showPredictions={showPredictions}
                  predictions={predictions}
                />
              ) : (
                <div className="grid grid-cols-8 gap-2 mb-4">
                  {gameState.board.map((row, rowIndex) =>
                    row.map((cell, colIndex) => (
                      <motion.div
                        key={`${rowIndex}-${colIndex}`}
                        className={getCellStyle(cell, rowIndex, colIndex)}
                        onClick={() => handleCellClick(rowIndex, colIndex)}
                        onMouseDown={() => setClickStartTime(Date.now())}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                          duration: 0.3,
                          delay: (rowIndex + colIndex) * 0.02,
                          type: "spring",
                          stiffness: 200
                        }}
                      >
                        <div className="w-full h-full flex items-center justify-center relative">
                          {getCellIcon(cell)}
                          {cell.timer && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                              {cell.timer}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              )}

              {/* Visual Effects Layer */}
              <VisualEffects
                effects={visualEffects}
                onEffectComplete={(id) => setVisualEffects(prev => prev.filter(e => e.id !== id))}
              />

              {/* Ripple Effects */}
              <AnimatePresence>
                {ripples.map(ripple => (
                  <CellRipple
                    key={ripple.id}
                    position={ripple.position}
                    color={ripple.color}
                    onComplete={() => setRipples(prev => prev.filter(r => r.id !== ripple.id))}
                  />
                ))}
              </AnimatePresence>

              {/* Floating Texts */}
              <AnimatePresence>
                {floatingTexts.map(text => (
                  <FloatingText
                    key={text.id}
                    text={text.text}
                    position={text.position}
                    color={text.color}
                    size={text.size}
                    onComplete={() => setFloatingTexts(prev => prev.filter(t => t.id !== text.id))}
                  />
                ))}
              </AnimatePresence>

              {/* Neural Network Background */}
              {settings.visualEffects && <NeuralNetwork intensity={0.3} />}
            </div>

            {/* Player Abilities */}
            <div className="flex gap-2 mt-4">
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
                +10s ({gameState.playerAbilities.timeExtra})
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
                Dificultad: {(getDifficultyValue() * 100).toFixed(0)}%
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

        {/* Game Stats */}
        <Card className="bg-card/30 backdrop-blur-sm border-neural-gray/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4 text-neon-green" />
              Estadísticas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Movimientos:</span>
              <span>{gameState.moves}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Combos:</span>
              <span className="text-neon-purple">{gameState.comboCount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Cadena máxima:</span>
              <span className="text-neon-pink">{gameState.maxComboChain}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Especiales usadas:</span>
              <span className="text-yellow-400">{gameState.specialCellsUsed}</span>
            </div>
            {reactionTimes.length > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Reacción promedio:</span>
                <span className="text-neon-cyan">
                  {(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length / 1000).toFixed(1)}s
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Mentor Mode */}
        {mentorMode && (
          <Card className="bg-card/30 backdrop-blur-sm border-neon-green/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Brain className="w-4 h-4 text-neon-green" />
                Consejo del Mentor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-neon-green">
                {aiEngine.current.getMentorAdvice()}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}