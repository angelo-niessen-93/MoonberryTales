let canvas;
let world;
let keyboard = new Keyboard();
let gameMusic;
let isMusicMuted = false;
const SOUND_VOLUME = 0.5;

function init() {
    canvas = document.getElementById('canvas');
    world = new World(canvas, keyboard);
    setupGameMusic();
    setupMusicToggle();
    setupFullscreenToggle();
    setupControlsPopup();
    setupButtonKeyboardGuard();

    console.log('My Character is', world.character);
}

function setupButtonKeyboardGuard() {
    const blockedKeys = new Set([" ", "Enter"]);
    document.addEventListener("keydown", (event) => {
        if (!blockedKeys.has(event.key)) {
            return;
        }
        const active = document.activeElement;
        if (active instanceof HTMLButtonElement) {
            event.preventDefault();
            active.blur();
        }
    });
}

function setupControlsPopup() {
    const infoButton = document.getElementById("info-toggle");
    const popup = document.getElementById("controls-popup");
    const closeButton = document.getElementById("controls-close");

    if (!infoButton || !popup || !closeButton) return;

    const openPopup = () => {
        popup.classList.remove("hidden");
    };

    const closePopup = () => {
        popup.classList.add("hidden");
    };

    infoButton.addEventListener("click", openPopup);
    closeButton.addEventListener("click", closePopup);

    popup.addEventListener("click", (event) => {
        if (event.target === popup) {
            closePopup();
        }
    });

    window.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closePopup();
        }
    });
}

function setupFullscreenToggle() {
    const button = document.getElementById("fullscreen-toggle");
    const wrapper = document.querySelector(".canvas-wrapper");
    if (!button || !canvas || !wrapper) return;
    let exitRequestedByButton = false;

    const updateButtonState = () => {
        const isFullscreen = document.fullscreenElement === wrapper;
        button.style.opacity = isFullscreen ? "0.75" : "1";
        button.setAttribute(
            "aria-label",
            isFullscreen ? "Vollbild beenden" : "Vollbild aktivieren",
        );
    };

    button.addEventListener("click", async () => {
        try {
            if (document.fullscreenElement === wrapper) {
                exitRequestedByButton = true;
                await document.exitFullscreen();
            } else {
                await wrapper.requestFullscreen();
            }
        } catch (_) {}

        updateButtonState();
    });

    document.addEventListener("fullscreenchange", async () => {
        if (!document.fullscreenElement && !exitRequestedByButton) {
            try {
                await wrapper.requestFullscreen();
            } catch (_) {}
        }
        exitRequestedByButton = false;
        updateButtonState();
    });

    updateButtonState();
}

function setupGameMusic() {
    gameMusic = new Audio("audio/music%20moonberrytales.mp3");
    gameMusic.loop = true;
    gameMusic.volume = SOUND_VOLUME;

    gameMusic.play().catch(() => {});

    const resumeMusic = () => {
        if (!isMusicMuted) {
            gameMusic.play().catch(() => {});
        }
    };

    window.addEventListener("keydown", resumeMusic, { once: true });
    window.addEventListener("click", resumeMusic, { once: true });
}

function setupMusicToggle() {
    const button = document.getElementById("music-toggle");
    if (!button) return;

    const updateButtonState = () => {
        button.style.opacity = isMusicMuted ? "0.45" : "1";
        button.setAttribute(
            "aria-label",
            isMusicMuted ? "Musik aktivieren" : "Musik stummschalten",
        );
    };

    button.addEventListener("click", () => {
        isMusicMuted = !isMusicMuted;
        gameMusic.muted = isMusicMuted;
        updateButtonState();
    });

    updateButtonState();
}

window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
        keyboard.LEFT = true;
    }
    if (e.key === 'ArrowRight') {
        keyboard.RIGHT = true;
    }
    if (e.key === 'ArrowUp') {
        keyboard.UP = true;
    }
    if (e.key === 'ArrowDown') {
        keyboard.DOWN = true;
    }
    if (e.key === ' ') {
        keyboard.SPACE = true;
    }
    if (e.key === 'Shift') {
        keyboard.SHIFT = true;
    }
});

window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft') {
        keyboard.LEFT = false;
    }
    if (e.key === 'ArrowRight') {
        keyboard.RIGHT = false;
    }
    if (e.key === 'ArrowUp') {
        keyboard.UP = false;
    }
    if (e.key === 'ArrowDown') {
        keyboard.DOWN = false;
    }
    if (e.key === ' ') {
        keyboard.SPACE = false;
    }
    if (e.key === 'Shift') {
        keyboard.SHIFT = false;
    }
});
