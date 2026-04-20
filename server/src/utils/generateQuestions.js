const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

exports.generateQuestions = async ({ category, difficulty, numQuestions }) => {
  try {
    console.log("📌 Generating Questions:", { category, difficulty, numQuestions });

    const prompt = `
Generate ${numQuestions} ${difficulty} level interview questions on ${category}.

STRICT RULES:
- Return ONLY valid JSON
- No explanation, no text outside JSON
- Format exactly like:

[
  { "text": "Question 1" },
  { "text": "Question 2" }
]
`;

    const response = await groq.chat.completions.create({
      model: "llama3-8b-8192",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
    });

    const content = response.choices[0].message.content;

    console.log("🧠 RAW AI RESPONSE:", content);

    let questions;

    try {
      questions = JSON.parse(content);
    } catch (err) {
      console.error("❌ JSON PARSE FAILED. Using fallback.");

      // 🔥 Fallback (VERY IMPORTANT)
      questions = [
        { text: "Explain event loop in Node.js" },
        { text: "What is useEffect in React?" },
        { text: "Difference between SQL and NoSQL" },
        { text: "What is JWT authentication?" },
        { text: "Explain REST API" }
      ];
    }

    // ✅ Ensure correct format
    const formattedQuestions = questions
      .slice(0, numQuestions)
      .map((q) => ({
        text: q.text || q.question || "Sample question",
      }));

    return formattedQuestions;

  } catch (error) {
    console.error("❌ GROQ ERROR:", error.message);

    // 🔥 FINAL FALLBACK (never crash server)
    return [
      { text: "Explain event loop in Node.js" },
      { text: "What is React useEffect?" },
      { text: "Explain REST API" }
    ];
  }
};