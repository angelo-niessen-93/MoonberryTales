/**
 * @file home-leaderboard.js
 * @description Provides helper utilities for reading, sorting, and rendering
 * leaderboard data on the home screen, plus localStorage-based UI preferences.
 */
(function attachHomeLeaderboardHelpers() {
  /**
   * Formats a duration in seconds as a `MM:SS` string.
   *
   * @param {number} totalSeconds - Duration value in seconds.
   * @returns {string} The formatted duration.
   */
  function formatDuration(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  /**
   * Sorts leaderboard entries by score (descending) and duration (ascending),
   * while filtering out entries with the name "Angelo".
   *
   * @param {Array<Object>} entries - Raw leaderboard entries.
   * @returns {Array<Object>} A sorted, filtered copy of entries.
   */
  function sortLeaderboard(entries) {
    const safeEntries = (Array.isArray(entries) ? entries : []).filter(
      (entry) => entry?.name !== "Angelo"
    );
    safeEntries.sort((a, b) => {
      const scoreDiff = (Number(b.score) || 0) - (Number(a.score) || 0);
      if (scoreDiff !== 0) return scoreDiff;
      return (Number(a.duration) || 0) - (Number(b.duration) || 0);
    });
    return safeEntries;
  }

  /**
   * Loads leaderboard entries from localStorage.
   *
   * @param {string} storageKey - localStorage key that stores leaderboard data.
   * @returns {Array<Object>} Parsed entry list or an empty array on failure.
   */
  function loadLeaderboardEntries(storageKey) {
    try {
      const raw = localStorage.getItem(storageKey);
      const entries = raw ? JSON.parse(raw) : [];
      return Array.isArray(entries) ? entries : [];
    } catch (_) {
      return [];
    }
  }

  /**
   * Checks whether a fixed entry already exists in a list.
   *
   * @param {Array<Object>} entries - Existing leaderboard entries.
   * @param {Object} fixedEntry - Entry that must be present.
   * @param {string} fixedEntry.name - Player name.
   * @param {string} fixedEntry.result - Match result text.
   * @param {number} fixedEntry.coins - Collected coin amount.
   * @param {number} fixedEntry.duration - Duration in seconds.
   * @returns {boolean} `true` if an equivalent entry exists.
   */
  function hasFixedPlayerEntry(entries, fixedEntry) {
    return entries.some((entry) =>
      entry &&
      entry.name === fixedEntry.name &&
      entry.result === fixedEntry.result &&
      Number(entry.coins) === fixedEntry.coins &&
      Number(entry.duration) === fixedEntry.duration
    );
  }

  /**
   * Normalizes leaderboard entry values and applies fallbacks.
   *
   * @param {Object} entry - Raw leaderboard entry.
   * @returns {{
   *   duration: number,
   *   coins: number,
   *   score: number,
   *   result: string,
   *   name: string
   * }} Safe entry values for rendering.
   */
  function getLeaderboardEntryValues(entry) {
    return {
      duration: Number.isFinite(entry.duration) ? entry.duration : 0,
      coins: Number.isFinite(entry.coins) ? entry.coins : 0,
      score: Number.isFinite(entry.score) ? entry.score : 0,
      result: entry.result || "-",
      name: entry.name || "Unbekannt"
    };
  }

  /**
   * Creates the HTML markup string for one leaderboard list item.
   *
   * @param {Object} entry - Leaderboard entry.
   * @param {number} index - Zero-based position in the rendered list.
   * @returns {string} Markup for the list item content.
   */
  function getLeaderboardItemMarkup(entry, index) {
    const safe = getLeaderboardEntryValues(entry);
    return `
        <span class="leaderboard-rank">${index + 1}</span>
        <span class="leaderboard-main"><span class="leaderboard-name">${safe.name}</span><span class="leaderboard-meta">${safe.result} | ${safe.coins} Coins | ${formatDuration(safe.duration)}</span></span>
        <span class="leaderboard-score">${safe.score}</span>
      `;
  }

  /**
   * Builds a leaderboard `<li>` element for a single entry.
   *
   * @param {Object} entry - Leaderboard entry.
   * @param {number} index - Zero-based position in the rendered list.
   * @returns {HTMLLIElement} Renderable leaderboard list item.
   */
  function buildLeaderboardItem(entry, index) {
    const item = document.createElement("li");
    item.className = "leaderboard-item";
    item.innerHTML = getLeaderboardItemMarkup(entry, index);
    return item;
  }

  /**
   * Checks whether a supported level value is present in the URL query.
   *
   * @returns {boolean} `true` if query includes level1/level2 (or 1/2).
   */
  function hasLevelSelectionInQuery() {
    const level = new URLSearchParams(window.location.search).get("level");
    return level === "2" || String(level).toLowerCase() === "level2" || level === "1" || String(level).toLowerCase() === "level1";
  }

  window.HomeLeaderboard = {
    /**
     * Ensures a fixed entry exists, then stores the top 10 sorted entries.
     *
     * @param {string} storageKey - localStorage key for leaderboard entries.
     * @param {{
     *   name: string,
     *   result: string,
     *   coins: number,
     *   duration: number,
     *   score: (number|undefined)
     * }} fixedEntry - Entry to insert if missing.
     * @returns {void}
     */
    ensureFixedPlayerEntry(storageKey, fixedEntry) {
      const safeEntries = loadLeaderboardEntries(storageKey);
      if (!hasFixedPlayerEntry(safeEntries, fixedEntry)) safeEntries.push({ ...fixedEntry });
      const sorted = sortLeaderboard(safeEntries).slice(0, 10);
      localStorage.setItem(storageKey, JSON.stringify(sorted));
    },

    /**
     * Renders up to 10 leaderboard entries into the target list.
     *
     * @param {string} storageKey - localStorage key for leaderboard entries.
     * @param {HTMLElement} leaderboardList - Container list element.
     * @param {HTMLElement} leaderboardEmpty - Empty-state element to toggle.
     * @returns {void}
     */
    renderLeaderboard(storageKey, leaderboardList, leaderboardEmpty) {
      if (!leaderboardList || !leaderboardEmpty) return;
      const entries = sortLeaderboard(loadLeaderboardEntries(storageKey));
      leaderboardList.innerHTML = "";
      if (entries.length === 0) {
        leaderboardEmpty.classList.remove("hidden");
        return;
      }
      leaderboardEmpty.classList.add("hidden");
      entries.slice(0, 10).forEach((entry, index) => leaderboardList.appendChild(buildLeaderboardItem(entry, index)));
    },

    /**
     * Reads whether mobile controls are enabled from localStorage.
     *
     * @param {string} storageKey - localStorage key for mobile controls flag.
     * @returns {boolean} `true` unless the stored value is `"0"`.
     */
    areMobileControlsEnabled(storageKey) {
      return localStorage.getItem(storageKey) !== "0";
    },

    /**
     * Synchronizes a checkbox/toggle state with persisted preference.
     *
     * @param {HTMLInputElement} toggle - Checkbox-like input element.
     * @param {string} storageKey - localStorage key for mobile controls flag.
     * @returns {void}
     */
    syncMobileControlsToggle(toggle, storageKey) {
      if (!toggle) return;
      toggle.checked = this.areMobileControlsEnabled(storageKey);
    },

    /**
     * Stores the mobile controls preference.
     *
     * @param {string} storageKey - localStorage key for mobile controls flag.
     * @param {boolean} enabled - Preference to persist.
     * @returns {void}
     */
    updateMobileControlsPreference(storageKey, enabled) {
      localStorage.setItem(storageKey, enabled ? "1" : "0");
    },

    /**
     * Applies level selection from URL query (`level=1|2|level1|level2`) to storage.
     *
     * @param {string} storageKey - localStorage key for level selection.
     * @returns {void}
     */
    applyLevelSelectionFromQuery(storageKey) {
      const level = new URLSearchParams(window.location.search).get("level");
      if (level === "2" || String(level).toLowerCase() === "level2") localStorage.setItem(storageKey, "level2");
      if (level === "1" || String(level).toLowerCase() === "level1") localStorage.setItem(storageKey, "level1");
    },

    /**
     * Sets default level selection to `level1` unless query provides a level.
     *
     * @param {string} storageKey - localStorage key for level selection.
     * @returns {void}
     */
    ensureDefaultLevelSelection(storageKey) {
      if (hasLevelSelectionInQuery()) return;
      localStorage.setItem(storageKey, "level1");
    }
  };
})();
