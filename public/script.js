const form = document.getElementById("chat-form");
const input = document.getElementById("user-input");
const chatBox = document.getElementById("chat-box");

function appendMessage(sender, text) {
    const messageElement = document.createElement("div");
    messageElement.classList.add("message", sender);
    messageElement.textContent = text;
    chatBox.appendChild(messageElement);

    const clearDiv = document.createElement("div");
    clearDiv.classList.add("clear");
    chatBox.appendChild(clearDiv);

    chatBox.scrollTop = chatBox.scrollHeight;
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

form.addEventListener("submit", async (e) => {
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
try {
    // 3. Send the user's message to the backend API
    const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        },
        body: JSON.stringify({
        conversation: [{ role: "user", text: userMessage }],
        }),
    });
    if (!response.ok) {
        throw new Error("Network response was not ok.");
    }
    
    const data = await response.json();
    const aiResponse = data.result;
    
    // 4. Replace loading with the AI's actual response
    if (aiResponse) {
        loadingElement.innerHTML = aiResponse;
    } else {
        loadingElement.innerHTML = "Maaf, tidak ada respons yang diterima.";
    }
    } catch (error) {
    console.error("Error fetching AI response:", error);
    loadingElement.innerHTML = "Gagal mendapatkan respons dari server.";
    } finally {
    chatBox.scrollTop = chatBox.scrollHeight;
    }
});
