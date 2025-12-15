// Global variables
// Cart values are stored in Indian Rupees (₹)
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// DOM elements
const sections = {
    home: document.getElementById('home'),
    shop: document.getElementById('shop'),
    cart: document.getElementById('cart')
};

const cartCountEl = document.getElementById('cartCount');
const cartLink = document.getElementById('cartLink');
const productsGrid = document.getElementById('productsGrid');
const cartItemsEl = document.getElementById('cartItems');
const subtotalEl = document.getElementById('subtotal');
const totalEl = document.getElementById('total');
const checkoutBtn = document.getElementById('checkoutBtn');

// Modal elements
const productModal = document.getElementById('productModal');
const checkoutModal = document.getElementById('checkoutModal');
const successModal = document.getElementById('successModal');
const modalCloseBtns = document.querySelectorAll('.close');

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            showSection(targetId);
        });
    });

    // Hero CTA
    document.querySelector('.cta-button').addEventListener('click', () => {
        showSection('shop');
    });

    // Modal close handlers
    modalCloseBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.modal').forEach(modal => modal.classList.add('hidden'));
        });
    });

    // Close modals on outside click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });
    });

    // Render products
    renderProducts();

    // Render cart
    renderCart();

    // Event listeners
    checkoutBtn.addEventListener('click', showCheckout);
    document.getElementById('checkoutForm').addEventListener('submit', handleCheckout);
    document.getElementById('continueShopping').addEventListener('click', () => {
        successModal.classList.add('hidden');
        showSection('shop');
    });
});

// Show specific section
function showSection(sectionName) {
    // Hide all sections
    Object.values(sections).forEach(section => {
        section.classList.add('hidden');
    });

    // Remove active from all nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });

    // Show target section
    sections[sectionName].classList.remove('hidden');
    
    // Add active to nav link
    document.querySelector(`[href="#${sectionName}"]`).classList.add('active');

    if (sectionName === 'cart') {
        renderCart(); // Refresh cart on show
    }
}

// Render products grid
function renderProducts() {
    productsGrid.innerHTML = '';
    products.forEach(product => {
        const productEl = document.createElement('div');
        productEl.className = 'product-card';
        productEl.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <h3>${product.name}</h3>
                <!-- Show price in Indian rupees with symbol ₹ [web:7][web:10][web:13][web:19] -->
                <p class="price">₹${product.price.toFixed(2)}</p>
                <button class="add-to-cart-btn" onclick="addToCart(${product.id})">Add to Cart</button>
            </div>
        `;
        productEl.addEventListener('click', (e) => {
            // If the click is not on the button, open the detail modal
            if (!e.target.classList.contains('add-to-cart-btn')) {
                showProductModal(product);
            }
        });
        productsGrid.appendChild(productEl);
    });
}

// Show product modal
function showProductModal(product) {
    document.getElementById('modalImage').src = product.image;
    document.getElementById('modalImage').alt = product.name;
    document.getElementById('modalTitle').textContent = product.name;
    document.getElementById('modalPrice').textContent = `₹${product.price.toFixed(2)}`;
    document.getElementById('modalDescription').textContent = product.description;
    document.getElementById('addToCartModal').onclick = () => addToCart(product.id);
    productModal.classList.remove('hidden');
}

// Add to cart function
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    saveCart();
    updateCartUI();
    
    // Visual feedback for the button that was clicked
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = 'Added!';
    btn.style.background = '#059669';
    setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
    }, 1000);
}

// Update cart quantity
function updateCartQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            saveCart();
            renderCart();
            updateCartUI();
        }
    }
}

// Remove from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    renderCart();
    updateCartUI();
}

// Render cart items
function renderCart() {
    cartItemsEl.innerHTML = '';
    
    if (cart.length === 0) {
        cartItemsEl.innerHTML = '<p style="text-align: center; color: #666;">Your cart is empty</p>';
        checkoutBtn.disabled = true;
        subtotalEl.textContent = '₹0.00';
        totalEl.textContent = '₹0.00';
        return;
    }

    cart.forEach(item => {
        const itemEl = document.createElement('div');
        itemEl.className = 'cart-item';
        itemEl.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p class="price">₹${item.price.toFixed(2)}</p>
            </div>
            <div class="quantity-controls">
                <button class="quantity-btn" onclick="updateCartQuantity(${item.id}, -1)">−</button>
                <span>${item.quantity}</span>
                <button class="quantity-btn" onclick="updateCartQuantity(${item.id}, 1)">+</button>
            </div>
            <span class="line-subtotal">₹${(item.price * item.quantity).toFixed(2)}</span>
            <button class="remove-btn" onclick="removeFromCart(${item.id})">Remove</button>
        `;
        cartItemsEl.appendChild(itemEl);
    });

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    subtotalEl.textContent = `₹${subtotal.toFixed(2)}`;
    totalEl.textContent = `₹${subtotal.toFixed(2)}`;
    checkoutBtn.disabled = false;
}

// Update cart count in header
function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountEl.textContent = totalItems;
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Checkout functions
function showCheckout() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById('orderTotal').textContent = `₹${total.toFixed(2)}`;
    checkoutModal.classList.remove('hidden');
}

function handleCheckout(e) {
    e.preventDefault();
    
    // Simple validation
    const name = document.getElementById('customerName').value;
    const email = document.getElementById('customerEmail').value;
    
    if (name && email) {
        checkoutModal.classList.add('hidden');
        successModal.classList.remove('hidden');
        cart = []; // Clear cart
        saveCart();
        updateCartUI();
        document.getElementById('checkoutForm').reset();
        renderCart(); // Refresh view to show empty cart
    }
}
