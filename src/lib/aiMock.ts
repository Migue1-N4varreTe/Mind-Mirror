// Mock para los módulos de IA mientras configuramos Fusion
export async function reflection(input: string) {
  // Simular delay de API
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return JSON.stringify({
    phrase: "Tu reflexión resuena con la sabiduría del momento presente",
    color: "#9370DB",
    insight: "Cada pensamiento es una puerta hacia tu verdadero ser",
  });
}

export async function emotionClassification(input: string) {
  await new Promise((resolve) => setTimeout(resolve, 800));

  const emotions = [
    "alegría",
    "tristeza",
    "miedo",
    "enojo",
    "calma",
    "confusión",
  ];
  const colors = [
    "#FFD700",
    "#87CEEB",
    "#696969",
    "#FF6347",
    "#98FB98",
    "#DDA0DD",
  ];
  const quotes = [
    "La alegría es el eco de la vida vivida plenamente",
    "En la tristeza encontramos la profundidad de nuestro corazón",
    "El miedo es el guardián que nos protege, pero no debe gobernarnos",
    "El enojo es energía en movimiento, úsala sabiamente",
    "En la calma encontramos nuestro centro verdadero",
    "La confusión es el preludio de una nueva comprensión",
  ];

  const randomIndex = Math.floor(Math.random() * emotions.length);

  return JSON.stringify({
    emotion: emotions[randomIndex],
    color: colors[randomIndex],
    quote: quotes[randomIndex],
  });
}

export async function actionSuggestion(input: string) {
  await new Promise((resolve) => setTimeout(resolve, 900));

  const actions = [
    "Tómate 5 minutos para respirar conscientemente",
    "Escribe tres cosas por las que te sientes agradecido hoy",
    "Da un paseo de 10 minutos al aire libre",
    "Llama o envía un mensaje a alguien que aprecias",
    "Dedica 15 minutos a una actividad que realmente disfrutes",
  ];

  const difficulties = ["baja", "media", "alta"];
  const benefits = [
    "Reduce el estrés y aumenta la claridad mental",
    "Mejora tu perspectiva y bienestar emocional",
    "Incrementa tu energía y vitalidad",
    "Fortalece tus conexiones sociales",
    "Nutre tu alma y creatividad",
  ];

  const randomIndex = Math.floor(Math.random() * actions.length);

  return JSON.stringify({
    action: actions[randomIndex],
    difficulty: difficulties[Math.floor(Math.random() * difficulties.length)],
    benefit: benefits[randomIndex],
  });
}

export async function introspectiveQuestion(input: string) {
  await new Promise((resolve) => setTimeout(resolve, 700));

  const questions = [
    "¿Qué te está pidiendo tu corazón en este momento?",
    "¿Cuál es la historia que te cuentas sobre esta situación?",
    "¿Qué harías si supieras que no puedes fallar?",
    "¿Qué aspecto de ti mismo necesita más amor y comprensión?",
    "¿Cómo quieres recordar este momento dentro de un año?",
  ];

  const tones = ["sereno", "provocador", "poético"];

  return JSON.stringify({
    question: questions[Math.floor(Math.random() * questions.length)],
    tone: tones[Math.floor(Math.random() * tones.length)],
  });
}

export async function narrative(inputArray: string[]) {
  await new Promise((resolve) => setTimeout(resolve, 1200));

  return JSON.stringify({
    summary:
      "Hoy ha sido un día de reflexión profunda y crecimiento personal. Cada momento vivido te ha acercado más a tu esencia verdadera y a una comprensión más clara de tu camino.",
    main_emotion: "calma",
    metaphor:
      "Como un río que fluye hacia el océano, tus pensamientos encuentran su cauce natural hacia la sabiduría.",
  });
}

// Preguntas predefinidas
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

export const emotionalSymbols = {
  alegría: "☀️",
  tristeza: "🌙",
  miedo: "🗡️",
  enojo: "🔥",
  calma: "🌊",
  confusión: "🌀",
};

export const elementalColors = {
  fuego: "#FF6B35",
  agua: "#004E89",
  aire: "#87CEEB",
  tierra: "#8B4513",
  espíritu: "#9370DB",
  luz: "#FFD700",
  sombra: "#2F2F2F",
};
