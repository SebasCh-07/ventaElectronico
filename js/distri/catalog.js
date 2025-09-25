/**
 * Catálogo de productos para Distribuidores - H&B Importaciones
 * Maneja la visualización, filtrado y búsqueda de productos con precios de distribuidor
 */
(function(){
  'use strict';

  const gridEl = document.getElementById('product-grid');
  const categoriesEl = document.getElementById('categories');
  if(!gridEl) return;

  /**
   * Obtiene las categorías únicas de los productos
   * @param {Array} products - Lista de productos
   * @returns {Array} Categorías con id y nombre
   */
  function getCategories(products){
    const cats = [...new Set(products.map(p => p.category))];
    return cats.map(cat => ({ 
      name: cat, 
      id: cat.toLowerCase().replace(/\s+/g, '-') 
    }));
  }

  /**
   * Determina la clase CSS según el stock
   * @param {number} stock - Cantidad en stock
   * @returns {string} Clase CSS
   */
  function productStockClass(stock){
    if(stock <= 0) return 'out';
    if(stock <= 5) return 'low';
    return 'ok';
  }

  /**
   * Renderiza las categorías como chips
   * @param {Array} categories - Lista de categorías
   */
  function renderCategories(categories){
    if(!categoriesEl) return;
    
    // Agregar opción "Todas"
    const allCategories = [
      { name: 'Todas', id: 'all' },
      ...categories
    ];
    
    categoriesEl.innerHTML = allCategories.map(cat => `
      <button class="chip" data-category="${cat.id}">${cat.name}</button>
    `).join('');
    
    // Event listeners para filtrado
    categoriesEl.addEventListener('click', (e) => {
      if(e.target.classList.contains('chip')){
        const categoryId = e.target.dataset.category;
        
        // Actualizar estado activo
        categoriesEl.querySelectorAll('.chip').forEach(chip => {
          chip.classList.remove('active');
        });
        e.target.classList.add('active');
        
        // Filtrar productos
        filterProducts(categoryId);
      }
    });
    
    // Activar "Todas" por defecto
    const firstChip = categoriesEl.querySelector('.chip');
    if(firstChip) firstChip.classList.add('active');
  }

  /**
   * Filtra productos por categoría
   * @param {string} categoryId - ID de la categoría
   */
  function filterProducts(categoryId){
    const products = StorageAPI.getProducts();
    let filtered = [...products];
    
    if(categoryId !== 'all'){
      filtered = filtered.filter(p => 
        p.category.toLowerCase().replace(/\s+/g, '-') === categoryId
      );
    }
    
    renderProducts(filtered);
  }

  /**
   * Renderiza los productos en el grid
   * @param {Array} products - Lista de productos a renderizar
   */
  function renderProducts(products){
    if(!products || products.length === 0){
      gridEl.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #6b7280;">
          <span data-icon="package" style="width: 48px; height: 48px; display: block; margin: 0 auto 16px; color: #d1d5db;"></span>
          <p>No se encontraron productos</p>
        </div>
      `;
      return;
    }
    
    gridEl.innerHTML = products.map(product => createProductCard(product)).join('');
  }

  /**
   * Crea una tarjeta de producto
   * @param {Object} product - Datos del producto
   * @returns {string} HTML de la tarjeta
   */
  function createProductCard(product){
    const stockClass = productStockClass(product.stock);
    const stockText = product.stock <= 0 ? 'Sin Stock' : 
                     product.stock <= 5 ? 'Stock Bajo' : 
                     `${product.stock} disponibles`;
    
    // Precios: público (tachado) y distribuidor (destacado)
    const publicPrice = product.pricePublico;
    const distributorPrice = product.priceDistribuidor;
    const discount = Math.round(((publicPrice - distributorPrice) / publicPrice) * 100);
    
    return `
      <div class="card">
        <div class="card-media">
          ${product.image ? 
            `<img src="${product.image}" alt="${product.name}" loading="lazy">` :
            `<div class="placeholder-image">
              <span data-icon="package" style="width: 48px; height: 48px; color: #d1d5db;"></span>
            </div>`
          }
          ${product.featured ? '<div class="featured-badge">Destacado</div>' : ''}
          ${discount > 0 ? `<div class="discount-badge">-${discount}%</div>` : ''}
        </div>
        <div class="card-body">
          <div class="card-title">${product.name}</div>
          <div class="card-meta">
            <div class="price-container">
              <div class="price-comparison">
                <span class="price-publico">${UI.formatPrice(publicPrice)}</span>
                <span class="price-distribuidor">${UI.formatPrice(distributorPrice)}</span>
                <span class="price-label">Precio Distribuidor</span>
              </div>
            </div>
            <span class="stock ${stockClass}">${stockText}</span>
          </div>
          <div class="card-description">${product.description || 'Sin descripción disponible'}</div>
          <div class="card-actions">
            <button class="btn secondary" onclick="viewProduct('${product.id}')">
              <span data-icon="eye" style="width:16px;height:16px;margin-right:6px;"></span>
              Ver
            </button>
            <button class="btn brand" onclick="addToCart('${product.id}')" ${product.stock <= 0 ? 'disabled' : ''}>
              <span data-icon="shopping-cart" style="width:16px;height:16px;margin-right:6px;"></span>
              Agregar
            </button>
            <button class="btn" onclick="addToWishlist('${product.id}')" style="margin-top: 8px; font-size: 12px; padding: 6px 12px;">
              <img src="../../image/corazon.png" alt="Favoritos" style="width:14px;height:14px;margin-right:4px;">
              Favoritos
            </button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Agrega un producto al carrito
   * @param {string} productId - ID del producto
   */
  function addToCart(productId){
    const products = StorageAPI.getProducts();
    const product = products.find(p => p.id === productId);
    
    if(!product) return;
    
    if(product.stock <= 0){
      alert('Este producto no está disponible');
      return;
    }
    
    const cart = StorageAPI.getCart();
    const existingItem = cart.find(item => item.productId === productId);
    
    if(existingItem){
      if(existingItem.quantity >= product.stock){
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
    
    if(window.Helpers && window.Helpers.showToast){
      Helpers.showToast(`${product.name} agregado al carrito`, 'success');
    }
  }

  /**
   * Actualiza el header del carrito
   */
  function updateCartHeader(){
    const cart = StorageAPI.getCart();
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    const total = StorageAPI.getCartTotal();
    
    const countEl = document.getElementById('cart-count');
    const totalEl = document.getElementById('cart-total');
    
    if(countEl) countEl.textContent = count;
    if(totalEl) totalEl.textContent = UI.formatPrice(total);
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
    document.getElementById('wishlist-modal').style.display = 'block';
  }

  /**
   * Cierra el modal de wishlist
   */
  function closeWishlistModal(){
    document.getElementById('wishlist-modal').style.display = 'none';
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
      
      const stockClass = productStockClass(product.stock);
      const stockText = product.stock <= 0 ? 'Sin Stock' : 
                       product.stock <= 5 ? 'Stock Bajo' : 
                       `${product.stock} disponibles`;
      
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
            <div class="stock ${stockClass}" style="font-size: 11px;">${stockText}</div>
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
   * Obtiene la wishlist del usuario
   */
  function getWishlist(){
    return StorageAPI.getWishlist();
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
  function openCartModal(){
    loadCartItems();
    document.getElementById('cart-modal').style.display = 'block';
  }

  /**
   * Cierra el modal del carrito
   */
  function closeCartModal(){
    document.getElementById('cart-modal').style.display = 'none';
  }

  /**
   * Carga los items del carrito en el modal
   */
  function loadCartItems(){
    const cart = StorageAPI.getCart();
    const container = document.getElementById('cart-items-container');
    const totalEl = document.getElementById('cart-modal-total');
    
    if(!container) return;
    
    if(cart.length === 0){
      container.innerHTML = `
        <div style="text-align: center; padding: 40px; color: #6b7280;">
          <span data-icon="shopping-cart" style="width: 48px; height: 48px; display: block; margin: 0 auto 16px; color: #d1d5db;"></span>
          <p>Tu carrito está vacío</p>
        </div>
      `;
      if(totalEl) totalEl.textContent = '$0,00';
      return;
    }
    
    const products = StorageAPI.getProducts();
    
    container.innerHTML = cart.map(item => {
      const product = products.find(p => p.id === item.productId);
      if(!product) return '';
      
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
    if(totalEl) totalEl.textContent = UI.formatPrice(total);
  }

  /**
   * Actualiza la cantidad de un item en el carrito
   * @param {string} productId - ID del producto
   * @param {number} newQuantity - Nueva cantidad
   */
  function updateQuantity(productId, newQuantity){
    if(newQuantity < 0) return;
    
    const cart = StorageAPI.getCart();
    const item = cart.find(item => item.productId === productId);
    const products = StorageAPI.getProducts();
    const product = products.find(p => p.id === productId);
    
    if(!item || !product) return;
    
    if(newQuantity === 0){
      removeFromCart(productId);
      return;
    }
    
    if(newQuantity > product.stock){
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
   * @param {string} productId - ID del producto
   */
  function removeFromCart(productId){
    const cart = StorageAPI.getCart();
    const updatedCart = cart.filter(item => item.productId !== productId);
    StorageAPI.setCart(updatedCart);
    updateCartHeader();
    loadCartItems();
  }

  /**
   * Procede al checkout
   */
  function proceedToCheckout(){
    const cart = StorageAPI.getCart();
    if(cart.length === 0){
      alert('Tu carrito está vacío');
      return;
    }
    
    // Redirigir a la página de checkout (a implementar)
    alert('Función de checkout en desarrollo');
  }

  /**
   * Navega a la página de detalles del producto
   * @param {string} productId - ID del producto
   */
  function viewProduct(productId){
    window.location.href = `product-detail.html?id=${productId}`;
  }

  // Funciones globales
  window.addToCart = addToCart;
  window.openCartModal = openCartModal;
  window.closeCartModal = closeCartModal;
  window.updateQuantity = updateQuantity;
  window.removeFromCart = removeFromCart;
  window.proceedToCheckout = proceedToCheckout;
  window.viewProduct = viewProduct;
  window.openWishlistModal = openWishlistModal;
  window.closeWishlistModal = closeWishlistModal;
  window.addToWishlist = addToWishlist;
  window.removeFromWishlist = removeFromWishlist;
  window.addToCartFromWishlist = addToCartFromWishlist;
  window.addAllToCart = addAllToCart;

  // Inicializar cuando el DOM esté listo
  document.addEventListener('DOMContentLoaded', () => {
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

    // Cargar datos frescos
    StorageAPI.reloadFromHBDATA();
    
    // Cargar productos y categorías
    const products = StorageAPI.getProducts();
    const categories = getCategories(products);
    
    renderCategories(categories);
    renderProducts(products);
    
    // Actualizar headers
    updateCartHeader();
    updateWishlistHeader();
    
    // Aplicar iconos
    if(window.applyIcons) applyIcons();
  });
})();
