/**
 * @file models/world-runtime.class.js
 * @description Runtime extensions for `World` (restart flow, sounds, and leaderboard persistence).
 */

/**
 * @typedef {Object} LeaderboardEntry
 * @property {string} name - Player name.
 * @property {string} result - Localized run result text.
 * @property {number} coins - Collected coins.
 * @property {number} duration - Run duration in seconds.
 * @property {number} score - Calculated leaderboard score.
 * @property {string} playedAt - ISO timestamp.
 */

/**
 * Restarts the game world and dispatches the `game-restarted` event.
 *
 * @returns {void}
 */
World.prototype.restartGame = function() {
    this.disposeEntity(this.character);
    this.enemies.forEach((enemy) => this.disposeEntity(enemy));
    this.resetRunState();
    this.resetKeyboardState();
    this.rebuildWorldState();
    this.setCanvasCursor("default");
    this.setWorld();
    window.dispatchEvent(new Event("game-restarted"));
};

/**
 * Resets runtime flags and run-tracking values for a fresh session.
 *
 * @returns {void}
 */
World.prototype.resetRunState = function() {
    this.isGameOver = false;
    this.isVictory = false;
    this.isVictoryPending = false;
    this.victoryReadyAt = 0;
    this.bossDefeatEventDispatched = false;
    this.projectiles = [];
    this.enemyProjectiles = [];
    this.runStartedAt = Date.now();
    this.resultSavedForRun = false;
};

/**
 * Rebuilds world objects that are recreated on restart.
 *
 * @returns {void}
 */
World.prototype.rebuildWorldState = function() {
    this.hud = new HUD();
    this.character = this.createCharacter();
    this.level = this.createLevel();
    this.applyLevelData();
};

/**
 * Disposes an entity if it exposes a `dispose` function.
 *
 * @param {{dispose: (Function|undefined)}|null|undefined} entity - Entity to clean up.
 * @returns {void}
 */
World.prototype.disposeEntity = function(entity) {
    if (entity && typeof entity.dispose === "function") {
        entity.dispose();
    }
};

/**
 * Clears all tracked keyboard input flags.
 *
 * @returns {void}
 */
World.prototype.resetKeyboardState = function() {
    if (!this.keyboard) {
        return;
    }
    this.keyboard.LEFT = false;
    this.keyboard.RIGHT = false;
    this.keyboard.UP = false;
    this.keyboard.DOWN = false;
    this.keyboard.SPACE = false;
    this.keyboard.SHIFT = false;
};

/**
 * Plays the coin-collect sound effect.
 *
 * @returns {void}
 */
World.prototype.playCoinCollectSound = function() {
    if (!this.coinCollectSound) {
        return;
    }
    this.coinCollectSound.currentTime = 0;
    this.coinCollectSound.play().catch(() => {});
};

/**
 * Plays the heart-collect sound effect.
 *
 * @returns {void}
 */
World.prototype.playHeartCollectSound = function() {
    if (!this.heartCollectSound) {
        return;
    }
    this.heartCollectSound.currentTime = 0;
    this.heartCollectSound.play().catch(() => {});
};

/**
 * Plays the game-over sound effect.
 *
 * @returns {void}
 */
World.prototype.playGameOverSound = function() {
    if (!this.gameOverSound) {
        return;
    }
    this.gameOverSound.currentTime = 0;
    this.gameOverSound.play().catch(() => {});
};

/**
 * Persists one run result in localStorage (once per run).
 *
 * @param {"victory"|"defeat"|string} resultType - Run outcome identifier.
 * @returns {void}
 */
World.prototype.saveRunResult = function(resultType) {
    if (this.resultSavedForRun) return;
    this.resultSavedForRun = true;
    const newEntry = this.buildRunEntry(resultType);
    try {
        const raw = localStorage.getItem("moonberryLeaderboard");
        const list = raw ? JSON.parse(raw) : [];
        const sorted = this.getSortedLeaderboard(list, newEntry);
        localStorage.setItem("moonberryLeaderboard", JSON.stringify(sorted.slice(0, 10)));
    } catch (_) {}
};

/**
 * Builds a leaderboard entry object from current run data.
 *
 * @param {"victory"|"defeat"|string} resultType - Run outcome identifier.
 * @returns {LeaderboardEntry} New leaderboard entry.
 */
World.prototype.buildRunEntry = function(resultType) {
    const coins = Number.isFinite(this.hud?.coinsCollected) ? this.hud.coinsCollected : 0;
    const duration = Math.max(1, Math.round((Date.now() - this.runStartedAt) / 1000));
    const score = this.calculateRunScore(coins, duration, resultType);
    return {
        name: this.character?.constructor?.name || "Abenteurer",
        result: resultType === "victory" ? "Sieg" : "Niederlage",
        coins,
        duration,
        score,
        playedAt: new Date().toISOString()
    };
};

/**
 * Calculates a score value for one run.
 *
 * @param {number} coins - Collected coins.
 * @param {number} duration - Run duration in seconds.
 * @param {"victory"|"defeat"|string} resultType - Run outcome identifier.
 * @returns {number} Calculated score.
 */
World.prototype.calculateRunScore = function(coins, duration, resultType) {
    const victoryBonus = resultType === "victory" ? 5000 : 0;
    return Math.max(0, coins * 100 + victoryBonus - duration * 2);
};

/**
 * Returns a sorted leaderboard list including a new entry.
 *
 * @param {Array<LeaderboardEntry>} list - Existing leaderboard entries.
 * @param {LeaderboardEntry} newEntry - Entry to append before sorting.
 * @returns {Array<LeaderboardEntry>} Sorted leaderboard entries.
 */
World.prototype.getSortedLeaderboard = function(list, newEntry) {
    const safeList = Array.isArray(list) ? list : [];
    safeList.push(newEntry);
    safeList.sort((a, b) => this.compareLeaderboardEntries(a, b));
    return safeList;
};

/**
 * Comparator for leaderboard sorting (score desc, duration asc).
 *
 * @param {LeaderboardEntry} a - First entry.
 * @param {LeaderboardEntry} b - Second entry.
 * @returns {number} Comparison result.
 */
World.prototype.compareLeaderboardEntries = function(a, b) {
    const scoreDiff = (Number(b.score) || 0) - (Number(a.score) || 0);
    if (scoreDiff !== 0) return scoreDiff;
    return (Number(a.duration) || 0) - (Number(b.duration) || 0);
};
