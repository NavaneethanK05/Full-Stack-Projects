// DOM Elements
const chatForm = document.getElementById('chatForm');
const messageInput = document.getElementById('messageInput');
const messagesContainer = document.getElementById('messagesContainer');
const typingIndicator = document.getElementById('typingIndicator');
const sendButton = document.getElementById('sendButton');

// State
let isProcessing = false;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    messageInput.focus();
});

// Handle form submission
chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const message = messageInput.value.trim();
    if (!message || isProcessing) return;

    // Add user message to chat
    addUserMessage(message);

    // Clear input
    messageInput.value = '';

    // Disable input during processing
    setProcessingState(true);

    // Send message to backend
    await sendMessage(message);

    // Re-enable input
    setProcessingState(false);
    messageInput.focus();
});

// Add user message to chat
function addUserMessage(text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user-message';

    messageDiv.innerHTML = `
        <div class="message-avatar user-avatar">
            <i class="fas fa-user"></i>
        </div>
        <div class="message-content">
            <div class="message-bubble">
                <p>${escapeHtml(text)}</p>
            </div>
            <div class="message-timestamp">${formatTimestamp(new Date())}</div>
        </div>
    `;

    messagesContainer.appendChild(messageDiv);
    scrollToBottom();
}

// Add bot message to chat
function addBotMessage(text, isComplete = false) {
    // Check if we need to create a new message or update existing
    let messageDiv = messagesContainer.querySelector('.bot-message.streaming');

    if (!messageDiv) {
        messageDiv = document.createElement('div');
        messageDiv.className = 'message bot-message streaming';

        messageDiv.innerHTML = `
            <div class="message-avatar bot-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <div class="message-bubble">
                    <p></p>
                </div>
                <div class="message-timestamp">${formatTimestamp(new Date())}</div>
            </div>
        `;

        messagesContainer.appendChild(messageDiv);
    }

    // Update the message content
    const paragraph = messageDiv.querySelector('.message-bubble p');
    paragraph.textContent = text;

    // Remove streaming class if complete
    if (isComplete) {
        messageDiv.classList.remove('streaming');
    }

    scrollToBottom();
}

// Add tool notification
function addToolNotification(toolName, toolInput) {
    const notificationDiv = document.createElement('div');
    notificationDiv.className = 'tool-notification';
    notificationDiv.id = 'current-tool';

    let displayText = 'Searching the web';
    if (toolInput && typeof toolInput === 'object' && toolInput.query) {
        displayText = `Searching for: ${toolInput.query}`;
    } else if (typeof toolInput === 'string') {
        displayText = `Searching for: ${toolInput}`;
    }

    notificationDiv.innerHTML = `
        <i class="fas fa-search"></i>
        <span>${escapeHtml(displayText)}...</span>
    `;

    // Add to the last bot message content area
    const lastBotMessage = messagesContainer.querySelector('.bot-message.streaming');
    if (lastBotMessage) {
        const contentDiv = lastBotMessage.querySelector('.message-content');
        contentDiv.insertBefore(notificationDiv, contentDiv.firstChild);
    } else {
        messagesContainer.appendChild(notificationDiv);
    }

    scrollToBottom();
}

// Remove tool notification
function removeToolNotification() {
    const notification = document.getElementById('current-tool');
    if (notification) {
        notification.remove();
    }
}

// Show typing indicator
function showTypingIndicator() {
    typingIndicator.style.display = 'flex';
    scrollToBottom();
}

// Hide typing indicator
function hideTypingIndicator() {
    typingIndicator.style.display = 'none';
}

// Send message to backend with SSE
async function sendMessage(message) {
    try {
        showTypingIndicator();

        const response = await fetch('/chat/stream', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ input_text: message }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let currentResponse = '';

        while (true) {
            const { done, value } = await reader.read();

            if (done) break;

            // Decode the chunk and add to buffer
            buffer += decoder.decode(value, { stream: true });

            // Process complete events (separated by \n\n)
            const events = buffer.split('\n\n');
            buffer = events.pop() || ''; // Keep incomplete event in buffer

            for (const event of events) {
                if (!event.trim() || !event.startsWith('data: ')) continue;

                try {
                    const data = JSON.parse(event.substring(6)); // Remove 'data: ' prefix

                    switch (data.type) {
                        case 'start':
                            hideTypingIndicator();
                            currentResponse = '';
                            break;

                        case 'token':
                            currentResponse += data.content;
                            addBotMessage(currentResponse, false);
                            break;

                        case 'tool_start':
                            addToolNotification(data.tool, data.input);
                            break;

                        case 'tool_end':
                            removeToolNotification();
                            break;

                        case 'done':
                            if (currentResponse) {
                                addBotMessage(currentResponse, true);
                            } else if (data.full_response) {
                                addBotMessage(data.full_response, true);
                            }
                            break;

                        case 'error':
                            hideTypingIndicator();
                            addErrorMessage(data.message || 'An error occurred');
                            break;
                    }
                } catch (e) {
                    console.error('Error parsing event:', e, event);
                }
            }
        }

        hideTypingIndicator();

    } catch (error) {
        console.error('Error sending message:', error);
        hideTypingIndicator();
        addErrorMessage('Failed to send message. Please try again.');
    }
}

// Add error message
function addErrorMessage(text) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
        <i class="fas fa-exclamation-triangle"></i>
        <span>${escapeHtml(text)}</span>
    `;

    messagesContainer.appendChild(errorDiv);
    scrollToBottom();
}

// Set processing state
function setProcessingState(processing) {
    isProcessing = processing;
    sendButton.disabled = processing;
    messageInput.disabled = processing;
}

// Scroll to bottom of messages
function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Format timestamp
function formatTimestamp(date) {
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) {
        return 'Just now';
    } else if (diff < 3600000) {
        const minutes = Math.floor(diff / 60000);
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Auto-resize input on type (optional enhancement)
messageInput.addEventListener('input', () => {
    // Could add auto-expanding textarea here if desired
});

// Handle Enter key (submit on Enter, new line on Shift+Enter)
messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        chatForm.dispatchEvent(new Event('submit'));
    }
});
