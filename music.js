// 我的世界风格背景音乐（原创舒缓旋律，循环播放）
const Music = (() => {
  let ctx = null;
  let masterGain = null;
  let filter = null;
  let playing = false;
  let timerId = null;
  let step = 0;

  const BEAT = 0.55;
  const VOLUME = 0.22;

  const NOTES = {
    C3: 130.81, D3: 146.83, E3: 164.81, G3: 196.0, A3: 220.0,
    C4: 261.63, D4: 293.66, E4: 329.63, G4: 392.0, A4: 440.0,
    C5: 523.25, E5: 659.25, G5: 783.99,
  };

  const MELODY = [
    { n: "E4", d: 1 }, { n: "G4", d: 1 }, { n: "A4", d: 2 },
    { n: "G4", d: 1 }, { n: "E4", d: 1 }, { n: "D4", d: 2 },
    { n: "C4", d: 1 }, { n: "E4", d: 1 }, { n: "G4", d: 2 },
    { n: "A4", d: 1 }, { n: "C5", d: 1 }, { n: "A4", d: 2 },
    { n: "G4", d: 1 }, { n: "E4", d: 1 }, { n: "D4", d: 2 },
    { n: "C4", d: 2 }, { n: null, d: 2 },
  ];

  const BASS = [
    "C3", "C3", "A3", "A3", "G3", "G3", "E3", "E3",
    "C3", "C3", "A3", "A3", "G3", "G3", "C3", "C3",
  ];

  const PAD = [
    ["C4", "E4", "G4"], ["C4", "E4", "G4"], ["A3", "C4", "E4"], ["A3", "C4", "E4"],
    ["G3", "B3", "D4"], ["G3", "B3", "D4"], ["E3", "G3", "C4"], ["E3", "G3", "C4"],
    ["C4", "E4", "G4"], ["C4", "E4", "G4"], ["A3", "C4", "E4"], ["A3", "C4", "E4"],
    ["G3", "B3", "D4"], ["G3", "B3", "D4"], ["C4", "E4", "G4"], ["C4", "E4", "G4"],
  ];

  function initContext() {
    if (ctx) return ctx;
    if (typeof AudioContext === "undefined" && typeof webkitAudioContext === "undefined") {
      return null;
    }
    ctx = new (AudioContext || webkitAudioContext)();
    masterGain = ctx.createGain();
    masterGain.gain.value = VOLUME;

    filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 2800;
    filter.Q.value = 0.6;

    filter.connect(masterGain);
    masterGain.connect(ctx.destination);
    return ctx;
  }

  function playTone(freq, start, duration, type = "triangle", vol = 0.35) {
    if (!ctx || !freq) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    osc.connect(gain);
    gain.connect(filter);

    const t = ctx.currentTime + start;
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(vol, t + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.start(t);
    osc.stop(t + duration + 0.05);
  }

  function playStep(index) {
    const melody = MELODY[index % MELODY.length];
    const bass = BASS[index % BASS.length];
    const pad = PAD[index % PAD.length];

    if (melody.n) {
      playTone(NOTES[melody.n], 0, BEAT * melody.d * 0.95, "triangle", 0.32);
      playTone(NOTES[melody.n] * 2, 0.02, BEAT * melody.d * 0.7, "sine", 0.06);
    }

    playTone(NOTES[bass], 0, BEAT * 1.8, "sine", 0.18);

    if (index % 2 === 0) {
      pad.forEach((note, i) => {
        playTone(NOTES[note], i * 0.04, BEAT * 1.6, "sine", 0.05);
      });
    }

    if (index % 4 === 0) {
      playTone(NOTES.G5, 0, 0.08, "square", 0.025);
      playTone(NOTES.E5, 0.12, 0.08, "square", 0.02);
    }
  }

  function tick() {
    if (!playing) return;

    playStep(step);
    const melody = MELODY[step % MELODY.length];
    step = (step + 1) % MELODY.length;
    timerId = setTimeout(tick, BEAT * (melody?.d || 1) * 1000);
  }

  async function start() {
    const audio = initContext();
    if (!audio) return false;

    if (audio.state === "suspended") {
      await audio.resume();
    }

    if (playing) return true;

    playing = true;
    if (masterGain) masterGain.gain.value = VOLUME;
    step = 0;
    tick();
    updateToggleUI();
    return true;
  }

  function stop() {
    playing = false;
    if (timerId) {
      clearTimeout(timerId);
      timerId = null;
    }
    if (masterGain) masterGain.gain.value = 0;
    updateToggleUI();
  }

  function toggleMusic() {
    if (playing) stop();
    else start();
  }

  function isPlaying() {
    return playing;
  }

  function updateToggleUI() {
    const btn = document.getElementById("music-toggle");
    if (!btn) return;
    btn.classList.toggle("is-playing", playing);
    btn.querySelector(".music-icon").textContent = playing ? "🎵" : "🔇";
    btn.title = playing ? "关闭音乐" : "开启音乐";
  }

  function setupEntry() {
    const screen = document.getElementById("entry-screen");
    const toggleBtn = document.getElementById("music-toggle");
    if (!screen || !toggleBtn) return;

    async function enterWorld() {
      screen.classList.add("hidden");
      toggleBtn.classList.remove("hidden");
      await start();
      sessionStorage.setItem("winnie-entered", "1");
    }

    screen.addEventListener("click", enterWorld, { once: true });

    toggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleBtn.classList.add("pulse");
      setTimeout(() => toggleBtn.classList.remove("pulse"), 200);
      toggleMusic();
    });

    if (sessionStorage.getItem("winnie-entered") === "1") {
      screen.classList.add("hidden");
      toggleBtn.classList.remove("hidden");
      start();
    }
  }

  document.addEventListener("DOMContentLoaded", setupEntry);

  return { start, stop, toggle: toggleMusic, isPlaying, initContext };
})();
