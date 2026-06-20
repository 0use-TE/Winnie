// 快捷栏导航
const slots = document.querySelectorAll(".hotbar-slot");
const panels = document.querySelectorAll(".panel");

slots.forEach((slot) => {
  slot.addEventListener("click", () => {
    const section = slot.dataset.section;

    slots.forEach((s) => s.classList.remove("active"));
    slot.classList.add("active");

    panels.forEach((panel) => {
      panel.classList.toggle("active", panel.id === section);
    });

    playClickSound();
  });
});

// 爱好卡片点击效果
document.querySelectorAll(".hobby-slot").forEach((slot) => {
  slot.addEventListener("click", () => {
    const hobby = slot.dataset.hobby;
    const messages = {
      soccer: "⚽ 进球！太棒了！",
      art: "🎨 创作灵感 +100！",
      build: "🧱 放置方块！叮~",
    };
    showTooltip(slot, messages[hobby] || "✨ 超厉害！");
    playPopSound();
  });
});

// 添加作品框
document.querySelector(".add-frame")?.addEventListener("click", () => {
  alert("🎨 以后可以在这里上传你的画作和建造截图哦！");
});

// 游戏时间（MC 风格）
function updateGameTime() {
  const el = document.getElementById("game-time");
  if (!el) return;

  const now = new Date();
  const day = Math.floor(now.getDate() / 3) + 1;
  const hour = now.getHours();
  const minute = String(now.getMinutes()).padStart(2, "0");

  let mcHour = hour;
  let period = "白天";
  if (hour >= 6 && hour < 12) period = "早晨";
  else if (hour >= 12 && hour < 18) period = "下午";
  else if (hour >= 18 && hour < 21) period = "傍晚";
  else period = "夜晚";

  el.textContent = `Day ${day} · ${String(mcHour).padStart(2, "0")}:${minute} · ${period}`;
}

updateGameTime();
setInterval(updateGameTime, 60000);

// 工具提示
const tooltip = document.getElementById("tooltip");

function showTooltip(element, text) {
  const rect = element.getBoundingClientRect();
  tooltip.textContent = text;
  tooltip.classList.remove("hidden");
  tooltip.style.left = rect.left + rect.width / 2 - tooltip.offsetWidth / 2 + "px";
  tooltip.style.top = rect.top - 40 + "px";

  setTimeout(() => tooltip.classList.add("hidden"), 1500);
}

// 简单音效（Web Audio API）— 与背景音乐共用 AudioContext
function getAudioCtx() {
  return Music.initContext();
}

function playClickSound() {
  const audioCtx = getAudioCtx();
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.frequency.value = 800;
  osc.type = "square";
  gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
  osc.start(audioCtx.currentTime);
  osc.stop(audioCtx.currentTime + 0.1);
}

function playPopSound() {
  const audioCtx = getAudioCtx();
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.frequency.setValueAtTime(400, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.15);
  osc.type = "square";
  gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
  osc.start(audioCtx.currentTime);
  osc.stop(audioCtx.currentTime + 0.15);
}

// 随机飘落的方块粒子
function createParticle() {
  const particle = document.createElement("div");
  const colors = ["#5d9e45", "#8b6914", "#a0784c", "#7a7a7a"];
  const size = 8 + Math.random() * 8;

  particle.style.cssText = `
    position: fixed;
    width: ${size}px;
    height: ${size}px;
    background: ${colors[Math.floor(Math.random() * colors.length)]};
    left: ${Math.random() * 100}vw;
    top: -20px;
    z-index: 0;
    pointer-events: none;
    opacity: 0.6;
    animation: fall ${4 + Math.random() * 4}s linear forwards;
  `;

  document.body.appendChild(particle);
  setTimeout(() => particle.remove(), 8000);
}

const style = document.createElement("style");
style.textContent = `
  @keyframes fall {
    to {
      transform: translateY(110vh) rotate(360deg);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

setInterval(createParticle, 2000);
