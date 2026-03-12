require('dotenv').config();
console.log('GROQ_API_KEY:', process.env.GROQ_API_KEY ? 'Found' : 'Not found');