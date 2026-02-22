/* =============================
    📌 DOM 요소
============================= */
const popupTraining = document.getElementById("popupTraining");
const btnTraining = document.getElementById("btnTraining");
const btnTrainingBack = document.getElementById("btnTrainingBack");
const btnStart = document.getElementById("stTraining");
const btnFire = document.getElementById("btnFire");

/* =============================
    📌 회전/속도/점수 관련 상태 변수
============================= */
let isReverse = false;
let speed = 70;
const minSpeed = 15;
const speedStep = 8;

let currentIndex = 0;      
let prevIndex = 0;         // ⭐ 반드시 필요 — Overshoot 계산 용
let targets = [];          

let trainingBestScore = parseInt(localStorage.getItem("trainingBestScore") || "0");
document.getElementById("trainingBestScore").textContent =
  "최고점수: " + trainingBestScore;

let totalScore = 0;
let intervalId = null;

/* =============================
    📌 팝업 열기 / 닫기
============================= */
btnTraining.addEventListener("click", () => {
  popupTraining.style.display = "block";
});
btnTrainingBack.addEventListener("click", () => {
  popupTraining.style.display = "none";
});

/* =============================
    📌 68×68 그리드 생성
============================= */
const grid = document.getElementById("gridBoard");
const cells = [];
const N = 68;

grid.innerHTML = "";

for (let i = 0; i < N * N; i++) {
  const d = document.createElement("div");
  d.classList.add("cell");
  grid.appendChild(d);
  cells.push(d);
}

/* =========================================================
    📌 64방 자동 패턴 생성
========================================================= */
function generatePatterns_64() {
  const cx = 34;
  const cy = 34;
  const radius = 28;
  const steps = 64;
  const result = [];

  for (let step = 0; step < steps; step++) {
    const angle = (step / steps) * Math.PI * 2;

    const centerRow = Math.round(cx + Math.sin(angle) * radius);
    const centerCol = Math.round(cy + Math.cos(angle) * radius);

    const rows = [centerRow - 1, centerRow, centerRow + 1, centerRow + 2];
    const cols = [centerCol - 1, centerCol, centerCol + 1, centerCol + 2];

    const validRows = rows.filter(r => r >= 0 && r < 68);
    const validCols = cols.filter(c => c >= 0 && c < 68);

    result.push({ rows: validRows, cols: validCols });
  }

  return result;
}

const patterns = generatePatterns_64();

/* =============================
    📌 색칠 / 지우기
============================= */
function clearPaint() {
  for (let c of cells) c.classList.remove("paint");
}

function paintPattern(index) {
  const p = patterns[index];

  for (let r of p.rows) {
    for (let c of p.cols) {
      if (r < 0 || c < 0 || r >= N || c >= N) continue;
      const idx = r * N + c;
      cells[idx].classList.add("paint");
    }
  }
}

/* === 표적 === */
function paintTarget(idx) {
  const p = patterns[idx];

  for (let r of p.rows) {
    for (let c of p.cols) {
      if (r < 0 || c < 0 || r >= N || c >= N) continue;
      cells[r * N + c].classList.add("target");
    }
  }
}
function clearTarget() {
  for (let c of cells) c.classList.remove("target");
}

/* =============================
    📌 시작 버튼 → 회전 + 표적 생성
============================= */
btnStart.addEventListener("click", () => {

  totalScore = 0;
  document.getElementById("trainingCurrentScore").textContent = "현재점수: 0";

  paintPattern(currentIndex);

  let targetCount = (totalScore > 400) ? 3 :
    (totalScore > 150) ? 2 : 1;
  spawnTargets(targetCount);

  btnStart.style.display = "none";

  intervalId = setInterval(() => {

    prevIndex = currentIndex;   // ⭐ Overshoot 계산 필수

    clearPaint();
    paintPattern(currentIndex);

    currentIndex++;
    if (currentIndex >= patterns.length) currentIndex = 0;

  }, 55);
});

/* =============================
    📌 정확한 Overshoot 판정
============================= */
function isOvershoot() {

  for (let t of targets) {

    if (!isReverse) {
      // 정방향: prev < t ≤ current
      if ((prevIndex < t && t <= currentIndex) ||
          (prevIndex > currentIndex && (t <= currentIndex || t > prevIndex))) {
        return true;
      }
    }
    else {
      // 역방향: current ≤ t < prev
      if ((currentIndex <= t && t < prevIndex) ||
          (prevIndex < currentIndex && (t < prevIndex || t >= currentIndex))) {
        return true;
      }
    }
  }
  return false;
}

/* =============================
    📌 발사 버튼
============================= */
btnFire.addEventListener("click", () => {

  clearInterval(intervalId);

  // ⛔ 표적 지나치면 즉시 종료
  if (isOvershoot()) {
    endGame(false);
    return;
  }

  // 공(빈곳) 클릭 시 종료
  let anyHit = false;
  for (let t of targets) {
    let diff = Math.abs(currentIndex - t);
    diff = Math.min(diff, patterns.length - diff);
    if (diff <= 3) anyHit = true;
  }
  if (!anyHit) {
    endGame(false);
    return;
  }

  /* ==== 점수 계산 ==== */
  let gained = 0;
  let hitTargets = [];

  for (let t of targets) {
    let diff = Math.abs(currentIndex - t);
    diff = Math.min(diff, patterns.length - diff);

    if (diff <= 1) gained += 40;
    else if (diff <= 3) gained += 20;

    if (diff <= 3) hitTargets.push(t);
  }

  if (hitTargets.length > 1) hitTargets = [hitTargets[0]];

  totalScore += gained;
  document.getElementById("trainingCurrentScore").textContent =
    "현재점수: " + totalScore;

  /* ==== 표적 제거 ==== */
  targets = targets.filter(t => !hitTargets.includes(t));
  clearTarget();
  targets.forEach(t => paintTarget(t));

  /* ==== 표적 남아있으면 회전만 지속 ==== */
  if (targets.length > 0) {

    intervalId = setInterval(() => {
      prevIndex = currentIndex;

      clearPaint();
      paintPattern(currentIndex);

      currentIndex++;
      if (currentIndex >= patterns.length) currentIndex = 0;

    }, speed);

    return;
  }

  /* ==== 모든 표적 제거 후 방향/속도 변경 ==== */
  isReverse = !isReverse;

  speed -= speedStep;
  if (speed < minSpeed) speed = minSpeed;

  if (isReverse) {
    currentIndex = (currentIndex - 1 + patterns.length) % patterns.length;
  } else {
    currentIndex = (currentIndex + 1) % patterns.length;
  }

  intervalId = setInterval(() => {

    prevIndex = currentIndex;

    clearPaint();
    paintPattern(currentIndex);

    if (isReverse) {
      currentIndex--;
      if (currentIndex < 0) currentIndex = patterns.length - 1;
    } else {
      currentIndex++;
      if (currentIndex >= patterns.length) currentIndex = 0;
    }

  }, speed);

  /* ==== 새 표적 생성 ==== */
  let nextCount = (totalScore > 400) ? 3 :
    (totalScore > 150) ? 2 : 1;
  spawnTargets(nextCount);
});

/* =============================
    📌 표적 Spawn
============================= */
function isForbiddenTarget(t) {
  let diff = (t - currentIndex + patterns.length) % patterns.length;
  return (diff >= 1 && diff <= 10);
}
function isTooCloseToExisting(t, list) {
  for (let v of list) {
    let diff = Math.abs(t - v);
    diff = Math.min(diff, patterns.length - diff);
    if (diff < 5) return true;
  }
  return false;
}
function spawnTargets(count) {
  clearTarget();
  targets = [];

  while (targets.length < count) {
    const t = Math.floor(Math.random() * patterns.length);

    if (isForbiddenTarget(t)) continue;
    if (isTooCloseToExisting(t, targets)) continue;

    targets.push(t);
    paintTarget(t);
  }
}

/* =============================
    📌 게임 종료
============================= */
function endGame() {

  clearInterval(intervalId);

  if (totalScore > trainingBestScore) {
    trainingBestScore = totalScore;
    localStorage.setItem("trainingBestScore", trainingBestScore);
    document.getElementById("trainingBestScore").textContent =
      "최고점수: " + trainingBestScore;
  }

  clearPaint();
  clearTarget();
  targets = [];
  totalScore = 0;

  speed = 70;
  isReverse = false;
  currentIndex = 0;

  btnStart.style.display = "block";
}
