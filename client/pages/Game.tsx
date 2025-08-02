import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { VisualEffects, CellRipple, FloatingText, NeuralNetwork } from "@/components/ui/visual-effects";
import { MindMirrorAI, ComboSystem } from "@/lib/gameEngine";
import { SPECIAL_CELLS, getRandomSpecialCell, getSpecialCellSpawnChance } from "@/lib/specialCells";
import { AchievementSystem, calculateGameEndData, type Achievement, type GameEndData } from "@/lib/achievementSystem";
import GameEndModal from "@/components/GameEndModal";
import { motion, AnimatePresence } from "framer-motion";
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
  Sparkles,
  Atom,
  Biohazard,
  Circle
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
  difficulty: number;
  multiplierActive: boolean;
  shieldActive: boolean;
  comboCount: number;
  totalScore: { player: number; ai: number };
  gameEnded: boolean;
  specialCellsUsed: number;
  maxComboChain: number;
  currentComboChain: number;
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
    },
    difficulty: 0.5,
    multiplierActive: false,
    shieldActive: false,
    comboCount: 0,
    totalScore: { player: 0, ai: 0 },
    gameEnded: false,
    specialCellsUsed: 0,
    maxComboChain: 0,
    currentComboChain: 0,
    // Advanced features
    boardMode: 'classic',
    gameMode: 'normal',
    temporalCycle: 0,
    showHeatmap: false,
    showPredictions: false,
    mentorMode: false,
    currentTheme: 'calm',
    storyMode: false
  });

  const aiEngine = useRef(new MindMirrorAI());
  const comboSystem = useRef(new ComboSystem());
  const achievementSystem = useRef(new AchievementSystem());
  const [visualEffects, setVisualEffects] = useState<any[]>([]);
  const [ripples, setRipples] = useState<any[]>([]);
  const [floatingTexts, setFloatingTexts] = useState<any[]>([]);
  const [clickStartTime, setClickStartTime] = useState<number>(0);
  const [gameStartTime] = useState(Date.now());
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [gameEndData, setGameEndData] = useState<GameEndData | null>(null);
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);
  const [showGameEndModal, setShowGameEndModal] = useState(false);

  const [timeLeft, setTimeLeft] = useState(30);
  const [isThinking, setIsThinking] = useState(false);
  const [aiThought, setAiThought] = useState("Observando tus patrones...");
  const [lastClickTime, setLastClickTime] = useState<number[]>([]);
  const [showVision, setShowVision] = useState(false);
  const [gameProgress, setGameProgress] = useState(0);

  // Advanced features state
  const [heatmapData, setHeatmapData] = useState<Map<string, number>>(new Map());
  const [predictions, setPredictions] = useState<Map<string, number>>(new Map());
  const [currentNarrative, setCurrentNarrative] = useState<string>("");
  const [mentorAdvice, setMentorAdvice] = useState<string>("");
  const [dynamicCSS, setDynamicCSS] = useState<string>("");
  const [storyEffects, setStoryEffects] = useState<any[]>([]);
  const [personalityHistory, setPersonalityHistory] = useState<string[]>([]);

  // Mode switching functions
  const toggleBoardMode = () => {
    const modes: BoardMode[] = ['classic', 'hexagonal', 'infinite'];
    const currentIndex = modes.indexOf(gameState.boardMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];

    setGameState(prev => ({
      ...prev,
      boardMode: nextMode,
      hexBoard: nextMode === 'hexagonal' ? new HexBoard(3) : undefined,
      infiniteBoard: nextMode === 'infinite' ? new InfiniteBoardEngine(8) : undefined
    }));
  };

  const toggleGameMode = () => {
    const modes: GameMode[] = ['normal', 'temporal', 'heatmap', 'story'];
    const currentIndex = modes.indexOf(gameState.gameMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];

    setGameState(prev => ({
      ...prev,
      gameMode: nextMode,
      showHeatmap: nextMode === 'heatmap',
      storyMode: nextMode === 'story',
      temporalCycle: nextMode === 'temporal' ? 1 : 0
    }));
  };

  const toggleMentorMode = () => {
    const newMentorMode = !gameState.mentorMode;
    aiEngine.current.enableMentorMode(newMentorMode);
    setGameState(prev => ({ ...prev, mentorMode: newMentorMode }));

    if (newMentorMode) {
      setMentorAdvice(aiEngine.current.getMentorAdvice());
    }
  };

  const togglePredictions = () => {
    setGameState(prev => ({ ...prev, showPredictions: !prev.showPredictions }));
  };

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

  // Initialize special cells with new system
  useEffect(() => {
    const newBoard = [...gameState.board];
    // Add enhanced special cells
    for (let i = 0; i < 4; i++) {
      const row = Math.floor(Math.random() * 8);
      const col = Math.floor(Math.random() * 8);
      if (newBoard[row][col].type === 'empty') {
        const specialType = getRandomSpecialCell(Math.random() > 0.7 ? 'rare' : 'common');
        newBoard[row][col] = {
          type: 'special',
          special: specialType,
          charges: SPECIAL_CELLS[specialType].charges,
          timer: SPECIAL_CELLS[specialType].duration
        };
      }
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

  // Enhanced AI thinking with engine integration
  useEffect(() => {
    if (isThinking) {
      const interval = setInterval(() => {
        setAiThought(aiEngine.current.getAIThought());

        // Check for AI personality changes
        const currentPersonalityData = aiEngine.current.getCurrentPersonalityData();
        if (currentPersonalityData && currentPersonalityData.name !== gameState.aiPersonality) {
          setPersonalityHistory(prev => [...prev, `${gameState.aiPersonality} → ${currentPersonalityData.name}`]);
        }
      }, 2000);
      return () => clearInterval(interval);
    } else {
      setAiThought(aiEngine.current.getPersonalityInsight());
    }
  }, [isThinking, gameState.moves, gameState.aiPersonality]);

  // Dynamic theme updates
  useEffect(() => {
    themeEngine.current.onThemeChange((newTheme) => {
      setGameState(prev => ({ ...prev, currentTheme: newTheme.id }));
      setDynamicCSS(themeEngine.current.getThemeCSS());
    });
  }, []);

  // Temporal cycle updates
  useEffect(() => {
    if (gameState.gameMode === 'temporal' && gameState.temporalCycle > 0) {
      const interval = setInterval(() => {
        setGameState(prev => ({
          ...prev,
          temporalCycle: prev.temporalCycle + 1
        }));
      }, 5000); // 5 second cycles

      return () => clearInterval(interval);
    }
  }, [gameState.gameMode, gameState.temporalCycle]);

  // Update heatmap and predictions
  useEffect(() => {
    if (gameState.showHeatmap || gameState.showPredictions) {
      const newHeatmap = heatmapAnalyzer.current.getHeatmapForBoard(8);
      setHeatmapData(newHeatmap);

      if (gameState.showPredictions) {
        const analytics = aiEngine.current.exportAnalytics();
        const newPredictions = movementPredictor.current.updatePredictions(
          gameState,
          analytics.recentPatterns,
          analytics
        );
        setPredictions(newPredictions);
      }
    }
  }, [gameState.moves, gameState.showHeatmap, gameState.showPredictions]);

  // Story mode narrative updates
  useEffect(() => {
    if (gameState.storyMode) {
      const narrative = storyEngine.current.getCurrentNarrative();
      setCurrentNarrative(narrative);

      const effects = storyEngine.current.getActiveEffects();
      setStoryEffects(effects);
    }
  }, [gameState.moves, gameState.storyMode]);

  // Mentor advice updates
  useEffect(() => {
    if (gameState.mentorMode && gameState.moves > 0) {
      const advice = aiEngine.current.getMentorAdvice();
      setMentorAdvice(advice);
    }
  }, [gameState.moves, gameState.mentorMode]);

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

  const playAgain = useCallback(() => {
    setGameState({
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
      },
      difficulty: 0.5,
      multiplierActive: false,
      shieldActive: false,
      comboCount: 0,
      totalScore: { player: 0, ai: 0 },
      gameEnded: false,
      specialCellsUsed: 0,
      maxComboChain: 0,
      currentComboChain: 0
    });
    setReactionTimes([]);
    setTimeLeft(30);
    setShowGameEndModal(false);
    setGameEndData(null);
    setNewAchievements([]);
    setVisualEffects([]);
    setRipples([]);
    setFloatingTexts([]);
  }, []);

  const handleCellClick = useCallback((row: number, col: number) => {
    if (gameState.currentPlayer !== 'player' || gameState.gameEnded) return;

    const cell = gameState.board[row][col];
    if (cell.type !== 'empty' && cell.type !== 'special') return;

    const now = Date.now();
    const reactionTime = clickStartTime > 0 ? now - clickStartTime : 2000;
    setLastClickTime(prev => [...prev.slice(-4), now]);
    setReactionTimes(prev => [...prev, reactionTime]);

    // Add to AI learning with enhanced data
    aiEngine.current.addPlayerMove([row, col], reactionTime);

    // Update heatmap with decision data
    heatmapAnalyzer.current.addDataPoint({
      position: [row, col],
      intensity: Math.min(1, 2000 / reactionTime), // Faster = higher intensity
      type: 'decision',
      timestamp: now,
      metadata: { reactionTime, confidence: gameState.moves > 5 ? 0.7 : 0.4 }
    });

    // Update dynamic theme based on reaction
    themeEngine.current.updateEmotionalState({
      reactionTime,
      confidence: Math.max(0, 1 - (reactionTime / 3000)),
      consecutiveSuccesses: gameState.currentComboChain
    });

    // Add story event
    if (gameState.storyMode) {
      storyEngine.current.addGameEvent({
        type: 'move',
        position: [row, col],
        player: 'human',
        data: { reactionTime, confidence: 1 - (reactionTime / 3000) },
        intensity: Math.min(1, 2000 / reactionTime)
      });
    }

    const newBoard = [...gameState.board];
    let scoreGain = 1;
    let effectsToAdd: any[] = [];
    let textsToAdd: any[] = [];

    // Handle special cell activation
    if (cell.type === 'special' && cell.special) {
      const specialCell = SPECIAL_CELLS[cell.special];
      const effect = specialCell.effect.onActivate?.(newBoard, [row, col], 'player');

      // Track special cell usage
      setGameState(prev => ({ ...prev, specialCellsUsed: prev.specialCellsUsed + 1 }));

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
    } else {
      newBoard[row][col] = { type: 'player', owner: 'player', glow: true };
    }

    // Check for combos
    const combos = comboSystem.current.checkCombos(newBoard, [row, col], 'player');
    if (combos.length > 0) {
      const newComboChain = gameState.currentComboChain + 1;
      const maxChain = Math.max(gameState.maxComboChain, newComboChain);

      combos.forEach((combo, comboIndex) => {
        scoreGain *= 2; // Combo multiplier
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
        maxComboChain: maxChain
      }));
    } else {
      setGameState(prev => ({ ...prev, currentComboChain: 0 }));
    }

    // Apply multiplier if active
    if (gameState.multiplierActive) {
      scoreGain *= 2;
      setGameState(prev => ({ ...prev, multiplierActive: false }));
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
      score: { ...gameState.score, player: gameState.score.player + scoreGain },
      totalScore: { ...gameState.totalScore, player: gameState.totalScore.player + scoreGain },
      moves: gameState.moves + 1,
      comboCount: gameState.comboCount + combos.length
    };

    setGameState(updatedGameState);

    // Add visual effects
    if (effectsToAdd.length > 0) {
      setVisualEffects(prev => [...prev, ...effectsToAdd]);
    }
    if (textsToAdd.length > 0) {
      setFloatingTexts(prev => [...prev, ...textsToAdd]);
    }

    setTimeLeft(30);
    setClickStartTime(0);

    // Check if game should end (board full)
    const isEmpty = newBoard.flat().some(cell => cell.type === 'empty');
    if (!isEmpty) {
      endGame(updatedGameState);
      return;
    }

    // Trigger AI move after delay
    setTimeout(() => {
      aiMove();
    }, Math.random() * 1500 + 800);
  }, [gameState, clickStartTime]);

  const endGame = useCallback((finalGameState: any) => {
    const endData = calculateGameEndData(finalGameState, gameStartTime, reactionTimes);

    // Update end data with additional tracked info
    const enhancedEndData = {
      ...endData,
      specialCellsActivated: finalGameState.specialCellsUsed,
      comboChain: finalGameState.maxComboChain,
      combosUsed: finalGameState.comboCount
    };

    // Check achievements
    const unlockedAchievements = achievementSystem.current.checkAchievements(enhancedEndData);

    setGameEndData(enhancedEndData);
    setNewAchievements(unlockedAchievements);
    setGameState(prev => ({ ...prev, gameEnded: true }));
    setShowGameEndModal(true);
  }, [gameStartTime, reactionTimes]);

  const aiMove = useCallback(() => {
    setIsThinking(true);

    setTimeout(() => {
      const aiPosition = aiEngine.current.generateMove(gameState, gameState.difficulty);

      // Record AI personality if it changed
      const currentPersonality = aiEngine.current.getCurrentPersonalityData();
      if (currentPersonality && currentPersonality.name !== gameState.aiPersonality) {
        setGameState(prev => ({
          ...prev,
          aiPersonality: currentPersonality.name as AIPersonality
        }));

        if (gameState.storyMode) {
          storyEngine.current.addGameEvent({
            type: 'ai_personality',
            player: 'ai',
            data: { oldPersonality: gameState.aiPersonality, newPersonality: currentPersonality.name },
            intensity: 0.9
          });
        }
      }

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

        // Check for AI combos
        const combos = comboSystem.current.checkCombos(newBoard, [aiRow, aiCol], 'ai');
        if (combos.length > 0) {
          scoreGain *= 2;
          combos.forEach((combo, comboIndex) => {
            effectsToAdd.push({
              id: `ai-combo-${Date.now()}-${comboIndex}`,
              type: 'combo',
              position: { x: aiCol * 48 + 24, y: aiRow * 48 + 24 }
            });
          });
        }

        // Add AI ripple effect
        setRipples(prev => [...prev, {
          id: `ai-ripple-${Date.now()}`,
          position: { x: aiCol * 48 + 24, y: aiRow * 48 + 24 },
          color: '#9d4edd'
        }]);

        const updatedAIGameState = {
          ...gameState,
          board: newBoard,
          currentPlayer: 'player' as const,
          score: { ...gameState.score, ai: gameState.score.ai + scoreGain },
          totalScore: { ...gameState.totalScore, ai: gameState.totalScore.ai + scoreGain },
          moves: gameState.moves + 1,
          difficulty: Math.min(1, gameState.difficulty + 0.02) // Gradual difficulty increase
        };

        setGameState(updatedAIGameState);

        // Add visual effects
        if (effectsToAdd.length > 0) {
          setVisualEffects(prev => [...prev, ...effectsToAdd]);
        }
        if (textsToAdd.length > 0) {
          setFloatingTexts(prev => [...prev, ...textsToAdd]);
        }

        // Check if game should end (board full)
        const isEmpty = newBoard.flat().some(cell => cell.type === 'empty');
        if (!isEmpty) {
          endGame(updatedAIGameState);
          return;
        }

        // Spawn new special cells occasionally
        if (Math.random() < getSpecialCellSpawnChance(gameProgress)) {
          const emptyCells: [number, number][] = [];
          for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
              if (newBoard[i][j].type === 'empty') {
                emptyCells.push([i, j]);
              }
            }
          }

          if (emptyCells.length > 0) {
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            const rarity = gameProgress > 0.5 ? 'rare' : 'common';
            const specialType = getRandomSpecialCell(Math.random() > 0.8 ? 'epic' : rarity);

            newBoard[randomCell[0]][randomCell[1]] = {
              type: 'special',
              special: specialType,
              timer: SPECIAL_CELLS[specialType].duration
            };

            setGameState(prev => ({ ...prev, board: newBoard }));
          }
        }
      }

      setIsThinking(false);
      setTimeLeft(30);
    }, 1500 + Math.random() * 1000);
  }, [gameState, gameProgress]);

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
    let baseClass = "w-12 h-12 border border-border rounded-lg transition-all duration-300 cursor-pointer relative overflow-hidden ";

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
          baseClass += `border-2 animate-pulse`;
          baseClass += ` bg-gradient-to-br from-${specialConfig.visual.baseColor}/20 to-${specialConfig.visual.glowColor}/10`;

          switch (specialConfig.visual.animation) {
            case 'spin':
              baseClass += ' animate-spin';
              break;
            case 'pulse':
              baseClass += ' animate-pulse';
              break;
            case 'glow':
              baseClass += ' pulse-glow';
              break;
            case 'quantum':
              baseClass += ' quantum-border';
              break;
          }
        } else {
          baseClass += "bg-neon-pink/20 border-neon-pink animate-pulse";
        }
        break;
    }

    if (cell.glow) {
      baseClass += " pulse-glow";
    }

    if (showVision && cell.type === 'empty') {
      // Enhanced AI prediction visualization
      const prediction = aiEngine.current.generateMove(gameState, gameState.difficulty);
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

  // Effect cleanup handlers
  const handleEffectComplete = (id: string) => {
    setVisualEffects(prev => prev.filter(effect => effect.id !== id));
  };

  const handleRippleComplete = (id: string) => {
    setRipples(prev => prev.filter(ripple => ripple.id !== id));
  };

  const handleTextComplete = (id: string) => {
    setFloatingTexts(prev => prev.filter(text => text.id !== id));
  };

  return (
    <div className="min-h-screen bg-background neural-grid p-6 dynamic-theme">
      <style jsx>{`
        .hexagonal-grid {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 4px;
        }

        .hexagonal-grid > div {
          clip-path: polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%);
          width: 48px;
          height: 48px;
          margin: 2px;
        }

        .quantum-border {
          border-image: linear-gradient(45deg, #00f5ff, #9d4edd, #00f5ff) 1;
          animation: quantum-pulse 2s infinite;
        }

        .pulse-glow {
          animation: pulse-glow 1.5s ease-in-out infinite alternate;
        }

        @keyframes quantum-pulse {
          0%, 100% {
            border-image: linear-gradient(45deg, #00f5ff, #9d4edd, #00f5ff) 1;
            filter: brightness(1);
          }
          50% {
            border-image: linear-gradient(45deg, #9d4edd, #00f5ff, #9d4edd) 1;
            filter: brightness(1.2);
          }
        }

        @keyframes pulse-glow {
          from {
            box-shadow: 0 0 5px currentColor;
          }
          to {
            box-shadow: 0 0 15px currentColor, 0 0 25px currentColor;
          }
        }

        .neural-grid::before {
          background-size: 30px 30px;
          background-image:
            linear-gradient(to right, rgba(0, 245, 255, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 245, 255, 0.1) 1px, transparent 1px);
        }
      `}</style>
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
          
          <div className="text-right space-y-2">
            <div className="text-2xl font-bold">
              <span className="text-neon-cyan">{gameState.score.player}</span>
              <span className="text-muted-foreground mx-2">-</span>
              <span className="text-neon-purple">{gameState.score.ai}</span>
            </div>
            <div className="text-sm text-muted-foreground">Movimientos: {gameState.moves}</div>

            {/* Advanced Mode Indicators */}
            <div className="flex gap-1 text-xs">
              <Badge variant="outline" className="text-neon-cyan">
                {gameState.boardMode}
              </Badge>
              <Badge variant="outline" className="text-neon-purple">
                {gameState.gameMode}
              </Badge>
              {gameState.mentorMode && (
                <Badge variant="outline" className="text-neon-green">
                  Mentor
                </Badge>
              )}
              {gameState.showPredictions && (
                <Badge variant="outline" className="text-yellow-400">
                  Predictor
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Advanced Features Control Panel */}
        <Card className="mb-6 bg-card/20 backdrop-blur-sm border-neon-cyan/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Sparkles className="w-4 h-4 text-neon-cyan" />
              Características Avanzadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button
                size="sm"
                variant="outline"
                onClick={toggleBoardMode}
                className="border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan/10"
              >
                Tablero: {gameState.boardMode}
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={toggleGameMode}
                className="border-neon-purple/50 text-neon-purple hover:bg-neon-purple/10"
              >
                Modo: {gameState.gameMode}
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={toggleMentorMode}
                className={`border-neon-green/50 hover:bg-neon-green/10 ${
                  gameState.mentorMode ? 'text-neon-green bg-neon-green/20' : 'text-neon-green'
                }`}
              >
                <Brain className="w-3 h-3 mr-1" />
                Mentor IA
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={togglePredictions}
                className={`border-yellow-400/50 hover:bg-yellow-400/10 ${
                  gameState.showPredictions ? 'text-yellow-400 bg-yellow-400/20' : 'text-yellow-400'
                }`}
              >
                <Target className="w-3 h-3 mr-1" />
                Predictor
              </Button>
            </div>
          </CardContent>
        </Card>

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
                <div className="relative">
                  {/* Dynamic CSS Injection */}
                  {dynamicCSS && (
                    <style dangerouslySetInnerHTML={{ __html: dynamicCSS }} />
                  )}

                  <div className={`grid gap-2 mb-4 ${gameState.boardMode === 'hexagonal' ? 'hexagonal-grid' : 'grid-cols-8'}`}>
                    {gameState.board.map((row, rowIndex) =>
                      row.map((cell, colIndex) => {
                        const cellKey = `${rowIndex},${colIndex}`;
                        const heatIntensity = heatmapData.get(cellKey) || 0;
                        const predictionValue = predictions.get(cellKey) || 0;

                        return (
                          <motion.div
                            key={`${rowIndex}-${colIndex}`}
                            className={`${getCellStyle(cell, rowIndex, colIndex)} dynamic-card`}
                            onClick={() => handleCellClick(rowIndex, colIndex)}
                            onMouseDown={() => setClickStartTime(Date.now())}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{
                              scale: 1,
                              opacity: 1,
                              backgroundColor: gameState.showHeatmap && heatIntensity > 0
                                ? `rgba(255, ${255 - heatIntensity * 200}, ${255 - heatIntensity * 200}, 0.3)`
                                : undefined
                            }}
                            transition={{
                              duration: 0.3,
                              delay: (rowIndex + colIndex) * 0.02,
                              type: "spring",
                              stiffness: 200
                            }}
                            style={{
                              background: gameState.gameMode === 'temporal' && gameState.temporalCycle % 6 === (rowIndex + colIndex) % 6
                                ? 'linear-gradient(45deg, rgba(0,255,0,0.3), rgba(0,255,255,0.3))'
                                : undefined
                            }}
                          >
                            <div className="w-full h-full flex items-center justify-center relative">
                              {getCellIcon(cell)}

                              {/* Heatmap intensity indicator */}
                              {gameState.showHeatmap && heatIntensity > 0.5 && (
                                <div className="absolute top-0 right-0 w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                              )}

                              {/* Prediction indicator */}
                              {gameState.showPredictions && predictionValue > 0.3 && (
                                <div className="absolute bottom-0 left-0 w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                              )}

                              {/* Temporal cell indicator */}
                              {gameState.gameMode === 'temporal' && gameState.temporalCycle % 6 === (rowIndex + colIndex) % 6 && (
                                <div className="absolute inset-0 border-2 border-green-400 rounded animate-pulse" />
                              )}

                              {cell.timer && (
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                                  {cell.timer}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        );
                      })
                    )}
                  </div>

                  {/* Story Mode Narrative Display */}
                  {gameState.storyMode && currentNarrative && (
                    <motion.div
                      className="mb-4 p-3 bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-lg border border-purple-500/50"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <p className="text-sm font-mono text-purple-300 italic">
                        📖 {currentNarrative}
                      </p>
                    </motion.div>
                  )}

                  {/* Mentor Advice Display */}
                  {gameState.mentorMode && mentorAdvice && (
                    <motion.div
                      className="mb-4 p-3 bg-gradient-to-r from-green-900/30 to-cyan-900/30 rounded-lg border border-green-500/50"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <p className="text-sm font-mono text-green-300">
                        🧠 {mentorAdvice}
                      </p>
                    </motion.div>
                  )}

                  {/* Visual Effects Layer */}
                  <VisualEffects
                    effects={visualEffects}
                    onEffectComplete={handleEffectComplete}
                  />

                  {/* Story Mode Effects */}
                  <AnimatePresence>
                    {storyEffects.map(effect => (
                      <motion.div
                        key={effect.id}
                        className="absolute pointer-events-none"
                        style={{
                          left: effect.position?.x || '50%',
                          top: effect.position?.y || '50%',
                          transform: 'translate(-50%, -50%)'
                        }}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{
                          scale: [0, 1.2, 1],
                          opacity: [0, 1, 0.8, 0],
                          rotate: effect.type === 'spiral' ? [0, 360] : 0
                        }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{
                          duration: effect.duration / 1000 || 2,
                          ease: "easeOut"
                        }}
                      >
                        <div
                          className="w-16 h-16 rounded-full"
                          style={{
                            background: `radial-gradient(circle, ${effect.color || '#fff'}AA, transparent)`,
                            boxShadow: `0 0 20px ${effect.color || '#fff'}88`
                          }}
                        />
                        {effect.narrative && (
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-black/80 rounded text-xs text-white whitespace-nowrap">
                            {effect.narrative.substring(0, 30)}...
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Ripple Effects */}
                  <AnimatePresence>
                    {ripples.map(ripple => (
                      <CellRipple
                        key={ripple.id}
                        position={ripple.position}
                        color={ripple.color}
                        onComplete={() => handleRippleComplete(ripple.id)}
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
                        onComplete={() => handleTextComplete(text.id)}
                      />
                    ))}
                  </AnimatePresence>
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
                  Análisis Avanzado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-xs">
                  {/* Personality Changes */}
                  {personalityHistory.length > 0 && (
                    <div>
                      <div className="font-semibold text-purple-400">Cambios de Personalidad:</div>
                      {personalityHistory.slice(-2).map((change, index) => (
                        <div key={index} className="font-mono text-muted-foreground">
                          {change}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Heatmap Analysis */}
                  {gameState.showHeatmap && (
                    <div>
                      <div className="font-semibold text-red-400">Zonas Calientes:</div>
                      <div className="font-mono text-muted-foreground">
                        Detectadas: {Array.from(heatmapData.values()).filter(v => v > 0.5).length} áreas
                      </div>
                    </div>
                  )}

                  {/* Prediction Stats */}
                  {gameState.showPredictions && (
                    <div>
                      <div className="font-semibold text-yellow-400">Predicciones:</div>
                      <div className="font-mono text-muted-foreground">
                        Confianza: {Math.round(Array.from(predictions.values()).reduce((a, b) => a + b, 0) / predictions.size * 100) || 0}%
                      </div>
                    </div>
                  )}

                  {/* Temporal Cycle */}
                  {gameState.gameMode === 'temporal' && (
                    <div>
                      <div className="font-semibold text-green-400">Ciclo Temporal:</div>
                      <div className="font-mono text-muted-foreground">
                        Fase {gameState.temporalCycle % 6 + 1}/6
                      </div>
                    </div>
                  )}

                  {/* Story Arc */}
                  {gameState.storyMode && (
                    <div>
                      <div className="font-semibold text-purple-400">Historia:</div>
                      <div className="font-mono text-muted-foreground">
                        Arco: {storyEngine.current.getStoryArc()}
                      </div>
                    </div>
                  )}

                  {/* Original patterns */}
                  {gameState.aiLearning.slice(-2).map((pattern, index) => {
                    const [coords] = pattern.split(':');
                    return (
                      <div key={index} className="font-mono text-muted-foreground">
                        Patrón: {coords}
                      </div>
                    );
                  })}

                  {gameState.aiLearning.length === 0 && !personalityHistory.length && (
                    <div className="text-muted-foreground">
                      Recopilando datos...
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Advanced Theme Indicator */}
            <Card className="bg-card/30 backdrop-blur-sm border-neural-gray/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Sparkles className="w-4 h-4 text-neon-pink" />
                  Estado Emocional
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span>Tema Actual:</span>
                    <Badge variant="outline" className="dynamic-accent">
                      {gameState.currentTheme}
                    </Badge>
                  </div>

                  {reactionTimes.length > 0 && (
                    <>
                      <div className="flex justify-between">
                        <span>Tiempo Promedio:</span>
                        <span className="font-mono">
                          {Math.round(reactionTimes.slice(-5).reduce((a, b) => a + b, 0) / Math.min(5, reactionTimes.length))}ms
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span>Estado:</span>
                        <span className={`font-mono ${
                          reactionTimes.slice(-1)[0] < 1500 ? 'text-yellow-400' :
                          reactionTimes.slice(-1)[0] > 3000 ? 'text-blue-400' : 'text-green-400'
                        }`}>
                          {reactionTimes.slice(-1)[0] < 1500 ? 'Rápido' :
                           reactionTimes.slice(-1)[0] > 3000 ? 'Reflexivo' : 'Equilibrado'}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
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
    </div>
  );
}
