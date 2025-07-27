import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { 
  Brain, 
  Eye, 
  Zap, 
  Target, 
  Cpu, 
  Sparkles, 
  Shield, 
  Timer,
  TrendingUp,
  Layers,
  Gamepad2,
  Users
} from "lucide-react";

export default function Index() {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [aiPersonality, setAiPersonality] = useState("Analyzing...");
  
  const phases = [
    { name: "Learning", description: "AI observes your patterns", color: "text-neon-cyan" },
    { name: "Mirror", description: "AI mimics your strategies", color: "text-neon-purple" },
    { name: "Evolution", description: "AI improves your tactics", color: "text-neon-pink" }
  ];

  const personalities = ["Camaleón", "Psicólogo", "Vengativo", "Empático"];

  useEffect(() => {
    const phaseInterval = setInterval(() => {
      setCurrentPhase((prev) => (prev + 1) % phases.length);
    }, 3000);

    const personalityInterval = setInterval(() => {
      setAiPersonality(personalities[Math.floor(Math.random() * personalities.length)]);
    }, 2000);

    return () => {
      clearInterval(phaseInterval);
      clearInterval(personalityInterval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background neural-grid overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-dark-purple/20 via-background to-neural-gray/20" />
        <div className="absolute top-20 left-20 w-32 h-32 bg-neon-cyan/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-neon-purple/10 rounded-full blur-3xl animate-pulse delay-1000" />
        
        <div className="relative z-10 max-w-6xl mx-auto text-center">
          {/* Main Title */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <Brain className="w-12 h-12 text-neon-cyan glow" />
              <Eye className="w-10 h-10 text-neon-purple glow" />
            </div>
            <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink bg-clip-text text-transparent">
              Mind Mirror
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mt-4 max-w-3xl mx-auto">
              El Juego que Te Conoce — Una IA que aprende de ti, te imita y evoluciona
            </p>
          </div>

          {/* Live AI Status */}
          <Card className="mb-12 max-w-md mx-auto bg-card/50 backdrop-blur-sm border-neon-cyan/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Cpu className="w-4 h-4 text-neon-cyan animate-pulse" />
                Estado de la IA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Fase Actual:</span>
                  <Badge variant="outline" className={`${phases[currentPhase].color} border-current`}>
                    {phases[currentPhase].name}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Personalidad:</span>
                  <span className="text-sm font-mono text-neon-purple">{aiPersonality}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA Buttons */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 justify-center mb-16 max-w-4xl mx-auto">
            <Link to="/game" className="w-full">
              <Button
                size="lg"
                className="w-full bg-neon-cyan text-background hover:bg-neon-cyan/90 glow pulse-glow"
              >
                <Gamepad2 className="w-5 h-5 mr-2" />
                Jugar Ahora
              </Button>
            </Link>
            <Link to="/profile" className="w-full">
              <Button
                variant="outline"
                size="lg"
                className="w-full border-neon-purple text-neon-purple hover:bg-neon-purple/10"
              >
                <Users className="w-5 h-5 mr-2" />
                Mi Perfil
              </Button>
            </Link>
            <Link to="/social" className="w-full">
              <Button
                variant="outline"
                size="lg"
                className="w-full border-yellow-400 text-yellow-400 hover:bg-yellow-400/10"
              >
                <Trophy className="w-5 h-5 mr-2" />
                Social & Rankings
              </Button>
            </Link>
            <Link to="/events" className="w-full">
              <Button
                variant="outline"
                size="lg"
                className="w-full border-neon-pink text-neon-pink hover:bg-neon-pink/10"
              >
                <Calendar className="w-5 h-5 mr-2" />
                Eventos
              </Button>
            </Link>
          </div>

          {/* Secondary Actions */}
          <div className="flex flex-wrap gap-3 justify-center mb-16">
            <Link to="/ai-trainer">
              <Button
                variant="outline"
                size="sm"
                className="border-electric-blue text-electric-blue hover:bg-electric-blue/10"
              >
                <Brain className="w-4 h-4 mr-2" />
                Entrenar IA
              </Button>
            </Link>
            <Link to="/analytics">
              <Button
                variant="outline"
                size="sm"
                className="border-neon-green text-neon-green hover:bg-neon-green/10"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Analytics
              </Button>
            </Link>
            <Link to="/settings">
              <Button
                variant="outline"
                size="sm"
                className="border-neural-gray text-muted-foreground hover:bg-neural-gray/10"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Configuración
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Game Mechanics */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">
            <span className="bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
              Mecánicas Revolucionarias
            </span>
          </h2>
          <p className="text-xl text-center text-muted-foreground mb-16 max-w-3xl mx-auto">
            Una experiencia de juego que evoluciona contigo, donde cada decisión alimenta una IA cada vez más inteligente
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Learning Phase */}
            <Card className="bg-card/30 backdrop-blur-sm border-neon-cyan/20 hover:border-neon-cyan/40 transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-neon-cyan/10 flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-neon-cyan" />
                </div>
                <CardTitle className="text-neon-cyan">Fase de Aprendizaje</CardTitle>
                <CardDescription>
                  La IA observa silenciosamente cada decisión que tomas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Análisis de patrones de click</li>
                  <li>• Detección de timing de decisiones</li>
                  <li>• Mapeo de estrategias preferidas</li>
                  <li>• Estudio de reacciones emocionales</li>
                </ul>
              </CardContent>
            </Card>

            {/* Mirror Phase */}
            <Card className="bg-card/30 backdrop-blur-sm border-neon-purple/20 hover:border-neon-purple/40 transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-neon-purple/10 flex items-center justify-center mb-4">
                  <Eye className="w-6 h-6 text-neon-purple" />
                </div>
                <CardTitle className="text-neon-purple">Fase de Espejo</CardTitle>
                <CardDescription>
                  La IA comienza a imitar exactamente tu estilo de juego
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Replicación de estrategias</li>
                  <li>• Imitación de timing</li>
                  <li>• Copia de patrones de riesgo</li>
                  <li>• Espejo de comportamiento emocional</li>
                </ul>
              </CardContent>
            </Card>

            {/* Evolution Phase */}
            <Card className="bg-card/30 backdrop-blur-sm border-neon-pink/20 hover:border-neon-pink/40 transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-neon-pink/10 flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-neon-pink" />
                </div>
                <CardTitle className="text-neon-pink">Fase de Evolución</CardTitle>
                <CardDescription>
                  La IA mejora tus propias tácticas y te desafía a crecer
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Optimización de estrategias</li>
                  <li>• Predicción cuántica</li>
                  <li>• Contraataques evolucionados</li>
                  <li>• Desafíos personalizados</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Special Features */}
      <section className="py-20 px-6 bg-gradient-to-b from-transparent to-dark-purple/10">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">
            <span className="bg-gradient-to-r from-neon-purple to-neon-pink bg-clip-text text-transparent">
              Características Únicas
            </span>
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Special Abilities */}
            <Card className="bg-card/20 backdrop-blur-sm border-electric-blue/20">
              <CardHeader className="pb-3">
                <Zap className="w-8 h-8 text-electric-blue mb-2" />
                <CardTitle className="text-lg">Habilidades Especiales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Eye className="w-3 h-3 text-neon-cyan" />
                    <span>Visión de IA</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-3 h-3 text-neon-green" />
                    <span>Escudo Temporal</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Timer className="w-3 h-3 text-neon-purple" />
                    <span>Tiempo Extra</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Personalities */}
            <Card className="bg-card/20 backdrop-blur-sm border-neon-purple/20">
              <CardHeader className="pb-3">
                <Users className="w-8 h-8 text-neon-purple mb-2" />
                <CardTitle className="text-lg">Personalidades IA</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <Badge variant="outline" className="text-xs">Camaleón</Badge>
                  <Badge variant="outline" className="text-xs">Psicólogo</Badge>
                  <Badge variant="outline" className="text-xs">Vengativo</Badge>
                  <Badge variant="outline" className="text-xs">Empático</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Dynamic Elements */}
            <Card className="bg-card/20 backdrop-blur-sm border-quantum-violet/20">
              <CardHeader className="pb-3">
                <Layers className="w-8 h-8 text-quantum-violet mb-2" />
                <CardTitle className="text-lg">Elementos Dinámicos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>Celdas Migratorias</div>
                  <div>Celdas Contagiosas</div>
                  <div>Celdas Eco</div>
                  <div>Celdas Espejo</div>
                </div>
              </CardContent>
            </Card>

            {/* Analytics */}
            <Card className="bg-card/20 backdrop-blur-sm border-neon-green/20">
              <CardHeader className="pb-3">
                <Sparkles className="w-8 h-8 text-neon-green mb-2" />
                <CardTitle className="text-lg">Análisis Profundo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>Micro-patrones</div>
                  <div>Predicción Cuántica</div>
                  <div>Análisis Emocional</div>
                  <div>Butterfly Effect</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink bg-clip-text text-transparent">
              ¿Estás Listo para Conocerte?
            </span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Enfr��ntate a una IA que no solo juega contra ti, sino que te enseña quién eres realmente como jugador.
          </p>
          <Link to="/game">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-neon-cyan to-neon-purple hover:from-neon-cyan/90 hover:to-neon-purple/90 text-background glow pulse-glow"
            >
              <Brain className="w-5 h-5 mr-2" />
              Iniciar Mind Mirror
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
