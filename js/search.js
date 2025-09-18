(function(){
  let currentQuery = '';
  let currentCategory = 'Todas';

  function getQueryFromURL(){
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('q') || '';
  }

  function updateBreadcrumb(query){
    const breadcrumbEl = document.getElementById('breadcrumb-search');
    if(breadcrumbEl){
      breadcrumbEl.textContent = query ? `Resultados de búsqueda para "${query}"` : 'Resultados de búsqueda';
    }
  }

  function updateSearchInfo(query, results){
    const infoEl = document.getElementById('search-info');
    if(!infoEl) return;
    
    if(query){
      infoEl.innerHTML = `
        <div class="search-results-header">
          <h2>Resultados para "${query}"</h2>
          <p>Se encontraron ${results.length} producto${results.length !== 1 ? 's' : ''}</p>
        </div>
      `;
    } else {
      infoEl.innerHTML = `
        <div class="search-results-header">
          <h2>Explora nuestros productos</h2>
          <p>Selecciona una categoría o usa la búsqueda para encontrar lo que necesitas</p>
        </div>
      `;
    }
  }

  function renderProducts(products){
    const grid = document.getElementById('product-grid');
    if(!grid) return;
    grid.innerHTML = '';
    
    if(products.length === 0){
      grid.innerHTML = '<div style="text-align:center;padding:40px;color:#6b7280;grid-column:1/-1;"><h3>No se han encontrado productos que coincidan con tu selección.</h3><p>Intenta con otros términos de búsqueda o explora nuestras categorías.</p></div>';
      return;
    }
    
    products.forEach(p=>{
      const card = document.createElement('article');
      card.className = 'card';
      card.innerHTML = `
        <div class="card-media"></div>
        <div class="card-body">
          <h3 class="card-title">${p.name}</h3>
          <div class="card-meta">
            <span class="price">${UI.formatPrice(p.price)}</span>
            <span class="stock ${p.stock > 0 ? 'ok' : 'out'}">${p.stock>0?`Stock: ${p.stock}`:'Sin stock'}</span>
          </div>
        </div>
        <div class="card-actions">
          <button class="btn brand block" ${p.stock>0?'':'disabled'}>Agregar al carrito</button>
        </div>`;
      card.querySelector('button').addEventListener('click', ()=> addToCart(p.id));
      grid.appendChild(card);
    });
  }

  function renderCategories(){
    const container = document.getElementById('categories');
    if(!container) return;
    
    const products = StorageAPI.getProducts();
    const categories = [...new Set(products.map(p => p.category || 'General'))];
    
    const allChip = `<div class="category-item ${currentCategory === 'Todas' ? 'active' : ''}" onclick="filterByCategory('Todas')">Todas (${products.length})</div>`;
    const categoryItems = categories.map(category => {
      const count = products.filter(p => (p.category || 'General') === category).length;
      return `<div class="category-item ${currentCategory === category ? 'active' : ''}" onclick="filterByCategory('${category}')">${category} (${count})</div>`;
    }).join('');
    
    container.innerHTML = allChip + categoryItems;
  }

  function filterByCategory(category){
    currentCategory = category;
    performSearch();
  }

  function performSearch(){
    const products = StorageAPI.getProducts();
    let filtered = products;
    
    // Aplicar filtro de categoría
    if(currentCategory !== 'Todas'){
      filtered = filtered.filter(p => (p.category || 'General') === currentCategory);
    }
    
    // Aplicar búsqueda
    if(currentQuery){
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(currentQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(currentQuery.toLowerCase())) ||
        (p.category && p.category.toLowerCase().includes(currentQuery.toLowerCase()))
      );
    }
    
    renderProducts(filtered);
    renderCategories();
    updateSearchInfo(currentQuery, filtered);
  }

  function addToCart(productId){
    const products = StorageAPI.getProducts();
    const product = products.find(p => p.id === productId);
    if(!product) return;
    
    const cart = StorageAPI.getCart();
    const existing = cart.find(i => i.productId === productId);
    if(existing){ 
      existing.quantity += 1; 
    } else { 
      cart.push({ productId, quantity: 1 }); 
    }
    StorageAPI.setCart(cart);
    updateCartHeader();
    alert('Producto agregado al carrito');
  }

  function updateCartHeader(){
    const cart = StorageAPI.getCart();
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const total = cart.reduce((sum, item) => {
      const product = StorageAPI.getProducts().find(p => p.id === item.productId);
      return sum + (product ? product.price * item.quantity : 0);
    }, 0);
    
    const countEl = document.getElementById('cart-count');
    const totalEl = document.getElementById('cart-total');
    if(countEl) countEl.textContent = count;
    if(totalEl) totalEl.textContent = UI.formatPrice(total);
  }

  function setupSearch(){
    const searchInput = document.getElementById('search-input');
    if(!searchInput) return;
    
    // Cargar query de la URL
    currentQuery = getQueryFromURL();
    searchInput.value = currentQuery;
    
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        currentQuery = e.target.value.toLowerCase().trim();
        performSearch();
        
        // Actualizar URL sin recargar la página
        const url = new URL(window.location);
        if(currentQuery){
          url.searchParams.set('q', currentQuery);
        } else {
          url.searchParams.delete('q');
        }
        window.history.replaceState({}, '', url);
      }, 300);
    });
  }

  // Hacer funciones globales
  window.filterByCategory = filterByCategory;
  window.addToCart = addToCart;

  function updateWelcomeMessage(){
    const session = StorageAPI.getSession();
    const welcomeEl = document.getElementById('admin-welcome') || document.getElementById('distri-welcome');
    if(welcomeEl && session){
      welcomeEl.textContent = `Bienvenido, ${session.name}`;
    }
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    setupSearch();
    performSearch();
    updateCartHeader();
    updateBreadcrumb(currentQuery);
    updateWelcomeMessage();
    
    // Inicializar botón de logout
    const logoutContainer = document.getElementById('logout-container');
    if(logoutContainer){
      const logoutBtn = UI.createLogoutButton();
      logoutContainer.appendChild(logoutBtn);
    }
  });
})();
