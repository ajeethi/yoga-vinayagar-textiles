/* ============================================================
   YOGA VINAYAGAR TEXTILES — CART ENGINE
   LocalStorage-based cart with drawer, quantities, totals
   ============================================================ */

'use strict';

// ── Constants ─────────────────────────────────────────────
const CART_KEY     = 'yv_cart';
const FREE_SHIP    = 999;
const SHIP_COST    = 60;

// ── State ──────────────────────────────────────────────────
let cartDrawerOpen = false;

// ── Init ───────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
  initCartDrawer();
  renderCart();
});

/* ══════════════════════════════════════════════════════════
   CART DATA
══════════════════════════════════════════════════════════ */
function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  syncCartUI(cart);
}

function getCartTotal(cart) {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function getCartCount(cart) {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

/* ══════════════════════════════════════════════════════════
   ADD TO CART (called from product cards)
══════════════════════════════════════════════════════════ */
function addToCart(productId, name, price, image, qty = 1) {
  const cart  = getCart();
  const index = cart.findIndex(item => item.id === productId);

  if (index > -1) {
    cart[index].qty += qty;
  } else {
    cart.push({
      id:    productId,
      name:  name,
      price: price,
      image: image || 'images/hero-cotton.png',
      qty:   qty
    });
  }

  saveCart(cart);
  renderCart();
  openCartDrawer();
  showToast(`"${name}" added to cart! 🛍️`, 'success');
}

/* ══════════════════════════════════════════════════════════
   UPDATE QUANTITY
══════════════════════════════════════════════════════════ */
function updateQty(productId, delta) {
  const cart  = getCart();
  const index = cart.findIndex(item => item.id === productId);

  if (index === -1) return;

  cart[index].qty += delta;

  if (cart[index].qty <= 0) {
    cart.splice(index, 1);
    showToast('Item removed from cart', 'info');
  }

  saveCart(cart);
  renderCart();
}

/* ══════════════════════════════════════════════════════════
   REMOVE ITEM
══════════════════════════════════════════════════════════ */
function removeFromCart(productId) {
  let cart = getCart();
  cart = cart.filter(item => item.id !== productId);
  saveCart(cart);
  renderCart();
  showToast('Item removed from cart', 'info');
}

/* ══════════════════════════════════════════════════════════
   SYNC UI (count badges)
══════════════════════════════════════════════════════════ */
function syncCartUI(cart) {
  const count = getCartCount(cart);

  // Navbar badge
  const cartCountEl = document.getElementById('cartCount');
  if (cartCountEl) {
    cartCountEl.textContent = count;
    cartCountEl.style.display = count > 0 ? 'flex' : 'none';
  }

  // Drawer badge
  const cartItemCountEl = document.getElementById('cartItemCount');
  if (cartItemCountEl) cartItemCountEl.textContent = count;
}

/* ══════════════════════════════════════════════════════════
   RENDER CART DRAWER
══════════════════════════════════════════════════════════ */
function renderCart() {
  const cart      = getCart();
  const body      = document.getElementById('cartBody');
  const footer    = document.getElementById('cartFooter');
  const totalEl   = document.getElementById('cartTotal');

  if (!body) return;

  syncCartUI(cart);

  if (cart.length === 0) {
    body.innerHTML = `
      <div style="text-align:center;padding:3rem 1rem;">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--clr-charcoal-200)" stroke-width="1" style="margin-inline:auto;margin-bottom:1rem;" aria-hidden="true">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
        <p style="color:var(--clr-charcoal-400);font-family:var(--font-heading);font-size:1.1rem;">Your cart is empty</p>
        <p style="color:var(--clr-charcoal-400);font-size:var(--fs-sm);margin-top:0.5rem;">Discover our beautiful saree collections</p>
        <a href="pages/collections.html" class="btn btn-maroon btn-sm" style="margin-top:1.5rem;display:inline-flex;">Shop Now →</a>
      </div>`;
    if (footer) footer.style.display = 'none';
    return;
  }

  // Render items
  const subtotal = getCartTotal(cart);
  const shipping = subtotal >= FREE_SHIP ? 0 : SHIP_COST;
  const total    = subtotal + shipping;

  body.innerHTML = cart.map(item => `
    <div style="display:flex;gap:1rem;padding:1rem 0;border-bottom:1px solid var(--clr-ivory-300);align-items:flex-start;" data-cart-item="${item.id}">
      <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" style="width:72px;height:90px;object-fit:cover;border-radius:var(--radius-md);flex-shrink:0;" loading="lazy" />
      <div style="flex:1;min-width:0;">
        <div style="font-family:var(--font-heading);font-size:var(--fs-base);font-weight:500;color:var(--clr-charcoal-900);line-height:1.3;margin-bottom:0.25rem;" class="line-clamp-2">${escapeHtml(item.name)}</div>
        <div style="font-family:var(--font-heading);font-size:var(--fs-base);font-weight:600;color:var(--clr-maroon-800);margin-bottom:0.75rem;">${formatPrice(item.price)}</div>
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <div style="display:flex;align-items:center;gap:0;border:1px solid var(--clr-charcoal-200);border-radius:var(--radius-md);overflow:hidden;">
            <button onclick="updateQty('${item.id}', -1)" style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;border:none;background:none;cursor:pointer;color:var(--clr-charcoal-700);font-size:1.1rem;transition:background var(--transition-fast);" aria-label="Decrease quantity" onmouseover="this.style.background='var(--clr-ivory-300)'" onmouseout="this.style.background='none'">−</button>
            <span style="width:36px;text-align:center;font-weight:500;border-inline:1px solid var(--clr-charcoal-200);" aria-label="Quantity: ${item.qty}">${item.qty}</span>
            <button onclick="updateQty('${item.id}', 1)" style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;border:none;background:none;cursor:pointer;color:var(--clr-charcoal-700);font-size:1.1rem;transition:background var(--transition-fast);" aria-label="Increase quantity" onmouseover="this.style.background='var(--clr-ivory-300)'" onmouseout="this.style.background='none'">+</button>
          </div>
          <button onclick="removeFromCart('${item.id}')" style="color:var(--clr-error);background:none;border:none;cursor:pointer;font-size:var(--fs-xs);text-decoration:underline;" aria-label="Remove ${escapeHtml(item.name)} from cart">Remove</button>
        </div>
      </div>
    </div>
  `).join('');

  // Shipping notice
  body.innerHTML += `
    <div style="margin-top:1rem;padding:0.75rem;border-radius:var(--radius-md);${shipping === 0 ? 'background:rgba(45,106,79,0.06);border:1px solid rgba(45,106,79,0.12);' : 'background:var(--clr-gold-50);border:1px solid var(--clr-gold-200);'}">
      <p style="font-size:var(--fs-xs);color:${shipping === 0 ? 'var(--clr-success)' : 'var(--clr-gold-600)'};text-align:center;">
        ${shipping === 0
          ? '✓ You\'ve qualified for FREE shipping!'
          : `Add ${formatPrice(FREE_SHIP - subtotal)} more for FREE shipping`}
      </p>
    </div>
  `;

  // Footer
  if (footer) {
    footer.style.display = 'block';
    footer.innerHTML = `
      <div style="display:flex;justify-content:space-between;margin-bottom:0.5rem;font-size:var(--fs-sm);color:var(--clr-charcoal-600);">
        <span>Subtotal</span><span>${formatPrice(subtotal)}</span>
      </div>
      <div style="display:flex;justify-content:space-between;margin-bottom:0.75rem;font-size:var(--fs-sm);color:var(--clr-charcoal-600);">
        <span>Shipping</span><span style="color:${shipping===0?'var(--clr-success)':'inherit'}">${shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
      </div>
      <div style="display:flex;justify-content:space-between;margin-bottom:1rem;padding-top:0.75rem;border-top:1px solid var(--clr-ivory-300);">
        <span style="font-family:var(--font-heading);font-size:var(--fs-lg);font-weight:600;">Total</span>
        <span style="font-family:var(--font-heading);font-size:var(--fs-xl);font-weight:700;color:var(--clr-maroon-800);">${formatPrice(total)}</span>
      </div>
      <a href="pages/checkout.html" class="btn btn-gold" style="width:100%;justify-content:center;margin-bottom:0.75rem;" onclick="closeCartDrawer()">Proceed to Checkout →</a>
      <a href="pages/cart.html" class="btn btn-outline-maroon" style="width:100%;justify-content:center;" onclick="closeCartDrawer()">View Full Cart</a>
    `;
  }
}

/* ══════════════════════════════════════════════════════════
   CART DRAWER OPEN/CLOSE
══════════════════════════════════════════════════════════ */
function initCartDrawer() {
  const cartBtn     = document.getElementById('cartBtn');
  const drawer      = document.getElementById('cartDrawer');
  const closeBtn    = document.getElementById('closeCart');
  const cartOverlay = document.getElementById('cartOverlay');

  if (!drawer) return;

  if (cartBtn) {
    cartBtn.addEventListener('click', () => {
      if (cartDrawerOpen) closeCartDrawer();
      else openCartDrawer();
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeCartDrawer);
  }

  if (cartOverlay) {
    cartOverlay.addEventListener('click', closeCartDrawer);
  }

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && cartDrawerOpen) closeCartDrawer();
  });
}

function openCartDrawer() {
  const drawer      = document.getElementById('cartDrawer');
  const cartOverlay = document.getElementById('cartOverlay');

  if (!drawer) return;

  drawer.classList.add('open');
  if (cartOverlay) cartOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  cartDrawerOpen = true;

  // Focus close button
  const closeBtn = document.getElementById('closeCart');
  if (closeBtn) setTimeout(() => closeBtn.focus(), 100);
}

function closeCartDrawer() {
  const drawer      = document.getElementById('cartDrawer');
  const cartOverlay = document.getElementById('cartOverlay');
  const cartBtn     = document.getElementById('cartBtn');

  if (!drawer) return;

  drawer.classList.remove('open');
  if (cartOverlay) cartOverlay.classList.remove('open');
  document.body.style.overflow = '';
  cartDrawerOpen = false;

  if (cartBtn) cartBtn.focus();
}

/* ══════════════════════════════════════════════════════════
   HELPERS (shared with main.js)
══════════════════════════════════════════════════════════ */
function formatPrice(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(String(str)));
  return div.innerHTML;
}
