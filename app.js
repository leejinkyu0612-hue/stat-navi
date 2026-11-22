/* 분석법 내비 - 화면 */
const CONFIG = {
  // 애드센스 승인 후 'ca-pub-XXXXXXXXXXXXXXXX' 와 광고 단위 슬롯 ID를 넣으면 광고가 켜져요.
  adClient: null,
  adSlot: null
};

const $view = document.getElementById("view");
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const f = (v, d = 2) => Number.isFinite(v) ? v.toFixed(d) : "∞";
const fp = p => p < 0.001 ? "p < .001" : "p = " + p.toFixed(3).replace(/^0/, "");
const sig = p => p < 0.05 ? '<span class="sig y">의미 있음</span>' : '<span class="sig n">의미 없음</span>';
let path = [];

function toast(msg) {
  let t = document.querySelector(".toast");
  if (!t) { t = document.createElement("div"); t.className = "toast"; document.body.appendChild(t); }
  t.textContent = msg; t.classList.add("on"); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("on"), 1600);
}
function setTab(name) {
  document.querySelectorAll(".tabs button").forEach(b => b.classList.toggle("on", b.dataset.tab === name));
}
function adSlot() {
  if (!CONFIG.adClient) return "";
  return `<div class="ad-slot"><ins class="adsbygoogle" style="display:block" data-ad-client="${CONFIG.adClient}" data-ad-slot="${CONFIG.adSlot}" data-ad-format="auto" data-full-width-responsive="true"></ins></div>`;
}
function pushAd() {
  if (!CONFIG.adClient) return;
  if (!window._adLoaded) {
    const s = document.createElement("script"); s.async = true; s.crossOrigin = "anonymous";
    s.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" + CONFIG.adClient;
    document.head.appendChild(s); window._adLoaded = true;
  }
  document.querySelectorAll("ins.adsbygoogle:not([data-adsbygoogle-status])").forEach(() => { try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) {} });
}
function footer() {
  return `<p class="foot">분석 방법을 고르는 데 도움을 드리는 안내 앱이에요.<br>실제 연구 설계는 데이터와 목적에 맞게 한 번 더 확인하세요.<br>
  <a href="privacy.html">개인정보처리방침</a> · 만든 곳 <a href="${LINKS.home}" target="_blank" rel="noopener">해피AI</a></p>`;
}

/* ---------- 분석법 찾기 ---------- */
function viewHome() {
  setTab("find"); path = [];
  const last = localStorage.getItem("sn_last");
  $view.innerHTML = `
    <h1>내 데이터에 맞는<br>분석법, 30초면 찾아요</h1>
    <p class="lead">질문 몇 개에만 답하세요. 어떤 통계 방법을 쓰면 되는지, 결과는 어떻게 읽는지 알려드려요.</p>
    <a class="btn pri" href="#/q/start">분석법 찾기 시작</a>
    ${last && METHODS[last] ? `<div class="row2"><a class="btn ghost" href="#/m/${last}">최근 결과: ${esc(METHODS[last].name)}</a><a class="btn ghost" href="#/calc">계산기 열기</a></div>` : `<div class="row2"><a class="btn ghost" href="#/list">전체 목록 보기</a><a class="btn ghost" href="#/calc">계산기 열기</a></div>`}
    <h2>이런 걸 찾을 수 있어요</h2>
    <div class="card"><ul class="pts">
      <li>두 집단 평균 비교: t검정 / Mann-Whitney</li>
      <li>세 집단 이상: 분산분석(ANOVA) / Kruskal-Wallis</li>
      <li>비율 비교: 카이제곱 / McNemar</li>
      <li>관계와 영향: 상관, 회귀, 로지스틱, 매개·조절</li>
      <li>설문 점검: 신뢰도, 요인분석</li>
      <li>텍스트: 빈도, 토픽모델링, 감성분석, 의미연결망</li>
    </ul></div>
    ${adSlot()}
    ${footer()}`;
  pushAd();
}

function viewQuestion(id) {
  setTab("find");
  const q = QUESTIONS[id]; if (!q) return viewHome();
  if (id === "start") path = ["start"];
  else if (path[path.length - 1] !== id) { const i = path.indexOf(id); if (i >= 0) path = path.slice(0, i + 1); else path.push(id); }
  const pct = Math.min(95, path.length * 20);
  $view.innerHTML = `
    <div class="bar"><i style="width:${pct}%"></i></div>
    <div class="step">${esc(q.step)}</div>
    <h1>${esc(q.q)}</h1>
    <p class="lead">가장 가까운 것을 골라주세요.</p>
    <div class="opts">${q.opts.map(o => `
      <button class="opt" data-next="${o.next}"><span class="em">${o.em}</span><span><b>${esc(o.label)}</b><small>${esc(o.sub)}</small></span></button>`).join("")}
    </div>
    <button class="back" id="qback">← ${id === "start" ? "처음으로" : "이전 질문"}</button>`;
  $view.querySelectorAll(".opt").forEach(b => b.onclick = () => {
    const n = b.dataset.next;
    location.hash = n.startsWith("m:") ? "#/m/" + n.slice(2) : "#/q/" + n;
  });
  document.getElementById("qback").onclick = () => history.back();
}

function viewMethod(id) {
  const m = METHODS[id]; if (!m) return viewHome();
  localStorage.setItem("sn_last", id);
  const fromWizard = path.length > 0;
  setTab(fromWizard ? "find" : "list");
  const langs = Object.keys(m.code);
  const alt = m.alt && METHODS[m.alt.id];
  const cta = m.course === "bigdata"
    ? `<div class="cta"><div class="k">무료 강의 · 12강</div><b>텍스트마이닝 분석법, 무료로 시작해요</b><p>파이썬 처음이어도 괜찮아요. 비전공자도 영상으로 따라 하며 배워요.</p><a href="${LINKS.bigdata}" target="_blank" rel="noopener">무료 강의 보기 →</a></div>`
    : `<div class="cta"><div class="k">해피AI 무료 강의</div><b>데이터 분석, 영상으로 쉽게 배워요</b><p>비전공자도 따라 할 수 있는 AI·데이터 분석 무료 강의를 모아뒀어요.</p><a href="#/learn">무료 강의 보기 →</a></div>`;
  $view.innerHTML = `
    <div class="res-h">
      <span class="tag">${fromWizard ? "추천 분석법" : esc(m.group)}</span>
      <h1>${esc(m.name)}</h1>
      <p>${esc(m.one)}</p>
      ${alt ? `<div class="alt">${esc(m.alt.why)} → <a href="#/m/${m.alt.id}" style="color:#7fe0d2"><b>${esc(alt.name)}</b></a></div>` : ""}
    </div>
    ${m.calc ? `<a class="btn pri" href="#/calc/${m.calc}${id === "spearman" ? "?s=1" : ""}">내 데이터로 바로 계산해보기</a>` : ""}
    <h2>이럴 때 써요</h2><div class="card"><ul class="pts">${m.when.map(x => `<li>${esc(x)}</li>`).join("")}</ul></div>
    <h2>먼저 확인할 것</h2><div class="card"><ul class="pts">${m.check.map(x => `<li>${esc(x)}</li>`).join("")}</ul></div>
    <h2>결과 읽는 법</h2><div class="card"><ul class="pts">${m.read.map(x => `<li>${esc(x)}</li>`).join("")}</ul></div>
    ${adSlot()}
    <h2>도구별 방법</h2>
    <div class="card">
      <div class="code-tabs">${langs.map((l, i) => `<button data-l="${l}" class="${i ? "" : "on"}">${l}</button>`).join("")}</div>
      <button class="copy" id="cpy">복사</button>
      <pre id="code">${esc(m.code[langs[0]])}</pre>
    </div>
    ${cta}
    <div class="row2"><a class="btn ghost" href="#/q/start">다시 찾기</a><button class="btn ghost" id="share">공유하기</button></div>
    ${footer()}`;
  let cur = langs[0];
  $view.querySelectorAll(".code-tabs button").forEach(b => b.onclick = () => {
    cur = b.dataset.l; $view.querySelectorAll(".code-tabs button").forEach(x => x.classList.toggle("on", x === b));
    document.getElementById("code").textContent = m.code[cur];
  });
  document.getElementById("cpy").onclick = () => navigator.clipboard?.writeText(m.code[cur]).then(() => toast("복사했어요"), () => toast("복사가 안 돼요. 길게 눌러 복사해주세요"));
  document.getElementById("share").onclick = async () => {
    const data = { title: "분석법 내비 - " + m.name, text: `${m.name}: ${m.one}`, url: location.href };
    try { if (navigator.share) await navigator.share(data); else { await navigator.clipboard.writeText(data.url); toast("링크를 복사했어요"); } } catch (e) {}
  };
  pushAd();
}

/* ---------- 계산기 ---------- */
const CALCS = {
  t2: "두 집단 t검정", paired: "전후 t검정", anova: "분산분석", chisq: "카이제곱", corr: "상관분석", desc: "기술통계"
};
const EX = {
  a: "72 85 78 90 66 81 77 88 79 84", b: "65 70 74 68 72 61 69 75 66 71",
  pre: "60 55 70 65 58 62 68 59 64 61", post: "68 60 75 70 66 63 74 65 70 66",
  g1: "23 25 21 27 24", g2: "30 28 32 29 31", g3: "26 27 25 28 24",
  tab: "30 20\n15 35", x: "1 2 3 4 5 6 7 8", y: "52 55 61 60 68 70 75 79"
};

function viewCalc(type, q) {
  setTab("calc");
  if (!CALCS[type]) type = "t2";
  const spearman = q === "s=1";
  const forms = {
    t2: `<label class="f">집단 A 값</label><textarea id="a">${EX.a}</textarea>
         <label class="f">집단 B 값</label><textarea id="b">${EX.b}</textarea>
         <p class="hint">엑셀에서 열을 복사해 그대로 붙여넣어도 돼요. 예시 값이 들어 있어요.</p>`,
    paired: `<label class="f">전(사전) 값</label><textarea id="a">${EX.pre}</textarea>
         <label class="f">후(사후) 값</label><textarea id="b">${EX.post}</textarea>
         <p class="hint">같은 사람 순서대로 넣어주세요. 개수가 같아야 해요.</p>`,
    anova: `<label class="f">집단 1</label><textarea id="g1">${EX.g1}</textarea>
         <label class="f">집단 2</label><textarea id="g2">${EX.g2}</textarea>
         <label class="f">집단 3</label><textarea id="g3">${EX.g3}</textarea>
         <label class="f">집단 4 (선택)</label><textarea id="g4"></textarea>`,
    chisq: `<label class="f">교차표 (사람 수)</label><textarea id="tab" style="min-height:96px">${EX.tab}</textarea>
         <p class="hint">한 줄이 한 행이에요. 예: 1행 남(구매 30, 비구매 20), 2행 여(15, 35)</p>`,
    corr: `<label class="f">X 값</label><textarea id="x">${EX.x}</textarea>
         <label class="f">Y 값</label><textarea id="y">${EX.y}</textarea>
         <label class="f" style="display:flex;gap:8px;align-items:center;font-weight:500"><input type="checkbox" id="sp" ${spearman ? "checked" : ""}> 스피어만 순위상관으로 계산</label>`,
    desc: `<label class="f">값</label><textarea id="a">${EX.a}</textarea>`
  };
  $view.innerHTML = `
    <h1>통계 계산기</h1>
    <p class="lead">값을 넣으면 바로 계산해요. 데이터는 이 기기 밖으로 나가지 않아요.</p>
    <div class="seg">${Object.entries(CALCS).map(([k, v]) => `<button data-k="${k}" class="${k === type ? "on" : ""}">${v}</button>`).join("")}</div>
    <div class="card">${forms[type]}
      <button class="btn pri" id="run" style="margin-top:14px">계산하기</button>
      <div id="out"></div>
    </div>
    ${adSlot()}
    ${footer()}`;
  $view.querySelectorAll(".seg button").forEach(b => b.onclick = () => location.hash = "#/calc/" + b.dataset.k);
  const out = document.getElementById("out");
  const v = id => document.getElementById(id).value;
  document.getElementById("run").onclick = () => {
    try { out.className = "out"; out.innerHTML = runCalc(type, v); }
    catch (e) { out.className = "out err"; out.textContent = e.message; }
    out.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };
  pushAd();
}

function runCalc(type, v) {
  const N = ST.parseNums;
  const rows = arr => `<table>${arr.map(([k, val]) => `<tr><td>${k}</td><td>${val}</td></tr>`).join("")}</table>`;
  if (type === "t2") {
    const r = ST.ttestInd(N(v("a")), N(v("b")));
    return `<div class="big">t(${f(r.df, 1)}) = ${f(r.t)}, ${fp(r.p)} ${sig(r.p)}</div>
      ${rows([["집단 A 평균 (SD), n", `${f(r.m1)} (${f(r.sd1)}), ${r.n1}`], ["집단 B 평균 (SD), n", `${f(r.m2)} (${f(r.sd2)}), ${r.n2}`], ["평균 차이 (A-B)", f(r.m1 - r.m2)], ["효과 크기 Cohen's d", f(r.d)]])}
      <p class="hint">Welch 방식(분산이 달라도 되는 t검정)으로 계산했어요.</p>`;
  }
  if (type === "paired") {
    const r = ST.ttestPaired(N(v("a")), N(v("b")));
    return `<div class="big">t(${r.df}) = ${f(r.t)}, ${fp(r.p)} ${sig(r.p)}</div>
      ${rows([["전 평균", f(r.m1)], ["후 평균", f(r.m2)], ["평균 변화 (후-전)", f(r.md)], ["변화량 SD", f(r.sdd)], ["쌍 개수", r.n], ["효과 크기 dz", f(r.dz)]])}`;
  }
  if (type === "anova") {
    const gs = ["g1", "g2", "g3", "g4"].map(id => v(id).trim()).filter(Boolean).map(N);
    const r = ST.anova(gs);
    return `<div class="big">F(${r.df1}, ${r.df2}) = ${f(r.F)}, ${fp(r.p)} ${sig(r.p)}</div>
      ${rows([...r.means.map((m, i) => [`집단 ${i + 1} 평균 (n)`, `${f(m)} (${r.ns[i]})`]), ["효과 크기 η²", f(r.eta2, 3)]])}
      <p class="hint">${r.p < 0.05 ? "어느 집단끼리 다른지는 사후검정(Tukey 등)으로 확인하세요." : "집단 평균 차이가 통계적으로 의미 있지 않아요."}</p>`;
  }
  if (type === "chisq") {
    const tab = v("tab").trim().split(/\n+/).map(l => N(l));
    const r = ST.chisq(tab);
    return `<div class="big">χ²(${r.df}) = ${f(r.x2)}, ${fp(r.p)} ${sig(r.p)}</div>
      ${rows([["전체 인원", r.N], ["크래머 V", f(r.V, 3)], ["기대빈도 5 미만 칸", Math.round(r.smallPct * 100) + "%"]])}
      ${r.smallPct > 0.2 ? `<p class="hint" style="color:#b45309">기대빈도 5 미만 칸이 20%를 넘어요. Fisher 정확검정을 권해요.</p>` : ""}`;
  }
  if (type === "corr") {
    const sp = document.getElementById("sp").checked;
    const r = ST.corr(N(v("x")), N(v("y")), sp);
    const s = Math.abs(r.r), lvl = s >= .5 ? "강한" : s >= .3 ? "중간 정도의" : s >= .1 ? "약한" : "거의 없는";
    return `<div class="big">${sp ? "ρ" : "r"} = ${f(r.r, 3)}, ${fp(r.p)} ${sig(r.p)}</div>
      ${rows([["쌍 개수", r.n], ["방향", r.r >= 0 ? "같이 커져요 (+)" : "반대로 움직여요 (-)"], ["강도", lvl + " 관계"]])}`;
  }
  if (type === "desc") {
    const r = ST.desc(N(v("a")));
    return rows([["개수", r.n], ["평균", f(r.mean)], ["표준편차", f(r.sd)], ["중앙값", f(r.median)], ["최솟값", f(r.min)], ["최댓값", f(r.max)]]);
  }
}

/* ---------- 목록 / 강의 ---------- */
function viewList() {
  setTab("list"); path = [];
  const by = {}; Object.entries(METHODS).forEach(([id, m]) => (by[m.group] = by[m.group] || []).push([id, m]));
  $view.innerHTML = `<h1>전체 분석법</h1><p class="lead">이름을 알면 바로 찾아보세요.</p>
    <input type="text" id="qs" placeholder="검색: t검정, 회귀, 토픽..." autocomplete="off">
    <div id="lst">${GROUP_ORDER.filter(g => by[g]).map(g => `<div class="grp" data-g>${g}</div>` + by[g].map(([id, m]) =>
      `<a class="list-item" href="#/m/${id}" data-s="${esc((m.name + m.en + m.one).toLowerCase())}"><span><b>${esc(m.name)}</b><small>${esc(m.one)}</small></span><span class="arr">›</span></a>`).join("")).join("")}</div>
    ${footer()}`;
  $view.querySelector("a.list-item") && document.querySelectorAll(".list-item").forEach(a => a.style.textDecoration = "none");
  document.querySelectorAll(".list-item").forEach(a => a.style.color = "inherit");
  document.getElementById("qs").oninput = e => {
    const s = e.target.value.trim().toLowerCase().replace(/\s/g, "");
    document.querySelectorAll(".list-item").forEach(a => a.style.display = !s || a.dataset.s.replace(/\s/g, "").includes(s) ? "" : "none");
    document.querySelectorAll(".grp").forEach(g => {
      let n = g.nextElementSibling, any = false;
      while (n && !n.classList.contains("grp")) { if (n.style.display !== "none") any = true; n = n.nextElementSibling; }
      g.style.display = any ? "" : "none";
    });
  };
}

function viewLearn() {
  setTab("learn"); path = [];
  $view.innerHTML = `<h1>무료 강의</h1><p class="lead">AI공학박사 이진규 대표(해피AI)가 만든 무료 강의예요.</p>
    <div class="cta"><div class="k">무료 · 12강</div><b>빅데이터 · 텍스트마이닝 분석법 입문</b><p>비전공자·인문학도도 할 수 있어요. 파이썬을 몰라도 괜찮아요.</p><a href="${LINKS.bigdata}" target="_blank" rel="noopener">무료로 보기 →</a></div>
    <div class="cta"><div class="k">무료 · 10강</div><b>Claude로 업무 자동화 시작하기</b><p>반복 업무를 AI에게 맡기는 방법을 따라 해봐요.</p><a href="${LINKS.claude}" target="_blank" rel="noopener">무료로 보기 →</a></div>
    <div class="card"><b>유튜브 채널 · 해피AI 이진규</b><p class="hint" style="margin:4px 0 10px">AI·데이터 분석 영상을 꾸준히 올려요.</p><a class="btn ghost" href="${LINKS.youtube}" target="_blank" rel="noopener">채널 보기</a></div>
    ${footer()}`;
}

/* ---------- 라우터 ---------- */
function route() {
  const h = location.hash.replace(/^#\/?/, "");
  const [p, qs] = h.split("?"); const [a, b] = p.split("/");
  window.scrollTo(0, 0);
  if (a === "q") viewQuestion(b);
  else if (a === "m") viewMethod(b);
  else if (a === "calc") viewCalc(b, qs);
  else if (a === "list") viewList();
  else if (a === "learn") viewLearn();
  else viewHome();
}
window.addEventListener("hashchange", route);
document.querySelectorAll(".tabs button").forEach(b => b.onclick = () => {
  const t = b.dataset.tab; location.hash = t === "find" ? "#/" : t === "calc" ? "#/calc" : "#/" + t;
});
document.getElementById("goHome").onclick = () => location.hash = "#/";
route();

if ("serviceWorker" in navigator) window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
