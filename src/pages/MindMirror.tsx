import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Button } from "../components/ui/button";
import { 
  Sparkles, 
  Heart, 
  Target, 
  MessageCircle, 
  BookOpen,
  Eye,
  Hammer,
  Crystal
} from "lucide-react";

import ReflectionCard from "../components/mindmirror/ReflectionCard";
import EmotionalMap from "../components/mindmirror/EmotionalMap";
import ActionPath from "../components/mindmirror/ActionPath";
import InnerDialogue from "../components/mindmirror/InnerDialogue";
import DailySummary from "../components/mindmirror/DailySummary";

export default function MindMirror() {
  const [selectedRoute, setSelectedRoute] = useState<"explorer" | "builder" | "visionary" | null>(null);
  const [currentReflections, setCurrentReflections] = useState<string[]>([]);

  if (!selectedRoute) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-dark-purple/20 p-4">
        <div className="max-w-6xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink bg-clip-text text-transparent mb-4">
              Mind Mirror
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Un viaje reflexivo e inmersivo hacia tu mundo interior
            </p>
          </div>

          {/* Rutas de juego */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            
            {/* Explorador Interior */}
            <Card 
              className="group cursor-pointer transition-all duration-300 hover:scale-105 hover:bg-card/80 border-border/50 bg-gradient-to-br from-card/50 to-neon-cyan/10"
              onClick={() => setSelectedRoute("explorer")}
            >
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-neon-cyan to-electric-blue flex items-center justify-center">
                  <Eye className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl">🌌 Explorador Interior</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-muted-foreground">
                  Viaje personal de autodescubrimiento a través de preguntas profundas y metáforas poéticas
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4 text-neon-cyan" />
                    <span>Preguntas introspectivas</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Crystal className="w-4 h-4 text-neon-cyan" />
                    <span>Feedback poético</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <BookOpen className="w-4 h-4 text-neon-cyan" />
                    <span>Paisajes desbloqueables</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Constructor de Realidades */}
            <Card 
              className="group cursor-pointer transition-all duration-300 hover:scale-105 hover:bg-card/80 border-border/50 bg-gradient-to-br from-card/50 to-neon-green/10"
              onClick={() => setSelectedRoute("builder")}
            >
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-neon-green to-neon-cyan flex items-center justify-center">
                  <Hammer className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl">🧩 Constructor de Realidades</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-muted-foreground">
                  Transforma reflexiones en bloques visuales para construir tu mapa de metas y hábitos
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-center gap-2">
                    <Target className="w-4 h-4 text-neon-green" />
                    <span>Metas visuales</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Hammer className="w-4 h-4 text-neon-green" />
                    <span>Construcción interactiva</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4 text-neon-green" />
                    <span>Jardín que florece</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Visionario Místico */}
            <Card 
              className="group cursor-pointer transition-all duration-300 hover:scale-105 hover:bg-card/80 border-border/50 bg-gradient-to-br from-card/50 to-neon-purple/10"
              onClick={() => setSelectedRoute("visionary")}
            >
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center">
                  <Crystal className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl">🔮 Visionario Místico</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-muted-foreground">
                  Conecta con arquetipos y símbolos únicos, colecciona glifos en tu grimorio personal
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-center gap-2">
                    <Crystal className="w-4 h-4 text-neon-purple" />
                    <span>Arquetipos místicos</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4 text-neon-purple" />
                    <span>Símbolos únicos</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <BookOpen className="w-4 h-4 text-neon-purple" />
                    <span>Grimorio personal</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bloques modulares */}
          <Card className="border-border/50 bg-card/30">
            <CardHeader>
              <CardTitle className="text-center">🔧 Bloques Modulares</CardTitle>
              <p className="text-center text-muted-foreground">
                Herramientas de reflexión disponibles en todas las rutas
              </p>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="reflection" className="w-full">
                <TabsList className="grid w-full grid-cols-5 bg-muted/50">
                  <TabsTrigger value="reflection">
                    <Sparkles className="w-4 h-4 mr-1" />
                    Reflejo
                  </TabsTrigger>
                  <TabsTrigger value="emotional">
                    <Heart className="w-4 h-4 mr-1" />
                    Mapa
                  </TabsTrigger>
                  <TabsTrigger value="action">
                    <Target className="w-4 h-4 mr-1" />
                    Acción
                  </TabsTrigger>
                  <TabsTrigger value="dialogue">
                    <MessageCircle className="w-4 h-4 mr-1" />
                    Diálogo
                  </TabsTrigger>
                  <TabsTrigger value="summary">
                    <BookOpen className="w-4 h-4 mr-1" />
                    Resumen
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="reflection" className="mt-6">
                  <ReflectionCard />
                </TabsContent>

                <TabsContent value="emotional" className="mt-6">
                  <EmotionalMap />
                </TabsContent>

                <TabsContent value="action" className="mt-6">
                  <ActionPath />
                </TabsContent>

                <TabsContent value="dialogue" className="mt-6">
                  <InnerDialogue />
                </TabsContent>

                <TabsContent value="summary" className="mt-6">
                  <DailySummary reflections={currentReflections} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Aquí irían las páginas específicas de cada ruta
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-dark-purple/20 p-4">
      <div className="max-w-4xl mx-auto">
        <Button 
          onClick={() => setSelectedRoute(null)}
          variant="outline" 
          className="mb-6"
        >
          ← Volver al menú principal
        </Button>
        
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ruta: {selectedRoute === "explorer" ? "🌌 Explorador Interior" : 
                   selectedRoute === "builder" ? "🧩 Constructor de Realidades" : 
                   "🔮 Visionario Místico"}
          </h2>
          <p className="text-muted-foreground mb-8">
            Esta funcionalidad estará disponible próximamente...
          </p>
        </div>
      </div>
    </div>
  );
}
