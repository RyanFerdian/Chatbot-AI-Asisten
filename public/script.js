const socket = io();

const form = document.getElementById("chat-form");
const input = document.getElementById("user-input");
const chatBox = document.getElementById("chat-box");

let conversation = [];

function appendMessage(sender, text) {
    const messageElement = document.createElement("div");
    messageElement.classList.add("message", sender);
    messageElement.textContent = text;
    chatBox.appendChild(messageElement);

    const clearDiv = document.createElement("div");
    clearDiv.classList.add("clear");
    chatBox.appendChild(clearDiv);

    chatBox.scrollTop = chatBox.scrollHeight;

    // Add to conversation history
    conversation.push({ role: sender === "user" ? "user" : "model", text });

    return messageElement;
}

function appendLoading() {
    const loadingElement = document.createElement("div");
    loadingElement.classList.add("message", "bot");

    const spinner = document.createElement("div");
    spinner.classList.add("loading");
    loadingElement.appendChild(spinner);
    loadingElement.appendChild(document.createTextNode("Sedang berpikir..."));
    chatBox.appendChild(loadingElement);

  // Add clear div
    const clearDiv = document.createElement("div");
    clearDiv.classList.add("clear");
    chatBox.appendChild(clearDiv);

  // Scroll to the latest message
    chatBox.scrollTop = chatBox.scrollHeight;
    return loadingElement;
}

form.addEventListener("submit", (e) => {
    e.preventDefault();

    const userMessage = input.value.trim();
    if (!userMessage) {
        return;
    }

    // 1. Add user's message to the chat box
    appendMessage("user", userMessage);

    input.value = "";

    // 2. Show a loading spinner
    const loadingElement = appendLoading();

    // 3. Send the user's message via socket
    socket.emit('chat message', {
        conversation: conversation
    });

    let aiResponse = '';

    // Listen for chunks
    const onChunk = (data) => {
        aiResponse += data.chunk;
        loadingElement.innerHTML = aiResponse;
    };

    const onDone = (data) => {
        loadingElement.innerHTML = data.full;
        // Add bot response to conversation
        conversation.push({ role: "model", text: data.full });
        socket.off('chat chunk', onChunk);
        socket.off('chat done', onDone);
        socket.off('chat error', onError);
    };

    const onError = (data) => {
        loadingElement.innerHTML = "Gagal mendapatkan respons dari server: " + data.error;
        socket.off('chat chunk', onChunk);
        socket.off('chat done', onDone);
        socket.off('chat error', onError);
    };

    socket.on('chat chunk', onChunk);
    socket.on('chat done', onDone);
    socket.on('chat error', onError);
});
