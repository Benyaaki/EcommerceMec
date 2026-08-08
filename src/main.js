/* ==========================================================================
   AUTOPART — SPA de e-commerce automotriz (demo)
   ========================================================================== */

import {
  PRODUCTS_DATABASE,
  getUniqueBrands, getModelsForBrand, getYearsForModel, getEnginesForVehicle,
  findVehicleObject, formatCLP
} from './data/database.js';
import { initSilk, initCoverflow, initGlobe } from './effects.js';

const FREE_SHIPPING = 50000;
const SHIPPING_COST = 4990;
const COUPONS = { AUTO10: { value: 0.10, label: '10%' }, BIENVENIDO: { value: 0.05, label: '5%' } };

const state = { category: 'all', brand: 'all', sort: 'featured', query: '', vehicle: null, cart: [], wishlist: [], coupon: null };

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

document.addEventListener('DOMContentLoaded', () => {
  loadStorage();
  initSilk($('#silk-bg'));
  initNav();
  initRouter();
  initCoverflowHome();
  initFinder();
  initCategories();
  initCatalogTools();
  initSearch();
  initCart();
  initWishlist();
  initModals();
  initContact();
  initAdminPanel();
  initExtras();

  renderCatalog();
  updateCartUI();
  updateWishUI();
});

/* ========================= PERSISTENCIA ========================= */
function loadStorage() {
  try {
    state.cart = (JSON.parse(localStorage.getItem('autopart_cart') || '[]'))
      .map(i => ({ product: PRODUCTS_DATABASE.find(p => p.id === i.id), quantity: i.q })).filter(i => i.product);
    state.wishlist = JSON.parse(localStorage.getItem('autopart_wish') || '[]');
  } catch (e) { state.cart = []; state.wishlist = []; }
}
function saveStorage() {
  localStorage.setItem('autopart_cart', JSON.stringify(state.cart.map(i => ({ id: i.product.id, q: i.quantity }))));
  localStorage.setItem('autopart_wish', JSON.stringify(state.wishlist));
}

const VIEWS = { '/': 'view-home', '/tienda': 'view-tienda', '/nosotros': 'view-nosotros', '/contacto': 'view-contacto', '/producto': 'view-producto' };
let globeStarted = false, statsRan = false;

function initRouter() { window.addEventListener('hashchange', route); route(); }
function route() {
  const path = (location.hash || '#/').replace('#', '') || '/';
  if (path.startsWith('/producto/')) {
    const productId = path.replace('/producto/', '');
    renderProductPage(productId);
    $$('.view').forEach(v => v.classList.toggle('active', v.id === 'view-producto'));
    $$('.island-nav a').forEach(a => a.classList.toggle('active', a.getAttribute('data-route') === '/tienda'));
    window.scrollTo({ top: 0 });
    return;
  }
  const viewId = VIEWS[path] || 'view-home';
  $$('.view').forEach(v => v.classList.toggle('active', v.id === viewId));
  $$('.island-nav a').forEach(a => a.classList.toggle('active', a.getAttribute('data-route') === path));
  window.scrollTo({ top: 0 });
  if (viewId === 'view-nosotros') { startGlobe(); runStats(); }
}
function go(path) { location.hash = '#' + path; }

/* ========================= NAV ========================= */
function initNav() {
  const wrap = $('.nav-wrap');
  window.addEventListener('scroll', () => wrap.classList.toggle('shrink', window.scrollY > 40), { passive: true });

  const overlay = $('#mobile-menu-overlay');
  const dropdown = $('#mobile-menu-dropdown');
  const openBtn = $('#open-mobile-menu');
  const closeBtn = $('#close-mobile-menu');

  const openMenu = () => {
    overlay?.classList.add('open');
    dropdown?.classList.add('open');
  };
  const closeMenu = () => {
    overlay?.classList.remove('open');
    dropdown?.classList.remove('open');
  };

  openBtn?.addEventListener('click', openMenu);
  closeBtn?.addEventListener('click', closeMenu);
  overlay?.addEventListener('click', closeMenu);
  $$('.mobile-menu-link').forEach(a => a.addEventListener('click', closeMenu));
  $('#mm-search-veh')?.addEventListener('click', closeMenu);
}

/* ========================= COVERFLOW (home) ========================= */
function initCoverflowHome() {
  const root = $('#coverflow'); if (!root) return;
  const items = [...PRODUCTS_DATABASE].sort((a, b) => b.rating - a.rating);
  initCoverflow(root, items, (item, clicked) => { if (clicked) openProduct(item.id); });
}

/* ========================= GLOBO + STATS (nosotros) ========================= */
function startGlobe() {
  if (globeStarted) return; globeStarted = true;
  const c = $('#globe'); if (!c) return;
  // pequeño delay para que el layout mida bien el canvas
  setTimeout(() => { try { initGlobe(c); } catch (e) { console.warn('globe', e); } }, 60);
}
function runStats() {
  if (statsRan) return; statsRan = true;
  $$('.stat-col').forEach(card => {
    const target = parseInt(card.getAttribute('data-count'), 10);
    const el = card.querySelector('.stat-num b');
    if (!el) return;
    let cur = 0; const step = Math.max(1, Math.ceil(target / 45));
    const t = setInterval(() => { cur += step; if (cur >= target) { cur = target; clearInterval(t); } el.textContent = cur.toLocaleString('es-CL'); }, 24);
  });
}

/* ========================= FINDER ========================= */
function initFinder() {
  const brand = $('#f-brand'), model = $('#f-model'), year = $('#f-year'), engine = $('#f-engine');
  const form = $('#finder-form'), reset = $('#f-reset');
  if (!brand) return;
  brand.innerHTML = '<option value="">Seleccionar</option>' + getUniqueBrands().map(b => `<option>${b}</option>`).join('');
  brand.addEventListener('change', () => {
    model.innerHTML = '<option value="">Seleccionar</option>'; year.innerHTML = '<option value="">Seleccionar</option>'; engine.innerHTML = '<option value="">Todos</option>';
    model.disabled = !brand.value; year.disabled = true; engine.disabled = true;
    if (brand.value) model.innerHTML += getModelsForBrand(brand.value).map(m => `<option>${m}</option>`).join('');
  });
  model.addEventListener('change', () => {
    year.innerHTML = '<option value="">Seleccionar</option>'; engine.innerHTML = '<option value="">Todos</option>';
    year.disabled = !model.value; engine.disabled = true;
    if (model.value) year.innerHTML += getYearsForModel(brand.value, model.value).map(y => `<option>${y}</option>`).join('');
  });
  year.addEventListener('change', () => {
    engine.innerHTML = '<option value="">Todos</option>'; engine.disabled = !year.value;
    if (year.value) engine.innerHTML += getEnginesForVehicle(brand.value, model.value, year.value).map(e => `<option>${e}</option>`).join('');
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!brand.value || !model.value) { toast('Selecciona al menos marca y modelo', 'warning'); return; }
    const matched = findVehicleObject(brand.value, model.value, year.value);
    state.vehicle = { brand: brand.value, model: model.value, year: year.value ? parseInt(year.value) : null, engine: engine.value || null, id: matched ? matched.id : null };
    renderCatalog(); reset.style.display = 'flex';
    toast(`Filtro activo: ${brand.value} ${model.value}`, 'success');
  });
  reset.addEventListener('click', () => {
    state.vehicle = null; [brand, model, year, engine].forEach(s => s.value = '');
    model.disabled = year.disabled = engine.disabled = true; reset.style.display = 'none';
    renderCatalog(); toast('Filtro restablecido', 'info');
  });
}

/* ========================= CATEGORÍAS ========================= */
function initCategories() {
  $$('[data-category]').forEach(el => el.addEventListener('click', (e) => { e.preventDefault(); setCategory(el.getAttribute('data-category')); go('/tienda'); }));
  $$('.cat-pill').forEach(p => p.addEventListener('click', () => setCategory(p.getAttribute('data-cat'))));
}
function setCategory(cat) {
  state.category = cat; state.brand = 'all';
  const fb = $('#filter-brand'); if (fb) fb.value = 'all';
  $$('.cat-pill').forEach(p => p.classList.toggle('active', p.getAttribute('data-cat') === cat));
  renderCatalog();
}

/* ========================= TOOLS ========================= */
function initCatalogTools() {
  $('#filter-brand')?.addEventListener('change', (e) => { state.brand = e.target.value; renderCatalog(); });
  $('#sort-products')?.addEventListener('change', (e) => { state.sort = e.target.value; renderCatalog(); });
}
function getFiltered() {
  let ps = PRODUCTS_DATABASE.filter(p => {
    if (state.category !== 'all' && p.category !== state.category) return false;
    if (state.brand !== 'all' && p.brand !== state.brand) return false;
    if (state.query.trim()) { const q = state.query.toLowerCase(); if (![p.name, p.sku, p.oemCode, p.brand].some(v => v.toLowerCase().includes(q))) return false; }
    if (state.vehicle && state.vehicle.id && !p.compatibleVehicles.includes(state.vehicle.id)) return false;
    return true;
  });
  if (state.sort === 'price-low') ps.sort((a, b) => a.price - b.price);
  else if (state.sort === 'price-high') ps.sort((a, b) => b.price - a.price);
  else if (state.sort === 'name') ps.sort((a, b) => a.name.localeCompare(b.name));
  return ps;
}
const CAT_NAMES = { all: 'Todos', frenos: 'Frenos & Discos', suspension: 'Suspensión', filtros: 'Aceites & Filtros', motor: 'Motor', electricidad: 'Electricidad' };

function cardHTML(p) {
  const fit = state.vehicle && state.vehicle.id && p.compatibleVehicles.includes(state.vehicle.id);
  const off = p.compareAtPrice ? Math.round((1 - p.price / p.compareAtPrice) * 100) : 0;
  const wished = state.wishlist.includes(p.id);
  const low = p.stock <= 6;
  return `
    <article class="card" data-id="${p.id}">
      <div class="card-media" data-open="${p.id}">
        <span class="card-brand">${p.brand}</span>
        <div class="card-badges">${off ? `<span class="badge-off">-${off}%</span>` : ''}${fit ? `<span class="badge-fit"><i class="fa-solid fa-check"></i> Calce OK</span>` : ''}</div>
        <img src="${p.image}" alt="${p.name}" loading="lazy">
        <button class="card-wish ${wished ? 'on' : ''}" data-wish="${p.id}" title="Guardar"><i class="fa-${wished ? 'solid' : 'regular'} fa-heart"></i></button>
        <button class="quick-add" data-add="${p.id}" title="Añadir"><i class="fa-solid fa-plus"></i></button>
      </div>
      <div class="card-body">
        <span class="card-cat">${p.category}</span>
        <h3 class="card-title" data-open="${p.id}">${p.name}</h3>
        <span class="card-oem">OEM · ${p.oemCode}</span>
        <div class="card-meta"><span class="rating"><i class="fa-solid fa-star"></i> ${p.rating}</span><span>(${p.reviewsCount})</span></div>
        <div class="card-foot">
          <div>
            ${p.compareAtPrice ? `<span class="card-compare">${formatCLP(p.compareAtPrice)}</span>` : ''}
            <span class="card-price">${formatCLP(p.price)}</span>
            <span class="card-stock ${low ? 'low' : ''}">${low ? `¡Solo ${p.stock}!` : 'En stock'}</span>
          </div>
          <button class="card-add-btn" data-add="${p.id}">Añadir</button>
        </div>
      </div>
    </article>`;
}
function bindCards(grid) {
  $$('[data-add]', grid).forEach(b => b.addEventListener('click', (e) => { e.stopPropagation(); addToCart(b.getAttribute('data-add')); }));
  $$('[data-wish]', grid).forEach(b => b.addEventListener('click', (e) => { e.stopPropagation(); toggleWish(b.getAttribute('data-wish')); }));
  $$('[data-open]', grid).forEach(b => b.addEventListener('click', () => openProduct(b.getAttribute('data-open'))));
}
function renderCatalog() {
  const grid = $('#product-grid'); if (!grid) return;
  const ps = getFiltered();
  $('#catalog-count').textContent = `${String(ps.length).padStart(2, '0')} repuestos${state.category !== 'all' ? ' · ' + CAT_NAMES[state.category] : ''}`;
  renderChips();
  if (!ps.length) {
    grid.innerHTML = `<div class="empty"><i class="fa-solid fa-triangle-exclamation"></i><h3>Sin repuestos compatibles</h3><p>Prueba limpiar los filtros o buscar por código OEM.</p><button class="btn btn-dark" id="clear-all">Limpiar todo</button></div>`;
    $('#clear-all').addEventListener('click', clearAllFilters); return;
  }
  grid.innerHTML = ps.map(cardHTML).join(''); bindCards(grid);
}
function renderChips() {
  const wrap = $('#chips'), list = $('#chips-list'); if (!wrap) return;
  const chips = [];
  if (state.vehicle) chips.push({ t: 'veh', l: `${state.vehicle.brand} ${state.vehicle.model}` });
  if (state.category !== 'all') chips.push({ t: 'cat', l: CAT_NAMES[state.category] });
  if (state.brand !== 'all') chips.push({ t: 'brand', l: state.brand });
  if (state.query) chips.push({ t: 'query', l: `"${state.query}"` });
  if (!chips.length) { wrap.style.display = 'none'; return; }
  wrap.style.display = 'block';
  list.innerHTML = chips.map(c => `<span class="chip">${c.l} <i class="fa-solid fa-xmark" data-chip="${c.t}"></i></span>`).join('');
  $$('[data-chip]', list).forEach(x => x.addEventListener('click', () => {
    const t = x.getAttribute('data-chip');
    if (t === 'veh') { state.vehicle = null; $('#f-reset').style.display = 'none'; }
    if (t === 'cat') setCategory('all');
    if (t === 'brand') { state.brand = 'all'; $('#filter-brand').value = 'all'; }
    if (t === 'query') { state.query = ''; $('#search-input').value = ''; }
    renderCatalog();
  }));
}
function clearAllFilters() {
  state.category = 'all'; state.brand = 'all'; state.query = ''; state.vehicle = null;
  $('#filter-brand').value = 'all'; $('#search-input').value = ''; $('#f-reset').style.display = 'none';
  $$('.cat-pill').forEach(p => p.classList.toggle('active', p.getAttribute('data-cat') === 'all'));
  renderCatalog();
}

/* ========================= BUSCADOR ========================= */
function initSearch() {
  const overlay = $('#search-overlay'), input = $('#search-input'), results = $('#search-results');
  const open = () => { overlay.classList.add('open'); setTimeout(() => input.focus(), 100); };
  const close = () => overlay.classList.remove('open');
  $('#open-search')?.addEventListener('click', open);
  overlay?.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', (e) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); open(); } if (e.key === 'Escape') close(); });
  input?.addEventListener('input', () => {
    const q = input.value.toLowerCase().trim();
    if (q.length < 2) { results.innerHTML = '<div class="search-hint">Escribe para buscar entre nuestros repuestos.</div>'; return; }
    const m = PRODUCTS_DATABASE.filter(p => [p.name, p.sku, p.oemCode, p.brand].some(v => v.toLowerCase().includes(q))).slice(0, 6);
    if (!m.length) { results.innerHTML = '<div class="search-hint">Sin resultados.</div>'; return; }
    results.innerHTML = m.map(p => `<div class="search-row" data-id="${p.id}"><img src="${p.image}" alt=""><div><div class="sr-title">${p.name}</div><div class="sr-meta">${p.brand} · OEM ${p.oemCode}</div></div><div class="sr-price">${formatCLP(p.price)}</div></div>`).join('');
    $$('.search-row', results).forEach(r => r.addEventListener('click', () => { close(); openProduct(r.getAttribute('data-id')); }));
  });

  // Buscador integrado en Hero
  const heroInput = $('#hero-search-input');
  const heroBtn = $('#hero-search-btn');
  const doHeroSearch = () => {
    const q = heroInput?.value.trim();
    if (!q) return;
    state.query = q;
    state.category = 'all';
    go('/tienda');
    renderCatalog();
    toast(`Buscando: "${q}"`, 'info');
  };
  heroBtn?.addEventListener('click', doHeroSearch);
  heroInput?.addEventListener('keydown', (e) => { if (e.key === 'Enter') doHeroSearch(); });
}

/* ========================= WISHLIST ========================= */
function initWishlist() {
  $('#open-wishlist').addEventListener('click', () => {
    if (!state.wishlist.length) { toast('No tienes repuestos guardados aún', 'info'); return; }
    go('/tienda');
    setTimeout(() => {
      clearAllFilters();
      const grid = $('#product-grid');
      const items = PRODUCTS_DATABASE.filter(p => state.wishlist.includes(p.id));
      $('#catalog-count').textContent = `${items.length} guardados`;
      grid.innerHTML = items.map(cardHTML).join(''); bindCards(grid);
    }, 250);
  });
}
function toggleWish(id) {
  const i = state.wishlist.indexOf(id);
  if (i >= 0) { state.wishlist.splice(i, 1); toast('Quitado de guardados', 'info'); }
  else { state.wishlist.push(id); toast('Guardado ♥', 'success'); }
  saveStorage(); updateWishUI();
  $$(`[data-wish="${id}"]`).forEach(b => { const on = state.wishlist.includes(id); b.classList.toggle('on', on); b.querySelector('i').className = `fa-${on ? 'solid' : 'regular'} fa-heart`; });
}
function updateWishUI() {
  const c = $('#wish-count'), btn = $('#open-wishlist');
  c.textContent = state.wishlist.length; c.classList.toggle('show', state.wishlist.length > 0);
  btn.classList.toggle('has', state.wishlist.length > 0);
  btn.querySelector('i').className = state.wishlist.length ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
}

/* ========================= CARRITO ========================= */
function initCart() {
  const drawer = $('#drawer'), overlay = $('#drawer-overlay');
  const open = () => { drawer.classList.add('open'); overlay.classList.add('open'); };
  const close = () => { drawer.classList.remove('open'); overlay.classList.remove('open'); };
  $('#open-cart').addEventListener('click', open);
  $('#close-cart').addEventListener('click', close);
  overlay.addEventListener('click', close);
  $('#continue-shopping').addEventListener('click', () => { close(); go('/tienda'); });
  $('#clear-cart').addEventListener('click', () => { if (!state.cart.length) return; state.cart = []; state.coupon = null; saveStorage(); updateCartUI(); toast('Carrito vaciado', 'info'); });
  $('#go-checkout').addEventListener('click', () => { if (!state.cart.length) { toast('Tu carrito está vacío', 'warning'); return; } close(); openCheckout(); });
  $('#coupon-apply').addEventListener('click', applyCoupon);
  $('#coupon-input').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); applyCoupon(); } });
}
function applyCoupon() {
  const code = $('#coupon-input').value.trim().toUpperCase(); if (!code) return;
  if (COUPONS[code]) { state.coupon = { code, ...COUPONS[code] }; toast(`Cupón ${code} aplicado (${COUPONS[code].label})`, 'success'); }
  else { state.coupon = null; toast('Cupón no válido', 'warning'); }
  updateCartUI();
}
function cartTotals() {
  const subtotal = state.cart.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const discount = state.coupon ? Math.round(subtotal * state.coupon.value) : 0;
  const afterDisc = subtotal - discount;
  const shipping = state.cart.length && afterDisc < FREE_SHIPPING ? SHIPPING_COST : 0;
  const total = afterDisc + shipping;
  return { subtotal, discount, shipping, total };
}
function addToCart(id, qty = 1) {
  const product = PRODUCTS_DATABASE.find(p => p.id === id); if (!product) return;
  const ex = state.cart.find(i => i.product.id === id);
  if (ex) ex.quantity += qty; else state.cart.push({ product, quantity: qty });
  saveStorage(); updateCartUI();
  const btn = $('#open-cart'); btn.classList.remove('bump'); void btn.offsetWidth; btn.classList.add('bump');
  toast(`Añadido: ${product.name.slice(0, 28)}…`, 'success');
}
function updateCartUI() {
  const items = state.cart.reduce((s, i) => s + i.quantity, 0);
  const { subtotal, discount, shipping, total } = cartTotals();
  $('#cart-count').textContent = items; $('#drawer-count').textContent = items;
  $('#cart-subtotal').textContent = formatCLP(subtotal);
  $('#cart-total').textContent = formatCLP(total);
  $('#cart-shipping').textContent = shipping ? formatCLP(shipping) : 'Gratis';
  const dr = $('#discount-row');
  if (discount) { dr.style.display = 'flex'; $('#cart-discount').textContent = '-' + formatCLP(discount); $('#discount-label').textContent = `(${state.coupon.code})`; } else dr.style.display = 'none';
  const pct = Math.min(100, ((subtotal - discount) / FREE_SHIPPING) * 100);
  $('#ship-fill').style.width = pct + '%';
  $('#ship-status').innerHTML = (subtotal - discount) >= FREE_SHIPPING ? '<span class="ok">¡Activado!</span>' : `Faltan ${formatCLP(FREE_SHIPPING - (subtotal - discount))}`;
  const body = $('#cart-body');
  if (!state.cart.length) {
    body.innerHTML = `<div class="cart-empty"><i class="fa-solid fa-cart-flatbed"></i><p>Tu carrito está vacío.</p><button class="btn btn-primary" id="empty-go">Ir a la tienda</button></div>`;
    $('#empty-go').addEventListener('click', () => { $('#drawer').classList.remove('open'); $('#drawer-overlay').classList.remove('open'); go('/tienda'); });
    $('#drawer-foot').style.display = 'none'; return;
  }
  $('#drawer-foot').style.display = 'block';
  body.innerHTML = state.cart.map(i => `
    <div class="cart-item"><img src="${i.product.image}" alt="">
      <div class="cart-item-info"><div class="ci-title">${i.product.name}</div><div class="ci-price">${formatCLP(i.product.price)}</div>
        <div class="qty"><button data-minus="${i.product.id}">−</button><span>${i.quantity}</span><button data-plus="${i.product.id}">+</button></div></div>
      <button class="ci-remove" data-remove="${i.product.id}"><i class="fa-solid fa-trash-can"></i></button></div>`).join('');
  $$('[data-plus]', body).forEach(b => b.addEventListener('click', () => changeQty(b.getAttribute('data-plus'), 1)));
  $$('[data-minus]', body).forEach(b => b.addEventListener('click', () => changeQty(b.getAttribute('data-minus'), -1)));
  $$('[data-remove]', body).forEach(b => b.addEventListener('click', () => { state.cart = state.cart.filter(i => i.product.id !== b.getAttribute('data-remove')); saveStorage(); updateCartUI(); toast('Removido', 'info'); }));
}
function changeQty(id, d) {
  const it = state.cart.find(i => i.product.id === id); if (!it) return;
  it.quantity += d; if (it.quantity <= 0) state.cart = state.cart.filter(i => i.product.id !== id);
  saveStorage(); updateCartUI();
}

/* ========================= MODALES ========================= */
function initModals() {
  $$('[data-close]').forEach(b => b.addEventListener('click', () => b.closest('dialog').close()));
  $$('dialog.modal').forEach(d => d.addEventListener('click', (e) => { if (e.target === d) d.close(); }));
  $$('[data-legal]').forEach(a => a.addEventListener('click', (e) => { e.preventDefault(); openLegal(a.getAttribute('data-legal')); }));
  document.addEventListener('change', (e) => { if (e.target.name === 'pay') $$('.pay-option').forEach(o => o.classList.toggle('sel', o.contains(e.target))); });
  initCheckout();
}
function openProduct(id) {
  go('/producto/' + id);
}

function renderProductPage(id) {
  const p = PRODUCTS_DATABASE.find(x => x.id === id) || PRODUCTS_DATABASE[0];
  const fit = state.vehicle && state.vehicle.id && p.compatibleVehicles.includes(state.vehicle.id);
  const off = p.compareAtPrice ? Math.round((1 - p.price / p.compareAtPrice) * 100) : 0;
  const wished = state.wishlist.includes(p.id);
  let qty = 1;

  const content = $('#pdp-detail-content');
  if (!content) return;

  content.innerHTML = `
    <div class="pdp-media-col">
      <div class="pdp-image-wrap">
        <span class="pdp-brand-tag">${p.brand}</span>
        ${off ? `<span class="badge-off pdp-badge">-${off}% OFF</span>` : ''}
        <img src="${p.image}" alt="${p.name}" class="pdp-img">
      </div>
      ${fit ? `<div class="pdp-fit-box"><i class="fa-solid fa-circle-check"></i><div><strong>Calce Garantizado</strong><p>Pieza compatible con tu ${state.vehicle.brand} ${state.vehicle.model} ${state.vehicle.year || ''}</p></div></div>` : ''}
    </div>

    <div class="pdp-info-col">
      <span class="eyebrow">${p.brand} · ${CAT_NAMES[p.category] || p.category}</span>
      <h1 class="pdp-title">${p.name}</h1>
      <div class="pdp-codes"><span>OEM: ${p.oemCode}</span><span>SKU: ${p.sku}</span></div>
      
      <div class="pdp-price-box">
        <span class="pdp-price">${formatCLP(p.price)}</span>
        ${p.compareAtPrice ? `<span class="pdp-compare">${formatCLP(p.compareAtPrice)}</span>` : ''}
        <span class="pdp-stock-badge ${p.stock <= 6 ? 'low' : ''}"><i class="fa-solid fa-box-open"></i> ${p.stock <= 6 ? `¡Solo ${p.stock} unidades!` : 'En Stock disponible'}</span>
      </div>

      <div class="pdp-rating-row">
        <span class="rating" style="color:#e6a100;font-weight:700;"><i class="fa-solid fa-star"></i> ${p.rating}</span>
        <span style="color:var(--ink-3);">(${p.reviewsCount} reseñas verificadas)</span>
      </div>

      <p class="pdp-description">${p.description}</p>

      <div class="pdp-specs-table">
        <h3>Especificaciones técnicas</h3>
        <div class="specs-grid">
          ${p.specifications.map(s => `<div class="spec-row"><span>${s.key}</span><strong>${s.value}</strong></div>`).join('')}
        </div>
      </div>

      <div class="pdp-actions">
        <div class="pm-qty">
          <button id="pdp-minus">−</button>
          <span id="pdp-qval">1</span>
          <button id="pdp-plus">+</button>
        </div>
        <button class="btn btn-primary pdp-buy-btn" id="pdp-add"><i class="fa-solid fa-cart-shopping"></i> Añadir al carrito</button>
        <button class="pdp-wish-btn ${wished ? 'on' : ''}" id="pdp-wish" title="Guardar"><i class="fa-${wished ? 'solid' : 'regular'} fa-heart"></i></button>
      </div>
    </div>`;

  $('#pdp-minus')?.addEventListener('click', () => { qty = Math.max(1, qty - 1); $('#pdp-qval').textContent = qty; });
  $('#pdp-plus')?.addEventListener('click', () => { qty++; $('#pdp-qval').textContent = qty; });
  $('#pdp-add')?.addEventListener('click', () => addToCart(p.id, qty));
  $('#pdp-wish')?.addEventListener('click', () => { toggleWish(p.id); renderProductPage(id); });

  // Render related products
  const relatedGrid = $('#pdp-related-grid');
  if (relatedGrid) {
    const related = PRODUCTS_DATABASE.filter(x => x.id !== p.id && (x.category === p.category || x.brand === p.brand)).slice(0, 4);
    relatedGrid.innerHTML = related.map(cardHTML).join('');
    bindCards(relatedGrid);
  }
}
function initCheckout() {
  $('#co-back')?.addEventListener('click', () => {
    $('#checkout-modal').close();
    openCart();
  });
  $('#checkout-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = $('#co-name').value, rut = $('#co-rut').value, email = $('#co-email').value;
    const { total } = cartTotals();
    $('#checkout-modal').close(); toast('Procesando pago seguro…', 'info');
    setTimeout(() => { openSuccess(name, rut, email, total); state.cart = []; state.coupon = null; saveStorage(); updateCartUI(); }, 1200);
  });
}
function initContactBuilder() {
  const container = $('.contact-step-builder-wrapper');
  if (!container) return;

  const step1 = $('#builder-step-1');
  const step2 = $('#builder-step-2');
  const step3 = $('#builder-step-3');
  const preview = $('#builder-live-preview');
  const customName = $('#b-name');
  const customVeh = $('#b-vehicle-custom');
  const btn = $('#btn-ws-builder');

  function getSelectedVal(groupEl) {
    const active = groupEl?.querySelector('.pill-opt.active');
    return active ? active.getAttribute('data-val') : '';
  }

  function updatePreview() {
    const cat = getSelectedVal(step1);
    const brand = getSelectedVal(step2);
    const shipping = getSelectedVal(step3);
    const nameVal = customName ? customName.value.trim() : '';
    const customVehVal = customVeh ? customVeh.value.trim() : '';

    let greeting = nameVal ? `Hola AUTOPART, soy ${nameVal}.` : `Hola AUTOPART,`;
    let customNote = customVehVal ? `\n► Detalle/OEM: ${customVehVal}` : '';

    const textMsg = `${greeting}\n\nMe gustaría cotizar repuestos para mi vehículo:\n\n► Categoría: ${cat}\n► Marca/Vehículo: ${brand}\n► Despacho: ${shipping}${customNote}\n\n¿Tienen disponibilidad y precio con calce 100% garantizado? ¡Quedo atento/a!`;

    if (preview) {
      preview.textContent = textMsg;
    }
    return textMsg;
  }

  [step1, step2, step3].forEach(group => {
    if (!group) return;
    group.addEventListener('click', (e) => {
      const btnEl = e.target.closest('.pill-opt');
      if (!btnEl) return;
      group.querySelectorAll('.pill-opt').forEach(p => p.classList.remove('active'));
      btnEl.classList.add('active');
      updatePreview();
    });
  });

  [customName, customVeh].forEach(inp => {
    if (inp) inp.addEventListener('input', updatePreview);
  });

  if (btn) {
    btn.addEventListener('click', () => {
      const msg = updatePreview();
      const wsUrl = `https://wa.me/56987654321?text=${encodeURIComponent(msg)}`;
      toast('Redirigiendo a WhatsApp…', 'success');
      setTimeout(() => {
        window.open(wsUrl, '_blank');
      }, 400);
    });
  }

  updatePreview();
}

function openCheckout() {
  const { subtotal, discount, shipping, total } = cartTotals();
  $('#co-subtotal').textContent = formatCLP(subtotal);
  $('#co-shipping').textContent = shipping ? formatCLP(shipping) : 'Gratis';
  $('#co-total').textContent = formatCLP(total);
  $('#co-pay-total').textContent = formatCLP(total).replace(' CLP', '');
  const dr = $('#co-discount-row');
  if (discount) { dr.style.display = 'flex'; $('#co-discount').textContent = '-' + formatCLP(discount); } else dr.style.display = 'none';
  $('#co-summary-items').innerHTML = state.cart.map(i => `<div class="co-sum-item"><span>${i.quantity}× ${i.product.name}</span><strong>${formatCLP(i.product.price * i.quantity)}</strong></div>`).join('');
  $('#checkout-modal').showModal();
}
function openSuccess(name, rut, email, total) {
  $('#s-order-id').textContent = '#AR-' + Math.floor(100000 + Math.random() * 900000);
  $('#s-details').innerHTML = `<p><span>Cliente</span><span>${name || '—'}</span></p><p><span>RUT</span><span>${rut || '—'}</span></p><p><span>Total pagado</span><span>${formatCLP(total)}</span></p><p><span>Comprobante</span><span>${email || '—'}</span></p><p><span>Estado</span><span style="color:#16a34a;">✓ Aprobado</span></p>`;
  $('#success-modal').showModal();
}
const LEGAL = {
  privacy: { t: 'Política de privacidad', b: 'Tus datos personales se tratan conforme a la Ley 19.628. Solo los usamos para procesar pedidos y despachos; no los compartimos sin tu consentimiento. Esta es una demostración y no procesa datos reales.' },
  terms: { t: 'Términos y condiciones', b: 'Las compras están sujetas a disponibilidad de stock. Los precios incluyen IVA. El calce garantizado aplica al seleccionar tu vehículo. Sitio de demostración; ninguna transacción es real.' },
  guarantee: { t: 'Garantía legal', b: 'Todos los repuestos cuentan con garantía legal de 6 meses según la Ley 19.496. Ante fallas de fabricación puedes solicitar cambio, reparación o devolución.' }
};
function openLegal(k) { const l = LEGAL[k]; if (!l) return; $('#legal-body').innerHTML = `<h2>${l.t}</h2><p>${l.b}</p>`; $('#legal-modal').showModal(); }

/* ========================= CONTACTO ========================= */
function initContact() {
  initContactBuilder();
}

/* ========================= EXTRAS ========================= */
function initExtras() {
  const toTop = $('#to-top');
  window.addEventListener('scroll', () => toTop.classList.toggle('show', window.scrollY > 500), { passive: true });
  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}
function toast(msg, type = 'success') {
  const icon = type === 'warning' ? 'fa-triangle-exclamation' : type === 'info' ? 'fa-circle-info' : 'fa-circle-check';
  const el = document.createElement('div'); el.className = `toast ${type}`;
  el.innerHTML = `<i class="fa-solid ${icon}"></i><span>${msg}</span>`;
  $('#toast-wrap').appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transform = 'translateY(10px)'; setTimeout(() => el.remove(), 300); }, 3000);
}

/* ========================= ADMIN PANEL ========================= */
function initAdminPanel() {
  const tbody = $('#admin-products-tbody');
  const tabs = $$('.admin-tab');
  const tabContents = $$('.admin-tab-content');
  const modalForm = $('#modal-product-form');
  const btnAdd = $('#btn-add-product-modal');
  const btnClose = $('#close-product-form');
  const btnCancel = $('#cancel-product-form');
  const crudForm = $('#product-crud-form');

  // Load custom products from localStorage if present
  try {
    const customProds = JSON.parse(localStorage.getItem('autopart_custom_products') || '[]');
    if (Array.isArray(customProds) && customProds.length > 0) {
      customProds.forEach(cp => {
        if (!PRODUCTS_DATABASE.some(p => p.id === cp.id)) {
          PRODUCTS_DATABASE.unshift(cp);
        }
      });
    }
  } catch (e) {}

  // Tab navigation inside admin
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-tab');
      tabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(tc => tc.classList.remove('active'));
      tab.classList.add('active');
      $(`#tab-admin-${target}`)?.classList.add('active');
    });
  });

  function renderAdminProductsTable() {
    if (!tbody) return;
    tbody.innerHTML = PRODUCTS_DATABASE.map(p => `
      <tr data-id="${p.id}">
        <td><img src="${p.image}" alt="${p.name}" class="admin-img-thumb"></td>
        <td><strong>${p.name}</strong></td>
        <td><span class="chip">${p.brand}</span></td>
        <td><span style="text-transform:capitalize;">${p.category}</span></td>
        <td><strong style="color:var(--blue-soft);">${formatCLP(p.price)}</strong></td>
        <td><span class="card-stock ${p.stock < 10 ? 'low' : ''}">${p.stock} un.</span></td>
        <td><code style="font-family:var(--font-mono);font-size:.76rem;">${p.oemCode || '—'}</code></td>
        <td>
          <div class="admin-actions">
            <button type="button" class="admin-btn-sm admin-btn-edit" data-edit="${p.id}"><i class="fa-solid fa-pen"></i> Editar</button>
            <button type="button" class="admin-btn-sm admin-btn-del" data-del="${p.id}"><i class="fa-solid fa-trash"></i> Eliminar</button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  // Open modal for new product
  btnAdd?.addEventListener('click', () => {
    $('#form-product-title').textContent = 'Añadir Nuevo Repuesto';
    crudForm.reset();
    $('#crud-id').value = '';
    modalForm.showModal();
  });

  // Close modal
  [btnClose, btnCancel].forEach(b => b?.addEventListener('click', () => modalForm.close()));

  // Table actions (Edit / Delete)
  tbody?.addEventListener('click', (e) => {
    const editBtn = e.target.closest('[data-edit]');
    const delBtn = e.target.closest('[data-del]');

    if (editBtn) {
      const id = editBtn.getAttribute('data-edit');
      const prod = PRODUCTS_DATABASE.find(p => p.id === id);
      if (!prod) return;
      $('#form-product-title').textContent = 'Editar Repuesto';
      $('#crud-id').value = prod.id;
      $('#crud-name').value = prod.name;
      $('#crud-brand').value = prod.brand;
      $('#crud-category').value = prod.category;
      $('#crud-price').value = prod.price;
      $('#crud-stock').value = prod.stock;
      $('#crud-oem').value = prod.oemCode || '';
      $('#crud-image').value = prod.image;
      $('#crud-description').value = prod.description || '';
      modalForm.showModal();
    }

    if (delBtn) {
      const id = delBtn.getAttribute('data-del');
      if (confirm('¿Estás seguro de eliminar este repuesto del inventario?')) {
        const idx = PRODUCTS_DATABASE.findIndex(p => p.id === id);
        if (idx !== -1) {
          PRODUCTS_DATABASE.splice(idx, 1);
          renderAdminProductsTable();
          renderCatalog();
          saveCustomProducts();
          toast('Repuesto eliminado del inventario.', 'warning');
        }
      }
    }
  });

  // Save product form
  crudForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = $('#crud-id').value;
    const name = $('#crud-name').value.trim();
    const brand = $('#crud-brand').value.trim();
    const category = $('#crud-category').value;
    const price = parseInt($('#crud-price').value) || 0;
    const stock = parseInt($('#crud-stock').value) || 0;
    const oemCode = $('#crud-oem').value.trim();
    const image = $('#crud-image').value.trim();
    const description = $('#crud-description').value.trim();

    if (id) {
      // Edit
      const prod = PRODUCTS_DATABASE.find(p => p.id === id);
      if (prod) {
        prod.name = name; prod.brand = brand; prod.category = category;
        prod.price = price; prod.stock = stock; prod.oemCode = oemCode;
        prod.image = image; prod.description = description;
      }
      toast('Repuesto actualizado con éxito', 'success');
    } else {
      // Add
      const newId = 'prod-custom-' + Date.now();
      const newProd = {
        id: newId, name, brand, category, price, stock, oemCode, image, description,
        rating: 5.0, reviewsCount: 1, sku: 'AUT-' + Math.floor(1000 + Math.random() * 9000),
        specifications: [{ key: 'Origen', value: 'Importación Directa' }],
        compatibleVehicles: ['v-toyota-yaris-2018-15', 'v-hyundai-accent-2019-14']
      };
      PRODUCTS_DATABASE.unshift(newProd);
      toast('Nuevo repuesto agregado al catálogo', 'success');
    }

    renderAdminProductsTable();
    renderCatalog();
    saveCustomProducts();
    modalForm.close();
  });

  function saveCustomProducts() {
    try {
      const custom = PRODUCTS_DATABASE.filter(p => p.id.startsWith('prod-custom-'));
      localStorage.setItem('autopart_custom_products', JSON.stringify(custom));
    } catch (e) {}
  }

  renderAdminProductsTable();
}
