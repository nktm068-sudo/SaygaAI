// Адрес БЕЗ лишних знаков на конце
const ADDRESS = "https://emeraldcreator-saigallama3.hf.space/chat";

async function sendMessage() {
    const input = document.getElementById('userInput');
    const text = input.value.trim();
    if (!text) return;

    addMessage(text, 'user');
    input.value = '';

    const loadingId = addMessage("Сайга печатает...", 'bot');
    scrollToBottom();

    // Специальный шаблон для Ламы 3
    const msg_data = `<|begin_of_text|><|start_header_id|>user<|end_header_id|>\n\n${text}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n`;

    try {
        const response = await fetch(ADDRESS, {
            method: "POST",
            mode: 'cors', // Явно разрешаем CORS
            headers: { 
                "Authorization": `Bearer ${CURRENT_LDFLDF}`, 
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

        if (response.status === 503) {
            updateMessage(loadingId, "Сайга просыпается... Подожди 30 секунд и напиши ещё раз.");
        } else if (response.status !== 200) {
            updateMessage(loadingId, "Ошибка: " + (info.error || "проверь соединение"));
        } else {
            // Проверка: ответ может быть массивом или объектом
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
        updateMessage(loadingId, "Произошла ошибка в коде или сети.");
    }
    scrollToBottom();
}

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
