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

const productSummary = createProductSummary(product);
console.log('Файл main.js подключён');
console.table(product);
console.log(productSummary);

const messageElement = document.querySelector('.js-message');
const productOutputElement = document.querySelector('.product-output');

if (messageElement) {
  messageElement.textContent = 'JavaScript подключён корректно.';
}

if (productOutputElement) {
  productOutputElement.textContent = productSummary;
}
