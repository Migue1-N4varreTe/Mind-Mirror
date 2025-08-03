import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AchievementSystem, type Achievement } from "@/lib/achievementSystem";
import { 
  Trophy, 
  Award, 
  Crown, 
  Star,
  Lock,
  Search,
  Filter,
  ArrowLeft,
  Target,
  Zap,
  Clock,
  Brain,
  Shield,
  TrendingUp,
  Eye,
  Users,
  Calendar,
  Gift,
  Sparkles
} from "lucide-react";

export default function Achievements() {
  const [achievementSystem] = useState(new AchievementSystem());
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedRarity, setSelectedRarity] = useState("all");
  const [showSecrets, setShowSecrets] = useState(false);

  useEffect(() => {
    setAchievements(achievementSystem.getAllAchievements());
  }, [achievementSystem]);

  const categories = [
    { value: 'all', name: 'Todos', icon: <Trophy className="w-4 h-4" /> },
    { value: 'gameplay', name: 'Gameplay', icon: <Target className="w-4 h-4" /> },
    { value: 'strategy', name: 'Estrategia', icon: <Brain className="w-4 h-4" /> },
    { value: 'speed', name: 'Velocidad', icon: <Zap className="w-4 h-4" /> },
    { value: 'endurance', name: 'Resistencia', icon: <Shield className="w-4 h-4" /> },
    { value: 'master', name: 'Maestría', icon: <Crown className="w-4 h-4" /> },
    { value: 'secret', name: 'Secretos', icon: <Eye className="w-4 h-4" /> }
  ];

  const rarities = [
    { value: 'all', name: 'Todas', color: 'text-muted-foreground' },
    { value: 'common', name: 'Común', color: 'text-gray-400' },
    { value: 'rare', name: 'Raro', color: 'text-blue-400' },
    { value: 'epic', name: 'Épico', color: 'text-purple-400' },
    { value: 'legendary', name: 'Legendario', color: 'text-yellow-400' },
    { value: 'mythic', name: 'Mítico', color: 'text-neon-cyan' }
  ];

  const filteredAchievements = achievements.filter(achievement => {
    // Filter by search query
    if (searchQuery && !achievement.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !achievement.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Filter by category
    if (selectedCategory !== 'all' && achievement.category !== selectedCategory) {
      return false;
    }

    // Filter by rarity
    if (selectedRarity !== 'all' && achievement.rarity !== selectedRarity) {
      return false;
    }

    // Filter secrets
    if (achievement.secret && !showSecrets && !achievement.unlocked) {
      return false;
    }

    return true;
  });

  const getAchievementIcon = (achievement: Achievement) => {
    return <span className="text-2xl">{achievement.icon}</span>;
  };

  const getRarityColor = (rarity: string) => {
    const colors = {
      common: 'text-gray-400 border-gray-400 bg-gray-400/5',
      rare: 'text-blue-400 border-blue-400 bg-blue-400/5',
      epic: 'text-purple-400 border-purple-400 bg-purple-400/5',
      legendary: 'text-yellow-400 border-yellow-400 bg-yellow-400/5',
      mythic: 'text-neon-cyan border-neon-cyan bg-neon-cyan/5'
    };
    return colors[rarity as keyof typeof colors] || colors.common;
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      gameplay: <Target className="w-4 h-4" />,
      strategy: <Brain className="w-4 h-4" />,
      speed: <Zap className="w-4 h-4" />,
      endurance: <Shield className="w-4 h-4" />,
      master: <Crown className="w-4 h-4" />,
      secret: <Eye className="w-4 h-4" />
    };
    return icons[category as keyof typeof icons] || <Trophy className="w-4 h-4" />;
  };

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalVisible = achievements.filter(a => !a.secret || a.unlocked).length;
  const totalPoints = achievementSystem.getTotalPoints();
  const completionPercentage = achievementSystem.getCompletionPercentage();

  const statsByCategory = categories.slice(1).map(cat => {
    const categoryAchievements = achievements.filter(a => a.category === cat.value);
    const unlockedInCategory = categoryAchievements.filter(a => a.unlocked).length;
    return {
      ...cat,
      total: categoryAchievements.length,
      unlocked: unlockedInCategory,
      percentage: categoryAchievements.length > 0 ? (unlockedInCategory / categoryAchievements.length) * 100 : 0
    };
  });

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
              Tablero de Logros
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Desbloquea logros y demuestra tu maestría en Mind Mirror
            </p>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-yellow-400">{totalPoints.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Puntos Totales</div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-card/30 backdrop-blur-sm border-neon-cyan/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Trophy className="w-4 h-4 text-neon-cyan" />
                Progreso General
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-neon-cyan">
                  {unlockedCount}/{totalVisible}
                </div>
                <Progress value={completionPercentage} className="h-2" />
                <div className="text-xs text-muted-foreground">
                  {completionPercentage.toFixed(1)}% completado
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/30 backdrop-blur-sm border-yellow-400/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Star className="w-4 h-4 text-yellow-400" />
                Puntos de Logro
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-400">
                {totalPoints.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">
                Puntos acumulados
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/30 backdrop-blur-sm border-neon-purple/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Crown className="w-4 h-4 text-neon-purple" />
                Raros y Legendarios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-neon-purple">
                {achievements.filter(a => (a.rarity === 'legendary' || a.rarity === 'mythic') && a.unlocked).length}
              </div>
              <div className="text-xs text-muted-foreground">
                Logros prestigiosos
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/30 backdrop-blur-sm border-neon-green/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Eye className="w-4 h-4 text-neon-green" />
                Secretos Descubiertos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-neon-green">
                {achievements.filter(a => a.secret && a.unlocked).length}
              </div>
              <div className="text-xs text-muted-foreground">
                Logros secretos
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Category Progress */}
        <Card className="mb-8 bg-card/30 backdrop-blur-sm border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-neon-cyan" />
              Progreso por Categoría
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
              {statsByCategory.map((stat) => (
                <div key={stat.value} className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {stat.icon}
                    <span className="text-sm font-medium">{stat.name}</span>
                  </div>
                  <div className="text-lg font-bold">
                    {stat.unlocked}/{stat.total}
                  </div>
                  <Progress value={stat.percentage} className="h-2 mt-1" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar logros..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-card/30"
              />
            </div>
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-card/30 border border-border rounded-md min-w-[140px]"
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.name}</option>
            ))}
          </select>

          <select
            value={selectedRarity}
            onChange={(e) => setSelectedRarity(e.target.value)}
            className="px-3 py-2 bg-card/30 border border-border rounded-md min-w-[120px]"
          >
            {rarities.map(rarity => (
              <option key={rarity.value} value={rarity.value}>{rarity.name}</option>
            ))}
          </select>

          <Button
            variant={showSecrets ? "default" : "outline"}
            onClick={() => setShowSecrets(!showSecrets)}
            size="sm"
          >
            <Eye className="w-4 h-4 mr-2" />
            Secretos
          </Button>
        </div>

        {/* Achievements Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence>
            {filteredAchievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                className={`${achievement.unlocked ? 'opacity-100' : 'opacity-60'}`}
              >
                <Card className={`bg-card/30 backdrop-blur-sm border-2 transition-all duration-300 hover:scale-105 ${
                  achievement.unlocked 
                    ? `${getRarityColor(achievement.rarity)} glow` 
                    : 'border-border'
                }`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          achievement.unlocked 
                            ? 'bg-current/20' 
                            : 'bg-muted/20'
                        }`}>
                          {achievement.unlocked || !achievement.secret ? (
                            getAchievementIcon(achievement)
                          ) : (
                            <Lock className="w-6 h-6 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-sm">
                            {achievement.unlocked || !achievement.secret ? achievement.name : "???"}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className={`text-xs ${getRarityColor(achievement.rarity)}`}>
                              {achievement.rarity}
                            </Badge>
                            <div className="flex items-center gap-1">
                              {getCategoryIcon(achievement.category)}
                              <span className="text-xs text-muted-foreground capitalize">
                                {achievement.category}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      {achievement.unlocked && (
                        <div className="text-right">
                          <div className="text-lg font-bold text-yellow-400">
                            +{achievement.points}
                          </div>
                          <div className="text-xs text-muted-foreground">puntos</div>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      {achievement.unlocked || !achievement.secret 
                        ? achievement.description 
                        : "Logro secreto - completa las condiciones para descubrirlo"}
                    </p>
                    
                    {/* Progress for trackable achievements */}
                    {achievement.maxProgress && achievement.progress !== undefined && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>Progreso</span>
                          <span>{achievement.progress}/{achievement.maxProgress}</span>
                        </div>
                        <Progress 
                          value={(achievement.progress / achievement.maxProgress) * 100} 
                          className="h-2" 
                        />
                      </div>
                    )}
                    
                    {/* Unlock date */}
                    {achievement.unlocked && achievement.unlockedDate && (
                      <div className="mt-3 text-xs text-neon-green">
                        ✓ Desbloqueado el {new Date(achievement.unlockedDate).toLocaleDateString()}
                      </div>
                    )}

                    {/* Title reward */}
                    {achievement.unlocked && achievement.title && (
                      <div className="mt-2 p-2 bg-neon-cyan/10 rounded border border-neon-cyan/20">
                        <div className="text-xs text-neon-cyan font-semibold">
                          Título desbloqueado: {achievement.title}
                        </div>
                      </div>
                    )}

                    {/* Special reward */}
                    {achievement.unlocked && achievement.reward && (
                      <div className="mt-2 p-2 bg-yellow-400/10 rounded border border-yellow-400/20">
                        <div className="text-xs text-yellow-400 font-semibold flex items-center gap-1">
                          <Gift className="w-3 h-3" />
                          {achievement.reward.description}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredAchievements.length === 0 && (
          <Card className="bg-card/30 backdrop-blur-sm border-border">
            <CardContent className="p-12 text-center">
              <Search className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No se encontraron logros con los filtros actuales</p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setSelectedRarity("all");
                }}
                className="mt-4"
              >
                Limpiar Filtros
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <Link to="/game">
            <Button size="lg" className="bg-neon-cyan text-background hover:bg-neon-cyan/90">
              <Trophy className="w-5 h-5 mr-2" />
              ¡Jugar para Desbloquear Más!
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
