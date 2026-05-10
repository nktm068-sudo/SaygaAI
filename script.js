// Адрес твоего сервера в Space (проверь, чтобы в конце было /chat)
const ADDRESS = "https://emeraldcreator-saigallama3.hf.space/chat";

async function sendMessage() {
    const input = document.getElementById('userInput');
    const text = input.value.trim();
    if (!text) return;

    // Сообщение пользователя
    addMessage(text, 'user');
    input.value = '';

    // Сообщение ожидания от Сайги
    const loadingId = addMessage("Сайга печатает...", 'bot');
    scrollToBottom();

    // Шаблон для модели (Llama 3)
    const msg_data = `<|begin_of_text|><|start_header_id|>user<|end_header_id|>\n\n${text}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n`;

    try {
        const response = await fetch(ADDRESS, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                inputs: msg_data, 
                parameters: { 
                    max_new_tokens: 500, 
                    temperature: 0.7,
                    return_full_text: false 
                } 
            })
        });

        const info = await response.json();

        if (response.status !== 200) {
            updateMessage(loadingId, "Ошибка: " + (info.error || "проверь сервер"));
        } else {
            let answer = Array.isArray(info) ? info[0].generated_text : info.generated_text;
            updateMessage(loadingId, answer.trim());
        }
    } catch (e) {
        console.error(e);
        updateMessage(loadingId, "Ошибка: сервер Сайга AI не отвечает.");
    }
    scrollToBottom();
}

// Улучшенная функция добавления сообщений с аватаркой
function addMessage(text, side) {
    const id = Date.now();
    const div = document.createElement('div');
    div.className = `msg ${side}`;
    div.id = id;
    
    // Стили для красивого отображения в ряд
    div.style.display = 'flex';
    div.style.alignItems = 'flex-start';
    div.style.marginBottom = '10px';

    // Если пишет бот — добавляем логотип
    if (side === 'bot') {
        const img = document.createElement('img');
        img.src = 'logo.png'; // Файл должен лежать в GitHub рядом с этим скриптом
        img.style.width = '30px';
        img.style.height = '30px';
        img.style.marginRight = '10px';
        img.style.borderRadius = '50%';
        div.appendChild(img);
    }

    const span = document.createElement('span');
    span.innerText = text;
    // Немного красоты для текста
    span.style.background = side === 'user' ? '#007bff' : '#444';
    span.style.padding = '8px 12px';
    span.style.borderRadius = '10px';
    span.style.color = 'white';
    
    div.appendChild(span);

    document.getElementById('messages').appendChild(div);
    return id;
}

function updateMessage(id, newText) {
    const el = document.getElementById(id);
    if (el) {
        // Ищем span внутри сообщения, чтобы обновить только текст, не удаляя аватарку
        const span = el.querySelector('span');
        if (span) span.innerText = newText;
    }
}

function scrollToBottom() {
    const msgContainer = document.getElementById('messages');
    msgContainer.scrollTop = msgContainer.scrollHeight;
}

// Отправка по Enter
document.getElementById('userInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});
