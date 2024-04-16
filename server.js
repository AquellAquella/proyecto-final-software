// Elementos a descargar dentro del proyecto para que este funcione, utilizando la consola desde el root del proyecto
// node --version # Should be >= 18
// npm install @google/generative-ai express

// constante de obtención de elementos desde la carpeta y funcionalidad express de node_modules junto con obtención de variables delimitadas dentro del archivo de .env del uso del modelo de Node.js y los módulos descargados para generar ai desde un modelo
const express = require('express');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');
const dotenv = require('dotenv').config()

// Se da de alta el modelo de Gemini AI de Google Studio AI, abriendo el puerto 3000 para poder consultar la aplicación desde el localhost y se envía el API Key localizado en el archivo .env
const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
const MODEL_NAME = "gemini-pro";
const API_KEY = process.env.API_KEY;

// se obtienen los elementos del modelo y su API Key de las constantes dadas de alta en la parte superior junto con la configuración general del modelo
async function runChat(userInput) {
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const generationConfig = {
    temperature: 0.9,
    topK: 1,
    topP: 1,
    maxOutputTokens: 1000,
  };

// se configuran los elementos de seguridad de las restricciones del modelo, donde se dejan todas las categorías a que casi no bloquee nada en caso de que se presenten inputs peligrosos como AS o descripciones gráficas violentas
  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
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

  //Comienzo de los prompts del chat respectivo junto con el modelo precargado deinido desde un inicio.
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

// Alta de los elementos de path para obtener las ubicaciones del proyecto reestructurado de nueva manera de un inicio, para obtener el árbol de estructura del proyecto
const path = require('path');

// Se establece el directorio como estático en base a los contenidos de la carpeta pública, donde se encuentra el elemento de CSS y JavaScript para operar el chatbot
app.use(express.static(path.join(__dirname,'public')));

// Se establece como dirección automática el archivo determinado como index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

//Se hace una petición asyncrona bajo el nombre del chatbot para la recepción y envío de los mensajes del usuario hacia el chatbot en el otro endpoint. Quedará como bitácora dentro del log de la consola de comandos en el equipo en el que se ejecute la aplicación.
app.post('/chat', async (req, res) => {
  try {
    const userInput = req.body?.userInput;
    console.log('incoming /chat usuario', userInput)
    if (!userInput) {
      return res.status(400).json({ error: 'Cuerpo del mensaje invalido' });
    }

    const response = await runChat(userInput);
    res.json({ response });
  } catch (error) {
    console.error('Error en el endpoint del chat:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.listen(port, () => {
  console.log(`Server escuchando en el puerto ${port}`);
});
