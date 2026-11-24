
const screens = document.querySelectorAll(".screen");

// Музыка главного меню
const menuMusic = document.getElementById("menu-music");

menuMusic.volume = 0.18;

// Запуск музыки
function playMenuMusic() {
    menuMusic.play().catch(error => {
        console.log("Музыка ждёт взаимодействия с пользователем.");
    });

    // Запуск музыки после первого взаимодействия с игрой
document.addEventListener("pointerdown", () => {
    if (document.getElementById("main-menu").classList.contains("active")) {
        playMenuMusic();
    }
}, { once: true });
}

function showScreen(screenId) {
    screens.forEach(screen => {
        screen.classList.remove("active");
    });

    document.getElementById(screenId).classList.add("active");
    if (screenId === "main-menu") {
        playMenuMusic();
    } else {
        menuMusic.pause();
    }
}

// Открытие меню паузы
document.getElementById("pause-button").addEventListener("click", () => {
    document.getElementById("pause-screen").classList.add("active");
});

// Продолжение игры
document.getElementById("resume-game").addEventListener("click", () => {
    document.getElementById("pause-screen").classList.remove("active");
});

// Сохранить игру
document.getElementById("save-game").addEventListener("click", saveGame);

// Загрузка последнего сохранения после поражения
document.getElementById("load-save").addEventListener("click", loadGame);

// Настройки — временная заглушка
document.getElementById("game-settings").addEventListener("click", () => {
    alert("Настройки пока находятся в разработке.");
});

// Выход в главное меню
document.getElementById("pause-to-menu").addEventListener("click", async () => {

    document.getElementById("pause-screen").classList.remove("active");

    // Выходим из полноэкранного режима
    if (document.fullscreenElement) {
        await document.exitFullscreen();
    }

    // Открываем главное меню
    showScreen("main-menu");

});


// Перезапуск после смерти
document.getElementById("restart-game").addEventListener("click", () => {

    resetGame();

    document.getElementById("death-screen").classList.remove("active");

});

// Загрузка последнего сохранения после смерти
document.getElementById("load-save").addEventListener("click", loadGame);

// Возвращение в меню после смерти
document.getElementById("death-to-menu").addEventListener("click", () => {

    document.getElementById("death-screen").classList.remove("active");

    resetGame();

    showScreen("main-menu");

});


// Продолжить игру
document.getElementById("continue-game").addEventListener("click", loadGame);


// Настройки
document.getElementById("settings").addEventListener("click", () => {
    showScreen("settings-screen");
});


// Об игре
document.getElementById("about").addEventListener("click", () => {
    showScreen("about-screen");
});


// Кнопки Назад
document.querySelectorAll(".back-button").forEach(button => {
    button.addEventListener("click", () => {
        showScreen("main-menu");
    });
});

// ==================================
// ИГРОВОЕ ПОЛЕ HERMIT
// ==================================

// Находим игровой холст в HTML
const canvas = document.getElementById("game-canvas");

// Получаем инструмент для рисования
const ctx = canvas.getContext("2d");

// Создаём игрового персонажа
const hermit = {
    x: 120,
    y: 370,

    width: 45,
    height: 80,

    speed: 5,

    velocityY: 0,
    gravity: 0.6,
    jumpPower: -13,

    onGround: true,

    facing: "right",
    isAttacking: false,
    attackTimer: 0,
    hasHit: false,

    health: 100,
    maxHealth: 100,

    mana: 50,
    maxMana: 50,

    manaRegenTimer: 0,
    manaRegenDelay: 0,
    healthPotions: 3,
    maxHealthPotions: 3
};

// Состояние инвентаря
let inventoryOpen = false;


// Количество Скверн
const totalScourges = 15;
let scourgesDefeated = 0;
let secondWaveSpawned = false;

// Случайные позиции для второй волны Скверн
const secondWavePositions = [];

while (secondWavePositions.length < totalScourges - 1) {
    const candidate = 600 + Math.random() * 2500;

    const isFarEnough = secondWavePositions.every(
        x => Math.abs(x - candidate) >= 140
    );

    if (isFarEnough) {
        secondWavePositions.push(candidate);
    }
}

// Расставляем Скверн по карте
secondWavePositions.sort((a, b) => a - b);


// Все Скверны на игровой карте
const enemies = Array.from({ length: totalScourges }, (_, index) => ({

    // Расположение противников
    x: index === 0 ? 450 : secondWavePositions[index - 1],
    y: 360,

    width: 50,
    height: 60,

    // Здоровье
    health: 3,
    maxHealth: 3,

    // Пока активна только первая Скверна
    alive: index === 0,

    hitFlash: 0,
    attackCooldown: 0,

    // Поведение
    alert: false,
    speed: 1.5,
    velocityY: 0,
    jumpPower: -11,
    onGround: true,
    facing: -1,

    // Анимация языка
    tongueLength: 0,
    tongueTimer: 0,
    tongueHit: false

}));

// Временно оставляем ссылку на первого врага
const enemy = enemies[0];


// Огненный шар
const fireball = {
    x: 0,
    y: 0,

    radius: 10,
    speed: 8,

    direction: 1,
    active: false
};

// ==================================
// КЛЮЧ ОТ ДОМИКА
// ==================================

const houseKey = {
    x: 0,
    y: 0,
    width: 24,
    height: 24,
    active: false,
    collected: false
};

// Состояние двери домика
let houseUnlocked = false;

// ==================================
// ВЫПАДЕНИЕ КЛЮЧА
// ==================================

function dropHouseKey(enemy) {

    if (scourgesDefeated === totalScourges) {

        houseKey.x = enemy.x + enemy.width / 2;
        houseKey.y = enemy.y + enemy.height - houseKey.height;

        houseKey.active = true;
        houseKey.collected = false;
    }
}

// ==================================
// КАМЕРА И ИГРОВОЙ МИР
// ==================================

const world = {
    width: 3600,
    height: 540
};

// ==================================
// ПРЕПЯТСТВИЯ
// ==================================

const obstacles = [
    {
        x: 950,
        y: 390,
        width: 90,
        height: 30,
        type: "log"
    },
    {
        x: 1450,
        y: 380,
        width: 65,
        height: 40,
        type: "stone"
    },
    {
        x: 2050,
        y: 390,
        width: 110,
        height: 30,
        type: "log"
    }
];

const camera = {
    x: 0
};


// Сброс игры
function resetGame() {

    // Возвращаем Хермита на стартовую позицию
    hermit.x = 120;
    hermit.y = 370;

    hermit.velocityY = 0;
    hermit.onGround = true;

    // Сбрасываем направление и атаку
    hermit.facing = "right";
    hermit.isAttacking = false;
    hermit.attackTimer = 0;
    hermit.hasHit = false;

    // Восстанавливаем здоровье, ману и эликсиры
    hermit.health = hermit.maxHealth;
    hermit.mana = hermit.maxMana;
    hermit.healthPotions = hermit.maxHealthPotions;

    updatePotionCount();

    // Сбрасываем счётчик побеждённых Скверн
    scourgesDefeated = 0;
    secondWaveSpawned = false;

    // Восстанавливаем всех Скверн
    enemies.forEach((enemy, index) => {
        enemy.health = enemy.maxHealth;
        enemy.alive = index === 0;
        enemy.hitFlash = 0;
        enemy.attackCooldown = 0;
        enemy.alert = false;
        enemy.velocityY = 0;
        enemy.onGround = true;
        enemy.facing = -1;
        enemy.tongueLength = 0;
        enemy.tongueTimer = 0;
        enemy.tongueHit = false;
    });

    // Сбрасываем огненный шар
    fireball.active = false;
}

    // Сбрасываем ключ и замок
    houseKey.x = 0;
    houseKey.y = 0;
    houseKey.active = false;
    houseKey.collected = false;

    houseUnlocked = false;


// ==================================
// СИСТЕМА СОХРАНЕНИЙ HERMIT
// ==================================

const SAVE_KEY = "hermit_save";


// Сохранение игры
function saveGame() {

    const saveData = {
        version: 3,

        hermit: {
            x: hermit.x,
            y: hermit.y,
            velocityY: hermit.velocityY,
            onGround: hermit.onGround,
            facing: hermit.facing,
            health: hermit.health,
            mana: hermit.mana,
            healthPotions: hermit.healthPotions
        },

        enemies: enemies.map(enemy => ({
            x: enemy.x,
            y: enemy.y,
            velocityY: enemy.velocityY,
            onGround: enemy.onGround,
            facing: enemy.facing,
            health: enemy.health,
            alive: enemy.alive,
            alert: enemy.alert,
            attackCooldown: enemy.attackCooldown,
            tongueLength: enemy.tongueLength,
            tongueTimer: enemy.tongueTimer,
            tongueHit: enemy.tongueHit
        })),

        scourgesDefeated: scourgesDefeated,
        secondWaveSpawned: secondWaveSpawned,

        houseKey: {
            x: houseKey.x,
            y: houseKey.y,
            active: houseKey.active,
            collected: houseKey.collected
        },

        houseUnlocked: houseUnlocked
        };

    try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
        updateContinueButton();

        alert("Игра сохранена!");
        return true;

    } catch (error) {
        console.error("Ошибка сохранения:", error);
        alert("Не удалось сохранить игру.");
        return false;
    }
}



// Загрузка игры
function loadGame() {

    const savedData = localStorage.getItem(SAVE_KEY);

    if (!savedData) {
        alert("Сохранений пока нет!");
        return false;
    }

    try {
        const data = JSON.parse(savedData);

        if (!data.hermit || ![1, 2, 3].includes(data.version)) {
            throw new Error("Некорректное сохранение");
        }

        Object.assign(hermit, data.hermit);

        // Восстанавливаем всех Скверн
        if ((data.version === 2 || data.version === 3) && Array.isArray(data.enemies)) {

            if (data.enemies.length !== enemies.length) {
                throw new Error("Количество Скверн не совпадает");
            }

            enemies.forEach((enemy, index) => {
                Object.assign(enemy, data.enemies[index]);
            });

            scourgesDefeated = data.scourgesDefeated;
            secondWaveSpawned = data.secondWaveSpawned;

            // Восстанавливаем ключ и состояние двери
            if (data.version === 3 && data.houseKey) {

                houseKey.x = data.houseKey.x;
                houseKey.y = data.houseKey.y;
                houseKey.active = data.houseKey.active;
                houseKey.collected = data.houseKey.collected;

                houseUnlocked = data.houseUnlocked || false;

            } else {

                // Старые сохранения не содержат ключ
                houseKey.x = 0;
                houseKey.y = 0;
                houseKey.active = false;
                houseKey.collected = false;

                houseUnlocked = false;
            }

        } else {
            // Поддержка старого сохранения версии 1

            enemies.forEach((enemy, index) => {
                enemy.alive = false;
                enemy.health = enemy.maxHealth;
                enemy.alert = false;
                enemy.attackCooldown = 0;
                enemy.tongueLength = 0;
                enemy.tongueTimer = 0;
                enemy.tongueHit = false;
            });

            Object.assign(enemies[0], data.enemy);

            scourgesDefeated = enemies[0].alive ? 0 : 1;
            secondWaveSpawned = false;
        }

        // Сбрасываем временные действия
        hermit.isAttacking = false;
        hermit.attackTimer = 0;
        hermit.hasHit = false;

        enemies.forEach(enemy => {
            enemy.hitFlash = 0;
            enemy.tongueTimer = 0;
            enemy.tongueHit = false;
        });

        fireball.active = false;

        updatePotionCount();

        document.getElementById("death-screen").classList.remove("active");
        document.getElementById("pause-screen").classList.remove("active");

        showScreen("game-screen");

        return true;

    } catch (error) {
        console.error("Ошибка загрузки:", error);
        alert("Не удалось загрузить сохранение.");
        return false;
    }
}


// Проверка наличия сохранения
function hasSavedGame() {
    return localStorage.getItem(SAVE_KEY) !== null;
}

// Обновление кнопки «Продолжить»
function updateContinueButton() {
    const button = document.getElementById("continue-game");

    if (button) {
        button.disabled = !hasSavedGame();
    }
}

// Проверяем сохранение при запуске
updateContinueButton();

// Показываем экран поражения
function showDeathScreen() {

    const deathScreen = document.getElementById("death-screen");

    deathScreen.classList.add("active");

}

// Рисуем игровую сцену
function drawScene() {

    // Положение камеры относительно Хермита
    camera.x = hermit.x - canvas.width / 2;

    // Не позволяем камере уйти за границы мира
    camera.x = Math.max(
        0,
        Math.min(camera.x, world.width - canvas.width)
    );

    // Очищаем холст и рисуем неподвижный фон
    ctx.fillStyle = "#18232b";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // ==================================
    // НЕБО, СОЛНЦЕ И ОБЛАКА
    // ==================================

    // Небо
    const sky = ctx.createLinearGradient(0, 0, 0, 420);
    sky.addColorStop(0, "#668b9b");
    sky.addColorStop(1, "#c1bda0");

    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, canvas.width, 420);

    // Солнце
    ctx.fillStyle = "#f5d995";
    ctx.beginPath();
    ctx.arc(950, 85, 38, 0, Math.PI * 2);
    ctx.fill();

    // Функция рисования облака
    function drawCloud(x, y, scale) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);

        ctx.fillStyle = "rgba(235, 239, 225, 0.85)";

        ctx.beginPath();
        ctx.arc(0, 15, 20, 0, Math.PI * 2);
        ctx.arc(22, 0, 25, 0, Math.PI * 2);
        ctx.arc(48, 14, 19, 0, Math.PI * 2);
        ctx.fillRect(0, 14, 48, 20);

        ctx.fill();
        ctx.restore();
    }

    // Облака
    drawCloud(130, 95, 1);
    drawCloud(440, 145, 0.8);
    drawCloud(760, 65, 1.2);

    // Начинаем отрисовку игрового мира с учётом камеры
    ctx.save();
    ctx.translate(-camera.x, 0);

    // ==================================
    // ДАЛЬНИЙ СЛОЙ ЛЕСА
    // ==================================

    ctx.fillStyle = "#24352f";

    for (let i = 0; i < world.width; i += 180) {

        const treeHeight = 100 + (i * 7 % 90);

        ctx.beginPath();

        ctx.moveTo(i, 420);
        ctx.lineTo(i + 60, 420 - treeHeight);
        ctx.lineTo(i + 120, 420);

        ctx.closePath();
        ctx.fill();
    }

    // Рисуем землю на всю длину мира
    ctx.fillStyle = "#465344";
    ctx.fillRect(0, 420, world.width, 120);

    // ==================================
    // ДОМИК В КОНЦЕ КАРТЫ
    // ==================================

    const houseX = 3350;

    // Стены домика
    ctx.fillStyle = "#a58b6b";
    ctx.fillRect(houseX, 300, 190, 120);

    // Обводка стен
    ctx.strokeStyle = "#493b32";
    ctx.lineWidth = 4;
    ctx.strokeRect(houseX, 300, 190, 120);

    // Крыша
    ctx.fillStyle = "#59413d";
    ctx.beginPath();
    ctx.moveTo(houseX - 15, 300);
    ctx.lineTo(houseX + 95, 245);
    ctx.lineTo(houseX + 205, 300);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "#302a28";
    ctx.stroke();

    // Дверь
    ctx.fillStyle = "#51372e";
    ctx.fillRect(houseX + 70, 330, 55, 90);

    ctx.strokeStyle = "#30231f";
    ctx.lineWidth = 3;
    ctx.strokeRect(houseX + 70, 330, 55, 90);

    // Ручка двери
    ctx.fillStyle = "#d5b45e";
    ctx.beginPath();
    ctx.arc(houseX + 113, 375, 4, 0, Math.PI * 2);
    ctx.fill();

    // Замок
    ctx.fillStyle = "#d6b45c";
    ctx.fillRect(houseX + 90, 365, 16, 20);

    ctx.strokeStyle = "#493b32";
    ctx.lineWidth = 2;
    ctx.strokeRect(houseX + 90, 365, 16, 20);

    // Скважина замка
    ctx.fillStyle = "#493b32";
    ctx.beginPath();
    ctx.arc(houseX + 98, 374, 3, 0, Math.PI * 2);
    ctx.fill();

    // Окно слева
    ctx.fillStyle = "#9fc1c2";
    ctx.fillRect(houseX + 20, 325, 35, 35);

    ctx.strokeStyle = "#493b32";
    ctx.lineWidth = 3;
    ctx.strokeRect(houseX + 20, 325, 35, 35);

    // Окно справа
    ctx.fillStyle = "#9fc1c2";
    ctx.fillRect(houseX + 140, 325, 35, 35);

    ctx.strokeRect(houseX + 140, 325, 35, 35);

    // ==================================
    // ПОДСКАЗКА У ДОМИКА
    // ==================================

    const distanceToHouse = Math.abs(
        (hermit.x + hermit.width / 2) - (houseX + 95)
    );

    if (distanceToHouse < 230) {

        // Фон подсказки
        ctx.fillStyle = "rgba(25, 28, 30, 0.9)";
        ctx.fillRect(houseX - 45, 185, 280, 45);

        // Обводка
        ctx.strokeStyle = "#d6b45c";
        ctx.lineWidth = 2;
        ctx.strokeRect(houseX - 45, 185, 280, 45);

        // Текст
        ctx.fillStyle = "#f5dfaa";
        ctx.font = "bold 17px Arial";
        ctx.textAlign = "center";

        let houseHint = "";

        if (scourgesDefeated < totalScourges) {
            houseHint = "Победи всех Скверн!";
        }
        else if (!houseKey.collected) {
            houseHint = "Найди ключ!";
        }
        else {
            houseHint = "Ключ найден! Дверь открыта!";
        }

        ctx.fillText(
            houseHint,
            houseX + 95,
            213
        );
    }

    // ==================================
    // РИСУЕМ ПРЕПЯТСТВИЯ
    // ==================================

    for (const obstacle of obstacles) {

        // Бревно
        if (obstacle.type === "log") {
            ctx.fillStyle = "#65432f";
            ctx.fillRect(
                obstacle.x,
                obstacle.y,
                obstacle.width,
                obstacle.height
            );

            ctx.fillStyle = "#98704a";
            ctx.fillRect(
                obstacle.x + 5,
                obstacle.y + 4,
                obstacle.width - 10,
                6
            );

            ctx.fillStyle = "#b18a5e";
            ctx.beginPath();
            ctx.ellipse(
                obstacle.x + obstacle.width,
                obstacle.y + obstacle.height / 2,
                8,
                obstacle.height / 2,
                0, 0, Math.PI * 2
            );
            ctx.fill();
        }

        // Камень
        if (obstacle.type === "stone") {
            ctx.fillStyle = "#62676b";

            ctx.beginPath();
            ctx.moveTo(obstacle.x, obstacle.y + obstacle.height);
            ctx.lineTo(obstacle.x + 10, obstacle.y + 10);
            ctx.lineTo(obstacle.x + 30, obstacle.y);
            ctx.lineTo(obstacle.x + obstacle.width - 8, obstacle.y + 8);
            ctx.lineTo(obstacle.x + obstacle.width, obstacle.y + obstacle.height);
            ctx.closePath();
            ctx.fill();

            // Светлая грань
            ctx.fillStyle = "#92999c";
            ctx.beginPath();
            ctx.moveTo(obstacle.x + 10, obstacle.y + 10);
            ctx.lineTo(obstacle.x + 30, obstacle.y);
            ctx.lineTo(obstacle.x + 42, obstacle.y + 12);
            ctx.lineTo(obstacle.x + 22, obstacle.y + 20);
            ctx.closePath();
            ctx.fill();
        }
    }


    // ==================================
    // ВРЕМЕННЫЙ СПРАЙТ ХЕРМИТА
    // ==================================

    // Тень
    ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
    ctx.fillRect(
        hermit.x + 3,
        hermit.y + 3,
        hermit.width,
        hermit.height
    );

    // Тело
    ctx.fillStyle = "#c6a36b";
    ctx.fillRect(
        hermit.x,
        hermit.y,
        hermit.width,
        hermit.height
    );

    // Тёмная обводка
    ctx.strokeStyle = "#24201d";
    ctx.lineWidth = 3;
    ctx.strokeRect(
        hermit.x,
        hermit.y,
        hermit.width,
        hermit.height
    );

    // Светлая полоска сверху — условное освещение
    ctx.fillStyle = "#e8d09c";
    ctx.fillRect(
        hermit.x + 4,
        hermit.y + 3,
        hermit.width - 8,
        4
    );

    // Рисуем удар мечом
    if (hermit.isAttacking) {

        ctx.save();

        // Разворачиваем систему координат в сторону взгляда
        const direction = hermit.facing === "right" ? 1 : -1;

        ctx.translate(
            hermit.facing === "right"
                ? hermit.x + hermit.width
                : hermit.x,
            hermit.y + 35
        );

        ctx.scale(direction, 1);
        ctx.rotate(-0.5);

        // Клинок
        ctx.fillStyle = "#d8dce0";
        ctx.fillRect(0, -4, 55, 8);

        // Острие
        ctx.beginPath();
        ctx.moveTo(55, -4);
        ctx.lineTo(65, 0);
        ctx.lineTo(55, 4);
        ctx.closePath();
        ctx.fill();

        // Гарда
        ctx.fillStyle = "#a8793e";
        ctx.fillRect(-4, -7, 5, 14);

        // Рукоять
        ctx.fillStyle = "#65432f";
        ctx.fillRect(-14, -3, 10, 6);

        ctx.restore();
    }

    // Рисуем огненный шар
    if (fireball.active) {

        ctx.fillStyle = "#e85b24";

        ctx.beginPath();

        ctx.arc(
            fireball.x,
            fireball.y,
            fireball.radius,
            0,
            Math.PI * 2
        );

        ctx.fill();

    }


    // Рисуем всех Скверн
    enemies.forEach(scourge => {

        if (scourge.alive) {

            // Тело Скверны
            ctx.fillStyle = scourge.hitFlash > 0
                ? "#d94b42"
                : "#315b45";

            ctx.fillRect(
                scourge.x,
                scourge.y,
                scourge.width,
                scourge.height
            );

            // ==================================
            // ВЫДВИЖНОЙ ЯЗЫК СКВЕРНЫ
            // ==================================

            if (scourge.tongueLength > 0) {

                const direction = hermit.x < scourge.x ? -1 : 1;

                const mouthX = direction === 1
                    ? scourge.x + scourge.width
                    : scourge.x;

                const mouthY = scourge.y + 38;

                const tongueEndX = mouthX + direction * scourge.tongueLength;

                ctx.strokeStyle = "#a83250";
                ctx.lineWidth = 7;
                ctx.lineCap = "round";

                ctx.beginPath();
                ctx.moveTo(mouthX, mouthY);
                ctx.lineTo(tongueEndX, mouthY);
                ctx.stroke();

                // Раздвоенный кончик
                ctx.lineWidth = 4;

                ctx.beginPath();

                ctx.moveTo(tongueEndX, mouthY);
                ctx.lineTo(tongueEndX + direction * 12, mouthY - 8);

                ctx.moveTo(tongueEndX, mouthY);
                ctx.lineTo(tongueEndX + direction * 12, mouthY + 8);

                ctx.stroke();
            }

            // ==================================
            // ГЛАЗА СКВЕРНЫ
            // ==================================

            ctx.fillStyle = "#d94b42";

            ctx.fillRect(scourge.x + 10, scourge.y + 15, 8, 8);
            ctx.fillRect(scourge.x + 32, scourge.y + 15, 8, 8);

            // Злые брови
            if (scourge.alert) {

                ctx.strokeStyle = "#171b18";
                ctx.lineWidth = 4;
                ctx.lineCap = "round";

                ctx.beginPath();

                ctx.moveTo(scourge.x + 8, scourge.y + 12);
                ctx.lineTo(scourge.x + 20, scourge.y + 20);

                ctx.moveTo(scourge.x + 42, scourge.y + 12);
                ctx.lineTo(scourge.x + 30, scourge.y + 20);

                ctx.stroke();
            }

            // ==================================
            // ПОЛОСКА ЗДОРОВЬЯ
            // ==================================

            ctx.fillStyle = "#382b2b";

            ctx.fillRect(
                scourge.x,
                scourge.y - 12,
                scourge.width,
                6
            );

            ctx.fillStyle = "#b94b43";

            ctx.fillRect(
                scourge.x,
                scourge.y - 12,
                scourge.width * (scourge.health / scourge.maxHealth),
                6
            );
        }
    });


    // ==================================
    // РИСУЕМ КЛЮЧ ОТ ДОМИКА
    // ==================================

    if (houseKey.active && !houseKey.collected) {

        ctx.save();

        // Золотой цвет
        ctx.strokeStyle = "#f5c542";
        ctx.fillStyle = "#f5c542";
        ctx.lineWidth = 5;
        ctx.lineCap = "round";

        // Круглая головка ключа
        ctx.beginPath();
        ctx.arc(
            houseKey.x + 6,
            houseKey.y + 7,
            6,
            0,
            Math.PI * 2
        );
        ctx.stroke();

        // Стержень ключа
        ctx.beginPath();
        ctx.moveTo(houseKey.x + 12, houseKey.y + 7);
        ctx.lineTo(houseKey.x + 25, houseKey.y + 7);
        ctx.stroke();

        // Зубцы ключа
        ctx.beginPath();
        ctx.moveTo(houseKey.x + 20, houseKey.y + 7);
        ctx.lineTo(houseKey.x + 20, houseKey.y + 12);

        ctx.moveTo(houseKey.x + 25, houseKey.y + 7);
        ctx.lineTo(houseKey.x + 25, houseKey.y + 11);
        ctx.stroke();

        ctx.restore();
    }


    // Возвращаем обычные экранные координаты для интерфейса
    ctx.restore();

    // Счётчик побеждённых Скверн
    ctx.fillStyle = "#f5dfaa";
    ctx.font = "bold 18px Arial";
    ctx.textAlign = "right";

    ctx.fillText(
        "Скверна: " + scourgesDefeated + " / " + totalScourges,
        canvas.width -30,
        150
    );

    // ==================================
    // ИНТЕРФЕЙС ХЕРМИТА (HUD)
    // ==================================

    // Фон панели
    ctx.fillStyle = "#20252b";
    ctx.fillRect(20, 20, 220, 145);

    // Настройки текста
    ctx.fillStyle = "#d9b77c";
    ctx.font = "12px Arial";
    ctx.textAlign = "left";

    // ЗДОРОВЬЕ (HP)
    ctx.fillText("HP — Здоровье", 30, 34);

    // Фон полоски здоровья
    ctx.fillStyle = "#382b2b";
    ctx.fillRect(30, 40, 190, 12);

    // Текущее здоровье
    ctx.fillStyle = "#b94b43";
    ctx.fillRect(
        30,
        40,
        190 * (hermit.health / hermit.maxHealth),
        12
    );

    // МАНА (MP)
    ctx.fillStyle = "#d9b77c";
    ctx.fillText("MP — Мана", 30, 66);

    // Фон полоски маны
    ctx.fillStyle = "#26384a";
    ctx.fillRect(30, 72, 190, 12);

    // Текущая мана
    ctx.fillStyle = "#478bc4";
    ctx.fillRect(
        30,
        72,
        190 * (hermit.mana / hermit.maxMana),
        12
    );

    // Зелья здоровья
    ctx.fillStyle = "#d9b77c";
    ctx.font = "16px Arial";

    ctx.fillText(
        "🧪 Зелья: " + hermit.healthPotions + " / " + hermit.maxHealthPotions,
        30,
        119
    );

}

// Запускаем рисование
drawScene();

// Состояние клавиш
const keys = {};

// Нажатие клавиши
document.addEventListener("keydown", function(event) {

    // Не принимаем управление после смерти
    if (hermit.health <= 0) {
        return;
    }

    // ==================================
    // ПОДБОР КЛЮЧА
    // ==================================

    if (houseKey.active && !houseKey.collected) {

        const touchingKey =
            hermit.x + hermit.width > houseKey.x &&
            hermit.x < houseKey.x + houseKey.width &&
            hermit.y + hermit.height > houseKey.y &&
            hermit.y < houseKey.y + houseKey.height;

        if (touchingKey) {
            houseKey.collected = true;
        }
    }

    // Не принимаем игровые клавиши при открытом инвентаре
    if (inventoryOpen) {
        return;
    }

    keys[event.code] = true;

    // ==================================
    // ОТКРЫТИЕ ДВЕРИ ДОМИКА
    // ==================================

    if (event.code === "KeyE" && !event.repeat) {

        const distanceToHouse = Math.abs(
            (hermit.x + hermit.width / 2) - (houseX + 95)
        );

        if (
            distanceToHouse < 120 &&
            houseKey.collected &&
            scourgesDefeated === totalScourges
        ) {
            houseUnlocked = true;
        }
    }

    // Прыжок
    if (
        (event.code === "Space" || event.code === "ArrowUp")
        && hermit.onGround
    ) {
        hermit.velocityY = hermit.jumpPower;
        hermit.onGround = false;
    }

    // Атака мечом
    if (event.code === "KeyJ" && !hermit.isAttacking) {

    hermit.isAttacking = true;
    hermit.attackTimer = 12;
    hermit.hasHit = false;

    }

    // Магическая атака — огненный шар
    if (
        event.code === "KeyF" &&
        !event.repeat &&
        !fireball.active &&
        hermit.mana >= 10
    ) {

        hermit.mana -= 10;
        // Задержка восстановления маны — 2 секунды
        hermit.manaRegenDelay = 120;

        fireball.active = true;

        fireball.y = hermit.y + 35;

        if (hermit.facing === "right") {

            fireball.x = hermit.x + hermit.width;
            fireball.direction = 1;

        } else {

            fireball.x = hermit.x;
            fireball.direction = -1;

        }
    }

    // ИСПОЛЬЗОВАНИЕ ЗЕЛЬЯ
        if (event.code === "KeyH" && !event.repeat) {
            if (hermit.health < hermit.maxHealth && hermit.healthPotions > 0) {
                hermit.health += 30;

                if (hermit.health > hermit.maxHealth) {
                hermit.health = hermit.maxHealth;
                }

                hermit.healthPotions--;

                updatePotionCount();
            }
        }

    // Запрещаем браузеру прокручивать страницу
    if (
        event.code === "Space" ||
        event.code.startsWith("Arrow")
    ) {
        event.preventDefault();
    }

});

// Отпускание клавиши
document.addEventListener("keyup", function(event) {

    keys[event.code] = false;

});


// Обновление игровой логики
function update() {

    // Не обновляем игровой мир, пока открыт инвентарь
    if (inventoryOpen) return;

    // ==================================
    // ДВИЖЕНИЕ ХЕРМИТА
    // ==================================

    let moveX = 0;

    // Движение вправо
    if (keys["ArrowRight"]) {
        moveX = hermit.speed;
        hermit.facing = "right";
    }

    // Движение влево
    if (keys["ArrowLeft"]) {
        moveX = -hermit.speed;
        hermit.facing = "left";
    }

    // Проверяем столкновение с препятствиями
    const nextX = hermit.x + moveX;

    const willHitObstacle = obstacles.some(obstacle => {

        const horizontalCollision =
            nextX + hermit.width > obstacle.x &&
            nextX < obstacle.x + obstacle.width;

        const verticalCollision =
            hermit.y + hermit.height > obstacle.y &&
            hermit.y < obstacle.y + obstacle.height;

        return horizontalCollision && verticalCollision;
    });

    // Перемещаемся, только если путь свободен
    if (!willHitObstacle) {
        hermit.x = nextX;
    }

    // Гравитация
    hermit.velocityY += hermit.gravity;

    // Вертикальное перемещение
    hermit.y += hermit.velocityY;

    // ==================================
    // ПРИЗЕМЛЕНИЕ НА ПРЕПЯТСТВИЯ
    // ==================================

    for (const obstacle of obstacles) {

        const horizontalOverlap =
            hermit.x + hermit.width > obstacle.x &&
            hermit.x < obstacle.x + obstacle.width;

        const fallingOntoObstacle =
            hermit.velocityY >= 0 &&
            hermit.y + hermit.height >= obstacle.y &&
            hermit.y + hermit.height - hermit.velocityY <= obstacle.y;

        if (horizontalOverlap && fallingOntoObstacle) {

            hermit.y = obstacle.y - hermit.height;
            hermit.velocityY = 0;
            hermit.onGround = true;
        }
    }

    // Проверка земли
    const groundY = 420 - hermit.height;

    if (hermit.y >= groundY) {
        hermit.y = groundY;
        hermit.velocityY = 0;
        hermit.onGround = true;
    }


    // ==================================
    // ФИЗИКА ВСЕХ СКВЕРН
    // ==================================

    enemies.forEach(enemy => {

        if (!enemy.alive) return;

        // Гравитация
        enemy.velocityY += hermit.gravity;
        enemy.y += enemy.velocityY;

        // Приземление на препятствия
        for (const obstacle of obstacles) {

            const horizontalOverlap =
                enemy.x + enemy.width > obstacle.x &&
                enemy.x < obstacle.x + obstacle.width;

            const fallingOntoObstacle =
                enemy.velocityY >= 0 &&
                enemy.y + enemy.height >= obstacle.y &&
                enemy.y + enemy.height - enemy.velocityY <= obstacle.y;

            if (horizontalOverlap && fallingOntoObstacle) {
                enemy.y = obstacle.y - enemy.height;
                enemy.velocityY = 0;
                enemy.onGround = true;
            }
        }

        // Приземление на землю
        const enemyGroundY = 420 - enemy.height;

        if (enemy.y >= enemyGroundY) {
            enemy.y = enemyGroundY;
            enemy.velocityY = 0;
            enemy.onGround = true;
        }

    });

    // ==================================
    // ДВИЖЕНИЕ ОГНЕННОГО ШАРА
    // ==================================

    if (fireball.active) {

        fireball.x += fireball.speed * fireball.direction;


        // Проверяем попадание во всех Скверн
        for (const enemy of enemies) {

            if (!enemy.alive) continue;

            if (
                fireball.x + fireball.radius >= enemy.x &&
                fireball.x - fireball.radius <= enemy.x + enemy.width &&
                fireball.y + fireball.radius >= enemy.y &&
                fireball.y - fireball.radius <= enemy.y + enemy.height
            ) {

                enemy.health--;
                enemy.hitFlash = 8;

                // Скверна замечает Хермита после попадания
                enemy.alert = true;

                fireball.active = false;

                if (enemy.health <= 0) {
                enemy.alive = false;
                scourgesDefeated++;
                dropHouseKey(enemy);
                }

                break;
            }
        }


        // Убираем шар за пределами игрового мира
        if (
         fireball.x < 0 ||
            fireball.x > world.width
        ) {
            fireball.active = false;
        }

            }



    // ==================================
    // ТАЙМЕР АТАКИ МЕЧОМ
    // ==================================

    if (hermit.isAttacking) {
        hermit.attackTimer--;

        if (hermit.attackTimer <= 0) {
            hermit.isAttacking = false;
            hermit.attackTimer = 0;
            hermit.hasHit = false;
        }
    }


    // ==================================
    // ПРОВЕРКА ПОПАДАНИЯ МЕЧОМ
    // ==================================

    if (hermit.isAttacking && !hermit.hasHit) {

        const swordRange = 85;

        for (const enemy of enemies) {

            if (!enemy.alive) continue;

            const distance = enemy.x - hermit.x;

            const inSwordRange =
                (hermit.facing === "right" &&
                    distance > 0 &&
                    distance < swordRange) ||
                (hermit.facing === "left" &&
                    distance < 0 &&
                    distance > -swordRange);

            if (inSwordRange) {

                enemy.health--;
                enemy.hitFlash = 8;

                // Скверна замечает Хермита
                enemy.alert = true;

                // Один удар за один взмах
                hermit.hasHit = true;

                if (enemy.health <= 0) {
                enemy.alive = false;
                scourgesDefeated++;
                dropHouseKey(enemy);
            }

                break;
            }
        }
    }


    // ==================================
    // ПОЯВЛЕНИЕ ВТОРОЙ ВОЛНЫ СКВЕРН
    // ==================================

    const distanceToHouse = Math.abs(
        (hermit.x + hermit.width / 2) - (3350 + 95)
    );

    if (
        scourgesDefeated >= 1 &&
        !secondWaveSpawned &&
        distanceToHouse < 230
    ) {
        secondWaveSpawned = true;

        for (let i = 1; i < enemies.length; i++) {
            enemies[i].alive = true;
        }
    }

    // ==================================
    // ОБНАРУЖЕНИЕ И АТАКА ВСЕХ СКВЕРН
    // ==================================

    enemies.forEach(enemy => {

        if (!enemy.alive) return;

        // Уменьшаем время красной вспышки
        if (enemy.hitFlash > 0) {
            enemy.hitFlash--;
        }

        const distance = enemy.x - hermit.x;
        const absDistance = Math.abs(distance);

        // Скверна замечает Хермита
        if (absDistance < 180) {
            enemy.alert = true;
        }

        // Преследование Хермита
        if (enemy.alert && enemy.tongueTimer === 0) {

            if (hermit.x < enemy.x) {
                enemy.facing = -1;
            } else {
                enemy.facing = 1;
            }

            const obstacleAhead = obstacles.some(obstacle => {

                const distanceToObstacle = enemy.facing === 1
                    ? obstacle.x - (enemy.x + enemy.width)
                    : enemy.x - (obstacle.x + obstacle.width);

                const verticalOverlap =
                    enemy.y + enemy.height > obstacle.y;

                return distanceToObstacle >= 0 &&
                       distanceToObstacle < 45 &&
                       verticalOverlap;
            });

            if (obstacleAhead && enemy.onGround) {
                enemy.velocityY = enemy.jumpPower;
                enemy.onGround = false;
            }

            if (absDistance > 65) {
                enemy.x += enemy.facing * enemy.speed;
            }
        }

        // Начинаем атаку языком
        if (
            enemy.alert &&
            absDistance < 90 &&
            enemy.attackCooldown <= 0 &&
            enemy.tongueTimer === 0
        ) {
            enemy.tongueTimer = 1;
            enemy.tongueHit = false;
            enemy.attackCooldown = 100;
        }

        // Анимация атаки языком
        if (enemy.tongueTimer > 0) {

            enemy.tongueTimer++;

            // Подготовка к атаке
            if (enemy.tongueTimer < 12) {
                enemy.tongueLength = 0;
            }

            // Язык выдвигается
            else if (enemy.tongueTimer < 20) {
                enemy.tongueLength = (enemy.tongueTimer - 12) * 12;
            }

            // Язык полностью выдвинут
            else if (enemy.tongueTimer < 27) {
                enemy.tongueLength = 96;
            }

            // Язык возвращается
            else if (enemy.tongueTimer < 35) {
                enemy.tongueLength = (35 - enemy.tongueTimer) * 12;
            }

            // Атака завершена
            else {
                enemy.tongueTimer = 0;
                enemy.tongueLength = 0;
                enemy.tongueHit = false;
            }

            // Наносим урон один раз за атаку
            if (enemy.tongueTimer === 20 && !enemy.tongueHit) {

                const tongueY = enemy.y + 38;

                const verticalOverlap =
                    hermit.y < tongueY + 8 &&
                    hermit.y + hermit.height > tongueY - 8;

                const tongueLeft = enemy.facing === -1
                    ? enemy.x - enemy.tongueLength
                    : enemy.x;

                const tongueRight = enemy.facing === 1
                    ? enemy.x + enemy.width + enemy.tongueLength
                    : enemy.x + enemy.width;

                const horizontalOverlap =
                    hermit.x + hermit.width > tongueLeft &&
                    hermit.x < tongueRight;

                if (verticalOverlap && horizontalOverlap) {
                    hermit.health -= 10;
                }

                enemy.tongueHit = true;
            }
        }

        // Таймер ожидания между атаками
        if (enemy.attackCooldown > 0) {
            enemy.attackCooldown--;
        }

    });

    // Проверяем смерть Хермита
    if (hermit.health <= 0) {

        hermit.health = 0;

        showDeathScreen();

    }
    // ==================================
    // ВОССТАНОВЛЕНИЕ МАНЫ
    // ==================================

    if (hermit.health > 0 && hermit.mana < hermit.maxMana) {

        // Сначала ждём окончания задержки
        if (hermit.manaRegenDelay > 0) {

            hermit.manaRegenDelay--;

        } else {

            // Считаем кадры до восстановления маны
            hermit.manaRegenTimer++;

            // Восстанавливаем 1 единицу маны
            if (hermit.manaRegenTimer >= 30) {

                hermit.mana++;

                hermit.manaRegenTimer = 0;

            }
        }
    }
}

// ==================================
// УПРАВЛЕНИЕ ИНВЕНТАРЁМ
// ==================================

const inventoryScreen = document.getElementById("inventory-screen");
const closeInventoryButton = document.getElementById("close-inventory");

// Находим счётчик зелий в инвентаре
const potionCountElement = document.getElementById("potion-count");

// Ячейка зелья
const potionSlot = document.getElementById("potion-slot");

// Выбор зелья
   potionSlot.addEventListener("click", () => {

    if (hermit.healthPotions > 0) {

        potionSlot.classList.toggle("selected");

        const usePotionButton = document.getElementById("use-potion");

        usePotionButton.classList.toggle(
            "visible",
            potionSlot.classList.contains("selected")
        );

    }

});

// Обновляем количество зелий
function updatePotionCount() {

    potionCountElement.textContent = hermit.healthPotions;

    // Если зелий больше нет — снимаем выделение
    if (hermit.healthPotions <= 0) {

        potionSlot.classList.remove("selected");

        const usePotionButton = document.getElementById("use-potion");

        usePotionButton.classList.remove("visible");

    }

}

// Использование зелья здоровья
function useHealthPotion() {

    if (hermit.health >= hermit.maxHealth) return;
    if (hermit.healthPotions <= 0) return;

    hermit.health = Math.min(
        hermit.health + 30,
        hermit.maxHealth
    );

    hermit.healthPotions--;

    updatePotionCount();
}

// Открытие инвентаря клавишей I
document.addEventListener("keydown", (event) => {

    if (event.code === "KeyI" && !event.repeat) {

        if (hermit.health <= 0) return;

        inventoryOpen = !inventoryOpen;

        // Сбрасываем состояние всех клавиш
        for (let key in keys) {
            keys[key] = false;
        }

        inventoryScreen.classList.toggle("active");

    }

});

// Использование зелья кнопкой в инвентаре
const usePotionButton = document.getElementById("use-potion");

usePotionButton.addEventListener("click", () => {

    if (!potionSlot.classList.contains("selected")) return;

    const previousCount = hermit.healthPotions;

    useHealthPotion();

    // Если зелье действительно использовано
    if (hermit.healthPotions < previousCount) {

        potionSlot.classList.remove("selected");
        usePotionButton.classList.remove("visible");

    }

});

// Закрытие кнопкой
closeInventoryButton.addEventListener("click", () => {

    inventoryOpen = false;
    inventoryScreen.classList.remove("active");

});

// Закрытие клавишей Escape
document.addEventListener("keydown", (event) => {

    if (event.code === "Escape" && inventoryOpen) {

        inventoryOpen = false;
        inventoryScreen.classList.remove("active");

    }

});

// ==================================
// МОБИЛЬНОЕ УПРАВЛЕНИЕ
// ==================================

const mobileButtons = {
    "move-left": "ArrowLeft",
    "move-right": "ArrowRight",
    "jump-button": "Space",
    "attack-button": "KeyJ",
    "fireball-button": "KeyF",
    "potion-button": "KeyH",
    "inventory-button": "KeyI"
};

// Передаём нажатие мобильной кнопки в игровое управление
Object.entries(mobileButtons).forEach(([buttonId, keyCode]) => {

    const button = document.getElementById(buttonId);

    button.addEventListener("pointerdown", (event) => {

        event.preventDefault();

        button.setPointerCapture(event.pointerId);

        document.dispatchEvent(new KeyboardEvent("keydown", {
            code: keyCode,
            bubbles: true
        }));

    });

    // Отпускание кнопки
    function releaseButton(event) {

        document.dispatchEvent(new KeyboardEvent("keyup", {
            code: keyCode,
            bubbles: true
        }));

    }

    button.addEventListener("pointerup", releaseButton);
    button.addEventListener("pointercancel", releaseButton);

});




// Новая игра
document.getElementById("new-game").addEventListener("click", () => {

    resetGame();

    showScreen("game-screen");

    // Сбрасываем огненный шар
    fireball.active = false;

        // Полноэкранный режим самой игры
    const gameScreen = document.getElementById("game-screen");

    if (!document.fullscreenElement && gameScreen?.requestFullscreen) {

        gameScreen.requestFullscreen()
            .catch(error => {
                console.log("Не удалось включить полный экран:", error);
            });
    }

});

// Переключение полноэкранного режима
const fullscreenButton = document.getElementById("fullscreen-button");
const gameScreen = document.getElementById("game-screen");

fullscreenButton.addEventListener("click", async () => {

    try {
        if (document.fullscreenElement) {
            await document.exitFullscreen();
        } else {
            await gameScreen.requestFullscreen();
        }
    } catch (error) {
        console.log("Ошибка полноэкранного режима:", error);
    }

});


// Игровой цикл
function gameLoop() {

    update();

    drawScene();

    requestAnimationFrame(gameLoop);

}

// Запускаем игру
gameLoop();