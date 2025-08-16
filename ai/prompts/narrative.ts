import { callFusion } from "../fusionClient";

export async function narrative(inputArray: string[]) {
  const prompt = `
Analiza todas las reflexiones de hoy y sintetiza en un párrafo el tema central. 
Devuelve en JSON:
{ "summary": "párrafo resumen", "main_emotion": "emoción predominante", "metaphor": "metáfora poética del día" }

Reflexiones: ${inputArray.join("\n")}
  `;
  return await callFusion(prompt);
}

export async function emotionClassification(input: string) {
  const prompt = `
Analiza este texto y clasifica la emoción predominante entre: 
[alegría, tristeza, miedo, enojo, calma, confusión].
Devuelve en JSON: 
{ "emotion": "nombre", "color": "#hexadecimal asociado", "quote": "frase inspiradora relacionada" }

Texto: ${input}
  `;
  return await callFusion(prompt);
}

export async function actionSuggestion(input: string) {
  const prompt = `
A partir de la reflexión del usuario, sugiere una micro-acción práctica para mejorar su bienestar.
Responde en JSON:
{ "action": "micro-acción práctica", "difficulty": "baja/media/alta", "benefit": "beneficio esperado" }

Texto: ${input}
  `;
  return await callFusion(prompt);
}
