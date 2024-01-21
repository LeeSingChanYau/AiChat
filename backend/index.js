const OpenAI = require('openai');
const express = require('express');
const app = express();
const port = 8080;
require('dotenv').config();

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://chanleesing:${process.env['MONGO_PASSWORD']}@cluster0.cex8bef.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Connect to MongoDB when the application starts
client
  .connect()
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1); // Exit the application if unable to connect
  });

async function getChatHistory() {
  const db = client.db('gpt');
  const collection = db.collection('chats');
  const chatHistory = await collection
    .aggregate([{ $project: { _id: 0 } }])
    .toArray();
  return chatHistory;
}

async function saveChatMessage(message) {
  const db = client.db('gpt');
  const collection = db.collection('chats');
  await collection.insertOne(message);
}

async function run() {
  try {
    const chatHistory = await getChatHistory();
  } catch (error) {
    console.error('Error retrieving chat history:', error);
  }
}

run().catch(console.dir);

const openai = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY'], // This is the default and can be omitted
});

async function generateResponse(prompt) {
  await saveChatMessage({ role: 'user', content: prompt });
  const chatHistory = await getChatHistory();

  const chatCompletion = await openai.chat.completions.create({
    messages: chatHistory,
    model: 'gpt-3.5-turbo',
  });

  await saveChatMessage({
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
