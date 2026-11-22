/* 분석법 내비 - 질문 트리와 분석법 데이터 */
const LINKS = {
  bigdata: "https://happyaidata.kr/free-bigdata.html?utm_source=statnavi&utm_medium=app&utm_campaign=statnavi",
  home: "https://happyaidata.kr/?utm_source=statnavi&utm_medium=app&utm_campaign=statnavi",
  claude: "https://happyaidata.kr/free-claude.html?utm_source=statnavi&utm_medium=app&utm_campaign=statnavi",
  youtube: "https://www.youtube.com/@HappyAI_0612"
};

const QUESTIONS = {
  start: { step: "질문 1", q: "무엇을 알고 싶으세요?", opts: [
    { em: "⚖️", label: "집단끼리 차이가 있는지", sub: "예: 남녀 만족도 차이, 수업 전후 점수 변화", next: "diff_y" },
    { em: "🔗", label: "두 변수가 함께 움직이는지", sub: "예: 공부 시간과 성적의 관계", next: "rel_type" },
    { em: "🎯", label: "무엇이 결과에 영향을 주는지", sub: "예: 만족도에 영향을 주는 요인", next: "pred_y" },
    { em: "📋", label: "설문 문항을 점검하고 묶기", sub: "신뢰도, 요인분석", next: "survey" },
    { em: "💬", label: "텍스트(글) 데이터 분석", sub: "리뷰, 뉴스, 인터뷰, SNS 글", next: "text" },
    { em: "📊", label: "데이터를 요약해서 보기만", sub: "평균, 비율, 빈도표", next: "m:freq" }
  ]},
  diff_y: { step: "질문 2", q: "비교하려는 값은 어떤 형태인가요?", opts: [
    { em: "🔢", label: "숫자 (평균을 비교)", sub: "점수, 키, 시간, 5점 척도 평균", next: "diff_g" },
    { em: "🏷️", label: "범주 (비율을 비교)", sub: "예/아니오, 찬성/반대, 선택한 항목", next: "diff_cat" }
  ]},
  diff_cat: { step: "질문 3", q: "누구를 비교하나요?", opts: [
    { em: "👥", label: "서로 다른 사람들", sub: "예: 남녀의 찬성 비율", next: "m:chisq" },
    { em: "🔁", label: "같은 사람들의 전과 후", sub: "예: 교육 전후 '예' 응답 비율", next: "m:mcnemar" }
  ]},
  diff_g: { step: "질문 3", q: "몇 개의 집단을 비교하나요?", opts: [
    { em: "2️⃣", label: "2개", sub: "예: 남 vs 여, 전 vs 후", next: "diff2_pair" },
    { em: "3️⃣", label: "3개 이상", sub: "예: 1·2·3학년, 지역 A·B·C", next: "diff3_pair" },
    { em: "✖️", label: "나누는 기준이 2개", sub: "예: 성별 × 학년을 동시에", next: "m:twoway" }
  ]},
  diff2_pair: { step: "질문 4", q: "두 집단은 어떤 관계인가요?", opts: [
    { em: "👥", label: "서로 다른 사람들", sub: "예: 실험반 vs 비교반", next: "diff2_ind" },
    { em: "🔁", label: "같은 사람을 두 번 측정", sub: "예: 교육 전 점수 vs 후 점수", next: "diff2_rep" }
  ]},
  diff2_ind: { step: "질문 5", q: "데이터 상태는 어떤가요?", opts: [
    { em: "✅", label: "집단마다 30명 이상이거나, 분포가 고른 편", sub: "대부분 여기에 해당해요", next: "m:ttest_ind" },
    { em: "⚠️", label: "인원이 적고 한쪽으로 치우침", sub: "또는 순위·등수 데이터", next: "m:mannwhitney" },
    { em: "🤔", label: "잘 모르겠어요", sub: "기본 방법부터 알려드릴게요", next: "m:ttest_ind" }
  ]},
  diff2_rep: { step: "질문 5", q: "데이터 상태는 어떤가요?", opts: [
    { em: "✅", label: "30쌍 이상이거나, 전후 차이가 고른 편", sub: "대부분 여기에 해당해요", next: "m:ttest_paired" },
    { em: "⚠️", label: "인원이 적고 한쪽으로 치우침", sub: "또는 순위 데이터", next: "m:wilcoxon" },
    { em: "🤔", label: "잘 모르겠어요", sub: "기본 방법부터 알려드릴게요", next: "m:ttest_paired" }
  ]},
  diff3_pair: { step: "질문 4", q: "집단들은 어떤 관계인가요?", opts: [
    { em: "👥", label: "서로 다른 사람들", sub: "예: 1학년, 2학년, 3학년", next: "diff3_ind" },
    { em: "🔁", label: "같은 사람을 3번 이상 측정", sub: "예: 사전, 사후, 3개월 후", next: "diff3_rep" }
  ]},
  diff3_ind: { step: "질문 5", q: "데이터 상태는 어떤가요?", opts: [
    { em: "✅", label: "집단마다 30명 이상이거나, 분포가 고른 편", sub: "대부분 여기에 해당해요", next: "m:anova" },
    { em: "⚠️", label: "인원이 적고 한쪽으로 치우침", sub: "또는 순위 데이터", next: "m:kruskal" },
    { em: "🤔", label: "잘 모르겠어요", sub: "기본 방법부터 알려드릴게요", next: "m:anova" }
  ]},
  diff3_rep: { step: "질문 5", q: "데이터 상태는 어떤가요?", opts: [
    { em: "✅", label: "인원이 충분하고 분포가 고른 편", sub: "대부분 여기에 해당해요", next: "m:rm_anova" },
    { em: "⚠️", label: "인원이 적고 한쪽으로 치우침", sub: "또는 순위 데이터", next: "m:friedman" },
    { em: "🤔", label: "잘 모르겠어요", sub: "기본 방법부터 알려드릴게요", next: "m:rm_anova" }
  ]},
  rel_type: { step: "질문 2", q: "두 변수는 어떤 형태인가요?", opts: [
    { em: "🔢", label: "둘 다 숫자", sub: "예: 나이와 소득, 공부 시간과 점수", next: "rel_norm" },
    { em: "🏷️", label: "둘 다 범주", sub: "예: 성별과 구매 여부", next: "m:chisq" },
    { em: "🔀", label: "하나는 숫자, 하나는 범주", sub: "사실상 '집단 차이' 문제예요", next: "diff_g" }
  ]},
  rel_norm: { step: "질문 3", q: "데이터 상태는 어떤가요?", opts: [
    { em: "📈", label: "고르게 퍼져 있고 직선 관계 같음", sub: "대부분 여기에 해당해요", next: "m:pearson" },
    { em: "🪜", label: "순위·등수이거나 한쪽으로 치우침", sub: "이상치가 많을 때도", next: "m:spearman" }
  ]},
  pred_y: { step: "질문 2", q: "결과(종속변수)는 어떤 형태인가요?", opts: [
    { em: "🔢", label: "숫자", sub: "예: 만족도 점수, 매출", next: "m:linreg" },
    { em: "☯️", label: "예 / 아니오", sub: "예: 구매 여부, 합격 여부", next: "m:logit" },
    { em: "🧩", label: "중간 경로나 조건에 따른 효과", sub: "매개효과, 조절효과", next: "m:mediation" }
  ]},
  survey: { step: "질문 2", q: "설문에서 무엇을 하고 싶나요?", opts: [
    { em: "🎯", label: "문항들이 일관되게 측정하는지", sub: "신뢰도 확인", next: "m:cronbach" },
    { em: "🧺", label: "많은 문항을 몇 묶음으로 나누기", sub: "탐색적 요인분석", next: "m:efa" },
    { em: "🏗️", label: "정한 구조가 맞는지 검증", sub: "확인적 요인분석, 구조방정식", next: "m:cfa" }
  ]},
  text: { step: "질문 2", q: "텍스트에서 무엇을 찾고 싶나요?", opts: [
    { em: "🔤", label: "많이·중요하게 나온 단어", sub: "빈도, TF-IDF, 워드클라우드", next: "m:tfidf" },
    { em: "🗂️", label: "글 속에 숨은 주제", sub: "토픽모델링 (LDA, BERTopic)", next: "m:topic" },
    { em: "🙂", label: "긍정 / 부정 분위기", sub: "감성분석", next: "m:sentiment" },
    { em: "🕸️", label: "단어끼리의 연결 구조", sub: "의미연결망, CONCOR", next: "m:network" }
  ]}
};

const METHODS = {
  freq: { name: "기술통계 · 빈도분석", en: "Descriptive statistics", group: "요약",
    one: "평균, 표준편차, 빈도와 비율로 데이터를 한눈에 정리해요.",
    when: ["본격적인 분석 전에 항상 먼저 해요", "응답자 특성(성별, 나이대) 표를 만들 때"],
    check: ["숫자 변수는 평균·표준편차, 범주 변수는 빈도·비율로 정리", "이상한 값(0, 999 등 입력 오류)이 없는지 확인"],
    read: ["평균은 중심, 표준편차는 퍼진 정도", "치우친 데이터는 평균보다 중앙값이 더 잘 대표해요"],
    calc: "desc",
    code: {
      Python: "import pandas as pd\ndf = pd.read_csv('data.csv')\nprint(df.describe())            # 숫자 변수 요약\nprint(df['성별'].value_counts(normalize=True))  # 비율",
      R: "df <- read.csv('data.csv')\nsummary(df)\nprop.table(table(df$성별))",
      SPSS: "분석 > 기술통계량 > 빈도분석 (범주 변수)\n분석 > 기술통계량 > 기술통계 (숫자 변수)"
    }},
  ttest_ind: { name: "독립표본 t검정", en: "Independent samples t-test", group: "차이 비교",
    one: "서로 다른 두 집단의 평균이 다른지 확인해요.",
    when: ["남녀의 만족도 평균 비교", "실험반과 비교반의 점수 비교"],
    check: ["두 집단은 서로 다른 사람들", "각 집단 30명 이상이면 분포 걱정은 크게 안 해도 돼요", "분산이 달라도 되는 Welch 방식을 기본으로 쓰면 안전해요"],
    read: ["p < .05 이면 두 평균 차이가 통계적으로 의미 있어요", "Cohen's d로 차이 크기를 봐요 (0.2 작음, 0.5 중간, 0.8 큼)"],
    alt: { id: "mannwhitney", why: "인원이 적고 한쪽으로 치우쳐 있다면" },
    calc: "t2",
    code: {
      Python: "from scipy import stats\na = df[df['집단']=='A']['점수']\nb = df[df['집단']=='B']['점수']\nprint(stats.ttest_ind(a, b, equal_var=False))  # Welch t검정",
      R: "t.test(점수 ~ 집단, data = df)   # 기본이 Welch 방식",
      SPSS: "분석 > 평균 비교 > 독립표본 T 검정\n검정 변수: 점수 / 집단 변수: 집단 (집단 정의 입력)"
    }},
  mannwhitney: { name: "Mann-Whitney U 검정", en: "Mann-Whitney U test", group: "차이 비교",
    one: "두 집단 비교인데 데이터가 치우쳤거나 순위일 때 쓰는 비모수 방법이에요.",
    when: ["집단별 인원이 10~20명 정도로 적을 때", "등수, 순위처럼 간격이 일정하지 않은 데이터"],
    check: ["두 집단은 서로 다른 사람들", "평균 대신 '순위'를 비교한다고 이해하면 쉬워요"],
    read: ["p < .05 이면 두 집단의 분포(중앙값)가 달라요", "결과표에는 평균보다 중앙값을 함께 적어요"],
    alt: { id: "ttest_ind", why: "인원이 충분하고 분포가 고르다면" },
    code: {
      Python: "from scipy import stats\nprint(stats.mannwhitneyu(a, b, alternative='two-sided'))",
      R: "wilcox.test(점수 ~ 집단, data = df)",
      SPSS: "분석 > 비모수 검정 > 레거시 대화상자 > 2-독립표본"
    }},
  ttest_paired: { name: "대응표본 t검정", en: "Paired samples t-test", group: "차이 비교",
    one: "같은 사람을 두 번 잰 값(전/후)의 평균 변화를 확인해요.",
    when: ["교육 전후 점수 변화", "같은 사람의 두 제품 선호도 비교"],
    check: ["전과 후가 같은 사람끼리 짝지어져 있어야 해요", "엑셀에서 한 사람이 한 줄, 전/후가 두 열인 형태"],
    read: ["p < .05 이면 전후 변화가 의미 있어요", "평균 차이(후-전)의 부호로 증가·감소를 봐요"],
    alt: { id: "wilcoxon", why: "인원이 적고 차이가 한쪽으로 치우쳤다면" },
    calc: "paired",
    code: {
      Python: "from scipy import stats\nprint(stats.ttest_rel(df['사전'], df['사후']))",
      R: "t.test(df$사전, df$사후, paired = TRUE)",
      SPSS: "분석 > 평균 비교 > 대응표본 T 검정\n대응 변수: 사전 - 사후"
    }},
  wilcoxon: { name: "Wilcoxon 부호순위 검정", en: "Wilcoxon signed-rank test", group: "차이 비교",
    one: "전/후 비교인데 인원이 적거나 치우친 데이터일 때 쓰는 비모수 방법이에요.",
    when: ["소규모 프로그램 참여자의 전후 비교", "순위 데이터의 전후 비교"],
    check: ["같은 사람끼리 짝지어진 데이터", "평균 대신 중앙값 변화를 본다고 이해하면 쉬워요"],
    read: ["p < .05 이면 전후 변화가 의미 있어요"],
    alt: { id: "ttest_paired", why: "인원이 충분하다면" },
    code: {
      Python: "from scipy import stats\nprint(stats.wilcoxon(df['사전'], df['사후']))",
      R: "wilcox.test(df$사전, df$사후, paired = TRUE)",
      SPSS: "분석 > 비모수 검정 > 레거시 대화상자 > 2-대응표본"
    }},
  anova: { name: "일원분산분석 (ANOVA)", en: "One-way ANOVA", group: "차이 비교",
    one: "세 집단 이상의 평균이 다른지 한 번에 확인해요.",
    when: ["학년별(1·2·3학년) 만족도 비교", "지역별 매출 비교"],
    check: ["집단끼리 서로 다른 사람들", "t검정을 여러 번 하면 오류가 커져서 ANOVA를 써요", "차이가 있으면 사후검정(Tukey, Scheffe)으로 어느 집단끼리 다른지 봐요"],
    read: ["F값과 p값을 봐요. p < .05 이면 적어도 한 집단이 달라요", "에타제곱(η²)으로 효과 크기를 봐요 (.01 작음, .06 중간, .14 큼)"],
    alt: { id: "kruskal", why: "인원이 적고 치우친 데이터라면" },
    calc: "anova",
    code: {
      Python: "from scipy import stats\nfrom statsmodels.stats.multicomp import pairwise_tukeyhsd\ngroups = [g['점수'] for _, g in df.groupby('학년')]\nprint(stats.f_oneway(*groups))\nprint(pairwise_tukeyhsd(df['점수'], df['학년']))  # 사후검정",
      R: "fit <- aov(점수 ~ 학년, data = df)\nsummary(fit)\nTukeyHSD(fit)   # 사후검정",
      SPSS: "분석 > 평균 비교 > 일원배치 분산분석\n사후분석 버튼에서 Tukey 또는 Scheffe 선택"
    }},
  kruskal: { name: "Kruskal-Wallis 검정", en: "Kruskal-Wallis H test", group: "차이 비교",
    one: "세 집단 이상 비교인데 데이터가 치우쳤거나 순위일 때 써요.",
    when: ["집단별 인원이 적을 때", "순위 데이터 비교"],
    check: ["집단끼리 서로 다른 사람들", "차이가 있으면 Dunn 검정 등으로 짝 비교를 해요"],
    read: ["p < .05 이면 적어도 한 집단의 분포가 달라요"],
    alt: { id: "anova", why: "인원이 충분하다면" },
    code: {
      Python: "from scipy import stats\ngroups = [g['점수'] for _, g in df.groupby('학년')]\nprint(stats.kruskal(*groups))",
      R: "kruskal.test(점수 ~ 학년, data = df)",
      SPSS: "분석 > 비모수 검정 > 레거시 대화상자 > K-독립표본"
    }},
  rm_anova: { name: "반복측정 분산분석", en: "Repeated measures ANOVA", group: "차이 비교",
    one: "같은 사람을 세 번 이상 잰 값이 시간에 따라 달라지는지 봐요.",
    when: ["사전·사후·추후(3개월 뒤) 점수 비교", "같은 사람이 세 제품을 모두 평가"],
    check: ["한 사람의 측정값들이 짝지어져 있어야 해요", "구형성 가정을 확인하고, 어긋나면 Greenhouse-Geisser 보정을 써요"],
    read: ["시간 효과의 p < .05 이면 측정 시점 간 차이가 있어요", "사후검정으로 어느 시점끼리 다른지 봐요"],
    alt: { id: "friedman", why: "인원이 적고 치우친 데이터라면" },
    code: {
      Python: "from statsmodels.stats.anova import AnovaRM\n# long 형식: id, 시점, 점수\nprint(AnovaRM(df_long, '점수', 'id', within=['시점']).fit())",
      R: "library(afex)\naov_ez('id', '점수', df_long, within = '시점')",
      SPSS: "분석 > 일반선형모형 > 반복측정\n요인 이름: 시점, 수준 수: 3"
    }},
  friedman: { name: "Friedman 검정", en: "Friedman test", group: "차이 비교",
    one: "같은 사람의 세 번 이상 측정을 비교하는 비모수 방법이에요.",
    when: ["소규모 반복 측정", "같은 사람이 여러 대상을 순위로 평가"],
    check: ["한 사람이 한 줄, 측정 시점이 여러 열인 형태"],
    read: ["p < .05 이면 시점 간 차이가 있어요"],
    alt: { id: "rm_anova", why: "인원이 충분하다면" },
    code: {
      Python: "from scipy import stats\nprint(stats.friedmanchisquare(df['t1'], df['t2'], df['t3']))",
      R: "friedman.test(as.matrix(df[, c('t1','t2','t3')]))",
      SPSS: "분석 > 비모수 검정 > 레거시 대화상자 > K-대응표본"
    }},
  twoway: { name: "이원분산분석", en: "Two-way ANOVA", group: "차이 비교",
    one: "두 기준(예: 성별, 학년)이 평균에 주는 효과와 둘의 상호작용을 함께 봐요.",
    when: ["성별 × 학년에 따른 점수 차이", "교육방법 × 수준별 효과"],
    check: ["각 칸(성별×학년 조합)에 인원이 너무 적지 않은지", "상호작용이 의미 있으면 주효과보다 상호작용을 먼저 해석해요"],
    read: ["각 기준의 주효과 p값, 그리고 상호작용 p값을 따로 봐요", "상호작용은 그래프(선이 교차하는지)로 보면 쉬워요"],
    code: {
      Python: "import statsmodels.formula.api as smf\nfrom statsmodels.stats.anova import anova_lm\nm = smf.ols('점수 ~ C(성별) * C(학년)', data=df).fit()\nprint(anova_lm(m, typ=2))",
      R: "summary(aov(점수 ~ 성별 * 학년, data = df))",
      SPSS: "분석 > 일반선형모형 > 일변량\n고정요인: 성별, 학년"
    }},
  chisq: { name: "카이제곱 검정", en: "Chi-square test", group: "차이·관계",
    one: "범주끼리의 비율 차이, 또는 두 범주 변수가 관련 있는지 확인해요.",
    when: ["성별에 따라 구매 여부 비율이 다른지", "지역과 선호 브랜드가 관련 있는지"],
    check: ["교차표(행 × 열)의 '사람 수'를 넣어요 (비율 아님)", "기대빈도 5 미만인 칸이 20% 넘으면 Fisher 정확검정을 써요"],
    read: ["p < .05 이면 두 변수가 서로 관련 있어요", "크래머 V로 관련 강도를 봐요 (.1 약함, .3 중간, .5 강함)"],
    calc: "chisq",
    code: {
      Python: "import pandas as pd\nfrom scipy import stats\ntab = pd.crosstab(df['성별'], df['구매'])\nchi2, p, dof, expected = stats.chi2_contingency(tab)\nprint(chi2, p)",
      R: "chisq.test(table(df$성별, df$구매))\nfisher.test(table(df$성별, df$구매))  # 칸이 작을 때",
      SPSS: "분석 > 기술통계량 > 교차분석\n통계량 버튼 > 카이제곱 체크"
    }},
  mcnemar: { name: "McNemar 검정", en: "McNemar test", group: "차이 비교",
    one: "같은 사람의 전/후 '예·아니오' 응답 비율이 바뀌었는지 봐요.",
    when: ["교육 전후 '알고 있다' 응답 비율 변화", "캠페인 전후 이용 여부 변화"],
    check: ["같은 사람의 전/후 응답이 짝지어져 있어야 해요", "2 × 2 표(전 예/아니오 × 후 예/아니오)로 정리해요"],
    read: ["p < .05 이면 응답 비율 변화가 의미 있어요"],
    code: {
      Python: "import pandas as pd\nfrom statsmodels.stats.contingency_tables import mcnemar\nprint(mcnemar(pd.crosstab(df['전'], df['후']), exact=True))",
      R: "mcnemar.test(table(df$전, df$후))",
      SPSS: "분석 > 기술통계량 > 교차분석\n통계량 버튼 > McNemar 체크"
    }},
  pearson: { name: "피어슨 상관분석", en: "Pearson correlation", group: "관계",
    one: "두 숫자 변수가 함께 커지거나 작아지는 정도(r)를 봐요.",
    when: ["공부 시간과 성적", "광고비와 매출"],
    check: ["산점도를 먼저 그려 직선 관계인지 확인해요", "상관은 원인-결과가 아니에요"],
    read: ["r은 -1~1. 부호는 방향, 크기는 강도 (.1 약함, .3 중간, .5 강함)", "p < .05 이면 상관이 통계적으로 의미 있어요"],
    alt: { id: "spearman", why: "순위 데이터이거나 이상치가 많다면" },
    calc: "corr",
    code: {
      Python: "from scipy import stats\nprint(stats.pearsonr(df['공부시간'], df['성적']))\nprint(df.corr(numeric_only=True))  # 여러 변수 한 번에",
      R: "cor.test(df$공부시간, df$성적)",
      SPSS: "분석 > 상관분석 > 이변량상관 > Pearson"
    }},
  spearman: { name: "스피어만 순위상관", en: "Spearman rank correlation", group: "관계",
    one: "순위 기준으로 두 변수의 관계를 봐요. 이상치에 강해요.",
    when: ["등수와 등수의 관계", "치우친 데이터, 이상치가 있는 데이터"],
    check: ["직선이 아니어도 '한 방향으로 꾸준히' 변하면 잡아내요"],
    read: ["ρ(로)는 -1~1, 해석은 피어슨 r과 같아요"],
    alt: { id: "pearson", why: "고르게 퍼진 숫자 데이터라면" },
    calc: "corr",
    code: {
      Python: "from scipy import stats\nprint(stats.spearmanr(df['x'], df['y']))",
      R: "cor.test(df$x, df$y, method = 'spearman')",
      SPSS: "분석 > 상관분석 > 이변량상관 > Spearman 체크"
    }},
  linreg: { name: "다중회귀분석", en: "Multiple linear regression", group: "영향·예측",
    one: "여러 요인이 숫자 결과에 각각 얼마나 영향을 주는지 봐요.",
    when: ["서비스 품질, 가격, 접근성이 만족도에 주는 영향", "광고비, 계절이 매출에 주는 영향"],
    check: ["독립변수끼리 너무 비슷하면 안 돼요 (VIF 10 미만)", "범주형 독립변수는 더미변수로 바꿔요"],
    read: ["R²: 모형이 결과를 설명하는 비율", "각 변수의 B(방향·크기)와 p값, 표준화계수 β로 영향력 비교"],
    code: {
      Python: "import statsmodels.formula.api as smf\nm = smf.ols('만족도 ~ 품질 + 가격 + 접근성', data=df).fit()\nprint(m.summary())",
      R: "m <- lm(만족도 ~ 품질 + 가격 + 접근성, data = df)\nsummary(m)\ncar::vif(m)",
      SPSS: "분석 > 회귀분석 > 선형\n통계량 버튼 > 공선성 진단 체크"
    }},
  logit: { name: "로지스틱 회귀분석", en: "Logistic regression", group: "영향·예측",
    one: "여러 요인이 '예/아니오' 결과의 가능성을 얼마나 바꾸는지 봐요.",
    when: ["구매 여부에 영향을 주는 요인", "합격·불합격 예측"],
    check: ["결과 변수는 0/1로 코딩", "결과 '1'이 너무 적으면(예: 5% 미만) 해석이 불안정해요"],
    read: ["오즈비(Exp(B))가 1보다 크면 가능성 증가, 작으면 감소", "예: 오즈비 1.5 = 그 요인이 1 늘 때 가능성(오즈) 1.5배"],
    code: {
      Python: "import numpy as np\nimport statsmodels.formula.api as smf\nm = smf.logit('구매 ~ 나이 + 소득', data=df).fit()\nprint(m.summary())\nprint(np.exp(m.params))   # 오즈비",
      R: "m <- glm(구매 ~ 나이 + 소득, family = binomial, data = df)\nsummary(m)\nexp(coef(m))   # 오즈비",
      SPSS: "분석 > 회귀분석 > 이분형 로지스틱"
    }},
  mediation: { name: "매개효과 · 조절효과", en: "Mediation / Moderation", group: "영향·예측",
    one: "X가 M을 거쳐 Y에 영향을 주는지(매개), 조건 W에 따라 효과가 달라지는지(조절) 봐요.",
    when: ["교육 → 자신감 → 성과 (매개)", "업무량이 스트레스에 주는 영향이 지원 수준에 따라 다른지 (조절)"],
    check: ["매개효과는 부트스트랩 신뢰구간이 0을 포함하지 않는지로 판단해요", "조절효과는 X × W 상호작용항이 핵심이에요"],
    read: ["간접효과 95% 신뢰구간에 0이 없으면 매개효과 있음", "상호작용항 p < .05 이면 조절효과 있음"],
    code: {
      Python: "import pingouin as pg\nprint(pg.mediation_analysis(data=df, x='X', m='M', y='Y', n_boot=5000))\n\n# 조절효과\nimport statsmodels.formula.api as smf\nprint(smf.ols('Y ~ X * W', data=df).fit().summary())",
      R: "library(lavaan)\nmodel <- 'M ~ a*X\n          Y ~ b*M + c*X\n          ind := a*b'\nfit <- sem(model, data = df, se = 'bootstrap')\nsummary(fit)",
      SPSS: "PROCESS macro (Hayes) 설치 후\n분석 > 회귀분석 > PROCESS\n매개: Model 4 / 조절: Model 1"
    }},
  cronbach: { name: "신뢰도 분석 (크론바흐 알파)", en: "Cronbach's alpha", group: "설문",
    one: "같은 개념을 묻는 문항들이 일관되게 응답됐는지 확인해요.",
    when: ["'만족도' 5문항이 한 개념으로 묶이는지", "설문 분석 전 기본 점검"],
    check: ["역문항(반대로 묻는 문항)은 먼저 점수를 뒤집어요", "개념(요인)별로 따로 계산해요"],
    read: ["α ≥ .7 이면 보통 양호, .6대는 탐색 단계에서 허용하기도 해요", "'항목 삭제 시 α'가 크게 오르는 문항은 점검 대상"],
    code: {
      Python: "import pingouin as pg\nprint(pg.cronbach_alpha(data=df[['q1','q2','q3','q4']]))",
      R: "psych::alpha(df[, c('q1','q2','q3','q4')])",
      SPSS: "분석 > 척도분석 > 신뢰도 분석\n통계량 > 항목 제거 시 척도 체크"
    }},
  efa: { name: "탐색적 요인분석 (EFA)", en: "Exploratory factor analysis", group: "설문",
    one: "많은 문항을 비슷한 것끼리 몇 개의 묶음(요인)으로 나눠요.",
    when: ["새로 만든 설문 문항의 구조 확인", "20문항을 3~4개 개념으로 정리"],
    check: ["KMO ≥ .6, Bartlett 검정 p < .05 이면 요인분석에 적합", "응답자 수는 문항 수의 5~10배가 권장돼요"],
    read: ["요인적재량 .4~.5 이상이면 그 요인에 속한다고 봐요", "두 요인에 모두 높게 걸리는 문항은 정리 대상"],
    code: {
      Python: "from factor_analyzer import FactorAnalyzer\nfa = FactorAnalyzer(n_factors=3, rotation='varimax')\nfa.fit(df[items])\nprint(fa.loadings_)",
      R: "psych::KMO(df[, items])\npsych::fa(df[, items], nfactors = 3, rotate = 'varimax')",
      SPSS: "분석 > 차원 축소 > 요인분석\n기술통계: KMO와 Bartlett / 요인회전: 베리멕스"
    }},
  cfa: { name: "확인적 요인분석 · 구조방정식", en: "CFA / SEM", group: "설문",
    one: "미리 정한 요인 구조와 변수 간 경로가 데이터에 잘 맞는지 검증해요.",
    when: ["선행 이론의 척도 구조 확인", "여러 개념 간 인과 경로 모형 검증"],
    check: ["보통 200명 이상의 표본이 권장돼요", "적합도 지수를 함께 봐요"],
    read: ["CFI·TLI ≥ .90, RMSEA ≤ .08 이면 보통 수용 가능", "표준화 경로계수와 p값으로 각 경로를 해석해요"],
    code: {
      Python: "import semopy\ndesc = '''F1 =~ q1 + q2 + q3\nF2 =~ q4 + q5 + q6'''\nm = semopy.Model(desc)\nm.fit(df)\nprint(semopy.calc_stats(m).T)",
      R: "library(lavaan)\nmodel <- 'F1 =~ q1 + q2 + q3\n          F2 =~ q4 + q5 + q6'\nfit <- cfa(model, data = df)\nsummary(fit, fit.measures = TRUE, standardized = TRUE)",
      SPSS: "SPSS AMOS에서 모형을 그려 분석해요"
    }},
  tfidf: { name: "단어 빈도 · TF-IDF", en: "Word frequency / TF-IDF", group: "텍스트",
    one: "많이 나온 단어(빈도)와 특정 문서에서 특히 중요한 단어(TF-IDF)를 찾아요.",
    when: ["리뷰에서 자주 언급되는 키워드", "기간별·집단별 핵심어 비교"],
    check: ["한국어는 형태소 분석으로 명사를 먼저 뽑아요", "'것', '수' 같은 불용어는 빼요"],
    read: ["빈도는 '많이', TF-IDF는 '그 문서에서 특히' 나온 단어", "워드클라우드는 결과를 보여주는 그림이에요"],
    course: "bigdata",
    code: {
      Python: "from kiwipiepy import Kiwi\nfrom sklearn.feature_extraction.text import TfidfVectorizer\nkiwi = Kiwi()\nnouns = lambda t: [w.form for w in kiwi.tokenize(t) if w.tag.startswith('NN')]\nvec = TfidfVectorizer(tokenizer=nouns, token_pattern=None)\nX = vec.fit_transform(df['text'])",
      R: "library(tidytext); library(dplyr)\ndf %>% unnest_tokens(word, text) %>% count(word, sort = TRUE)",
      SPSS: "SPSS에는 기본 기능이 없어요. 파이썬, R, 텍스톰 같은 도구를 써요."
    }},
  topic: { name: "토픽모델링 (LDA · BERTopic)", en: "Topic modeling", group: "텍스트",
    one: "많은 글을 읽지 않고도 그 안에 숨은 주제 묶음을 찾아요.",
    when: ["뉴스 수천 건의 주요 이슈 파악", "고객 리뷰의 불만 주제 분류"],
    check: ["토픽 수는 일관성 점수(coherence)와 해석 가능성을 함께 보고 정해요", "BERTopic은 문맥을 이해해서 짧은 글에도 강해요"],
    read: ["토픽별 상위 단어를 보고 주제 이름을 붙여요", "토픽 비중의 시기별 변화로 흐름을 볼 수 있어요"],
    course: "bigdata",
    code: {
      Python: "from bertopic import BERTopic\nmodel = BERTopic(language='multilingual')\ntopics, probs = model.fit_transform(docs)\nprint(model.get_topic_info())",
      R: "library(topicmodels)\nlda <- LDA(dtm, k = 5, control = list(seed = 1))\nterms(lda, 10)",
      SPSS: "SPSS에는 기본 기능이 없어요. 파이썬이나 R을 써요."
    }},
  sentiment: { name: "감성분석", en: "Sentiment analysis", group: "텍스트",
    one: "글이 긍정인지 부정인지 분위기를 점수로 바꿔요.",
    when: ["제품 리뷰의 긍정·부정 비율", "이슈에 대한 여론 변화"],
    check: ["감성사전 방식은 쉽고 빠르지만 반어·문맥에 약해요", "딥러닝 모델 방식은 정확하지만 준비가 더 필요해요"],
    read: ["문서별 감성 점수의 평균, 긍·부정 비율로 비교해요", "부정 글만 모아 토픽모델링하면 불만 원인이 보여요"],
    course: "bigdata",
    code: {
      Python: "# 감성사전 방식 예시 (KNU 한국어 감성사전 등)\nlex = {'좋다': 1, '만족': 1, '별로': -1, '불편': -1}\ndef score(text):\n    return sum(v for k, v in lex.items() if k in text)\ndf['감성'] = df['text'].apply(score)",
      R: "library(tidytext); library(dplyr)\ndf %>% unnest_tokens(word, text) %>%\n  inner_join(lexicon, by = 'word') %>%\n  group_by(doc_id) %>% summarise(score = sum(value))",
      SPSS: "SPSS에는 기본 기능이 없어요. 파이썬이나 R을 써요."
    }},
  network: { name: "의미연결망 · CONCOR", en: "Semantic network / CONCOR", group: "텍스트",
    one: "함께 등장하는 단어들을 선으로 이어 구조와 핵심 단어를 찾아요.",
    when: ["키워드 간 관계 구조 시각화", "CONCOR로 비슷한 단어 군집 찾기"],
    check: ["문장이나 문서 단위로 함께 나온 단어 쌍(동시출현)을 세요", "너무 드문 단어는 빼야 그림이 읽혀요"],
    read: ["연결 중심성이 높은 단어가 핵심어", "CONCOR 군집은 비슷한 맥락에서 쓰인 단어 묶음"],
    course: "bigdata",
    code: {
      Python: "import itertools, networkx as nx\nfrom collections import Counter\npairs = Counter()\nfor words in docs_nouns:   # 문서별 명사 리스트\n    pairs.update(itertools.combinations(sorted(set(words)), 2))\nG = nx.Graph()\nfor (a, b), w in pairs.most_common(200):\n    G.add_edge(a, b, weight=w)\nprint(sorted(nx.degree_centrality(G).items(), key=lambda x: -x[1])[:10])",
      R: "library(igraph)\ng <- graph_from_data_frame(edges, directed = FALSE)\nsort(degree(g), decreasing = TRUE)[1:10]",
      SPSS: "SPSS에는 기본 기능이 없어요. CONCOR는 UCINET, NetMiner 같은 도구로 해요."
    }}
};

const GROUP_ORDER = ["요약", "차이 비교", "차이·관계", "관계", "영향·예측", "설문", "텍스트"];
