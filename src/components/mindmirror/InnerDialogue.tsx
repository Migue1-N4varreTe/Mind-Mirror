import React, { useState } from "react";
import { introspectiveQuestion, explorerQuestions, builderQuestions, visionaryQuestions } from "../../../ai";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, MessageCircle, Sparkles, Hammer, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuestionResult {
  question: string;
  tone: "sereno" | "provocador" | "poético";
}

const toneStyles = {
  sereno: "from-blue-500/20 to-cyan-500/20 border-cyan-500/30",
  provocador: "from-red-500/20 to-orange-500/20 border-orange-500/30", 
  poético: "from-purple-500/20 to-pink-500/20 border-pink-500/30"
};

export default function InnerDialogue() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<QuestionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedMode, setSelectedMode] = useState<"ai" | "explorer" | "builder" | "visionary">("ai");

  const handleGenerate = async () => {
    setLoading(true);
    try {
      if (selectedMode === "ai" && input.trim()) {
        const res = await introspectiveQuestion(input);
        try {
          const parsed = JSON.parse(res);
          setResult(parsed);
        } catch {
          setResult({
            question: res,
            tone: "sereno"
          });
        }
      } else {
        // Usar preguntas predefinidas
        let questions: string[] = [];
        switch (selectedMode) {
          case "explorer":
            questions = explorerQuestions;
            break;
          case "builder":
            questions = builderQuestions;
            break;
          case "visionary":
            questions = visionaryQuestions;
            break;
        }
        
        const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
        setResult({
          question: randomQuestion,
          tone: "poético"
        });
      }
    } catch (err) {
      console.error("Error al generar pregunta:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-2xl">
          <MessageCircle className="w-6 h-6 text-neon-purple" />
          💬 Diálogo Interior
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        <Tabs value={selectedMode} onValueChange={(value) => setSelectedMode(value as any)}>
          <TabsList className="grid w-full grid-cols-4 bg-muted/50">
            <TabsTrigger value="ai" className="text-xs">
              <Sparkles className="w-3 h-3 mr-1" />
              IA
            </TabsTrigger>
            <TabsTrigger value="explorer" className="text-xs">
              <Eye className="w-3 h-3 mr-1" />
              Explorer
            </TabsTrigger>
            <TabsTrigger value="builder" className="text-xs">
              <Hammer className="w-3 h-3 mr-1" />
              Builder
            </TabsTrigger>
            <TabsTrigger value="visionary" className="text-xs">
              <Sparkles className="w-3 h-3 mr-1" />
              Visionary
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ai" className="space-y-4">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe tu situación actual y recibirás una pregunta personalizada..."
              className="min-h-[100px] bg-muted/50 border-border/50 focus:border-neon-purple transition-colors"
              rows={3}
            />
          </TabsContent>

          <TabsContent value="explorer" className="text-center text-sm text-muted-foreground">
            Preguntas para explorar tu mundo interior y emociones
          </TabsContent>

          <TabsContent value="builder" className="text-center text-sm text-muted-foreground">
            Preguntas enfocadas en metas y construcción de hábitos
          </TabsContent>

          <TabsContent value="visionary" className="text-center text-sm text-muted-foreground">
            Preguntas místicas para conectar con tu propósito más profundo
          </TabsContent>
        </Tabs>

        <Button 
          onClick={handleGenerate} 
          disabled={loading || (selectedMode === "ai" && !input.trim())}
          className="w-full bg-gradient-to-r from-neon-purple to-neon-pink hover:opacity-90 transition-opacity"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generando pregunta...
            </>
          ) : (
            "Generar Pregunta"
          )}
        </Button>

        {result && (
          <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
            <Card className={cn(
              "border bg-gradient-to-br p-6",
              result.tone ? toneStyles[result.tone] : toneStyles.sereno
            )}>
              <CardContent className="p-0 text-center space-y-4">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Pregunta {result.tone || "reflexiva"}
                </div>
                
                <blockquote className="text-xl font-medium text-foreground leading-relaxed px-4">
                  "{result.question}"
                </blockquote>
                
                <div className="text-sm text-muted-foreground italic">
                  Tómate tu tiempo para reflexionar...
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
