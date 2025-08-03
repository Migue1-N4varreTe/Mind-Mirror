import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, 
  Trophy,
  Clock,
  Users,
  Star,
  Flame,
  Gift,
  Target,
  Zap,
  Heart,
  Snowflake,
  Sun,
  Leaf,
  ArrowLeft,
  Play,
  Award,
  Crown,
  Sparkles,
  Timer,
  TrendingUp
} from "lucide-react";

interface SeasonalEvent {
  id: string;
  name: string;
  description: string;
  theme: string;
  startDate: string;
  endDate: string;
  type: 'seasonal' | 'tournament' | 'challenge' | 'special' | 'community';
  status: 'upcoming' | 'active' | 'ending_soon' | 'ended';
  participants: number;
  maxParticipants?: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'legendary' | 'mythic';
  rewards: EventReward[];
  progress?: number;
  playerProgress?: number;
  requirements?: string[];
  special_mechanics?: string[];
  leaderboard?: LeaderboardEntry[];
  timeLeft?: number; // hours
}

interface EventReward {
  type: 'title' | 'avatar' | 'theme' | 'xp' | 'ability' | 'achievement' | 'cosmetic';
  name: string;
  description?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  icon: string;
}

interface LeaderboardEntry {
  rank: number;
  username: string;
  score: number;
  avatar: string;
  isCurrentUser?: boolean;
}

export default function Events() {
  const [activeTab, setActiveTab] = useState("current");
  const [currentTime] = useState(new Date());

  const [events, setEvents] = useState<SeasonalEvent[]>([
    {
      id: "valentine-mirror",
      name: "Espejo de San Valentín",
      description: "El amor está en el aire... y en el código. Enfréntate a una IA que entiende el corazón humano.",
      theme: "valentine",
      startDate: "2024-02-10T00:00:00Z",
      endDate: "2024-02-18T23:59:59Z",
      type: "seasonal",
      status: "active",
      participants: 2847,
      maxParticipants: 5000,
      difficulty: "medium",
      timeLeft: 72,
      playerProgress: 65,
      rewards: [
        {
          type: "theme",
          name: "Valentine Hearts",
          description: "Tema visual con corazones flotantes y efectos románticos",
          rarity: "rare",
          icon: "💖"
        },
        {
          type: "title",
          name: "Cupido Digital",
          rarity: "epic",
          icon: "💘"
        },
        {
          type: "avatar",
          name: "Corazón Cuántico",
          rarity: "legendary",
          icon: "💝"
        },
        {
          type: "xp",
          name: "1500 XP",
          rarity: "common",
          icon: "⭐"
        }
      ],
      requirements: [
        "Ganar 5 partidas consecutivas",
        "Usar celdas especiales de corazón 20 veces",
        "Alcanzar fase Evolución con IA 'Empática'"
      ],
      special_mechanics: [
        "Celdas de Corazón: Conectan jugadores emocionalmente",
        "Modo Cupido: La IA intenta 'enamorarte' de estrategias específicas",
        "Sincronización Romántica: Movimientos simultáneos dan bonificación"
      ],
      leaderboard: [
        { rank: 1, username: "LoveHacker", score: 15420, avatar: "💕" },
        { rank: 2, username: "RomanticAI", score: 14890, avatar: "🌹" },
        { rank: 3, username: "HeartBreaker", score: 14250, avatar: "💔" },
        { rank: 17, username: "Tú", score: 8940, avatar: "💖", isCurrentUser: true }
      ]
    },
    {
      id: "quantum-championship",
      name: "Campeonato Cuántico 2024",
      description: "El torneo más prestigioso del año. Solo los mejores pueden competir en las fases cuánticas.",
      theme: "quantum",
      startDate: "2024-03-01T00:00:00Z",
      endDate: "2024-03-15T23:59:59Z",
      type: "tournament",
      status: "upcoming",
      participants: 0,
      maxParticipants: 128,
      difficulty: "mythic",
      rewards: [
        {
          type: "title",
          name: "Campeón Cuántico",
          description: "El título más prestigioso en Mind Mirror",
          rarity: "mythic",
          icon: "👑"
        },
        {
          type: "avatar",
          name: "Corona Dorada",
          rarity: "mythic",
          icon: "🏆"
        },
        {
          type: "cosmetic",
          name: "Efectos Cuánticos Permanentes",
          description: "Partículas especiales únicas",
          rarity: "legendary",
          icon: "⚛️"
        },
        {
          type: "xp",
          name: "5000 XP",
          rarity: "legendary",
          icon: "💫"
        }
      ],
      requirements: [
        "Rating mínimo: 2000",
        "Haber completado 100+ partidas",
        "Poseer al menos 3 logros épicos"
      ],
      special_mechanics: [
        "Formato eliminatorio de bracket doble",
        "Solo IA en modo Evolución permitida",
        "Transmisión en vivo de las finales"
      ]
    },
    {
      id: "neural-network-challenge",
      name: "Desafío Red Neural",
      description: "Conviértete en parte de una red neural global. Cada victoria conecta tu mente con otros jugadores.",
      theme: "neural",
      startDate: "2024-02-20T00:00:00Z",
      endDate: "2024-02-29T23:59:59Z",
      type: "challenge",
      status: "upcoming",
      participants: 156,
      difficulty: "hard",
      playerProgress: 0,
      rewards: [
        {
          type: "achievement",
          name: "Nodo Neural",
          description: "Formaste parte de la red neural global",
          rarity: "rare",
          icon: "🧠"
        },
        {
          type: "ability",
          name: "Conexi��n Neural",
          description: "Nueva habilidad especial en partidas",
          rarity: "epic",
          icon: "⚡"
        }
      ],
      requirements: [
        "Formar equipos de 3 jugadores",
        "Sincronizar estrategias en tiempo real",
        "Vencer a IA colectiva de nivel 85+"
      ],
      special_mechanics: [
        "Juego cooperativo 3v1 contra super-IA",
        "Chat mental: comunicación instantánea",
        "Estrategias compartidas en tiempo real"
      ]
    },
    {
      id: "winter-solstice",
      name: "Solsticio de Invierno",
      description: "En la noche más larga del año, la IA alcanza su máximo poder. ¿Podrás sobrevivir?",
      theme: "winter",
      startDate: "2023-12-21T00:00:00Z",
      endDate: "2023-12-31T23:59:59Z",
      type: "seasonal",
      status: "ended",
      participants: 3420,
      difficulty: "legendary",
      rewards: [
        {
          type: "theme",
          name: "Winter Wonderland",
          rarity: "legendary",
          icon: "❄️"
        },
        {
          type: "title",
          name: "Sobreviviente del Solsticio",
          rarity: "epic",
          icon: "🌙"
        }
      ]
    }
  ]);

  const [communityGoals, setCommunityGoals] = useState({
    current: 284750,
    target: 500000,
    description: "Victorias globales contra IA para desbloquear evento especial",
    reward: "Evento Singularidad - IA consciente de sí misma"
  });

  const getStatusColor = (status: string) => {
    const colors = {
      upcoming: "text-blue-400 border-blue-400 bg-blue-400/10",
      active: "text-neon-green border-neon-green bg-neon-green/10",
      ending_soon: "text-orange-400 border-orange-400 bg-orange-400/10",
      ended: "text-gray-400 border-gray-400 bg-gray-400/10"
    };
    return colors[status as keyof typeof colors];
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      easy: "text-green-400 border-green-400",
      medium: "text-yellow-400 border-yellow-400",
      hard: "text-orange-400 border-orange-400",
      legendary: "text-purple-400 border-purple-400",
      mythic: "text-neon-cyan border-neon-cyan"
    };
    return colors[difficulty as keyof typeof colors];
  };

  const getRarityColor = (rarity: string) => {
    const colors = {
      common: "text-gray-400",
      rare: "text-blue-400",
      epic: "text-purple-400",
      legendary: "text-yellow-400",
      mythic: "text-neon-cyan"
    };
    return colors[rarity as keyof typeof colors];
  };

  const getThemeIcon = (theme: string) => {
    const icons = {
      valentine: <Heart className="w-5 h-5 text-pink-400" />,
      quantum: <Sparkles className="w-5 h-5 text-neon-cyan" />,
      neural: <Target className="w-5 h-5 text-purple-400" />,
      winter: <Snowflake className="w-5 h-5 text-blue-400" />,
      summer: <Sun className="w-5 h-5 text-yellow-400" />,
      spring: <Leaf className="w-5 h-5 text-green-400" />
    };
    return icons[theme as keyof typeof icons] || <Calendar className="w-5 h-5" />;
  };

  const joinEvent = (eventId: string) => {
    setEvents(prev => 
      prev.map(event => 
        event.id === eventId 
          ? { ...event, participants: event.participants + 1 }
          : event
      )
    );
  };

  const formatTimeLeft = (hours: number) => {
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    
    if (days > 0) {
      return `${days}d ${remainingHours}h`;
    }
    return `${remainingHours}h`;
  };

  const activeEvents = events.filter(e => e.status === 'active' || e.status === 'ending_soon');
  const upcomingEvents = events.filter(e => e.status === 'upcoming');
  const pastEvents = events.filter(e => e.status === 'ended');

  return (
    <div className="min-h-screen bg-background neural-grid p-6">
      <div className="max-w-7xl mx-auto">
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
              Eventos & Temporadas
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Participa en eventos exclusivos y desafíos especiales
            </p>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Próximo evento en</div>
            <div className="text-lg font-bold text-neon-cyan">2d 14h</div>
          </div>
        </div>

        {/* Community Goal */}
        <Card className="mb-8 bg-card/30 backdrop-blur-sm border-neon-purple/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-neon-purple" />
              Meta Comunitaria Global
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{communityGoals.description}</p>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progreso Global</span>
                  <span className="font-mono">
                    {communityGoals.current.toLocaleString()} / {communityGoals.target.toLocaleString()}
                  </span>
                </div>
                <Progress 
                  value={(communityGoals.current / communityGoals.target) * 100} 
                  className="h-3"
                />
              </div>
              
              <div className="p-3 bg-neon-purple/10 rounded-lg border border-neon-purple/20">
                <div className="flex items-center gap-2 mb-1">
                  <Gift className="w-4 h-4 text-neon-purple" />
                  <span className="font-semibold text-sm">Recompensa Global</span>
                </div>
                <p className="text-sm text-muted-foreground">{communityGoals.reward}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="current">Eventos Activos</TabsTrigger>
            <TabsTrigger value="upcoming">Próximos</TabsTrigger>
            <TabsTrigger value="leaderboards">Rankings</TabsTrigger>
            <TabsTrigger value="history">Historial</TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="space-y-6">
            {activeEvents.length === 0 ? (
              <Card className="bg-card/30 backdrop-blur-sm border-border">
                <CardContent className="p-12 text-center">
                  <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No hay eventos activos en este momento</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {activeEvents.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className={`bg-card/30 backdrop-blur-sm border-2 ${getStatusColor(event.status)} relative overflow-hidden`}>
                      {/* Background Theme */}
                      <div className="absolute inset-0 opacity-5">
                        {event.theme === 'valentine' && (
                          <div className="w-full h-full bg-gradient-to-br from-pink-400 to-red-400" />
                        )}
                        {event.theme === 'quantum' && (
                          <div className="w-full h-full bg-gradient-to-br from-neon-cyan to-purple-400" />
                        )}
                        {event.theme === 'neural' && (
                          <div className="w-full h-full bg-gradient-to-br from-purple-400 to-blue-400" />
                        )}
                      </div>
                      
                      <CardHeader className="relative z-10">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getThemeIcon(event.theme)}
                            <div>
                              <CardTitle className="text-xl">{event.name}</CardTitle>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className={getStatusColor(event.status)}>
                                  {event.status === 'active' ? 'Activo' : 
                                   event.status === 'ending_soon' ? 'Terminando Pronto' : 
                                   event.status}
                                </Badge>
                                <Badge variant="outline" className={getDifficultyColor(event.difficulty)}>
                                  {event.difficulty}
                                </Badge>
                                {event.timeLeft && (
                                  <Badge variant="outline" className="text-orange-400 border-orange-400">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {formatTimeLeft(event.timeLeft)}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-2xl font-bold text-neon-cyan">
                              {event.participants.toLocaleString()}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {event.maxParticipants ? `/ ${event.maxParticipants.toLocaleString()}` : ''} participantes
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="relative z-10 space-y-6">
                        <p className="text-muted-foreground">{event.description}</p>
                        
                        {/* Player Progress */}
                        {event.playerProgress !== undefined && (
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span>Tu Progreso</span>
                              <span className="font-mono">{event.playerProgress}%</span>
                            </div>
                            <Progress value={event.playerProgress} className="h-3" />
                          </div>
                        )}

                        <div className="grid md:grid-cols-3 gap-6">
                          {/* Requirements */}
                          {event.requirements && (
                            <div>
                              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                <Target className="w-4 h-4 text-neon-purple" />
                                Requisitos
                              </h4>
                              <ul className="space-y-1">
                                {event.requirements.map((req, i) => (
                                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                    <span className="text-neon-purple mt-1">•</span>
                                    {req}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Special Mechanics */}
                          {event.special_mechanics && (
                            <div>
                              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                <Zap className="w-4 h-4 text-neon-cyan" />
                                Mecánicas Especiales
                              </h4>
                              <ul className="space-y-1">
                                {event.special_mechanics.map((mechanic, i) => (
                                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                    <span className="text-neon-cyan mt-1">•</span>
                                    {mechanic}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Rewards */}
                          <div>
                            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                              <Gift className="w-4 h-4 text-yellow-400" />
                              Recompensas
                            </h4>
                            <div className="space-y-2">
                              {event.rewards.map((reward, i) => (
                                <div key={i} className="flex items-center gap-2">
                                  <span className="text-lg">{reward.icon}</span>
                                  <div className="flex-1">
                                    <div className={`text-sm font-medium ${getRarityColor(reward.rarity)}`}>
                                      {reward.name}
                                    </div>
                                    {reward.description && (
                                      <div className="text-xs text-muted-foreground">
                                        {reward.description}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <Button 
                            onClick={() => joinEvent(event.id)}
                            disabled={event.status === 'ended'}
                            className="flex-1"
                          >
                            <Play className="w-4 h-4 mr-2" />
                            {event.playerProgress ? 'Continuar' : 'Participar'}
                          </Button>
                          <Button variant="outline">
                            <TrendingUp className="w-4 h-4 mr-2" />
                            Ver Rankings
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {upcomingEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-card/30 backdrop-blur-sm border-blue-400/20 hover:border-blue-400/40 transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        {getThemeIcon(event.theme)}
                        <div className="flex-1">
                          <CardTitle className="text-lg">{event.name}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className={getDifficultyColor(event.difficulty)}>
                              {event.difficulty}
                            </Badge>
                            <Badge variant="outline" className="text-blue-400 border-blue-400">
                              {new Date(event.startDate).toLocaleDateString()}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                      
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Principales Recompensas</h4>
                        <div className="space-y-1">
                          {event.rewards.slice(0, 3).map((reward, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <span>{reward.icon}</span>
                              <span className={`text-sm ${getRarityColor(reward.rarity)}`}>
                                {reward.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Button variant="outline" className="w-full">
                        <Timer className="w-4 h-4 mr-2" />
                        Recordar Evento
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="leaderboards" className="space-y-6">
            {activeEvents.filter(e => e.leaderboard).map(event => (
              <Card key={event.id} className="bg-card/30 backdrop-blur-sm border-neon-cyan/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-yellow-400" />
                    Rankings - {event.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {event.leaderboard!.map((entry) => (
                      <div
                        key={entry.rank}
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          entry.isCurrentUser 
                            ? "border-neon-cyan bg-neon-cyan/5" 
                            : "border-border"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-center min-w-[2rem]">
                            {entry.rank <= 3 ? (
                              <span className="text-2xl">
                                {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'}
                              </span>
                            ) : (
                              <span className="font-bold text-muted-foreground">#{entry.rank}</span>
                            )}
                          </div>
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center text-lg">
                            {entry.avatar}
                          </div>
                          <div>
                            <div className="font-bold">{entry.username}</div>
                            {entry.isCurrentUser && (
                              <Badge variant="outline" className="text-neon-cyan border-neon-cyan text-xs">
                                Tú
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-neon-purple">
                            {entry.score.toLocaleString()}
                          </div>
                          <div className="text-xs text-muted-foreground">puntos</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pastEvents.map((event) => (
                <Card key={event.id} className="bg-card/30 backdrop-blur-sm border-gray-400/20 opacity-75">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      {getThemeIcon(event.theme)}
                      <div>
                        <CardTitle className="text-lg">{event.name}</CardTitle>
                        <Badge variant="outline" className="text-gray-400 border-gray-400 text-xs">
                          Finalizado
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{event.description}</p>
                    <div className="text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Participantes:</span>
                        <span>{event.participants.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Finalizado:</span>
                        <span>{new Date(event.endDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
