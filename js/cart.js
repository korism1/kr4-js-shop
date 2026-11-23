const CART_STORAGE_KEY = 'kr4-js-shop:cart';
const PROMO_CODE = 'SHOP10';
const PROMO_PERCENT = 10;
const MAX_QUANTITY = 99;

let cart = readCart();

function readCart() {
  const emptyCart = { items: [], promoCode: '' };

  try {
    const savedCart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY));
    if (!Array.isArray(savedCart?.items)) {
      return emptyCart;
    }

    const quantities = new Map();
    savedCart.items.forEach((item) => {
      const product = findProductById(products, item?.productId);
      if (!product?.isAvailable || !Number.isSafeInteger(item.quantity) || item.quantity < 1) {
        return;
      }

      const quantity = (quantities.get(product.id) ?? 0) + item.quantity;
      quantities.set(product.id, Math.min(quantity, MAX_QUANTITY));
    });

    return {
      items: Array.from(quantities, ([productId, quantity]) => ({ productId, quantity })),
      promoCode: quantities.size > 0 && savedCart.promoCode === PROMO_CODE ? PROMO_CODE : ''
    };
  } catch {
    return emptyCart;
  }
}

function saveCart() {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch {
    // Если хранилище недоступно, корзина работает в памяти текущей страницы.
  }

  updateCartCounters();
}

function getCartItems() {
  return cart.items.map(({ productId, quantity }) => ({
    product: findProductById(products, productId),
    quantity
  }));
}

function getCartTotals(items) {
  const subtotal = items.reduce((sum, { product, quantity }) => {
    return sum + calculateFinalPrice(product.price, product.discountPercent) * quantity;
  }, 0);
  const discount = cart.promoCode === PROMO_CODE
    ? Math.round(calculateDiscount(subtotal, PROMO_PERCENT) * 100) / 100
    : 0;

  return { subtotal, discount, total: subtotal - discount };
}

function setCartQuantity(productId, quantity) {
  if (quantity === 0) {
    cart.items = cart.items.filter((item) => item.productId !== productId);
  } else {
    const existingItem = cart.items.find((item) => item.productId === productId);
    if (existingItem) {
      existingItem.quantity = quantity;
    } else {
      cart.items.push({ productId, quantity });
    }
  }

  if (cart.items.length === 0) {
    cart.promoCode = '';
  }

  saveCart();
}

function addToCart(productId) {
  const product = findProductById(products, productId);
  const quantity = cart.items.find((item) => item.productId === productId)?.quantity ?? 0;

  if (!product?.isAvailable || quantity >= MAX_QUANTITY) {
    return false;
  }

  setCartQuantity(productId, quantity + 1);
  return true;
}

function clearCart() {
  cart = { items: [], promoCode: '' };
  saveCart();
}

function updateCartCounters() {
  const count = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  document.querySelectorAll('[data-cart-count]').forEach((element) => {
    element.textContent = count;
  });
}

function createCartButton(label, action, product, accessibleLabel, disabled = false) {
  const button = createTextElement('button', label, 'btn', 'btn-sm', 'btn-outline-secondary');
  button.type = 'button';
  button.dataset.action = action;
  button.dataset.productId = product.id;
  button.setAttribute('aria-label', `${accessibleLabel}: ${product.title}`);
  button.disabled = disabled;
  return button;
}

function createCartRow({ product, quantity }) {
  const row = createTextElement('li', '', 'list-group-item', 'p-3');
  const title = createTextElement('a', product.title, 'fw-semibold');
  title.href = product.detailsPage;
  const unitPrice = calculateFinalPrice(product.price, product.discountPercent);
  const price = createTextElement('p', formatPrice(unitPrice * quantity), 'fw-bold', 'mb-0');
  const actions = createTextElement('div', '', 'd-flex', 'align-items-center', 'flex-wrap', 'gap-2', 'mt-2');
  const quantityText = createTextElement('span', quantity);
  quantityText.setAttribute('aria-label', `Количество: ${quantity}`);

  actions.append(
    createCartButton('−', 'decrease', product, 'Уменьшить количество', quantity === 1),
    quantityText,
    createCartButton('+', 'increase', product, 'Увеличить количество', quantity === MAX_QUANTITY),
    createCartButton('Удалить', 'remove', product, 'Удалить')
  );
  row.append(title, price, actions);

  return row;
}

const cartList = document.querySelector('[data-cart-items]');

if (cartList) {
  const cartContent = document.querySelector('[data-cart-content]');
  const emptyCartNotice = document.querySelector('[data-cart-empty]');
  const cartHeading = document.querySelector('#cart-title');
  const subtotalElement = document.querySelector('[data-cart-subtotal]');
  const discountElement = document.querySelector('[data-cart-discount]');
  const totalElement = document.querySelector('[data-cart-total]');
  const promoForm = document.querySelector('#promo-form');
  const promoInput = promoForm.elements.promo;
  const promoMessage = document.querySelector('#promo-message');

  function renderCart() {
    const items = getCartItems();
    const isEmpty = items.length === 0;
    emptyCartNotice.hidden = !isEmpty;
    cartContent.hidden = isEmpty;
    cartList.textContent = '';
    items.forEach((item) => cartList.append(createCartRow(item)));

    const totals = getCartTotals(items);
    subtotalElement.textContent = formatPrice(totals.subtotal);
    discountElement.textContent = formatPrice(totals.discount);
    totalElement.textContent = formatPrice(totals.total);
  }

  cartList.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) {
      return;
    }

    const productId = Number(button.dataset.productId);
    const item = cart.items.find((item) => item.productId === productId);
    if (!item) {
      return;
    }

    const action = button.dataset.action;
    if (action === 'remove') {
      setCartQuantity(productId, 0);
    } else {
      const step = action === 'increase' ? 1 : -1;
      setCartQuantity(productId, item.quantity + step);
    }

    renderCart();
    const nextButton = cartList.querySelector(`[data-product-id="${productId}"][data-action="${action}"]:enabled`);
    const removeButton = cartList.querySelector(`[data-product-id="${productId}"][data-action="remove"]`);
    (nextButton ?? removeButton ?? cartHeading).focus();
  });

  promoForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const code = promoInput.value.trim().toUpperCase();
    const isValid = code === '' || code === PROMO_CODE;

    cart.promoCode = code === PROMO_CODE ? PROMO_CODE : '';
    saveCart();
    renderCart();

    if (!isValid) {
      promoMessage.textContent = 'Промокод не найден.';
      promoInput.setAttribute('aria-invalid', 'true');
      return;
    }

    promoInput.removeAttribute('aria-invalid');
    promoMessage.textContent = code ? 'Промокод применён. Скидка 10%.' : 'Промокод снят.';
  });

  function restorePromoInput() {
    promoInput.value = cart.promoCode;
    promoInput.removeAttribute('aria-invalid');
    promoMessage.textContent = cart.promoCode ? 'Промокод применён. Скидка 10%.' : '';
  }

  restorePromoInput();
  renderCart();

  window.addEventListener('kr4-cart-updated', () => {
    restorePromoInput();
    renderCart();
  });
}

updateCartCounters();

window.addEventListener('storage', (event) => {
  if (event.key === CART_STORAGE_KEY || event.key === null) {
    cart = readCart();
    updateCartCounters();
    window.dispatchEvent(new Event('kr4-cart-updated'));
  }
});
