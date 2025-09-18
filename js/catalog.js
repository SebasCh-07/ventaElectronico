/**
 * Catálogo de productos para H&B Importaciones
 * Maneja la visualización, filtrado y búsqueda de productos
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
  }

  /**
   * Filtra productos por categoría
   * @param {string} categoryId - ID de la categoría
   */
  function filterByCategory(categoryId){
    const chips = categoriesEl.querySelectorAll('.chip');
    chips.forEach(chip => chip.classList.remove('active'));
    const activeChip = categoriesEl.querySelector(`[data-category="${categoryId}"]`);
    if(activeChip) activeChip.classList.add('active');
    
    const products = StorageAPI.getProducts();
    const filtered = categoryId === 'all' ? 
      products : 
      products.filter(p => p.category.toLowerCase().replace(/\s+/g, '-') === categoryId);
    
    renderProducts(filtered);
  }

  /**
   * Agrega un producto al carrito
   * @param {string} productId - ID del producto
   */
  function addToCart(productId){
    const product = StorageAPI.getProductById(productId);
    if(!product) return;

    // Verificar stock
    if(product.stock <= 0) {
      if(window.UI && window.UI.showToast) {
        window.UI.showToast('Este producto no está disponible', 'warning');
      } else {
        alert('Este producto no está disponible');
      }
      return;
    }

    StorageAPI.addToCart(productId, 1);
    updateCartHeader();
    
    if(window.UI && window.UI.showToast) {
      window.UI.showToast(`${product.name} agregado al carrito`, 'success');
    }
  }

  /**
   * Obtiene el precio correcto según el rol del usuario
   * @param {Object} product - Producto
   * @param {string} userRole - Rol del usuario
   * @returns {number} Precio a mostrar
   */
  function getProductPrice(product, userRole) {
    if (userRole === 'distributor' && product.priceDistribuidor) {
      return product.priceDistribuidor;
    }
    return product.pricePublico || product.price || 0;
  }

  /**
   * Renderiza los productos en el grid
   * @param {Array} products - Lista de productos a mostrar
   */
  function renderProducts(products){
    const session = StorageAPI.getSession();
    const userRole = session ? session.role : 'client';
    
    if(products.length === 0) {
      gridEl.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #6b7280;">
          <div style="font-size: 48px; margin-bottom: 16px;">🔍</div>
          <h3 style="margin: 0 0 8px 0; color: #374151;">No se encontraron productos</h3>
          <p style="margin: 0;">Intenta con otros términos de búsqueda o filtros</p>
        </div>
      `;
      return;
    }
    
    gridEl.innerHTML = products.map(p => {
      const price = getProductPrice(p, userRole);
      const originalPrice = p.pricePublico || p.price || 0;
      const isDistributor = userRole === 'distributor';
      const hasDiscount = isDistributor && originalPrice > price;
      
      return `
        <div class="card">
          <div class="card-media">
            <div style="color: #9ca3af; font-size: 14px;">${p.category}</div>
          </div>
          <div class="card-body">
            <div class="card-title">${p.name}</div>
            <div style="color: #6b7280; font-size: 12px; margin-bottom: 8px;">
              ${p.category} • SKU: ${p.sku || 'N/A'}
            </div>
            <div class="card-meta">
              <div>
                <span class="price">${UI.formatPrice(price)}</span>
                ${hasDiscount ? `
                  <div style="font-size: 12px; color: #059669; margin-top: 2px;">
                    <span style="text-decoration: line-through; color: #6b7280;">${UI.formatPrice(originalPrice)}</span>
                    <span style="margin-left: 8px;">Ahorro: ${UI.formatPrice(originalPrice - price)}</span>
                  </div>
                ` : ''}
              </div>
              <span class="stock ${productStockClass(p.stock)}">Stock: ${p.stock}</span>
            </div>
            ${isDistributor ? `
              <div style="font-size: 11px; color: #059669; margin-bottom: 8px;">
                💡 Precio distribuidor
              </div>
            ` : ''}
            <div class="card-actions">
              <button class="btn brand" onclick="addToCart('${p.id}')" ${p.stock <= 0 ? 'disabled' : ''}>
                ${p.stock <= 0 ? 'Sin Stock' : 'Agregar al carrito'}
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  /**
   * Actualiza el header del carrito
   */
  function updateCartHeader(){
    if(window.UI && window.UI.updateCartHeader) {
      window.UI.updateCartHeader();
    } else {
      // Fallback básico
      const cart = StorageAPI.getCart();
      const count = StorageAPI.getCartItemCount();
      const total = StorageAPI.getCartTotal();
      
      const countEl = document.getElementById('cart-count');
      const totalEl = document.getElementById('cart-total');
      if(countEl) countEl.textContent = count;
      if(totalEl) totalEl.textContent = UI.formatPrice(total);
    }
  }

  /**
   * Configura la búsqueda en tiempo real
   */
  function setupSearch(){
    const searchInput = document.querySelector('.search input');
    if(!searchInput) return;
    
    let timeout;
    searchInput.addEventListener('input', () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        const query = searchInput.value.toLowerCase().trim();
        const products = StorageAPI.getProducts();
        
        if(query === '') {
          renderProducts(products);
          return;
        }
        
        const filtered = products.filter(p => 
          p.name.toLowerCase().includes(query) ||
          (p.description && p.description.toLowerCase().includes(query)) ||
          (p.brand && p.brand.toLowerCase().includes(query)) ||
          (p.sku && p.sku.toLowerCase().includes(query)) ||
          p.category.toLowerCase().includes(query)
        );
        
        renderProducts(filtered);
      }, 300);
    });
  }

  /**
   * Inicializa el catálogo
   */
  function initCatalog(){
    const products = StorageAPI.getProducts();
    const categories = getCategories(products);
    
    renderCategories(categories);
    renderProducts(products);
    updateCartHeader();
    setupSearch();
    
    // Activar filtro "Todas" por defecto
    const allChip = categoriesEl.querySelector('[data-category="all"]');
    if(allChip) allChip.classList.add('active');
  }

  // Event listeners
  if(categoriesEl) {
    categoriesEl.addEventListener('click', (e) => {
      if(e.target.classList.contains('chip')){
        const categoryId = e.target.getAttribute('data-category');
        filterByCategory(categoryId);
      }
    });
  }

  // Inicializar
  initCatalog();

  // Función global para agregar al carrito
  window.addToCart = addToCart;
})();