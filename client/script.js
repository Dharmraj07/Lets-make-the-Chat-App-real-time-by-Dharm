const API_URL = "http://localhost:8000";
const token = localStorage.getItem('token');
const name = localStorage.getItem('username');
const messageContainer = document.getElementById('message-container');
const messageInput = document.getElementById('message-input');
const messageForm = document.getElementById('send-container');

const socket = io(API_URL);

socket.emit('new-user', name);

socket.on('chat-message', data => {
  appendMessage(`${data.name}: ${data.message}`);
});

socket.on('user-connected', name => {
  appendMessage(`${name} connected`);
});

socket.on('user-disconnected', name => {
  appendMessage(`${name} disconnected`);
});

messageForm.addEventListener('submit', async e => {
  e.preventDefault();
  const message = messageInput.value;

  const response = await fetch(`${API_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ message }),
  });

  const data = await response.json();
 // appendMessage(`${name}: ${message}`);
  socket.emit('send-chat-message', message);
  messageInput.value = '';
});

async function getMessages() {
  try {
    const response = await fetch(`${API_URL}/chat`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    allChatAppend(data);
  } catch (error) {
    console.error(error);
  }
}

function appendMessage(message) {
  const messageElement = document.createElement('div');
  messageElement.innerText = message;
  messageContainer.append(messageElement);
}

function allChatAppend(data) {
  messageContainer.innerHTML = '';
  data.forEach(element => {
    const messageElement = document.createElement('div');
    messageElement.innerHTML = `<b>${element.username}:</b> ${element.message}`;
    messageContainer.append(messageElement);
  });
}

// Call the API every 1 second
setInterval(() => {
  getMessages();
}, 1000);

// Initial call to get all messages
getMessages();

