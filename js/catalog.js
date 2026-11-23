const productsContainer = document.querySelector('[data-products-container]'); // div, куда будут добавляться карточки
const searchInput = document.querySelector('#catalog-search'); // поле, в которое вводят название товара
const categoryFilter = document.querySelector('#category-filter'); // список категорий
const sortSelect = document.querySelector('#sort-select'); // список сортировки
const catalogCount = document.querySelector('.catalog-count'); // абзац с количеством найденных товаров
const catalogEmpty = document.querySelector('.catalog-empty'); // абзац "по выбранным условиям товары не найдены"

const catalogState = {
  query: searchInput.value,
  category: categoryFilter.value,
  sort: sortSelect.value
};

// Функция, которая получает массив товаров и возвращает список в определенном порядке
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

// Сбор карточки из каталога
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
  const price = createTextElement('p', formatPrice(product.price),
    'fw-bold', 'fs-5', 'mt-auto');

  const links = createTextElement('div', '', 'd-flex', 'flex-wrap', 'gap-2');
  const details = createTextElement('a', 'Подробнее', 'btn', 'btn-primary');
  details.href = product.detailsPage;
  const orderButton = createTextElement('button', 'Заказать', 'btn', 'btn-outline-primary');
  orderButton.type = 'button';
  orderButton.dataset.action = 'order'; // метка действия "Заказать"
  orderButton.dataset.productId = product.id;
  orderButton.disabled = !product.isAvailable;

  links.append(details, orderButton);
  const badges = document.createElement('div');
  badges.append(status);
  badges.classList.add('mb-2');
  body.append(title, description, badges, price, links);
  card.append(image, body);
  column.append(card);

  return column;
}

// Добавление карточки из каталога
function renderProducts(productsToRender) {
  console.log(productsToRender);
  productsContainer.textContent = ''; // убираем содержимое
  catalogCount.textContent = `Найдено товаров: ${productsToRender.length}`;
  catalogEmpty.hidden = productsToRender.length > 0; // hidden - спрятать сообщение

  productsToRender.forEach((product) => productsContainer.append(createProductCard(product))); // берет один товар из массива и создает HTML
}

// Связываем фильтрацию и вывод на экран
function updateCatalog() {
  const preparedProducts = prepareCatalogProducts(products, catalogState);
  renderProducts(preparedProducts);
}

// Обработчики событий
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

// При заказе товара
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
