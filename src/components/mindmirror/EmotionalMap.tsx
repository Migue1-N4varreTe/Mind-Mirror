import React, { useState } from "react";
import { emotionClassification } from "../../../ai";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmotionResult {
  emotion: string;
  color: string;
  quote: string;
}

const emotionIcons: Record<string, string> = {
  alegría: "😊",
  tristeza: "😢",
  miedo: "😰", 
  enojo: "😠",
  calma: "😌",
  confusión: "😵"
};

export default function EmotionalMap() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<EmotionResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    
    setLoading(true);
    try {
      const res = await emotionClassification(input);
      try {
        const parsed = JSON.parse(res);
        setResult(parsed);
      } catch {
        setResult({
          emotion: "calma",
          color: "#87CEEB",
          quote: "Cada emoción es un maestro esperando ser escuchado"
        });
      }
    } catch (err) {
      console.error("Error al analizar emoción:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-2xl">
          <Heart className="w-6 h-6 text-neon-pink" />
          🗺️ Mapa Emocional
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe cómo te sientes ahora..."
          className="min-h-[120px] bg-muted/50 border-border/50 focus:border-neon-pink transition-colors"
          rows={4}
        />

        <Button 
          onClick={handleAnalyze} 
          disabled={loading || !input.trim()}
          className="w-full bg-gradient-to-r from-neon-pink to-neon-purple hover:opacity-90 transition-opacity"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analizando...
            </>
          ) : (
            "Mapear Emoción"
          )}
        </Button>

        {result && (
          <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col items-center space-y-4 p-6 rounded-xl border border-border/30"
                 style={{ backgroundColor: `${result.color}15` }}>
              
              {/* Círculo emocional */}
              <div className="relative">
                <div
                  className={cn(
                    "w-24 h-24 rounded-full flex items-center justify-center",
                    "border-4 border-white/30 backdrop-blur-sm",
                    "text-4xl font-bold text-white shadow-lg",
                    "animate-pulse"
                  )}
                  style={{ backgroundColor: result.color }}
                >
                  {emotionIcons[result.emotion] || "🔮"}
                </div>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                  <span className="px-3 py-1 bg-background/90 rounded-full text-sm font-medium border border-border/50">
                    {result.emotion}
                  </span>
                </div>
              </div>

              {/* Cita inspiradora */}
              <div className="text-center space-y-2 max-w-md">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Mensaje para ti
                </p>
                <blockquote className="text-lg italic text-foreground/90 leading-relaxed">
                  "{result.quote}"
                </blockquote>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
