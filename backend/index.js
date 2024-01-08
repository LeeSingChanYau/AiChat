const OpenAI = require('openai');
const express = require('express');
const app = express();
const port = 8080;

const openai = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY'], // This is the default and can be omitted
});

const conversations = [];

async function generateResponse(prompt) {
  conversations.push({ role: 'user', content: prompt });
  const chatCompletion = await openai.chat.completions.create({
    messages: [...conversations],
    model: 'gpt-3.5-turbo',
  });
  conversations.push({
    role: 'assistant',
    content: chatCompletion.choices[0].message.content,
  });
  return chatCompletion.choices[0].message.content;
}

// Define a basic route
app.get('/response', async (req, res) => {
  const userMessage = req.query.m;
  const response = await generateResponse(userMessage);
  console.log(userMessage);
  console.log(response);
  res.send(response);
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
