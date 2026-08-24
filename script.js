const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const STAGES = {
  idle: { f0: 104, harm: 6, noise: 0.18, jitter: 0.04, bright: 0.65 },
  capture: { f0: 92, harm: 7, noise: 0.38, jitter: 0.08, bright: 0.55 },
  represent: { f0: 110, harm: 5, noise: 0.12, jitter: 0.03, bright: 0.7 },
  adapt: { f0: 128, harm: 4, noise: 0.05, jitter: 0.015, bright: 0.85 },
  serve: { f0: 140, harm: 3, noise: 0.02, jitter: 0.005, bright: 1 },
};

const COPY = {
  capture: {
    idx: "01 · CAPTURE",
    title: "The waveform as it is",
    body: "Clinical speech across spontaneous, phonation, and diadochokinetic tasks. Dialect recordings. Quality-control heuristics before anything reaches a trainer.",
    tags: ["SPON / PHON / DDK", "Vaani audit", "QC pipeline"],
  },
  represent: {
    idx: "02 · REPRESENT",
    title: "Self-supervised speech",
    body: "wav2vec2, HuBERT, XLSR-53, MMS, Whisper. Transformer embeddings that hold multilingual and disordered speech without collapsing it to a high-resource average.",
    tags: ["wav2vec2", "HuBERT", "Whisper", "MuRIL"],
  },
  adapt: {
    idx: "03 · ADAPT",
    title: "Domain, then task",
    body: "Fine-tuning that cut character error rate by about 30% on multilingual clinical speech. MuRIL masked-language pretraining on Chhattisgarhi, Magahi, Bhojpuri, and Bengali — beating L3Cube-Pune and XLM-RoBERTa-base on the target languages.",
    tags: ["~30% CER ↓", "MLM", "ALSFRS-R"],
  },
  serve: {
    idx: "04 · SERVE",
    title: "Sub-second, in production",
    body: "Docker on AWS EC2, Lambda orchestration, WebSocket streaming with greedy interim decoding and a beam-search pass at session end. Confidence gates before anything downstream consumes a transcript.",
    tags: ["WebSockets", "AWS", "Docker"],
  },
};

let stage = "idle";

function sample(xNorm, time, p) {
  const env = 0.55 + 0.45 * Math.sin(xNorm * Math.PI) * (0.7 + 0.3 * Math.sin(time * 0.7 + xNorm * 4));
  let y = 0;
  for (let k = 1; k <= p.harm; k++) {
    const amp = (1 / k) * Math.pow(p.bright, k - 1);
    const jit = 1 + p.jitter * Math.sin(time * 2.1 * k + xNorm * 9);
    y += amp * Math.sin((xNorm * p.f0 * k) / 14 + time * (0.9 + k * 0.12) * jit);
  }
  const n = p.noise * (Math.sin(xNorm * 73 + time * 11) * 0.5 + Math.sin(xNorm * 191 + time * 7.3) * 0.3);
  return (y * 0.42 + n) * env;
}

function bindCanvas(canvas, { compact = false } = {}) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let t = 0, raf = 0, running = true;

  const resize = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.floor(canvas.clientWidth * dpr));
    canvas.height = Math.max(1, Math.floor(canvas.clientHeight * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  new ResizeObserver(resize).observe(canvas);

  const draw = () => {
    if (!running) return;
    const w = canvas.clientWidth, h = canvas.clientHeight;
    const p = STAGES[stage] || STAGES.idle;
    ctx.clearRect(0, 0, w, h);
    const mid = h * 0.5, amp = h * (compact ? 0.38 : 0.42);
    ctx.strokeStyle = "rgba(142,185,196,0.12)";
    ctx.beginPath(); ctx.moveTo(0, mid); ctx.lineTo(w, mid); ctx.stroke();
    const traces = compact ? 1 : 3;
    for (let tr = traces - 1; tr >= 0; tr--) {
      const lag = tr * 0.18;
      const alpha = tr === 0 ? 0.95 : 0.18 - tr * 0.04;
      ctx.beginPath();
      for (let x = 0; x <= w; x += w > 700 ? 2 : 3) {
        const y = mid - sample(x / w, t - lag, p) * amp;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `rgba(142,185,196,${alpha})`;
      ctx.lineWidth = tr === 0 ? 1.4 : 1;
      ctx.stroke();
    }
    if (!compact) {
      const playX = ((t * 48) % (w + 40)) - 20;
      ctx.fillStyle = "rgba(236,234,228,0.55)";
      ctx.fillRect(playX, 8, 1, h - 16);
    }
    if (!reduce) t += 0.016;
    raf = requestAnimationFrame(draw);
  };
  if (reduce) { t = 1.2; draw(); return; }
  raf = requestAnimationFrame(draw);
}

function bindFlow(canvas) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let t = 0, running = true;
  const lanes = 5;
  const particles = Array.from({ length: 42 }, (_, i) => ({
    x: Math.random(), lane: i % lanes, speed: 0.04 + (i % 7) * 0.008, size: 1 + (i % 3) * 0.4,
  }));
  const resize = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.floor(canvas.clientWidth * dpr));
    canvas.height = Math.max(1, Math.floor(canvas.clientHeight * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  new ResizeObserver(resize).observe(canvas);
  const draw = () => {
    if (!running) return;
    const w = canvas.clientWidth, h = canvas.clientHeight;
    ctx.clearRect(0, 0, w, h);
    const boost = stage === "idle" ? 1 : 1.45;
    for (let i = 0; i < lanes; i++) {
      const y = (h / (lanes + 1)) * (i + 1);
      ctx.beginPath(); ctx.moveTo(0, y);
      for (let x = 0; x <= w; x += 8) ctx.lineTo(x, y + Math.sin(x * 0.012 + t * 0.9 + i) * (4 + i));
      ctx.strokeStyle = "rgba(142,185,196,0.14)"; ctx.stroke();
    }
    for (const p of particles) {
      if (!reduce) p.x += p.speed * 0.004 * boost;
      if (p.x > 1.05) p.x = -0.05;
      const y = (h / (lanes + 1)) * (p.lane + 1) + Math.sin(p.x * 12 + t + p.lane) * (4 + p.lane);
      ctx.fillStyle = `rgba(142,185,196,${0.35 + (p.x % 1) * 0.4})`;
      ctx.beginPath(); ctx.arc(p.x * w, y, p.size, 0, Math.PI * 2); ctx.fill();
    }
    if (!reduce) t += 0.016;
    requestAnimationFrame(draw);
  };
  requestAnimationFrame(draw);
}

function setStage(id) {
  stage = id;
  $$(".stage").forEach((el) => el.classList.toggle("on", el.dataset.stage === id));
  const c = COPY[id];
  if (!c) return;
  const box = $("#stage-detail");
  if (!box) return;
  box.querySelector("[data-idx]").textContent = c.idx;
  box.querySelector("[data-title]").textContent = c.title;
  box.querySelector("[data-body]").textContent = c.body;
  box.querySelector("[data-tags]").innerHTML = c.tags.map((t) => `<li>${t}</li>`).join("");
}

document.addEventListener("DOMContentLoaded", () => {
  bindCanvas($("#wave-nav"), { compact: true });
  bindCanvas($("#wave-hero"));
  bindCanvas($("#wave-portrait"), { compact: true });
  bindFlow($("#flow-top"));

  $$(".stage").forEach((el) => {
    const id = el.dataset.stage;
    el.addEventListener("mouseenter", () => setStage(id));
    el.addEventListener("focus", () => setStage(id));
    el.addEventListener("click", () => setStage(id));
  });
  $(".stages")?.addEventListener("mouseleave", () => setStage("idle"));

  $("#menu-btn")?.addEventListener("click", () => {
    $("#mobile-panel")?.classList.toggle("open");
  });
  $$("#mobile-panel a").forEach((a) => a.addEventListener("click", () => $("#mobile-panel")?.classList.remove("open")));
});
