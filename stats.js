/* 분석법 내비 - 통계 계산 (외부 라이브러리 없음) */
const ST = (() => {
  function lgamma(x) {
    const c = [76.18009172947146, -86.50532032941677, 24.01409824083091,
      -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];
    let y = x, tmp = x + 5.5;
    tmp -= (x + 0.5) * Math.log(tmp);
    let ser = 1.000000000190015;
    for (let j = 0; j < 6; j++) ser += c[j] / ++y;
    return -tmp + Math.log(2.5066282746310005 * ser / x);
  }
  function betacf(a, b, x) {
    const MAXIT = 300, EPS = 3e-14, FPMIN = 1e-300;
    let qab = a + b, qap = a + 1, qam = a - 1, c = 1, d = 1 - qab * x / qap;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    d = 1 / d; let h = d;
    for (let m = 1; m <= MAXIT; m++) {
      const m2 = 2 * m;
      let aa = m * (b - m) * x / ((qam + m2) * (a + m2));
      d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN;
      c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN;
      d = 1 / d; h *= d * c;
      aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
      d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN;
      c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN;
      d = 1 / d; const del = d * c; h *= del;
      if (Math.abs(del - 1) < EPS) break;
    }
    return h;
  }
  // 정규화 불완전 베타 I_x(a,b)
  function ibeta(x, a, b) {
    if (x <= 0) return 0; if (x >= 1) return 1;
    const bt = Math.exp(lgamma(a + b) - lgamma(a) - lgamma(b) + a * Math.log(x) + b * Math.log(1 - x));
    if (x < (a + 1) / (a + b + 2)) return bt * betacf(a, b, x) / a;
    return 1 - bt * betacf(b, a, 1 - x) / b;
  }
  // 정규화 불완전 감마 P(a,x)
  function gammp(a, x) {
    if (x <= 0) return 0;
    if (x < a + 1) {
      let ap = a, sum = 1 / a, del = sum;
      for (let n = 0; n < 1000; n++) { ap++; del *= x / ap; sum += del; if (Math.abs(del) < Math.abs(sum) * 3e-14) break; }
      return sum * Math.exp(-x + a * Math.log(x) - lgamma(a));
    }
    let b = x + 1 - a, c = 1 / 1e-300, d = 1 / b, h = d;
    for (let i = 1; i < 1000; i++) {
      const an = -i * (i - a); b += 2;
      d = an * d + b; if (Math.abs(d) < 1e-300) d = 1e-300;
      c = b + an / c; if (Math.abs(c) < 1e-300) c = 1e-300;
      d = 1 / d; const del = d * c; h *= del;
      if (Math.abs(del - 1) < 3e-14) break;
    }
    return 1 - Math.exp(-x + a * Math.log(x) - lgamma(a)) * h;
  }
  const pT2 = (t, df) => ibeta(df / (df + t * t), df / 2, 0.5);           // 양측 p
  const pF = (F, d1, d2) => ibeta(d2 / (d2 + d1 * F), d2 / 2, d1 / 2);     // 우측 p
  const pChi = (x, k) => 1 - gammp(k / 2, x / 2);

  const mean = a => a.reduce((s, v) => s + v, 0) / a.length;
  const vari = a => { const m = mean(a); return a.reduce((s, v) => s + (v - m) ** 2, 0) / (a.length - 1); };
  const sd = a => Math.sqrt(vari(a));
  const median = a => { const s = [...a].sort((x, y) => x - y), n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; };

  function parseNums(txt) {
    const arr = String(txt).split(/[\s,;\t]+/).filter(Boolean).map(Number);
    if (arr.some(v => !Number.isFinite(v))) throw new Error("숫자가 아닌 값이 섞여 있어요. 숫자만 쉼표나 띄어쓰기로 구분해 넣어주세요.");
    return arr;
  }

  function desc(a) {
    if (a.length < 2) throw new Error("값을 2개 이상 넣어주세요.");
    const s = [...a].sort((x, y) => x - y);
    return { n: a.length, mean: mean(a), sd: sd(a), median: median(a), min: s[0], max: s[s.length - 1] };
  }

  function ttestInd(a, b) {
    if (a.length < 2 || b.length < 2) throw new Error("각 집단에 값을 2개 이상 넣어주세요.");
    const m1 = mean(a), m2 = mean(b), v1 = vari(a), v2 = vari(b), n1 = a.length, n2 = b.length;
    const se = Math.sqrt(v1 / n1 + v2 / n2);
    if (se === 0) throw new Error("두 집단 값이 모두 똑같아서 계산할 수 없어요.");
    const t = (m1 - m2) / se;
    const df = (v1 / n1 + v2 / n2) ** 2 / ((v1 / n1) ** 2 / (n1 - 1) + (v2 / n2) ** 2 / (n2 - 1));
    const sp = Math.sqrt(((n1 - 1) * v1 + (n2 - 1) * v2) / (n1 + n2 - 2));
    return { m1, m2, sd1: Math.sqrt(v1), sd2: Math.sqrt(v2), n1, n2, t, df, p: pT2(t, df), d: sp ? (m1 - m2) / sp : 0 };
  }

  function ttestPaired(a, b) {
    if (a.length !== b.length) throw new Error(`전(${a.length}개)과 후(${b.length}개)의 개수가 같아야 해요.`);
    if (a.length < 2) throw new Error("값을 2쌍 이상 넣어주세요.");
    const d = a.map((v, i) => b[i] - v), md = mean(d), sdd = sd(d), n = d.length;
    if (sdd === 0) throw new Error("모든 사람의 변화량이 같아서 계산할 수 없어요.");
    const t = md / (sdd / Math.sqrt(n)), df = n - 1;
    return { m1: mean(a), m2: mean(b), md, sdd, n, t, df, p: pT2(t, df), dz: md / sdd };
  }

  function anova(groups) {
    groups = groups.filter(g => g.length);
    if (groups.length < 2) throw new Error("집단을 2개 이상 넣어주세요.");
    if (groups.some(g => g.length < 2)) throw new Error("각 집단에 값을 2개 이상 넣어주세요.");
    const all = groups.flat(), gm = mean(all), N = all.length, k = groups.length;
    const ssb = groups.reduce((s, g) => s + g.length * (mean(g) - gm) ** 2, 0);
    const ssw = groups.reduce((s, g) => { const m = mean(g); return s + g.reduce((q, v) => q + (v - m) ** 2, 0); }, 0);
    const df1 = k - 1, df2 = N - k;
    if (ssw === 0) throw new Error("집단 안의 값이 모두 똑같아서 계산할 수 없어요.");
    const F = (ssb / df1) / (ssw / df2);
    return { k, N, F, df1, df2, p: pF(F, df1, df2), eta2: ssb / (ssb + ssw), means: groups.map(mean), ns: groups.map(g => g.length) };
  }

  function chisq(table) {
    const R = table.length, C = table[0].length;
    if (R < 2 || C < 2) throw new Error("2행 2열 이상의 표를 넣어주세요.");
    if (table.some(r => r.length !== C)) throw new Error("모든 줄의 칸 수가 같아야 해요.");
    if (table.flat().some(v => v < 0 || !Number.isInteger(v))) throw new Error("사람 수(0 이상의 정수)를 넣어주세요.");
    const rs = table.map(r => r.reduce((a, b) => a + b, 0));
    const cs = table[0].map((_, j) => table.reduce((a, r) => a + r[j], 0));
    const N = rs.reduce((a, b) => a + b, 0);
    if (rs.includes(0) || cs.includes(0)) throw new Error("합계가 0인 행이나 열이 있어요.");
    let x2 = 0, small = 0;
    for (let i = 0; i < R; i++) for (let j = 0; j < C; j++) {
      const e = rs[i] * cs[j] / N; if (e < 5) small++;
      x2 += (table[i][j] - e) ** 2 / e;
    }
    const df = (R - 1) * (C - 1);
    return { x2, df, p: pChi(x2, df), N, V: Math.sqrt(x2 / (N * Math.min(R - 1, C - 1))), smallPct: small / (R * C) };
  }

  function rank(a) {
    const idx = a.map((v, i) => [v, i]).sort((x, y) => x[0] - y[0]), r = new Array(a.length);
    for (let i = 0; i < idx.length;) {
      let j = i; while (j + 1 < idx.length && idx[j + 1][0] === idx[i][0]) j++;
      const avg = (i + j) / 2 + 1; for (let k = i; k <= j; k++) r[idx[k][1]] = avg; i = j + 1;
    }
    return r;
  }
  function pearsonR(x, y) {
    const mx = mean(x), my = mean(y);
    let sxy = 0, sxx = 0, syy = 0;
    for (let i = 0; i < x.length; i++) { sxy += (x[i] - mx) * (y[i] - my); sxx += (x[i] - mx) ** 2; syy += (y[i] - my) ** 2; }
    if (!sxx || !syy) throw new Error("한쪽 값이 모두 같아서 상관을 계산할 수 없어요.");
    return sxy / Math.sqrt(sxx * syy);
  }
  function corr(x, y, spearman) {
    if (x.length !== y.length) throw new Error(`X(${x.length}개)와 Y(${y.length}개)의 개수가 같아야 해요.`);
    if (x.length < 3) throw new Error("값을 3쌍 이상 넣어주세요.");
    const r = spearman ? pearsonR(rank(x), rank(y)) : pearsonR(x, y), n = x.length, df = n - 2;
    const t = Math.abs(r) >= 1 ? Infinity : r * Math.sqrt(df / (1 - r * r));
    return { r, n, df, t, p: Number.isFinite(t) ? pT2(t, df) : 0 };
  }

  return { parseNums, desc, ttestInd, ttestPaired, anova, chisq, corr, pT2, pF, pChi };
})();
