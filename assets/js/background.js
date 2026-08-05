/* Partículas do fundo. */
(function () {
  "use strict";

  const canvas = document.getElementById("bg");
  const wantsParticles = ((window.PROFILE || {}).features || {}).particles !== false;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!canvas || !wantsParticles) return;

  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return;

  const AREA_PER_DOT = 16000;
  const MAX_DOTS = 90;
  const SPEED = 0.05;
  const RADIUS = [0.6, 1.8];

  let dots = [];
  let w = 0;
  let h = 0;
  let dpr = 1;
  let accent = "#E8402F";
  let raf = 0;
  let last = 0;

  const rand = (min, max) => min + Math.random() * (max - min);

  function resize() {
    w = window.innerWidth;
    h = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed();
  }

  function seed() {
    const count = Math.min(MAX_DOTS, Math.round((w * h) / AREA_PER_DOT));
    dots = Array.from({ length: count }, () => {
      const angle = rand(0, Math.PI * 2);
      return {
        x: rand(0, w),
        y: rand(0, h),
        r: rand(RADIUS[0], RADIUS[1]),
        vx: Math.cos(angle) * SPEED,
        vy: Math.sin(angle) * SPEED,
        tinted: Math.random() < 0.18,
        phase: rand(0, Math.PI * 2),
        twinkle: rand(0.0006, 0.0016),
      };
    });
  }

  function draw(now) {
    const dt = last ? Math.min(now - last, 48) : 16;
    last = now;

    ctx.clearRect(0, 0, w, h);

    dots.forEach((d) => {
      if (!reduce) {
        d.x += d.vx * dt;
        d.y += d.vy * dt;
        if (d.x < -4) d.x = w + 4;
        else if (d.x > w + 4) d.x = -4;
        if (d.y < -4) d.y = h + 4;
        else if (d.y > h + 4) d.y = -4;
        d.phase += d.twinkle * dt;
      }

      const alpha = 0.16 + Math.sin(d.phase) * 0.1;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fillStyle = d.tinted ? accent : "#EFE9E1";
      ctx.globalAlpha = Math.max(alpha, 0.04);
      ctx.fill();
    });

    ctx.globalAlpha = 1;
    if (!reduce) raf = requestAnimationFrame(draw);
  }

  function start() {
    cancelAnimationFrame(raf);
    last = 0;
    raf = requestAnimationFrame(draw);
  }

  requestAnimationFrame(() => {
    const themed = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
    if (themed) accent = themed;
    resize();
    start();
  });

  let resizeTimer = 0;
  window.addEventListener(
    "resize",
    () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        resize();
        if (reduce) draw(performance.now());
      }, 180);
    },
    { passive: true }
  );

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) cancelAnimationFrame(raf);
    else if (!reduce) start();
  });
})();
