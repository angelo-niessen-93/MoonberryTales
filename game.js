/**
 * @file game.js
 */
let canvas;
let world;
let keyboard = new Keyboard();
let gameMusic;
let levelPassingSound;
let isMusicMuted = false;
let isSfxMuted = false;
let musicVolume = 0.5;
let sfxVolume = 0.5;
let isGamePaused = false;
let hasBossDefeatAudioPlayed = false;
let hasFinalOutroStarted = false;
const SOUND_VOLUME = 0.5;
const LOADING_SCREEN_DURATION_MS = 3500;
const FINAL_LEVEL_ID = "level2";
const FINAL_OUTRO_TARGET = "./index.html";
const FINAL_OUTRO_VIDEO_SELECTOR = "#outro-video";
const FINAL_OUTRO_OVERLAY_SELECTOR = "#outro-video-overlay";
const LEGACY_MUTE_STORAGE_KEY = "gameMuted";
const MUSIC_MUTE_STORAGE_KEY = "gameMusicMuted";
const SFX_MUTE_STORAGE_KEY = "gameSfxMuted";
const MUSIC_VOLUME_STORAGE_KEY = "gameMusicVolume";
const SFX_VOLUME_STORAGE_KEY = "gameSfxVolume";
const MOBILE_CONTROLS_STORAGE_KEY = "mobileControlsEnabled";
const DEFAULT_LOADING_IMAGE = "./img/loadingscreen.png";
const LEVEL2_LOADING_IMAGE = "./img/loadingscreenlevel2.png";

/**
 * Runs hasTouchScreen.
 */
function hasTouchScreen() {
    return (
        window.matchMedia("(pointer: coarse)").matches ||
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0
    );
}

/**
 * Runs updateDeviceClasses.
 */
function updateDeviceClasses() {
    const isTouchDevice = hasTouchScreen();
    const isPortrait = window.matchMedia("(orientation: portrait)").matches;
    document.documentElement.classList.toggle("is-touch-device", isTouchDevice);
    document.body.classList.toggle("is-touch-device", isTouchDevice);
    document.body.classList.toggle("is-portrait", isPortrait);
    document.body.classList.toggle("is-landscape", !isPortrait);
}

/**
 * Runs getStoredMuteState.
 * @param {*} key
 * @param {*} fallback
 */
function getStoredMuteState(key, fallback) {
    const value = localStorage.getItem(key);
    if (value === null) {
        return fallback;
    }
    return value === "1";
}

/**
 * Runs getStoredVolume.
 * @param {*} key
 * @param {*} fallback
 */
function getStoredVolume(key, fallback) {
    const raw = localStorage.getItem(key);
    const parsed = Number.parseFloat(raw);
    if (Number.isNaN(parsed)) return fallback;
    return clampVolume(parsed);
}

/**
 * Runs persistMuteState.
 */
function persistMuteState() {
    localStorage.setItem(MUSIC_MUTE_STORAGE_KEY, isMusicMuted ? "1" : "0");
    localStorage.setItem(SFX_MUTE_STORAGE_KEY, isSfxMuted ? "1" : "0");
    localStorage.setItem(LEGACY_MUTE_STORAGE_KEY, isMusicMuted ? "1" : "0");
}

/**
 * Runs persistVolumeState.
 */
function persistVolumeState() {
    localStorage.setItem(MUSIC_VOLUME_STORAGE_KEY, String(musicVolume));
    localStorage.setItem(SFX_VOLUME_STORAGE_KEY, String(sfxVolume));
}

/**
 * Runs collectSfxAudios.
 */
function collectSfxAudios() {
    return [...getBaseSfxAudios(), ...getEnemySfxAudios()].filter(Boolean);
}

/**
 * Runs getBaseSfxAudios.
 */
function getBaseSfxAudios() {
    return [
        levelPassingSound, world?.gameOverSound, world?.heartCollectSound, world?.coinCollectSound,
        world?.character?.attackSound, world?.character?.jumpSound, world?.character?.footstepSound, world?.character?.hurtSound,
    ];
}

/**
 * Runs getEnemySfxAudios.
 */
function getEnemySfxAudios() {
    if (!Array.isArray(world?.enemies)) return [];
    return world.enemies.map((enemy) => enemy?.attackSound);
}

/**
 * Runs applyMutePreferences.
 */
function applyMutePreferences() {
    applyMusicAudioSettings();
    applySfxAudioSettings();
    if (typeof applyFinalOutroAudioSettings === "function") {
        applyFinalOutroAudioSettings();
    }
}

/**
 * Runs applyMusicAudioSettings.
 */
function applyMusicAudioSettings() {
    if (!gameMusic) return;
    gameMusic.muted = isMusicMuted;
    gameMusic.volume = clampVolume(musicVolume);
}

/**
 * Runs applySfxAudioSettings.
 */
function applySfxAudioSettings() {
    collectSfxAudios().forEach((audio) => {
        audio.muted = isSfxMuted;
        audio.volume = clampVolume(sfxVolume);
    });
}

/**
 * Runs clampVolume.
 * @param {*} value
 */
function clampVolume(value) {
    return Math.max(0, Math.min(1, Number(value) || 0));
}

/**
 * Runs init.
 */
function init() {
    const shouldShowLoadingScreen = sessionStorage.getItem("showLoadingScreen") === "1";
    initMuteSettings();
    setupDeviceClassSync();
    updateLoadingScreenImage();
    buildWorld();
    setupUiSystems(shouldShowLoadingScreen);
    console.log('My Character is', world.character);
}

/**
 * Runs updateLoadingScreenImage.
 */
function updateLoadingScreenImage() {
    const image = document.querySelector("#page-loading-screen img");
    if (!image) return;
    image.src = resolveCurrentLevelId() === "level2" ? LEVEL2_LOADING_IMAGE : DEFAULT_LOADING_IMAGE;
}

/**
 * Runs resolveCurrentLevelId.
 */
function resolveCurrentLevelId() {
    const queryLevel = new URLSearchParams(window.location.search).get("level");
    if (queryLevel === "2" || String(queryLevel).toLowerCase() === "level2") return "level2";
    return "level1";
}

/**
 * Runs initMuteSettings.
 */
function initMuteSettings() {
    const legacyMuted = localStorage.getItem(LEGACY_MUTE_STORAGE_KEY) === "1";
    isMusicMuted = getStoredMuteState(MUSIC_MUTE_STORAGE_KEY, legacyMuted);
    isSfxMuted = getStoredMuteState(SFX_MUTE_STORAGE_KEY, legacyMuted);
    musicVolume = getStoredVolume(MUSIC_VOLUME_STORAGE_KEY, SOUND_VOLUME);
    sfxVolume = getStoredVolume(SFX_VOLUME_STORAGE_KEY, SOUND_VOLUME);
    persistMuteState();
    persistVolumeState();
}

/**
 * Runs setupDeviceClassSync.
 */
function setupDeviceClassSync() {
    updateDeviceClasses();
    window.addEventListener("resize", updateDeviceClasses);
    window.addEventListener("orientationchange", updateDeviceClasses);
}

/**
 * Runs buildWorld.
 */
function buildWorld() {
    canvas = document.getElementById('canvas');
    world = new World(canvas, keyboard);
}

/**
 * Runs setupUiSystems.
 * @param {*} shouldShowLoadingScreen
 */
function setupUiSystems(shouldShowLoadingScreen) {
    setupGameMusic(shouldShowLoadingScreen);
    applyMutePreferences();
    setupLevelIndicator();
    setupMusicToggle();
    setupFullscreenToggle();
    setupControlsPopup();
    setupPausePopup();
    setupButtonKeyboardGuard();
    if (applyMobileControlsPreference()) setupMobileTouchControls();
    setupBossDefeatAudioFlow();
    hidePageLoadingScreen();
}

/**
 * Runs setupLevelIndicator.
 */
function setupLevelIndicator() {
    const indicator = document.getElementById("level-indicator");
    if (!indicator) return;
    indicator.textContent = `Level ${getCurrentLevelNumber()}`;
}

/**
 * Runs getCurrentLevelNumber.
 */
function getCurrentLevelNumber() {
    return resolveCurrentLevelId() === "level2" ? 2 : 1;
}

/**
 * Runs applyMobileControlsPreference.
 */
function applyMobileControlsPreference() {
    const enabled = areMobileControlsEnabled();
    document.body.classList.toggle("mobile-controls-disabled", !enabled);
    if (!enabled) resetGameplayKeys();
    return enabled;
}

/**
 * Runs areMobileControlsEnabled.
 */
function areMobileControlsEnabled() {
    return localStorage.getItem(MOBILE_CONTROLS_STORAGE_KEY) !== "0";
}

/**
 * Runs hidePageLoadingScreen.
 */
function hidePageLoadingScreen() {
    const loadingScreen = document.getElementById("page-loading-screen");
    if (!loadingScreen) return finishLoadingScreen();
    if (sessionStorage.getItem("showLoadingScreen") !== "1") return removeLoadingScreenNow(loadingScreen);
    startLoadingScreenProgress();
    scheduleLoadingScreenHide(loadingScreen);
}

/**
 * Runs finishLoadingScreen.
 */
function finishLoadingScreen() {
    sessionStorage.removeItem("showLoadingScreen");
    startGameMusic();
}

/**
 * Runs removeLoadingScreenNow.
 * @param {*} loadingScreen
 */
function removeLoadingScreenNow(loadingScreen) {
    loadingScreen.remove();
    finishLoadingScreen();
}

/**
 * Runs startLoadingScreenProgress.
 */
function startLoadingScreenProgress() {
    const startedAt = performance.now();
    const fill = document.getElementById("loading-progress-fill");
    const text = document.getElementById("loading-progress-text");
    window.requestAnimationFrame((now) => tickLoadingProgress(now, startedAt, fill, text));
}

/**
 * Runs tickLoadingProgress.
 * @param {*} now
 * @param {*} startedAt
 * @param {*} fill
 * @param {*} text
 */
function tickLoadingProgress(now, startedAt, fill, text) {
    const progress = Math.min((now - startedAt) / LOADING_SCREEN_DURATION_MS, 1);
    updateLoadingProgressUi(progress, fill, text);
    if (progress < 1) window.requestAnimationFrame((next) => tickLoadingProgress(next, startedAt, fill, text));
}

/**
 * Runs updateLoadingProgressUi.
 * @param {*} progress
 * @param {*} fill
 * @param {*} text
 */
function updateLoadingProgressUi(progress, fill, text) {
    if (fill) fill.style.width = `${progress * 100}%`;
    if (text) text.textContent = `Lade Spielwelt... ${Math.round(progress * 100)}%`;
}

/**
 * Runs scheduleLoadingScreenHide.
 * @param {*} loadingScreen
 */
function scheduleLoadingScreenHide(loadingScreen) {
    window.setTimeout(() => hideLoadingScreenWithFade(loadingScreen), LOADING_SCREEN_DURATION_MS);
}

/**
 * Runs hideLoadingScreenWithFade.
 * @param {*} loadingScreen
 */
function hideLoadingScreenWithFade(loadingScreen) {
    loadingScreen.classList.add("is-hidden");
    window.setTimeout(() => removeLoadingScreenNow(loadingScreen), 260);
}

/**
 * Runs setupButtonKeyboardGuard.
 */
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

/**
 * Runs setGamePaused.
 * @param {*} paused
 */
function setGamePaused(paused) {
    isGamePaused = paused;
    window.__moonberryPaused = paused;
    applyWorldPauseState(paused);
    if (paused) resetGameplayKeys();
}

/**
 * Runs applyWorldPauseState.
 * @param {*} paused
 */
function applyWorldPauseState(paused) {
    if (!world) return;
    world.isPaused = paused;
    if (paused && typeof world.resetKeyboardState === "function") world.resetKeyboardState();
}

/**
 * Runs resetGameplayKeys.
 */
function resetGameplayKeys() {
    keyboard.LEFT = false;
    keyboard.RIGHT = false;
    keyboard.UP = false;
    keyboard.DOWN = false;
    keyboard.SPACE = false;
    keyboard.SHIFT = false;
}


