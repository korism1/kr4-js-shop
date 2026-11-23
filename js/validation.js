const orderForm = document.querySelector('.order-form');

if (orderForm) {
  const nameInput = orderForm.elements.name;
  const emailInput = orderForm.elements.email;
  const phoneInput = orderForm.elements.phone;
  const agreeInput = orderForm.elements.agree;
  const productSelect = orderForm.elements.product;
  const formMessage = orderForm.querySelector('.form-message');
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  getAvailableProducts(products).forEach((product) => {
    productSelect.append(new Option(product.title, product.id));
  });

  const productId = Number(new URLSearchParams(window.location.search).get('product'));
  const selectedProduct = findProductById(products, productId);
  if (selectedProduct?.isAvailable) {
    productSelect.value = selectedProduct.id;
  }

  const fields = [
    {
      input: nameInput,
      isValid: () => nameInput.value.trim().length >= 2,
      message: 'Введите имя не короче 2 символов.'
    },
    {
      input: emailInput,
      isValid: () => emailPattern.test(emailInput.value.trim()),
      message: 'Введите корректный e-mail.'
    },
    {
      input: phoneInput,
      isValid: () => {
        const value = phoneInput.value.trim();
        const digits = value.replace(/\D/g, '');
        return /^[+\d()\s-]+$/.test(value) && /^[78]\d{10}$/.test(digits);
      },
      message: 'Введите 11 цифр телефона. Номер должен начинаться с +7 или 8.'
    },
    {
      input: agreeInput,
      isValid: () => agreeInput.checked,
      message: 'Подтвердите согласие на обработку данных.'
    }
  ];

  function showError(input, message) {
    const errorElement = document.getElementById(input.getAttribute('aria-describedby'));
    errorElement.textContent = message;
    input.setAttribute('aria-invalid', 'true');
    input.classList.add('is-invalid');
  }

  function clearError(input) {
    const errorElement = document.getElementById(input.getAttribute('aria-describedby'));
    errorElement.textContent = '';
    input.removeAttribute('aria-invalid');
    input.classList.remove('is-invalid');
  }

  function validateField(field) {
    if (field.isValid()) {
      clearError(field.input);
      return true;
    }

    showError(field.input, field.message);
    return false;
  }

  orderForm.addEventListener('input', (event) => {
    formMessage.textContent = '';
    const field = fields.find(({ input }) => input === event.target);
    if (field) {
      validateField(field);
    }
  });

  orderForm.addEventListener('reset', () => {
    fields.forEach(({ input }) => clearError(input));
    formMessage.textContent = '';
  });

  orderForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const invalidFields = fields.filter((field) => !validateField(field));

    if (invalidFields.length > 0) {
      formMessage.textContent = 'Проверьте выделенные поля.';
      formMessage.classList.remove('text-success');
      formMessage.classList.add('text-danger');
      invalidFields[0].input.focus();
      return;
    }

    formMessage.textContent = 'Заявка подготовлена. Это учебная форма.';
    formMessage.classList.remove('text-danger');
    formMessage.classList.add('text-success');
  });
}
