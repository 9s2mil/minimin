let isColorAssist = false;
let bestScore = parseInt(localStorage.getItem("bestScore") || "0");

document.getElementById("startCover").addEventListener("click", () => {
  document.getElementById("startCover").style.display = "none";
  miniMenu.style.display = "block"; //여기블락
});

document.getElementById("playerScore").textContent = bestScore + "점";

document.getElementById("btnHelp").addEventListener("click", () => {
  document.getElementById("helpPopup").style.display = "flex";
});

document.getElementById("closeHelp").addEventListener("click", () => {
  document.getElementById("helpPopup").style.display = "none";
});

document.getElementById("helpPopup").addEventListener("click", (e) => {
  if (e.target === e.currentTarget) {
    document.getElementById("helpPopup").style.display = "none";
  }
});


document.getElementById("btnBack").addEventListener("click", () => {
  miniMenu.style.display = "block";//여기블락
});
// 🧭 wrap 비율 자동 스케일
const wrap=document.getElementById("wrap");
function scaleWrap(){
  const baseW=420,baseH=800;
  const scale=Math.min(window.innerWidth/baseW,window.innerHeight/baseH);
  wrap.style.transform=`scale(${scale})`;
}
window.addEventListener("resize",scaleWrap);
scaleWrap();

const FLOORS=7,ROOMS=6;
let score=0,turn=1;
let availableTypes=[1,2];
let warning=false,nextWarning=false,gameOver=false;

let board=Array.from({length:FLOORS},()=>Array(ROOMS).fill(null));
const boardEl=document.getElementById("board");

const overlay=document.createElement("div");
overlay.id="overlay";
overlay.style.cssText=`
 position:absolute;top:0;left:0;
 width:100%;height:100%;
 background:rgba(255,0,0,0.25);
 z-index:5;pointer-events:none;
 opacity:0;transition:opacity 0.3s;
`;
wrap.appendChild(overlay);

document.getElementById("btnColor").addEventListener("click", () => {
  isColorAssist = !isColorAssist;
  renderBoard();
});

// --------------------
// 캐릭터 이미지 애니메이션 관리
// --------------------
const characterImg = document.getElementById("character");

// Idle 이미지 
const idleFrames = ["icons/C1.png", "icons/C2.png"];
let idleIndex = 0;
let attackFrame = "icons/C3.png";

// Idle 애니메이션 활성 상태
let isIdle = true;

// Idle 자동 반복 (호흡)
setInterval(() => {
  if (isIdle) {
    idleIndex = (idleIndex + 1) % idleFrames.length;
    characterImg.src = idleFrames[idleIndex];
  }
}, 800); // 0.5초 간격으로 자연스럽게

// 공격 이미지 재생 함수
function playAttackAnimation() {
  isIdle = false;                 // idle 멈춤
  characterImg.src = attackFrame;

  setTimeout(() => {
    isIdle = true;                // idle 재개
    characterImg.src = idleFrames[idleIndex]; // 현재 idle 프레임으로 복귀
  }, 500); // 0.5초간 공격 프레임 유지
}

function initBoard(){
  board=Array.from({length:FLOORS},()=>Array(ROOMS).fill(null));
  const selected=[];
  while(selected.length<3){
    const pos=Math.floor(Math.random()*ROOMS);
    if(!selected.includes(pos))selected.push(pos);
  }
  selected.forEach(pos=>{
    const type=availableTypes[Math.floor(Math.random()*availableTypes.length)];
    board[0][pos]=type;
  });
  renderBoard();
  document.getElementById("currentScore").textContent = "현재 점수: 0";
}

function renderBoard() {
  boardEl.innerHTML = "";

  for (let f = FLOORS - 1; f >= 0; f--) {
    for (let r = 0; r < ROOMS; r++) {

      const div = document.createElement("div");
      div.className = "cell";
      const val = board[f][r];

      if (val !== null) {

        // 🖼 아이콘 삽입
        const img = document.createElement("img");
        img.src = skins.monsters[val];
        img.style.width = "80%";
        img.style.height = "80%";
        img.style.pointerEvents = "none";
        div.appendChild(img);

        // 색상보조 ON일 때 색 정보
        const borderColor =
          val === 1 ? "#2ecc71" :
            val === 2 ? "#f1c40f" :
              val === 3 ? "#9b59b6" :
                "#e74c3c";

        const bgColor =
          val === 1 ? "#c9f2dd" :
            val === 2 ? "#f9eeb0" :
              val === 3 ? "#e3cbea" :
                "#f7d6d2";

        if (isColorAssist) {
          // ✔ 색상보조 ON → 보더 + 연한 배경
          div.style.border = `3px solid ${borderColor}`;
          div.style.background = bgColor;
        } else {
          // ✔ 색상보조 OFF → border는 유지하되 ‘투명’
          div.style.border = "3px solid transparent";
          div.style.background = "transparent";
        }

      } else {
        // 빈칸
        div.style.border = "3px solid transparent";
        div.style.background = "#transparent";
      }

      div.dataset.floor = f;
      div.dataset.room = r;
      div.addEventListener("click", onCellClick);
      boardEl.appendChild(div);
    }
  }

  overlay.style.opacity = warning ? "1" : "0";
}

function onCellClick(e) {
  if (gameOver) return;
  const f = parseInt(e.target.dataset.floor);
  const r = parseInt(e.target.dataset.room);
  const type = board[f][r];
  if (type === null) return;

  const stack=[[f,r]],visited=new Set(),connected=[];
  while(stack.length){
    const [cf,cr]=stack.pop();
    const key=`${cf},${cr}`;
    if(visited.has(key))continue;
    visited.add(key);
    if(board[cf]?.[cr]===type){
      connected.push([cf,cr]);
      [[1,0],[-1,0],[0,1],[0,-1]].forEach(([df,dr])=>{
        const nf=cf+df,nr=cr+dr;
        if(nf>=0&&nf<FLOORS&&nr>=0&&nr<ROOMS&&board[nf][nr]===type)stack.push([nf,nr]);
      });
    }
  }

  connected.forEach(([cf,cr])=>board[cf][cr]=null);
  score+=connected.length;

  document.getElementById("currentScore").textContent = "현재 점수: " + score;

  // 공격 애니메이션 
  playAttackAnimation();

  // 🪂 클릭 직후 낙하 적용
  applyGravity();
  renderBoard();

  // ⚠️ 낙하 후 7층 비었는지 다시 확인
  checkWarnings();

  // 🧭 이제 턴 진행
  setTimeout(nextTurn, 150);
}


function willOverflowIfShift(src) {
  const simFloors = FLOORS + 1;
  const sim = Array.from({ length: simFloors }, () => Array(ROOMS).fill(null));
  for (let f = 0; f < FLOORS; f++) sim[f + 1] = [...src[f]];
  
  const top7Full = sim[FLOORS - 1].some(v => v !== null);
  const top8Has = sim[FLOORS].some(v => v !== null);
  return top7Full && top8Has;
}

function shiftFloorsUp() {
  for (let f = FLOORS - 1; f > 0; f--) board[f] = [...board[f - 1]];
  board[0] = Array(ROOMS).fill(null);
}


function spawnNewFloor() {
  let minCount = 2;
  let types = [1, 2];

  if (score >= 30 && score < 150) {
    minCount = 3;
    types = [1, 2, 3];
  } else if (score >= 150) {
    minCount = 4;
    types = [1, 2, 3, 4];
  }

  const createCount = Math.floor(Math.random() * (6 - minCount + 1)) + minCount;
  const positions = Array.from({ length: ROOMS }, (_, i) => i);

  for (let i = 0; i < createCount; i++) {
    const idx = Math.floor(Math.random() * positions.length);
    const pos = positions.splice(idx, 1)[0];
    const type = types[Math.floor(Math.random() * types.length)];
    board[0][pos] = type;
  }

  applyGravity();
}

function applyGravity(){
  for(let f=1;f<FLOORS;f++){
    for(let r=0;r<ROOMS;r++){
      if(board[f-1][r]===null&&board[f][r]!==null){
        let nf=f-1;
        while(nf-1>=0&&board[nf-1][r]===null)nf--;
        board[nf][r]=board[f][r];
        board[f][r]=null;
      }
    }
  }
}

function checkWarnings() {
  const top = board[FLOORS - 1];
  if (top.some(v => v !== null)) {
    warning = true;   // 7층에 말이 있으면 경고 켜기
  } else {
    warning = false;  // 7층이 비면 경고 해제
  }
  overlay.style.opacity = warning ? "1" : "0";
}


function nextTurn() {
  // 💀 종료 조건을 '턴 시작 시'로 이동
  if (warning) {
    gameOver = true;
    alert(`💀 게임 종료<em>!</em>\n점수: ${score} | 턴: ${turn}`);

    if (score > bestScore) {
      bestScore = score;
      localStorage.setItem("bestScore", bestScore);
      document.getElementById("playerScore").textContent = bestScore + "점";
    }

    // ✅ 확인 누르면 바로 재시작
    score = 0;
    turn = 1;
    warning = false;
    gameOver = false;
    initBoard(); 
    renderBoard();
    return;
  }


  // 🧱 다음 턴 진행
  shiftFloorsUp();
  spawnNewFloor();
  applyGravity();
  checkWarnings();
  turn++;
  renderBoard();
}

/* ===========================
      📌 도감 시스템
=========================== */

const defaultSkin = {
    char: {
        idle1: "icons/C1.png",
        idle2: "icons/C2.png",
        attack: "icons/C3.png"
    },
    monsters: {
        1: "icons/n1.png",
        2: "icons/n2.png",
        3: "icons/n3.png",
        4: "icons/n4.png"
    },
    bg: "icons/B.png"
};

const skins = {
    char: JSON.parse(localStorage.getItem("skin_char") || 
        `{"idle1":"icons/C1.png","idle2":"icons/C2.png","attack":"icons/C3.png"}`),

    monsters: JSON.parse(localStorage.getItem("skin_monsters") || 
        `{"1":"icons/n1.png","2":"icons/n2.png","3":"icons/n3.png","4":"icons/n4.png"}`),

    bg: localStorage.getItem("skin_bg") || "icons/B.png"
};

/* 게임에 즉시 반영 */
function applySkins() {
    // 캐릭터
    idleFrames[0] = skins.char.idle1;
    idleFrames[1] = skins.char.idle2;
    attackFrame = skins.char.attack;

    // 배경
    wrap.style.backgroundImage = `url(${skins.bg})`;
}
applySkins();

/* 도감 팝업 열기 */
document.getElementById("btnGallery").onclick = () => {
    galleryPopup.style.display = "flex";
    document.querySelector('[data-tab="char1"]').click();
};

/* 도감 탭 클릭 */
document.querySelectorAll(".galleryTabs .tab").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelector(".tab.active").classList.remove("active");
        btn.classList.add("active");
        loadGalleryContent(btn.dataset.tab);
    });
});

/* 팝업 닫기 */
closeGallery.onclick = () => {
    galleryPopup.style.display = "none";
};
galleryPopup.addEventListener("click", (e) => {
    if (e.target.id === "galleryPopup") {
        galleryPopup.style.display = "none";
    }
});


/* ===============  
    콘텐츠 로드  
================ */

function loadGalleryContent(type) {
    const box = document.getElementById("galleryContent");
    box.innerHTML = "";

    /* ============================
            🎨 캐릭터 3프레임 
       ============================ */

    // 캐릭터 1 = idle1
    if (type === "char1") {
        box.innerHTML = `
            <img class="previewImg" id="charPreview" src="${skins.char.idle1}">
            <input type="file" id="charInput" accept="image/*">
            <p style="margin-top:10px;color:#555;">이미지를 선택하면 즉시 반영됩니다.</p>
            <button class="resetBtn" data-reset="char1">초기화</button>
        `;
        setupCharFrameUploader("charInput", "charPreview", "idle1");
        return;
    }

    // 캐릭터 2 = idle2
    if (type === "char2") {
        box.innerHTML = `
            <img class="previewImg" id="charPreview" src="${skins.char.idle2}">
            <input type="file" id="charInput" accept="image/*">
            <p style="margin-top:10px;color:#555;">이미지를 선택하면 즉시 반영됩니다.</p>
            <button class="resetBtn" data-reset="char2">초기화</button>
        `;
        setupCharFrameUploader("charInput", "charPreview", "idle2");
        return;
    }

    // 캐릭터 3 = attack
    if (type === "char3") {
        box.innerHTML = `
            <img class="previewImg" id="charPreview" src="${skins.char.attack}">
            <input type="file" id="charInput" accept="image/*">
            <p style="margin-top:10px;color:#555;">이미지를 선택하면 즉시 반영됩니다.</p>
            <button class="resetBtn" data-reset="char3">초기화</button>
        `;
        setupCharFrameUploader("charInput", "charPreview", "attack");
        return;
    }

    /* ============================
          🎨 몬스터/배경 유지
    ============================ */

    let currentImg = "";

    if (type === "bg") currentImg = skins.bg;
    if (type.startsWith("m")) {
        const idx = type.replace("m", "");
        currentImg = skins.monsters[idx];
    }

    box.innerHTML = `
        <img class="previewImg" id="previewSkin" src="${currentImg}">
        <input type="file" id="skinInput" accept="image/*">
        <p style="margin-top:10px;color:#555;">이미지를 선택하면 즉시 반영됩니다.</p>

        <button class="resetBtn" data-reset="${type}">초기화</button>
    `;


    document.getElementById("skinInput").addEventListener("change", (ev) => {
        const file = ev.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            const newURL = reader.result;
            document.getElementById("previewSkin").src = newURL;

            if (type === "bg") {
                skins.bg = newURL;
                localStorage.setItem("skin_bg", newURL);
            }
            else if (type.startsWith("m")) {
                const idx = type.replace("m", "");
                skins.monsters[idx] = newURL;
                localStorage.setItem("skin_monsters", JSON.stringify(skins.monsters));
            }

            applySkins();
            renderBoard();
        };
        reader.readAsDataURL(file);
    });
}

function resetSkin(key) {
    // 캐릭터
    if (key === "char1") {
        skins.char.idle1 = defaultSkin.char.idle1;
    }
    if (key === "char2") {
        skins.char.idle2 = defaultSkin.char.idle2;
    }
    if (key === "char3") {
        skins.char.attack = defaultSkin.char.attack;
    }

    // 몬스터
    if (key.startsWith("m")) {
        const idx = key.replace("m", "");
        skins.monsters[idx] = defaultSkin.monsters[idx];
    }

    // 배경
    if (key === "bg") {
        skins.bg = defaultSkin.bg;
    }

    // 저장 반영
    localStorage.setItem("skin_char", JSON.stringify(skins.char));
    localStorage.setItem("skin_monsters", JSON.stringify(skins.monsters));
    localStorage.setItem("skin_bg", skins.bg);

    // 즉시 화면 반영
    applySkins();
    renderBoard();
}

function setupCharFrameUploader(inputId, previewId, frameKey) {
    const input = document.getElementById(inputId);
    input.addEventListener("change", (ev) => {
        const file = ev.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            const newURL = reader.result;

            skins.char[frameKey] = newURL;
            localStorage.setItem("skin_char", JSON.stringify(skins.char));

            document.getElementById(previewId).src = newURL;

            applySkins();
        };
        reader.readAsDataURL(file);
    });
}

// 초기화 버튼 클릭 처리
document.addEventListener("click", (e) => {
    if (!e.target.classList.contains("resetBtn")) return;

    const key = e.target.dataset.reset;
    resetSkin(key);

    // 갤러리 다시 읽기
    loadGalleryContent(key);

    // 게임 반영
    applySkins();
    renderBoard();
});

/* ==============================
   🎮 미니게임 메뉴 + 팝업 제어
============================== */

const miniMenu = document.getElementById("miniMenu");
const popupFeed = document.getElementById("popupFeed");

// 피드 버튼 → 팝업 열림
document.getElementById("btnFeed").onclick = () => {
  popupFeed.style.display = "block";
};

// 디펜스(닫기) 버튼 → 미니메뉴 닫기
document.getElementById("btnDefenseClose").onclick = () => {
  miniMenu.style.display = "none";
  popupFeedGame.style.display = "none";
};

// 팝업 닫기 공통 (트레이닝 제거됨)
document.querySelectorAll(".closePopup").forEach(btn => {
  btn.addEventListener("click", () => {
    popupFeed.style.display = "none";
  });
});


// 초기화
initBoard();
