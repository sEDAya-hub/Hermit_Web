
(() => {
    const root = document.documentElement;

    function updateViewport() {
        const tg = window.Telegram?.WebApp;

        const width = tg?.viewportWidth || window.innerWidth;

        const height =
            tg?.viewportStableHeight ||
            tg?.viewportHeight ||
            window.innerHeight;

        root.style.setProperty("--app-width", `${width}px`);
        root.style.setProperty("--app-height", `${height}px`);
    }

    const tg = window.Telegram?.WebApp;

    if (tg) {
        tg.ready();
        tg.expand();

        updateViewport();

        tg.onEvent("viewportChanged", updateViewport);
    } else {
        updateViewport();
        window.addEventListener("resize", updateViewport);
    }
})();
