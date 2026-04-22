const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// ----------------------------------------------------------------------
// 1. Enhanced answer evaluation with detailed rubric
// ----------------------------------------------------------------------
const evaluateAnswer = async (question, answer) => {
  try {
    const prompt = `
You are a senior technical interviewer with expertise in software engineering. Evaluate the candidate's answer strictly and fairly.

Question: ${question}
Candidate Answer: ${answer}

Evaluate based on these criteria:
1. Correctness (0-10): Is the answer factually correct? Does it address the core of the question?
2. Completeness (0-10): Does it cover all aspects? Are there major omissions?
3. Clarity (0-10): Is it well-structured and easy to understand? Proper grammar and terminology?
4. Depth (0-10): Does it demonstrate deep understanding? Mentions edge cases, trade-offs, or advanced concepts?

Overall score = average of the four criteria (rounded to nearest integer, range 1-10).

Return ONLY a valid JSON object with these fields:
- "score": integer (1-10)
- "strengths": string (2-3 specific positive aspects, separated by commas)
- "weaknesses": string (2-3 specific areas for improvement, separated by commas)
- "suggestions": string (actionable advice to improve future answers)

Example for a good answer:
{"score": 8, "strengths": "Correctly identifies the main concept, provides a clear example", "weaknesses": "Missing discussion of edge cases, slightly verbose", "suggestions": "Add a note about handling null inputs, practice conciseness"}

Example for a poor answer:
{"score": 3, "strengths": "Attempted to answer", "weaknesses": "Factually incorrect, lacks structure, no examples", "suggestions": "Review core documentation, practice explaining concepts out loud"}

Be strict but fair. Use specific feedback. Do not add any extra text outside the JSON.`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile", // more powerful model for better accuracy
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 500,
    });

    const aiText = completion.choices[0]?.message?.content;
    console.log("AI Evaluation Response:", aiText);

    const jsonMatch = aiText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON object found");

    const parsed = JSON.parse(jsonMatch[0]);

    const toString = (val) => {
      if (Array.isArray(val)) return val.join(', ');
      if (typeof val === 'string') return val;
      if (typeof val === 'object') return JSON.stringify(val);
      return String(val);
    };

    let score = parsed.score;
    if (typeof score !== 'number') score = 5;
    score = Math.min(10, Math.max(1, Math.round(score)));

    return {
      score,
      strengths: toString(parsed.strengths) || "Answer received",
      weaknesses: toString(parsed.weaknesses) || "Needs more detail",
      suggestions: toString(parsed.suggestions) || "Practice structuring your answers",
    };
  } catch (error) {
    console.error("Groq Evaluation Error:", error.message);
    // Fallback heuristic: length-based score (rough, but better than nothing)
    const lengthScore = Math.min(10, Math.max(1, Math.floor(answer.length / 100)));
    return {
      score: lengthScore,
      strengths: "Answer provided",
      weaknesses: "Could be more detailed",
      suggestions: "Try to elaborate more and use examples",
    };
  }
};

// ----------------------------------------------------------------------
// 2. Improved question generation (difficulty-aware, diverse)
// ----------------------------------------------------------------------
const generateQuestions = async ({ category, difficulty, numQuestions }) => {
  console.log("Generating questions for:", category, difficulty, numQuestions);

  // Reliable fallback (never fails)
  const fallback = [];
  const bank = [
    { question: `Tell me about your experience with ${category}.`, sampleAnswer: "I have worked with it for several years..." },
    { question: `What are the key concepts of ${category}?`, sampleAnswer: "The key concepts include..." },
    { question: `How would you solve a problem using ${category}?`, sampleAnswer: "I would approach it by..." },
    { question: `What are the best practices in ${category}?`, sampleAnswer: "Best practices include..." },
    { question: `How do you stay updated with ${category}?`, sampleAnswer: "I follow blogs and take courses..." }
  ];
  for (let i = 0; i < numQuestions; i++) {
    fallback.push({
      question: bank[i % bank.length].question,
      sampleAnswer: bank[i % bank.length].sampleAnswer,
      userAnswer: null,
      score: null,
      feedback: null,
    });
  }

  try {
    const difficultyMap = {
      easy: "basic conceptual questions, suitable for beginners",
      medium: "intermediate questions requiring practical knowledge and some problem-solving",
      hard: "advanced questions involving edge cases, performance considerations, and system design"
    };
    const difficultyDesc = difficultyMap[difficulty] || difficultyMap.medium;

    const prompt = `Generate ${numQuestions} technical interview questions about "${category}" at ${difficulty} difficulty level (${difficultyDesc}).
Return ONLY a JSON array of objects, each with "question" and "sampleAnswer". The sample answer should be concise (2-4 sentences).
Make questions relevant to real-world scenarios, and ensure they vary in style (definition, scenario-based, code reasoning, trade-offs).
Do not include any extra text outside the JSON.`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
      max_tokens: 1000,
    });
    const aiText = completion.choices[0]?.message?.content;
    console.log("Generated questions raw response:", aiText);
    const jsonMatch = aiText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const aiQuestions = JSON.parse(jsonMatch[0]);
      if (Array.isArray(aiQuestions) && aiQuestions.length > 0) {
        return aiQuestions.slice(0, numQuestions).map(q => ({
          question: q.question,
          sampleAnswer: q.sampleAnswer || "",
          userAnswer: null,
          score: null,
          feedback: null,
        }));
      }
    }
    throw new Error("Invalid AI response");
  } catch (err) {
    console.error("Groq failed, using fallback questions:", err.message);
    return fallback;
  }
};

module.exports = { evaluateAnswer, generateQuestions };