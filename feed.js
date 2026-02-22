let currentStage = 1;
const feedMenu = document.getElementById("feedMenu");
const feedBack = document.getElementById("feedBack");

// 분기화면에서 "피드" 눌렀을 때 feedMenu 열기
btnFeed.onclick = () => {
  miniMenu.style.display = "none";
  feedMenu.style.display = "flex";
};

// 뒤로 버튼
feedBack.onclick = () => {
  feedMenu.style.display = "none";
  miniMenu.style.display = "flex";
};

// 스테이지 선택(1~34)
document.querySelectorAll(".stageBtn").forEach(btn => {
  btn.addEventListener("click", () => {
    const stg = parseInt(btn.dataset.stg);
    startFeedStage(stg);  // ← 이 함수에서 실제 게임 시작
  });
});

document.querySelectorAll(".feedHelpBtn").forEach(btn => {
  btn.addEventListener("click", () => {
    // 기능
  });
});

document.querySelectorAll(".feedGalleryBtn").forEach(btn => {
  btn.addEventListener("click", () => {
    // 기능
  });
});

document.querySelectorAll(".feedBackBtn").forEach(btn => {
  btn.addEventListener("click", () => {
    popupFeedGame.style.display = "none";
  });
});

// 다음 스테이지
document.getElementById("btnNext").onclick = () => {
  feedClearPopup.style.display = "none";
  startFeedStage(currentStage + 1);
};

// 재도전
document.getElementById("btnReturn").onclick = () => {
  feedClearPopup.style.display = "none";
  startFeedStage(currentStage);
};

// 메뉴
document.querySelectorAll(".btnBackMenu").forEach(btn => {
  btn.onclick = () => {
    popupFeedGame.style.display = "none";
    feedClearPopup.style.display = "none";
  };
});

/* ===============================
   📌 풀밭 가꾸기 — 최종 절대본

      0 = 물
      1 = 풀
      2 = 빈칸 (정답 무시)
      3 = 행 전체 → 물
      4 = 열 전체 → 물
      5 = 행 전체 → 풀
      6 = 열 전체 → 풀
================================ */

const popupFeedGame = document.getElementById("popupFeedGame");
const targetBoard = document.getElementById("feedTargetBoard");
const currentBoard = document.getElementById("feedCurrentBoard");

/* ========== 스테이지 데이터 ========== */
const feedStages = {
  1: {
    target: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 1, 0]
    ],
    problem: [
      [0, 0, 0, 5],
      [0, 0, 0, 5],
      [0, 0, 0, 5],
      [4, 4, 4, 2]
    ]
  },
  2: {
    target: [
      [0, 0, 1],
      [0, 0, 0],
      [1, 0, 1]
    ],
    problem: [
      [0, 0, 0, 5],
      [0, 0, 0, 5],
      [0, 0, 0, 5],
      [4, 4, 4, 2]
    ]
  },
  3: {
    target: [
      [0, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 1, 0, 1],
      [0, 0, 0, 0]
    ],
    problem: [
      [0, 0, 0, 0, 5],
      [0, 0, 0, 0, 3],
      [0, 0, 0, 0, 5],
      [0, 0, 0, 0, 3],
      [4, 6, 4, 6, 2]
    ]
  },
  4: {
    target: [
      [0, 0, 1, 0],
      [0, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 1, 1, 1]
    ],
    problem: [
      [0, 0, 0, 0, 5],
      [0, 0, 0, 0, 5],
      [0, 0, 0, 0, 5],
      [0, 0, 0, 0, 5],
      [4, 4, 4, 4, 2]
    ]
  },
  5: {
    target: [
      [0, 1, 1, 0],
      [1, 1, 1, 1],
      [0, 1, 0, 0],
      [0, 1, 0, 0]
    ],
    problem: [
      [0, 0, 0, 0, 3],
      [0, 0, 0, 0, 3],
      [0, 0, 0, 0, 3],
      [0, 0, 0, 0, 3],
      [6, 6, 6, 6, 2]
    ]
  },
  6: {
    target: [
      [1, 0, 1, 1],
      [1, 0, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 1, 1]
    ],
    problem: [
      [0, 0, 0, 0, 5],
      [0, 0, 0, 0, 5],
      [0, 0, 0, 0, 3],
      [0, 0, 0, 0, 3],
      [4, 4, 6, 6, 2]
    ]
  },
  7: {
    target: [
      [0, 0, 0, 1],
      [1, 1, 0, 1],
      [1, 0, 0, 1],
      [0, 0, 0, 0]
    ],
    problem: [
      [0, 0, 0, 0, 3],
      [0, 0, 0, 0, 5],
      [0, 0, 0, 0, 5],
      [0, 0, 0, 0, 3],
      [6, 4, 4, 6, 2]
    ]
  },
  8: {
    target: [
      [1, 0, 0, 0],
      [1, 0, 0, 1],
      [0, 0, 0, 0],
      [1, 0, 0, 1]
    ],
    problem: [
      [0, 0, 0, 0, 3],
      [0, 0, 0, 0, 3],
      [0, 0, 0, 0, 3],
      [0, 0, 0, 0, 3],
      [6, 6, 6, 6, 2]
    ]
  },
  9: {
    target: [
      [1, 1, 0, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 1]
    ],
    problem: [
      [0, 0, 0, 0, 3],
      [0, 0, 0, 0, 3],
      [0, 0, 0, 0, 3],
      [0, 0, 0, 0, 3],
      [6, 6, 6, 6, 2]
    ]
  },
  10: {
    target: [
      [0, 1, 1, 1],
      [0, 1, 0, 1],
      [0, 1, 1, 1],
      [0, 0, 0, 0]
    ],
    problem: [
      [0, 0, 0, 0, 5],
      [0, 0, 0, 0, 5],
      [0, 0, 0, 0, 5],
      [0, 0, 0, 0, 3],
      [4, 6, 6, 6, 2]
    ]
  },
  11: {
    target: [
      [1, 0, 1, 0, 1],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [1, 0, 0, 0, 1],
    ],
    problem: [
      [0, 0, 0, 0, 0, 3],
      [0, 0, 0, 0, 0, 3],
      [0, 0, 0, 0, 0, 3],
      [0, 0, 0, 0, 0, 3],
      [0, 0, 0, 0, 0, 3],
      [6, 6, 6, 6, 6, 2]
    ]
  },
  12: {
    target: [
      [1, 0, 1, 0, 1],
      [0, 0, 0, 0, 0],
      [0, 0, 1, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 1, 0, 0],
    ],
    problem: [
      [0, 0, 0, 0, 0, 3],
      [0, 1, 1, 1, 0, 3],
      [0, 1, 1, 1, 0, 3],
      [0, 1, 1, 1, 0, 3],
      [0, 0, 0, 0, 0, 3],
      [6, 6, 6, 6, 6, 2]
    ]
  },
  13: {
    target: [
      [0, 0, 0, 0, 0],
      [0, 1, 1, 1, 0],
      [0, 1, 0, 1, 0],
      [0, 1, 1, 1, 0],
      [0, 0, 0, 0, 0]
    ],
    problem: [
      [1, 1, 1, 1, 1, 3],
      [1, 0, 0, 0, 1, 3],
      [1, 0, 1, 0, 1, 3],
      [1, 0, 0, 0, 1, 3],
      [1, 1, 1, 1, 1, 3],
      [6, 6, 6, 6, 6, 2]
    ]
  },
  14: {
    target: [
      [1, 1, 0, 0, 1],
      [1, 1, 1, 0, 1],
      [1, 0, 0, 0, 0],
      [1, 1, 0, 0, 1],
      [1, 1, 0, 0, 0]
    ],
    problem: [
      [1, 1, 1, 1, 1, 5],
      [1, 1, 1, 1, 1, 5],
      [1, 1, 1, 1, 1, 5],
      [1, 1, 1, 1, 1, 5],
      [1, 1, 1, 1, 1, 5],
      [4, 4, 4, 4, 4, 2]
    ]
  },
  15: {
    target: [
      [0, 0, 0, 0, 0],
      [0, 0, 0, 1, 0],
      [0, 0, 0, 1, 1],
      [0, 0, 1, 1, 1],
      [0, 1, 1, 1, 1]
    ],
    problem: [
      [1, 1, 1, 1, 1, 3],
      [0, 0, 0, 0, 0, 3],
      [1, 1, 1, 1, 1, 3],
      [0, 0, 0, 0, 0, 3],
      [1, 1, 1, 1, 1, 3],
      [6, 6, 6, 6, 6, 2]
    ]
  },
  16: {
    target: [
      [0, 1, 1, 1, 1],
      [1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1],
      [0, 1, 1, 1, 0],
      [0, 1, 1, 1, 1]
    ],
    problem: [
      [0, 0, 0, 0, 0, 3],
      [1, 0, 0, 0, 0, 3],
      [1, 1, 0, 0, 0, 3],
      [1, 1, 1, 0, 0, 3],
      [1, 1, 1, 1, 0, 3],
      [6, 6, 6, 6, 6, 2]
    ]
  },
  17: {
    target: [
      [0, 0, 1, 1, 0],
      [0, 0, 1, 0, 0],
      [0, 0, 1, 1, 0],
      [1, 0, 1, 1, 1],
      [1, 0, 1, 1, 1]
    ],
    problem: [
      [0, 1, 1, 1, 0, 3],
      [1, 0, 0, 1, 0, 3],
      [1, 0, 1, 1, 1, 3],
      [0, 1, 1, 1, 1, 3],
      [0, 0, 1, 1, 1, 3],
      [6, 6, 6, 6, 6, 2]
    ]
  },
  18: {
    target: [
      [1, 0, 0, 0, 0],
      [1, 1, 1, 0, 1],
      [1, 0, 0, 0, 0],
      [1, 1, 0, 0, 1],
      [1, 0, 0, 0, 1]
    ],
    problem: [
      [0, 1, 0, 0, 0, 3],
      [0, 0, 1, 1, 1, 3],
      [0, 1, 0, 0, 1, 3],
      [0, 0, 1, 0, 0, 3],
      [1, 0, 0, 0, 1, 3],
      [6, 6, 6, 6, 6, 2]
    ]
  },
  19: {
    target: [
      [1, 0, 0, 0, 0],
      [1, 0, 1, 0, 0],
      [1, 0, 1, 1, 0],
      [1, 0, 1, 0, 0],
      [1, 0, 1, 1, 0]
    ],
    problem: [
      [0, 1, 0, 0, 1, 3],
      [1, 1, 1, 0, 0, 3],
      [0, 0, 0, 1, 1, 3],
      [0, 0, 0, 1, 0, 3],
      [1, 1, 0, 1, 1, 3],
      [6, 6, 6, 6, 6, 2]
    ]
  },
  20: {
    target: [
      [0, 0, 0, 1, 0],
      [1, 0, 0, 1, 0],
      [1, 0, 1, 1, 1],
      [1, 0, 0, 1, 1],
      [1, 1, 1, 1, 1]
    ],
    problem: [
      [0, 0, 0, 0, 0, 3],
      [1, 0, 0, 0, 1, 3],
      [1, 0, 1, 0, 1, 3],
      [1, 1, 1, 1, 1, 3],
      [1, 0, 0, 1, 0, 3],
      [6, 6, 6, 6, 6, 2]
    ]
  },
};

/* ===============================
   📌 스테이지 시작
================================ */
function startFeedStage(stageNum) {
  currentStage = stageNum;
  const st = feedStages[stageNum];
  if (!st) return;
  popupFeedGame.style.display = "block";
  openFeedGame(st);
}

/* ===============================
   📌 게임 엔진 본체
================================ */
function openFeedGame(st) {

  let target = st.target.map(row => [...row]);
  let current = st.problem.map(row => [...row]);

  renderTarget(target);
  renderCurrent(current);

  /* 클릭 → 능력칸 처리 */
  currentBoard.onclick = (e) => {
    if (!e.target.dataset) return;

    const r = Number(e.target.dataset.r);
    const c = Number(e.target.dataset.c);
    const v = current[r][c];

    if (v === 3) { applyRow(current, r, 0); }
    if (v === 5) { applyRow(current, r, 1); }
    if (v === 4) { applyCol(current, c, 0); }
    if (v === 6) { applyCol(current, c, 1); }

    renderCurrent(current);
    if (isCleared(current, target)) {
      setTimeout(() => {
        document.getElementById("feedClearPopup").style.display = "flex";
      }, 700);
    }
  };
}

/* ===============================
   📌 정답판 렌더링
================================ */
function renderTarget(arr) {
  const size = arr.length;
  targetBoard.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
  targetBoard.innerHTML = "";

  arr.forEach(row => row.forEach(v => {
    const d = document.createElement("div");
    d.className = "feedCell";
    if (v === 1) d.classList.add("grass");
    else d.classList.add("water");

    targetBoard.appendChild(d);
  }));
  applyTargetScale(size, size);
}

/* ===============================
   📌 문제판 렌더링 (능력칸 클릭 가능)
================================ */
function renderCurrent(arr) {
  const P = arr.length;
  currentBoard.style.gridTemplateColumns = `repeat(${P}, 1fr)`;
  currentBoard.innerHTML = "";

  arr.forEach((row, r) => {
    row.forEach((v, c) => {
      const d = document.createElement("div");
      d.className = "feedCell";

      if (v === 0) d.classList.add("water");
      else if (v === 1) d.classList.add("grass");
      else if (v === 2) d.style.background = "rgba(0,0,0,0)"; // 빈칸
      else if (v === 3) d.classList.add("w");
      else if (v === 4) d.classList.add("w");
      else if (v === 5) d.classList.add("g");
      else if (v === 6) d.classList.add("g");

      d.dataset.r = r;
      d.dataset.c = c;

      currentBoard.appendChild(d);
    });
  });
}

/* ===============================
   📌 행 조작
================================ */
function applyRow(arr, r, fill) {
  const P = arr.length;
  for (let c = 0; c < P; c++) {

    const v = arr[r][c];

    // 2~6은 고정 (절대 변하지 않음)
    if (v >= 2) continue;

    // 0·1만 바뀜
    arr[r][c] = fill;
  }
}

/* ===============================
   📌 열 조작
================================ */
function applyCol(arr, c, fill) {
  const P = arr.length;
  for (let r = 0; r < P; r++) {

    const v = arr[r][c];

    // 2~6은 고정 (절대 변하지 않음)
    if (v >= 2) continue;

    // 0·1만 바뀜
    arr[r][c] = fill;
  }
}

/* ===============================
   📌 정답 체크 — 0,1만 비교
================================ */
function isCleared(problem, target) {
  const P = problem.length;
  const T = target.length;

  const maxR = Math.min(P, T);
  const maxC = Math.min(P, T);

  for (let r = 0; r < maxR; r++) {
    for (let c = 0; c < maxC; c++) {
      const v = problem[r][c];
      if (v === 0 || v === 1) {
        if (target[r][c] !== v) return false;
      }
    }
  }
  return true;
}

function applyTargetScale(cols, rows) {
  let scale = 0.8; // 기본
  if (cols >= 4 || rows >= 4) scale = 0.7;
  if (cols >= 5 || rows >= 5) scale = 0.6;
  if (cols >= 6 || rows >= 6) scale = 0.5;
  if (cols >= 7 || rows >= 7) scale = 0.55;

  document.getElementById("feedTargetBoard").style.transform =
    `scale(${scale})`;
}
