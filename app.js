// --- Data Definitions ---
const INITIAL_PRODUCTS = [
  {
    id: "01",
    code: "01 · FOREST",
    name: "The Studio Set",
    color: "Deep green",
    price: 180,
    currency: "₾",
    category: "sets",
    image: "122.jpg",
    note: "An original in a rich, grounded color.",
    sizes: { "S": 1, "M": 2, "L": 1 }
  },
  {
    id: "02",
    code: "02 · POPPY",
    name: "The Studio Set",
    color: "Vivid red",
    price: 180,
    currency: "₾",
    category: "sets",
    image: "123.jpg",
    note: "For days that call for a little more.",
    sizes: { "S": 1, "M": 1, "L": 1 }
  },
  {
    id: "03",
    code: "03 · SAFFRON",
    name: "The Studio Set",
    color: "Golden yellow",
    price: 180,
    currency: "₾",
    category: "sets",
    image: "124.jpg",
    note: "A warm note in the everyday.",
    sizes: { "S": 1, "M": 1, "L": 0 }
  },
  {
    id: "04",
    code: "04 · CORAL",
    name: "The Easy Layer",
    color: "Soft coral",
    price: 150,
    currency: "₾",
    category: "layers",
    image: "484143695_624901107091541_145030727631404623_n.jpg",
    note: "A bright layer with an easy shape.",
    sizes: { "XS": 1, "S": 2, "M": 2 }
  },
  {
    id: "05",
    code: "05 · PINE",
    name: "The Everyday Hoodie",
    color: "Deep green",
    price: 120,
    currency: "₾",
    category: "hoodies",
    image: "pp.jpg",
    note: "A familiar favorite, in forest green.",
    sizes: { "S": 2, "M": 2, "L": 2 }
  },
  {
    id: "06",
    code: "06 · RED",
    name: "The Everyday Hoodie",
    color: "Bright red",
    price: 120,
    currency: "₾",
    category: "hoodies",
    image: "kk.jpg",
    note: "A pop of color, made for everyday.",
    sizes: { "S": 0, "M": 1, "L": 0 }
  },
  {
    id: "07",
    code: "07 · STONE",
    name: "The Everyday Hoodie",
    color: "Warm taupe",
    price: 120,
    currency: "₾",
    category: "hoodies",
    image: "aa.jpg",
    note: "An understated shade with character.",
    sizes: { "S": 1, "M": 2, "L": 1 }
  },
  {
    id: "08",
    code: "08 · STONE SET",
    name: "The Everyday Tracksuit",
    color: "Warm taupe",
    price: 120,
    currency: "₾",
    category: "hoodies",
    image: "AS.jpg",
    note: "A matching hoodie and sweatpants set.",
    sizes: { "S": 1, "M": 1, "L": 1 }
  }
];

const STORAGE_KEY_STOCK = "dea_atelier_stock_v1";
const STORAGE_KEY_ORDERS = "dea_atelier_orders_v1";

// Load Stock State from LocalStorage or defaults
function loadStock() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_STOCK);
    if (stored) {
      const savedProducts = JSON.parse(stored);
      return [
        ...savedProducts,
        ...INITIAL_PRODUCTS.filter((product) =>
          !savedProducts.some((savedProduct) => savedProduct.id === product.id)
        )
      ];
    }
  } catch (e) {
    console.error("Failed to load stock from storage", e);
  }
  return JSON.parse(JSON.stringify(INITIAL_PRODUCTS));
}

function saveStock(stockData) {
  try {
    localStorage.setItem(STORAGE_KEY_STOCK, JSON.stringify(stockData));
  } catch (e) {
    console.error("Failed to save stock", e);
  }
}

function loadOrders() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_ORDERS);
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.error("Failed to load orders", e);
  }
  return [];
}

function saveOrders(orders) {
  try {
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders));
  } catch (e) {
    console.error("Failed to save orders", e);
  }
  updateOrdersCountBadges();
}

let products = loadStock();
let orders = loadOrders();

function getTotalStock(product) {
  return Object.values(product.sizes).reduce((acc, qty) => acc + qty, 0);
}

// --- DOM Elements ---
const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#primary-navigation");
const filterButtons = document.querySelectorAll(".filter-button");
const productCards = document.querySelectorAll(".product-card");
const pieceCount = document.querySelector(".piece-count");
const orderBadges = document.querySelectorAll(".orders-count-badge");

// Order Modal Elements
const orderModalBackdrop = document.querySelector("#order-modal-backdrop");
const orderModalClose = document.querySelector("#order-modal-close");
const orderFormContainer = document.querySelector("#order-form-container");
const orderSuccessContainer = document.querySelector("#order-success-container");
const orderForm = document.querySelector("#order-form");

const modalProductImage = document.querySelector("#order-product-image");
const modalProductName = document.querySelector("#order-product-name");
const modalProductCode = document.querySelector("#order-product-code");
const modalProductPrice = document.querySelector("#order-product-price");
const modalProductStock = document.querySelector("#order-product-stock");
const modalStockLabel = document.querySelector("#order-stock-label");
const modalSizeSelector = document.querySelector("#modal-size-selector");
const sizeHint = document.querySelector("#size-hint");
const qtyLimitHint = document.querySelector("#qty-limit-hint");
const qtyValueSpan = document.querySelector("#qty-value");
const qtyMinusBtn = document.querySelector("#qty-minus");
const qtyPlusBtn = document.querySelector("#qty-plus");
const totalUnitPriceSpan = document.querySelector("#total-unit-price");
const totalPriceDisplay = document.querySelector("#total-price-display");
const whatsappOrderBtn = document.querySelector("#whatsapp-order-btn");
const orderSuccessDoneBtn = document.querySelector("#order-success-done-btn");
const successOrderRef = document.querySelector("#success-order-ref");
const successReceiptDetails = document.querySelector("#success-receipt-details");
const successWhatsappLink = document.querySelector("#success-whatsapp-link");

// Orders History Modal Elements
const ordersModalBackdrop = document.querySelector("#orders-modal-backdrop");
const ordersModalClose = document.querySelector("#orders-modal-close");
const ordersHistoryList = document.querySelector("#orders-history-list");
const resetStockBtn = document.querySelector("#reset-stock-btn");
const clearOrdersBtn = document.querySelector("#clear-orders-btn");

let currentOrderProduct = null;
let selectedSize = null;
let selectedQuantity = 1;

// --- UI Update Functions ---
function updateProductCardsUI() {
  products.forEach((prod) => {
    const card = document.querySelector(`.product-card[data-id="${prod.id}"]`);
    if (!card) return;

    const totalStock = getTotalStock(prod);
    const stockBadge = card.querySelector(".stock-badge");
    const stockText = card.querySelector(".stock-badge .stock-text");
    const orderBtn = card.querySelector(".order-card-btn");
    const stockTag = card.querySelector(".product-stock-tag");

    // Available sizes list
    const availableSizes = Object.entries(prod.sizes)
      .filter(([_, q]) => q > 0)
      .map(([s]) => s);

    if (stockTag) {
      if (availableSizes.length > 0) {
        stockTag.textContent = `Sizes: ${availableSizes.join(", ")}`;
      } else {
        stockTag.textContent = "Out of stock";
      }
    }

    if (stockBadge && stockText) {
      stockBadge.classList.remove("in-stock", "low-stock", "out-of-stock");
      if (totalStock === 0) {
        stockBadge.classList.add("out-of-stock");
        stockText.textContent = "Sold out";
      } else if (totalStock <= 2) {
        stockBadge.classList.add("low-stock");
        stockText.textContent = `Only ${totalStock} left`;
      } else {
        stockBadge.classList.add("in-stock");
        stockText.textContent = `${totalStock} in stock`;
      }
    }

    if (orderBtn) {
      if (totalStock === 0) {
        orderBtn.disabled = true;
        orderBtn.innerHTML = `<span>Sold Out</span><span aria-hidden="true">—</span>`;
      } else {
        orderBtn.disabled = false;
        orderBtn.innerHTML = `<span>Order piece</span><span class="btn-arrow" aria-hidden="true">→</span>`;
      }
    }
  });
}

function updateOrdersCountBadges() {
  const count = orders.length;
  orderBadges.forEach((el) => {
    el.textContent = count;
  });
}

// --- Order Modal Logic ---
function openOrderModal(productId) {
  const prod = products.find((p) => p.id === productId);
  if (!prod) return;

  currentOrderProduct = prod;
  selectedQuantity = 1;
  orderForm.reset();

  modalProductImage.src = prod.image;
  modalProductImage.alt = prod.name;
  modalProductName.textContent = prod.name;
  modalProductCode.textContent = `${prod.color} · ${prod.code}`;
  modalProductPrice.textContent = `${prod.price} ${prod.currency}`;
  totalUnitPriceSpan.textContent = `${prod.price} ${prod.currency}`;

  const totalStock = getTotalStock(prod);
  if (totalStock === 0) {
    modalStockLabel.textContent = "Sold out";
    modalProductStock.style.color = "#767470";
  } else if (totalStock <= 2) {
    modalStockLabel.textContent = `Only ${totalStock} left in stock`;
    modalProductStock.style.color = "#d97706";
  } else {
    modalStockLabel.textContent = `${totalStock} in stock`;
    modalProductStock.style.color = "var(--green)";
  }

  // Render Sizes
  modalSizeSelector.innerHTML = "";
  const sizeEntries = Object.entries(prod.sizes);
  let firstAvailableSize = null;

  sizeEntries.forEach(([sizeName, qty]) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "size-btn";
    btn.dataset.size = sizeName;

    if (qty <= 0) {
      btn.disabled = true;
      btn.innerHTML = `${sizeName} <span class="size-stock-tag">(0)</span>`;
    } else {
      btn.innerHTML = `${sizeName} <span class="size-stock-tag">(${qty})</span>`;
      if (!firstAvailableSize) firstAvailableSize = sizeName;
    }

    btn.addEventListener("click", () => {
      selectSize(sizeName);
    });

    modalSizeSelector.appendChild(btn);
  });

  if (firstAvailableSize) {
    selectSize(firstAvailableSize);
  } else {
    selectedSize = null;
    sizeHint.textContent = "No sizes available";
  }

  updateTotals();

  orderFormContainer.style.display = "block";
  orderSuccessContainer.style.display = "none";
  orderModalBackdrop.classList.add("is-open");
  document.body.style.overflow = "hidden";
}

function selectSize(sizeName) {
  selectedSize = sizeName;
  const sizeBtns = modalSizeSelector.querySelectorAll(".size-btn");
  sizeBtns.forEach((btn) => {
    btn.classList.toggle("is-selected", btn.dataset.size === sizeName);
  });

  const availableInSize = currentOrderProduct.sizes[sizeName] || 0;
  sizeHint.textContent = `Size ${sizeName} (${availableInSize} available)`;
  qtyLimitHint.textContent = `Max: ${availableInSize}`;

  if (selectedQuantity > availableInSize) {
    selectedQuantity = Math.max(1, availableInSize);
  }
  qtyValueSpan.textContent = selectedQuantity;
  updateQtyButtonsState(availableInSize);
  updateTotals();
}

function updateQtyButtonsState(maxQty) {
  qtyMinusBtn.disabled = selectedQuantity <= 1;
  qtyPlusBtn.disabled = selectedQuantity >= maxQty;
}

qtyMinusBtn.addEventListener("click", () => {
  if (selectedQuantity > 1) {
    selectedQuantity -= 1;
    qtyValueSpan.textContent = selectedQuantity;
    const maxQty = selectedSize ? currentOrderProduct.sizes[selectedSize] : 1;
    updateQtyButtonsState(maxQty);
    updateTotals();
  }
});

qtyPlusBtn.addEventListener("click", () => {
  const maxQty = selectedSize ? currentOrderProduct.sizes[selectedSize] : 1;
  if (selectedQuantity < maxQty) {
    selectedQuantity += 1;
    qtyValueSpan.textContent = selectedQuantity;
    updateQtyButtonsState(maxQty);
    updateTotals();
  }
});

function updateTotals() {
  if (!currentOrderProduct) return;
  const total = currentOrderProduct.price * selectedQuantity;
  totalPriceDisplay.textContent = `${total} ${currentOrderProduct.currency}`;
}

function closeOrderModal() {
  orderModalBackdrop.classList.remove("is-open");
  document.body.style.overflow = "";
}

orderModalClose.addEventListener("click", closeOrderModal);
orderSuccessDoneBtn.addEventListener("click", closeOrderModal);
orderModalBackdrop.addEventListener("click", (e) => {
  if (e.target === orderModalBackdrop) closeOrderModal();
});

// Handle Order Submission
orderForm.addEventListener("submit", (e) => {
  e.preventDefault();
  processOrder("direct");
});

whatsappOrderBtn.addEventListener("click", () => {
  if (!orderForm.checkValidity()) {
    orderForm.reportValidity();
    return;
  }
  processOrder("whatsapp");
});

function processOrder(channel) {
  if (!currentOrderProduct || !selectedSize) {
    alert("Please select an available size.");
    return;
  }

  const availableInSize = currentOrderProduct.sizes[selectedSize] || 0;
  if (availableInSize < selectedQuantity) {
    alert("Sorry, not enough stock left in this size.");
    return;
  }

  const name = document.querySelector("#order-customer-name").value.trim();
  const phone = document.querySelector("#order-customer-phone").value.trim();
  const address = document.querySelector("#order-customer-address").value.trim();
  const notes = document.querySelector("#order-customer-notes").value.trim();

  const orderRef = `#DEA-${Math.floor(1000 + Math.random() * 9000)}`;
  const grandTotal = currentOrderProduct.price * selectedQuantity;

  // 1. Deduct Stock
  currentOrderProduct.sizes[selectedSize] -= selectedQuantity;
  saveStock(products);
  updateProductCardsUI();

  // 2. Save Order
  const newOrder = {
    id: orderRef,
    date: new Date().toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }),
    productName: currentOrderProduct.name,
    color: currentOrderProduct.color,
    code: currentOrderProduct.code,
    size: selectedSize,
    quantity: selectedQuantity,
    price: currentOrderProduct.price,
    total: `${grandTotal} ${currentOrderProduct.currency}`,
    customer: { name, phone, address, notes }
  };

  orders.unshift(newOrder);
  saveOrders(orders);

  // 3. Format WhatsApp Message
  const waText = `Hello DEA Atelier! I placed an order:\n\n` +
    `Piece: ${currentOrderProduct.name} (${currentOrderProduct.color})\n` +
    `Code: ${currentOrderProduct.code}\n` +
    `Size: ${selectedSize}\n` +
    `Quantity: ${selectedQuantity}\n` +
    `Total: ${grandTotal} ${currentOrderProduct.currency}\n\n` +
    `Customer Details:\n` +
    `Name: ${name}\n` +
    `Phone: ${phone}\n` +
    `Delivery: ${address}\n` +
    (notes ? `Note: ${notes}\n` : "") +
    `Reference: ${orderRef}`;

  const waUrl = `https://wa.me/?text=${encodeURIComponent(waText)}`;
  successWhatsappLink.href = waUrl;

  // 4. Render Success Screen
  successOrderRef.textContent = `Order Reference: ${orderRef}`;
  successReceiptDetails.innerHTML = `
    <div class="receipt-item"><span>Garment:</span><strong>${currentOrderProduct.name} (${currentOrderProduct.color})</strong></div>
    <div class="receipt-item"><span>Size &amp; Qty:</span><strong>Size ${selectedSize} × ${selectedQuantity}</strong></div>
    <div class="receipt-item"><span>Total Amount:</span><strong>${grandTotal} ${currentOrderProduct.currency} (Free Delivery)</strong></div>
    <div class="receipt-item"><span>Customer:</span><strong>${name} (${phone})</strong></div>
    <div class="receipt-item"><span>Delivery To:</span><strong>${address}</strong></div>
    ${notes ? `<div class="receipt-item"><span>Note:</span><strong>${notes}</strong></div>` : ""}
  `;

  orderFormContainer.style.display = "none";
  orderSuccessContainer.style.display = "block";

  if (channel === "whatsapp") {
    window.open(waUrl, "_blank");
  }
}

// --- Orders History Modal Logic ---
function openOrdersModal() {
  renderOrdersHistory();
  ordersModalBackdrop.classList.add("is-open");
  document.body.style.overflow = "hidden";
}

function closeOrdersModal() {
  ordersModalBackdrop.classList.remove("is-open");
  document.body.style.overflow = "";
}

function renderOrdersHistory() {
  if (orders.length === 0) {
    ordersHistoryList.innerHTML = `
      <div class="empty-orders-state">
        <p>No orders placed yet.</p>
        <p style="font-size: 12px; color: var(--muted); margin-top: 6px;">Select any piece in the collection to test placing an order and live stock deductions.</p>
      </div>
    `;
    return;
  }

  ordersHistoryList.innerHTML = orders.map((o) => `
    <div class="order-history-card">
      <div class="order-history-top">
        <strong>${o.id} · ${o.productName}</strong>
        <span class="order-history-time">${o.date}</span>
      </div>
      <div>Color: <strong>${o.color}</strong> · Size: <strong>${o.size}</strong> · Qty: <strong>${o.quantity}</strong></div>
      <div>Total: <strong>${o.total}</strong></div>
      <div style="margin-top: 6px; padding-top: 6px; border-top: 1px dotted var(--line);">
        Customer: <strong>${o.customer.name}</strong> (${o.customer.phone})<br>
        Delivery: ${o.customer.address}
        ${o.customer.notes ? `<br>Note: <em>${o.customer.notes}</em>` : ""}
      </div>
    </div>
  `).join("");
}

ordersModalClose.addEventListener("click", closeOrdersModal);
ordersModalBackdrop.addEventListener("click", (e) => {
  if (e.target === ordersModalBackdrop) closeOrdersModal();
});

document.querySelectorAll(".header-orders-trigger, .footer-orders-trigger, .nav-orders-link").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    openOrdersModal();
  });
});

resetStockBtn.addEventListener("click", () => {
  if (confirm("Reset all garment stock levels back to default?")) {
    products = JSON.parse(JSON.stringify(INITIAL_PRODUCTS));
    saveStock(products);
    updateProductCardsUI();
    alert("Stock replenished to original quantities!");
  }
});

clearOrdersBtn.addEventListener("click", () => {
  if (confirm("Clear your placed order history?")) {
    orders = [];
    saveOrders(orders);
    renderOrdersHistory();
  }
});

// Attach order trigger to cards
document.querySelectorAll(".order-card-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const prodId = btn.dataset.productId;
    openOrderModal(prodId);
  });
});

// Close on Escape key
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeOrderModal();
    closeOrdersModal();
  }
});

// --- Existing Filter & Navigation Logic ---
menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
  navigation.classList.toggle("is-open", !isOpen);
});

navigation.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    navigation.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
  }
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const selectedFilter = button.dataset.filter;
    let visibleCount = 0;

    filterButtons.forEach((filterButton) => {
      filterButton.setAttribute("aria-pressed", String(filterButton === button));
    });

    productCards.forEach((card) => {
      const isVisible = selectedFilter === "all" || card.dataset.category === selectedFilter;
      card.hidden = !isVisible;
      if (isVisible) visibleCount += 1;
    });

    pieceCount.textContent = `${visibleCount} ${visibleCount === 1 ? "piece" : "pieces"}`;
  });
});

// Initial setup
updateProductCardsUI();
updateOrdersCountBadges();
document.querySelector("#year").textContent = new Date().getFullYear();
