import { callFusion } from "../fusionClient";

export async function reflection(input: string) {
  const prompt = `
Eres un espejo emocional. Recibes un texto y devuelves una reflexión breve en tono introspectivo. 
Responde siempre en JSON con las claves: 
{ "phrase": "frase espejo", "color": "#hexadecimal", "insight": "idea profunda en una línea" }

Analiza el siguiente texto:  
"${input}"  

Devuélveme:  
1. El tono emocional principal.  
2. Un color o paleta que lo represente.  
3. Una metáfora visual breve.  
4. Una frase de espejo (máx. 20 palabras).
  `;
  return await callFusion(prompt);
}
