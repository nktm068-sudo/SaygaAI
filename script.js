// Твой адрес сервера на Hugging Face (уже без ключей!)
const ADDRESS = "https://emeraldcreator-saigallama3.hf.space/chat";

async function sendMessage() {
    const input = document.getElementById('userInput');
    const text = input.value.trim();
    if (!text) return;

    // Добавляем сообщение пользователя на экран
    addMessage(text, 'user');
    input.value = '';

    // Создаем временное сообщение для ожидания
    const loadingId = addMessage("Сайга печатает...", 'bot');
    scrollToBottom();

    // Шаблон для модели Лама 3
    const msg_data = `<|begin_of_text|><|start_header_id|>user<|end_header_id|>\n\n${text}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n`;

    try {
        const response = await fetch(ADDRESS, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json" 
            },
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
            // Достаем текст из ответа (он может быть в массиве)
            let answer = "";
            if (Array.isArray(info)) {
                answer = info[0].generated_text;
            } else {
                answer = info.generated_text;
            }
            updateMessage(loadingId, answer.trim());
        }
    } catch (e) {
        console.error(e);
        updateMessage(loadingId, "Ошибка: сервер не отвечает.");
    }
    scrollToBottom();
}

// Функции для работы интерфейса (не меняй их)
function addMessage(text, side) {
    const id = Date.now();
    const div = document.createElement('div');
    div.className = `msg ${side}`;
    div.id = id;
    div.innerText = text;
    document.getElementById('messages').appendChild(div);
    return id;
}

function updateMessage(id, newText) {
    const el = document.getElementById(id);
    if (el) el.innerText = newText;
}

function scrollToBottom() {
    const msgContainer = document.getElementById('messages');
    msgContainer.scrollTop = msgContainer.scrollHeight;
}

// Отправка по нажатию Enter
document.getElementById('userInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});
