import { callFusion } from "../fusionClient";

export async function generateVisualMetaphor(input: string) {
  const prompt = `
Genera una metáfora visual poética basada en el siguiente texto.
Responde en JSON:
{ "metaphor": "descripción visual poética", "colors": ["#color1", "#color2"], "symbol": "símbolo representativo", "mood": "atmosfera emocional" }

Texto: ${input}
  `;
  return await callFusion(prompt);
}

export async function generateArchetype(input: string) {
  const prompt = `
Basándote en esta reflexión, genera un arquetipo místico único.
Responde en JSON:
{ "archetype": "nombre del arquetipo", "description": "descripción poética", "symbol": "glifo o símbolo representativo", "power": "poder o cualidad especial", "element": "elemento asociado" }

Texto: ${input}
  `;
  return await callFusion(prompt);
}

export async function generateGlyph(input: string) {
  const prompt = `
Crea un glifo simbólico SVG simple basado en esta reflexión.
Responde en JSON:
{ "glyph_name": "nombre del glifo", "svg_path": "path SVG simple", "meaning": "significado del símbolo", "color": "color hexadecimal" }

Texto: ${input}
  `;
  return await callFusion(prompt);
}

// Símbolos predefinidos para diferentes estados emocionales
export const emotionalSymbols = {
  alegría: "☀️",
  tristeza: "🌙",
  miedo: "🗡️",
  enojo: "🔥",
  calma: "🌊",
  confusión: "🌀",
  esperanza: "⭐",
  nostalgia: "🍂",
  amor: "💖",
  sabiduría: "🦉"
};

export const elementalColors = {
  fuego: "#FF6B35",
  agua: "#004E89", 
  aire: "#87CEEB",
  tierra: "#8B4513",
  espíritu: "#9370DB",
  luz: "#FFD700",
  sombra: "#2F2F2F"
};
