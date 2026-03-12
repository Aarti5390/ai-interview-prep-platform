// testGemini.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI("PASTE_KEY_HERE");

async function test() {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent("Say hello");
  const response = await result.response;
  console.log(response.text());
}

test();