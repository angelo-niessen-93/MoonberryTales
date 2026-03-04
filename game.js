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

/**
 * Runs setupControlsPopup.
 */
function setupControlsPopup() {
    const controls = getControlsPopupElements();
    if (!controls) return;
    const closePopup = () => setPopupVisible(controls.popup, false);
    controls.infoButton.addEventListener("click", () => setPopupVisible(controls.popup, true));
    controls.closeButton.addEventListener("click", closePopup);
    bindBackdropClose(controls.popup, closePopup);
    bindEscapeClose(closePopup);
}

/**
 * Runs getControlsPopupElements.
 */
function getControlsPopupElements() {
    const infoButton = document.getElementById("info-toggle");
    const popup = document.getElementById("controls-popup");
    const closeButton = document.getElementById("controls-close");
    if (!infoButton || !popup || !closeButton) return null;
    return { infoButton, popup, closeButton };
}

/**
 * Runs setPopupVisible.
 * @param {*} popup
 * @param {*} visible
 */
function setPopupVisible(popup, visible) {
    popup.classList.toggle("hidden", !visible);
}

/**
 * Runs bindBackdropClose.
 * @param {*} popup
 * @param {*} onClose
 */
function bindBackdropClose(popup, onClose) {
    popup.addEventListener("click", (event) => { if (event.target === popup) onClose(); });
}

/**
 * Runs bindEscapeClose.
 * @param {*} onClose
 */
function bindEscapeClose(onClose) {
    window.addEventListener("keydown", (event) => { if (event.key === "Escape") onClose(); });
}

/**
 * Runs setupPausePopup.
 */
function setupPausePopup() {
    const elements = getPausePopupElements();
    if (!elements) return;
    const settings = getPauseSettingsElements();
    const controls = createPausePopupControls(elements.popup, settings?.popup);
    bindPausePopupButtons(elements, controls);
    bindPauseSettingsPopup(settings, controls);
    bindBackdropClose(elements.popup, controls.closePopup);
    bindPauseEscapeToggle(elements.popup, settings?.popup, controls);
    syncPauseSettingsSliders(settings);
}

/**
 * Runs getPausePopupElements.
 */
function getPausePopupElements() {
    const pauseButton = document.getElementById("pause-toggle");
    const popup = document.getElementById("pause-popup");
    const continueButton = document.getElementById("pause-continue");
    const settingsButton = document.getElementById("pause-settings");
    const homeButton = document.getElementById("pause-home");
    if (!pauseButton || !popup || !continueButton || !settingsButton || !homeButton) return null;
    return { pauseButton, popup, continueButton, settingsButton, homeButton };
}

/**
 * Runs createPausePopupControls.
 * @param {*} popup
 * @param {*} settingsPopup
 */
function createPausePopupControls(popup, settingsPopup) {
    const openPopup = () => { if (!canOpenPausePopup()) return; setGamePaused(true); setPopupVisible(popup, true); };
    const closePopup = () => { setPopupVisible(popup, false); setPopupVisible(settingsPopup, false); setGamePaused(false); };
    const openSettings = () => setPopupVisible(settingsPopup, true);
    const closeSettings = () => setPopupVisible(settingsPopup, false);
    return { openPopup, closePopup, openSettings, closeSettings };
}

/**
 * Runs getPauseSettingsElements.
 */
function getPauseSettingsElements() {
    const popup = document.getElementById("pause-settings-popup");
    const music = document.getElementById("pause-music-volume");
    const sfx = document.getElementById("pause-sfx-volume");
    const close = document.getElementById("pause-settings-close");
    if (!popup || !music || !sfx || !close) return null;
    return { popup, music, sfx, close };
}

/**
 * Runs syncPauseSettingsSliders.
 * @param {*} settings
 */
function syncPauseSettingsSliders(settings) {
    if (!settings) return;
    settings.music.value = String(musicVolume);
    settings.sfx.value = String(sfxVolume);
}

/**
 * Runs canOpenPausePopup.
 */
function canOpenPausePopup() {
    return !(world?.isGameOver || world?.isVictory);
}

/**
 * Runs bindPausePopupButtons.
 * @param {*} elements
 * @param {*} controls
 */
function bindPausePopupButtons(elements, controls) {
    elements.pauseButton.addEventListener("click", controls.openPopup);
    elements.continueButton.addEventListener("click", controls.closePopup);
    elements.settingsButton.addEventListener("click", controls.openSettings);
    elements.homeButton.addEventListener("click", () => navigateHomeFromGame());
}

/**
 * Runs bindPauseEscapeToggle.
 * @param {*} popup
 * @param {*} settingsPopup
 * @param {*} controls
 */
function bindPauseEscapeToggle(popup, settingsPopup, controls) {
    window.addEventListener("keydown", (event) => {
        if (event.key !== "Escape" || isControlsPopupVisible()) return;
        if (isPauseSettingsOpen(settingsPopup)) return controls.closeSettings();
        if (popup.classList.contains("hidden")) controls.openPopup(); else controls.closePopup();
    });
}

/**
 * Runs isPauseSettingsOpen.
 * @param {*} settingsPopup
 */
function isPauseSettingsOpen(settingsPopup) {
    if (!settingsPopup) return false;
    return !settingsPopup.classList.contains("hidden");
}

/**
 * Runs bindPauseSettingsPopup.
 * @param {*} settings
 * @param {*} controls
 */
function bindPauseSettingsPopup(settings, controls) {
    if (!settings) return;
    settings.close.addEventListener("click", controls.closeSettings);
    bindBackdropClose(settings.popup, controls.closeSettings);
    settings.music.addEventListener("input", (event) => updateMusicVolume(event.target.value));
    settings.sfx.addEventListener("input", (event) => updateSfxVolume(event.target.value));
}

/**
 * Runs updateMusicVolume.
 * @param {*} value
 */
function updateMusicVolume(value) {
    musicVolume = clampVolume(value);
    persistVolumeState();
    applyMutePreferences();
}

/**
 * Runs updateSfxVolume.
 * @param {*} value
 */
function updateSfxVolume(value) {
    sfxVolume = clampVolume(value);
    persistVolumeState();
    applyMutePreferences();
}

/**
 * Runs isControlsPopupVisible.
 */
function isControlsPopupVisible() {
    const controlsPopup = document.getElementById("controls-popup");
    return !!(controlsPopup && !controlsPopup.classList.contains("hidden"));
}

/**
 * Runs setupFullscreenToggle.
 */
function setupFullscreenToggle() {
    const state = getFullscreenToggleState();
    if (!state) return;
    bindFullscreenToggleClick(state);
    bindFullscreenChange(state);
    state.updateButtonState();
}

/**
 * Runs getFullscreenToggleState.
 */
function getFullscreenToggleState() {
    const button = document.getElementById("fullscreen-toggle");
    const wrapper = document.querySelector(".canvas-wrapper");
    if (!button || !canvas || !wrapper) return null;
    const state = { button, wrapper, exitRequestedByButton: false };
    state.updateButtonState = () => updateFullscreenButtonState(state);
    return state;
}

/**
 * Runs updateFullscreenButtonState.
 * @param {*} state
 */
function updateFullscreenButtonState(state) {
    const isFullscreen = document.fullscreenElement === state.wrapper;
    state.button.style.opacity = isFullscreen ? "0.75" : "1";
    state.button.setAttribute("aria-label", isFullscreen ? "Vollbild beenden" : "Vollbild aktivieren");
}

/**
 * Runs bindFullscreenToggleClick.
 * @param {*} state
 */
function bindFullscreenToggleClick(state) {
    state.button.addEventListener("click", async () => {
        await toggleFullscreen(state);
        state.updateButtonState();
    });
}

async function toggleFullscreen(state) {
    try {
        if (document.fullscreenElement === state.wrapper) return await exitFullscreenFromButton(state);
        await state.wrapper.requestFullscreen();
    } catch (_) {}
}

async function exitFullscreenFromButton(state) {
    state.exitRequestedByButton = true;
    await document.exitFullscreen();
}

/**
 * Runs bindFullscreenChange.
 * @param {*} state
 */
function bindFullscreenChange(state) {
    document.addEventListener("fullscreenchange", async () => {
        await restoreFullscreenIfNeeded(state);
        state.exitRequestedByButton = false;
        state.updateButtonState();
    });
}

async function restoreFullscreenIfNeeded(state) {
    if (document.fullscreenElement || state.exitRequestedByButton) return;
    try { await state.wrapper.requestFullscreen(); } catch (_) {}
}

/**
 * Runs setupGameMusic.
 * @param {*} shouldDelayStart
 */
function setupGameMusic(shouldDelayStart = false) {
    initGameAudio();
    applyMutePreferences();
    if (!shouldDelayStart) startGameMusic();
    bindGameMusicUnlockEvents();
}

/**
 * Runs initGameAudio.
 */
function initGameAudio() {
    gameMusic = new Audio("audio/music%20moonberrytales.mp3");
    gameMusic.loop = true;
    gameMusic.volume = SOUND_VOLUME;
    levelPassingSound = new Audio("audio/level-passing-sound.mp3");
    levelPassingSound.volume = SOUND_VOLUME;
}

/**
 * Runs bindGameMusicUnlockEvents.
 */
function bindGameMusicUnlockEvents() {
    window.addEventListener("keydown", startGameMusic, { once: true });
    window.addEventListener("click", startGameMusic, { once: true });
}

/**
 * Runs startGameMusic.
 */
function startGameMusic() {
    if (!gameMusic || isMusicMuted || hasBossDefeatAudioPlayed) {
        return;
    }
    gameMusic.play().catch(() => {});
}

/**
 * Runs stopGameMusic.
 */
function stopGameMusic() {
    if (!gameMusic) {
        return;
    }
    gameMusic.pause();
    gameMusic.currentTime = 0;
}

/**
 * Runs playLevelPassingSound.
 */
function playLevelPassingSound() {
    if (!levelPassingSound) {
        return;
    }
    levelPassingSound.currentTime = 0;
    levelPassingSound.play().catch(() => {});
}

/**
 * Runs stopLevelPassingSound.
 */
function stopLevelPassingSound() {
    if (!levelPassingSound) {
        return;
    }
    levelPassingSound.pause();
    levelPassingSound.currentTime = 0;
}

/**
 * Runs setupBossDefeatAudioFlow.
 */
function setupBossDefeatAudioFlow() {
    window.addEventListener("boss-defeated", onBossDefeated);
    window.addEventListener("game-restarted", onGameRestarted);
}

/**
 * Runs onBossDefeated.
 */
function onBossDefeated() {
    if (hasBossDefeatAudioPlayed) return;
    hasBossDefeatAudioPlayed = true;
    stopGameMusic();
    playLevelPassingSound();
}

/**
 * Runs onGameRestarted.
 */
function onGameRestarted() {
    hasBossDefeatAudioPlayed = false;
    hasFinalOutroStarted = false;
    resetFinalOutroVideo();
    stopLevelPassingSound();
    applyMutePreferences();
    startGameMusic();
}

/**
 * Runs isFinalLevel.
 */
function isFinalLevel() {
    return resolveCurrentLevelId() === FINAL_LEVEL_ID;
}

/**
 * Runs navigateHomeFromGame.
 */
function navigateHomeFromGame() {
    if (!isFinalLevel()) {
        window.location.href = FINAL_OUTRO_TARGET;
        return;
    }
    stopGameMusic();
    stopLevelPassingSound();
    setGamePaused(true);
    playFinalOutroVideo();
}

/**
 * Runs playFinalOutroVideo.
 */
function playFinalOutroVideo() {
    if (hasFinalOutroStarted) return;
    hasFinalOutroStarted = true;
    stopLevelPassingSound();
    const overlay = document.querySelector(FINAL_OUTRO_OVERLAY_SELECTOR);
    const video = document.querySelector(FINAL_OUTRO_VIDEO_SELECTOR);
    if (!(overlay instanceof HTMLElement) || !(video instanceof HTMLVideoElement)) return redirectToHomeAfterOutro();
    overlay.classList.remove("hidden");
    video.currentTime = 0;
    video.muted = isMusicMuted && isSfxMuted;
    const finish = () => redirectToHomeAfterOutro();
    video.addEventListener("ended", finish, { once: true });
    video.addEventListener("error", finish, { once: true });
    video.play().catch(() => {
        const startOnClick = () => {
            overlay.removeEventListener("click", startOnClick);
            video.play().catch(() => finish());
        };
        overlay.addEventListener("click", startOnClick, { once: true });
    });
}

/**
 * Runs resetFinalOutroVideo.
 */
function resetFinalOutroVideo() {
    const overlay = document.querySelector(FINAL_OUTRO_OVERLAY_SELECTOR);
    const video = document.querySelector(FINAL_OUTRO_VIDEO_SELECTOR);
    if (video instanceof HTMLVideoElement) {
        video.pause();
        video.currentTime = 0;
    }
    if (overlay instanceof HTMLElement) overlay.classList.add("hidden");
}

/**
 * Runs redirectToHomeAfterOutro.
 */
function redirectToHomeAfterOutro() {
    window.location.href = FINAL_OUTRO_TARGET;
}

window.navigateHomeFromGame = navigateHomeFromGame;

/**
 * Runs setupMusicToggle.
 */
function setupMusicToggle() {
    const state = getMusicToggleElements();
    if (!state) return;
    state.updateButtonState = () => updateMusicToggleState(state);
    bindMusicPanelToggle(state);
    bindMusicOutsideClose(state);
    bindMusicButtons(state);
    state.updateButtonState();
}

/**
 * Runs getMusicToggleElements.
 */
function getMusicToggleElements() {
    const panelRoot = document.getElementById("audio-control-game");
    const toggleButton = document.getElementById("music-toggle");
    const musicToggle = document.getElementById("music-mute-toggle-game");
    const sfxToggle = document.getElementById("sfx-mute-toggle-game");
    if (!panelRoot || !toggleButton || !musicToggle || !sfxToggle) return null;
    return { panelRoot, toggleButton, musicToggle, sfxToggle };
}

/**
 * Runs updateMusicToggleState.
 * @param {*} state
 */
function updateMusicToggleState(state) {
    const allMuted = isMusicMuted && isSfxMuted;
    state.toggleButton.style.opacity = allMuted ? "0.45" : "1";
    state.toggleButton.setAttribute("aria-label", allMuted ? "Audio-Menü (alles stumm)" : "Audio-Menü öffnen");
    state.musicToggle.classList.toggle("is-muted", isMusicMuted);
    state.sfxToggle.classList.toggle("is-muted", isSfxMuted);
    state.musicToggle.textContent = `Musik: ${isMusicMuted ? "Aus" : "An"}`;
    state.sfxToggle.textContent = `Soundeffekte: ${isSfxMuted ? "Aus" : "An"}`;
}

/**
 * Runs bindMusicPanelToggle.
 * @param {*} state
 */
function bindMusicPanelToggle(state) {
    state.toggleButton.addEventListener("click", (event) => {
        event.stopPropagation();
        const isOpen = state.panelRoot.classList.toggle("is-open");
        state.toggleButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
}

/**
 * Runs bindMusicOutsideClose.
 * @param {*} state
 */
function bindMusicOutsideClose(state) {
    document.addEventListener("click", (event) => {
        if (state.panelRoot.contains(event.target)) return;
        state.panelRoot.classList.remove("is-open");
        state.toggleButton.setAttribute("aria-expanded", "false");
    });
}

/**
 * Runs bindMusicButtons.
 * @param {*} state
 */
function bindMusicButtons(state) {
    state.musicToggle.addEventListener("click", () => toggleMusicMute(state.updateButtonState));
    state.sfxToggle.addEventListener("click", () => toggleSfxMute(state.updateButtonState));
}

/**
 * Runs toggleMusicMute.
 * @param {*} updateButtonState
 */
function toggleMusicMute(updateButtonState) {
    isMusicMuted = !isMusicMuted;
    persistMuteState();
    applyMutePreferences();
    if (!isMusicMuted) startGameMusic();
    updateButtonState();
}

/**
 * Runs toggleSfxMute.
 * @param {*} updateButtonState
 */
function toggleSfxMute(updateButtonState) {
    isSfxMuted = !isSfxMuted;
    persistMuteState();
    applyMutePreferences();
    updateButtonState();
}

/**
 * Runs setupMobileTouchControls.
 */
function setupMobileTouchControls() {
    const controls = getMobileControlElements();
    if (!controls) return;
    const context = createTouchContext(controls.touchControl);
    bindTouchMoveEvents(controls.touchControl, context);
    bindAttackEvents(controls.attackControl);
    bindTouchBlurReset(context);
}

/**
 * Runs getMobileControlElements.
 */
function getMobileControlElements() {
    const touchControl = document.getElementById("mobile-arrows-control");
    const attackControl = document.getElementById("mobile-attack-control");
    if (!touchControl || !attackControl) return null;
    return { touchControl, attackControl };
}

/**
 * Runs createTouchContext.
 * @param {*} touchControl
 */
function createTouchContext(touchControl) {
    const activeTouchZones = new Map();
    const applyKeyboardState = () => applyTouchKeyboardState(activeTouchZones);
    const detectZone = (touch) => detectTouchZone(touchControl, touch);
    return { activeTouchZones, applyKeyboardState, detectZone };
}

/**
 * Runs detectTouchZone.
 * @param {*} touchControl
 * @param {*} touch
 */
function detectTouchZone(touchControl, touch) {
    const rect = touchControl.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    const ratioX = (touch.clientX - rect.left) / rect.width;
    if (ratioX < 0 || ratioX > 1) return null;
    if (ratioX < 0.34) return "left";
    if (ratioX > 0.66) return "right";
    return "up";
}

/**
 * Runs applyTouchKeyboardState.
 * @param {*} activeTouchZones
 */
function applyTouchKeyboardState(activeTouchZones) {
    const zones = Array.from(activeTouchZones.values());
    keyboard.LEFT = zones.includes("left");
    keyboard.RIGHT = zones.includes("right");
    keyboard.UP = zones.includes("up");
}

/**
 * Runs bindTouchMoveEvents.
 * @param {*} touchControl
 * @param {*} context
 */
function bindTouchMoveEvents(touchControl, context) {
    touchControl.addEventListener("touchstart", (event) => onTouchStart(event, context), { passive: false });
    touchControl.addEventListener("touchmove", (event) => onTouchMove(event, context), { passive: false });
    touchControl.addEventListener("touchend", (event) => onTouchEnd(event, context), { passive: false });
    touchControl.addEventListener("touchcancel", (event) => onTouchEnd(event, context), { passive: false });
}

/**
 * Runs onTouchStart.
 * @param {*} event
 * @param {*} context
 */
function onTouchStart(event, context) {
    event.preventDefault();
    updateTouchZones(event.changedTouches, context, true);
    context.applyKeyboardState();
}

/**
 * Runs onTouchMove.
 * @param {*} event
 * @param {*} context
 */
function onTouchMove(event, context) {
    event.preventDefault();
    updateTouchZones(event.changedTouches, context, false);
    context.applyKeyboardState();
}

/**
 * Runs updateTouchZones.
 * @param {*} changedTouches
 * @param {*} context
 * @param {*} keepPreviousZoneOnNull
 */
function updateTouchZones(changedTouches, context, keepPreviousZoneOnNull) {
    for (const touch of changedTouches) {
        const zone = context.detectZone(touch);
        if (zone) context.activeTouchZones.set(touch.identifier, zone);
        if (!zone && !keepPreviousZoneOnNull) context.activeTouchZones.delete(touch.identifier);
    }
}

/**
 * Runs onTouchEnd.
 * @param {*} event
 * @param {*} context
 */
function onTouchEnd(event, context) {
    event.preventDefault();
    for (const touch of event.changedTouches) context.activeTouchZones.delete(touch.identifier);
    context.applyKeyboardState();
}

/**
 * Runs bindAttackEvents.
 * @param {*} attackControl
 */
function bindAttackEvents(attackControl) {
    attackControl.addEventListener("touchstart", (event) => setAttackPressed(true, event), { passive: false });
    attackControl.addEventListener("touchend", (event) => setAttackPressed(false, event), { passive: false });
    attackControl.addEventListener("touchcancel", (event) => setAttackPressed(false, event), { passive: false });
    attackControl.addEventListener("pointerdown", (event) => { event.preventDefault(); setAttackPressed(true); });
    ["pointerup", "pointerleave", "pointercancel"].forEach((type) => attackControl.addEventListener(type, () => setAttackPressed(false)));
}

/**
 * Runs setAttackPressed.
 * @param {*} pressed
 * @param {*} event
 */
function setAttackPressed(pressed, event) {
    if (event) event.preventDefault();
    keyboard.SPACE = pressed;
}

/**
 * Runs bindTouchBlurReset.
 * @param {*} context
 */
function bindTouchBlurReset(context) {
    window.addEventListener("blur", () => {
        context.activeTouchZones.clear();
        keyboard.SPACE = false;
        context.applyKeyboardState();
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




