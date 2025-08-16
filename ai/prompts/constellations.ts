import { callFusion } from "../fusionClient";

export async function constellations(history: string[]) {
  const prompt = `
Tengo estas reflexiones de usuario:  
${history.join("\n")}  

Detecta:  
1. Temas centrales repetidos (máx. 3).  
2. Conexiones entre reflexiones.  
3. Un símbolo o arquetipo que sintetice cada tema.

Responde en JSON:
{ "themes": ["tema1", "tema2", "tema3"], "connections": "descripción de conexiones", "archetypes": ["símbolo1", "símbolo2", "símbolo3"] }
  `;
  return await callFusion(prompt);
}
