// handle animation of features section 
document.addEventListener("DOMContentLoaded", () => {
  const featuresSection = document.querySelector("#features");

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        featuresSection.classList.add("show");
        observer.unobserve(featuresSection); 
      }
    });
  }, { threshold: 0.2 });

  observer.observe(featuresSection);
});

//--------------------------------------------------------------------------

// fetch api
async function fetchAPI(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(
        `Failed to fetch ${url}: ${res.status} ${res.statusText}`
      );
    }
    return await res.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}

///* auto-scrolling horizontal card */
async function ImageScriller() {
  const data = await fetchAPI("../products.json");
  if (!data) return;

  const scroll_row = document.getElementById("scrollRow");
  data.products.forEach((item) => {
    const scrol_card = document.createElement("div");
    scrol_card.className =
      "bg-white rounded-xl shadow-md hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex-shrink-0 w-60 p-4 text-center";
    scrol_card.innerHTML = `
      <img src="${item.thumbnail}" alt="product image" loading="lazy 
           class="w-40 h-40 mx-auto object-contain rounded-lg mb-3">
      <p class="text-sm font-semibold text-gray-700 capitalize">${item.category}</p>
    `;
    scroll_row.appendChild(scrol_card);
  });
}
ImageScriller();

// FIXED: Updated card function with proper structure
function card(product) {
  return `
    <div class="mt-4">
      <div class="relative group w-full h-48 rounded-t-lg overflow-hidden">
        <img src="${product.thumbnail}" alt="${product.title}" class="w-full h-full object-cover bg-gray-100" />

        <div class="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-lg">
          <button class="heart_whishlist text-red-600 px-4 py-2 rounded-full transform -translate-y-12 group-hover:translate-y-0 transition-transform"
        data-id="${product.id}">
            <i class="ri-heart-fill text-2xl text-white"></i>
           </button>

        <a href="./description.html" target="_blank"
   class="see_more bg-[#DC2626] text-white px-5 py-2 rounded-full shadow-md hover:bg-red-700 hover:shadow-lg transition-all duration-300 inline-block text-center transform translate-y-12 group-hover:translate-y-0">
  See More
</a>

        </div>
      </div>

      <div class="flex items-center justify-between mt-4">
        <span class="text-sm font-semibold text-gray-800">${product.title}</span>
        <span class="text-xl font-bold text-[#DC2626]">$${product.price}</span>
      </div>
   
     <div class="cat_cart_container hover:text-[#DC2626] transition-colors duration-300">
       <a href="#" class="add_to_cart" data-product-id="${product.id}">
         <i class="ri-shopping-cart-line mr-1"></i>Add to cart
       </a>
       <span class="cat">
         ${product.category}
       </span>
     </div>

    </div>
  `;
}

async function loadCards() {
  const data = await fetchAPI("./products.json");
  if (!data || !data.products) return;

  const container = document.getElementById("cardsContainer");
  container.innerHTML = "";

  data.products.forEach((product) => {
    const cardWrapper = document.createElement("div");
    cardWrapper.innerHTML = card(product);
    container.appendChild(cardWrapper);
  });
  
  // Add event listeners for heart buttons 
  document.querySelectorAll(".heart_whishlist").forEach((button) => {
    button.addEventListener("click", () => handleHeartClick(button));
  });
}
loadCards();

// filtering whishlist
let wishlist = [];

function handleHeartClick(button) {
  const id = parseInt(button.dataset.id);
  const icon = button.querySelector("i");
  const isInWishlist = wishlist.includes(id);

  if (isInWishlist) {
    wishlist = wishlist.filter((pid) => pid !== id);
    icon.classList.remove("text-red-600");
    icon.classList.add("text-white");
  } else {
    wishlist.push(id);
    icon.classList.remove("text-white");
    icon.classList.add("text-red-600");
  }

  console.log("Wishlist:", wishlist);
}

// Navigation dropdown functionality
document.addEventListener('DOMContentLoaded', () => {
  // Desktop dropdown
  const productsButton = document.querySelector('.products button');
  const dropdown = document.querySelector('.products .dropdown');
  
  if (productsButton && dropdown) {
    document.querySelector('.products').addEventListener('mouseenter', () => {
      dropdown.classList.remove('hidden');
    });
    
    document.querySelector('.products').addEventListener('mouseleave', () => {
      dropdown.classList.add('hidden');
    });
  }
});

// Cart & Checkout System
(function() {
    'use strict';
    
    // Prevent duplicate initialization
    if (window.__shopCartMounted) return;
    window.__shopCartMounted = true;
    
    // Cart state and API
    const CART_STORAGE_KEY = 'shop:cart:v1';
    let cartState = { items: [], total: 0 };
    let debounceTimer;
    let isProcessing = false; // FIXED: Prevent double-clicks
    
    // Initialize cart from localStorage
    function initCart() {
        try {
            const saved = localStorage.getItem(CART_STORAGE_KEY);
            if (saved) {
                cartState = JSON.parse(saved);
            }
        } catch (e) {
            console.warn('Failed to load cart from localStorage:', e);
        }
    }
    
    // Save cart to localStorage with debouncing
    function saveCart() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            try {
                localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartState));
            } catch (e) {
                console.warn('Failed to save cart to localStorage:', e);
            }
        }, 150);
    }
    
    // Calculate cart totals
    function updateCartTotals() {
        cartState.total = cartState.items.reduce((sum, item) => sum + (item.priceNumber * item.quantity), 0);
        saveCart();
        updateCartUI();
    }
    
    // Update cart UI elements
    function updateCartUI() {
        const badge = document.querySelector('.cart-badge');
        const cartItemsContainer = document.querySelector('.cart-items');
        
        if (badge) {
            const totalQty = cartState.items.reduce((sum, item) => sum + item.quantity, 0);
            badge.textContent = totalQty || '';
            badge.style.display = totalQty > 0 ? 'block' : 'none';
        }
        
        if (cartItemsContainer) {
            renderCartItems();
        }
    }
    
    // Render cart items in the drawer
    function renderCartItems() {
        const container = document.querySelector('.cart-items');
        if (!container) return;
        
        if (cartState.items.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center py-8">Cart is empty</p>';
            return;
        }
        
        container.innerHTML = cartState.items.map(item => `
            <div class="cart-item flex items-center gap-3 p-3 border-b border-gray-200 last:border-b-0">
                <img src="${item.image}" alt="${item.title}" class="w-16 h-16 object-cover rounded-lg">
                <div class="flex-1 min-w-0">
                    <h4 class="font-medium text-sm truncate">${item.title}</h4>
                    <p class="text-gray-600 text-sm">$${item.priceNumber.toFixed(2)}</p>
                </div>
                <div class="flex items-center gap-2">
                    <button class="qty-btn minus-btn w-8 h-8 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors flex items-center justify-center" 
                            data-id="${item.id}" aria-label="Decrease quantity">
                        <i class="ri-subtract-line text-sm"></i>
                    </button>
                    <span class="qty-display w-12 text-center text-sm font-medium">${item.quantity}</span>
                    <button class="qty-btn plus-btn w-8 h-8 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors flex items-center justify-center" 
                            data-id="${item.id}" aria-label="Increase quantity">
                        <i class="ri-add-line text-sm"></i>
                    </button>
                    <button class="delete-btn ml-2 text-red-500 hover:text-red-700 transition-colors" 
                            data-id="${item.id}" aria-label="Remove item">
                        <i class="ri-delete-bin-line text-lg"></i>
                    </button>
                </div>
            </div>
        `).join('');
        
        // Update totals
        const subtotalEl = document.querySelector('.cart-subtotal');
        const totalEl = document.querySelector('.cart-total');
        
        if (subtotalEl) subtotalEl.textContent = `$${cartState.total.toFixed(2)}`;
        if (totalEl) totalEl.textContent = `$${cartState.total.toFixed(2)}`;
    }
    
    // Find product by title/price from products.json
    async function findProductByCard(cardElement) {
        try {
            const response = await fetch('./products.json');
            const data = await response.json();
            
            const title = cardElement.querySelector('.text-sm.font-semibold')?.textContent?.trim();
            const priceText = cardElement.querySelector('.text-xl.font-bold')?.textContent?.trim();
            const price = parseFloat(priceText?.replace(/[^\d.]/g, ''));
            const image = cardElement.querySelector('img')?.src;
            
            if (!title || !price || !image) return null;
            
            // Find matching product
            const product = data.products.find(p => 
                p.title.toLowerCase().trim() === title.toLowerCase().trim() && 
                Math.abs(p.price - price) < 0.01
            );
            
            if (product) {
                return {
                    id: product.id.toString(),
                    title: product.title,
                    priceNumber: product.price,
                    image: product.thumbnail || image,
                    quantity: 1
                };
            }
            
            // Fallback to card data
            return {
                id: `card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                title,
                priceNumber: price,
                image,
                quantity: 1
            };
        } catch (e) {
            console.warn('Failed to fetch products.json, using fallback:', e);
            const title = cardElement.querySelector('.text-sm.font-semibold')?.textContent?.trim();
            const priceText = cardElement.querySelector('.text-xl.font-bold')?.textContent?.trim();
            const price = parseFloat(priceText?.replace(/[^\d.]/g, ''));
            const image = cardElement.querySelector('img')?.src;
            
            if (title && price && image) {
                return {
                    id: `card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    title,
                    priceNumber: price,
                    image,
                    quantity: 1
                };
            }
            return null;
        }
    }
    
    // FIXED: Add to cart functionality with double-click prevention
    async function addToCart(cardElement) {
        if (isProcessing) {
            console.log('Already processing, please wait...');
            return;
        }
        
        isProcessing = true;
        
        try {
            const product = await findProductByCard(cardElement);
            if (!product) return;
            
            const existingItem = cartState.items.find(item => item.id === product.id);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cartState.items.push(product);
            }
            
            updateCartTotals();
            showNotification('Added to cart!', 'success');
        } finally {
            // Reset processing flag after a short delay
            setTimeout(() => {
                isProcessing = false;
            }, 500);
        }
    }
    
    // Make addToCart globally available
    window.addToCart = addToCart;
    
    // Show notification
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300 transform translate-x-full ${
            type === 'success' ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
        }`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => notification.classList.remove('translate-x-full'), 100);
        
        // Auto-hide
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }
    
    // Inject cart UI
    function injectCartUI() {
        if (document.querySelector('.cart-system')) return;
        
        const cartSystem = document.createElement('div');
        cartSystem.className = 'cart-system';
        cartSystem.innerHTML = `
                       <!-- Floating cart button -->
            <button class="cart-button fixed bottom-4 start-4 bg-red-600 text-white p-4 rounded-full shadow-lg hover:bg-red-700 transition-colors z-40" 
                    aria-label="Open shopping cart">
                <i class="ri-shopping-cart-line text-2xl"></i>
                <span class="cart-badge absolute -top-2 -end-2 bg-yellow-400 text-black text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center" 
                      style="display: none;"></span>
            </button>
            
            <!-- Cart drawer overlay -->
            <div class="cart-overlay fixed inset-0 bg-black bg-opacity-50 z-50 hidden" aria-hidden="true"></div>
            
            <!-- Cart drawer -->
            <div class="cart-drawer fixed top-0 end-0 h-full w-full max-w-md bg-white shadow-2xl transform translate-x-full transition-transform duration-300 z-50" 
                 role="dialog" aria-modal="true" aria-label="Shopping cart">
                <div class="flex flex-col h-full">
                    <!-- Header -->
                    <div class="flex items-center justify-between p-4 border-b border-gray-200">
                        <h2 class="text-xl font-semibold">Shopping Cart</h2>
                        <button class="cart-close-btn text-gray-500 hover:text-gray-700 transition-colors" 
                                aria-label="Close cart">
                            <i class="ri-close-line text-2xl"></i>
                        </button>
                    </div>
                    
                    <!-- Cart items -->
                    <div class="cart-items flex-1 overflow-y-auto p-4">
                        <p class="text-gray-500 text-center py-8">Cart is empty</p>
                    </div>
                    
                    <!-- Footer -->
                    <div class="border-t border-gray-200 p-4 space-y-3">
                        <div class="flex justify-between text-sm">
                            <span>Subtotal:</span>
                            <span class="cart-subtotal font-medium">$0.00</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span>Shipping:</span>
                            <span class="text-gray-500">Free</span>
                        </div>
                        <div class="flex justify-between text-lg font-semibold border-t border-gray-200 pt-2">
                            <span>Total:</span>
                            <span class="cart-total">$0.00</span>
                        </div>
                        
                        <div class="flex gap-2">
                            <button class="clear-cart-btn flex-1 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                Clear All
                            </button>
                            <button class="checkout-btn flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                                Checkout
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Checkout modal -->
            <div class="checkout-modal fixed inset-0 bg-black bg-opacity-50 z-[60] hidden" aria-hidden="true"></div>
            <div class="checkout-content fixed top-1/2 start-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-2xl max-w-lg w-full mx-4 z-[70] hidden" 
                 role="dialog" aria-modal="true" aria-label="Checkout">
                <div class="p-6">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-xl font-semibold">Order Summary</h3>
                        <button class="checkout-close-btn text-gray-500 hover:text-gray-700 transition-colors" 
                                aria-label="Close checkout">
                            <i class="ri-close-line text-2xl"></i>
                        </button>
                    </div>
                    
                    <div class="checkout-items mb-4 max-h-64 overflow-y-auto"></div>
                    
                    <div class="border-t border-gray-200 pt-4 space-y-3 mb-6">
                        <div class="flex justify-between text-sm">
                            <span>Subtotal:</span>
                            <span class="checkout-subtotal font-medium">$0.00</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span>Shipping:</span>
                            <span class="text-gray-500">Free</span>
                        </div>
                        <div class="flex justify-between text-lg font-semibold">
                            <span>Total:</span>
                            <span class="checkout-total">$0.00</span>
                        </div>
                    </div>
                    
                    <div class="flex gap-3">
                        <button class="checkout-cancel-btn flex-1 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                            Cancel
                        </button>
                        <button class="checkout-confirm-btn flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                            Confirm Order
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(cartSystem);
        
        // Bind cart events
        bindCartEvents();
    }
    
    // Bind cart event listeners
    function bindCartEvents() {
        // Cart button toggle
        document.querySelector('.cart-button')?.addEventListener('click', () => {
            openCart();
        });
        
        // Cart close button
        document.querySelector('.cart-close-btn')?.addEventListener('click', () => {
            closeCart();
        });
        
        // Cart overlay click
        document.querySelector('.cart-overlay')?.addEventListener('click', () => {
            closeCart();
        });
        
        // Checkout button
        document.querySelector('.checkout-btn')?.addEventListener('click', () => {
            openCheckout();
        });
        
        // Checkout close button
        document.querySelector('.checkout-close-btn')?.addEventListener('click', () => {
            closeCheckout();
        });
        
        // Checkout cancel button
        document.querySelector('.checkout-cancel-btn')?.addEventListener('click', () => {
            closeCheckout();
        });
        
        // Checkout overlay click
        document.querySelector('.checkout-modal')?.addEventListener('click', () => {
            closeCheckout();
        });
        
        // Clear cart button
        document.querySelector('.clear-cart-btn')?.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear all items from your cart?')) {
                clearCart();
            }
        });
        
        // Event delegation for quantity and delete buttons
        document.querySelector('.cart-drawer')?.addEventListener('click', (e) => {
            const target = e.target.closest('.qty-btn, .delete-btn');
            if (!target) return;
            
            const itemId = target.dataset.id;
            if (!itemId) return;
            
            if (target.classList.contains('minus-btn')) {
                const item = cartState.items.find(item => item.id === itemId);
                if (item && item.quantity > 1) {
                    item.quantity -= 1;
                    updateCartTotals();
                }
            } else if (target.classList.contains('plus-btn')) {
                const item = cartState.items.find(item => item.id === itemId);
                if (item) {
                    item.quantity += 1;
                    updateCartTotals();
                }
            } else if (target.classList.contains('delete-btn')) {
                cartState.items = cartState.items.filter(item => item.id !== itemId);
                updateCartTotals();
            }
        });
        
        // Checkout confirm button
        document.querySelector('.checkout-confirm-btn')?.addEventListener('click', () => {
            confirmOrder();
        });
        
        // ESC key handlers
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (!document.querySelector('.checkout-content').classList.contains('hidden')) {
                    closeCheckout();
                } else if (!document.querySelector('.cart-drawer').classList.contains('translate-x-full')) {
                    closeCart();
                }
            }
        });

        // FIXED: Single event listener for add-to-cart with proper delegation
        document.addEventListener('click', async (e) => {
            // Only handle add to cart buttons
            const addToCartBtn = e.target.closest('.add_to_cart');
            if (!addToCartBtn) return;
            
            // Prevent default navigation
            e.preventDefault();
            e.stopPropagation();
            
            // Prevent processing if already in progress
            if (isProcessing) {
                console.log('Add to cart already processing...');
                return;
            }
            
            // Add visual feedback
          addToCartBtn.classList.add('clicked');
            setTimeout(() => {
              addToCartBtn.classList.remove('clicked');
          }, 150);
            
            // Find the card container
            const cardElement = addToCartBtn.closest('.mt-4');
            if (cardElement) {
                await addToCart(cardElement);
            }
        });
    }
    
    // Open cart drawer
    function openCart() {
        document.querySelector('.cart-overlay').classList.remove('hidden');
        document.querySelector('.cart-drawer').classList.remove('translate-x-full');
        document.querySelector('.cart-drawer').classList.add('translate-x-0');
        
        // Focus management
        setTimeout(() => {
            document.querySelector('.cart-close-btn')?.focus();
        }, 100);
    }
    
    // Close cart drawer
    function closeCart() {
        document.querySelector('.cart-overlay').classList.add('hidden');
        document.querySelector('.cart-drawer').classList.remove('translate-x-0');
        document.querySelector('.cart-drawer').classList.add('translate-x-full');
    }
    
    // Open checkout modal
    function openCheckout() {
        if (cartState.items.length === 0) {
            showNotification('Cart is empty!', 'info');
            return;
        }
        
        // Populate checkout items
        const checkoutItems = document.querySelector('.checkout-items');
        checkoutItems.innerHTML = cartState.items.map(item => `
            <div class="flex items-center gap-3 py-2 border-b border-gray-100 last:border-b-0">
                <img src="${item.image}" alt="${item.title}" class="w-12 h-12 object-cover rounded">
                <div class="flex-1 min-w-0">
                    <h4 class="font-medium text-sm truncate">${item.title}</h4>
                    <p class="text-gray-600 text-xs">$${item.priceNumber.toFixed(2)} × ${item.quantity}</p>
                </div>
                <span class="font-medium text-sm">$${(item.priceNumber * item.quantity).toFixed(2)}</span>
            </div>
        `).join('');
        
        // Update checkout totals
        document.querySelector('.checkout-subtotal').textContent = `$${cartState.total.toFixed(2)}`;
        document.querySelector('.checkout-total').textContent = `$${cartState.total.toFixed(2)}`;
        
        // Show modal
        document.querySelector('.checkout-modal').classList.remove('hidden');
        document.querySelector('.checkout-content').classList.remove('hidden');
        
        // Focus management
        setTimeout(() => {
            document.querySelector('.checkout-confirm-btn')?.focus();
        }, 100);
    }
    
    // Close checkout modal
    function closeCheckout() {
        document.querySelector('.checkout-modal').classList.add('hidden');
        document.querySelector('.checkout-content').classList.add('hidden');
    }
    
    // Confirm order
    function confirmOrder() {
        // Dispatch custom event
        const event = new CustomEvent('custom:checkout:confirmed', {
            detail: { cart: cartState.items, total: cartState.total, timestamp: Date.now() }
        });
        document.dispatchEvent(event);
        
        // Show success toast
        showSuccessToast();
        
        // Clear cart
        clearCart();
        
        // Close checkout modal
        closeCheckout();
        
        // Close cart drawer
        closeCart();
    }
    
    // Show success toast
    function showSuccessToast() {
        const toast = document.createElement('div');
        toast.className = 'success-toast fixed bottom-4 start-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-[80] transition-all duration-300';
        toast.setAttribute('role', 'status');
        toast.setAttribute('aria-live', 'polite');
        toast.innerHTML = `
            <div class="flex items-center justify-between">
                <span>Order confirmed successfully! ✅</span>
                <button class="ml-3 text-white hover:text-gray-200 transition-colors" 
                        onclick="this.parentElement.parentElement.remove()" 
                        aria-label="Close notification">
                    ×
                </button>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        // Auto-hide after 4 seconds
        setTimeout(() => {
            if (toast.parentElement) {
                toast.style.opacity = '0';
                toast.style.transform = 'translateY(100%)';
                setTimeout(() => toast.remove(), 300);
            }
        }, 4000);
    }
    
    // Clear cart
    function clearCart() {
        cartState.items = [];
        updateCartTotals();
    }
    
    // Public API
    window.shopCart = {
        add: (id, qty = 1) => {
            console.log('Use addToCart with card element for best results');
        },
        remove: (id) => {
            cartState.items = cartState.items.filter(item => item.id !== id);
            updateCartTotals();
        },
        setQty: (id, qty) => {
            if (qty <= 0) {
                cartState.items = cartState.items.filter(item => item.id !== id);
            } else {
                const item = cartState.items.find(item => item.id === id);
                if (item) item.quantity = qty;
            }
            updateCartTotals();
        },
        clear: clearCart,
        getState: () => ({ ...cartState }),
        open: openCart,
        close: closeCart
    };
    
    // Initialize
    initCart();
    injectCartUI();
    updateCartUI();
    
    console.log('Cart system initialized successfully');
})();

// Enhanced Authentication System - English Messages
class AuthSystem {
  constructor() {
    this.currentUser = this.loadUser();
    this.registeredUsers = this.loadRegisteredUsers();
    this.init();
  }

  init() {
    this.bindEvents();
    this.updateUI();
  }

  bindEvents() {
    // Show auth modal when needed
    document.addEventListener('click', (e) => {
      // Login button clicked
      if (e.target.closest('[data-action="login"]')) {
        e.preventDefault();
        this.showAuthModal('login');
      }
      
      // Signup button clicked  
      if (e.target.closest('[data-action="signup"]')) {
        e.preventDefault();
        this.showAuthModal('signup');
      }

      // Checkout - requires login
      if (e.target.closest('.checkout-btn')) {
        if (!this.isLoggedIn()) {
          e.preventDefault();
          e.stopPropagation();
          this.showAuthModal('login', 'Please login to continue with checkout');
          return false;
        }
      }
    });

    // Form submissions
    const loginForm = document.getElementById('loginFormElement');
    const signupForm = document.getElementById('signupFormElement');

    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleLogin(e.target);
      });
    }

    if (signupForm) {
      signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSignup(e.target);
      });
    }

    // Modal controls
    document.getElementById('closeAuth')?.addEventListener('click', () => {
      this.hideAuthModal();
    });

    document.getElementById('showSignup')?.addEventListener('click', () => {
      this.switchToSignup();
    });

    document.getElementById('showLogin')?.addEventListener('click', () => {
      this.switchToLogin();
    });

    // Close modal on overlay click
    document.getElementById('authModal')?.addEventListener('click', (e) => {
      if (e.target.id === 'authModal') {
        this.hideAuthModal();
      }
    });

    // ESC key to close modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !document.getElementById('authModal').classList.contains('hidden')) {
        this.hideAuthModal();
      }
    });
  }

  showAuthModal(type = 'login', message = '') {
    const modal = document.getElementById('authModal');
    modal.classList.remove('hidden');
    
    if (type === 'signup') {
      this.switchToSignup();
    } else {
      this.switchToLogin();
    }

    if (message) {
      this.showMessage(message, 'info');
    }

    // Focus first input
    setTimeout(() => {
      const firstInput = modal.querySelector('input');
      if (firstInput) firstInput.focus();
    }, 100);
  }

  hideAuthModal() {
    document.getElementById('authModal').classList.add('hidden');
    // Clear form data
    document.querySelectorAll('#authModal input').forEach(input => input.value = '');
  }

  switchToLogin() {
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('signupForm').classList.add('hidden');
  }

  switchToSignup() {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('signupForm').classList.remove('hidden');
  }

  async handleLogin(form) {
    const formData = new FormData(form);
    const email = formData.get('email');
    const password = formData.get('password');

    if (!email || !password) {
      this.showMessage('Please fill in all fields', 'error');
      return;
    }

    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="ri-loader-4-line animate-spin mr-2"></i>Signing in...';
    submitBtn.disabled = true;

    try {
      const user = await this.authenticateUser(email, password);
      
      if (user) {
        this.setCurrentUser(user);
        this.hideAuthModal();
        this.showMessage(`Welcome back, ${user.name}! 🎉`, 'success');
        this.updateUI();
      } else {
        this.showMessage('Invalid email or password!', 'error');
      }
    } catch (error) {
      this.showMessage('Login failed. Please try again.', 'error');
    } finally {
      // Reset button state
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  }

  async handleSignup(form) {
    const formData = new FormData(form);
    const name = formData.get('name');
    const email = formData.get('email');  
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');

    if (!name || !email || !password || !confirmPassword) {
      this.showMessage('Please fill in all fields', 'error');
      return;
    }

    if (password !== confirmPassword) {
      this.showMessage('Passwords do not match!', 'error');
      return;
    }

    if (password.length < 6) {
      this.showMessage('Password must be at least 6 characters long', 'error');
      return;
    }

    // Check if email already exists
    if (this.registeredUsers.some(user => user.email === email)) {
      this.showMessage('This email is already registered!', 'error');
      return;
    }

    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="ri-loader-4-line animate-spin mr-2"></i>Creating account...';
    submitBtn.disabled = true;

    try {
      const user = await this.registerUser({ name, email, password });
      
      if (user) {
        this.addRegisteredUser(user);
        this.setCurrentUser(user);
        this.hideAuthModal();
        this.showMessage(`Welcome to Mawjood, ${user.name}! 🎉`, 'success');
        this.updateUI();
      }
    } catch (error) {
      this.showMessage('Registration failed. Please try again.', 'error');
    } finally {
      // Reset button state
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  }

  // Enhanced authentication with user storage
  async authenticateUser(email, password) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Default demo user
    if (email === 'user@example.com' && password === 'password') {
      return {
        id: 1,
        name: 'John Doe',
        email: email,
        avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=dc2626&color=fff'
      };
    }

    // Check registered users
    const user = this.registeredUsers.find(u => 
      u.email === email && u.password === password
    );

    if (user) {
      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
    
    return null;
  }

  async registerUser(userData) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const user = {
      id: Date.now(),
      name: userData.name,
      email: userData.email,
      password: userData.password, // In real app, this should be hashed
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=dc2626&color=fff`,
      createdAt: new Date().toISOString()
    };

    return user;
  }

  // Separate current user from registered users
  setCurrentUser(user) {
    this.currentUser = user;
    localStorage.setItem('auth:currentUser', JSON.stringify(user));
  }

  loadUser() {
    try {
      const saved = localStorage.getItem('auth:currentUser');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }

  // Manage registered users
  addRegisteredUser(user) {
    this.registeredUsers.push(user);
    this.saveRegisteredUsers();
  }

  loadRegisteredUsers() {
    try {
      const saved = localStorage.getItem('auth:registeredUsers');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  saveRegisteredUsers() {
    try {
      localStorage.setItem('auth:registeredUsers', JSON.stringify(this.registeredUsers));
    } catch (e) {
      console.warn('Failed to save registered users:', e);
    }
  }

  // Logout only clears current session, not registered users
  logout() {
    this.currentUser = null;
    localStorage.removeItem('auth:currentUser'); // Only remove current user
    // Keep registered users intact
    this.updateUI();
    this.showMessage('Logged out successfully! 👋', 'info');
    
    // Clear wishlist when user logs out
    wishlist = [];
    document.querySelectorAll('.heart_whishlist i').forEach(icon => {
      icon.classList.remove('text-red-600');
      icon.classList.add('text-white');
    });
  }

  isLoggedIn() {
    return !!this.currentUser;
  }

  updateUI() {
    const loginBtns = document.querySelectorAll('[data-action="login"]');
    const signupBtns = document.querySelectorAll('[data-action="signup"]');
    const userMenus = document.querySelectorAll('.user-menu');
    const mobileUserMenus = document.querySelectorAll('.user-menu-mobile');

    if (this.isLoggedIn()) {
      // Hide login/signup buttons
      loginBtns.forEach(btn => btn.style.display = 'none');
      signupBtns.forEach(btn => btn.style.display = 'none');
      
      // Show user menu
      const userMenuHTML = `
        <div class="flex items-center gap-3">
          <img src="${this.currentUser.avatar}" alt="User" class="w-8 h-8 rounded-full border-2 border-red-200">
          <div class="hidden md:block">
            <span class="text-sm font-medium text-gray-800">Hello ${this.currentUser.name}</span>
          </div>
          <button onclick="auth.logout()" class="text-sm text-red-600 hover:text-red-700 transition-colors px-3 py-1 rounded-md hover:bg-red-50">
            <i class="ri-logout-circle-line mr-1"></i>Logout
          </button>
        </div>
      `;
      
      userMenus.forEach(menu => {
        menu.style.display = 'flex';
        menu.innerHTML = userMenuHTML;
      });

      // Mobile user menu
      mobileUserMenus.forEach(menu => {
        menu.style.display = 'block';
        menu.innerHTML = `
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div class="flex items-center gap-3">
              <img src="${this.currentUser.avatar}" alt="User" class="w-10 h-10 rounded-full border-2 border-red-200">
              <div>
                <p class="font-medium text-gray-800">Hello ${this.currentUser.name}</p>
                <p class="text-sm text-gray-600">${this.currentUser.email}</p>
              </div>
            </div>
            <button onclick="auth.logout()" class="text-red-600 hover:text-red-700">
              <i class="ri-logout-circle-line text-xl"></i>
            </button>
          </div>
        `;
      });
      
    } else {
      // Show login/signup buttons
      loginBtns.forEach(btn => btn.style.display = 'inline-block');
      signupBtns.forEach(btn => btn.style.display = 'inline-block');
      
      // Hide user menu
      userMenus.forEach(menu => menu.style.display = 'none');
      mobileUserMenus.forEach(menu => menu.style.display = 'none');
    }
  }

  showMessage(message, type = 'info') {
    const colors = {
      success: 'bg-green-500',
      error: 'bg-red-500', 
      info: 'bg-blue-500'
    };

    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-[200] transition-all duration-300 transform translate-x-full`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => notification.classList.remove('translate-x-full'), 100);
    setTimeout(() => {
      notification.classList.add('translate-x-full');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  // Debug function to see registered users
  getRegisteredUsers() {
    console.log('Registered Users:', this.registeredUsers);
    return this.registeredUsers;
  }

  // Clear all data (for testing only)
  clearAllData() {
    localStorage.removeItem('auth:currentUser');
    localStorage.removeItem('auth:registeredUsers');
    this.currentUser = null;
    this.registeredUsers = [];
    this.updateUI();
    this.showMessage('All data cleared!', 'info');
  }
}

// Initialize auth system
const auth = new AuthSystem();

// Add to global scope for debugging
window.auth = auth;
