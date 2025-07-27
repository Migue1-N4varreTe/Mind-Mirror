import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Brain, 
  ArrowLeft,
  Bot,
  Zap,
  Target,
  Eye,
  Heart,
  Skull,
  Shield,
  Clock,
  TrendingUp,
  Sparkles,
  Save,
  Play,
  Trash2,
  Copy,
  Settings,
  Download,
  Upload,
  Users,
  Star,
  Lock,
  Unlock
} from "lucide-react";

interface CustomAI {
  id: string;
  name: string;
  description: string;
  avatar: string;
  personality: {
    aggression: number;      // 0-100
    patience: number;        // 0-100
    adaptability: number;    // 0-100
    creativity: number;      // 0-100
    riskTaking: number;      // 0-100
    memory: number;          // 0-100
  };
  behaviors: {
    learningRate: number;
    counterAttackChance: number;
    bluffFrequency: number;
    patternBreaking: number;
    emotionalResponse: number;
    strategyVariation: number;
  };
  specialAbilities: string[];
  difficulty: number;
  trainingData: {
    gamesPlayed: number;
    winRate: number;
    adaptations: number;
    lastUpdated: string;
  };
  isPublic: boolean;
  creator: string;
  rating: number;
  downloads: number;
  tags: string[];
}

interface TrainingSession {
  id: string;
  aiId: string;
  rounds: number;
  playerWins: number;
  aiWins: number;
  adaptations: string[];
  insights: string[];
  duration: number;
  date: string;
}

export default function AITrainer() {
  const [activeTab, setActiveTab] = useState("create");
  
  const [customAI, setCustomAI] = useState<CustomAI>({
    id: "",
    name: "Mi IA Personalizada",
    description: "Una IA entrenada específicamente para mi estilo de juego",
    avatar: "🤖",
    personality: {
      aggression: 50,
      patience: 50,
      adaptability: 50,
      creativity: 50,
      riskTaking: 50,
      memory: 50
    },
    behaviors: {
      learningRate: 75,
      counterAttackChance: 30,
      bluffFrequency: 20,
      patternBreaking: 40,
      emotionalResponse: 60,
      strategyVariation: 50
    },
    specialAbilities: [],
    difficulty: 50,
    trainingData: {
      gamesPlayed: 0,
      winRate: 0,
      adaptations: 0,
      lastUpdated: new Date().toISOString()
    },
    isPublic: false,
    creator: "Tú",
    rating: 0,
    downloads: 0,
    tags: []
  });

  const [savedAIs, setSavedAIs] = useState<CustomAI[]>([
    {
      id: "aggressive-hunter",
      name: "Cazador Agresivo",
      description: "IA ultra-agresiva que nunca retrocede. Perfecta para entrenar defensas.",
      avatar: "⚔️",
      personality: {
        aggression: 95,
        patience: 20,
        adaptability: 60,
        creativity: 70,
        riskTaking: 90,
        memory: 80
      },
      behaviors: {
        learningRate: 85,
        counterAttackChance: 80,
        bluffFrequency: 15,
        patternBreaking: 60,
        emotionalResponse: 90,
        strategyVariation: 40
      },
      specialAbilities: ["Ataque Relámpago", "Presión Constante", "Intimidación"],
      difficulty: 85,
      trainingData: {
        gamesPlayed: 47,
        winRate: 68,
        adaptations: 23,
        lastUpdated: "2024-01-20T10:30:00Z"
      },
      isPublic: true,
      creator: "Tú",
      rating: 4.2,
      downloads: 156,
      tags: ["agresivo", "rápido", "presión"]
    },
    {
      id: "patient-sage",
      name: "Sabio Paciente",
      description: "Maestro de la paciencia que espera el momento perfecto para atacar.",
      avatar: "🧙‍♂️",
      personality: {
        aggression: 30,
        patience: 95,
        adaptability: 85,
        creativity: 80,
        riskTaking: 25,
        memory: 95
      },
      behaviors: {
        learningRate: 90,
        counterAttackChance: 60,
        bluffFrequency: 70,
        patternBreaking: 80,
        emotionalResponse: 20,
        strategyVariation: 90
      },
      specialAbilities: ["Análisis Profundo", "Trampa Temporal", "Sabiduría Ancestral"],
      difficulty: 92,
      trainingData: {
        gamesPlayed: 31,
        winRate: 87,
        adaptations: 45,
        lastUpdated: "2024-01-19T15:45:00Z"
      },
      isPublic: false,
      creator: "Tú",
      rating: 4.8,
      downloads: 0,
      tags: ["defensivo", "estratégico", "paciente"]
    }
  ]);

  const [trainingSessions, setTrainingSessions] = useState<TrainingSession[]>([
    {
      id: "session-1",
      aiId: "aggressive-hunter",
      rounds: 10,
      playerWins: 6,
      aiWins: 4,
      adaptations: [
        "Detectó patrón defensivo en esquina superior",
        "Adaptó timing de ataques a tu velocidad",
        "Incrementó presión cuando muestras duda"
      ],
      insights: [
        "Tu debilidad: tardas en responder bajo presión",
        "Recomendación: practica movimientos rápidos",
        "La IA aprendió a explotar tu hesitación"
      ],
      duration: 23, // minutes
      date: "2024-01-20T14:30:00Z"
    }
  ]);

  const availableAbilities = [
    { id: "lightning", name: "Ataque Relámpago", description: "Movimientos ultra-rápidos", icon: "⚡" },
    { id: "analysis", name: "Análisis Profundo", description: "Predicción avanzada de patrones", icon: "🔍" },
    { id: "pressure", name: "Presión Constante", description: "Incrementa estrés del oponente", icon: "💪" },
    { id: "trap", name: "Trampa Temporal", description: "Coloca trampas a largo plazo", icon: "🕷️" },
    { id: "intimidation", name: "Intimidación", description: "Afecta confianza del jugador", icon: "👁️" },
    { id: "wisdom", name: "Sabiduría Ancestral", description: "Acceso a estrategias históricas", icon: "📚" },
    { id: "adaptation", name: "Hiper-Adaptación", description: "Cambia estrategia cada 3 movimientos", icon: "🔄" },
    { id: "quantum", name: "Salto Cuántico", description: "Movimientos impredecibles", icon: "⚛️" }
  ];

  const avatarOptions = ["🤖", "🧠", "⚔️", "🧙‍♂️", "👹", "😈", "🦾", "🔮", "⚡", "🌟", "🔥", "❄️"];

  const updatePersonality = (trait: keyof typeof customAI.personality, value: number) => {
    setCustomAI(prev => ({
      ...prev,
      personality: { ...prev.personality, [trait]: value }
    }));
  };

  const updateBehavior = (behavior: keyof typeof customAI.behaviors, value: number) => {
    setCustomAI(prev => ({
      ...prev,
      behaviors: { ...prev.behaviors, [behavior]: value }
    }));
  };

  const toggleAbility = (abilityId: string) => {
    const ability = availableAbilities.find(a => a.id === abilityId);
    if (!ability) return;

    setCustomAI(prev => ({
      ...prev,
      specialAbilities: prev.specialAbilities.includes(ability.name)
        ? prev.specialAbilities.filter(a => a !== ability.name)
        : [...prev.specialAbilities, ability.name]
    }));
  };

  const saveAI = () => {
    const newAI = {
      ...customAI,
      id: Date.now().toString(),
      trainingData: {
        ...customAI.trainingData,
        lastUpdated: new Date().toISOString()
      }
    };
    setSavedAIs(prev => [...prev, newAI]);
    localStorage.setItem('mindmirror-custom-ais', JSON.stringify([...savedAIs, newAI]));
  };

  const loadAI = (ai: CustomAI) => {
    setCustomAI(ai);
    setActiveTab("create");
  };

  const deleteAI = (aiId: string) => {
    setSavedAIs(prev => prev.filter(ai => ai.id !== aiId));
  };

  const duplicateAI = (ai: CustomAI) => {
    const duplicate = {
      ...ai,
      id: Date.now().toString(),
      name: `${ai.name} (Copia)`,
      isPublic: false,
      downloads: 0,
      rating: 0
    };
    setSavedAIs(prev => [...prev, duplicate]);
  };

  const startTraining = (aiId: string) => {
    // Implementation would start a training session
    console.log(`Iniciando entrenamiento con IA: ${aiId}`);
  };

  const getPersonalityColor = (value: number) => {
    if (value >= 80) return "text-red-400";
    if (value >= 60) return "text-orange-400";
    if (value >= 40) return "text-yellow-400";
    if (value >= 20) return "text-blue-400";
    return "text-green-400";
  };

  const calculateOverallDifficulty = () => {
    const personalityAvg = Object.values(customAI.personality).reduce((a, b) => a + b, 0) / 6;
    const behaviorAvg = Object.values(customAI.behaviors).reduce((a, b) => a + b, 0) / 6;
    const abilityBonus = customAI.specialAbilities.length * 5;
    return Math.min(100, Math.round((personalityAvg + behaviorAvg) / 2 + abilityBonus));
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
              Entrenador de IA
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Crea y entrena IAs personalizadas para desafíos únicos
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Importar
            </Button>
            <Button variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="create">Crear IA</TabsTrigger>
            <TabsTrigger value="library">Mi Biblioteca</TabsTrigger>
            <TabsTrigger value="training">Entrenamiento</TabsTrigger>
            <TabsTrigger value="community">Comunidad</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* AI Configuration */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Info */}
                <Card className="bg-card/30 backdrop-blur-sm border-neon-cyan/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bot className="w-5 h-5 text-neon-cyan" />
                      Información Básica
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Nombre</label>
                        <Input
                          value={customAI.name}
                          onChange={(e) => setCustomAI(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Nombre de tu IA"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Avatar</label>
                        <div className="grid grid-cols-6 gap-2">
                          {avatarOptions.map(avatar => (
                            <Button
                              key={avatar}
                              variant={customAI.avatar === avatar ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCustomAI(prev => ({ ...prev, avatar }))}
                              className="text-lg aspect-square p-0"
                            >
                              {avatar}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Descripción</label>
                      <Textarea
                        value={customAI.description}
                        onChange={(e) => setCustomAI(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe el estilo y características de tu IA..."
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Personality */}
                <Card className="bg-card/30 backdrop-blur-sm border-neon-purple/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="w-5 h-5 text-neon-purple" />
                      Personalidad
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {Object.entries(customAI.personality).map(([trait, value]) => (
                      <div key={trait}>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="capitalize font-medium">{trait.replace(/([A-Z])/g, ' $1')}</span>
                          <span className={`font-mono ${getPersonalityColor(value)}`}>{value}%</span>
                        </div>
                        <Slider
                          value={[value]}
                          onValueChange={([newValue]) => updatePersonality(trait as any, newValue)}
                          min={0}
                          max={100}
                          step={5}
                          className="w-full"
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Behaviors */}
                <Card className="bg-card/30 backdrop-blur-sm border-neon-pink/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5 text-neon-pink" />
                      Comportamientos
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {Object.entries(customAI.behaviors).map(([behavior, value]) => (
                      <div key={behavior}>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="capitalize font-medium">
                            {behavior.replace(/([A-Z])/g, ' $1').replace('Rate', ' Rate')}
                          </span>
                          <span className="font-mono text-neon-pink">{value}%</span>
                        </div>
                        <Slider
                          value={[value]}
                          onValueChange={([newValue]) => updateBehavior(behavior as any, newValue)}
                          min={0}
                          max={100}
                          step={5}
                          className="w-full"
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Special Abilities */}
                <Card className="bg-card/30 backdrop-blur-sm border-yellow-400/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-yellow-400" />
                      Habilidades Especiales
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-3">
                      {availableAbilities.map(ability => (
                        <div
                          key={ability.id}
                          className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            customAI.specialAbilities.includes(ability.name)
                              ? "border-yellow-400 bg-yellow-400/10"
                              : "border-border hover:border-border/60"
                          }`}
                          onClick={() => toggleAbility(ability.id)}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{ability.icon}</span>
                            <span className="font-semibold text-sm">{ability.name}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{ability.description}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* AI Preview */}
              <div className="space-y-6">
                <Card className="bg-card/30 backdrop-blur-sm border-neon-green/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="w-5 h-5 text-neon-green" />
                      Vista Previa
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center text-3xl mb-3">
                        {customAI.avatar}
                      </div>
                      <h3 className="font-bold">{customAI.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{customAI.description}</p>
                      
                      <div className="flex justify-center">
                        <Badge variant="outline" className={`${getPersonalityColor(calculateOverallDifficulty())} border-current`}>
                          Dificultad: {calculateOverallDifficulty()}%
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Estilo dominante:</span>
                        <div className="mt-1">
                          {customAI.personality.aggression >= 70 ? "Agresivo" :
                           customAI.personality.patience >= 70 ? "Paciente" :
                           customAI.personality.creativity >= 70 ? "Creativo" : "Balanceado"}
                        </div>
                      </div>

                      {customAI.specialAbilities.length > 0 && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Habilidades:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {customAI.specialAbilities.slice(0, 3).map(ability => (
                              <Badge key={ability} variant="secondary" className="text-xs">
                                {ability}
                              </Badge>
                            ))}
                            {customAI.specialAbilities.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{customAI.specialAbilities.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 mt-6">
                      <Button onClick={saveAI} className="flex-1">
                        <Save className="w-4 h-4 mr-2" />
                        Guardar
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => startTraining(customAI.id)}
                        className="flex-1"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Probar
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Settings */}
                <Card className="bg-card/30 backdrop-blur-sm border-border">
                  <CardHeader>
                    <CardTitle className="text-sm">Configuración</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">IA Pública</span>
                      <Switch
                        checked={customAI.isPublic}
                        onCheckedChange={(checked) => setCustomAI(prev => ({ ...prev, isPublic: checked }))}
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Tags</label>
                      <Input
                        placeholder="agresivo, rápido, estratégico..."
                        value={customAI.tags.join(", ")}
                        onChange={(e) => setCustomAI(prev => ({ 
                          ...prev, 
                          tags: e.target.value.split(",").map(tag => tag.trim()).filter(Boolean)
                        }))}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="library" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedAIs.map((ai, index) => (
                <motion.div
                  key={ai.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-card/30 backdrop-blur-sm border-border hover:border-neon-cyan/40 transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center text-xl">
                            {ai.avatar}
                          </div>
                          <div>
                            <h3 className="font-bold">{ai.name}</h3>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                Dificultad: {ai.difficulty}%
                              </Badge>
                              {ai.isPublic ? <Unlock className="w-3 h-3 text-neon-green" /> : <Lock className="w-3 h-3 text-gray-400" />}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">{ai.description}</p>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Partidas:</span>
                          <span>{ai.trainingData.gamesPlayed}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Tasa victoria:</span>
                          <span className="text-neon-cyan">{ai.trainingData.winRate}%</span>
                        </div>
                        {ai.isPublic && (
                          <>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Rating:</span>
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-yellow-400" />
                                <span>{ai.rating}</span>
                              </div>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Descargas:</span>
                              <span>{ai.downloads}</span>
                            </div>
                          </>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {ai.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => loadAI(ai)}
                          className="flex-1"
                        >
                          <Settings className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => startTraining(ai.id)}
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => duplicateAI(ai)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => deleteAI(ai.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="training" className="space-y-6">
            <div className="space-y-6">
              {trainingSessions.map((session) => {
                const ai = savedAIs.find(ai => ai.id === session.aiId);
                return (
                  <Card key={session.id} className="bg-card/30 backdrop-blur-sm border-neon-green/20">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center text-xl">
                            {ai?.avatar || "🤖"}
                          </div>
                          <div>
                            <h3 className="font-bold">Sesión con {ai?.name || "IA Desconocida"}</h3>
                            <p className="text-sm text-muted-foreground">
                              {new Date(session.date).toLocaleDateString()} • {session.duration} minutos
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">
                            <span className="text-neon-cyan">{session.playerWins}</span>
                            <span className="text-muted-foreground mx-2">-</span>
                            <span className="text-neon-purple">{session.aiWins}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">{session.rounds} rondas</div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold text-sm mb-2 text-neon-purple">Adaptaciones de la IA</h4>
                          <ul className="space-y-1">
                            {session.adaptations.map((adaptation, i) => (
                              <li key={i} className="text-sm text-muted-foreground">
                                • {adaptation}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-sm mb-2 text-neon-cyan">Insights para Ti</h4>
                          <ul className="space-y-1">
                            {session.insights.map((insight, i) => (
                              <li key={i} className="text-sm text-muted-foreground">
                                • {insight}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          Ver Replay
                        </Button>
                        <Button size="sm" variant="outline">
                          Entrenar Más
                        </Button>
                        <Button size="sm" variant="outline">
                          Exportar Datos
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="community" className="space-y-6">
            <Card className="bg-card/30 backdrop-blur-sm border-border">
              <CardContent className="p-12 text-center">
                <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-bold mb-2">Comunidad de IAs</h3>
                <p className="text-muted-foreground mb-6">
                  Descubre, comparte y descarga IAs creadas por otros jugadores
                </p>
                <Button>
                  Explorar Comunidad
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
