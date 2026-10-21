/* AI Industry Field Guide — static site. Data lives in data/guide.json. */
(function () {
  "use strict";
  const ISSUES = "https://github.com/dnieh/ai-field-guide/issues";
  const ORDER = ["m2", "m1", "m3", "m4", "m5"]; // bottom of the stack to the top
  const $ = (s, el = document) => el.querySelector(s);
  const esc = s => String(s ?? "").replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
  let G = null, byLayer = {}, catOf = {}, layerOf = {};
  const filt = { q: "", layer: "all", cat: "all", kind: "all" };

  fetch("data/guide.json").then(r => r.json()).then(d => {
    G = d;
    G.layers.forEach(L => {
      byLayer[L.id] = L;
      L.cats.forEach(C => { catOf[C.id] = C; layerOf[C.id] = L; });
    });
    // Attach every company to its category once
    const mods = { m1: "m1", m2: "m2", m3: "m3", m4: "m4", m5: "m5" };
    const all = G.companies.map(c => ({ ...c, tier: "deep" })).concat(G.maps.map(m => ({ ...m, tier: "map" })));
    G.all = all;
    G.layers.forEach(L => L.cats.forEach(C => {
      const inCat = x => x.mod === mods[L.id] && (C.ids ? C.ids.includes(x.id) : (C.segs || []).includes(x.seg));
      C.deep = G.companies.filter(inCat);
      C.maps = G.maps.filter(inCat);
      C.deep.concat(C.maps).forEach(x => { x._cat = C.id; });
    }));
    G.all.forEach(x => { const src = (x.tier === "deep" ? G.companies : G.maps).find(y => y.id === x.id && y.mod === x.mod); x._cat = src && src._cat; });
    $("#asof").textContent = `Snapshot as of ${fmtDate(G.updated)}`;
    $("#railQ").placeholder = `Search ${G.stats.companies} companies…`;
    $("#railSearch").addEventListener("submit", e => { e.preventDefault(); filt.q = $("#railQ").value.trim(); location.hash = "search"; route(true); });
    window.addEventListener("hashchange", () => route());
    route();
  }).catch(() => { $("#main").innerHTML = `<p>Couldn't load the guide data. Try reloading the page.</p>`; });

  function fmtDate(s) { const d = new Date(s + "T12:00:00"); return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }); }

  /* ---------- navigation ---------- */
  function renderNav(cur) {
    const curLayer = cur.startsWith("c") ? layerOf[cur] && layerOf[cur].id : cur;
    $("#nav").innerHTML = `<li><a href="#" aria-current="${cur === "home"}"><span class="swatch" style="background:var(--ink)"></span><span>Overview</span><span></span></a></li>` +
      ORDER.map(id => {
        const L = byLayer[id];
        const n = L.cats.reduce((s, C) => s + C.deep.length + C.maps.length, 0);
        const sub = curLayer === id ? `<ul class="cats">${L.cats.map(C => `<li><a href="#${C.id}">${esc(C.title)}</a></li>`).join("")}</ul>` : "";
        return `<li><a href="#${id}" aria-current="${curLayer === id}"><span class="swatch" style="background:var(${L.color})"></span><span>${esc(L.name)}</span><span class="cnt">${n}</span></a>${sub}</li>`;
      }).join("") +
      `<li><a href="#search" aria-current="${cur === "search"}"><span class="swatch" style="background:var(--muted)"></span><span>Search &amp; filter</span><span></span></a></li>` +
      `<li><a href="#about" aria-current="${cur === "about"}"><span class="swatch" style="background:var(--muted)"></span><span>How this was made</span><span></span></a></li>`;
    $("#railFoot").innerHTML = `<span>${G.stats.companies} companies · ${G.stats.checks.toLocaleString()} facts re-checked</span><span>Researched ${esc(G.researched)}</span><a href="${ISSUES}" target="_blank" rel="noopener">Report a correction →</a>`;
  }
  function mobileNav(cur) {
    const curLayer = cur.startsWith("c") ? layerOf[cur] && layerOf[cur].id : cur;
    const items = [["", "Overview", "--ink", cur === "home"]].concat(ORDER.map(id => [id, byLayer[id].short, byLayer[id].color, curLayer === id]), [["search", "Search", "--muted", cur === "search"], ["about", "About", "--muted", cur === "about"]]);
    return `<nav class="mobile-nav" aria-label="Sections">${items.map(([h, t, c, on]) => `<a href="#${h}" aria-current="${on}"><span class="swatch" style="background:var(${c})"></span>${esc(t)}</a>`).join("")}</nav>`;
  }
  const disclaimer = () => `<footer class="disclaimer"><span><b>Snapshot as of ${fmtDate(G.updated)}.</b> Figures come from cited public sources; estimates and unconfirmed reports are labeled, and some may be wrong or out of date. Not investment advice.</span><span>Researched with AI agents and independently fact-checked; see <a href="#about">How this was made</a>. Spot an error? <a href="${ISSUES}" target="_blank" rel="noopener">Report a correction</a>.</span></footer>`;

  /* ---------- overview ---------- */
  function renderHome() {
    const strata = ORDER.map((id, i) => {
      const L = byLayer[id];
      const n = L.cats.reduce((s, C) => s + C.deep.length + C.maps.length, 0);
      return `<a class="stratum" href="#${id}" style="--c:var(${L.color})">
        <span class="lvl">Layer ${i + 1}</span>
        <span><h3>${esc(L.name)}</h3><p>${esc(L.what)}</p><div class="ex">${L.cats.map(C => esc(C.title)).join(" · ")}</div></span>
        <span class="st">${n} companies</span></a>`;
    }).join("");
    const facts = G.facts.map(f => `<li><span>${esc(f.note)}</span><span class="src"><span>${esc(f.date)}</span><a href="${esc(f.url)}" target="_blank" rel="noopener">${esc(f.pub)}</a></span></li>`).join("");
    return `
    <section class="hero">
      <span class="eyebrow">Overview</span>
      <h2>The AI industry, mapped layer by layer</h2>
      <p>A reference guide to ${G.stats.companies} AI companies, from the chips and data centers at the bottom of the stack to the labs that train models, the tools developers use, the products people buy and the robots that act in the physical world. Every figure links to its source, and a separate pass re-checked the claims.</p>
      <div class="meta-row"><span><b>${G.stats.deep}</b> detailed profiles</span><span><b>${G.stats.maps}</b> shorter entries</span><span><b>${G.stats.checks.toLocaleString()}</b> facts re-checked</span><span>Snapshot as of <b>${fmtDate(G.updated)}</b></span></div>
    </section>
    <div class="section-h"><h3>The stack, bottom to top</h3><span class="eyebrow">Open a layer to browse it</span></div>
    <div class="strata">${strata}</div>
    <div class="flow">
      <div><b>Money flowing down</b>Hyperscalers keep raising their AI data-center spending: Amazon guides about $220B for 2026 and Alphabet $195–205B. Most of it ends up with chip, memory and power suppliers.</div>
      <div><b>Revenue flowing up</b>The two largest labs each run at roughly $65–70B a year. One layer up, coding tools and inference platforms passed $1B run-rates, and vertical apps like Harvey and EliseAI reached hundreds of millions.</div>
    </div>
    <div class="section-h"><h3>Things that are true right now</h3><span class="eyebrow">Each links to its source</span></div>
    <ul class="facts">${facts}</ul>
    <div class="section-h"><h3>How to read a company profile</h3></div>
    <div class="howto">
      <div><h4>The numbers</h4>Last round, valuation and revenue, each with the month it was reported. Startup revenue is usually a run-rate (current month × 12), not a full year. Public companies show market cap and the latest quarter instead.</div>
      <div><h4>Labels</h4>Estimates (for example from Sacra) and unconfirmed reports are labeled where they appear. “Pending” means a deal was agreed but hadn't closed when this was researched.</div>
      <div><h4>The check mark</h4>A green dot means every checked claim matched its source. Amber means at least one figure conflicts between sources or couldn't be confirmed; “Details &amp; sources” lists what's open.</div>
    </div>
    ${disclaimer()}`;
  }

  /* ---------- cards ---------- */
  function stat(label, v) {
    if (!v || !v.s) return `<div><dt>${label}</dt><dd>—</dd></div>`;
    return `<div><dt>${label}</dt><dd>${esc(v.s)}${v.d ? `<small>${esc(v.d)}</small>` : ""}</dd></div>`;
  }
  function card(c, showWhere) {
    const open = c.fc.open.length;
    const list = (h, arr, cls = "") => arr && arr.length ? `<div><h5>${h}</h5><ul class="${cls}">${arr.map(x => `<li>${esc(x)}</li>`).join("")}</ul></div>` : "";
    const para = (h, t) => t ? `<div><h5>${h}</h5><p>${esc(t)}</p></div>` : "";
    const srcs = (c.sources || []).map(s => `<li><a href="${esc(s.u)}" target="_blank" rel="noopener">${esc(s.p || "source")}</a> <span class="d">${esc(s.d || "")}</span> — ${esc(s.c)}</li>`).join("");
    const where = showWhere && c._cat ? `<span class="where">${esc(layerOf[c._cat].short)} · ${esc(catOf[c._cat].title)}</span>` : "";
    return `<article class="card">
      <div class="card-top">
        <div><h4>${esc(c.name)}</h4><div class="loc">${esc([c.hq, c.founded && ("founded " + c.founded)].filter(Boolean).join(" · "))}</div></div>
        <span class="status">${esc(c.kindLabel)}</span>
      </div>
      ${where}
      <p class="one">${esc(c.one)}</p>
      ${c.flux ? `<div class="badges"><span class="b flux">${esc(c.flux)}</span></div>` : ""}
      <dl class="stats">${stat("Last round", c.round)}${stat("Valuation", c.val)}${stat("Revenue", c.rev)}</dl>
      ${c.stage ? `<p class="signal"><b>Stage:</b> ${esc(c.stage)}</p>` : ""}
      <div class="check ${open ? "open" : ""}"><i></i>${c.fc.ok} confirmed${c.fc.fixed ? ` · ${c.fc.fixed} corrected` : ""}${open ? ` · ${open} open` : ""}${c.conf ? ` · ${esc(c.conf)} confidence` : ""}</div>
      <details class="more"><summary>Details &amp; sources</summary>
        <div class="dl">
          ${para("Leadership", c.leaders)}
          ${para("Products", c.flagship)}
          ${para("Status", c.status)}
          ${list("Recent", c.recent)}
          ${para("Why it matters", c.why)}
          ${c.roundFull ? para("Funding detail", c.roundFull) : ""}
          ${c.revFull ? para("Revenue detail", c.revFull) : ""}
          ${list("Open fact-check items", c.fc.open, "caveat")}
          ${list("Caveats", c.flags, "caveat")}
          <div><h5>Sources</h5><ul class="srcs">${srcs}</ul></div>
        </div>
      </details>
    </article>`;
  }
  function mapRow(m, showWhere) {
    const open = m.fc.open.length;
    const tip = open ? m.fc.open.join(" | ") : "Checked against its source";
    const where = showWhere && m._cat ? `<small>${esc(layerOf[m._cat].short)} · ${esc(catOf[m._cat].title)}</small>` : "";
    return `<div class="mrow">
      <div class="mname"><b>${esc(m.name)}</b>${where}</div>
      <div class="mone">${esc(m.one)}</div>
      <div class="mround mono">${esc(m.round || "—")}${m.val ? `<small>val. ${esc(m.val)}</small>` : ""}</div>
      <div class="mstat"><span class="status">${esc(m.kindLabel)}</span></div>
      <div class="msrc"><span class="dot ${open ? "open" : ""}" title="${esc(tip)}"></span>${m.src && m.src.u ? `<a href="${esc(m.src.u)}" target="_blank" rel="noopener">${esc(m.src.p || "source")}</a>` : ""} <span class="mono">${esc((m.src && m.src.d) || "")}</span></div>
    </div>`;
  }

  /* ---------- layer pages ---------- */
  function renderLayer(id) {
    const L = byLayer[id];
    const deepN = L.cats.reduce((s, C) => s + C.deep.length, 0), mapN = L.cats.reduce((s, C) => s + C.maps.length, 0);
    const cats = L.cats.map(C => `
      <section class="cat" id="${C.id}">
        <div class="cat-head">
          <h3>${esc(C.title)}</h3>
          <p class="overview">${esc(C.overview)}</p>
          <span class="label">What's happening</span>
          <ul class="happening">${C.happening.map(r => `<li>${esc(r)}</li>`).join("")}</ul>
        </div>
        <div class="grid">${C.deep.map(c => card(c)).join("")}</div>
        ${C.maps.length ? `<div class="maps"><div class="maps-h"><h4>Also in this category</h4><span class="eyebrow">Shorter entries · one dated source each</span></div><div class="mtable">${C.maps.map(m => mapRow(m)).join("")}</div></div>` : ""}
        ${C.notes && C.notes.length ? `<details class="datapoints"><summary>Sourced data points (${C.notes.length})</summary><ul>${C.notes.map(n => `<li>${esc(n.note)} <a href="${esc(n.url)}" target="_blank" rel="noopener">${esc(n.pub)}</a> <span class="mono">${esc(n.date)}</span></li>`).join("")}</ul></details>` : ""}
      </section>`).join("");
    return `
    <section class="hero" style="--layer:var(${L.color})">
      <span class="eyebrow">Layer · ${deepN + mapN} companies</span>
      <h2>${esc(L.name)}</h2>
      <p>${esc(L.intro)}</p>
      <div class="meta-row"><span><b>${deepN}</b> detailed profiles</span><span><b>${mapN}</b> shorter entries</span><span><b>${L.cats.length}</b> categories</span></div>
    </section>
    <nav class="jump" aria-label="Categories">${L.cats.map(C => `<a href="#${C.id}">${esc(C.title)}</a>`).join("")}</nav>
    <div style="--layer:var(${L.color})">${cats}</div>
    ${disclaimer()}`;
  }

  /* ---------- search & filter ---------- */
  function matches(x) {
    if (filt.layer !== "all" && (!x._cat || layerOf[x._cat].id !== filt.layer)) return false;
    if (filt.cat !== "all" && x._cat !== filt.cat) return false;
    if (filt.kind !== "all" && x.kind !== filt.kind) return false;
    if (filt.q) {
      const hay = [x.name, x.one, x.leaders, x.flagship, x.hq, x.status].join(" ").toLowerCase();
      if (!filt.q.toLowerCase().split(/\s+/).every(w => hay.includes(w))) return false;
    }
    return true;
  }
  let shown = 60;
  function renderSearch() {
    const kinds = [["all", "Any status"], ["private", "Private"], ["public", "Public"], ["division", "Big Tech / product"], ["flux", "Acquired or in flux"]];
    const layerOpts = `<option value="all">All layers</option>` + ORDER.map(id => `<option value="${id}" ${filt.layer === id ? "selected" : ""}>${esc(byLayer[id].name)}</option>`).join("");
    const catList = filt.layer === "all" ? G.layers.flatMap(L => L.cats) : byLayer[filt.layer].cats;
    const catOpts = `<option value="all">All categories</option>` + catList.map(C => `<option value="${C.id}" ${filt.cat === C.id ? "selected" : ""}>${esc(C.title)}</option>`).join("");
    return `
    <section class="hero"><span class="eyebrow">Search &amp; filter</span><h2>Find a company</h2><p>Search names, people, products and places across every layer, then narrow by layer, category or status.</p></section>
    <div class="toolbar">
      <input type="search" id="q" value="${esc(filt.q)}" placeholder="Try “humanoid”, “Series B”, “Sequoia” or a founder's name" aria-label="Search companies">
      <select class="chip-sel" id="fLayer" aria-label="Layer">${layerOpts}</select>
      <select class="chip-sel" id="fCat" aria-label="Category">${catOpts}</select>
      <div class="seg" role="group" aria-label="Status">${kinds.map(([k, t]) => `<button class="chip-btn" data-kind="${k}" aria-pressed="${filt.kind === k}">${t}</button>`).join("")}</div>
      <span class="count" id="count"></span>
    </div>
    <div id="results"></div>
    ${disclaimer()}`;
  }
  function fillResults() {
    const deep = G.companies.filter(matches), maps = G.maps.filter(matches);
    $("#count").textContent = `${deep.length + maps.length} of ${G.stats.companies}`;
    const d = deep.slice(0, shown);
    $("#results").innerHTML =
      (deep.length ? `<div class="results-h"><h3>Detailed profiles</h3><span class="eyebrow">${deep.length}</span></div><div class="grid">${d.map(c => card(c, true)).join("")}</div>${deep.length > shown ? `<button class="more-btn" id="more">Show ${Math.min(60, deep.length - shown)} more</button>` : ""}` : "") +
      (maps.length ? `<div class="results-h"><h3>Shorter entries</h3><span class="eyebrow">${maps.length}</span></div><div class="mtable">${maps.map(m => mapRow(m, true)).join("")}</div>` : "") +
      (!deep.length && !maps.length ? `<div class="empty">No companies match. Try fewer words or clear a filter.</div>` : "");
    const more = $("#more"); if (more) more.addEventListener("click", () => { shown += 60; fillResults(); });
  }
  function wireSearch() {
    let t;
    $("#q").addEventListener("input", e => { clearTimeout(t); t = setTimeout(() => { filt.q = e.target.value.trim(); shown = 60; $("#railQ").value = filt.q; fillResults(); }, 120); });
    $("#fLayer").addEventListener("change", e => { filt.layer = e.target.value; filt.cat = "all"; shown = 60; $("#main").innerHTML = mobileNav("search") + renderSearch(); wireSearch(); });
    $("#fCat").addEventListener("change", e => { filt.cat = e.target.value; shown = 60; fillResults(); });
    document.querySelectorAll("[data-kind]").forEach(b => b.addEventListener("click", () => {
      filt.kind = b.dataset.kind; shown = 60;
      document.querySelectorAll("[data-kind]").forEach(x => x.setAttribute("aria-pressed", x === b));
      fillResults();
    }));
    fillResults();
  }

  /* ---------- about ---------- */
  function renderAbout() {
    const all = G.companies.concat(G.maps);
    const ok = all.reduce((s, c) => s + c.fc.ok, 0), fixed = all.reduce((s, c) => s + c.fc.fixed, 0), open = all.reduce((s, c) => s + c.fc.open.length, 0);
    const pct = Math.round(100 * ok / (ok + fixed + open));
    return `
    <section class="hero"><span class="eyebrow">How this was made</span><h2>Method, checks and limits</h2></section>
    <div class="about">
      <p>This guide was researched between ${esc(G.researched)} by AI research agents (Claude, made by Anthropic) working under a strict sourcing rule, then checked by separate fact-checking agents, and compiled and published by Daniel Nieh. It's a snapshot meant to orient you, not a live database.</p>
      <div class="statrow">
        <div><b>${G.stats.companies}</b><span>companies</span></div>
        <div><b>${(ok + fixed + open).toLocaleString()}</b><span>claims re-checked</span></div>
        <div><b>${pct}%</b><span>confirmed as written</span></div>
        <div><b>${fixed}</b><span>found wrong and fixed</span></div>
        <div><b>${open}</b><span>open items, labeled</span></div>
      </div>
      <h3>1. Research from 2026 sources only</h3>
      <p>No funding round, valuation, revenue figure, executive or deal was stated from an AI model's memory. Each claim needed a page the researcher actually opened, recorded with its URL, publisher and date. Company announcements, regulatory filings and major news outlets were preferred; estimates from aggregators like Sacra, and blog sources, are labeled as such. When something couldn't be verified, the field was left blank.</p>
      <h3>2. An independent fact-check</h3>
      <p>A separate agent that hadn't done the research reopened the cited pages and checked each claim: status, funding, valuation, revenue, leadership and recent events. Wrong figures were corrected. Claims that couldn't be confirmed were removed or labeled, and each profile's colored dot shows whether anything is still open.</p>
      <h3>3. Editorial review</h3>
      <p>Category summaries were rewritten after corrections came in. Pending deals are labeled pending, claims that rest on a single weak source are labeled or dropped, and web pages that contained hidden text aimed at AI systems were excluded as sources.</p>
      <h3>Known limits</h3>
      <ul>
        <li><b>A check confirms the source says it, not that the source is right.</b> If a reputable outlet got a number wrong, the error carries through.</li>
        <li><b>Many startup revenue figures are estimates or company claims,</b> not audited numbers.</li>
        <li><b>The fact-checker is the same kind of AI as the researcher,</b> working with a fresh context. That catches misreadings but shares the same blind spots.</li>
        <li><b>Shorter entries</b> rest on one dated source each and got a lighter check.</li>
        <li><b>Coverage is selective.</b> Plenty of real companies are missing, and missing doesn't mean unimportant.</li>
        <li><b>It goes stale.</b> Market caps move daily and private rounds close weekly. Check the latest before relying on any figure.</li>
      </ul>
      <h3>Corrections</h3>
      <p>If you spot something wrong or out of date, please <a href="${ISSUES}" target="_blank" rel="noopener">open an issue on GitHub</a> with a link to a better source.</p>
      <p style="color:var(--muted);font-size:13.5px">Not investment, legal or career advice. Company names and trademarks belong to their owners. Summaries are paraphrased; follow the source links for the original reporting.</p>
    </div>
    ${disclaimer()}`;
  }

  /* ---------- router ---------- */
  let current = null;
  function route(force) {
    const h = (location.hash || "").slice(1);
    let view = "home", anchor = null;
    if (ORDER.includes(h)) view = h;
    else if (/^c\d-\d+$/.test(h) && layerOf[h]) { view = layerOf[h].id; anchor = h; }
    else if (h === "search" || h === "about") view = h;
    if (view !== current || force) {
      current = view;
      const body = view === "home" ? renderHome() : view === "about" ? renderAbout() : view === "search" ? renderSearch() : renderLayer(view);
      $("#main").innerHTML = mobileNav(anchor || view) + body;
      if (view === "search") wireSearch();
      if (!anchor) window.scrollTo(0, 0);
      document.title = view === "home" ? "AI Industry Field Guide" : `${view === "about" ? "How this was made" : view === "search" ? "Search" : byLayer[view].name} · AI Industry Field Guide`;
    }
    renderNav(anchor || view);
    if (anchor) { const el = document.getElementById(anchor); if (el) requestAnimationFrame(() => el.scrollIntoView()); }
  }
})();
