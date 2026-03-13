const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const evaluateAnswer = async (question, answer) => {
  try {

  const prompt = `
You are a senior technical interviewer.

Evaluate the candidate's answer.

Question:
${question}

Candidate Answer:
${answer}

Evaluation Rules:
1. Score from 1-10
2. Check correctness
3. Check completeness
4. Check technical depth
5. Check clarity

Return ONLY JSON in this format:

{
 "score": number,
 "strengths": "short bullet explanation",
 "weaknesses": "short bullet explanation",
 "suggestions": "how candidate can improve"
}
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.2,
    });

    const aiText = completion.choices[0].message.content;

    console.log("AI Response:", aiText);

    const jsonMatch = aiText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error("Invalid AI response format");
    }

    return JSON.parse(jsonMatch[0]);

  } catch (error) {
    console.error("Groq AI Error:", error.message);
    throw error;
  }
};

module.exports = { evaluateAnswer };

const generateQuestions = async (topic, difficulty, count) => {

  const prompt = `
You are a technical interviewer.

Generate ${count} interview questions.

Topic: ${topic}
Difficulty: ${difficulty}

Return ONLY JSON:

{
 "questions": [
   "question 1",
   "question 2",
   "question 3"
 ]
}
`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      {
        role: "user",
        content: prompt
      }
    ]
  });

  const aiText = completion.choices[0].message.content;

  const jsonMatch = aiText.match(/\{[\s\S]*\}/);

  return JSON.parse(jsonMatch[0]);
};

module.exports = { evaluateAnswer, generateQuestions };