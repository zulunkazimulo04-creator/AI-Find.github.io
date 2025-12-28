const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");
const functionButtons = document.getElementById("functionButtons");
const functionSection = document.getElementById("functionSection");
const functionTitle = document.getElementById("functionTitle");
const aiList = document.getElementById("aiList");
const loadMoreBTN = document.getElementById("loadMore");
let currentFunction, currentPage = 1, currentAIList = [];

const allFunctions = [
"text generation","coding assistance","image generation","video generation",
"voice generation","research assistant","finance","agents","3D models","game assets",
"motion capture","podcast generation","meeting transcription","presentations","automation"
];

// Build function buttons
allFunctions.forEach(func => {
  let btn = document.createElement("div");
  btn.className = "function-btn";
  btn.textContent = func;
  btn.onclick = () => openFunction(func);
  functionButtons.appendChild(btn);
});

// Search
searchInput.addEventListener("input", () => {
  let q = searchInput.value;
  if (!q) { searchResults.innerHTML = ""; return; }
  fetch(`/api/ais?search=${q}`)
    .then(res => res.json())
    .then(data => {
      searchResults.innerHTML = "";
      data.ais.forEach(ai => displayCard(ai, searchResults, true));
    });
});

// Open function page
function openFunction(func) {
  currentFunction = func;
  functionTitle.textContent = func;
  document.getElementById("home").classList.add("hidden");
  functionSection.classList.remove("hidden");
  currentPage = 1;
  loadFunctionPage();
}

// Load function page AI
function loadFunctionPage() {
  fetch(`/api/ais?func=${currentFunction}&page=${currentPage}`)
    .then(res => res.json())
    .then(data => {
      data.ais.forEach(ai => displayCard(ai, aiList, false));
      if (currentPage * 30 < data.total) loadMoreBTN.classList.remove("hidden");
      else loadMoreBTN.classList.add("hidden");
      currentPage++;
    });
}

loadMoreBTN.onclick = loadFunctionPage;

// Display AI card
function displayCard(ai, container, showAvg) {
  const card = document.createElement("div");
  card.className = "ai-card";
  const avgRating = showAvg ? globalAvg(ai) : 0;
  card.innerHTML = `
    <h3>${ai.name}</h3>
    <p>${ai.price.toUpperCase()}</p>
    <p><a href="${ai.link}" target="_blank" style="color:#76b900">Visit Website</a></p>
    <p>Average Rating: ${avgRating.toFixed(1)}</p>
    <div class="rating">${getStars(ai.name, currentFunction)}</div>
  `;
  container.appendChild(card);
}

// Ratings
function getStars(name, func) {
  return [1,2,3,4,5].map(i => `<span class="star" onclick="rateAI('${name}','${func}',${i})">${i<=getCurrentRating(name,func)?'★':'☆'}</span>`).join('');
}

function getCurrentRating(name,func) {
  const r = localStorage.getItem(`rate-${name}-${func}`);
  return r ? parseInt(r) : 0;
}

function rateAI(name, func, val) {
  fetch('/api/rate', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({name, func, rating: val})
  }).then(res=>res.json()).then(()=>{
    localStorage.setItem(`rate-${name}-${func}`, val);
    location.reload();
  });
}

// Calculate global avg rating for display
function globalAvg(ai) {
  let all = [];
  for (let f in ai.ratings) all.push(...ai.ratings[f]);
  if (!all.length) return 0;
  return all.reduce((a,b)=>a+b,0)/all.length;
}

// Back button
document.getElementById("backHome").onclick = () => {
  functionSection.classList.add("hidden");
  document.getElementById("home").classList.remove("hidden");
};