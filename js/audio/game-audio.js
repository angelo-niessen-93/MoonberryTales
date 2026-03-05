/**
 * @file js/audio/game-audio.js
 * @description Game audio orchestration (music, SFX, boss/outro flow, and audio UI toggles).
 */

/**
 * @typedef {Object} MusicToggleState
 * @property {HTMLElement} panelRoot - Root element of the audio panel.
 * @property {HTMLElement} toggleButton - Button that opens/closes the panel.
 * @property {HTMLElement} musicToggle - Button toggling music mute.
 * @property {HTMLElement} sfxToggle - Button toggling SFX mute.
 * @property {Function} [updateButtonState] - UI refresh callback attached at runtime.
 */

/**
 * Initializes music playback and unlock listeners.
 *
 * @param {boolean} [shouldDelayStart=false] - If `true`, do not auto-start music.
 * @returns {void}
 */
function setupGameMusic(shouldDelayStart = false) {
    initGameAudio();
    applyMutePreferences();
    if (!shouldDelayStart) startGameMusic();
    bindGameMusicUnlockEvents();
}

/**
 * Creates and configures audio objects used in-game.
 *
 * @returns {void}
 */
function initGameAudio() {
    gameMusic = new Audio("audio/music%20moonberrytales.mp3");
    gameMusic.loop = true;
    gameMusic.volume = SOUND_VOLUME;
    levelPassingSound = new Audio("audio/level-passing-sound.mp3");
    levelPassingSound.volume = SOUND_VOLUME;
}

/**
 * Binds first-user-interaction listeners required to start audio playback.
 *
 * @returns {void}
 */
function bindGameMusicUnlockEvents() {
    window.addEventListener("keydown", startGameMusic, { once: true });
    window.addEventListener("click", startGameMusic, { once: true });
}

/**
 * Starts background music when audio is enabled and allowed.
 *
 * @returns {void}
 */
function startGameMusic() {
    if (!gameMusic || isMusicMuted || hasBossDefeatAudioPlayed) {
        return;
    }
    gameMusic.play().catch(() => {});
}

/**
 * Stops and rewinds background music.
 *
 * @returns {void}
 */
function stopGameMusic() {
    if (!gameMusic) {
        return;
    }
    gameMusic.pause();
    gameMusic.currentTime = 0;
}

/**
 * Plays the level-passing sound effect from the beginning.
 *
 * @returns {void}
 */
function playLevelPassingSound() {
    if (!levelPassingSound) {
        return;
    }
    levelPassingSound.currentTime = 0;
    levelPassingSound.play().catch(() => {});
}

/**
 * Stops and rewinds the level-passing sound effect.
 *
 * @returns {void}
 */
function stopLevelPassingSound() {
    if (!levelPassingSound) {
        return;
    }
    levelPassingSound.pause();
    levelPassingSound.currentTime = 0;
}

/**
 * Registers audio reactions for boss defeat and game restart events.
 *
 * @returns {void}
 */
function setupBossDefeatAudioFlow() {
    window.addEventListener("boss-defeated", onBossDefeated);
    window.addEventListener("game-restarted", onGameRestarted);
}

/**
 * Handles boss defeat audio transition.
 *
 * @returns {void}
 */
function onBossDefeated() {
    if (hasBossDefeatAudioPlayed) return;
    hasBossDefeatAudioPlayed = true;
    stopGameMusic();
    playLevelPassingSound();
}

/**
 * Resets audio state when the run is restarted.
 *
 * @returns {void}
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
 * Checks if the current level is the configured final level.
 *
 * @returns {boolean} `true` if the current level matches `FINAL_LEVEL_ID`.
 */
function isFinalLevel() {
    return resolveCurrentLevelId() === FINAL_LEVEL_ID;
}

/**
 * Navigates home directly or starts final outro flow on final level completion.
 *
 * @returns {void}
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
 * Plays the final outro video and redirects home afterwards.
 *
 * @returns {void}
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
    applyFinalOutroAudioSettings(video);
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
 * Applies mute/volume settings to the final outro video element.
 *
 * @param {HTMLVideoElement|null} [targetVideo=null] - Optional pre-resolved video element.
 * @returns {void}
 */
function applyFinalOutroAudioSettings(targetVideo = null) {
    const video = targetVideo instanceof HTMLVideoElement
        ? targetVideo
        : document.querySelector(FINAL_OUTRO_VIDEO_SELECTOR);
    if (!(video instanceof HTMLVideoElement)) return;
    video.muted = isMusicMuted;
    video.volume = clampVolume(musicVolume);
}

/**
 * Stops and resets final outro video UI state.
 *
 * @returns {void}
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
 * Redirects from game view to the configured home target.
 *
 * @returns {void}
 */
function redirectToHomeAfterOutro() {
    window.location.href = FINAL_OUTRO_TARGET;
}

window.navigateHomeFromGame = navigateHomeFromGame;

/**
 * Initializes the in-game audio toggle menu.
 *
 * @returns {void}
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
 * Resolves DOM elements needed for audio toggle UI.
 *
 * @returns {MusicToggleState|null} Audio panel state or `null` if unavailable.
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
 * Updates labels and styles of music/SFX toggle controls.
 *
 * @param {MusicToggleState} state - Audio panel state.
 * @returns {void}
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
 * Binds panel open/close toggle to the audio button.
 *
 * @param {MusicToggleState} state - Audio panel state.
 * @returns {void}
 */
function bindMusicPanelToggle(state) {
    state.toggleButton.addEventListener("click", (event) => {
        event.stopPropagation();
        const isOpen = state.panelRoot.classList.toggle("is-open");
        state.toggleButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
}

/**
 * Closes the audio panel when clicking outside of it.
 *
 * @param {MusicToggleState} state - Audio panel state.
 * @returns {void}
 */
function bindMusicOutsideClose(state) {
    document.addEventListener("click", (event) => {
        if (state.panelRoot.contains(event.target)) return;
        state.panelRoot.classList.remove("is-open");
        state.toggleButton.setAttribute("aria-expanded", "false");
    });
}

/**
 * Binds music and SFX mute buttons.
 *
 * @param {MusicToggleState} state - Audio panel state.
 * @returns {void}
 */
function bindMusicButtons(state) {
    state.musicToggle.addEventListener("click", () => toggleMusicMute(state.updateButtonState));
    state.sfxToggle.addEventListener("click", () => toggleSfxMute(state.updateButtonState));
}

/**
 * Toggles music mute state and refreshes audio/UI.
 *
 * @param {Function} updateButtonState - UI refresh callback.
 * @returns {void}
 */
function toggleMusicMute(updateButtonState) {
    isMusicMuted = !isMusicMuted;
    persistMuteState();
    applyMutePreferences();
    if (!isMusicMuted) startGameMusic();
    updateButtonState();
}

/**
 * Toggles SFX mute state and refreshes audio/UI.
 *
 * @param {Function} updateButtonState - UI refresh callback.
 * @returns {void}
 */
function toggleSfxMute(updateButtonState) {
    isSfxMuted = !isSfxMuted;
    persistMuteState();
    applyMutePreferences();
    updateButtonState();
}
