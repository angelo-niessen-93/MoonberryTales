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
  const promoBanner = document.querySelector(".promo-banner");
  const promoCloseButton = document.getElementById("promo-close");
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
  const characterSprites = window.HomeCharacterSprites || {};

  const MUSIC_MUTE_KEY = "gameMusicMuted";
  const SFX_MUTE_KEY = "gameSfxMuted";
  const MUSIC_VOLUME_KEY = "gameMusicVolume";
  const SFX_VOLUME_KEY = "gameSfxVolume";
  const MOBILE_CONTROLS_KEY = "mobileControlsEnabled";
  const LEVEL_STORAGE_KEY = "selectedLevel";
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

  function ensureFixedPlayerEntry() {
    if (!window.HomeLeaderboard) return;
    window.HomeLeaderboard.ensureFixedPlayerEntry(LEADERBOARD_KEY, FIXED_PLAYER_ENTRY);
  }

  function renderLeaderboard() {
    if (!window.HomeLeaderboard) return;
    window.HomeLeaderboard.renderLeaderboard(LEADERBOARD_KEY, leaderboardList, leaderboardEmpty);
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
    if (!window.HomeLeaderboard) return true;
    return window.HomeLeaderboard.areMobileControlsEnabled(MOBILE_CONTROLS_KEY);
  }

  /**
   * Runs syncMobileControlsToggle.
   */
  function syncMobileControlsToggle() {
    if (!window.HomeLeaderboard) return;
    window.HomeLeaderboard.syncMobileControlsToggle(mobileControlsToggle, MOBILE_CONTROLS_KEY);
  }

  /**
   * Runs updateMobileControlsPreference.
   * @param {*} enabled
   */
  function updateMobileControlsPreference(enabled) {
    if (!window.HomeLeaderboard) return;
    window.HomeLeaderboard.updateMobileControlsPreference(MOBILE_CONTROLS_KEY, enabled);
  }

  /**
   * Runs applyLevelSelectionFromQuery.
   */
  function applyLevelSelectionFromQuery() {
    if (!window.HomeLeaderboard) return;
    window.HomeLeaderboard.applyLevelSelectionFromQuery(LEVEL_STORAGE_KEY);
  }

  /**
   * Runs ensureDefaultLevelSelection.
   */
  function ensureDefaultLevelSelection() {
    if (!window.HomeLeaderboard) {
      localStorage.setItem(LEVEL_STORAGE_KEY, "level1");
      return;
    }
    window.HomeLeaderboard.ensureDefaultLevelSelection(LEVEL_STORAGE_KEY);
  }

  /**
   * Runs dismissPromoBanner.
   */
  function dismissPromoBanner() {
    if (!promoBanner) return;
    promoBanner.classList.add("hidden");
  }

  applyVolume(musicVolume);
  persistAudioSettings();
  updateAudioButtonState();
  tryStartMainMenuMusic();
  setupMusicUnlockOnFirstInteraction();
  syncAudioSettingsControls();
  syncMobileControlsToggle();
  applyLevelSelectionFromQuery();
  ensureDefaultLevelSelection();

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
  if (promoCloseButton) promoCloseButton.addEventListener("click", dismissPromoBanner);

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


