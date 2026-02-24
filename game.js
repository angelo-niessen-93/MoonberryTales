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

    console.log('My Character is', world.character);
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

    button.addEventListener("click", () => {
        isMusicMuted = !isMusicMuted;
        gameMusic.muted = isMusicMuted;
        button.textContent = isMusicMuted ? "Music: Off" : "Music: On";
    });
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
