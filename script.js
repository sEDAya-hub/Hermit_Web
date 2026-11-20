
const screens = document.querySelectorAll(".screen");

function showScreen(screenId) {
    screens.forEach(screen => {
        screen.classList.remove("active");
    });

    document.getElementById(screenId).classList.add("active");
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
document.getElementById("pause-to-menu").addEventListener("click", () => {
    document.getElementById("pause-screen").classList.remove("active");
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

// Первый противник — Порождение Скверны
const enemy = {
    x: 600,
    y: 360,

    width: 50,
    height: 60,

    health: 3,
    maxHealth: 3,
    alive: true,
    hitFlash: 0,
    attackCooldown: 0
};

// Огненный шар
const fireball = {
    x: 0,
    y: 0,

    radius: 10,
    speed: 8,

    direction: 1,
    active: false
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
    hermit.health = hermit.maxHealth;
    hermit.mana = hermit.maxMana;
    hermit.healthPotions = hermit.maxHealthPotions;

    updatePotionCount();

    // Возрождаем противника
    enemy.health = enemy.maxHealth;
    enemy.alive = true;
    enemy.hitFlash = 0;
    enemy.attackCooldown = 0;

}


// ==================================
// СИСТЕМА СОХРАНЕНИЙ HERMIT
// ==================================

const SAVE_KEY = "hermit_save";

// Сохранение игры
function saveGame() {

    const saveData = {
        version: 1,

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

        enemy: {
            x: enemy.x,
            y: enemy.y,
            health: enemy.health,
            alive: enemy.alive
        }
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

        if (
            data.version !== 1 ||
            !data.hermit ||
            !data.enemy
        ) {
            throw new Error("Некорректное сохранение");
        }

        Object.assign(hermit, data.hermit);
        Object.assign(enemy, data.enemy);

        // Сбрасываем временные действия
        hermit.isAttacking = false;
        hermit.attackTimer = 0;
        hermit.hasHit = false;
        enemy.hitFlash = 0;
        enemy.attackCooldown = 0;

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

    // Очищаем холст и закрашиваем фон
    ctx.fillStyle = "#18232b";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Рисуем землю
    ctx.fillStyle = "#465344";
    ctx.fillRect(0, 420, 1200, 120);

    // Рисуем временного Хермита
    ctx.fillStyle = "#c6a36b";

    ctx.fillRect(
        hermit.x,
        hermit.y,
        hermit.width,
        hermit.height
    );

    // Рисуем удар мечом
    if (hermit.isAttacking) {

        ctx.save();

        ctx.fillStyle = "#e5c58d";

        const swordX = hermit.facing === "right"
            ? hermit.x + hermit.width
            : hermit.x - 35;

        // Наклон меча
        ctx.translate(
            hermit.facing === "right" ? swordX : swordX + 35,
            hermit.y + 35
        );

        ctx.rotate(
            hermit.facing === "right" ? -0.5 : 0.5
        );

        ctx.fillRect(-17, -4, 35, 8);

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

    // Рисуем противника
    if (enemy.alive) {

        // Тело Скверны
        ctx.fillStyle = enemy.hitFlash > 0
            ? "#d94b42"
            : "#315b45";

        ctx.fillRect(
            enemy.x,
            enemy.y,
            enemy.width,
            enemy.height
        );

        // Глаза
        ctx.fillStyle = "#d94b42";

        ctx.fillRect(
            enemy.x + 10,
            enemy.y + 15,
            8,
            8
        );

        ctx.fillRect(
            enemy.x + 32,
            enemy.y + 15,
            8,
            8
        );

        // Фон полоски здоровья
        ctx.fillStyle = "#382b2b";

        ctx.fillRect(
            enemy.x,
            enemy.y - 12,
            enemy.width,
            6
        );

        // Текущее здоровье
        ctx.fillStyle = "#b94b43";

        ctx.fillRect(
            enemy.x,
            enemy.y - 12,
            enemy.width * (enemy.health / enemy.maxHealth),
            6
        );

    }

    // ==================================
    // ИНТЕРФЕЙС ХЕРМИТА (HUD)
    // ==================================

    // Фон панели
    ctx.fillStyle = "#20252b";
    ctx.fillRect(20, 20, 220, 115);

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

    // Не принимаем игровые клавиши при открытом инвентаре
    if (inventoryOpen) {
        return;
    }

    keys[event.code] = true;

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

    // Движение влево
    if (keys["ArrowLeft"]) {
        hermit.x -= hermit.speed;
        hermit.facing = "left";
    }

    // Движение вправо
    if (keys["ArrowRight"]) {
        hermit.x += hermit.speed;
        hermit.facing = "right";
    }

    // Гравитация
    hermit.velocityY += hermit.gravity;

    // Вертикальное перемещение
    hermit.y += hermit.velocityY;

    // Проверка земли
    const groundY = 420 - hermit.height;

    if (hermit.y >= groundY) {
        hermit.y = groundY;
        hermit.velocityY = 0;
        hermit.onGround = true;
    }

    // Границы игрового поля
    if (hermit.x < 0) {
        hermit.x = 0;
    }

    if (hermit.x + hermit.width > canvas.width) {
        hermit.x = canvas.width - hermit.width;
    }

    // Продолжительность атаки
    if (hermit.attackTimer > 0) {
        hermit.attackTimer--;
    } else {
        hermit.isAttacking = false;
    }

    // Уменьшаем время красной вспышки
    if (enemy.hitFlash > 0) {
        enemy.hitFlash--;
    }

    // ==================================
    // ДВИЖЕНИЕ ОГНЕННОГО ШАРА
    // ==================================

    if (fireball.active) {

        fireball.x += fireball.speed * fireball.direction;

        // Проверяем попадание в противника
        if (
            enemy.alive &&
            fireball.x + fireball.radius >= enemy.x &&
            fireball.x - fireball.radius <= enemy.x + enemy.width &&
            fireball.y + fireball.radius >= enemy.y &&
            fireball.y - fireball.radius <= enemy.y + enemy.height
        ) {

            enemy.health--;

            enemy.hitFlash = 8;

            fireball.active = false;

            if (enemy.health <= 0) {
                enemy.alive = false;
            }

        }

        // Убираем шар за пределами игрового поля
        if (
            fireball.x < 0 ||
            fireball.x > canvas.width
        ) {
            fireball.active = false;
        }

    }

    // Проверка попадания мечом
    if (hermit.isAttacking && enemy.alive && !hermit.hasHit) {

        const swordRange = 55;

        // Расстояние между Хермитом и врагом
        const distance = enemy.x - hermit.x;

        // Проверяем направление и расстояние
        if (
            (hermit.facing === "right" && distance > 0 && distance < swordRange) ||
            (hermit.facing === "left" && distance < 0 && distance > -swordRange)
        ) {
            enemy.health--;
            hermit.isAttacking = false;
            hermit.hasHit = true;
            enemy.hitFlash = 8;

            if (enemy.health <= 0) {
                enemy.alive = false;
            }
        }

    }

    // ==================================
    // АТАКА ПРОТИВНИКА
    // ==================================

    if (enemy.alive) {

        const distance = enemy.x - hermit.x;

        // Проверяем, находится ли Хермит рядом
        if (Math.abs(distance) < 60) {

            // Таймер ожидания между атаками
            if (enemy.attackCooldown <= 0) {

                hermit.health -= 10;

                enemy.attackCooldown = 60;

            }

        }

    }

    // Уменьшаем таймер атаки противника
    if (enemy.attackCooldown > 0) {
        enemy.attackCooldown--;
    }

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
document.getElementById("new-game").addEventListener("click", async () => {

    resetGame();

    showScreen("game-screen");

    // Сбрасываем огненный шар
    fireball.active = false;

    // Мобильный полноэкранный режим
    if (window.matchMedia("(pointer: coarse)").matches) {

        // Пытаемся открыть игру на весь экран
        try {
            if (!document.fullscreenElement &&
                document.documentElement.requestFullscreen) {

                await document.documentElement.requestFullscreen();
            }
        } catch (error) {
            console.log("Полноэкранный режим недоступен:", error);
        }

        // Пытаемся установить горизонтальную ориентацию
        try {
            if (screen.orientation &&
                screen.orientation.lock) {

                await screen.orientation.lock("landscape");
            }
        } catch (error) {
            console.log("Блокировка ориентации недоступна:", error);
        }
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