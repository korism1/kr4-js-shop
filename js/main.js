function formatPrice(price) {
  return `${price.toLocaleString('ru-RU')} руб.`;
}

function calculateDiscount(price, discountPercent) {
  return price * discountPercent / 100;
}

function calculateFinalPrice(price, discountPercent) {
  return price - calculateDiscount(price, discountPercent);
}

function getProductStatus(product) {
  return product.isAvailable ? 'В наличии' : 'Нет в наличии';
}

function createProductSummary(product) {
  const finalPrice = calculateFinalPrice(product.price, product.discountPercent);
  return `${product.title}: ${formatPrice(finalPrice)}. Статус: ${getProductStatus(product)}.`;
}

function createTextElement(tagName, text, ...classes) {
  const element = document.createElement(tagName);
  element.textContent = text;
  element.classList.add(...classes);
  return element;
}

function getProductTitles(products) {
  return products.map((product) => product.title);
}

function getAvailableProducts(products) {
  return products.filter((product) => product.isAvailable);
}

function searchProducts(products, query) {
  const normalizedQuery = query.trim().toLowerCase();
  return products.filter((product) => product.title.toLowerCase().includes(normalizedQuery));
}

function filterProductsByCategory(products, category) {
  return category === 'all' ? products : products.filter((product) => product.category === category);
}

function sortProductsByPrice(products, direction = 'asc') {
  const productsCopy = [...products];
  if (direction === 'desc') {
    return productsCopy.sort((first, second) => second.price - first.price);
  }

  return productsCopy.sort((first, second) => first.price - second.price);
}

function findProductById(products, id) {
  return products.find((product) => product.id === id);
}

function calculateTotalPrice(products) {
  return products.reduce((sum, product) => sum + product.price, 0);
}

function countAvailableProducts(products) {
  return getAvailableProducts(products).length;
}

function calculateAveragePrice(products) {
  return products.length === 0 ? 0 : Math.round(calculateTotalPrice(products) / products.length);
}

function getPreparedProducts(products, query, category, sortDirection) {
  const matchingProducts = searchProducts(products, query);
  const categoryProducts = filterProductsByCategory(matchingProducts, category);
  return sortProductsByPrice(categoryProducts, sortDirection);
}

console.log('Файл main.js подключён');
console.table(products);
console.log(getProductTitles(products));
console.table(getAvailableProducts(products));
console.table(searchProducts(products, 'zenbook'));
console.table(getPreparedProducts(products, 'zenbook', 'ultrabooks', 'asc'));
console.log(findProductById(products, 1));
console.log('Общая стоимость:', calculateTotalPrice(products));

const messageElement = document.querySelector('.js-message');
const productOutputElement = document.querySelector('.product-output');

if (messageElement) {
  messageElement.textContent = 'Массив товаров и функции обработки данных подключены.';
}

if (productOutputElement) {
  productOutputElement.textContent = [
    `Всего товаров: ${products.length}`,
    `Товаров в наличии: ${countAvailableProducts(products)}`,
    `Средняя цена: ${formatPrice(calculateAveragePrice(products))}`,
    `Результатов поиска «zenbook»: ${searchProducts(products, 'zenbook').length}`,
    createProductSummary(products[0])
  ].join('\n');
}
