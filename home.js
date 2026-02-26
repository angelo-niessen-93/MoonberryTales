document.addEventListener("DOMContentLoaded", () => {
  const startButton = document.getElementById("start-button");
  const settingsButton = document.getElementById("settings-button");
  const settingsPanel = document.getElementById("settings-panel");
  const popup = document.getElementById("character-popup");
  const characters = document.querySelectorAll(".character");
  const volumeControl = document.getElementById("volume-control");
  const mainMenuMusic = document.getElementById("main-menu-music");

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
  if (savedVolume !== null) {
    volumeControl.value = savedVolume;
  }

  function applyVolume(value) {
    const volume = Number.parseFloat(value);
    if (!Number.isNaN(volume) && mainMenuMusic) {
      mainMenuMusic.volume = volume;
    }
  }

  applyVolume(volumeControl.value);

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

  volumeControl.addEventListener("input", (event) => {
    const volume = Number.parseFloat(event.target.value);
    localStorage.setItem("gameVolume", String(volume));
    applyVolume(volume);
  });

  startButton.addEventListener("click", () => {
    popup.classList.remove("hidden");
    startCharacterAnimation();
  });

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
});
