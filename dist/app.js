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

const appearanceCategories = [
  {
    id: "gender",
    title: "성별",
    visual: true,
    options: [
      { value: "남성", image: "./assets/images/appearance-male.png" },
      { value: "여성", image: "./assets/images/appearance-female.png" },
    ],
  },
  {
    id: "body-type",
    title: "체형",
    options: ["왜소함", "마름", "가늘고 김", "균형 잡힘", "탄탄함", "근육질", "육중함", "풍만함"],
  },
  { id: "height", title: "키", options: ["매우 작음", "작음", "평균", "큼", "매우 큼", "직접 지정"] },
  {
    id: "impression",
    title: "인상",
    options: ["강한 남성적", "남성적", "중성적", "여성적", "강한 여성적"],
  },
  {
    id: "aura",
    title: "분위기",
    multiple: true,
    options: ["차가운", "따뜻한", "날카로운", "부드러운", "귀여운", "고고한", "음침한", "몽환적인", "위압적인", "순한", "활발한", "무심한"],
  },
  { id: "hair-length", title: "머리길이", options: ["삭발", "매우 짧음", "짧음", "중간", "김", "매우 김"] },
  {
    id: "hair-color",
    title: "머리색",
    multiple: true,
    options: ["흑색", "짙은 갈색", "갈색", "밝은 갈색", "금색", "백금색", "백색", "은색", "적색", "주황색", "분홍색", "청색", "하늘색", "녹색", "보라색", "회색", "기타"],
  },
  {
    id: "hair-mix",
    title: "머리색 혼합",
    options: ["없음", "안쪽만 다른 색", "끝부분만 다른 색", "앞머리만 다른 색", "좌우 비대칭", "한 가닥 포인트", "그라데이션", "얼룩무늬", "전체 혼합"],
  },
  {
    id: "eye-color",
    title: "눈색",
    multiple: true,
    options: ["흑색", "갈색", "금색", "적색", "청색", "녹색", "회색", "은색", "보라색", "백색", "오드아이", "기타"],
  },
  {
    id: "pupil",
    title: "동공",
    options: ["원형", "세로형", "가로형", "타원형", "십자형", "별형", "고리형", "이중동공", "특수형"],
  },
  {
    id: "skin-color",
    title: "피부색",
    options: ["매우 밝음", "밝음", "중간", "갈색", "짙은 갈색", "매우 어두움", "창백한 백색", "회색빛", "푸른빛", "붉은빛", "자주빛", "기타"],
  },
];

const raceOptions = [
  { id: "human", title: "인간", image: "./assets/images/races/human.webp", description: "심도 0을 중심으로 문명을 이루고, 지식과 장비로 여러 심역을 탐사한다." },
  { id: "dragon", title: "용인", image: "./assets/images/races/dragon.webp", description: "아미 마운틴의 혹독한 환경에서 살아가는 강인한 아인." },
  { id: "merfolk", title: "인어", image: "./assets/images/races/merfolk.webp", description: "푸른 해역에서 물속을 자유롭게 누비며 살아가는 수생 아인." },
  { id: "oni", title: "귀인", image: "./assets/images/races/oni.webp", description: "대평원에서 강한 완력과 평생 단련한 무구로 살아가는 아인." },
  { id: "catfolk", title: "묘인", image: "./assets/images/races/catfolk.webp", description: "예민한 감각과 유연한 몸으로 복잡한 지형을 오가는 아인." },
  { id: "underground", title: "지저인", image: "./assets/images/races/underground.webp", description: "광물의 색을 읽고 지하의 길을 기억하는 아인." },
  { id: "skyfolk", title: "천인", image: "./assets/images/races/skyfolk.webp", description: "천공에서 날개로 하늘을 자유롭게 나는 아인." },
  { id: "demon", title: "마인", image: "./assets/images/races/demon.webp", description: "특수한 언어로 세상에 영향을 주는, 인간과 닮은 아인." },
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
const loadingStatus = document.querySelector(".loading-status");
const loadingScreen = document.querySelector('[data-screen="loading"]');
const enterTitleButton = document.querySelector('[data-action="enter-title"]');
const choiceGroups = document.querySelector("[data-choice-groups]");
const appearanceScreen = document.querySelector('[data-screen="appearance"]');
const selectionProgress = document.querySelector("[data-selection-progress]");
const currentCategoryLabel = document.querySelector("[data-current-category]");
const previousAppearanceButton = document.querySelector('[data-action="previous-appearance"]');
const nextAppearanceButton = document.querySelector('[data-action="next-appearance"]');
const raceScreen = document.querySelector('[data-screen="race"]');
const raceCards = document.querySelector("[data-race-cards]");
const confirmRaceButton = document.querySelector('[data-action="confirm-race"]');
const titleBgm = document.querySelector("#title-bgm");
const audioToggle = document.querySelector('[data-action="toggle-audio"]');
const audioLabel = document.querySelector(".audio-label");
const requiredImages = [
  "./assets/images/title-screen.png",
  "./assets/images/appearance-male.png",
  "./assets/images/appearance-female.png",
  ...raceOptions.map((race) => race.image),
];

let currentLine = 0;
let visibleText = "";
let typeTimer;
let statusTimer;
let isTyping = false;
let musicEnabled = true;
let loadingReady = false;
let musicFadeFrame;
let currentAppearanceStep = 0;
const appearanceSelections = new Map();
let selectedRace = null;

titleBgm.volume = 0.46;

function showScreen(name, options = {}) {
  screens.forEach((screen) => {
    const isTarget = screen.dataset.screen === name;
    screen.hidden = !isTarget;
    screen.classList.toggle("is-active", isTarget);
  });

  if (name === "title") {
    playTitleMusic();
  } else if (!options.keepTitleMusic) {
    stopTitleMusic();
  }
}

function renderAppearanceChoices() {
  const fragment = document.createDocumentFragment();

  appearanceCategories.forEach((category, index) => {
    const group = document.createElement("fieldset");
    const legend = document.createElement("legend");
    const number = document.createElement("span");
    const title = document.createElement("span");
    const multipleHint = document.createElement("small");
    const optionList = document.createElement("div");

    group.className = "choice-group";
    group.dataset.category = category.id;
    group.dataset.step = String(index);
    group.hidden = index !== currentAppearanceStep;
    number.className = "choice-number";
    number.textContent = String(index + 1).padStart(2, "0");
    title.textContent = category.title;
    legend.tabIndex = -1;
    legend.append(number, title);
    if (category.multiple) {
      multipleHint.className = "choice-multiple-hint";
      multipleHint.textContent = "여러 개 선택 가능";
      legend.append(multipleHint);
    }

    optionList.className = "choice-options";
    optionList.classList.toggle("choice-options--visual", Boolean(category.visual));
    optionList.setAttribute("aria-label", category.title);

    category.options.forEach((option) => {
      const button = document.createElement("button");
      const value = typeof option === "string" ? option : option.value;

      button.className = "choice-option";
      button.type = "button";
      button.dataset.value = value;
      button.setAttribute("aria-pressed", "false");

      if (typeof option === "string") {
        button.textContent = option;
      } else {
        const image = document.createElement("img");
        const label = document.createElement("span");

        button.classList.add("choice-option--visual");
        image.className = "choice-option-image";
        image.src = option.image;
        image.alt = "";
        image.width = 1254;
        image.height = 1254;
        image.decoding = "async";
        image.draggable = false;
        label.className = "choice-option-label";
        label.textContent = value;
        button.append(image, label);
      }

      optionList.append(button);
    });

    group.append(legend, optionList);
    fragment.append(group);
  });

  choiceGroups.append(fragment);
  updateAppearanceStep();
}

function renderRaceChoices() {
  const fragment = document.createDocumentFragment();

  raceOptions.forEach((race) => {
    const card = document.createElement("button");
    const image = document.createElement("img");
    const copy = document.createElement("span");
    const name = document.createElement("span");
    const description = document.createElement("span");

    card.className = "race-card";
    card.type = "button";
    card.dataset.race = race.id;
    card.setAttribute("aria-pressed", "false");
    image.className = "race-image";
    image.src = race.image;
    image.alt = "";
    image.width = 1000;
    image.height = race.id === "underground" ? 1206 : 1333;
    image.decoding = "async";
    image.draggable = false;
    copy.className = "race-card-copy";
    name.className = "race-card-name";
    name.textContent = race.title;
    description.className = "race-card-description";
    description.textContent = race.description;
    copy.append(name, description);
    card.append(image, copy);
    fragment.append(card);
  });

  raceCards.append(fragment);
}

function updateAppearanceStep({ focus = false } = {}) {
  const category = appearanceCategories[currentAppearanceStep];
  const isLastStep = currentAppearanceStep === appearanceCategories.length - 1;

  choiceGroups.querySelectorAll(".choice-group").forEach((group, index) => {
    const isCurrent = index === currentAppearanceStep;
    group.hidden = !isCurrent;
    group.classList.toggle("is-current", isCurrent);
  });

  currentCategoryLabel.textContent = category.title;
  selectionProgress.textContent = `${String(currentAppearanceStep + 1).padStart(2, "0")} / ${String(appearanceCategories.length).padStart(2, "0")}`;
  previousAppearanceButton.disabled = currentAppearanceStep === 0;
  nextAppearanceButton.disabled = !hasAppearanceSelection(category.id);
  nextAppearanceButton.textContent = isLastStep ? "외형 확정" : "다음";

  if (focus) {
    appearanceScreen.scrollTop = 0;
    choiceGroups.querySelector(".choice-group.is-current legend")?.focus({ preventScroll: true });
  }
}

function hasAppearanceSelection(categoryId) {
  return (appearanceSelections.get(categoryId)?.length ?? 0) > 0;
}

function updateAudioControl(isPlaying) {
  audioToggle.setAttribute("aria-pressed", String(isPlaying));
  audioToggle.classList.toggle("is-playing", isPlaying);
  audioLabel.textContent = isPlaying ? "BGM 끄기" : "BGM 재생";
}

async function playTitleMusic() {
  if (!musicEnabled) {
    updateAudioControl(false);
    return;
  }

  window.cancelAnimationFrame(musicFadeFrame);
  musicFadeFrame = undefined;
  titleBgm.volume = 0.46;

  try {
    await titleBgm.play();
    updateAudioControl(true);
  } catch {
    updateAudioControl(false);
  }
}

function stopTitleMusic() {
  window.cancelAnimationFrame(musicFadeFrame);
  musicFadeFrame = undefined;
  titleBgm.pause();
  titleBgm.currentTime = 0;
  titleBgm.volume = 0.46;
  updateAudioControl(false);
}

function fadeOutTitleMusic(duration = 1200) {
  window.cancelAnimationFrame(musicFadeFrame);

  if (titleBgm.paused) {
    stopTitleMusic();
    return;
  }

  const startedAt = performance.now();
  const startingVolume = titleBgm.volume;
  updateAudioControl(false);

  const fadeStep = (now) => {
    const progress = Math.min(1, (now - startedAt) / duration);
    titleBgm.volume = startingVolume * (1 - progress);

    if (progress < 1) {
      musicFadeFrame = window.requestAnimationFrame(fadeStep);
      return;
    }

    titleBgm.pause();
    titleBgm.currentTime = 0;
    titleBgm.volume = 0.46;
    musicFadeFrame = undefined;
  };

  musicFadeFrame = window.requestAnimationFrame(fadeStep);
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

function prepareAudio(audio) {
  return new Promise((resolve, reject) => {
    if (audio.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      resolve();
      return;
    }

    const finish = () => {
      audio.removeEventListener("canplay", finish);
      audio.removeEventListener("error", fail);
      resolve();
    };
    const fail = () => {
      audio.removeEventListener("canplay", finish);
      audio.removeEventListener("error", fail);
      reject(new Error("Title music could not be loaded."));
    };

    audio.addEventListener("canplay", finish, { once: true });
    audio.addEventListener("error", fail, { once: true });
    audio.load();
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

  prepareAudio(titleBgm).catch(() => {
    // Audio can still be requested again from the title control.
  });

  const imageResults = await Promise.allSettled(requiredImages.map(preloadImage));
  loadFailed = imageResults.some((result) => result.status === "rejected");

  window.clearInterval(progressTimer);
  updateLoadingProgress(100);

  const minimumDisplayTime = reduceMotion.matches ? 0 : 650;
  const remainingTime = Math.max(0, minimumDisplayTime - (performance.now() - loadingStartedAt));

  window.setTimeout(() => {
    loadingReady = true;
    loadingStatus.textContent = "기록 매체 동기화 완료";
    loadingScreen.classList.add("is-ready");
    enterTitleButton.hidden = false;
    enterTitleButton.focus({ preventScroll: true });

    if (loadFailed) {
      loadingStatus.textContent = "일부 기록을 불러오지 못했습니다";
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
  showScreen("prologue", { keepTitleMusic: true });
  fadeOutTitleMusic(1200);
  renderLine();
  dialoguePanel.focus({ preventScroll: true });
}

function enterTitleScreen() {
  if (!loadingReady) {
    return;
  }

  loadingReady = false;
  musicEnabled = true;
  showScreen("title");
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
loadingScreen.addEventListener("click", enterTitleScreen);
document.querySelector('[data-action="load"]').addEventListener("click", () => {
  showStatus("아직 불러올 기록이 없습니다.");
});
document.querySelector('[data-action="settings"]').addEventListener("click", () => {
  showStatus("설정 화면은 다음 단계에서 연결됩니다.");
});
choiceGroups.addEventListener("click", (event) => {
  const selectedButton = event.target.closest(".choice-option");

  if (!selectedButton) {
    return;
  }

  const group = selectedButton.closest(".choice-group");
  const category = appearanceCategories[Number(group.dataset.step)];
  const selectedValues = new Set(appearanceSelections.get(category.id) || []);

  if (category.multiple) {
    if (selectedValues.has(selectedButton.dataset.value)) {
      selectedValues.delete(selectedButton.dataset.value);
    } else {
      selectedValues.add(selectedButton.dataset.value);
    }
  } else {
    selectedValues.clear();
    selectedValues.add(selectedButton.dataset.value);
  }

  if (selectedValues.size > 0) {
    appearanceSelections.set(category.id, [...selectedValues]);
  } else {
    appearanceSelections.delete(category.id);
  }

  group.querySelectorAll(".choice-option").forEach((button) => {
    const isSelected = selectedValues.has(button.dataset.value);
    button.classList.toggle("is-selected", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
  });

  updateAppearanceStep();
});
previousAppearanceButton.addEventListener("click", () => {
  if (currentAppearanceStep === 0) {
    return;
  }

  currentAppearanceStep -= 1;
  updateAppearanceStep({ focus: true });
});
nextAppearanceButton.addEventListener("click", () => {
  const category = appearanceCategories[currentAppearanceStep];

  if (!hasAppearanceSelection(category.id)) {
    return;
  }

  if (currentAppearanceStep < appearanceCategories.length - 1) {
    currentAppearanceStep += 1;
    updateAppearanceStep({ focus: true });
    return;
  }

  showScreen("race");
  raceScreen.scrollTop = 0;
  document.querySelector("#race-title").focus({ preventScroll: true });
});
raceCards.addEventListener("click", (event) => {
  const card = event.target.closest(".race-card");

  if (!card) {
    return;
  }

  selectedRace = card.dataset.race;
  raceCards.querySelectorAll(".race-card").forEach((candidate) => {
    const isSelected = candidate === card;
    candidate.classList.toggle("is-selected", isSelected);
    candidate.setAttribute("aria-pressed", String(isSelected));
  });
  confirmRaceButton.disabled = false;
});
document.querySelector('[data-action="return-appearance"]').addEventListener("click", () => {
  currentAppearanceStep = appearanceCategories.length - 1;
  showScreen("appearance");
  updateAppearanceStep({ focus: true });
});
confirmRaceButton.addEventListener("click", () => {
  if (selectedRace) {
    showStatus("종족 기록을 확인했습니다. 적응 단계는 준비 중입니다.");
  }
});
audioToggle.addEventListener("click", () => {
  if (titleBgm.paused) {
    musicEnabled = true;
    playTitleMusic();
  } else {
    musicEnabled = false;
    stopTitleMusic();
  }
});
document.querySelector('[data-action="return-title"]').addEventListener("click", () => {
  window.clearInterval(typeTimer);
  showScreen("title");
});

nextStageButton.addEventListener("click", (event) => {
  event.stopPropagation();
  currentAppearanceStep = 0;
  showScreen("appearance");
  updateAppearanceStep({ focus: true });
});

dialoguePanel.addEventListener("click", advanceDialogue);
dialoguePanel.addEventListener("keydown", (event) => {
  if (event.target.closest("button")) {
    return;
  }

  if (event.key === " " || event.key === "Enter") {
    event.preventDefault();
    advanceDialogue();
  }
});

prepareTitleScreen();
renderAppearanceChoices();
renderRaceChoices();
