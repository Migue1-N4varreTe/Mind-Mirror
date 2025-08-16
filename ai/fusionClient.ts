// Cliente genérico para Fusion
// (ajústalo a cómo autenticas Fusion en tu setup actual)

export async function callFusion(prompt: string): Promise<string> {
  const response = await fetch("https://api.fusion.ai/v1/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.FUSION_API_KEY}`
    },
    body: JSON.stringify({ prompt })
  });

  if (!response.ok) {
    throw new Error(`Fusion API error: ${response.status}`);
  }

  const data = await response.json();
  return data.output;
}
