/* ===================================================
   REEL — app.js
=================================================== */

const PAGE_SIZE = 12;
let state = {
  view: "home",
  genre: "All",
  year: "",
  sort: "trending",
  minRating: 0,
  search: "",
  page: 1,
};

const WISHLIST_KEY = "reel_wishlist";
let wishlist = new Set(JSON.parse(localStorage.getItem(WISHLIST_KEY) || "[]"));

function saveWishlist(){
  localStorage.setItem(WISHLIST_KEY, JSON.stringify([...wishlist]));
  updateWishlistBadge();
}
function updateWishlistBadge(){
  document.getElementById("wishlistCount").textContent = wishlist.size;
}
function toggleWishlist(id, btnEl){
  if(wishlist.has(id)){
    wishlist.delete(id);
    showToast("Removed from My List");
  } else {
    wishlist.add(id);
    showToast("Added to My List");
  }
  saveWishlist();
  document.querySelectorAll(`[data-wish-id="${id}"]`).forEach(el=>{
    el.classList.toggle("active", wishlist.has(id));
  });
  if(btnEl){
    btnEl.classList.add("pulse");
    setTimeout(()=>btnEl.classList.remove("pulse"), 400);
  }
  if(state.view === "wishlist") renderWishlistView();
}

function heartSVG(filled){
  return `<svg width="15" height="15" viewBox="0 0 24 24" fill="${filled ? 'currentColor':'none'}"><path d="M12 21s-7.2-4.6-9.6-9.1C.7 8.3 2.3 4.8 5.7 4.1c2-.4 4 .5 5.1 2.2C12 4.4 14 3.6 16 4c3.4.6 5 4.1 3.4 7.9C16.9 16.4 12 21 12 21Z" stroke="currentColor" stroke-width="1.6"/></svg>`;
}

let toastTimer;
function showToast(msg){
  const t = document.getElementById("toast");
  t.innerHTML = `<span class="dot-ico">●</span> ${msg}`;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=> t.classList.remove("show"), 2200);
}

/* ===================================================
   LANDING CAROUSEL
=================================================== */
function buildCarousel(){
  const wrap = document.getElementById("carousel");
  const set = MOVIES.slice(0, 14);

  // Build one set of cards as an HTML string
  const oneSet = set.map((m, i) => `
    <div class="poster-card" style="animation-delay:${i * .05}s">
      <img src="${m.poster}" alt="${m.title}" draggable="false">
      <span class="badge-rating">★ ${m.rating}</span>
      <div class="pc-meta">
        <div class="t">${m.title}</div>
        <div class="y">${m.year} · ${m.duration}</div>
      </div>
    </div>
  `).join("");

  // Inject TWO identical sets back-to-back.
  // The CSS animation moves the strip left by 50% (= one set width),
  // then snaps back to 0. Since the second set looks identical to the
  // first, the loop is completely invisible to the eye.
  wrap.innerHTML = oneSet + oneSet;
}

document.getElementById("enterBtn").addEventListener("click", ()=>{
  const landing = document.getElementById("landing");
  landing.classList.add("leaving");
  setTimeout(()=>{
    landing.style.display = "none";
    document.getElementById("app").classList.remove("hidden");
    initApp();
  }, 650);
});

/* ===================================================
   APP INIT
=================================================== */
let appInitialized = false;
function initApp(){
  if(appInitialized){ document.body.style.overflow=""; return; }
  appInitialized = true;
  updateWishlistBadge();
  buildHero();
  buildTrendingRow();
  buildGenreShelves();
  buildGenreChips();
  buildYearOptions();
  bindNav();
  bindFilters();
  bindModal();
  renderBrowseView();
  observeReveals();
}

/* ===================================================
   NAVIGATION
=================================================== */
function bindNav(){
  document.querySelectorAll(".nav-link").forEach(link=>{
    link.addEventListener("click", e=>{
      e.preventDefault();
      switchView(link.dataset.view);
    });
  });
  document.getElementById("wishlistNavBtn").addEventListener("click", ()=> switchView("wishlist"));
  document.querySelectorAll("[data-go]").forEach(btn=>{
    btn.addEventListener("click", ()=> switchView(btn.dataset.go));
  });
  document.getElementById("searchInput").addEventListener("input", e=>{
    state.search = e.target.value.trim().toLowerCase();
    state.page = 1;
    if(state.view !== "browse") switchView("browse");
    else renderBrowseView();
  });
}

function switchView(view){
  state.view = view;
  document.querySelectorAll(".nav-link").forEach(l=> l.classList.toggle("active", l.dataset.view===view));
  document.querySelectorAll(".view").forEach(v=> v.classList.add("hidden"));
  document.getElementById(`view-${view}`).classList.remove("hidden");
  window.scrollTo({top:0, behavior:"smooth"});
  if(view === "browse") renderBrowseView();
  if(view === "wishlist") renderWishlistView();
}

/* ===================================================
   HERO
=================================================== */
function buildHero(){
  const m = MOVIES.find(x=>x.trending) || MOVIES[0];
  const hero = document.getElementById("hero");
  hero.style.backgroundImage = `url(${m.poster.replace("400x600","1600x800")})`;
  hero.innerHTML = `
    <div class="hero-content">
      <div class="hero-meta">
        <span class="rating">★ ${m.rating}</span>
        <span>${m.year}</span>
        <span>${m.duration}</span>
        ${m.genres.map(g=>`<span class="tag">${g}</span>`).join("")}
      </div>
      <h1>${m.title}</h1>
      <p>${m.description}</p>
      <div class="hero-actions">
        <button class="btn btn-primary" data-open="${m.id}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          <span>Watch Trailer</span>
        </button>
        <button class="btn btn-ghost" data-wish-toggle="${m.id}">
          <span data-wish-id="${m.id}" class="${wishlist.has(m.id)?'active':''}" style="display:flex;align-items:center;gap:.5rem;">
            ${heartSVG(wishlist.has(m.id))} Add to List
          </span>
        </button>
      </div>
    </div>
  `;
  hero.querySelector("[data-open]").addEventListener("click", ()=> openModal(m.id));
  hero.querySelector("[data-wish-toggle]").addEventListener("click", (e)=>{
    toggleWishlist(m.id, e.currentTarget);
    e.currentTarget.querySelector("span").innerHTML = `${heartSVG(wishlist.has(m.id))} Add to List`;
  });
}

/* ===================================================
   MOVIE CARD BUILDER
=================================================== */
function movieCardHTML(m){
  const isWished = wishlist.has(m.id);
  const color = genreColor(m.genres);   // accent colour for this card's primary genre
  return `
    <div class="movie-card" data-id="${m.id}" style="--card-color:${color}">
      <div class="mc-poster">
        <img src="${m.poster}" alt="${m.title}" loading="lazy">
        <span class="mc-rating">★ ${m.rating}</span>
        <button class="mc-wishlist ${isWished?'active':''}" data-wish-id="${m.id}" title="Save to My List">
          ${heartSVG(isWished)}
        </button>
        <div class="mc-overlay">
          <div class="mc-title">${m.title}</div>
          <div class="mc-sub"><span>${m.year}</span><span>·</span><span>${m.genres[0]}</span></div>
        </div>
      </div>
    </div>
  `;
}

function bindCardEvents(container){
  container.querySelectorAll(".movie-card").forEach(card=>{
    const id = Number(card.dataset.id);
    card.addEventListener("click", e=>{
      if(e.target.closest(".mc-wishlist")) return;
      openModal(id);
    });
    const wishBtn = card.querySelector(".mc-wishlist");
    wishBtn.addEventListener("click", e=>{
      e.stopPropagation();
      toggleWishlist(id, wishBtn);
    });
  });
}

/* ===================================================
   TRENDING ROW + GENRE SHELVES (home)
=================================================== */
function buildTrendingRow(){
  const row = document.getElementById("trendingRow");
  const items = MOVIES.filter(m=>m.trending);
  row.innerHTML = items.map(movieCardHTML).join("");
  bindCardEvents(row);
}

function buildGenreShelves(){
  const wrap = document.getElementById("genreShelves");
  const shelves = ALL_GENRES.slice(0,5).map(g=>{
    const items = MOVIES.filter(m=>m.genres.includes(g)).slice(0,8);
    const c = GENRE_COLORS[g] || "#EBAE29";
    return `
      <section class="shelf reveal">
        <div class="section-head">
          <h2><span class="shelf-dot" style="background:${c}"></span>${g}</h2>
        </div>
        <div class="row-scroll" data-genre-row="${g}"></div>
      </section>
    `;
  }).join("");
  wrap.innerHTML = shelves;
  ALL_GENRES.slice(0,5).forEach(g=>{
    const row = wrap.querySelector(`[data-genre-row="${g}"]`);
    const items = MOVIES.filter(m=>m.genres.includes(g)).slice(0,8);
    row.innerHTML = items.map(movieCardHTML).join("");
    bindCardEvents(row);
  });
}

/* ===================================================
   BROWSE — FILTERS
=================================================== */
function buildGenreChips(){
  const wrap = document.getElementById("genreChips");
  const genres = ["All", ...ALL_GENRES];
  wrap.innerHTML = genres.map(g=>`<button class="chip ${g==='All'?'active':''}" data-genre="${g}">${g}</button>`).join("");
  wrap.querySelectorAll(".chip").forEach(chip=>{
    chip.addEventListener("click", ()=>{
      wrap.querySelectorAll(".chip").forEach(c=>c.classList.remove("active"));
      chip.classList.add("active");
      state.genre = chip.dataset.genre;
      state.page = 1;
      renderBrowseView();
    });
  });
}

function buildYearOptions(){
  const sel = document.getElementById("yearFilter");
  const years = [...new Set(MOVIES.map(m=>m.year))].sort((a,b)=>b-a);
  years.forEach(y=>{
    const opt = document.createElement("option");
    opt.value = y; opt.textContent = y;
    sel.appendChild(opt);
  });
}

function bindFilters(){
  document.getElementById("yearFilter").addEventListener("change", e=>{
    state.year = e.target.value; state.page = 1; renderBrowseView();
  });
  document.getElementById("sortFilter").addEventListener("change", e=>{
    state.sort = e.target.value; state.page = 1; renderBrowseView();
  });
  const ratingInput = document.getElementById("ratingFilter");
  ratingInput.addEventListener("input", e=>{
    state.minRating = parseFloat(e.target.value);
    document.getElementById("ratingVal").textContent = state.minRating.toFixed(1);
    state.page = 1; renderBrowseView();
  });
  document.getElementById("clearFilters").addEventListener("click", ()=>{
    state.genre="All"; state.year=""; state.sort="trending"; state.minRating=0; state.search=""; state.page=1;
    document.getElementById("yearFilter").value="";
    document.getElementById("sortFilter").value="trending";
    document.getElementById("ratingFilter").value=0;
    document.getElementById("ratingVal").textContent = "0.0";
    document.getElementById("searchInput").value="";
    document.querySelectorAll(".chip").forEach(c=>c.classList.toggle("active", c.dataset.genre==="All"));
    renderBrowseView();
  });
}

function getFilteredMovies(){
  let list = MOVIES.filter(m=>{
    if(state.genre !== "All" && !m.genres.includes(state.genre)) return false;
    if(state.year && m.year !== Number(state.year)) return false;
    if(m.rating < state.minRating) return false;
    if(state.search && !m.title.toLowerCase().includes(state.search)) return false;
    return true;
  });
  switch(state.sort){
    case "rating-desc": list.sort((a,b)=>b.rating-a.rating); break;
    case "rating-asc": list.sort((a,b)=>a.rating-b.rating); break;
    case "year-desc": list.sort((a,b)=>b.year-a.year); break;
    case "year-asc": list.sort((a,b)=>a.year-b.year); break;
    case "az": list.sort((a,b)=>a.title.localeCompare(b.title)); break;
    default: list.sort((a,b)=> (b.trending - a.trending) || (b.rating - a.rating));
  }
  return list;
}

function renderBrowseView(){
  const all = getFilteredMovies();
  const totalPages = Math.max(1, Math.ceil(all.length / PAGE_SIZE));
  state.page = Math.min(state.page, totalPages);
  const start = (state.page - 1) * PAGE_SIZE;
  const pageItems = all.slice(start, start + PAGE_SIZE);

  const grid = document.getElementById("browseGrid");
  document.getElementById("resultCount").textContent = `${all.length} title${all.length!==1?'s':''} found`;

  if(pageItems.length === 0){
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.6"/><path d="M21 21l-4.3-4.3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
      <p>No titles match these filters. Try widening your search.</p>
    </div>`;
  } else {
    grid.innerHTML = pageItems.map(movieCardHTML).join("");
    bindCardEvents(grid);
  }

  renderPagination(totalPages);
}

function renderPagination(totalPages){
  const wrap = document.getElementById("pagination");
  if(totalPages <= 1){ wrap.innerHTML = ""; return; }
  let html = `<button class="page-btn" id="prevPage" ${state.page===1?'disabled':''}>‹</button>`;
  for(let i=1;i<=totalPages;i++){
    if(i===1 || i===totalPages || Math.abs(i-state.page)<=1){
      html += `<button class="page-btn ${i===state.page?'active':''}" data-page="${i}">${i}</button>`;
    } else if(Math.abs(i-state.page)===2){
      html += `<span style="color:var(--cream-dim);padding:0 .3rem;">…</span>`;
    }
  }
  html += `<button class="page-btn" id="nextPage" ${state.page===totalPages?'disabled':''}>›</button>`;
  wrap.innerHTML = html;

  wrap.querySelectorAll("[data-page]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      state.page = Number(btn.dataset.page);
      renderBrowseView();
      document.querySelector(".browse-head").scrollIntoView({behavior:"smooth", block:"start"});
    });
  });
  const prev = document.getElementById("prevPage");
  const next = document.getElementById("nextPage");
  if(prev) prev.addEventListener("click", ()=>{ state.page--; renderBrowseView(); });
  if(next) next.addEventListener("click", ()=>{ state.page++; renderBrowseView(); });
}

/* ===================================================
   WISHLIST VIEW
=================================================== */
function renderWishlistView(){
  const grid = document.getElementById("wishlistGrid");
  const empty = document.getElementById("wishlistEmpty");
  const items = MOVIES.filter(m=>wishlist.has(m.id));
  if(items.length === 0){
    grid.innerHTML = "";
    empty.classList.remove("hidden");
  } else {
    empty.classList.add("hidden");
    grid.innerHTML = items.map(movieCardHTML).join("");
    bindCardEvents(grid);
  }
}

/* ===================================================
   MODAL
=================================================== */
function bindModal(){
  document.getElementById("modalOverlay").addEventListener("click", e=>{
    if(e.target.id === "modalOverlay") closeModal();
  });
  document.addEventListener("keydown", e=>{
    if(e.key === "Escape") closeModal();
  });
}

function openModal(id){
  const m = MOVIES.find(x=>x.id===id);
  if(!m) return;
  const overlay = document.getElementById("modalOverlay");
  const card = document.getElementById("modalCard");
  const isWished = wishlist.has(m.id);
  card.innerHTML = `
    <button class="modal-close" id="modalCloseBtn">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
    </button>
    <div class="modal-banner" style="background-image:url(${m.poster.replace('400x600','1200x600')})"></div>
    <div class="modal-body">
      <div class="m-tags">${m.genres.map(g=>`<span>${g}</span>`).join("")}</div>
      <h2>${m.title}</h2>
      <div class="modal-meta">
        <span class="rating">★ ${m.rating}</span>
        <span>${m.year}</span>
        <span>${m.duration}</span>
      </div>
      <p class="m-desc">${m.description}</p>
      <div class="modal-actions">
        <button class="btn btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          <span>Watch Now</span>
        </button>
        <button class="btn btn-ghost" id="modalWishBtn" data-wish-id="${m.id}">
          <span style="display:flex;align-items:center;gap:.5rem;">
            ${heartSVG(isWished)} ${isWished ? "Saved" : "Add to List"}
          </span>
        </button>
      </div>
    </div>
  `;
  overlay.classList.remove("hidden");
  requestAnimationFrame(()=> overlay.classList.add("show"));
  document.body.style.overflow = "hidden";

  card.querySelector("#modalCloseBtn").addEventListener("click", closeModal);
  const wishBtn = card.querySelector("#modalWishBtn");
  wishBtn.addEventListener("click", ()=>{
    toggleWishlist(m.id, wishBtn);
    const nowWished = wishlist.has(m.id);
    wishBtn.querySelector("span").innerHTML = `${heartSVG(nowWished)} ${nowWished ? "Saved" : "Add to List"}`;
  });
}

function closeModal(){
  const overlay = document.getElementById("modalOverlay");
  overlay.classList.remove("show");
  document.body.style.overflow = "";
  setTimeout(()=> overlay.classList.add("hidden"), 300);
}

/* ===================================================
   SCROLL REVEAL
=================================================== */
function observeReveals(){
  const els = document.querySelectorAll(".reveal");
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(en=>{
      if(en.isIntersecting){
        en.target.classList.add("in");
        io.unobserve(en.target);
      }
    });
  }, { threshold: .15 });
  els.forEach(el=> io.observe(el));
}

/* ===================================================
   BOOT
=================================================== */
document.addEventListener("DOMContentLoaded", ()=>{
  buildCarousel();
});
