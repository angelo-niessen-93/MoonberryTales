let canvas;
let world;
let keyboard = new Keyboard();
let gameMusic;
let levelPassingSound;
let isMusicMuted = false;
let isGamePaused = false;
let hasBossDefeatAudioPlayed = false;
const SOUND_VOLUME = 0.5;
const LOADING_SCREEN_DURATION_MS = 3500;

function init() {
    const shouldShowLoadingScreen = sessionStorage.getItem("showLoadingScreen") === "1";
    canvas = document.getElementById('canvas');
    world = new World(canvas, keyboard);
    setupGameMusic(shouldShowLoadingScreen);
    setupMusicToggle();
    setupFullscreenToggle();
    setupControlsPopup();
    setupPausePopup();
    setupButtonKeyboardGuard();
    setupMobileTouchControls();
    setupBossDefeatAudioFlow();
    hidePageLoadingScreen();

    console.log('My Character is', world.character);
}

function hidePageLoadingScreen() {
    const loadingScreen = document.getElementById("page-loading-screen");
    const progressFill = document.getElementById("loading-progress-fill");
    const progressText = document.getElementById("loading-progress-text");
    if (!loadingScreen) {
        sessionStorage.removeItem("showLoadingScreen");
        startGameMusic();
        return;
    }

    if (sessionStorage.getItem("showLoadingScreen") !== "1") {
        loadingScreen.remove();
        sessionStorage.removeItem("showLoadingScreen");
        startGameMusic();
        return;
    }

    const startedAt = performance.now();
    const tickProgress = (now) => {
        const progress = Math.min((now - startedAt) / LOADING_SCREEN_DURATION_MS, 1);
        const progressPercent = Math.round(progress * 100);
        if (progressFill) {
            progressFill.style.width = `${progress * 100}%`;
        }
        if (progressText) {
            progressText.textContent = `Lade Spielwelt... ${progressPercent}%`;
        }
        if (progress < 1) {
            window.requestAnimationFrame(tickProgress);
        }
    };
    window.requestAnimationFrame(tickProgress);

    window.setTimeout(() => {
        loadingScreen.classList.add("is-hidden");
        window.setTimeout(() => {
            loadingScreen.remove();
            startGameMusic();
        }, 260);
        sessionStorage.removeItem("showLoadingScreen");
    }, LOADING_SCREEN_DURATION_MS);
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

function setGamePaused(paused) {
    isGamePaused = paused;
    window.__moonberryPaused = paused;

    if (world) {
        world.isPaused = paused;
        if (paused && typeof world.resetKeyboardState === "function") {
            world.resetKeyboardState();
        }
    }

    if (paused) {
        keyboard.LEFT = false;
        keyboard.RIGHT = false;
        keyboard.UP = false;
        keyboard.DOWN = false;
        keyboard.SPACE = false;
        keyboard.SHIFT = false;
    }
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

function setupPausePopup() {
    const pauseButton = document.getElementById("pause-toggle");
    const popup = document.getElementById("pause-popup");
    const continueButton = document.getElementById("pause-continue");
    const homeButton = document.getElementById("pause-home");

    if (!pauseButton || !popup || !continueButton || !homeButton) {
        return;
    }

    const openPopup = () => {
        if (world?.isGameOver || world?.isVictory) {
            return;
        }
        setGamePaused(true);
        popup.classList.remove("hidden");
    };

    const closePopup = () => {
        popup.classList.add("hidden");
        setGamePaused(false);
    };

    pauseButton.addEventListener("click", openPopup);
    continueButton.addEventListener("click", closePopup);
    homeButton.addEventListener("click", () => {
        window.location.href = "./index.html";
    });

    popup.addEventListener("click", (event) => {
        if (event.target === popup) {
            closePopup();
        }
    });

    window.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            const controlsPopup = document.getElementById("controls-popup");
            if (controlsPopup && !controlsPopup.classList.contains("hidden")) {
                return;
            }

            if (!popup.classList.contains("hidden")) {
                closePopup();
            } else {
                openPopup();
            }
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

function setupGameMusic(shouldDelayStart = false) {
    gameMusic = new Audio("audio/music%20moonberrytales.mp3");
    gameMusic.loop = true;
    gameMusic.volume = SOUND_VOLUME;
    levelPassingSound = new Audio("audio/level-passing-sound.mp3");
    levelPassingSound.volume = SOUND_VOLUME;

    if (!shouldDelayStart) {
        startGameMusic();
    }

    window.addEventListener("keydown", startGameMusic, { once: true });
    window.addEventListener("click", startGameMusic, { once: true });
}

function startGameMusic() {
    if (!gameMusic || isMusicMuted || hasBossDefeatAudioPlayed) {
        return;
    }
    gameMusic.play().catch(() => {});
}

function stopGameMusic() {
    if (!gameMusic) {
        return;
    }
    gameMusic.pause();
    gameMusic.currentTime = 0;
}

function playLevelPassingSound() {
    if (!levelPassingSound) {
        return;
    }
    levelPassingSound.currentTime = 0;
    levelPassingSound.play().catch(() => {});
}

function stopLevelPassingSound() {
    if (!levelPassingSound) {
        return;
    }
    levelPassingSound.pause();
    levelPassingSound.currentTime = 0;
}

function setupBossDefeatAudioFlow() {
    window.addEventListener("boss-defeated", () => {
        if (hasBossDefeatAudioPlayed) {
            return;
        }
        hasBossDefeatAudioPlayed = true;
        stopGameMusic();
        playLevelPassingSound();
    });

    window.addEventListener("game-restarted", () => {
        hasBossDefeatAudioPlayed = false;
        stopLevelPassingSound();
        startGameMusic();
    });
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
        if (!isMusicMuted) {
            startGameMusic();
        }
        updateButtonState();
    });

    updateButtonState();
}

function setupMobileTouchControls() {
    const touchControl = document.getElementById("mobile-arrows-control");
    const attackControl = document.getElementById("mobile-attack-control");
    if (!touchControl || !attackControl) {
        return;
    }

    const activeTouchZones = new Map();

    const detectZone = (touch) => {
        const rect = touchControl.getBoundingClientRect();
        if (!rect.width || !rect.height) {
            return null;
        }

        const ratioX = (touch.clientX - rect.left) / rect.width;
        if (ratioX < 0 || ratioX > 1) {
            return null;
        }

        if (ratioX < 0.34) {
            return "left";
        }
        if (ratioX > 0.66) {
            return "right";
        }
        return "up";
    };

    const applyKeyboardState = () => {
        const zones = Array.from(activeTouchZones.values());
        keyboard.LEFT = zones.includes("left");
        keyboard.RIGHT = zones.includes("right");
        keyboard.UP = zones.includes("up");
    };

    const onTouchStart = (event) => {
        event.preventDefault();
        for (const touch of event.changedTouches) {
            const zone = detectZone(touch);
            if (zone) {
                activeTouchZones.set(touch.identifier, zone);
            }
        }
        applyKeyboardState();
    };

    const onTouchMove = (event) => {
        event.preventDefault();
        for (const touch of event.changedTouches) {
            const zone = detectZone(touch);
            if (zone) {
                activeTouchZones.set(touch.identifier, zone);
            } else {
                activeTouchZones.delete(touch.identifier);
            }
        }
        applyKeyboardState();
    };

    const onTouchEnd = (event) => {
        event.preventDefault();
        for (const touch of event.changedTouches) {
            activeTouchZones.delete(touch.identifier);
        }
        applyKeyboardState();
    };

    touchControl.addEventListener("touchstart", onTouchStart, { passive: false });
    touchControl.addEventListener("touchmove", onTouchMove, { passive: false });
    touchControl.addEventListener("touchend", onTouchEnd, { passive: false });
    touchControl.addEventListener("touchcancel", onTouchEnd, { passive: false });

    const setAttackPressed = (pressed, event) => {
        if (event) {
            event.preventDefault();
        }
        keyboard.SPACE = pressed;
    };

    attackControl.addEventListener("touchstart", (event) => setAttackPressed(true, event), {
        passive: false,
    });
    attackControl.addEventListener("touchend", (event) => setAttackPressed(false, event), {
        passive: false,
    });
    attackControl.addEventListener("touchcancel", (event) => setAttackPressed(false, event), {
        passive: false,
    });

    attackControl.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        setAttackPressed(true);
    });
    attackControl.addEventListener("pointerup", () => setAttackPressed(false));
    attackControl.addEventListener("pointerleave", () => setAttackPressed(false));
    attackControl.addEventListener("pointercancel", () => setAttackPressed(false));

    window.addEventListener("blur", () => {
        activeTouchZones.clear();
        keyboard.SPACE = false;
        applyKeyboardState();
    });
}

window.addEventListener('keydown', (e) => {
    if (isGamePaused) {
        return;
    }
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
    if (isGamePaused) {
        return;
    }
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
