

(() => {
    const root = document.documentElement;

    const tg = window.Telegram?.WebApp;

    function updateViewport() {
        const width = tg?.viewportWidth || window.innerWidth;

        const height =
            tg?.viewportStableHeight ||
            tg?.viewportHeight ||
            window.innerHeight;

        root.style.setProperty("--app-width", `${width}px`);
        root.style.setProperty("--app-height", `${height}px`);
    }

    // Запрос полноэкранного режима
    window.hermitEnterFullscreen = function () {
        if (tg?.requestFullscreen && !tg.isFullscreen) {
            tg.requestFullscreen();
        }
    };

    if (tg) {
        tg.ready();
        tg.expand();

        updateViewport();

        tg.onEvent("viewportChanged", updateViewport);
        tg.onEvent("fullscreenChanged", updateViewport);
    } else {
        updateViewport();
        window.addEventListener("resize", updateViewport);
    }
})();
