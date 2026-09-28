const prologueLines = [
  "……",
  "생명의 소실을 확인.",
  "기록 상태를 확인합니다.",
  "기록 보존…… 완료.",
  "기억의 손실을 확인.",
  "이전 기록을 복원합니다.",
  "……",
  "복원 완료.",
  "육체의 파손을 확인.",
  "신체 복구를 시도합니다.",
  "……",
  "실패.",
  "기존 육체의 복구가 불가능합니다.",
  "대체 절차를 실행합니다.",
  "새로운 육체를 재작성합니다.",
  "재작성에 필요한 정보를 요청합니다.",
  "당신의 모습을 선택하십시오.",
];

const screens = [...document.querySelectorAll("[data-screen]")];
const dialoguePanel = document.querySelector(".dialogue-panel");
const dialogueText = document.querySelector(".dialogue-text");
const dialogueCount = document.querySelector(".dialogue-count");
const nextStageButton = document.querySelector('[data-action="appearance"]');
const statusMessage = document.querySelector(".status-message");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const loadingTrack = document.querySelector(".loading-track");
const loadingBar = document.querySelector(".loading-bar");
const loadingPercent = document.querySelector(".loading-percent");
const requiredAssets = ["./assets/images/title-screen.png"];

let currentLine = 0;
let visibleText = "";
let typeTimer;
let statusTimer;
let isTyping = false;

function showScreen(name) {
  screens.forEach((screen) => {
    const isTarget = screen.dataset.screen === name;
    screen.hidden = !isTarget;
    screen.classList.toggle("is-active", isTarget);
  });
}

function updateLoadingProgress(value) {
  const progress = Math.min(100, Math.max(0, Math.round(value)));
  loadingBar.style.width = `${progress}%`;
  loadingPercent.textContent = `${progress}%`;
  loadingTrack.setAttribute("aria-valuenow", String(progress));
}

function preloadImage(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.addEventListener("load", async () => {
      try {
        await image.decode();
      } catch {
        // The load event already confirms the image is usable.
      }
      resolve();
    }, { once: true });
    image.addEventListener("error", reject, { once: true });
    image.src = source;
  });
}

async function prepareTitleScreen() {
  const loadingStartedAt = performance.now();
  let displayedProgress = 4;
  let loadFailed = false;

  updateLoadingProgress(displayedProgress);

  const progressTimer = window.setInterval(() => {
    if (displayedProgress < 90) {
      displayedProgress += Math.max(0.6, (90 - displayedProgress) * 0.07);
      updateLoadingProgress(displayedProgress);
    }
  }, 80);

  try {
    await Promise.all(requiredAssets.map(preloadImage));
  } catch {
    loadFailed = true;
  }

  window.clearInterval(progressTimer);
  updateLoadingProgress(100);

  const minimumDisplayTime = reduceMotion.matches ? 0 : 650;
  const remainingTime = Math.max(0, minimumDisplayTime - (performance.now() - loadingStartedAt));

  window.setTimeout(() => {
    showScreen("title");

    if (loadFailed) {
      showStatus("배경 기록을 불러오지 못했습니다.");
    }
  }, remainingTime + 180);
}

function finishTyping() {
  window.clearInterval(typeTimer);
  dialogueText.textContent = visibleText;
  isTyping = false;

  if (currentLine === prologueLines.length - 1) {
    dialoguePanel.classList.add("is-complete");
    nextStageButton.hidden = false;
    nextStageButton.focus({ preventScroll: true });
  }
}

function renderLine() {
  window.clearInterval(typeTimer);
  visibleText = prologueLines[currentLine];
  dialogueText.textContent = "";
  dialogueCount.textContent = `${String(currentLine + 1).padStart(2, "0")} / ${String(prologueLines.length).padStart(2, "0")}`;
  dialoguePanel.classList.remove("is-complete");
  nextStageButton.hidden = true;

  if (reduceMotion.matches) {
    finishTyping();
    return;
  }

  let characterIndex = 0;
  isTyping = true;
  typeTimer = window.setInterval(() => {
    characterIndex += 1;
    dialogueText.textContent = visibleText.slice(0, characterIndex);

    if (characterIndex >= visibleText.length) {
      finishTyping();
    }
  }, visibleText === "……" ? 130 : 42);
}

function advanceDialogue() {
  if (isTyping) {
    finishTyping();
    return;
  }

  if (currentLine < prologueLines.length - 1) {
    currentLine += 1;
    renderLine();
  }
}

function startPrologue() {
  currentLine = 0;
  showScreen("prologue");
  renderLine();
  dialoguePanel.focus({ preventScroll: true });
}

function showStatus(message) {
  window.clearTimeout(statusTimer);
  statusMessage.textContent = message;
  statusMessage.classList.add("is-visible");

  statusTimer = window.setTimeout(() => {
    statusMessage.classList.remove("is-visible");
  }, 2200);
}

document.querySelector('[data-action="start"]').addEventListener("click", startPrologue);
document.querySelector('[data-action="load"]').addEventListener("click", () => {
  showStatus("아직 불러올 기록이 없습니다.");
});
document.querySelector('[data-action="settings"]').addEventListener("click", () => {
  showStatus("설정 화면은 다음 단계에서 연결됩니다.");
});
document.querySelector('[data-action="return-title"]').addEventListener("click", () => {
  window.clearInterval(typeTimer);
  showScreen("title");
});

nextStageButton.addEventListener("click", (event) => {
  event.stopPropagation();
  showScreen("appearance");
});

dialoguePanel.addEventListener("click", advanceDialogue);
dialoguePanel.addEventListener("keydown", (event) => {
  if (event.key === " " || event.key === "Enter") {
    event.preventDefault();
    advanceDialogue();
  }
});

prepareTitleScreen();
