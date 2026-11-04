const products = [
  {
    id: 1,
    name: "Laptop Nova 14",
    category: "Laptops",
    price: 1299,
    description: "Laptop ultraligera con pantalla de 14 pulgadas y batería de larga duración.",
    image: "img/laptop.svg"
  },
  {
    id: 2,
    name: "Monitor Vision X",
    category: "Monitores",
    price: 799,
    description: "Pantalla Full HD de 27 pulgadas con diseño elegante y amplio espacio laboral.",
    image: "img/monitor.svg"
  },
  {
    id: 3,
    name: "Teclado Pro RGB",
    category: "Periféricos",
    price: 149,
    description: "Teclado mecánico con retroiluminación RGB y switches suaves para gaming.",
    image: "img/teclado.svg"
  },
  {
    id: 4,
    name: "Mouse Aero M2",
    category: "Periféricos",
    price: 89,
    description: "Mouse ergonómico con sensor preciso y conexión inalámbrica rápida.",
    image: "img/mouse.svg"
  },
  {
    id: 5,
    name: "Auriculares Pulse",
    category: "Audio",
    price: 199,
    description: "Audio envolvente con micrófono y comodidad para largas sesiones.",
    image: "img/auriculares.svg"
  },
  {
    id: 6,
    name: "Tablet Flex 10",
    category: "Accesorios",
    price: 459,
    description: "Tablet ideal para trabajo, estudio y entretenimiento con gran rendimiento.",
    image: "img/tablet.svg"
  },
  {
    id: 7,
    name: "Webcam HD Plus",
    category: "Accesorios",
    price: 119,
    description: "Cámara para videollamadas con gran nitidez y ajuste automático de foco.",
    image: "img/webcam.svg"
  },
  {
    id: 8,
    name: "Silla Executive",
    category: "Accesorios",
    price: 329,
    description: "Silla ergonómica con soporte lumbar para el trabajo diario y confort total.",
    image: "img/silla.svg"
  }
];

const cartStorageKey = "techstore-cart";
let selectedCategory = "all";
let cart = JSON.parse(localStorage.getItem(cartStorageKey) || "[]");

const productGrid = document.getElementById("productGrid");
const categoryList = document.getElementById("categoryList");
const searchInput = document.getElementById("searchInput");
const clearSearch = document.getElementById("clearSearch");
const resultsCount = document.getElementById("resultsCount");
const cartBadge = document.getElementById("cartBadge");
const cartItems = document.getElementById("cartItems");
const cartSubtotal = document.getElementById("cartSubtotal");
const cartPanel = document.getElementById("cartPanel");
const cartToggle = document.getElementById("cartToggle");
const closeCart = document.getElementById("closeCart");
const checkoutButton = document.getElementById("checkoutButton");

const formatCurrency = (value) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);

function saveCart() {
  localStorage.setItem(cartStorageKey, JSON.stringify(cart));
}

function getVisibleProducts() {
  const query = searchInput.value.trim().toLowerCase();

  return products.filter((product) => {
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    const matchesSearch =
      product.name.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query);

    return matchesCategory && matchesSearch;
  });
}

function renderProducts() {
  const visibleProducts = getVisibleProducts();

  resultsCount.textContent = `${visibleProducts.length} producto${visibleProducts.length === 1 ? "" : "s"}`;

  if (!visibleProducts.length) {
    productGrid.innerHTML = `
      <div class="empty-state">
        No encontramos productos con esos filtros. Probá otra búsqueda o seleccioná otra categoría.
      </div>
    `;
    return;
  }

  productGrid.innerHTML = visibleProducts
    .map(
      (product) => `
        <article class="product-card">
          <img class="product-image" src="${product.image}" alt="${product.name}" />
          <div class="product-info">
            <div class="product-head">
              <span class="product-category">${product.category}</span>
            </div>
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <div class="product-meta">
              <span class="price">${formatCurrency(product.price)}</span>
              <button class="add-to-cart" type="button" data-id="${product.id}">Agregar</button>
            </div>
          </div>
        </article>
      `
    )
    .join("");

  document.querySelectorAll(".add-to-cart").forEach((button) => {
    button.addEventListener("click", () => {
      addToCart(Number(button.dataset.id));
    });
  });
}

function addToCart(productId) {
  const existingItem = cart.find((item) => item.id === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ id: productId, quantity: 1 });
  }

  saveCart();
  updateCart();
  cartPanel.classList.add("open");
}

function changeQuantity(productId, action) {
  const item = cart.find((entry) => entry.id === productId);

  if (!item) return;

  if (action === "increase") {
    item.quantity += 1;
  }

  if (action === "decrease") {
    item.quantity -= 1;
  }

  if (action === "remove" || item.quantity <= 0) {
    cart = cart.filter((entry) => entry.id !== productId);
  }

  saveCart();
  updateCart();
}

function updateCart() {
  const detailedCart = cart
    .map((entry) => {
      const product = products.find((item) => item.id === entry.id);
      if (!product) return null;

      return {
        ...product,
        quantity: entry.quantity,
      };
    })
    .filter(Boolean);

  const totalItems = detailedCart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = detailedCart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  cartBadge.textContent = totalItems;
  cartSubtotal.textContent = formatCurrency(subtotal);

  if (!detailedCart.length) {
    cartItems.innerHTML = '<div class="empty-cart">Tu carrito está vacío.</div>';
    return;
  }

  cartItems.innerHTML = detailedCart
    .map(
      (item) => `
        <div class="cart-item">
          <img src="${item.image}" alt="${item.name}" />
          <div class="cart-item-info">
            <h4>${item.name}</h4>
            <span>${formatCurrency(item.price)} c/u</span>
          </div>
          <div class="item-controls">
            <div class="quantity-box">
              <button class="quantity-btn" type="button" data-id="${item.id}" data-action="decrease">-</button>
              <span>${item.quantity}</span>
              <button class="quantity-btn" type="button" data-id="${item.id}" data-action="increase">+</button>
            </div>
            <button class="remove-item" type="button" data-id="${item.id}" data-action="remove">Quitar</button>
          </div>
        </div>
      `
    )
    .join("");

  document.querySelectorAll(".quantity-btn").forEach((button) => {
    button.addEventListener("click", () => {
      changeQuantity(Number(button.dataset.id), button.dataset.action);
    });
  });

  document.querySelectorAll(".remove-item").forEach((button) => {
    button.addEventListener("click", () => {
      changeQuantity(Number(button.dataset.id), "remove");
    });
  });
}

function updateCategoryButtons() {
  document.querySelectorAll(".category-btn").forEach((button) => {
    const isActive = button.dataset.category === selectedCategory;
    button.classList.toggle("active", isActive);
  });
}

categoryList.addEventListener("click", (event) => {
  const button = event.target.closest(".category-btn");

  if (!button) return;

  selectedCategory = button.dataset.category;
  updateCategoryButtons();
  renderProducts();
});

searchInput.addEventListener("input", () => {
  renderProducts();
});

clearSearch.addEventListener("click", () => {
  searchInput.value = "";
  renderProducts();
  searchInput.focus();
});

cartToggle.addEventListener("click", () => {
  cartPanel.classList.toggle("open");
});

closeCart.addEventListener("click", () => {
  cartPanel.classList.remove("open");
});

checkoutButton.addEventListener("click", () => {
  if (!cart.length) {
    alert("Tu carrito está vacío. Agregá algunos productos antes de finalizar la compra.");
    return;
  }

  const total = cart.reduce((sum, item) => {
    const product = products.find((entry) => entry.id === item.id);
    return product ? sum + product.price * item.quantity : sum;
  }, 0);

  const confirmed = window.confirm(`¿Deseas confirmar tu compra por ${formatCurrency(total)}?`);

  if (!confirmed) return;

  cart = [];
  saveCart();
  updateCart();
  renderProducts();
  alert("¡Gracias por tu compra! Tu pedido fue registrado correctamente.");
});

renderProducts();
updateCart();
updateCategoryButtons();
