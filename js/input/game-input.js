/**
 * @file js/input/game-input.js
 * @description Handles keyboard and mobile touch input for movement and attacks.
 */

/**
 * @typedef {Object} TouchContext
 * @property {Map<number, ("left"|"right"|"up")>} activeTouchZones - Active zones by touch identifier.
 * @property {Function} applyKeyboardState - Applies current touch zones to the shared keyboard state.
 * @property {Function} detectZone - Detects the control zone for a touch.
 */

/**
 * Initializes mobile touch controls for movement and attack input.
 *
 * @returns {void}
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
 * Resolves required DOM elements for mobile controls.
 *
 * @returns {{touchControl: HTMLElement, attackControl: HTMLElement}|null}
 * Element references, or `null` if controls are not available.
 */
function getMobileControlElements() {
    const touchControl = document.getElementById("mobile-arrows-control");
    const attackControl = document.getElementById("mobile-attack-control");
    if (!touchControl || !attackControl) return null;
    return { touchControl, attackControl };
}

/**
 * Creates touch interaction state and helper callbacks.
 *
 * @param {HTMLElement} touchControl - Element used for directional touch input.
 * @returns {TouchContext} Runtime context used by touch event handlers.
 */
function createTouchContext(touchControl) {
    const activeTouchZones = new Map();
    const applyKeyboardState = () => applyTouchKeyboardState(activeTouchZones);
    const detectZone = (touch) => detectTouchZone(touchControl, touch);
    return { activeTouchZones, applyKeyboardState, detectZone };
}

/**
 * Detects which movement zone a touch belongs to.
 *
 * @param {HTMLElement} touchControl - Element containing the movement zones.
 * @param {Touch} touch - Current touch point.
 * @returns {"left"|"right"|"up"|null} The detected zone, or `null` if outside.
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
 * Synchronizes movement keys from currently active touch zones.
 *
 * @param {Map<number, ("left"|"right"|"up")>} activeTouchZones - Active zones by touch id.
 * @returns {void}
 */
function applyTouchKeyboardState(activeTouchZones) {
    const zones = Array.from(activeTouchZones.values());
    keyboard.LEFT = zones.includes("left");
    keyboard.RIGHT = zones.includes("right");
    keyboard.UP = zones.includes("up");
}

/**
 * Binds touch listeners for movement controls.
 *
 * @param {HTMLElement} touchControl - Element receiving movement touch events.
 * @param {TouchContext} context - Shared touch state and helper callbacks.
 * @returns {void}
 */
function bindTouchMoveEvents(touchControl, context) {
    touchControl.addEventListener("touchstart", (event) => onTouchStart(event, context), { passive: false });
    touchControl.addEventListener("touchmove", (event) => onTouchMove(event, context), { passive: false });
    touchControl.addEventListener("touchend", (event) => onTouchEnd(event, context), { passive: false });
    touchControl.addEventListener("touchcancel", (event) => onTouchEnd(event, context), { passive: false });
}

/**
 * Handles touch start events for movement controls.
 *
 * @param {TouchEvent} event - Browser touch event.
 * @param {TouchContext} context - Shared touch state and helper callbacks.
 * @returns {void}
 */
function onTouchStart(event, context) {
    event.preventDefault();
    updateTouchZones(event.changedTouches, context, true);
    context.applyKeyboardState();
}

/**
 * Handles touch move events for movement controls.
 *
 * @param {TouchEvent} event - Browser touch event.
 * @param {TouchContext} context - Shared touch state and helper callbacks.
 * @returns {void}
 */
function onTouchMove(event, context) {
    event.preventDefault();
    updateTouchZones(event.changedTouches, context, false);
    context.applyKeyboardState();
}

/**
 * Updates tracked touch zones based on changed touches.
 *
 * @param {TouchList} changedTouches - Touch points that changed in this event.
 * @param {TouchContext} context - Shared touch state and helper callbacks.
 * @param {boolean} keepPreviousZoneOnNull - Keeps old zone when current zone resolves to `null`.
 * @returns {void}
 */
function updateTouchZones(changedTouches, context, keepPreviousZoneOnNull) {
    for (const touch of changedTouches) {
        const zone = context.detectZone(touch);
        if (zone) context.activeTouchZones.set(touch.identifier, zone);
        if (!zone && !keepPreviousZoneOnNull) context.activeTouchZones.delete(touch.identifier);
    }
}

/**
 * Handles touch end/cancel events for movement controls.
 *
 * @param {TouchEvent} event - Browser touch event.
 * @param {TouchContext} context - Shared touch state and helper callbacks.
 * @returns {void}
 */
function onTouchEnd(event, context) {
    event.preventDefault();
    for (const touch of event.changedTouches) context.activeTouchZones.delete(touch.identifier);
    context.applyKeyboardState();
}

/**
 * Binds touch/pointer listeners for the mobile attack button.
 *
 * @param {HTMLElement} attackControl - Element receiving attack input.
 * @returns {void}
 */
function bindAttackEvents(attackControl) {
    attackControl.addEventListener("touchstart", (event) => setAttackPressed(true, event), { passive: false });
    attackControl.addEventListener("touchend", (event) => setAttackPressed(false, event), { passive: false });
    attackControl.addEventListener("touchcancel", (event) => setAttackPressed(false, event), { passive: false });
    attackControl.addEventListener("pointerdown", (event) => { event.preventDefault(); setAttackPressed(true); });
    ["pointerup", "pointerleave", "pointercancel"].forEach((type) => attackControl.addEventListener(type, () => setAttackPressed(false)));
}

/**
 * Updates the attack key state.
 *
 * @param {boolean} pressed - Whether attack should be active.
 * @param {Event} [event] - Optional source event to cancel default behavior.
 * @returns {void}
 */
function setAttackPressed(pressed, event) {
    if (event) event.preventDefault();
    keyboard.SPACE = pressed;
}

/**
 * Resets touch/attack keyboard state when the window loses focus.
 *
 * @param {TouchContext} context - Shared touch state and helper callbacks.
 * @returns {void}
 */
function bindTouchBlurReset(context) {
    window.addEventListener("blur", () => {
        context.activeTouchZones.clear();
        keyboard.SPACE = false;
        context.applyKeyboardState();
    });
}

window.addEventListener("keydown", (e) => {
    if (isGamePaused) return;
    if (e.key === "ArrowLeft") keyboard.LEFT = true;
    if (e.key === "ArrowRight") keyboard.RIGHT = true;
    if (e.key === "ArrowUp") keyboard.UP = true;
    if (e.key === "ArrowDown") keyboard.DOWN = true;
    if (e.key === " ") keyboard.SPACE = true;
    if (e.key === "Shift") keyboard.SHIFT = true;
});

window.addEventListener("keyup", (e) => {
    if (isGamePaused) return;
    if (e.key === "ArrowLeft") keyboard.LEFT = false;
    if (e.key === "ArrowRight") keyboard.RIGHT = false;
    if (e.key === "ArrowUp") keyboard.UP = false;
    if (e.key === "ArrowDown") keyboard.DOWN = false;
    if (e.key === " ") keyboard.SPACE = false;
    if (e.key === "Shift") keyboard.SHIFT = false;
});
