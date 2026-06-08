import questions from './data/questions.json';

// ---------- ユーティリティ ----------
/** Fisher-Yates シャッフル（元配列は破壊しない） */
function shuffle(array) {
  const a = array.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---------- 状態 ----------
const TOTAL_POOL = questions.length;
const state = {
  screen: 'home',     // 'home' | 'quiz' | 'result'
  count: 10,          // 1ラウンドの出題数
  quiz: [],           // 今回出題する問題（シャッフル済み・選択肢もシャッフル済み）
  index: 0,           // 現在の問題番号
  score: 0,           // 正解数
  answered: false,    // 現在の問題に回答済みか
  selected: null,     // 選んだ選択肢
};

const app = document.getElementById('app');

// ---------- テーマ（ダークモード） ----------
function getInitialTheme() {
  const saved = localStorage.getItem('kihen-theme');
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('kihen-theme', theme);
}
function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  applyTheme(current === 'dark' ? 'light' : 'dark');
  render();
}
applyTheme(getInitialTheme());

// ---------- クイズ進行 ----------
function startQuiz(count) {
  state.count = count;
  const picked = shuffle(questions).slice(0, count);
  // 各問題の選択肢もシャッフル
  state.quiz = picked.map((q) => ({ ...q, choices: shuffle(q.choices) }));
  state.index = 0;
  state.score = 0;
  state.answered = false;
  state.selected = null;
  state.screen = 'quiz';
  render();
}

function selectAnswer(choice) {
  if (state.answered) return;
  state.answered = true;
  state.selected = choice;
  if (choice === state.quiz[state.index].answer) state.score += 1;
  render();
}

function nextQuestion() {
  if (state.index < state.quiz.length - 1) {
    state.index += 1;
    state.answered = false;
    state.selected = null;
    render();
  } else {
    state.screen = 'result';
    render();
  }
}

function goHome() {
  state.screen = 'home';
  render();
}

// ---------- ヘッダー ----------
function headerEl() {
  const header = document.createElement('header');
  header.className = 'app-header';

  const title = document.createElement('h1');
  title.className = 'app-title';
  title.textContent = '🌳 木へん漢字クイズ';

  const themeBtn = document.createElement('button');
  themeBtn.className = 'theme-toggle';
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  themeBtn.textContent = isDark ? '☀️' : '🌙';
  themeBtn.setAttribute('aria-label', 'ダークモード切替');
  themeBtn.addEventListener('click', toggleTheme);

  header.append(title, themeBtn);
  return header;
}

// ---------- 画面：ホーム ----------
function renderHome() {
  const wrap = document.createElement('div');
  wrap.className = 'screen home';

  const lead = document.createElement('p');
  lead.className = 'lead';
  lead.textContent = '木へんの漢字を4択で学ぼう！読みや意味から正しい漢字を選んでね。';

  const info = document.createElement('p');
  info.className = 'pool-info';
  info.textContent = `収録問題数：全 ${TOTAL_POOL} 問（毎回シャッフル出題）`;

  const label = document.createElement('p');
  label.className = 'count-label';
  label.textContent = '出題数を選んでスタート';

  const choices = document.createElement('div');
  choices.className = 'count-buttons';
  const counts = [
    { n: 10, label: '10問' },
    { n: 20, label: '20問' },
    { n: TOTAL_POOL, label: `全${TOTAL_POOL}問` },
  ];
  counts.forEach(({ n, label }) => {
    const btn = document.createElement('button');
    btn.className = 'btn btn-primary count-btn';
    btn.textContent = label;
    btn.addEventListener('click', () => startQuiz(n));
    choices.appendChild(btn);
  });

  wrap.append(lead, info, label, choices);
  return wrap;
}

// ---------- 画面：クイズ ----------
function renderQuiz() {
  const q = state.quiz[state.index];
  const wrap = document.createElement('div');
  wrap.className = 'screen quiz';

  // 進捗バー
  const progress = document.createElement('div');
  progress.className = 'progress';
  const bar = document.createElement('div');
  bar.className = 'progress-bar';
  bar.style.width = `${(state.index / state.quiz.length) * 100}%`;
  progress.appendChild(bar);

  const meta = document.createElement('div');
  meta.className = 'quiz-meta';
  const counter = document.createElement('span');
  counter.textContent = `第 ${state.index + 1} 問 / ${state.quiz.length} 問`;
  const scoreSpan = document.createElement('span');
  scoreSpan.textContent = `正解 ${state.score}`;
  meta.append(counter, scoreSpan);

  const badge = document.createElement('span');
  badge.className = 'type-badge';
  badge.textContent = q.type === 'reading' ? '読みから選ぶ' : '意味から選ぶ';

  const question = document.createElement('h2');
  question.className = 'question';
  question.textContent = q.question;

  const choicesEl = document.createElement('div');
  choicesEl.className = 'choices';
  q.choices.forEach((choice) => {
    const btn = document.createElement('button');
    btn.className = 'btn choice-btn';
    btn.textContent = choice;
    if (state.answered) {
      btn.disabled = true;
      if (choice === q.answer) btn.classList.add('correct');
      else if (choice === state.selected) btn.classList.add('incorrect');
    }
    btn.addEventListener('click', () => selectAnswer(choice));
    choicesEl.appendChild(btn);
  });

  wrap.append(progress, meta, badge, question, choicesEl);

  // 回答後のフィードバック
  if (state.answered) {
    const isCorrect = state.selected === q.answer;
    const feedback = document.createElement('div');
    feedback.className = `feedback ${isCorrect ? 'ok' : 'ng'}`;

    const verdict = document.createElement('p');
    verdict.className = 'verdict';
    verdict.textContent = isCorrect ? '⭕ 正解！' : `❌ 不正解… 正解は「${q.answer}」`;

    const explanation = document.createElement('p');
    explanation.className = 'explanation';
    explanation.textContent = q.explanation;

    const nextBtn = document.createElement('button');
    nextBtn.className = 'btn btn-primary next-btn';
    nextBtn.textContent = state.index < state.quiz.length - 1 ? '次の問題へ ▶' : '結果を見る 🎉';
    nextBtn.addEventListener('click', nextQuestion);

    feedback.append(verdict, explanation, nextBtn);
    wrap.appendChild(feedback);
  }

  return wrap;
}

// ---------- 画面：結果 ----------
function renderResult() {
  const wrap = document.createElement('div');
  wrap.className = 'screen result';

  const total = state.quiz.length;
  const score = state.score;
  const rate = total > 0 ? Math.round((score / total) * 100) : 0;

  let emoji = '🌱';
  let message = 'これからどんどん覚えよう！';
  if (rate === 100) { emoji = '🏆'; message = 'パーフェクト！木へんマスター！'; }
  else if (rate >= 80) { emoji = '🌳'; message = 'すばらしい！よく知ってるね！'; }
  else if (rate >= 50) { emoji = '🌿'; message = 'いい調子！あと少し！'; }

  const big = document.createElement('div');
  big.className = 'result-emoji';
  big.textContent = emoji;

  const scoreEl = document.createElement('div');
  scoreEl.className = 'result-score';
  scoreEl.innerHTML = `<span class="score-num">${score}</span> / ${total} 問正解`;

  const rateEl = document.createElement('div');
  rateEl.className = 'result-rate';
  rateEl.textContent = `正答率 ${rate}%`;

  const msg = document.createElement('p');
  msg.className = 'result-message';
  msg.textContent = message;

  const replayBtn = document.createElement('button');
  replayBtn.className = 'btn btn-primary';
  replayBtn.textContent = '🔁 もう一度同じ問題数で遊ぶ';
  replayBtn.addEventListener('click', () => startQuiz(state.count));

  const homeBtn = document.createElement('button');
  homeBtn.className = 'btn btn-secondary';
  homeBtn.textContent = '🏠 ホームに戻る';
  homeBtn.addEventListener('click', goHome);

  wrap.append(big, scoreEl, rateEl, msg, replayBtn, homeBtn);
  return wrap;
}

// ---------- 描画 ----------
function render() {
  app.innerHTML = '';
  app.appendChild(headerEl());

  const main = document.createElement('main');
  main.className = 'app-main';
  if (state.screen === 'home') main.appendChild(renderHome());
  else if (state.screen === 'quiz') main.appendChild(renderQuiz());
  else if (state.screen === 'result') main.appendChild(renderResult());
  app.appendChild(main);

  const footer = document.createElement('footer');
  footer.className = 'app-footer';
  footer.textContent = '木へん漢字クイズ';
  app.appendChild(footer);
}

render();
