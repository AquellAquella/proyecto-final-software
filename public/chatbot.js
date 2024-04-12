// variables para recibir texto del usuario y botón de enviar
const inputChatBtn = document.querySelector(".chat-input textarea");
const enviarChatBtn = document.querySelector(".chat-input span");
const chatbox = document.querySelector(".chatbox");

// variable para controlar visibilidad del chatbot
const chatbotToggler = document.querySelector(".chatbot-toggler");

// variable para controlar exit del chatbot en formato full image
const chatbotCerrarBtn = document.querySelector(".cerrar-btn");

// constante de altura dependiendo del input 
const inputInicioAltura = inputChatBtn.scrollHeight;

//variable que recibe el mensaje del usuario
let mensajeUsuario;

//creación de elementos de texto tanto para el chatbot como para el texto ingersado por el usuario
const crearChatLi = (message, className) => {
    const chatLi = document.createElement("li");
    chatLi.classList.add("chat", className);

    let chatContenido = className === "outgoing" ? `<p></p>` : `<span class="material-symbols-outlined">local_hospital</span><p></p>`;

    chatLi.innerHTML = chatContenido;

    //catch de que si el texto de mi chatbot trae etiquetas de HTML, que lo mande como un mensaje sencillo
    chatLi.querySelector("p").textContent = message;
    return chatLi;
}

const generararRespuesta = async (mensajeElemento) => {
  try {
      const response = await fetch('/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userInput: mensajeElemento }),
      });

      const data = await response.json();
      console.log(data)
      const botMessage = data.response;
      console.log(botMessage)

      // Eliminar el mensaje "Escribiendo..."
      const escribiendoMessage = document.querySelector(".incoming:last-child");
      if (escribiendoMessage) {
        chatbox.removeChild(escribiendoMessage);
      }

      // Añadir el mensaje del bot al historial del chat
      chatbox.appendChild(crearChatLi(botMessage, "incoming"));

      // Desplazar al fondo del historial del chat
      chatbox.scrollTo(0, chatbox.scrollHeight);
    } catch (error) {
      console.error('Error:', error);
      // Manejar errores de manera adecuada, por ejemplo, mostrar un mensaje de error al usuario
    }
}

const manejoChat = () => {
    // remover espacios en blanco innecesarios
    mensajeUsuario = inputChatBtn.value.trim();
    
    // se verifica que el mensaje se esta recibiendo
    // console.log(mensajeUsuario);

    if(!mensajeUsuario) return;
    //limpiando el cajón de texto una vez que se envían los valores necesarios
    inputChatBtn.value = "";

    //reseteando tamaño del cuadro de texto del chatbot una vez que se envia un mensaje
    inputChatBtn.style.height = `${inputInicioAltura}px`;

    //se ata el mensaje typeado por el usuario a la caja de chat diseñada
    chatbox.appendChild(crearChatLi(mensajeUsuario, "outgoing"));
    
    //autoscroll en los mensajes cuando no caben en pantalla
    chatbox.scrollTo(0, chatbox.scrollHeight);

    //Desarrollo de despliegue de mensaje de espera a respuesta del chatbot después de que el usuario da submit en el trabajo
    setTimeout (() => {
        chatbox.appendChild(crearChatLi("Escribiendo...", "incoming"));
        chatbox.scrollTo(0, chatbox.scrollHeight);
        generararRespuesta(mensajeUsuario);
    }, 600);
}


//Ajustando el cuadro de texto del usuario dependiendo de los elementos que este ingrese
inputChatBtn.addEventListener("input", () => {
    inputChatBtn.style.height = `${inputInicioAltura}px`;
    inputChatBtn.style.height = `${inputChatBtn.scrollHeight}px`;
});

//control de enviar mensaje mediante enter pero salto de línea mediante shift + enter
inputChatBtn.addEventListener("keydown", (e) => {
   //Si la tecla enter se hace click sin el shift, enviara un mensaje
   //Si su ancho es mayor a 800px se manejara el chat con la función manejoChat()
    if(e.key === "Enter" && !e.shiftKey && window.innerWidth > 800){
    e.preventDefault();
    manejoChat();
   }
});

enviarChatBtn.addEventListener("click", manejoChat);
//control del toggler de visibilidad del chatbot
chatbotCerrarBtn.addEventListener("click", () => document.body.classList.remove("show-chatbot"));
chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));