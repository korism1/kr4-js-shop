const productsContainer = document.querySelector('[data-products-container]');
const searchInput = document.querySelector('#catalog-search');
const categoryFilter = document.querySelector('#category-filter');
const sortSelect = document.querySelector('#sort-select');
const catalogCount = document.querySelector('.catalog-count');
const catalogEmpty = document.querySelector('.catalog-empty');

const catalogState = {
  query: searchInput.value,
  category: categoryFilter.value,
  sort: sortSelect.value
};

function prepareCatalogProducts(products, state) {
  if (state.sort === 'price-asc' || state.sort === 'price-desc') {
    return getPreparedProducts(products, state.query, state.category, state.sort === 'price-asc' ? 'asc' : 'desc');
  }

  const matchingProducts = searchProducts(products, state.query);
  const categoryProducts = filterProductsByCategory(matchingProducts, state.category);

  if (state.sort === 'title-asc') {
    return [...categoryProducts].sort((first, second) => first.title.localeCompare(second.title, 'ru'));
  }

  return categoryProducts;
}

function createProductCard(product) {
  const column = createTextElement('div', '', 'col-12', 'col-md-6', 'col-lg-4');
  const card = createTextElement('article', '', 'card', 'h-100', 'shadow-sm');
  const body = createTextElement('div', '', 'card-body', 'd-flex', 'flex-column');

  const image = document.createElement('img');
  image.src = product.image;
  image.alt = product.title;
  image.classList.add('card-img-top');
  image.loading = 'lazy';

  const title = createTextElement('h2', product.title, 'card-title', 'h5');
  const description = createTextElement('p', product.description, 'card-text', 'text-body-secondary');
  const status = createTextElement('span', getProductStatus(product), 'badge',
    product.isAvailable ? 'text-bg-success' : 'text-bg-secondary');
  const rating = createTextElement('p', `Рейтинг: ${product.rating.toLocaleString('ru-RU')} из 5`, 'small', 'mt-2');
  const price = createTextElement('p', formatPrice(calculateFinalPrice(product.price, product.discountPercent)),
    'fw-bold', 'fs-5', 'mt-auto');

  if (product.discountPercent > 0) {
    price.append(' ', createTextElement('del', formatPrice(product.price), 'small', 'fw-normal', 'text-body-secondary'));
  }

  const links = createTextElement('div', '', 'd-flex', 'flex-wrap', 'gap-2');
  const details = createTextElement('a', 'О модели', 'btn', 'btn-outline-primary');
  details.href = product.detailsPage;
  const orderButton = createTextElement('button', 'Заказать', 'btn', 'btn-primary');
  orderButton.type = 'button';
  orderButton.dataset.action = 'order';
  orderButton.dataset.productId = product.id;
  orderButton.disabled = !product.isAvailable;

  links.append(details, orderButton);
  const badges = document.createElement('div');
  badges.append(status);
  body.append(title, description, badges, rating, price, links);
  card.append(image, body);
  column.append(card);

  return column;
}

function renderProducts(productsToRender) {
  productsContainer.textContent = '';
  catalogCount.textContent = `Найдено товаров: ${productsToRender.length}`;
  catalogEmpty.hidden = productsToRender.length > 0;

  productsToRender.forEach((product) => productsContainer.append(createProductCard(product)));
}

function updateCatalog() {
  const preparedProducts = prepareCatalogProducts(products, catalogState);
  renderProducts(preparedProducts);
}

searchInput.addEventListener('input', (event) => {
  catalogState.query = event.target.value;
  updateCatalog();
});

categoryFilter.addEventListener('change', (event) => {
  catalogState.category = event.target.value;
  updateCatalog();
});

sortSelect.addEventListener('change', (event) => {
  catalogState.sort = event.target.value;
  updateCatalog();
});

productsContainer.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action="order"]');
  if (!button) {
    return;
  }

  const selectedProduct = findProductById(products, Number(button.dataset.productId));
  if (selectedProduct?.isAvailable) {
    window.location.href = `order.html?product=${selectedProduct.id}`;
  }
});

updateCatalog();
