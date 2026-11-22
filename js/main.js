
const money = value => new Intl.NumberFormat("uz-UZ").format(value) + " so‘m";

const starterProducts = [
    { id: 1, name: "Adidas F50 futbol butsasi", category: "Sport", price: 1250000, emoji: "👟", image: "", rating: 4.9 },
    { id: 2, name: "Honor X9d smartfoni", category: "Telefonlar", price: 4200000, emoji: "📱", image: "", rating: 4.8 },
    { id: 3, name: "Nike sport kiyimi", category: "Kiyimlar", price: 450000, emoji: "👕", image: "", rating: 4.7 },
    { id: 4, name: "Bluetooth quloqchin", category: "Elektronika", price: 185000, emoji: "🎧", image: "", rating: 4.6 },
    { id: 5, name: "Futbol to‘pi", category: "Sport", price: 210000, emoji: "⚽", image: "", rating: 4.8 },
    { id: 6, name: "Smart soat", category: "Elektronika", price: 350000, emoji: "⌚", image: "", rating: 4.5 },
    { id: 7, name: "Samsung smartfoni", category: "Telefonlar", price: 3100000, emoji: "📱", image: "", rating: 4.7 },
    { id: 8, name: "Erkaklar futbolkasi", category: "Kiyimlar", price: 120000, emoji: "👕", image: "", rating: 4.5 },
    { id: 9, name: "Sport ryukzagi", category: "Sport", price: 280000, emoji: "🎒", image: "", rating: 4.6 },
    { id: 10, name: "Uy uchun chiroq", category: "Uy uchun", price: 95000, emoji: "💡", image: "", rating: 4.4 },
    { id: 11, name: "Simsiz klaviatura", category: "Elektronika", price: 220000, emoji: "⌨️", image: "", rating: 4.6 },
    { id: 12, name: "Basketbol to‘pi", category: "Sport", price: 190000, emoji: "🏀", image: "", rating: 4.5 }
];

const generatedProducts = Array.from({ length: 988 }, (_, index) => {
    const id = index + 13;
    const categories = ["Sport", "Telefonlar", "Elektronika", "Kiyimlar", "Uy uchun"];
    const emojis = {
        "Sport": ["⚽", "👟", "🏀", "🎒"],
        "Telefonlar": ["📱", "📲"],
        "Elektronika": ["🎧", "⌚", "⌨️", "🔊"],
        "Kiyimlar": ["👕", "🧥", "👖", "🧢"],
        "Uy uchun": ["💡", "🪑", "🛋️", "🍽️"]
    };
    const category = categories[index % categories.length];

    return {
        id,
        name: `${category} mahsuloti ${id}`,
        category,
        price: (Math.floor(Math.random() * 900) + 10) * 1000,
        emoji: emojis[category][index % emojis[category].length],
        image: "",
        rating: (4 + Math.random()).toFixed(1)
    };
});

const products = [...starterProducts, ...generatedProducts];

function readStorage(key, fallback = []) {
    try {
        const value = JSON.parse(localStorage.getItem(key));
        return Array.isArray(value) ? value : fallback;
    } catch {
        return fallback;
    }
}

function saveStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

let favorites = readStorage("ak7_favorites");
let cart = readStorage("ak7_cart");
let orders = readStorage("ak7_orders");

let selectedCategory = "Barchasi";
let searchText = "";
let visibleCount = 20;

function showToast(message) {
    let toast = document.querySelector(".toast");

    if (!toast) {
        toast = document.createElement("div");
        toast.className = "toast";
        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove("show"), 2200);
}

function getProduct(id) {
    return products.find(product => product.id === Number(id));
}

function updateCounts() {
    const favoriteCount = document.getElementById("favoriteCount");
    const cartCount = document.getElementById("cartCount");

    if (favoriteCount) favoriteCount.textContent = favorites.length;
    if (cartCount) cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
}

function productCard(product) {
    const isFavorite = favorites.includes(product.id);
    const imageContent = product.image
        ? `<img src="${product.image}" alt="${product.name}" loading="lazy">`
        : `<span class="product-placeholder">${product.emoji}</span>`;

    return `
        <article class="product-card">
            <div class="product-image">
                ${imageContent}
                <button class="favorite-button ${isFavorite ? "active" : ""}" data-favorite="${product.id}" aria-label="Sevimliga qo‘shish">${isFavorite ? "♥" : "♡"}</button>
            </div>
            <div class="product-info">
                <span class="product-category">${product.category}</span>
                <h3>${product.name}</h3>
                <div class="product-rating">★ ${product.rating} <span>(demo)</span></div>
                <div class="product-bottom">
                    <span class="product-price">${money(product.price)}</span>
                    <button class="add-cart" data-add="${product.id}" aria-label="Savatga qo‘shish">+</button>
                </div>
            </div>
        </article>
    `;
}

function getFilteredProducts() {
    return products.filter(product => {
        const matchesCategory = selectedCategory === "Barchasi" || product.category === selectedCategory;
        const matchesSearch = product.name.toLowerCase().includes(searchText.toLowerCase());
        return matchesCategory && matchesSearch;
    });
}

function renderProducts() {
    const grid = document.getElementById("productsGrid");
    if (!grid) return;

    const filtered = getFilteredProducts();
    const visibleProducts = filtered.slice(0, visibleCount);

    grid.innerHTML = visibleProducts.map(productCard).join("");

    const productCount = document.getElementById("productCount");
    const emptyMessage = document.getElementById("emptyMessage");
    const loadMore = document.getElementById("loadMore");

    if (productCount) productCount.textContent = `${filtered.length} ta mahsulot`;
    if (emptyMessage) emptyMessage.hidden = filtered.length > 0;
    if (loadMore) loadMore.hidden = visibleCount >= filtered.length;
}

function toggleFavorite(id) {
    id = Number(id);

    if (favorites.includes(id)) {
        favorites = favorites.filter(item => item !== id);
        showToast("Sevimlilardan olib tashlandi");
    } else {
        favorites.push(id);
        showToast("Sevimlilarga qo‘shildi");
    }

    saveStorage("ak7_favorites", favorites);
    updateCounts();
    renderProducts();
    renderFavorites();
}

function addToCart(id) {
    id = Number(id);
    const item = cart.find(product => product.id === id);

    if (item) {
        item.quantity += 1;
    } else {
        cart.push({ id, quantity: 1 });
    }

    saveStorage("ak7_cart", cart);
    updateCounts();
    renderCart();
    showToast("Mahsulot savatga qo‘shildi");
}

function changeQuantity(id, change) {
    const item = cart.find(product => product.id === Number(id));
    if (!item) return;

    item.quantity += change;

    if (item.quantity <= 0) {
        cart = cart.filter(product => product.id !== Number(id));
    }

    saveStorage("ak7_cart", cart);
    updateCounts();
    renderCart();
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== Number(id));
    saveStorage("ak7_cart", cart);
    updateCounts();
    renderCart();
}

function renderCart() {
    const cartItems = document.getElementById("cartItems");
    const cartTotal = document.getElementById("cartTotal");

    if (!cartItems || !cartTotal) return;

    if (!cart.length) {
        cartItems.innerHTML = '<p class="cart-empty">Savatingiz hozircha bo‘sh.</p>';
        cartTotal.textContent = money(0);
        return;
    }

    let total = 0;

    cartItems.innerHTML = cart.map(item => {
        const product = getProduct(item.id);
        if (!product) return "";

        total += product.price * item.quantity;

        const imageContent = product.image
            ? `<img src="${product.image}" alt="${product.name}">`
            : product.emoji;

        return `
            <div class="cart-item">
                <div class="cart-item-image">${imageContent}</div>
                <div>
                    <h4>${product.name}</h4>
                    <p>${money(product.price)}</p>
                    <div class="cart-quantity">
                        <button data-quantity="${product.id}" data-change="-1">−</button>
                        <span>${item.quantity}</span>
                        <button data-quantity="${product.id}" data-change="1">+</button>
                    </div>
                </div>
                <button class="remove-cart-item" data-remove="${product.id}" aria-label="O‘chirish">×</button>
            </div>
        `;
    }).join("");

    cartTotal.textContent = money(total);
}

function openCart() {
    document.getElementById("cartDrawer")?.classList.add("open");
    document.getElementById("cartOverlay")?.classList.add("open");
    document.body.style.overflow = "hidden";
}

function closeCart() {
    document.getElementById("cartDrawer")?.classList.remove("open");
    document.getElementById("cartOverlay")?.classList.remove("open");
    document.body.style.overflow = "";
}

function renderFavorites() {
    const grid = document.getElementById("favoritesGrid");
    if (!grid) return;

    const favoriteProducts = favorites.map(getProduct).filter(Boolean);

    grid.innerHTML = favoriteProducts.length
        ? favoriteProducts.map(productCard).join("")
        : '<p class="empty-message">Hozircha sevimli mahsulotlar yo‘q.</p>';
}

function renderOrders() {
    const list = document.getElementById("ordersList");
    if (!list) return;

    if (!orders.length) {
        list.innerHTML = '<p class="empty-message">Hozircha buyurtmalar mavjud emas.</p>';
        return;
    }

    list.innerHTML = orders.slice().reverse().map(order => `
        <article class="order-card">
            <h3>Buyurtma #${order.id}</h3>
            <p><strong>Ism:</strong> ${escapeHTML(order.name)}</p>
            <p><strong>Telefon:</strong> ${escapeHTML(order.phone)}</p>
            <p><strong>Manzil:</strong> ${escapeHTML(order.address)}</p>
            <p><strong>Mahsulotlar:</strong> ${order.items.map(item => {
                const product = getProduct(item.id);
                return product ? `${escapeHTML(product.name)} × ${item.quantity}` : "";
            }).join(", ")}</p>
            <p><strong>Jami:</strong> ${money(order.total)}</p>
            <span class="order-status">${escapeHTML(order.status || "Qabul qilindi")}</span>
        </article>
    `).join("");
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[character]);
}

function checkout() {
    if (!cart.length) {
        showToast("Avval savatga mahsulot qo‘shing");
        return;
    }

    const name = prompt("Ism-familiyangizni kiriting:");
    if (!name || !name.trim()) return;

    const phone = prompt("Telefon raqamingizni kiriting:");
    if (!phone || !phone.trim()) return;

    const address = prompt("Yetkazib berish manzilini kiriting:");
    if (!address || !address.trim()) return;

    const total = cart.reduce((sum, item) => {
        const product = getProduct(item.id);
        return sum + (product ? product.price * item.quantity : 0);
    }, 0);

    const order = {
        id: Date.now(),
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        items: cart.map(item => ({ ...item })),
        total,
        status: "Qabul qilindi",
        date: new Date().toISOString()
    };

    orders.push(order);
    saveStorage("ak7_orders", orders);

    cart = [];
    saveStorage("ak7_cart", cart);
    updateCounts();
    renderCart();
    closeCart();

    showToast("Buyurtma saqlandi!");

    setTimeout(() => {
        window.location.href = "./pages/zakaz.html";
    }, 800);
}

document.addEventListener("click", event => {
    const favoriteButton = event.target.closest("[data-favorite]");
    const addButton = event.target.closest("[data-add]");
    const quantityButton = event.target.closest("[data-quantity]");
    const removeButton = event.target.closest("[data-remove]");
    const categoryButton = event.target.closest("[data-category]");

    if (favoriteButton) toggleFavorite(favoriteButton.dataset.favorite);
    if (addButton) addToCart(addButton.dataset.add);

    if (quantityButton) {
        changeQuantity(
            quantityButton.dataset.quantity,
            Number(quantityButton.dataset.change)
        );
    }

    if (removeButton) removeFromCart(removeButton.dataset.remove);

    if (categoryButton) {
        selectedCategory = categoryButton.dataset.category;
        document.querySelectorAll(".category").forEach(button => {
            button.classList.toggle("active", button === categoryButton);
        });
        visibleCount = 20;
        renderProducts();
    }
});

document.getElementById("searchForm")?.addEventListener("submit", event => {
    event.preventDefault();
    searchText = document.getElementById("searchInput").value.trim();
    visibleCount = 1000;
    renderProducts();
    document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
});

document.getElementById("searchInput")?.addEventListener("input", event => {
    searchText = event.target.value.trim();
    visibleCount = 1000;
    renderProducts();
});

document.getElementById("loadMore")?.addEventListener("click", () => {
    visibleCount += 20;
    renderProducts();
});

document.getElementById("cartButton")?.addEventListener("click", openCart);
document.getElementById("closeCart")?.addEventListener("click", closeCart);
document.getElementById("cartOverlay")?.addEventListener("click", closeCart);
document.getElementById("checkoutButton")?.addEventListener("click", checkout);

document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeCart();
});

updateCounts();
renderProducts();
renderCart();
renderFavorites();
renderOrders();
