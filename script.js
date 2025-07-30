document.addEventListener("DOMContentLoaded", () => {
  fetch("data.json")
    .then((response) => response.json())
    .then((data) => {
      window.data = data; // for reuse in resetOrder
      const parent = document.querySelector(".parent");
      const title = document.createElement("h1");
      title.className = "col-12";
      title.textContent = "Desserts";
      parent.appendChild(title);

      data.forEach((item, index) => {
        const itemDiv = document.createElement("div");
        itemDiv.className = "item col col-4 m-col-12 t-col-6";
        itemDiv.innerHTML = `
          <div class="image-cart">
            <img src="${item.image.desktop}" alt="${item.name}" />
            <button type="button" class="add-to-cart-btn" data-index="${index}">
              <img class="cart-icon" src="assets/images/icon-add-to-cart.svg" alt="Cart icon" />
              <span>Add to Cart</span>
            </button>
          </div>
          <p class="dessert-type">${item.category}</p>
          <p class="dessert-name">${item.name}</p>
          <p class="dessert-price" data-price="${item.price}">$${item.price.toFixed(2)}</p>
        `;
        parent.appendChild(itemDiv);
      });

      setupAddToCartButtons(data);
      setupPopUpButton(); // Setup Start New Order button
    });
});

const cartData = {}; // Tracks index: quantity

function setupAddToCartButtons(data) {
  document.querySelectorAll(".add-to-cart-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const parent = this.parentElement;
      const index = this.dataset.index;
      let quantity = 1;

      this.outerHTML = `
        <button type="button" class="quantity-control" data-index="${index}">
          <img src="assets/images/icon-decrement-quantity.svg" class="qty-btn minus" alt="Minus">
          <span class="quantity">${quantity}</span>
          <img src="assets/images/icon-increment-quantity.svg" class="qty-btn plus" alt="Plus">
        </button>
      `;

      const quantityControl = parent.querySelector(".quantity-control");

      updateCart(index, quantity, data);

      quantityControl.querySelector(".minus").addEventListener("click", () => {
        if (quantity > 1) {
          quantity--;
          quantityControl.querySelector(".quantity").textContent = quantity;
          updateCart(index, quantity, data);
        } else {
          quantityControl.outerHTML = `
            <button type="button" class="add-to-cart-btn" data-index="${index}">
              <img class="cart-icon" src="assets/images/icon-add-to-cart.svg" alt="Cart icon" />
              <span>Add to Cart</span>
            </button>
          `;
          delete cartData[index];
          setupAddToCartButtons(data);
          updateCartDisplay(data);
        }
      });

      quantityControl.querySelector(".plus").addEventListener("click", () => {
        quantity++;
        quantityControl.querySelector(".quantity").textContent = quantity;
        updateCart(index, quantity, data);
      });
    });
  });
}

function updateCart(index, quantity, data) {
  cartData[index] = quantity;
  updateCartDisplay(data);
}

function updateCartDisplay(data) {
  const cartSection = document.querySelector(".cart-section");
  const cartTitle = document.querySelector(".parent2 h2");
  const parent2 = document.querySelector(".parent2");

  let cartItemsList = document.querySelector(".cart-items-list");
  if (!cartItemsList) {
    cartItemsList = document.createElement("div");
    cartItemsList.className = "cart-items-list";
    parent2.appendChild(cartItemsList);
  }

  cartItemsList.innerHTML = "";

  const itemIndices = Object.keys(cartData);
  let totalItems = 0;
  let totalOrderPrice = 0;

  if (itemIndices.length === 0) {
    cartTitle.textContent = "Your Cart (0)";
    cartSection.style.display = "block";
    cartItemsList.innerHTML = "";
    return;
  }

  cartSection.style.display = "none";

  itemIndices.forEach((i) => {
    const quantity = cartData[i];
    const item = data[i];
    const itemTotal = item.price * quantity;
    totalItems += quantity;
    totalOrderPrice += itemTotal;

    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <p class="item-name-cart-section"><strong>${item.name}</strong></p>
      <div class="cart-item-details">
        <p class="item-qty">${quantity}x</p>
        <p class="item-price">@ $${item.price.toFixed(2)}</p>
        <p class="item-total">$${itemTotal.toFixed(2)}</p>
      </div>
      <hr/>
    `;
    cartItemsList.appendChild(div);
  });

  cartTitle.textContent = `Your Cart (${totalItems})`;

  const totalRow = document.createElement("div");
  totalRow.className = "cart-total-row";
  totalRow.innerHTML = `
    <p class="order-total-label">Order Total</p>
    <p class="order-total-amount">$${totalOrderPrice.toFixed(2)}</p>
  `;
  cartItemsList.appendChild(totalRow);

  const checkoutBtn = document.createElement("button");
  checkoutBtn.className = "checkout-btn";
  checkoutBtn.textContent = "Confirm Order";
  cartItemsList.appendChild(checkoutBtn);

  checkoutBtn.addEventListener("click", () => showPopUp(data));
}

function showPopUp(data) {
  const popup = document.querySelector(".Pop-UP");
  const finalItemsContainer = popup.querySelector(".order-final");
  finalItemsContainer.innerHTML = ""; // Clear previous content

  let total = 0;

  Object.keys(cartData).forEach((i) => {
    const item = data[i];
    const quantity = cartData[i];
    const itemTotal = item.price * quantity;
    total += itemTotal;

    const div = document.createElement("div");
    div.className = "final-items";
    div.innerHTML = `
      <img class="final-order-img" src="${item.image.thumbnail}" alt="${item.name}"/>
      <p class="item-name">${item.name}</p>
      <p class="item-count">${quantity}x</p>
      <p class="item-price">@ $${item.price.toFixed(2)}</p>
      <p class="item-total-price">$${itemTotal.toFixed(2)}</p>
    `;
    finalItemsContainer.appendChild(div);
    finalItemsContainer.appendChild(document.createElement("hr"));
  });

  const totalRow = document.createElement("div");
  totalRow.className = "order-total";
  totalRow.innerHTML = `
    <p class="order-total-paragraph">Order Total</p>
    <p class="total-price">$${total.toFixed(2)}</p>
  `;
  finalItemsContainer.appendChild(totalRow);

  popup.style.display = "block";
}

function setupPopUpButton() {
  const startBtn = document.querySelector(".start-new-order-btn");
  if (startBtn) {
    startBtn.addEventListener("click", resetOrder);
  }
}

function resetOrder() {
  const popup = document.querySelector(".Pop-UP");
  popup.style.display = "none";

  // Clear cart
  for (const key in cartData) delete cartData[key];

  // Reset buttons
  document.querySelectorAll(".quantity-control").forEach((el) => {
    const index = el.dataset.index;
    el.outerHTML = `
      <button type="button" class="add-to-cart-btn" data-index="${index}">
        <img class="cart-icon" src="assets/images/icon-add-to-cart.svg" alt="Cart icon" />
        <span>Add to Cart</span>
      </button>
    `;
  });

  setupAddToCartButtons(window.data);
  updateCartDisplay(window.data);
}
