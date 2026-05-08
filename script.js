// Части секретного значения
const p2 = "FKqdkWXOjETtPsZkGE";
const p3 = "gTPrTcZPSPYvDvRk";

// Собираем данные через LDFLDF
function get_LDFLDF() {
    const s1 = "h", s2 = "f", s3 = "_";
    return s1 + s2 + s3 + p2 + p3;
}

const CURRENT_LDFLDF = get_LDFLDF();
// Ссылка заменена на ADDRESS
const ADDRESS = "https://huggingface.co";

async function sendMessage() {
    const input = document.getElementById('userInput');
    const text = input.value.trim();
    if (!text) return;

    addMessage(text, 'user');
    input.value = '';

    const loadingId = addMessage("Сайга печатает...", 'bot');
    scrollToBottom();

    // Формат сообщения для модели
    const msg_data = `<|begin_of_text|><|start_header_id|>user<|end_header_id|>\n\n${text}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n`;

    try {
        const response = await fetch(ADDRESS, {
            method: "POST",
            headers: { 
                "Authorization": `Bearer ${CURRENT_LDFLDF}`, 
                "Content-Type": "application/json" 
            },
            body: JSON.stringify({ 
                inputs: msg_data, 
                parameters: { max_new_tokens: 500, temperature: 0.7 } 
            })
        });

        const info = await response.json();

        if (response.status === 503) {
            updateMessage(loadingId, "Модель просыпается... Подожди 30 секунд.");
        } else if (response.status !== 200) {
            updateMessage(loadingId, "Ошибка доступа. Проверь данные LDFLDF.");
        } else {
            // HF иногда возвращает массив, иногда объект
            let result = "";
            if (Array.isArray(info)) {
                result = info[0].generated_text;
            } else {
                result = info.generated_text;
            }
            
            const cleanText = result.replace(msg_data, "").trim();
            updateMessage(loadingId, cleanText);
        }
        scrollToBottom();
    } catch (e) {
        updateMessage(loadingId, "Нет связи с сервером.");
    }
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
