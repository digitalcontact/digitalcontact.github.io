// app.js

const apiUrl = "https://api.openai.com/v1/chat/completions";
const md = new markdownit();

async function generateText(prompt) {

  const apiKey = document.getElementById("apikey").value;
  
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };

  const response = await fetch(apiUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: prompt,
    }),
  });

  const data = await response.json();
  return data.choices[0].message.content;
}

const conversation = [
  { role: "system", content: "" },
];

const roles = ["user", "assistant"];

async function sendMessage() {
  const context = document.getElementById("context").value;
  const userInput = document.getElementById("user-input").value;

  conversation[0].content = context;

  if (conversation.length > 10) {
    conversation.splice(1, 1);
  }

  conversation.push({ role: roles[0], content: userInput });
  appendMessage("user", userInput);

  const response = await generateText(conversation);
  conversation.push({ role: roles[1], content: response });
  appendMessage("assistant", response);

  document.getElementById("user-input").value = ""; // Limpia el campo de entrada
}

document.getElementById("submit").addEventListener("click", sendMessage);

document.getElementById("user-input").addEventListener("keypress", async (event) => {
  if (event.key === "Enter") {
    event.preventDefault(); // Evita la acción predeterminada (submit del formulario)
    await sendMessage();
  }
});

async function appendMessage(role, content) {
  const chatContainer = document.getElementById("chat-container");
  const messageElement = document.createElement("div");
  messageElement.classList.add("message", role);

  if (role === "assistant") {
    content = md.render(content);
    messageElement.innerHTML = `<strong>Assistant:</strong><br>${content}`;
  } else {
    messageElement.textContent = `You: ${content}`;
  }

  chatContainer.appendChild(messageElement);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function saveConversationAsMarkdown() {
  let markdownContent = "";

  for (const message of conversation) {
    const role = message.role === "user" ? "You" : "Assistant";
    const content = message.content;
    markdownContent += `**${role}:**\n\n${content}\n\n---\n\n`;
  }

  const blob = new Blob([markdownContent], { type: "text/markdown;charset=utf-8" });
  const anchor = document.createElement("a");
  anchor.href = URL.createObjectURL(blob);
  anchor.download = "conversation.md";
  anchor.click();
}

document.getElementById("save-conversation").addEventListener("click", saveConversationAsMarkdown);
