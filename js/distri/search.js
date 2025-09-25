/**
 * Sistema de búsqueda para Distribuidores - H&B Importaciones
 * Permite buscar productos con filtros avanzados y precios de distribuidor
 */
(function(){
  'use strict';

  let allProducts = [];
  let searchResults = [];
  let currentQuery = '';

  /**
   * Inicializa la búsqueda
   */
  function initSearch() {
    // Verificar sesión de distribuidor
    const session = StorageAPI.getSession();
    if (!session || session.role !== 'distributor') {
      window.location.href = '../auth/login.html';
      return;
    }

    // Actualizar mensaje de bienvenida
    const welcomeEl = document.getElementById('distri-welcome');
    if (welcomeEl) {
      welcomeEl.textContent = `Bienvenido, ${session.name}`;
    }

    // Cargar datos
    loadProducts();
    loadCategories();
    updateCartHeader();
    updateWishlistHeader();
    
    // Inicializar botón de logout
    const logoutContainer = document.getElementById('logout-container');
    if (logoutContainer) {
      const logoutBtn = UI.createLogoutButton();
      logoutContainer.appendChild(logoutBtn);
    }

    // Event listeners
    setupEventListeners();
  }

  /**
   * Carga todos los productos
   */
  function loadProducts() {
    allProducts = StorageAPI.getProducts();
    searchResults = [...allProducts];
    renderResults();
  }

  /**
   * Carga las categorías para el filtro
   */
  function loadCategories() {
    const categories = StorageAPI.getCategories();
    const categoryFilter = document.getElementById('category-filter');
    
    if (!categoryFilter) return;

    categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category.name;
      option.textContent = category.name;
      categoryFilter.appendChild(option);
    });
  }

  /**
   * Renderiza los resultados de búsqueda
   */
  function renderResults() {
    const container = document.getElementById('search-results');
    const countEl = document.getElementById('results-count');
    const titleEl = document.getElementById('results-title');
    
    if (!container) return;

    if (searchResults.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #6b7280;">
          <span data-icon="search" style="width: 48px; height: 48px; display: block; margin: 0 auto 16px; color: #d1d5db;"></span>
          <p>No se encontraron productos</p>
          <small>Intenta con otros términos de búsqueda o ajusta los filtros</small>
        </div>
      `;
      
      if (countEl) countEl.textContent = '0 productos encontrados';
      if (titleEl) titleEl.textContent = currentQuery ? `Resultados para "${currentQuery}"` : 'Resultados de búsqueda';
      return;
    }

    container.innerHTML = searchResults.map(product => createProductCard(product)).join('');
    
    if (countEl) countEl.textContent = `${searchResults.length} producto${searchResults.length !== 1 ? 's' : ''} encontrado${searchResults.length !== 1 ? 's' : ''}`;
    if (titleEl) titleEl.textContent = currentQuery ? `Resultados para "${currentQuery}"` : 'Todos los productos';
  }

  /**
   * Crea una tarjeta de producto
   */
  function createProductCard(product) {
    const isLowStock = product.stock <= 5 && product.stock > 0;
    const isOutOfStock = product.stock === 0;
    const stockStatus = isOutOfStock ? 'out' : isLowStock ? 'low' : 'ok';
    const stockText = isOutOfStock ? 'Sin Stock' : isLowStock ? 'Stock Bajo' : `${product.stock} disponibles`;
    
    // Precios: público (tachado) y distribuidor (destacado)
    const publicPrice = product.pricePublico;
    const distributorPrice = product.priceDistribuidor;
    const discount = Math.round(((publicPrice - distributorPrice) / publicPrice) * 100);
    
    return `
      <div class="product-card-compact" style="display:flex;align-items:center;gap:12px;padding:12px;border:1px solid #e5e7eb;border-radius:8px;background:white;transition:all 0.2s ease;">
        <div class="product-image-compact" style="width:60px;height:60px;background:#f8fafc;border-radius:6px;display:flex;align-items:center;justify-content:center;overflow:hidden;border:1px solid #e5e7eb;flex-shrink:0;">
          ${product.image ? 
            `<img src="${product.image}" alt="${product.name}" style="width:100%;height:100%;object-fit:cover;">` :
            `<span data-icon="package" style="width:24px;height:24px;color:#6b7280;"></span>`
          }
        </div>
        <div class="product-info-compact" style="flex:1;min-width:0;">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
            <h3 style="font-size:14px;font-weight:600;color:#374151;margin:0;line-height:1.2;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${product.name}</h3>
            ${product.featured ? '<span style="background:#8b5cf6;color:white;padding:1px 6px;border-radius:3px;font-size:9px;font-weight:500;">DESTACADO</span>' : ''}
            ${discount > 0 ? `<span style="background:#ef4444;color:white;padding:1px 6px;border-radius:3px;font-size:9px;font-weight:500;">-${discount}%</span>` : ''}
          </div>
          <div style="font-size:12px;color:#6b7280;margin-bottom:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
            ${product.brand || 'Sin marca'} • ${product.category || 'Sin categoría'}
          </div>
          <div style="display:flex;align-items:center;gap:12px;font-size:12px;">
            <div style="display:flex;gap:4px;">
              <span style="color:#6b7280;">Público:</span>
              <span style="text-decoration:line-through;color:#9ca3af;">${UI.formatPrice(publicPrice)}</span>
            </div>
            <div style="display:flex;gap:4px;">
              <span style="color:#6b7280;">Distribuidor:</span>
              <span style="font-weight:600;color:#3b82f6;">${UI.formatPrice(distributorPrice)}</span>
            </div>
            <div style="display:flex;gap:4px;">
              <span style="color:#6b7280;">Stock:</span>
              <span style="font-weight:600;color:${isOutOfStock ? '#dc2626' : isLowStock ? '#f59e0b' : '#059669'};">${product.stock || 0}</span>
            </div>
          </div>
        </div>
        <div class="product-actions-compact" style="display:flex;flex-direction:column;gap:6px;flex-shrink:0;">
          <div style="display:flex;gap:6px;">
            <button class="btn secondary" onclick="viewProduct('${product.id}')" style="padding:4px 8px;font-size:11px;">
              <span data-icon="eye" style="width:12px;height:12px;margin-right:4px;"></span>
              Ver
            </button>
            <button class="btn brand" onclick="addToCart('${product.id}')" ${isOutOfStock ? 'disabled' : ''} style="padding:4px 8px;font-size:11px;">
              <span data-icon="shopping-cart" style="width:12px;height:12px;margin-right:4px;"></span>
              Agregar
            </button>
          </div>
          <button class="btn" onclick="addToWishlist('${product.id}')" style="font-size:10px;padding:3px 6px;width:100%;">
            <img src="../../image/corazon.png" alt="Favoritos" style="width:12px;height:12px;margin-right:3px;">
            Favoritos
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Realiza la búsqueda
   */
  function performSearch() {
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');
    const priceFilter = document.getElementById('price-filter');
    const stockFilter = document.getElementById('stock-filter');
    
    if (!searchInput) return;

    currentQuery = searchInput.value.trim();
    
    let filtered = allProducts;

    // Filtro por búsqueda de texto
    if (currentQuery) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(currentQuery.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(currentQuery.toLowerCase())) ||
        (product.category && product.category.toLowerCase().includes(currentQuery.toLowerCase())) ||
        (product.id && product.id.toLowerCase().includes(currentQuery.toLowerCase())) ||
        (product.sku && product.sku.toLowerCase().includes(currentQuery.toLowerCase())) ||
        (product.brand && product.brand.toLowerCase().includes(currentQuery.toLowerCase()))
      );
    }

    // Filtro por categoría
    if (categoryFilter && categoryFilter.value) {
      filtered = filtered.filter(product => product.category === categoryFilter.value);
    }

    // Filtro por precio
    if (priceFilter && priceFilter.value) {
      filtered = filtered.filter(product => {
        const price = product.priceDistribuidor;
        switch (priceFilter.value) {
          case '0-50000':
            return price >= 0 && price <= 50000;
          case '50000-100000':
            return price > 50000 && price <= 100000;
          case '100000-200000':
            return price > 100000 && price <= 200000;
          case '200000+':
            return price > 200000;
          default:
            return true;
        }
      });
    }

    // Filtro por stock
    if (stockFilter && stockFilter.value) {
      filtered = filtered.filter(product => {
        switch (stockFilter.value) {
          case 'in-stock':
            return product.stock > 5;
          case 'low-stock':
            return product.stock <= 5 && product.stock > 0;
          case 'out-of-stock':
            return product.stock === 0;
          default:
            return true;
        }
      });
    }

    searchResults = filtered;
    renderResults();
  }

  /**
   * Configura los event listeners
   */
  function setupEventListeners() {
    // Búsqueda principal
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', debounce(performSearch, 300));
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          performSearch();
        }
      });
    }

    // Filtros
    const categoryFilter = document.getElementById('category-filter');
    const priceFilter = document.getElementById('price-filter');
    const stockFilter = document.getElementById('stock-filter');
    
    if (categoryFilter) categoryFilter.addEventListener('change', performSearch);
    if (priceFilter) priceFilter.addEventListener('change', performSearch);
    if (stockFilter) stockFilter.addEventListener('change', performSearch);

    // Modales
    document.getElementById('cart-modal').addEventListener('click', (e) => {
      if (e.target.id === 'cart-modal') closeCartModal();
    });

    document.getElementById('wishlist-modal').addEventListener('click', (e) => {
      if (e.target.id === 'wishlist-modal') closeWishlistModal();
    });

    // Tecla Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeCartModal();
        closeWishlistModal();
      }
    });

    // Wishlist click
    const wishlistBtn = document.querySelector('[title="Lista de deseos"]');
    if (wishlistBtn) {
      wishlistBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openWishlistModal();
      });
    }
  }

  /**
   * Función de debounce para la búsqueda
   */
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Agrega un producto al carrito
   */
  function addToCart(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;

    if (product.stock === 0) {
      alert('Este producto no está disponible');
      return;
    }

    const cart = StorageAPI.getCart();
    const existingItem = cart.find(item => item.productId === productId);
    
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        alert('No hay suficiente stock disponible');
        return;
      }
      existingItem.quantity += 1;
    } else {
      cart.push({
        productId: productId,
        quantity: 1,
        price: product.priceDistribuidor // Usar precio de distribuidor
      });
    }

    StorageAPI.setCart(cart);
    updateCartHeader();
    
    if (window.UI && window.UI.showToast) {
      UI.showToast(`${product.name} agregado al carrito`, 'success');
    }
  }

  /**
   * Actualiza el header del carrito
   */
  function updateCartHeader() {
    const cart = StorageAPI.getCart();
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    const total = StorageAPI.getCartTotal();

    const countEl = document.getElementById('cart-count');
    const totalEl = document.getElementById('cart-total');
    
    if (countEl) countEl.textContent = count;
    if (totalEl) totalEl.textContent = UI.formatPrice(total);
  }

  /**
   * Actualiza el header de la wishlist
   */
  function updateWishlistHeader(){
    const wishlist = StorageAPI.getWishlist();
    const count = wishlist.length;
    
    const countEl = document.getElementById('wishlist-count');
    if(countEl) countEl.textContent = count;
  }

  /**
   * Abre el modal de wishlist
   */
  function openWishlistModal(){
    loadWishlistItems();
    document.getElementById('wishlist-modal').classList.add('active');
  }

  /**
   * Cierra el modal de wishlist
   */
  function closeWishlistModal(){
    document.getElementById('wishlist-modal').classList.remove('active');
  }

  /**
   * Carga los items de la wishlist en el modal
   */
  function loadWishlistItems(){
    const wishlist = StorageAPI.getWishlist();
    const container = document.getElementById('wishlist-items-container');
    
    if(!container) return;
    
    if(wishlist.length === 0){
      container.innerHTML = `
        <div style="text-align: center; padding: 40px; color: #6b7280;">
          <span data-icon="heart" style="width: 48px; height: 48px; display: block; margin: 0 auto 16px; color: #d1d5db;"></span>
          <p>Tu lista de deseos está vacía</p>
        </div>
      `;
      return;
    }
    
    const products = StorageAPI.getProducts();
    
    container.innerHTML = wishlist.map(productId => {
      const product = products.find(p => p.id === productId);
      if(!product) return '';
      
      const isLowStock = product.stock <= 5 && product.stock > 0;
      const isOutOfStock = product.stock === 0;
      const stockStatus = isOutOfStock ? 'out' : isLowStock ? 'low' : 'ok';
      const stockText = isOutOfStock ? 'Sin Stock' : isLowStock ? 'Stock Bajo' : `${product.stock} disponibles`;
      
      const publicPrice = product.pricePublico;
      const distributorPrice = product.priceDistribuidor;
      const discount = Math.round(((publicPrice - distributorPrice) / publicPrice) * 100);
      
      return `
        <div class="cart-item">
          <div class="cart-item-image">
            ${product.image ? 
              `<img src="${product.image}" alt="${product.name}">` :
              `<div class="placeholder-image">
                <span data-icon="package" style="width: 24px; height: 24px; color: #d1d5db;"></span>
              </div>`
            }
          </div>
          <div class="cart-item-details">
            <div class="cart-item-name">${product.name}</div>
            <div class="price-comparison" style="font-size: 12px;">
              <span class="price-publico">${UI.formatPrice(publicPrice)}</span>
              <span class="price-distribuidor" style="font-size: 14px;">${UI.formatPrice(distributorPrice)}</span>
              ${discount > 0 ? `<span style="color: #ef4444; font-weight: 600;">-${discount}%</span>` : ''}
            </div>
            <div class="stock ${stockStatus}" style="font-size: 11px;">${stockText}</div>
          </div>
          <div class="cart-item-total">
            <button class="btn brand" onclick="addToCartFromWishlist('${product.id}')" style="font-size: 12px; padding: 6px 12px;" ${product.stock <= 0 ? 'disabled' : ''}>
              Agregar
            </button>
            <button class="remove-btn" onclick="removeFromWishlist('${product.id}')" style="font-size: 11px;">Remover</button>
          </div>
        </div>
      `;
    }).join('');
  }

  /**
   * Agrega un producto de la wishlist al carrito
   */
  function addToCartFromWishlist(productId){
    addToCart(productId);
    removeFromWishlist(productId);
  }

  /**
   * Agrega todos los productos de la wishlist al carrito
   */
  function addAllToCart(){
    const wishlist = StorageAPI.getWishlist();
    const products = StorageAPI.getProducts();
    
    let addedCount = 0;
    wishlist.forEach(productId => {
      const product = products.find(p => p.id === productId);
      if(product && product.stock > 0){
        addToCart(productId);
        addedCount++;
      }
    });
    
    if(addedCount > 0){
      // Limpiar wishlist después de agregar todo
      StorageAPI.setWishlist([]);
      updateWishlistHeader();
      closeWishlistModal();
      
      if(window.Helpers && window.Helpers.showToast){
        Helpers.showToast(`${addedCount} producto${addedCount !== 1 ? 's' : ''} agregado${addedCount !== 1 ? 's' : ''} al carrito`, 'success');
      }
    } else {
      alert('No hay productos disponibles en tu lista de deseos');
    }
  }

  /**
   * Remueve un producto de la wishlist
   */
  function removeFromWishlist(productId){
    const wishlist = StorageAPI.getWishlist();
    const updatedWishlist = wishlist.filter(id => id !== productId);
    StorageAPI.setWishlist(updatedWishlist);
    updateWishlistHeader();
    loadWishlistItems();
  }

  /**
   * Agrega un producto a la wishlist
   */
  function addToWishlist(productId){
    const wishlist = StorageAPI.getWishlist();
    if(!wishlist.includes(productId)){
      wishlist.push(productId);
      StorageAPI.setWishlist(wishlist);
      updateWishlistHeader();
      
      const products = StorageAPI.getProducts();
      const product = products.find(p => p.id === productId);
      
      if(window.Helpers && window.Helpers.showToast){
        Helpers.showToast(`${product.name} agregado a favoritos`, 'success');
      }
    }
  }

  /**
   * Abre el modal del carrito
   */
  function openCartModal() {
    loadCartItems();
    document.getElementById('cart-modal').classList.add('active');
  }

  /**
   * Cierra el modal del carrito
   */
  function closeCartModal() {
    document.getElementById('cart-modal').classList.remove('active');
  }

  /**
   * Carga los items del carrito
   */
  function loadCartItems() {
    const cart = StorageAPI.getCart();
    const container = document.getElementById('cart-items-container');
    const totalEl = document.getElementById('cart-modal-total');
    
    if (!container) return;

    if (cart.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 40px; color: #6b7280;">
          <span data-icon="shopping-cart" style="width: 48px; height: 48px; display: block; margin: 0 auto 16px; color: #d1d5db;"></span>
          <p>Tu carrito está vacío</p>
        </div>
      `;
      if (totalEl) totalEl.textContent = '$0,00';
      return;
    }

    container.innerHTML = cart.map(item => {
      const product = allProducts.find(p => p.id === item.productId);
      if (!product) return '';

      const itemTotal = item.price * item.quantity;
      
      return `
        <div class="cart-item">
          <div class="cart-item-image">
            ${product.image ? 
              `<img src="${product.image}" alt="${product.name}">` :
              `<div class="placeholder-image">
                <span data-icon="package" style="width: 24px; height: 24px; color: #d1d5db;"></span>
              </div>`
            }
          </div>
          <div class="cart-item-details">
            <div class="cart-item-name">${product.name}</div>
            <div class="cart-item-price">${UI.formatPrice(item.price)}</div>
          </div>
          <div class="cart-item-quantity">
            <button class="quantity-btn" onclick="updateQuantity('${item.productId}', ${item.quantity - 1})">-</button>
            <span>${item.quantity}</span>
            <button class="quantity-btn" onclick="updateQuantity('${item.productId}', ${item.quantity + 1})" ${item.quantity >= product.stock ? 'disabled' : ''}>+</button>
          </div>
          <div class="cart-item-total">
            <div class="cart-item-subtotal">${UI.formatPrice(itemTotal)}</div>
            <button class="remove-btn" onclick="removeFromCart('${item.productId}')">Remover</button>
          </div>
        </div>
      `;
    }).join('');

    const total = StorageAPI.getCartTotal();
    if (totalEl) totalEl.textContent = UI.formatPrice(total);
  }

  /**
   * Actualiza la cantidad de un item
   */
  function updateQuantity(productId, newQuantity) {
    if (newQuantity < 0) return;
    
    const cart = StorageAPI.getCart();
    const item = cart.find(item => item.productId === productId);
    const product = allProducts.find(p => p.id === productId);
    
    if (!item || !product) return;
    
    if (newQuantity === 0) {
      removeFromCart(productId);
      return;
    }
    
    if (newQuantity > product.stock) {
      alert('No hay suficiente stock disponible');
      return;
    }
    
    item.quantity = newQuantity;
    StorageAPI.setCart(cart);
    updateCartHeader();
    loadCartItems();
  }

  /**
   * Remueve un item del carrito
   */
  function removeFromCart(productId) {
    const cart = StorageAPI.getCart();
    const updatedCart = cart.filter(item => item.productId !== productId);
    StorageAPI.setCart(updatedCart);
    updateCartHeader();
    loadCartItems();
  }

  /**
   * Procede al checkout
   */
  function proceedToCheckout() {
    const cart = StorageAPI.getCart();
    if (cart.length === 0) {
      alert('Tu carrito está vacío');
      return;
    }
    
    // Redirigir a la página de checkout (a implementar)
    alert('Función de checkout en desarrollo');
  }

  /**
   * Función de logout
   */
  function logout() {
    localStorage.removeItem('hb_session');
    window.location.href = '../auth/login.html';
  }

  // Funciones globales
  window.addToCart = addToCart;
  window.openCartModal = openCartModal;
  window.closeCartModal = closeCartModal;
  window.updateQuantity = updateQuantity;
  window.removeFromCart = removeFromCart;
  window.proceedToCheckout = proceedToCheckout;
  window.openWishlistModal = openWishlistModal;
  window.closeWishlistModal = closeWishlistModal;
  window.addToWishlist = addToWishlist;
  window.removeFromWishlist = removeFromWishlist;
  window.addToCartFromWishlist = addToCartFromWishlist;
  window.addAllToCart = addAllToCart;
  window.logout = logout;

  // Inicializar cuando el DOM esté listo
  document.addEventListener('DOMContentLoaded', initSearch);
})();
