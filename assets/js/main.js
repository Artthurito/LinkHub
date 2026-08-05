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

  function buildSwitches() {
    const langBox = $("langSwitch");
    if (F.langSwitch && (P.languages || []).length > 1) {
      langBox.hidden = false;
      langBox.setAttribute("aria-label", "Idioma / Language");
      P.languages.forEach((code) => {
        const b = el("button");
        b.type = "button";
        b.textContent = code.toUpperCase();
        b.addEventListener("click", () => {
          lang = code;
          render();
        });
        b.dataset.lang = code;
        langBox.appendChild(b);
      });
    }

    const modeBox = $("modeSwitch");
    if (F.brandMode) {
      modeBox.hidden = false;
      modeBox.setAttribute("aria-label", "Visualização / View");
      ["fan", "brand"].forEach((m) => {
        const b = el("button");
        b.type = "button";
        b.dataset.mode = m;
        b.addEventListener("click", () => setMode(m));
        modeBox.appendChild(b);
      });
    }
  }

  function setMode(mode) {
    const html = document.documentElement;
    if (html.dataset.mode === mode) return;
    document.body.classList.add("switching");
    window.setTimeout(() => {
      html.dataset.mode = mode;
      syncSwitchStates();
      document.body.classList.remove("switching");
      observeAll();
      animateBars();
    }, 200);
  }

  function syncSwitchStates() {
    document.querySelectorAll("#langSwitch button").forEach((b) => {
      b.setAttribute("aria-pressed", String(b.dataset.lang === lang));
    });
    document.querySelectorAll("#modeSwitch button").forEach((b) => {
      b.setAttribute("aria-pressed", String(b.dataset.mode === document.documentElement.dataset.mode));
      b.textContent = ui("mode." + b.dataset.mode);
    });
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
      const title = el("h2", "group-title");
      title.textContent = t(group.title);
      wrap.appendChild(title);

      const list = el("div", "links" + (group.layout === "split" ? " links--split" : ""));

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

  function formatNumber(value, mode) {
    if (mode === "compact") {
      return new Intl.NumberFormat(locale(), { notation: "compact", maximumFractionDigits: 1 }).format(value);
    }
    return new Intl.NumberFormat(locale()).format(Math.round(value));
  }

  function buildStats() {
    if (!F.counters || !(P.stats || []).length) return;
    $("proof").hidden = false;
    $("statsPeriod").textContent = t(P.statsPeriod);
    $("statsSource").textContent = t(P.statsSource);

    const grid = $("statsGrid");
    grid.innerHTML = "";
    P.stats.forEach((stat) => {
      const box = el("div", "stat");
      const num = el("span", "stat-num");
      num.dataset.count = String(stat.value);
      num.dataset.fmt = stat.fmt || "compact";
      const done = counterState.get(stat) || 0;
      num.textContent = formatNumber(stat.value * done, num.dataset.fmt);
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
      node.textContent = formatNumber(stat.value, node.dataset.fmt);
      return;
    }
    const target = Number(node.dataset.count);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      counterState.set(stat, 1);
      node.textContent = formatNumber(target, node.dataset.fmt);
      return;
    }
    const duration = 1600;
    const start = performance.now();
    function step(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 4);
      counterState.set(stat, eased);
      node.textContent = formatNumber(target * eased, node.dataset.fmt);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function buildBrand() {
    if (!F.brandMode || !P.brand) return;
    $("audience").hidden = false;
    $("offer").hidden = false;

    const bars = (host, rows) => {
      host.innerHTML = "";
      (rows || []).forEach((row) => {
        const line = el("div", "bar-row");
        const meta = el("div", "bar-meta");
        const name = el("span");
        name.textContent = t(row.label);
        const val = el("b");
        val.textContent = row.value + "%";
        meta.appendChild(name);
        meta.appendChild(val);
        const bar = el("div", "bar");
        const fill = el("i");
        fill.dataset.bar = String(row.value);
        bar.appendChild(fill);
        line.appendChild(meta);
        line.appendChild(bar);
        host.appendChild(line);
      });
    };

    bars($("barsAge"), P.brand.audience && P.brand.audience.age);
    bars($("barsRegion"), P.brand.audience && P.brand.audience.region);

    const kv = (host, rows) => {
      host.innerHTML = "";
      (rows || []).forEach((row) => {
        const line = el("div", "kv");
        const name = el("span");
        name.textContent = t(row.label);
        const val = el("b");
        val.textContent = row.value;
        line.appendChild(name);
        line.appendChild(val);
        host.appendChild(line);
      });
    };

    kv($("kvPlatforms"), P.brand.platforms);
    kv($("kvEngagement"), P.brand.engagement);

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

  function buildHeader() {
    const mark = $("brandmark");
    mark.innerHTML = "";
    mark.appendChild(document.createTextNode("@" + P.handle));

    const avatar = $("avatar");
    avatar.src = P.avatar;
    avatar.alt = P.displayName;

    $("displayName").innerHTML = P.displayNameBreak || P.displayName;
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
    if (F.brandMode) {
      const b = el("button", "btn btn--ghost");
      b.type = "button";
      b.textContent = ui("hero.mediakit");
      b.addEventListener("click", () => {
        setMode("brand");
        window.setTimeout(
          () => $("audience").scrollIntoView({ behavior: "smooth", block: "start" }),
          260
        );
      });
      cta.appendChild(b);
    }

    $("footerLeft").textContent = "© " + new Date().getFullYear() + " " + P.displayName;
    $("footerRight").textContent = t(P.footer);
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
    document.querySelectorAll(".section, .proof, .panel, .format").forEach((node) => {
      if (!node.classList.contains("in")) {
        node.classList.add("reveal");
        io.observe(node);
      }
    });
    document.querySelectorAll(".stat-num").forEach((node) => io.observe(node));
  }

  function animateBars() {
    requestAnimationFrame(() => {
      document.querySelectorAll("[data-bar]").forEach((node) => {
        node.style.width = node.dataset.bar + "%";
      });
    });
  }

  function render() {
    document.documentElement.lang = locale();
    document.querySelectorAll("[data-ui]").forEach((node) => {
      node.textContent = ui(node.dataset.ui);
    });
    buildHeader();
    buildStats();
    buildLinks();
    buildBrand();
    buildContact();
    syncSwitchStates();
    observeAll();
    animateBars();
  }

  applyTheme();
  resolveLanguage();
  buildSwitches();
  render();
})();
