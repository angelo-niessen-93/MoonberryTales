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
  const settingsButton = document.getElementById("settings-button");
  const muteButton = document.getElementById("mute-button");
  const settingsPanel = document.getElementById("settings-panel");
  const popup = document.getElementById("character-popup");
  const characters = document.querySelectorAll(".character");
  const volumeControl = document.getElementById("volume-control");
  const mainMenuMusic = document.getElementById("main-menu-music");
  const leaderboardList = document.getElementById("leaderboard-list");
  const leaderboardEmpty = document.getElementById("leaderboard-empty");
  const leaderboardPanel = document.getElementById("leaderboard-panel");
  const leaderboardButton = document.getElementById("leaderboard-button");
  const leaderboardClose = document.getElementById("leaderboard-close");

  const frameDelay = 160;
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

  const savedVolume = localStorage.getItem("gameVolume");
  const savedMuted = localStorage.getItem("gameMuted") === "1";
  let isMuted = savedMuted;
  if (savedVolume !== null) {
    volumeControl.value = savedVolume;
  }

  function applyVolume(value) {
    const volume = Number.parseFloat(value);
    if (!Number.isNaN(volume) && mainMenuMusic) {
      mainMenuMusic.volume = isMuted ? 0 : volume;
    }
  }

  function updateMuteButtonState() {
    if (!muteButton) {
      return;
    }
    muteButton.classList.toggle("is-muted", isMuted);
    muteButton.setAttribute("aria-label", isMuted ? "Ton einschalten" : "Ton stummschalten");
  }

  function formatDuration(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

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

  function ensureFixedPlayerEntry() {
    let entries = [];
    try {
      const raw = localStorage.getItem(LEADERBOARD_KEY);
      entries = raw ? JSON.parse(raw) : [];
    } catch (_) {
      entries = [];
    }

    const safeEntries = Array.isArray(entries) ? entries : [];
    const hasFixedEntry = safeEntries.some((entry) =>
      entry &&
      entry.name === FIXED_PLAYER_ENTRY.name &&
      entry.result === FIXED_PLAYER_ENTRY.result &&
      Number(entry.coins) === FIXED_PLAYER_ENTRY.coins &&
      Number(entry.duration) === FIXED_PLAYER_ENTRY.duration
    );

    if (!hasFixedEntry) {
      safeEntries.push({ ...FIXED_PLAYER_ENTRY });
    }

    const sorted = sortLeaderboard(safeEntries).slice(0, 10);
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(sorted));
  }

  function renderLeaderboard() {
    if (!leaderboardList || !leaderboardEmpty) {
      return;
    }

    let entries = [];
    try {
      const raw = localStorage.getItem(LEADERBOARD_KEY);
      entries = raw ? JSON.parse(raw) : [];
    } catch (_) {
      entries = [];
    }

    entries = sortLeaderboard(entries);
    leaderboardList.innerHTML = "";

    if (!Array.isArray(entries) || entries.length === 0) {
      leaderboardEmpty.classList.remove("hidden");
      return;
    }

    leaderboardEmpty.classList.add("hidden");
    entries.slice(0, 10).forEach((entry, index) => {
      const item = document.createElement("li");
      item.className = "leaderboard-item";

      const duration = Number.isFinite(entry.duration) ? entry.duration : 0;
      const coins = Number.isFinite(entry.coins) ? entry.coins : 0;
      const score = Number.isFinite(entry.score) ? entry.score : 0;
      const result = entry.result || "-";
      const name = entry.name || "Unbekannt";

      item.innerHTML = `
        <span class="leaderboard-rank">${index + 1}</span>
        <span class="leaderboard-main">
          <span class="leaderboard-name">${name}</span>
          <span class="leaderboard-meta">${result} | ${coins} Coins | ${formatDuration(duration)}</span>
        </span>
        <span class="leaderboard-score">${score}</span>
      `;
      leaderboardList.appendChild(item);
    });
  }

  applyVolume(volumeControl.value);
  updateMuteButtonState();

  const timers = [];

  function setFirstFrame() {
    characters.forEach((char) => {
      const type = char.dataset.character;
      const frames = characterSprites[type];
      if (frames && frames.length > 0) {
        char.style.backgroundImage = `url(${frames[0]})`;
      }
    });
  }

  function startCharacterAnimation() {
    characters.forEach((char) => {
      const type = char.dataset.character;
      const frames = characterSprites[type];
      if (!frames || frames.length === 0 || char.dataset.animating === "true") {
        return;
      }

      let index = 0;
      char.dataset.animating = "true";
      const timer = window.setInterval(() => {
        char.style.backgroundImage = `url(${frames[index]})`;
        index = (index + 1) % frames.length;
      }, frameDelay);
      timers.push(timer);
    });
  }

  settingsButton.addEventListener("click", () => {
    settingsPanel.classList.toggle("hidden");
  });

  if (muteButton) {
    muteButton.addEventListener("click", () => {
      isMuted = !isMuted;
      localStorage.setItem("gameMuted", isMuted ? "1" : "0");
      updateMuteButtonState();
      applyVolume(volumeControl.value);
    });
  }

  volumeControl.addEventListener("input", (event) => {
    const volume = Number.parseFloat(event.target.value);
    localStorage.setItem("gameVolume", String(volume));
    applyVolume(volume);
  });

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

  setFirstFrame();
  ensureFixedPlayerEntry();
  renderLeaderboard();
});
