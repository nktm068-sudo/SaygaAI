// --- КОНФИГУРАЦИЯ СИСТЕМЫ BLUECLOUD ---
const SUPABASE_URL = 'https://qnoqzdnlmwalfpmgdxfd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFub3F6ZG5sbXdhaWZwbWdkeGZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxMDYxODQsImV4cCI6MjA5MzY4MjE4NH0.G6usqxUJGOeWASkqnMVC-_GjFPD_n81m-68zFR0kVeM';

// Инициализация клиента Supabase
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ПРОВЕРКА ПОЛЬЗОВАТЕЛЯ ПРИ ЗАГРУЗКЕ
async function checkUser() {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (user) {
        document.getElementById('auth-ui').style.display = 'none';
        document.getElementById('cloud-ui').style.display = 'block';
        document.getElementById('user-display').innerText = "АККАУНТ: " + user.email.toUpperCase();
    }
}

// ВХОД / РЕГИСТРАЦИЯ ПО EMAIL
async function handleLogin() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('pass').value;
    if (!email || !password) return alert("ЗАПОЛНИ ДАННЫЕ!");

    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    
    if (error) {
        const { error: regError } = await supabaseClient.auth.signUp({ email, password });
        if (regError) alert("ОШИБКА: " + regError.message);
        else alert("АККАУНТ СОЗДАН! ПРОВЕРЬ ПОЧТУ.");
    } else {
        location.reload();
    }
}

// БЫСТРЫЙ ВХОД ЧЕРЕЗ GITHUB
async function loginWithGitHub() {
    await supabaseClient.auth.signInWithOAuth({
        provider: 'github',
        options: { redirectTo: window.location.href }
    });
}

// ЗАГРУЗКА ФАЙЛА В ТВОЁ ОБЛАКО
async function uploadFile() {
    const fileInput = document.getElementById('cloud-file');
    const status = document.getElementById('status');
    const file = fileInput.files[0];

    if (!file) return alert("ВЫБЕРИ ФАЙЛ!");

    const { data: { user } } = await supabaseClient.auth.getUser();
    const filePath = `${user.id}/${Date.now()}_${file.name}`;

    status.innerText = "🌀 ОТПРАВКА В ГЕРМАНИЮ...";
    status.style.color = "#00d2ff";

    const { data, error } = await supabaseClient.storage
        .from('files')
        .upload(filePath, file);

    if (error) {
        status.innerText = "❌ ОШИБКА: " + error.message;
        status.style.color = "red";
    } else {
        const { data: { publicUrl } } = supabaseClient.storage.from('files').getPublicUrl(filePath);
        status.innerHTML = `✅ УСПЕШНО!<br><a href="${publicUrl}" target="_blank" style="color:#fff; font-weight:bold;">ОТКРЫТЬ ФАЙЛ</a>`;
        status.style.color = "#2ecc71";
    }
}

// ВЫХОД ИЗ СИСТЕМЫ
async function logout() {
    await supabaseClient.auth.signOut();
    location.reload();
}

// Запуск проверки при старте страницы
window.onload = checkUser;
