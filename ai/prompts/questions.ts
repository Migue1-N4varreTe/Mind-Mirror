import { callFusion } from "../fusionClient";

export async function introspectiveQuestion(input: string) {
  const prompt = `
Actúa como el espejo interior del usuario. 
Devuelve una sola pregunta poderosa que invite a la introspección. 
Responde en JSON: 
{ "question": "pregunta reflexiva", "tone": "sereno/provocador/poético" }

Texto: ${input}
  `;
  return await callFusion(prompt);
}

// Preguntas específicas para cada ruta del juego
export const explorerQuestions = [
  "¿Qué parte de ti buscas entender mejor hoy?",
  "Si pudieras conversar con tu yo del pasado, ¿qué le dirías?",
  "¿Qué emoción has estado evitando últimamente?",
  "¿Cuál es la historia que te cuentas sobre quien eres?",
  "¿Qué te susurra tu intuición en este momento?",
];

export const builderQuestions = [
  "¿Qué hábito quieres sembrar hoy?",
  "¿Cuál es el siguiente paso pequeño hacia tu meta más importante?",
  "¿Qué obstáculo interno necesitas transformar?",
  "¿Cómo quieres que se sienta tu día ideal?",
  "¿Qué estructura necesita tu vida para florecer?",
];

export const visionaryQuestions = [
  "Si fueras un guardián de sabiduría, ¿qué símbolo te representaría?",
  "¿Qué arquetipo vive en tu interior esperando ser expresado?",
  "¿Cuál es tu don único para el mundo?",
  "¿Qué mensaje traes desde tu futuro ideal?",
  "¿Qué símbolo representa tu transformación actual?",
];
