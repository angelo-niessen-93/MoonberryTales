/**
 * @file js/ui/game-ui-controls.js
 * @description Controls game overlays and buttons (info, pause/settings, fullscreen).
 */

/**
 * @typedef {Object} ControlsPopupElements
 * @property {HTMLElement} infoButton - Button that opens controls help.
 * @property {HTMLElement} popup - Controls popup container.
 * @property {HTMLElement} closeButton - Button that closes controls popup.
 */

/**
 * @typedef {Object} PausePopupElements
 * @property {HTMLElement} pauseButton - Pause toggle button.
 * @property {HTMLElement} popup - Pause popup container.
 * @property {HTMLElement} continueButton - Continue button.
 * @property {HTMLElement} settingsButton - Button opening pause settings.
 * @property {HTMLElement} homeButton - Button navigating back home.
 */

/**
 * @typedef {Object} PauseSettingsElements
 * @property {HTMLElement} popup - Pause settings popup container.
 * @property {HTMLInputElement} music - Music volume slider.
 * @property {HTMLInputElement} sfx - SFX volume slider.
 * @property {HTMLElement} close - Close button for settings popup.
 */

/**
 * @typedef {Object} PausePopupControls
 * @property {Function} openPopup - Opens pause popup.
 * @property {Function} closePopup - Closes pause and settings popups.
 * @property {Function} openSettings - Opens settings popup.
 * @property {Function} closeSettings - Closes settings popup.
 */

/**
 * @typedef {Object} FullscreenToggleState
 * @property {HTMLElement} button - Fullscreen toggle button.
 * @property {HTMLElement} wrapper - Wrapper element to fullscreen.
 * @property {boolean} exitRequestedByButton - Guard for user-triggered exits.
 * @property {Function} updateButtonState - Refreshes button visuals/labels.
 */

/**
 * Initializes the controls/help popup interactions.
 *
 * @returns {void}
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
 * Resolves required DOM elements for the controls/help popup.
 *
 * @returns {ControlsPopupElements|null} Popup element references or `null`.
 */
function getControlsPopupElements() {
    const infoButton = document.getElementById("info-toggle");
    const popup = document.getElementById("controls-popup");
    const closeButton = document.getElementById("controls-close");
    if (!infoButton || !popup || !closeButton) return null;
    return { infoButton, popup, closeButton };
}

/**
 * Shows or hides a popup element.
 *
 * @param {HTMLElement|null|undefined} popup - Target popup element.
 * @param {boolean} visible - Desired visibility state.
 * @returns {void}
 */
function setPopupVisible(popup, visible) {
    if (!popup) return;
    popup.classList.toggle("hidden", !visible);
}

/**
 * Closes a popup when its backdrop area is clicked.
 *
 * @param {HTMLElement} popup - Popup/backdrop element.
 * @param {Function} onClose - Callback that closes the popup.
 * @returns {void}
 */
function bindBackdropClose(popup, onClose) {
    popup.addEventListener("click", (event) => { if (event.target === popup) onClose(); });
}

/**
 * Registers Escape key handling for a close callback.
 *
 * @param {Function} onClose - Callback invoked on Escape.
 * @returns {void}
 */
function bindEscapeClose(onClose) {
    window.addEventListener("keydown", (event) => { if (event.key === "Escape") onClose(); });
}

/**
 * Initializes pause popup, pause settings popup, and related hotkeys.
 *
 * @returns {void}
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
 * Resolves required DOM elements for the pause popup.
 *
 * @returns {PausePopupElements|null} Pause popup element references or `null`.
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
 * Builds pause popup control callbacks.
 *
 * @param {HTMLElement} popup - Pause popup element.
 * @param {HTMLElement|null|undefined} settingsPopup - Pause settings popup element.
 * @returns {PausePopupControls} Control callbacks for popup handling.
 */
function createPausePopupControls(popup, settingsPopup) {
    const openPopup = () => { if (!canOpenPausePopup()) return; setGamePaused(true); setPopupVisible(popup, true); };
    const closePopup = () => { setPopupVisible(popup, false); setPopupVisible(settingsPopup, false); setGamePaused(false); };
    const openSettings = () => setPopupVisible(settingsPopup, true);
    const closeSettings = () => setPopupVisible(settingsPopup, false);
    return { openPopup, closePopup, openSettings, closeSettings };
}

/**
 * Resolves required DOM elements for pause settings.
 *
 * @returns {PauseSettingsElements|null} Pause settings element references or `null`.
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
 * Syncs settings sliders with current volume globals.
 *
 * @param {PauseSettingsElements|null} settings - Pause settings elements.
 * @returns {void}
 */
function syncPauseSettingsSliders(settings) {
    if (!settings) return;
    settings.music.value = String(musicVolume);
    settings.sfx.value = String(sfxVolume);
}

/**
 * Returns whether pause popup can be opened in the current game state.
 *
 * @returns {boolean} `true` if game is neither over nor in victory state.
 */
function canOpenPausePopup() {
    return !(world?.isGameOver || world?.isVictory);
}

/**
 * Binds click handlers for pause popup buttons.
 *
 * @param {PausePopupElements} elements - Pause popup elements.
 * @param {PausePopupControls} controls - Pause popup controls.
 * @returns {void}
 */
function bindPausePopupButtons(elements, controls) {
    elements.pauseButton.addEventListener("click", controls.openPopup);
    elements.continueButton.addEventListener("click", controls.closePopup);
    elements.settingsButton.addEventListener("click", controls.openSettings);
    elements.homeButton.addEventListener("click", () => navigateHomeFromGame());
}

/**
 * Handles Escape behavior for pause and settings popups.
 *
 * @param {HTMLElement} popup - Pause popup element.
 * @param {HTMLElement|null|undefined} settingsPopup - Settings popup element.
 * @param {PausePopupControls} controls - Pause popup controls.
 * @returns {void}
 */
function bindPauseEscapeToggle(popup, settingsPopup, controls) {
    window.addEventListener("keydown", (event) => {
        if (event.key !== "Escape" || isControlsPopupVisible()) return;
        if (isPauseSettingsOpen(settingsPopup)) return controls.closeSettings();
        if (popup.classList.contains("hidden")) controls.openPopup(); else controls.closePopup();
    });
}

/**
 * Returns whether the pause settings popup is currently open.
 *
 * @param {HTMLElement|null|undefined} settingsPopup - Settings popup element.
 * @returns {boolean} `true` if settings popup is visible.
 */
function isPauseSettingsOpen(settingsPopup) {
    if (!settingsPopup) return false;
    return !settingsPopup.classList.contains("hidden");
}

/**
 * Binds pause settings popup controls and slider input events.
 *
 * @param {PauseSettingsElements|null} settings - Pause settings elements.
 * @param {PausePopupControls} controls - Pause popup controls.
 * @returns {void}
 */
function bindPauseSettingsPopup(settings, controls) {
    if (!settings) return;
    settings.close.addEventListener("click", controls.closeSettings);
    bindBackdropClose(settings.popup, controls.closeSettings);
    settings.music.addEventListener("input", (event) => updateMusicVolume(event.target.value));
    settings.sfx.addEventListener("input", (event) => updateSfxVolume(event.target.value));
}

/**
 * Updates the persisted music volume.
 *
 * @param {number|string} value - Slider value.
 * @returns {void}
 */
function updateMusicVolume(value) {
    musicVolume = clampVolume(value);
    persistVolumeState();
    applyMutePreferences();
}

/**
 * Updates the persisted SFX volume.
 *
 * @param {number|string} value - Slider value.
 * @returns {void}
 */
function updateSfxVolume(value) {
    sfxVolume = clampVolume(value);
    persistVolumeState();
    applyMutePreferences();
}

/**
 * Returns whether the controls/help popup is currently visible.
 *
 * @returns {boolean} `true` if controls popup is open.
 */
function isControlsPopupVisible() {
    const controlsPopup = document.getElementById("controls-popup");
    return !!(controlsPopup && !controlsPopup.classList.contains("hidden"));
}

/**
 * Initializes fullscreen toggle behavior.
 *
 * @returns {void}
 */
function setupFullscreenToggle() {
    const state = getFullscreenToggleState();
    if (!state) return;
    bindFullscreenToggleClick(state);
    bindFullscreenChange(state);
    state.updateButtonState();
}

/**
 * Resolves fullscreen toggle state and helper callback.
 *
 * @returns {FullscreenToggleState|null} Fullscreen state object or `null`.
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
 * Updates fullscreen button label and visual state.
 *
 * @param {FullscreenToggleState} state - Fullscreen toggle state.
 * @returns {void}
 */
function updateFullscreenButtonState(state) {
    const isFullscreen = document.fullscreenElement === state.wrapper;
    state.button.style.opacity = isFullscreen ? "0.75" : "1";
    state.button.setAttribute("aria-label", isFullscreen ? "Vollbild beenden" : "Vollbild aktivieren");
}

/**
 * Binds click handler for fullscreen toggling.
 *
 * @param {FullscreenToggleState} state - Fullscreen toggle state.
 * @returns {void}
 */
function bindFullscreenToggleClick(state) {
    state.button.addEventListener("click", async () => {
        await toggleFullscreen(state);
        state.updateButtonState();
    });
}

/**
 * Toggles fullscreen mode for the game wrapper.
 *
 * @param {FullscreenToggleState} state - Fullscreen toggle state.
 * @returns {Promise<void>}
 */
async function toggleFullscreen(state) {
    try {
        if (document.fullscreenElement === state.wrapper) return await exitFullscreenFromButton(state);
        await state.wrapper.requestFullscreen();
    } catch (_) {}
}

/**
 * Exits fullscreen and flags the action as button-triggered.
 *
 * @param {FullscreenToggleState} state - Fullscreen toggle state.
 * @returns {Promise<void>}
 */
async function exitFullscreenFromButton(state) {
    state.exitRequestedByButton = true;
    await document.exitFullscreen();
}

/**
 * Binds fullscreenchange handling and restores fullscreen if needed.
 *
 * @param {FullscreenToggleState} state - Fullscreen toggle state.
 * @returns {void}
 */
function bindFullscreenChange(state) {
    document.addEventListener("fullscreenchange", async () => {
        await restoreFullscreenIfNeeded(state);
        state.exitRequestedByButton = false;
        state.updateButtonState();
    });
}

/**
 * Restores fullscreen when it was exited unexpectedly.
 *
 * @param {FullscreenToggleState} state - Fullscreen toggle state.
 * @returns {Promise<void>}
 */
async function restoreFullscreenIfNeeded(state) {
    if (document.fullscreenElement || state.exitRequestedByButton) return;
    try { await state.wrapper.requestFullscreen(); } catch (_) {}
}
