const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Evaluate answer function – with explicit JSON format
const evaluateAnswer = async (question, answer) => {
  try {
    const prompt = `
You are a senior technical interviewer. Evaluate the candidate's answer.

Question:
${question}

Candidate Answer:
${answer}

Evaluation criteria:
- Score from 1 to 10 (1 = terrible, 10 = perfect)
- Strengths: what they did well (short bullet)
- Weaknesses: what they missed (short bullet)
- Suggestions: how to improve (short bullet)

Return ONLY a valid JSON object in this exact format:
{
  "score": number,
  "strengths": "string",
  "weaknesses": "string",
  "suggestions": "string"
}
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    });

    const aiText = completion.choices[0]?.message?.content;
    console.log("AI Evaluation Response:", aiText);

    // Extract JSON object
    const jsonMatch = aiText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON object found");

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate and return
    return {
      score: typeof parsed.score === 'number' ? Math.min(10, Math.max(1, parsed.score)) : 5,
      strengths: parsed.strengths || "Good attempt",
      weaknesses: parsed.weaknesses || "Needs improvement",
      suggestions: parsed.suggestions || "Practice more",
    };
  } catch (error) {
    console.error("Groq Evaluation Error:", error.message);
    // Fallback evaluation (should not happen often)
    return {
      score: 5,
      strengths: "Answer received",
      weaknesses: "Could be more detailed",
      suggestions: "Try to structure your answer better",
    };
  }
};

// Generate questions function (unchanged, but ensure it returns valid structure)
const generateQuestions = async ({ category, difficulty, numQuestions }) => {
  console.log("🔵 generateQuestions called with:", { category, difficulty, numQuestions });
  
  try {
    const prompt = `
Generate exactly ${numQuestions} interview questions about "${category}" at ${difficulty} difficulty level.

Return ONLY a valid JSON array of objects. Each object must have:
- "question": the question text
- "sampleAnswer": a concise, correct answer (2-3 sentences)

Example: [{"question": "What is a closure?", "sampleAnswer": "A closure is a function that retains access to its lexical scope even when executed outside that scope."}]

Do not include any extra text, explanations, or markdown.
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const aiText = completion.choices[0]?.message?.content;
    console.log("📥 Raw Groq response:", aiText);

    if (!aiText) throw new Error("Empty response from Groq");

    let jsonMatch = aiText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) jsonMatch = aiText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON array found");

    let questionsArray = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(questionsArray)) questionsArray = [questionsArray];

    const formatted = questionsArray.slice(0, numQuestions).map(q => ({
      question: q.question,
      sampleAnswer: q.sampleAnswer || "",
      userAnswer: null,
      score: null,
      feedback: null,
    }));
    
    return formatted;
  } catch (error) {
    console.error("❌ Groq generate questions error:", error.message);
    return getFallbackQuestions(category, difficulty, numQuestions);
  }
};

// Fallback (same as before)
const getFallbackQuestions = (category, difficulty, numQuestions) => {
  console.log("📚 Using fallback questions for:", { category, difficulty, numQuestions });
  const fallbackBank = {
    JavaScript: {
      easy: ["What is the difference between let and var?", "What is a closure?"],
      medium: ["Explain prototypal inheritance.", "What is the event loop?"],
      hard: ["Implement a debounce function.", "Explain the reconciliation process."]
    },
    React: {
      easy: ["What is JSX?", "What is a component?"],
      medium: ["Explain the useEffect hook.", "What is the virtual DOM?"],
      hard: ["How do you optimize a React app?", "Explain the reconciliation process."]
    },
    default: {
      easy: ["Tell me about yourself.", "What are your strengths?"],
      medium: ["Describe a challenging project.", "How do you handle conflict?"],
      hard: ["Explain a time you failed.", "How do you stay updated?"]
    }
  };
  
  const catBank = fallbackBank[category] || fallbackBank.default;
  const levelBank = catBank[difficulty] || catBank.medium || fallbackBank.default.medium;
  
  const questions = [];
  for (let i = 0; i < numQuestions; i++) {
    const questionText = levelBank[i % levelBank.length];
    questions.push({
      question: questionText,
      sampleAnswer: "Sample answer would go here.",
      userAnswer: null,
      score: null,
      feedback: null,
    });
  }
  return questions;
};

module.exports = { evaluateAnswer, generateQuestions };