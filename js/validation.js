const orderForm = document.querySelector('.order-form');

if (orderForm) {
  const nameInput = orderForm.elements.name;
  const emailInput = orderForm.elements.email;
  const phoneInput = orderForm.elements.phone;
  const agreeInput = orderForm.elements.agree;
  const productSelect = orderForm.elements.product;
  const formMessage = orderForm.querySelector('.form-message');
  const orderDialog = document.querySelector('#order-dialog');
  const submitButton = orderForm.querySelector('button[type="submit"]');
  const orderHeading = document.querySelector('#order-title');
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const orderParams = new URLSearchParams(window.location.search);
  const fromCart = orderParams.get('from') === 'cart';

  if (fromCart) {
    document.querySelector('[data-order-product-group]').hidden = true;
    productSelect.disabled = true;
    document.querySelector('[data-order-cart]').hidden = false;
  } else {
    getAvailableProducts(products).forEach((product) => {
      productSelect.append(new Option(product.title, product.id));
    });
    const selectedProduct = findProductById(products, Number(orderParams.get('product')));
    if (selectedProduct?.isAvailable) {
      productSelect.value = selectedProduct.id;
    }
  }

  function renderOrderCart() {
    const items = getCartItems();
    const list = document.querySelector('[data-order-items]');
    const total = document.querySelector('[data-order-total]');
    const empty = document.querySelector('[data-order-empty]');
    const hasItems = items.length > 0;

    list.textContent = '';
    items.forEach(({ product, quantity }) => {
      list.append(createTextElement('li', `${product.title} × ${quantity}`));
    });
    total.textContent = hasItems ? `Итого: ${formatPrice(getCartTotals(items).total)}` : '';
    empty.hidden = hasItems;
    submitButton.disabled = !hasItems;
  }

  function getPhoneDigits() {
    return phoneInput.value.replace(/\D/g, '');
  }

  function isPhoneValid() {
    return /^[+\d()\s-]+$/.test(phoneInput.value.trim()) && /^[78]\d{10}$/.test(getPhoneDigits());
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
      isValid: isPhoneValid,
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

  phoneInput.addEventListener('blur', () => {
    if (isPhoneValid()) {
      const digits = getPhoneDigits();
      phoneInput.value = `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9)}`;
    }
  });

  orderDialog.addEventListener('close', () => {
    (submitButton.disabled ? orderHeading : submitButton).focus();
  });

  orderForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (fromCart && getCartItems().length === 0) {
      return;
    }

    const invalidFields = fields.filter((field) => !validateField(field));

    if (invalidFields.length > 0) {
      formMessage.textContent = 'Проверьте выделенные поля.';
      formMessage.classList.remove('text-success');
      formMessage.classList.add('text-danger');
      invalidFields[0].input.focus();
      return;
    }

    orderForm.reset();
    if (fromCart) {
      clearCart();
      renderOrderCart();
    }

    formMessage.textContent = 'Заявка подготовлена. Проверка пройдена.';
    formMessage.classList.remove('text-danger');
    formMessage.classList.add('text-success');
    orderDialog.showModal();
  });

  if (fromCart) {
    renderOrderCart();
    window.addEventListener('kr4-cart-updated', renderOrderCart);
  } else {
    submitButton.disabled = false;
  }
}
