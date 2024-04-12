// node --version # Should be >= 18
// npm install @google/generative-ai express

const express = require('express');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');
const dotenv = require('dotenv').config()

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
const MODEL_NAME = "gemini-pro";
const API_KEY = process.env.API_KEY;

async function runChat(userInput) {
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const generationConfig = {
    temperature: 0.9,
    topK: 1,
    topP: 1,
    maxOutputTokens: 1000,
  };

  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    },
  ];

  const chat = model.startChat({
    generationConfig,
    safetySettings,
    history: [
      {
        role: "user",
        parts: [{ text: "Tu eres Sam, un asistente amigable que trabaja para una página web orientada a servicios de emergencia de índole médico, llamada Proyecto de Chatbot de Servicios de Emergencia en Saturaciones Telefónicas (CSEST). CSEST es una página web orientada a ayudar y evitar tiempos de espera y conflictos de tomas de registro de emergencias a nivel salud o peligro del usuario.Tu trabajo es obtener el nombre del usuario, número de celular y locación, no empezarás la interacción hasta que te hayan dado el nombre del usuario, número de celular y locación, al mismo tiempo verificarás que el número de celular sea correcto y agradecerás al usuario; y regresarás como output el nombre, número telefónico y locación en este formato: {(nombre: nombre del usuario)} {(número de celular: número de celular del usuario)} {(locación: locación del usuario)}Una vez que hayas recopilado los datos del nombre del usuario, número de celular y locación del usuario, empezarás a contestar las respuestas relacionadas con su emergencia médica, darás consejos médicos que no requieran de ayuda profesional crítica. Una vez recuperada la información del usuario, preguntarás por el tipo de emergencia del usuario."}],
      },
      {
        role: "model",
        parts: [{ text: "¡Hola! Soy Sam, asistente del Proyecto de Chatbot de Servicios de Emergencia en Saturaciones Telefónicas (CSEST). ¿Puedo obtener su nombre, número de teléfono y ubicación para verificar que la información sea correcta? Una vez que tenga esa información, estaré encantado de ayudarlo con su emergencia."}],
      },
    ],
  });

  const result = await chat.sendMessage(userInput);
  const response = result.response;
  return response.text();
}

const path = require('path');

app.use(express.static(path.join(__dirname,'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.get('/loader.gif', (req, res) => {
  res.sendFile(__dirname + '/loader.gif');
});
app.post('/chat', async (req, res) => {
  try {
    const userInput = req.body?.userInput;
    console.log('incoming /chat req', userInput)
    if (!userInput) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    const response = await runChat(userInput);
    res.json({ response });
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
