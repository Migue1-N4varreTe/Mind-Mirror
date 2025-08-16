import React, { useState } from "react";
import { actionSuggestion } from "@/lib/aiMock";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Target, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActionResult {
  action: string;
  difficulty: "baja" | "media" | "alta";
  benefit: string;
}

const difficultyConfig = {
  baja: { color: "bg-green-500/20 text-green-300", icon: "🌱" },
  media: { color: "bg-yellow-500/20 text-yellow-300", icon: "🌿" },
  alta: { color: "bg-red-500/20 text-red-300", icon: "🌳" },
};

export default function ActionPath() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<ActionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleSuggest = async () => {
    if (!input.trim()) return;

    setLoading(true);
    setCompleted(false);
    try {
      const res = await actionSuggestion(input);
      try {
        const parsed = JSON.parse(res);
        setResult(parsed);
      } catch {
        setResult({
          action: "Tómate 5 minutos para respirar conscientemente",
          difficulty: "baja",
          benefit: "Reduce el estrés y aumenta la claridad mental",
        });
      }
    } catch (err) {
      console.error("Error al sugerir acción:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-2xl">
          <Target className="w-6 h-6 text-neon-green" />
          🛤️ Camino de Acción
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="¿En qué área de tu vida quieres tomar acción?"
          className="min-h-[120px] bg-muted/50 border-border/50 focus:border-neon-green transition-colors"
          rows={4}
        />

        <Button
          onClick={handleSuggest}
          disabled={loading || !input.trim()}
          className="w-full bg-gradient-to-r from-neon-green to-neon-cyan hover:opacity-90 transition-opacity"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creando camino...
            </>
          ) : (
            "Sugerir Acción"
          )}
        </Button>

        {result && (
          <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
            <Card className="border-border/30 bg-gradient-to-br from-muted/30 to-muted/10">
              <CardContent className="p-6 space-y-4">
                {/* Acción sugerida */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">
                      {difficultyConfig[result.difficulty]?.icon}
                    </span>
                    <Badge
                      className={cn(
                        "text-xs",
                        difficultyConfig[result.difficulty]?.color,
                      )}
                    >
                      Dificultad {result.difficulty}
                    </Badge>
                  </div>

                  <div className="p-4 bg-background/30 rounded-lg border border-border/20">
                    <h3 className="font-medium text-foreground mb-2">
                      Tu próximo paso:
                    </h3>
                    <p className="text-lg text-foreground/90 leading-relaxed">
                      {result.action}
                    </p>
                  </div>
                </div>

                {/* Beneficio esperado */}
                <div className="p-4 bg-neon-green/10 rounded-lg border border-neon-green/20">
                  <h4 className="text-sm font-medium text-neon-green mb-2">
                    Beneficio esperado:
                  </h4>
                  <p className="text-foreground/80">{result.benefit}</p>
                </div>

                {/* Botón de completado */}
                <Button
                  onClick={() => setCompleted(!completed)}
                  variant={completed ? "default" : "outline"}
                  className={cn(
                    "w-full transition-all duration-300",
                    completed
                      ? "bg-neon-green hover:bg-neon-green/90 text-black"
                      : "border-neon-green/50 text-neon-green hover:bg-neon-green/10",
                  )}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {completed ? "¡Completado!" : "Marcar como completado"}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
