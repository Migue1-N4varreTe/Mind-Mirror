import React, { useState } from "react";
import { reflection, emotionClassification, actionSuggestion, introspectiveQuestion, narrative } from "@/lib/aiMock";

// Componente simple de Card sin dependencias
const SimpleCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <div className={`rounded-lg border bg-card text-card-foreground shadow-sm p-6 ${className}`}>
    {children}
  </div>
);

// Componente simple de Button
const SimpleButton: React.FC<{ 
  children: React.ReactNode; 
  onClick?: () => void; 
  disabled?: boolean;
  className?: string;
}> = ({ children, onClick, disabled = false, className = "" }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 ${className}`}
  >
    {children}
  </button>
);

// Componente simple de Textarea
const SimpleTextarea: React.FC<{
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  className?: string;
  rows?: number;
}> = ({ value, onChange, placeholder, className = "", rows = 4 }) => (
  <textarea
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    rows={rows}
    className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
  />
);

// Componente de Loading
const LoadingSpinner: React.FC = () => (
  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
);

export default function MindMirrorStandalone() {
  const [currentTool, setCurrentTool] = useState<"reflection" | "emotion" | "action" | "question" | "summary">("reflection");
  const [input, setInput] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleProcess = async () => {
    if (!input.trim() && currentTool !== "summary") return;
    
    setLoading(true);
    setResult(null);
    
    try {
      let response = "";
      
      switch (currentTool) {
        case "reflection":
          response = await reflection(input);
          break;
        case "emotion":
          response = await emotionClassification(input);
          break;
        case "action":
          response = await actionSuggestion(input);
          break;
        case "question":
          response = await introspectiveQuestion(input);
          break;
        case "summary":
          response = await narrative([input, "Reflexión del día", "Momento de introspección"]);
          break;
      }
      
      try {
        setResult(JSON.parse(response));
      } catch {
        setResult({ message: response });
      }
    } catch (error) {
      console.error("Error:", error);
      setResult({ error: "Error al procesar la solicitud" });
    } finally {
      setLoading(false);
    }
  };

  const tools = [
    { id: "reflection", name: "🪞 Reflexión", desc: "Espejo emocional" },
    { id: "emotion", name: "❤️ Emoción", desc: "Mapa emocional" },
    { id: "action", name: "🎯 Acción", desc: "Camino práctico" },
    { id: "question", name: "💭 Pregunta", desc: "Diálogo interior" },
    { id: "summary", name: "📖 Resumen", desc: "Síntesis diaria" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-dark-purple/20 p-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink bg-clip-text text-transparent mb-4">
            Mind Mirror
          </h1>
          <p className="text-xl text-muted-foreground">
            Un viaje reflexivo hacia tu mundo interior
          </p>
        </div>

        {/* Tool Selector */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setCurrentTool(tool.id as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                currentTool === tool.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground"
              }`}
            >
              {tool.name}
            </button>
          ))}
        </div>

        {/* Main Tool Interface */}
        <SimpleCard className="max-w-2xl mx-auto">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2">
                {tools.find(t => t.id === currentTool)?.name}
              </h2>
              <p className="text-muted-foreground">
                {tools.find(t => t.id === currentTool)?.desc}
              </p>
            </div>

            {currentTool !== "summary" && (
              <SimpleTextarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  currentTool === "reflection" ? "Escribe tu reflexión..." :
                  currentTool === "emotion" ? "Describe cómo te sientes..." :
                  currentTool === "action" ? "¿En qué área quieres tomar acción?" :
                  "Describe tu situación actual..."
                }
                className="min-h-[120px]"
              />
            )}

            <SimpleButton
              onClick={handleProcess}
              disabled={loading || (!input.trim() && currentTool !== "summary")}
              className="w-full"
            >
              {loading ? (
                <>
                  <LoadingSpinner />
                  <span className="ml-2">Procesando...</span>
                </>
              ) : (
                `${currentTool === "reflection" ? "Reflejar" :
                   currentTool === "emotion" ? "Analizar" :
                   currentTool === "action" ? "Sugerir" :
                   currentTool === "question" ? "Preguntar" :
                   "Resumir"}`
              )}
            </SimpleButton>

            {/* Results */}
            {result && (
              <div className="mt-6 p-6 bg-muted/30 rounded-lg border animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
                {currentTool === "reflection" && result.phrase && (
                  <div className="space-y-4">
                    <div 
                      className="p-4 rounded-lg text-center"
                      style={{ backgroundColor: `${result.color}20` }}
                    >
                      <div className="flex items-center justify-center gap-3 mb-3">
                        <div
                          className="w-8 h-8 rounded-full"
                          style={{ backgroundColor: result.color }}
                        />
                        <span className="text-sm text-muted-foreground">Frase espejo</span>
                      </div>
                      <p className="text-lg font-medium">{result.phrase}</p>
                    </div>
                    {result.insight && (
                      <div className="p-3 bg-background/50 rounded">
                        <p className="text-sm font-medium mb-1">Insight:</p>
                        <p className="text-muted-foreground">{result.insight}</p>
                      </div>
                    )}
                  </div>
                )}

                {currentTool === "emotion" && result.emotion && (
                  <div className="text-center space-y-4">
                    <div className="flex flex-col items-center gap-3">
                      <div
                        className="w-20 h-20 rounded-full flex items-center justify-center text-3xl border-4 border-white/20"
                        style={{ backgroundColor: result.color }}
                      >
                        {result.emotion === "alegría" ? "😊" :
                         result.emotion === "tristeza" ? "😢" :
                         result.emotion === "miedo" ? "😰" :
                         result.emotion === "enojo" ? "😠" :
                         result.emotion === "calma" ? "😌" : "😵"}
                      </div>
                      <h3 className="text-xl font-semibold capitalize">{result.emotion}</h3>
                    </div>
                    <blockquote className="text-lg italic text-muted-foreground">
                      "{result.quote}"
                    </blockquote>
                  </div>
                )}

                {currentTool === "action" && result.action && (
                  <div className="space-y-4">
                    <div className="p-4 bg-background/50 rounded-lg">
                      <h3 className="font-medium mb-2">Tu próximo paso:</h3>
                      <p className="text-lg">{result.action}</p>
                    </div>
                    <div className="flex gap-2">
                      <span className="px-2 py-1 bg-muted rounded text-xs">
                        Dificultad: {result.difficulty}
                      </span>
                    </div>
                    <div className="p-3 bg-green-500/10 rounded border border-green-500/20">
                      <p className="text-sm font-medium text-green-300 mb-1">Beneficio:</p>
                      <p className="text-green-100/80">{result.benefit}</p>
                    </div>
                  </div>
                )}

                {currentTool === "question" && result.question && (
                  <div className="text-center space-y-4">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">
                      Pregunta {result.tone || "reflexiva"}
                    </div>
                    <blockquote className="text-xl font-medium leading-relaxed">
                      "{result.question}"
                    </blockquote>
                    <p className="text-sm text-muted-foreground italic">
                      Tómate tu tiempo para reflexionar...
                    </p>
                  </div>
                )}

                {currentTool === "summary" && result.summary && (
                  <div className="space-y-4">
                    <div className="p-4 bg-background/50 rounded-lg">
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Resumen del día</h3>
                      <p className="text-lg leading-relaxed">{result.summary}</p>
                    </div>
                    {result.main_emotion && (
                      <div className="p-3 bg-muted/20 rounded">
                        <p className="text-sm"><strong>Emoción principal:</strong> {result.main_emotion}</p>
                      </div>
                    )}
                    {result.metaphor && (
                      <div className="p-3 bg-muted/20 rounded">
                        <p className="text-sm"><strong>Metáfora:</strong> "{result.metaphor}"</p>
                      </div>
                    )}
                  </div>
                )}

                {result.error && (
                  <div className="text-center text-red-400">
                    <p>{result.error}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </SimpleCard>

        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            Mind Mirror • Versión de prueba con IA simulada
          </p>
        </div>
      </div>
    </div>
  );
}
