let voiceAssistantActive = false;
let welcomeMessageSpoken = false;

function initializeVoiceAssistant() {
    const toggle = document.getElementById('voice-assistant-toggle');
    const closeBtn = document.getElementById('voice-assistant-close');
    const panel = document.getElementById('voice-assistant-panel');
    const statusText = document.getElementById('voice-status');
    const chatContainer = document.getElementById('voice-assistant-chat');
    const textInput = document.getElementById('voice-text-input');
    const sendTextBtn = document.getElementById('voice-send-text-btn');

    const welcomeMessage = "Hi there! How can I help you today?";

    toggle?.addEventListener('click', () => {
        voiceAssistantActive = !voiceAssistantActive;
        panel.classList.toggle('hidden');
        
        if (voiceAssistantActive && !welcomeMessageSpoken) {
            speakResponse(welcomeMessage);
            welcomeMessageSpoken = true;
        } else if (!voiceAssistantActive) {
            speechSynthesis.cancel();
        }
    });

    closeBtn?.addEventListener('click', () => {
        voiceAssistantActive = false;
        panel.classList.add('hidden');
        speechSynthesis.cancel();
    });

    document.addEventListener('click', (event) => {
        const widget = document.getElementById('voice-assistant-widget');
        if (voiceAssistantActive && widget && !widget.contains(event.target)) {
            voiceAssistantActive = false;
            panel?.classList.add('hidden');
            speechSynthesis.cancel();
        }
    });

    sendTextBtn?.addEventListener('click', () => {
        handleTextSubmit();
    });

    textInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleTextSubmit();
        }
    });

    function addVoiceMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender === 'user' ? 'user-message' : 'ai-message'}`;
        
        const time = new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        messageDiv.innerHTML = `
            <p>${escapeHtml(text)}</p>
            <small>${time}</small>
        `;
        
        chatContainer.appendChild(messageDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    function speakResponse(text) {
        if (!voiceAssistantActive) {
            return;
        }
        
        if ('speechSynthesis' in window) {
            speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1;
            utterance.pitch = 1;
            utterance.volume = 1;
            
            utterance.onend = () => {
                if (voiceAssistantActive) {
                    statusText.textContent = 'Ready';
                    sendTextBtn.disabled = false;
                    textInput.disabled = false;
                }
            };
            
            utterance.onerror = () => {
                if (voiceAssistantActive) {
                    statusText.textContent = 'Ready';
                    sendTextBtn.disabled = false;
                    textInput.disabled = false;
                }
            };
            
            speechSynthesis.speak(utterance);
        } else {
            if (voiceAssistantActive) {
                statusText.textContent = 'Ready';
                sendTextBtn.disabled = false;
                textInput.disabled = false;
            }
        }
    }

    function escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    async function handleTextSubmit() {
        const message = textInput.value.trim();
        if (!message) return;

        addVoiceMessage(message, 'user');
        textInput.value = '';

        statusText.textContent = 'Thinking...';
        statusText.classList.add('thinking');
        sendTextBtn.disabled = true;
        textInput.disabled = true;

        await sendPromptToAI(message);
    }

    async function sendPromptToAI(prompt) {
        try {
            console.log('Sending prompt to AI:', prompt);
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('hm_token')}`
                },
                body: JSON.stringify({ prompt: prompt })
            });

            console.log('AI response status:', response.status);
            const data = await response.json();
            console.log('AI response data:', data);

            if (response.ok && data.reply) {
                const aiResponse = data.reply;
                console.log('AI message:', aiResponse);
                
                addVoiceMessage(aiResponse, 'ai');
                statusText.textContent = 'Speaking...';
                speakResponse(aiResponse);
            } else {
                const errorMsg = data.message || "Sorry, I couldn't process that.";
                console.error('AI response error:', errorMsg);
                addVoiceMessage(errorMsg, 'ai');
                statusText.textContent = 'Speaking...';
                speakResponse(errorMsg);
            }
        } catch (error) {
            console.error('AI fetch error:', error);
            addVoiceMessage("An error occurred. Please try again.", 'ai');
            statusText.textContent = 'Speaking...';
            speakResponse("An error occurred. Please try again.");
        } finally {
            statusText.classList.remove('thinking');
        }
    }
}

document.addEventListener('DOMContentLoaded', initializeVoiceAssistant);
