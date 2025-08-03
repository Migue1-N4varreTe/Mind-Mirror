import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  Trophy, 
  Crown, 
  Sword,
  Heart,
  MessageCircle,
  UserPlus,
  ArrowLeft,
  Zap,
  Target,
  Brain,
  Flame,
  Star,
  TrendingUp,
  Calendar,
  Clock,
  Search,
  Filter,
  Award,
  Sparkles
} from "lucide-react";

interface Player {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  level: number;
  rating: number;
  rank: number;
  title: string;
  status: 'online' | 'playing' | 'offline';
  lastSeen: string;
  winRate: number;
  gamesPlayed: number;
  favoritePersonality: string;
  isFriend: boolean;
  isRival: boolean;
}

interface LeaderboardEntry {
  rank: number;
  player: Player;
  score: number;
  change: number; // position change from last week
  streak: number;
}

interface Event {
  id: string;
  name: string;
  description: string;
  type: 'tournament' | 'challenge' | 'seasonal' | 'special';
  startDate: string;
  endDate: string;
  participants: number;
  maxParticipants?: number;
  rewards: string[];
  difficulty: 'easy' | 'medium' | 'hard' | 'legendary';
  status: 'upcoming' | 'active' | 'ended';
  progress?: number;
}

interface Challenge {
  id: string;
  challenger: Player;
  challenged: Player;
  status: 'pending' | 'accepted' | 'completed' | 'declined';
  gameType: 'ranked' | 'casual' | 'ai_hybrid';
  wager?: string;
  timeLimit: number;
  createdAt: string;
}

export default function Social() {
  const [activeTab, setActiveTab] = useState("leaderboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRank, setFilterRank] = useState("all");

  // Sample data - in real app this would come from API
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([
    {
      rank: 1,
      player: {
        id: "1",
        username: "QuantumMaster",
        displayName: "Maestro Cuántico",
        avatar: "⚛️",
        level: 28,
        rating: 2847,
        rank: 1,
        title: "Susurrador de IA",
        status: "online",
        lastSeen: "Ahora",
        winRate: 89.2,
        gamesPlayed: 234,
        favoritePersonality: "Camaleón",
        isFriend: false,
        isRival: true
      },
      score: 2847,
      change: 0,
      streak: 12
    },
    {
      rank: 2,
      player: {
        id: "2",
        username: "NeuralHacker",
        displayName: "Hackear Neural",
        avatar: "🧠",
        level: 25,
        rating: 2634,
        rank: 2,
        title: "Rompedor de Patrones",
        status: "playing",
        lastSeen: "Jugando ahora",
        winRate: 85.7,
        gamesPlayed: 198,
        favoritePersonality: "Psicólogo",
        isFriend: true,
        isRival: false
      },
      score: 2634,
      change: 1,
      streak: 8
    },
    {
      rank: 3,
      player: {
        id: "3",
        username: "CyberSage",
        displayName: "Sabio Cibernético",
        avatar: "🔮",
        level: 23,
        rating: 2521,
        rank: 3,
        title: "Espejo Perfecto",
        status: "offline",
        lastSeen: "Hace 2 horas",
        winRate: 82.4,
        gamesPlayed: 167,
        favoritePersonality: "Vengativo",
        isFriend: true,
        isRival: false
      },
      score: 2521,
      change: -1,
      streak: 5
    },
    {
      rank: 4,
      player: {
        id: "current",
        username: "Player_001",
        displayName: "Tú",
        avatar: "⚡",
        level: 12,
        rating: 1847,
        rank: 4,
        title: "Estratega",
        status: "online",
        lastSeen: "Ahora",
        winRate: 71.2,
        gamesPlayed: 127,
        favoritePersonality: "Adaptativo",
        isFriend: false,
        isRival: false
      },
      score: 1847,
      change: 2,
      streak: 3
    }
  ]);

  const [events, setEvents] = useState<Event[]>([
    {
      id: "quantum-championship",
      name: "Campeonato Cuántico",
      description: "Torneo mensual para los mejores jugadores. Solo IA en modo Evolución.",
      type: "tournament",
      startDate: "2024-02-01",
      endDate: "2024-02-15",
      participants: 128,
      maxParticipants: 256,
      rewards: ["Título: Campeón Cuántico", "Avatar: Corona Dorada", "1000 XP"],
      difficulty: "legendary",
      status: "active",
      progress: 45
    },
    {
      id: "neural-network",
      name: "Red Neural",
      description: "Desafío especial: vence a 5 IAs diferentes en una sesión.",
      type: "challenge",
      startDate: "2024-01-20",
      endDate: "2024-01-31",
      participants: 67,
      rewards: ["Logro: Maestro de Redes", "500 XP"],
      difficulty: "hard",
      status: "active",
      progress: 80
    },
    {
      id: "valentine-mirror",
      name: "Espejo de San Valentín",
      description: "Evento temático con efectos visuales especiales y celdas de corazón.",
      type: "seasonal",
      startDate: "2024-02-10",
      endDate: "2024-02-18",
      participants: 234,
      rewards: ["Tema: Valentine Hearts", "Título: Cupido Digital"],
      difficulty: "medium",
      status: "upcoming"
    }
  ]);

  const [challenges, setChallenges] = useState<Challenge[]>([
    {
      id: "1",
      challenger: leaderboard[1].player,
      challenged: leaderboard[3].player,
      status: "pending",
      gameType: "ranked",
      wager: "50 XP",
      timeLimit: 30,
      createdAt: "2024-01-20T10:30:00Z"
    }
  ]);

  const [friends] = useState<Player[]>(
    leaderboard.filter(entry => entry.player.isFriend).map(entry => entry.player)
  );

  const getStatusColor = (status: string) => {
    const colors = {
      online: "text-neon-green border-neon-green",
      playing: "text-neon-purple border-neon-purple",
      offline: "text-gray-400 border-gray-400"
    };
    return colors[status as keyof typeof colors] || colors.offline;
  };

  const getEventStatusColor = (status: string) => {
    const colors = {
      upcoming: "text-blue-400 border-blue-400",
      active: "text-neon-green border-neon-green",
      ended: "text-gray-400 border-gray-400"
    };
    return colors[status as keyof typeof colors];
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      easy: "text-green-400 border-green-400",
      medium: "text-yellow-400 border-yellow-400",
      hard: "text-orange-400 border-orange-400",
      legendary: "text-neon-cyan border-neon-cyan"
    };
    return colors[difficulty as keyof typeof colors];
  };

  const sendChallenge = (playerId: string) => {
    // Implementation would send challenge to player
    console.log(`Desafío enviado a ${playerId}`);
  };

  const acceptChallenge = (challengeId: string) => {
    setChallenges(prev => 
      prev.map(c => 
        c.id === challengeId 
          ? { ...c, status: 'accepted' }
          : c
      )
    );
  };

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
              Centro Social
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Compite, conecta y domina el rankings mundial
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Search className="w-4 h-4 mr-2" />
              Buscar
            </Button>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="leaderboard">Rankings</TabsTrigger>
            <TabsTrigger value="events">Eventos</TabsTrigger>
            <TabsTrigger value="challenges">Desafíos</TabsTrigger>
            <TabsTrigger value="friends">Amigos</TabsTrigger>
            <TabsTrigger value="tournaments">Torneos</TabsTrigger>
          </TabsList>

          <TabsContent value="leaderboard" className="space-y-6">
            {/* Search and Filters */}
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <Input
                  placeholder="Buscar jugadores..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-card/30"
                />
              </div>
              <select 
                value={filterRank} 
                onChange={(e) => setFilterRank(e.target.value)}
                className="px-3 py-2 bg-card/30 border border-border rounded-md"
              >
                <option value="all">Todos los rangos</option>
                <option value="top10">Top 10</option>
                <option value="top50">Top 50</option>
                <option value="friends">Solo amigos</option>
              </select>
            </div>

            {/* Leaderboard */}
            <Card className="bg-card/30 backdrop-blur-sm border-neon-cyan/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-neon-cyan" />
                  Rankings Mundial - Temporada 2024
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leaderboard.map((entry, index) => (
                    <motion.div
                      key={entry.player.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all hover:scale-[1.01] ${
                        entry.player.id === "current" 
                          ? "border-neon-cyan bg-neon-cyan/5 glow" 
                          : "border-border hover:border-border/60"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        {/* Rank */}
                        <div className="flex items-center justify-center w-12 h-12">
                          {entry.rank <= 3 ? (
                            <div className={`text-2xl ${entry.rank === 1 ? 'text-yellow-400' : entry.rank === 2 ? 'text-gray-300' : 'text-orange-400'}`}>
                              {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'}
                            </div>
                          ) : (
                            <div className="text-lg font-bold text-muted-foreground">#{entry.rank}</div>
                          )}
                        </div>

                        {/* Avatar and Info */}
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center text-xl">
                              {entry.player.avatar}
                            </div>
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${
                              entry.player.status === 'online' ? 'bg-neon-green' :
                              entry.player.status === 'playing' ? 'bg-neon-purple' : 'bg-gray-400'
                            }`} />
                          </div>
                          
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold">{entry.player.displayName}</span>
                              {entry.player.id === "current" && (
                                <Badge variant="outline" className="text-neon-cyan border-neon-cyan">
                                  Tú
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {entry.player.title} • Nivel {entry.player.level}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <div className="text-lg font-bold text-neon-cyan">{entry.score.toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">Rating</div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-lg font-bold text-neon-purple">{entry.player.winRate}%</div>
                          <div className="text-xs text-muted-foreground">Victoria</div>
                        </div>

                        <div className="text-center">
                          <div className="flex items-center gap-1">
                            <Flame className="w-4 h-4 text-orange-400" />
                            <span className="text-lg font-bold text-orange-400">{entry.streak}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">Racha</div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          {entry.player.id !== "current" && (
                            <>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => sendChallenge(entry.player.id)}
                                className="border-neon-purple text-neon-purple hover:bg-neon-purple/10"
                              >
                                <Sword className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="border-neon-green text-neon-green hover:bg-neon-green/10"
                              >
                                <UserPlus className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`bg-card/30 backdrop-blur-sm border-2 ${getEventStatusColor(event.status)} hover:scale-105 transition-all duration-300`}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {event.type === 'tournament' && <Trophy className="w-5 h-5 text-yellow-400" />}
                          {event.type === 'challenge' && <Target className="w-5 h-5 text-neon-purple" />}
                          {event.type === 'seasonal' && <Sparkles className="w-5 h-5 text-neon-pink" />}
                          {event.type === 'special' && <Star className="w-5 h-5 text-neon-cyan" />}
                        </div>
                        <Badge variant="outline" className={getEventStatusColor(event.status)}>
                          {event.status}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{event.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Participantes:</span>
                          <span>{event.participants}{event.maxParticipants && `/${event.maxParticipants}`}</span>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Dificultad:</span>
                          <Badge variant="outline" className={getDifficultyColor(event.difficulty)}>
                            {event.difficulty}
                          </Badge>
                        </div>

                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Termina:</span>
                          <span>{new Date(event.endDate).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {event.progress && (
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progreso</span>
                            <span>{event.progress}%</span>
                          </div>
                          <div className="w-full bg-card rounded-full h-2">
                            <div 
                              className="bg-neon-cyan h-2 rounded-full transition-all duration-300"
                              style={{ width: `${event.progress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      <div>
                        <div className="text-sm font-semibold mb-2">Recompensas:</div>
                        <div className="space-y-1">
                          {event.rewards.map((reward, i) => (
                            <div key={i} className="text-xs text-neon-cyan">🎁 {reward}</div>
                          ))}
                        </div>
                      </div>

                      <Button 
                        className="w-full"
                        disabled={event.status === 'ended'}
                      >
                        {event.status === 'upcoming' ? 'Registrarse' : 
                         event.status === 'active' ? 'Unirse' : 'Finalizado'}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="challenges" className="space-y-6">
            <div className="grid gap-4">
              {challenges.map((challenge) => (
                <Card key={challenge.id} className="bg-card/30 backdrop-blur-sm border-neon-purple/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center text-xl">
                          {challenge.challenger.avatar}
                        </div>
                        <div>
                          <div className="font-bold">{challenge.challenger.displayName}</div>
                          <div className="text-sm text-muted-foreground">
                            Te desafía a una partida {challenge.gameType}
                          </div>
                          {challenge.wager && (
                            <div className="text-xs text-neon-cyan">Apuesta: {challenge.wager}</div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-neon-purple border-neon-purple">
                          {challenge.status}
                        </Badge>
                        {challenge.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              onClick={() => acceptChallenge(challenge.id)}
                              className="bg-neon-green text-background hover:bg-neon-green/90"
                            >
                              Aceptar
                            </Button>
                            <Button size="sm" variant="outline">
                              Rechazar
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {challenges.length === 0 && (
                <Card className="bg-card/30 backdrop-blur-sm border-border">
                  <CardContent className="p-12 text-center">
                    <Sword className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No tienes desafíos pendientes</p>
                    <Button className="mt-4" variant="outline">
                      Desafiar a un jugador
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="friends" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {friends.map((friend) => (
                <Card key={friend.id} className="bg-card/30 backdrop-blur-sm border-neon-green/20">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center text-xl">
                          {friend.avatar}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${getStatusColor(friend.status).includes('neon-green') ? 'bg-neon-green' : friend.status === 'playing' ? 'bg-neon-purple' : 'bg-gray-400'}`} />
                      </div>
                      
                      <div className="flex-1">
                        <div className="font-bold">{friend.displayName}</div>
                        <div className="text-sm text-muted-foreground">{friend.title}</div>
                        <Badge variant="outline" className={getStatusColor(friend.status)}>
                          {friend.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Nivel:</span>
                        <span>{friend.level}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Ranking:</span>
                        <span>#{friend.rank}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tasa victoria:</span>
                        <span>{friend.winRate}%</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1">
                        <Sword className="w-4 h-4 mr-1" />
                        Desafiar
                      </Button>
                      <Button size="sm" variant="outline">
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tournaments" className="space-y-6">
            <Card className="bg-card/30 backdrop-blur-sm border-yellow-400/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-yellow-400" />
                  Próximos Torneos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Trophy className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">No hay torneos programados</p>
                  <Button variant="outline">
                    Crear Torneo Privado
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
