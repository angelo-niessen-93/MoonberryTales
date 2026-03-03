/**
 * @file home.js
 */
document.addEventListener("DOMContentLoaded", () => {
  const LEADERBOARD_KEY = "moonberryLeaderboard";
  const FIXED_PLAYER_ENTRY = {
    name: "Knight",
    result: "Sieg",
    coins: 16,
    duration: 60,
    score: 16 * 100 + 5000 - 60 * 2,
    playedAt: "2026-03-01T00:00:00.000Z"
  };

  const startButton = document.getElementById("start-button");
  const muteButton = document.getElementById("music-toggle");
  const mainMuteButton = document.getElementById("main-mute-toggle");
  const mobileControlsToggle = document.getElementById("mobile-controls-toggle");
  const audioSettingsPopup = document.getElementById("home-audio-settings-popup");
  const musicVolumeControl = document.getElementById("home-music-volume");
  const sfxVolumeControl = document.getElementById("home-sfx-volume");
  const audioCloseButton = document.getElementById("home-audio-close");
  const popup = document.getElementById("character-popup");
  const characters = document.querySelectorAll(".character");
  const mainMenuMusic = document.getElementById("main-menu-music");
  const leaderboardList = document.getElementById("leaderboard-list");
  const leaderboardEmpty = document.getElementById("leaderboard-empty");
  const leaderboardPanel = document.getElementById("leaderboard-panel");
  const leaderboardButton = document.getElementById("leaderboard-button");
  const leaderboardClose = document.getElementById("leaderboard-close");
  const homeLayout = document.querySelector(".home-layout");
  const mainTitleLogo = document.getElementById("main-title-logo");

  const frameDelay = 160;

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
  const characterSprites = {
    Knight: [
      "./img/Knight/Idle/knight_idle1.png",
      "./img/Knight/Idle/knight_idle2.png",
      "./img/Knight/Idle/knight_idle3.png",
      "./img/Knight/Idle/knight_idle4.png",
      "./img/Knight/Idle/knight_idle5.png",
      "./img/Knight/Idle/knight_idle6.png",
      "./img/Knight/Idle/knight_idle7.png",
      "./img/Knight/Idle/knight_idle8.png",
      "./img/Knight/Idle/knight_idle9.png",
      "./img/Knight/Idle/knight_idle10.png",
      "./img/Knight/Idle/knight_idle11.png",
      "./img/Knight/Idle/knight_idle12.png"
    ],
    Mage: [
      "./img/Mage/Idle/mage_idle1.png",
      "./img/Mage/Idle/mage_idle2.png",
      "./img/Mage/Idle/mage_idle3.png",
      "./img/Mage/Idle/mage_idle4.png",
      "./img/Mage/Idle/mage_idle5.png",
      "./img/Mage/Idle/mage_idle6.png",
      "./img/Mage/Idle/mage_idle7.png",
      "./img/Mage/Idle/mage_idle8.png",
      "./img/Mage/Idle/mage_idle9.png",
      "./img/Mage/Idle/mage_idle10.png",
      "./img/Mage/Idle/mage_idle11.png",
      "./img/Mage/Idle/mage_idle12.png",
      "./img/Mage/Idle/mage_idle13.png",
      "./img/Mage/Idle/mage_idle14.png"
    ],
    Rogue: [
      "./img/Rogue/Idle/rogue_idle1.png",
      "./img/Rogue/Idle/rogue_idle2.png",
      "./img/Rogue/Idle/rogue_idle3.png",
      "./img/Rogue/Idle/rogue_idle4.png",
      "./img/Rogue/Idle/rogue_idle5.png",
      "./img/Rogue/Idle/rogue_idle6.png",
      "./img/Rogue/Idle/rogue_idle7.png",
      "./img/Rogue/Idle/rogue_idle8.png",
      "./img/Rogue/Idle/rogue_idle9.png",
      "./img/Rogue/Idle/rogue_idle10.png",
      "./img/Rogue/Idle/rogue_idle11.png",
      "./img/Rogue/Idle/rogue_idle12.png",
      "./img/Rogue/Idle/rogue_idle13.png",
      "./img/Rogue/Idle/rogue_idle14.png",
      "./img/Rogue/Idle/rogue_idle15.png",
      "./img/Rogue/Idle/rogue_idle16.png",
      "./img/Rogue/Idle/rogue_idle17.png",
      "./img/Rogue/Idle/rogue_idle18.png"
    ]
  };

  const MUSIC_MUTE_KEY = "gameMusicMuted";
  const SFX_MUTE_KEY = "gameSfxMuted";
  const MUSIC_VOLUME_KEY = "gameMusicVolume";
  const SFX_VOLUME_KEY = "gameSfxVolume";
  const MOBILE_CONTROLS_KEY = "mobileControlsEnabled";
  const LEGACY_MUTE_KEY = "gameMuted";
  const legacyMuted = localStorage.getItem(LEGACY_MUTE_KEY) === "1";
  const storedMusicMuted = localStorage.getItem(MUSIC_MUTE_KEY);
  const storedSfxMuted = localStorage.getItem(SFX_MUTE_KEY);
  const storedMusicVolume = Number.parseFloat(localStorage.getItem(MUSIC_VOLUME_KEY));
  const storedSfxVolume = Number.parseFloat(localStorage.getItem(SFX_VOLUME_KEY));
  let musicVolume = Number.isFinite(storedMusicVolume) ? Math.max(0, Math.min(1, storedMusicVolume)) : 0.5;
  let sfxVolume = Number.isFinite(storedSfxVolume) ? Math.max(0, Math.min(1, storedSfxVolume)) : 0.5;
  let isMusicMuted = storedMusicMuted !== null ? storedMusicMuted === "1" : legacyMuted;
  let isSfxMuted = storedSfxMuted !== null ? storedSfxMuted === "1" : legacyMuted;

  /**
   * Runs applyVolume.
   * @param {*} value
   */
  function applyVolume(value) {
    const volume = Number.parseFloat(value);
    if (!Number.isNaN(volume) && mainMenuMusic) {
      mainMenuMusic.volume = isMusicMuted ? 0 : volume;
    }
  }

  /**
   * Runs tryStartMainMenuMusic.
   */
  function tryStartMainMenuMusic() {
    if (!mainMenuMusic || isMusicMuted) {
      return;
    }
    mainMenuMusic.play().catch(() => {});
  }

  /**
   * Runs setupMusicUnlockOnFirstInteraction.
   */
  function setupMusicUnlockOnFirstInteraction() {
    const unlockAudio = () => {
      tryStartMainMenuMusic();
      document.removeEventListener("click", unlockAudio);
      document.removeEventListener("touchstart", unlockAudio);
      document.removeEventListener("keydown", unlockAudio);
    };

    document.addEventListener("click", unlockAudio, { once: true, passive: true });
    document.addEventListener("touchstart", unlockAudio, { once: true, passive: true });
    document.addEventListener("keydown", unlockAudio, { once: true });
  }

  /**
   * Runs persistAudioSettings.
   */
  function persistAudioSettings() {
    localStorage.setItem(MUSIC_MUTE_KEY, isMusicMuted ? "1" : "0");
    localStorage.setItem(SFX_MUTE_KEY, isSfxMuted ? "1" : "0");
    localStorage.setItem(LEGACY_MUTE_KEY, isMusicMuted ? "1" : "0");
    localStorage.setItem(MUSIC_VOLUME_KEY, String(musicVolume));
    localStorage.setItem(SFX_VOLUME_KEY, String(sfxVolume));
  }

  /**
   * Runs updateAudioButtonState.
   */
  function updateAudioButtonState() {
    if (!muteButton) return;
    const allMuted = (isMusicMuted || musicVolume === 0) && (isSfxMuted || sfxVolume === 0);
    muteButton.classList.toggle("is-muted", allMuted);
    muteButton.setAttribute("aria-label", allMuted ? "Audio-Menü (alles stumm)" : "Audio-Menü öffnen");
    updateMainMuteButtonState();
  }

  /**
   * Runs updateMainMuteButtonState.
   */
  function updateMainMuteButtonState() {
    if (!mainMuteButton) return;
    const allMuted = isMusicMuted && isSfxMuted;
    mainMuteButton.classList.toggle("is-muted", allMuted);
    mainMuteButton.setAttribute("aria-pressed", allMuted ? "true" : "false");
    mainMuteButton.setAttribute("aria-label", allMuted ? "Global stumm deaktivieren" : "Global stumm aktivieren");
  }

  /**
   * Runs toggleAllAudioMute.
   */
  function toggleAllAudioMute() {
    const nextMuted = !(isMusicMuted && isSfxMuted);
    isMusicMuted = nextMuted;
    isSfxMuted = nextMuted;
    applyVolume(musicVolume);
    persistAudioSettings();
    updateAudioButtonState();
    if (!nextMuted) tryStartMainMenuMusic();
  }

  /**
   * Runs formatDuration.
   * @param {*} totalSeconds
   */
  function formatDuration(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  /**
   * Runs sortLeaderboard.
   * @param {*} entries
   */
  function sortLeaderboard(entries) {
    const safeEntries = (Array.isArray(entries) ? entries : []).filter(
      (entry) => entry?.name !== "Angelo"
    );
    safeEntries.sort((a, b) => {
      const scoreDiff = (Number(b.score) || 0) - (Number(a.score) || 0);
      if (scoreDiff !== 0) {
        return scoreDiff;
      }
      return (Number(a.duration) || 0) - (Number(b.duration) || 0);
    });
    return safeEntries;
  }

  /**
   * Runs ensureFixedPlayerEntry.
   */
  function ensureFixedPlayerEntry() {
    const safeEntries = loadLeaderboardEntries();
    if (!hasFixedPlayerEntry(safeEntries)) safeEntries.push({ ...FIXED_PLAYER_ENTRY });
    const sorted = sortLeaderboard(safeEntries).slice(0, 10);
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(sorted));
  }

  /**
   * Runs loadLeaderboardEntries.
   */
  function loadLeaderboardEntries() {
    try {
      const raw = localStorage.getItem(LEADERBOARD_KEY);
      const entries = raw ? JSON.parse(raw) : [];
      return Array.isArray(entries) ? entries : [];
    } catch (_) { return []; }
  }

  /**
   * Runs hasFixedPlayerEntry.
   * @param {*} entries
   */
  function hasFixedPlayerEntry(entries) {
    return entries.some((entry) =>
      entry &&
      entry.name === FIXED_PLAYER_ENTRY.name &&
      entry.result === FIXED_PLAYER_ENTRY.result &&
      Number(entry.coins) === FIXED_PLAYER_ENTRY.coins &&
      Number(entry.duration) === FIXED_PLAYER_ENTRY.duration
    );
  }

  /**
   * Runs renderLeaderboard.
   */
  function renderLeaderboard() {
    if (!leaderboardList || !leaderboardEmpty) return;
    const entries = sortLeaderboard(loadLeaderboardEntries());
    leaderboardList.innerHTML = "";
    if (entries.length === 0) return leaderboardEmpty.classList.remove("hidden");
    leaderboardEmpty.classList.add("hidden");
    entries.slice(0, 10).forEach((entry, index) => leaderboardList.appendChild(buildLeaderboardItem(entry, index)));
  }

  /**
   * Runs buildLeaderboardItem.
   * @param {*} entry
   * @param {*} index
   */
  function buildLeaderboardItem(entry, index) {
    const item = document.createElement("li");
    item.className = "leaderboard-item";
    item.innerHTML = getLeaderboardItemMarkup(entry, index);
    return item;
  }

  /**
   * Runs getLeaderboardItemMarkup.
   * @param {*} entry
   * @param {*} index
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
   * Runs getLeaderboardEntryValues.
   * @param {*} entry
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
   * Runs syncAudioSettingsControls.
   */
  function syncAudioSettingsControls() {
    if (musicVolumeControl) musicVolumeControl.value = String(musicVolume);
    if (sfxVolumeControl) sfxVolumeControl.value = String(sfxVolume);
  }

  /**
   * Runs openAudioSettingsPopup.
   */
  function openAudioSettingsPopup() {
    if (!audioSettingsPopup) return;
    syncAudioSettingsControls();
    audioSettingsPopup.classList.remove("hidden");
  }

  /**
   * Runs closeAudioSettingsPopup.
   */
  function closeAudioSettingsPopup() {
    if (!audioSettingsPopup) return;
    audioSettingsPopup.classList.add("hidden");
  }

  /**
   * Runs updateMusicVolume.
   * @param {*} value
   */
  function updateMusicVolume(value) {
    const nextVolume = Number.parseFloat(value);
    if (Number.isNaN(nextVolume)) return;
    musicVolume = Math.max(0, Math.min(1, nextVolume));
    if (musicVolume > 0) isMusicMuted = false;
    applyVolume(musicVolume);
    persistAudioSettings();
    updateAudioButtonState();
  }

  /**
   * Runs updateSfxVolume.
   * @param {*} value
   */
  function updateSfxVolume(value) {
    const nextVolume = Number.parseFloat(value);
    if (Number.isNaN(nextVolume)) return;
    sfxVolume = Math.max(0, Math.min(1, nextVolume));
    if (sfxVolume > 0) isSfxMuted = false;
    persistAudioSettings();
    updateAudioButtonState();
  }

  /**
   * Runs areMobileControlsEnabled.
   */
  function areMobileControlsEnabled() {
    return localStorage.getItem(MOBILE_CONTROLS_KEY) !== "0";
  }

  /**
   * Runs syncMobileControlsToggle.
   */
  function syncMobileControlsToggle() {
    if (!mobileControlsToggle) return;
    mobileControlsToggle.checked = areMobileControlsEnabled();
  }

  /**
   * Runs updateMobileControlsPreference.
   * @param {*} enabled
   */
  function updateMobileControlsPreference(enabled) {
    localStorage.setItem(MOBILE_CONTROLS_KEY, enabled ? "1" : "0");
  }

  applyVolume(musicVolume);
  persistAudioSettings();
  updateAudioButtonState();
  tryStartMainMenuMusic();
  setupMusicUnlockOnFirstInteraction();
  syncAudioSettingsControls();
  syncMobileControlsToggle();

  const timers = [];

  /**
   * Runs setFirstFrame.
   */
  function setFirstFrame() {
    characters.forEach((char) => {
      const type = char.dataset.character;
      const frames = characterSprites[type];
      if (frames && frames.length > 0) {
        char.style.backgroundImage = `url(${frames[0]})`;
      }
    });
  }

  /**
   * Runs startCharacterAnimation.
   */
  function startCharacterAnimation() {
    characters.forEach((char) => startCharacterSpriteAnimation(char));
  }

  /**
   * Runs startCharacterSpriteAnimation.
   * @param {*} char
   */
  function startCharacterSpriteAnimation(char) {
    const frames = characterSprites[char.dataset.character];
    if (!frames || frames.length === 0 || char.dataset.animating === "true") return;
    let index = 0;
    char.dataset.animating = "true";
    const timer = window.setInterval(() => {
      char.style.backgroundImage = `url(${frames[index]})`;
      index = (index + 1) % frames.length;
    }, frameDelay);
    timers.push(timer);
  }

  /**
   * Runs positionButtonsBelowTitle.
   */
  function positionButtonsBelowTitle() {
    if (!homeLayout || !mainTitleLogo) {
      return;
    }

    const layoutRect = homeLayout.getBoundingClientRect();
    const logoRect = mainTitleLogo.getBoundingClientRect();
    const startTop = Math.max(logoRect.bottom - layoutRect.top + 12, 0);
    homeLayout.style.setProperty("--start-top", `${Math.round(startTop)}px`);
  }

  if (muteButton) muteButton.addEventListener("click", (event) => { event.preventDefault(); openAudioSettingsPopup(); });
  if (mainMuteButton) mainMuteButton.addEventListener("click", (event) => { event.preventDefault(); toggleAllAudioMute(); });
  if (audioCloseButton) audioCloseButton.addEventListener("click", closeAudioSettingsPopup);
  if (audioSettingsPopup) audioSettingsPopup.addEventListener("click", (event) => { if (event.target === audioSettingsPopup) closeAudioSettingsPopup(); });
  if (musicVolumeControl) musicVolumeControl.addEventListener("input", (event) => updateMusicVolume(event.target.value));
  if (sfxVolumeControl) sfxVolumeControl.addEventListener("input", (event) => updateSfxVolume(event.target.value));
  if (mobileControlsToggle) mobileControlsToggle.addEventListener("change", (event) => updateMobileControlsPreference(event.target.checked));
  document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeAudioSettingsPopup(); });

  startButton.addEventListener("click", () => {
    popup.classList.remove("hidden");
    startCharacterAnimation();
  });

  if (leaderboardButton && leaderboardPanel) {
    leaderboardButton.addEventListener("click", () => {
      renderLeaderboard();
      leaderboardPanel.classList.remove("hidden");
    });
  }

  if (leaderboardClose && leaderboardPanel) {
    leaderboardClose.addEventListener("click", () => {
      leaderboardPanel.classList.add("hidden");
    });
  }

  popup.addEventListener("click", (event) => {
    if (event.target === popup) {
      popup.classList.add("hidden");
    }
  });

  characters.forEach((char) => {
    char.addEventListener("click", () => {
      const selected = char.dataset.character;
      localStorage.setItem("selectedCharacter", selected);
      sessionStorage.setItem("showLoadingScreen", "1");
      window.location.href = "./game.html";
    });
  });

  window.addEventListener("beforeunload", () => {
    timers.forEach((timer) => window.clearInterval(timer));
  });

  window.addEventListener("resize", positionButtonsBelowTitle);
  window.addEventListener("orientationchange", positionButtonsBelowTitle);
  window.addEventListener("resize", updateDeviceClasses);
  window.addEventListener("orientationchange", updateDeviceClasses);

  if (mainTitleLogo) {
    if (mainTitleLogo.complete) {
      positionButtonsBelowTitle();
    } else {
      mainTitleLogo.addEventListener("load", positionButtonsBelowTitle, { once: true });
    }
  }

  setFirstFrame();
  updateDeviceClasses();
  positionButtonsBelowTitle();
  ensureFixedPlayerEntry();
  renderLeaderboard();
});

