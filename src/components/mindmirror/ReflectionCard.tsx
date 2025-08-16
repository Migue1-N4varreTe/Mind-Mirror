import React, { useState } from "react";
import { reflection } from "../../../ai";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Loader2, Sparkles } from "lucide-react";

interface ReflectionResult {
  phrase: string;
  color: string;
  insight: string;
}

export default function ReflectionCard() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<ReflectionResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleReflect = async () => {
    if (!input.trim()) return;
    
    setLoading(true);
    try {
      const res = await reflection(input);
      // Intentar parsear como JSON, si falla usar como texto
      try {
        const parsed = JSON.parse(res);
        setResult(parsed);
      } catch {
        setResult({
          phrase: res,
          color: "#9370DB",
          insight: "Reflexión procesada"
        });
      }
    } catch (err) {
      console.error("Error al llamar a Fusion:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-2xl">
          <Sparkles className="w-6 h-6 text-neon-purple" />
          🪞 Mind Mirror
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe tu reflexión... ¿Qué está en tu mente hoy?"
          className="min-h-[120px] bg-muted/50 border-border/50 focus:border-neon-cyan transition-colors"
          rows={4}
        />

        <Button 
          onClick={handleReflect} 
          disabled={loading || !input.trim()}
          className="w-full bg-gradient-to-r from-neon-purple to-neon-cyan hover:opacity-90 transition-opacity"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Procesando...
            </>
          ) : (
            "Reflejar"
          )}
        </Button>

        {result && (
          <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
            <div className="p-6 rounded-lg border border-border/30" 
                 style={{ backgroundColor: `${result.color}20` }}>
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-8 h-8 rounded-full border-2 border-white/30"
                  style={{ backgroundColor: result.color }}
                />
                <span className="text-sm text-muted-foreground">Frase espejo</span>
              </div>
              <p className="text-lg font-medium text-foreground leading-relaxed">
                {result.phrase}
              </p>
            </div>
            
            {result.insight && (
              <div className="p-4 bg-muted/30 rounded-lg border border-border/30">
                <p className="text-sm text-muted-foreground mb-1">Insight</p>
                <p className="text-foreground/90">{result.insight}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
