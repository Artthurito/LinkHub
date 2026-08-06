(function () {
  "use strict";

  const P = window.PROFILE;
  const F = P.features || {};
  let lang = "pt";

  const $ = (id) => document.getElementById(id);
  const el = (tag, cls) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    return n;
  };

  function t(value) {
    if (value == null) return "";
    if (typeof value === "string") return value;
    return value[lang] ?? value.pt ?? Object.values(value)[0] ?? "";
  }
  const ui = (key) => (window.UI[lang] && window.UI[lang][key]) || window.UI.pt[key] || key;
  const locale = () => (lang === "en" ? "en-US" : "pt-BR");

  function applyTheme() {
    const theme = window.THEMES[P.theme] || window.THEMES.vermelho;
    const base = window.BASE_TOKENS;
    const root = document.documentElement.style;

    root.setProperty("--accent", theme.accent);
    root.setProperty("--accent-soft", theme.accentSoft);
    root.setProperty("--on-accent", theme.onAccent);
    root.setProperty("--glow", theme.glow);

    root.setProperty("--ink", base.ink);
    root.setProperty("--carbon", base.carbon);
    root.setProperty("--carbon-2", base.carbon2);
    root.setProperty("--edge", base.edge);
    root.setProperty("--edge-hi", base.edgeHi);
    root.setProperty("--bone", base.bone);
    root.setProperty("--mist", base.mist);
    root.setProperty("--live", base.live);

    const choice = P.progressColor || "accent";
    const progress = choice === "accent" ? theme.accent : choice === "bone" ? base.bone : choice;
    root.setProperty("--progress", progress);

    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", base.ink);

    if (F.grain !== false) document.body.classList.add("has-grain");
    document.body.dataset.live = String(F.liveStatus && P.live.isLive);
  }

  function resolveLanguage() {
    const available = P.languages || ["pt"];
    if (P.defaultLanguage && P.defaultLanguage !== "auto") {
      lang = available.includes(P.defaultLanguage) ? P.defaultLanguage : available[0];
      return;
    }
    const nav = (navigator.language || "pt").toLowerCase();
    const guess = nav.startsWith("pt") ? "pt" : "en";
    lang = available.includes(guess) ? guess : available[0];
  }

  function buildLangSwitch() {
    const box = $("langSwitch");
    if (!F.langSwitch || (P.languages || []).length < 2) return;
    box.hidden = false;
    box.setAttribute("aria-label", "Idioma / Language");
    P.languages.forEach((code) => {
      const b = el("button");
      b.type = "button";
      b.textContent = code.toUpperCase();
      b.dataset.lang = code;
      b.addEventListener("click", () => {
        lang = code;
        render();
      });
      box.appendChild(b);
    });
  }

  function syncLangState() {
    document.querySelectorAll("#langSwitch button").forEach((b) => {
      b.setAttribute("aria-pressed", String(b.dataset.lang === lang));
    });
  }

  /* linha de progresso do topo */
  function bindProgress() {
    const bar = $("progress");
    if (!bar) return;
    let ticking = false;
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
      bar.style.width = Math.min(pct, 100) + "%";
      ticking = false;
    };
    window.addEventListener(
      "scroll",
      () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(update);
      },
      { passive: true }
    );
    window.addEventListener("resize", update, { passive: true });
    update();
  }

  function buildIcon(platformKey) {
    const meta = window.PLATFORMS[platformKey] || window.PLATFORMS.link;
    const box = el("span", "link-icon");
    box.style.setProperty("--brand", meta.brand);

    const img = el("img");
    img.src = meta.icon;
    img.alt = "";
    img.loading = "lazy";
    /* Se o PNG ainda não foi adicionado, mostra o monograma no lugar. */
    img.addEventListener("error", () => {
      img.remove();
      const mono = el("span", "mono");
      mono.textContent = meta.fallback;
      box.appendChild(mono);
    });

    box.appendChild(img);
    return box;
  }

  function buildLinks() {
    const host = $("linkGroups");
    host.innerHTML = "";

    (P.groups || []).forEach((group) => {
      if (group.enabled === false) return;
      const visible = (group.links || []).filter((l) => l.enabled !== false && l.url);
      if (!visible.length) return;

      const wrap = el("div", "group");
      const title = el("h3", "group-title");
      title.textContent = t(group.title);
      wrap.appendChild(title);

      const list = el("div", "links");

      visible.forEach((link) => {
        const meta = window.PLATFORMS[link.platform] || window.PLATFORMS.link;
        const a = el("a", "link" + (link.featured ? " link--feature" : ""));
        a.href = link.url;
        a.target = "_blank";
        a.rel = "noopener";

        a.appendChild(buildIcon(link.platform));

        const text = el("span", "link-text");
        const tt = el("span", "link-title");
        tt.textContent = link.label || meta.label;
        const sub = el("span", "link-sub");
        sub.textContent = t(link.subtitle);
        text.appendChild(tt);
        if (sub.textContent) text.appendChild(sub);
        a.appendChild(text);

        if (link.livePill && F.liveStatus && P.live.isLive) {
          const pill = el("span", "pill");
          pill.textContent = ui("links.livepill");
          a.appendChild(pill);
        }

        const arrow = el("span", "link-arrow");
        arrow.textContent = "→";
        a.appendChild(arrow);

        list.appendChild(a);
      });

      wrap.appendChild(list);
      host.appendChild(wrap);
    });
  }

  /* prova social */
  const counterState = new WeakMap();
  const COUNTER_STEPS = 100;
  const STATS_LOCALE = "en-US";

  function formatNumber(value, mode) {
    if (mode === "compact") {
      return new Intl.NumberFormat(STATS_LOCALE, { notation: "compact", maximumFractionDigits: 1 }).format(value);
    }
    return new Intl.NumberFormat(STATS_LOCALE).format(Math.round(value));
  }

  function paintValue(node, value) {
    const rounded = Math.round(value);
    const suffix = rounded > 0 ? node.dataset.suffix || "" : "";
    node.textContent = formatNumber(rounded, node.dataset.fmt) + suffix;
  }

  function buildStats() {
    if (!F.counters || !(P.stats || []).length) return;
    $("numbers").hidden = false;
    $("statsPeriod").textContent = t(P.statsPeriod);
    $("statsSource").textContent = t(P.statsSource);

    const grid = $("statsGrid");
    grid.innerHTML = "";
    P.stats.forEach((stat) => {
      const box = el("div", "stat");
      const num = el("span", "stat-num");
      num.dataset.count = String(stat.value);
      num.dataset.fmt = stat.fmt || "compact";
      num.dataset.suffix = stat.suffix || "";
      const done = counterState.get(stat) || 0;
      paintValue(num, stat.value * done);
      num.__stat = stat;
      const label = el("span", "stat-label");
      label.textContent = t(stat.label);
      box.appendChild(num);
      box.appendChild(label);
      grid.appendChild(box);
    });
  }

  function runCounter(node) {
    const stat = node.__stat;
    if (counterState.get(stat) === 1) {
      paintValue(node, stat.value);
      return;
    }
    const target = Number(node.dataset.count);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      counterState.set(stat, 1);
      paintValue(node, target);
      return;
    }
    const duration = P.counterDuration || 3000;
    const start = performance.now();
    let painted = -1;
    function step(now) {
      const p = Math.min((now - start) / duration, 1);
      const index = Math.min(Math.round(p * COUNTER_STEPS), COUNTER_STEPS);
      if (index !== painted) {
        painted = index;
        const done = index / COUNTER_STEPS;
        counterState.set(stat, done);
        paintValue(node, target * done);
      }
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function buildOffer() {
    if (!F.brandSection || !P.brand) return;
    $("offer").hidden = false;

    const formats = $("formats");
    formats.innerHTML = "";
    (P.brand.formats || []).forEach((f) => {
      const card = el("div", "format");
      const h = el("h3");
      h.textContent = t(f.title);
      const p = el("p");
      p.textContent = t(f.text);
      card.appendChild(h);
      card.appendChild(p);
      formats.appendChild(card);
    });

    const partners = P.brand.partners || [];
    $("partnersBlock").hidden = partners.length === 0;
    const box = $("partners");
    box.innerHTML = "";
    partners.forEach((name) => {
      const tag = el("span", "partner");
      tag.textContent = name;
      box.appendChild(tag);
    });
  }

  function buildContact() {
    const c = P.contact || {};
    $("contactTitle").textContent = t(c.title);
    $("contactHeadline").innerHTML = t(c.headline);
    $("contactBody").textContent = t(c.body);

    const row = $("contactActions");
    row.innerHTML = "";

    if (c.telegram && c.telegram.enabled) {
      const a = el("a", "btn btn--primary");
      a.href = c.telegram.url;
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = c.telegram.handle || ui("contact.telegram");
      row.appendChild(a);
    }

    if (c.email && c.email.enabled && c.email.address) {
      const a = el("a", "btn btn--ghost");
      a.href = "mailto:" + c.email.address;
      a.textContent = c.email.address;
      row.appendChild(a);
    }

    const copyTarget = (c.email && c.email.enabled && c.email.address) || (c.telegram && c.telegram.handle);
    if (copyTarget) {
      const b = el("button", "btn btn--ghost");
      b.type = "button";
      b.textContent = ui("contact.copy");
      b.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(copyTarget);
          const ok = $("copyOk");
          ok.classList.add("show");
          window.setTimeout(() => ok.classList.remove("show"), 2200);
        } catch (err) {
          window.prompt(ui("contact.copy"), copyTarget);
        }
      });
      row.appendChild(b);
    }

    if (c.mediaKitPdf && c.mediaKitPdf.enabled && c.mediaKitPdf.url) {
      const a = el("a", "btn btn--ghost");
      a.href = c.mediaKitPdf.url;
      a.setAttribute("download", "");
      a.textContent = ui("contact.pdf");
      row.appendChild(a);
    }
  }

  function buildHero() {
    const avatar = $("avatar");
    avatar.src = P.avatar;
    avatar.alt = P.displayName;

    $("displayName").textContent = P.displayName;
    $("tagline").textContent = t(P.tagline);

    if (F.liveStatus) {
      $("status").hidden = false;
      $("statusText").textContent = P.live.isLive ? t(P.live.onText) : t(P.live.offText);
    }

    const cta = $("ctaRow");
    cta.innerHTML = "";
    if (P.hero && P.hero.primaryUrl) {
      const a = el("a", "btn btn--primary");
      a.href = P.hero.primaryUrl;
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = t(P.hero.primaryCta);
      cta.appendChild(a);
    }
  }

  function buildFooter() {
    const year = new Date().getFullYear();
    $("footerText").textContent = "© " + year + " " + P.legalName + " " + ui("footer.rights");
  }

  function applyLive(isLive) {
    if (P.live.isLive === isLive) return;
    P.live.isLive = isLive;
    document.body.dataset.live = String(F.liveStatus && isLive);
    if (F.liveStatus) {
      $("statusText").textContent = isLive ? t(P.live.onText) : t(P.live.offText);
    }
    buildLinks();
    observeAll();
  }

  function watchLive() {
    const url = P.live && P.live.endpoint;
    if (!url || !F.liveStatus) return;

    const poll = () =>
      window
        .fetch(url, { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (d && typeof d.isLive === "boolean") applyLive(d.isLive);
        })
        .catch(() => {});

    poll();
    const seconds = Math.max(P.live.pollSeconds || 60, 30);
    window.setInterval(poll, seconds * 1000);
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) poll();
    });
  }

  function buildStructuredData() {
    const canonical = document.querySelector('link[rel="canonical"]');
    const base = canonical ? canonical.href : window.location.href;
    const abs = (p) => new URL(p, base).href;

    const sameAs = (P.groups || [])
      .filter((g) => g.enabled !== false)
      .reduce((acc, g) => acc.concat(g.links || []), [])
      .filter((l) => l.enabled !== false && /^https?:\/\//.test(l.url || ""))
      .map((l) => l.url);

    if (P.contact && P.contact.telegram && P.contact.telegram.enabled && P.contact.telegram.url) {
      sameAs.push(P.contact.telegram.url);
    }

    const person = {
      "@type": "Person",
      name: P.legalName || P.displayName,
      alternateName: P.displayName,
      url: base,
      image: abs(P.avatar),
      description: t(P.tagline),
      sameAs: Array.from(new Set(sameAs)),
    };

    if (P.contact && P.contact.email && P.contact.email.enabled && P.contact.email.address) {
      person.email = P.contact.email.address;
    }

    const data = {
      "@context": "https://schema.org",
      "@type": "ProfilePage",
      url: base,
      inLanguage: locale(),
      mainEntity: person,
    };

    let node = $("ldjson");
    if (!node) {
      node = document.createElement("script");
      node.type = "application/ld+json";
      node.id = "ldjson";
      document.head.appendChild(node);
    }
    node.textContent = JSON.stringify(data).replace(/</g, "\\u003c");
  }

  /* animações */
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in");
        if (entry.target.__stat) runCounter(entry.target);
        io.unobserve(entry.target);
      });
    },
    { threshold: 0.25, rootMargin: "0px 0px -8% 0px" }
  );

  function observeAll() {
    document.querySelectorAll(".section, .format").forEach((node) => {
      if (!node.classList.contains("in")) {
        node.classList.add("reveal");
        io.observe(node);
      }
    });
    document.querySelectorAll(".stat-num").forEach((node) => io.observe(node));
  }

  function bindSpotlight() {
    const SELECTOR = ".link, .format, .proof, .contact-card";
    let pending = null;
    let frame = 0;

    const flush = () => {
      frame = 0;
      if (!pending) return;
      const { card, x, y } = pending;
      const box = card.getBoundingClientRect();
      card.style.setProperty("--mx", (x - box.left) + "px");
      card.style.setProperty("--my", (y - box.top) + "px");
    };

    document.addEventListener(
      "pointermove",
      (e) => {
        const card = e.target instanceof Element && e.target.closest(SELECTOR);
        if (!card) return;
        pending = { card, x: e.clientX, y: e.clientY };
        if (!frame) frame = requestAnimationFrame(flush);
      },
      { passive: true }
    );
  }

  function render() {
    document.documentElement.lang = locale();
    document.querySelectorAll("[data-ui]").forEach((node) => {
      node.textContent = ui(node.dataset.ui);
    });
    buildHero();
    buildStats();
    buildLinks();
    buildOffer();
    buildContact();
    buildFooter();
    buildStructuredData();
    syncLangState();
    observeAll();
  }

  applyTheme();
  resolveLanguage();
  buildLangSwitch();
  bindProgress();
  bindSpotlight();
  render();
  watchLive();
})();
