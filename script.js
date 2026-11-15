
const screens = document.querySelectorAll(".screen");

function showScreen(screenId) {
    screens.forEach(screen => {
        screen.classList.remove("active");
    });

    document.getElementById(screenId).classList.add("active");
}


// Новая игра
document.getElementById("new-game").addEventListener("click", () => {
    showScreen("game-screen");
});


// Продолжить
document.getElementById("continue-game").addEventListener("click", () => {
    alert("Сохранений пока нет!");
});


// Настройки
document.getElementById("settings").addEventListener("click", () => {
    showScreen("settings-screen");
});


// Об игре
document.getElementById("about").addEventListener("click", () => {
    showScreen("about-screen");
});


// Возвращение в меню
document.getElementById("back-to-menu").addEventListener("click", () => {
    showScreen("main-menu");
});


// Кнопки Назад
document.querySelectorAll(".back-button").forEach(button => {
    button.addEventListener("click", () => {
        showScreen("main-menu");
    });
});
