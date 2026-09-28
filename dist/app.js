const statusMessage = document.querySelector(".status-message");
const actionLabels = {
  start: "시작하기",
  load: "불러오기",
  settings: "설정",
};

let statusTimer;

document.querySelectorAll("[data-action]").forEach((button) => {
  button.addEventListener("click", () => {
    const label = actionLabels[button.dataset.action];

    window.clearTimeout(statusTimer);
    statusMessage.textContent = `${label} 화면은 다음 단계에서 연결됩니다.`;
    statusMessage.classList.add("is-visible");

    statusTimer = window.setTimeout(() => {
      statusMessage.classList.remove("is-visible");
    }, 2200);
  });
});
