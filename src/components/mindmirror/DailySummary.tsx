import React, { useState, useEffect } from "react";
import { narrative } from "../../../ai";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, BookOpen, Star } from "lucide-react";
import { emotionalSymbols, elementalColors } from "../../../ai";

interface SummaryResult {
  summary: string;
  main_emotion: string;
  metaphor: string;
}

interface DailySummaryProps {
  reflections?: string[];
}

export default function DailySummary({ reflections = [] }: DailySummaryProps) {
  const [result, setResult] = useState<SummaryResult | null>(null);
  const [loading, setLoading] = useState(false);

  // Simular reflexiones del día si no se proporcionan
  const mockReflections = [
    "Hoy me sentí más conectado conmigo mismo",
    "Necesito encontrar más equilibrio en mi trabajo",
    "Estoy agradecido por las pequeñas cosas"
  ];

  const dailyReflections = reflections.length > 0 ? reflections : mockReflections;

  const handleGenerateSummary = async () => {
    if (dailyReflections.length === 0) return;
    
    setLoading(true);
    try {
      const res = await narrative(dailyReflections);
      try {
        const parsed = JSON.parse(res);
        setResult(parsed);
      } catch {
        setResult({
          summary: "Hoy fue un día de reflexión y crecimiento personal. Cada momento te ha acercado más a tu esencia verdadera.",
          main_emotion: "calma",
          metaphor: "Como un río que fluye hacia el océano, tus pensamientos encuentran su cauce natural"
        });
      }
    } catch (err) {
      console.error("Error al generar resumen:", err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-generar resumen al cargar si hay reflexiones
  useEffect(() => {
    if (dailyReflections.length > 0 && !result) {
      handleGenerateSummary();
    }
  }, []);

  const getEmotionSymbol = (emotion: string) => {
    return emotionalSymbols[emotion as keyof typeof emotionalSymbols] || "🔮";
  };

  const getEmotionColor = (emotion: string) => {
    // Mapear emociones a elementos y luego a colores
    const emotionToElement: Record<string, keyof typeof elementalColors> = {
      alegría: "luz",
      tristeza: "agua", 
      miedo: "sombra",
      enojo: "fuego",
      calma: "aire",
      confusión: "espíritu"
    };
    
    const element = emotionToElement[emotion] || "espíritu";
    return elementalColors[element];
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-2xl">
          <BookOpen className="w-6 h-6 text-neon-cyan" />
          📖 Resumen Diario
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Reflexiones del día */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Star className="w-4 h-4" />
            Reflexiones de hoy ({dailyReflections.length})
          </h3>
          <div className="grid gap-2">
            {dailyReflections.slice(0, 3).map((reflection, index) => (
              <div key={index} className="p-3 bg-muted/30 rounded-lg text-sm text-foreground/80">
                {reflection}
              </div>
            ))}
          </div>
        </div>

        {!result && (
          <Button 
            onClick={handleGenerateSummary} 
            disabled={loading || dailyReflections.length === 0}
            className="w-full bg-gradient-to-r from-neon-cyan to-neon-purple hover:opacity-90 transition-opacity"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Tejiendo tu historia...
              </>
            ) : (
              "Generar Resumen del Día"
            )}
          </Button>
        )}

        {result && (
          <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-700 space-y-4">
            
            {/* Resumen principal */}
            <Card className="border-border/30 bg-gradient-to-br from-muted/30 to-muted/10">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    Tu día en palabras
                  </div>
                  <p className="text-lg leading-relaxed text-foreground/90">
                    {result.summary}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Emoción y metáfora */}
            <div className="grid md:grid-cols-2 gap-4">
              
              {/* Emoción principal */}
              <Card className="border-border/30">
                <CardContent className="p-4 text-center">
                  <div className="space-y-3">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">
                      Emoción del día
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-2xl border-2 border-white/20"
                        style={{ backgroundColor: getEmotionColor(result.main_emotion) }}
                      >
                        {getEmotionSymbol(result.main_emotion)}
                      </div>
                      <span className="font-medium capitalize text-foreground">
                        {result.main_emotion}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Metáfora del día */}
              <Card className="border-border/30">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground text-center">
                      Metáfora del día
                    </div>
                    <blockquote className="text-sm italic text-foreground/80 text-center leading-relaxed">
                      "{result.metaphor}"
                    </blockquote>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Botón para regenerar */}
            <Button 
              onClick={handleGenerateSummary}
              variant="outline"
              className="w-full border-border/50 hover:bg-muted/50"
              disabled={loading}
            >
              Regenerar resumen
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
