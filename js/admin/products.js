/**
 * Sistema de gestión de productos para H&B Importaciones - Panel Admin
 * Permite ver, filtrar, buscar, crear, editar y gestionar productos
 */
(function(){
  'use strict';

  let allProducts = [];
  let filteredProducts = [];
  let editingProductId = null;
  let categories = [];

  /**
   * Umbral para stock bajo
   */
  const LOW_STOCK_THRESHOLD = 5;

  /**
   * Renderiza la lista de productos
   */
  function renderProducts(products = null) {
    const productsToRender = products || filteredProducts;
    const container = document.getElementById('products-list');
    
    if (productsToRender.length === 0) {
      container.innerHTML = '<p style="color:#6b7280;text-align:center;padding:40px;">No hay productos que mostrar</p>';
      return;
    }
    
    container.innerHTML = productsToRender.map(product => {
      const isLowStock = product.stock <= LOW_STOCK_THRESHOLD && product.stock > 0;
      const isOutOfStock = product.stock === 0;
      const stockColor = isOutOfStock ? '#dc2626' : isLowStock ? '#f59e0b' : '#059669';
      const stockBg = isOutOfStock ? '#fef2f2' : isLowStock ? '#fef3c7' : '#dcfce7';
      const stockText = isOutOfStock ? 'Sin Stock' : isLowStock ? 'Stock Bajo' : 'En Stock';
      
      return `
        <div class="product-card">
          <div class="product-id-badge">
            ${product.id}
          </div>
          <div class="product-image">
            ${product.image ? 
              `<img src="${product.image}" alt="${product.name}" class="product-img">` :
              `<span data-icon="package" class="product-icon"></span>`
            }
          </div>
          <div class="product-content">
            <div class="product-header">
              <div class="product-name">${product.name}</div>
              ${product.featured ? '<span class="featured-badge">DESTACADO</span>' : ''}
            </div>
            <div class="product-description">${product.description || 'Sin descripción'}</div>
            <div class="product-details">
              <span><strong>SKU:</strong> ${product.sku}</span>
              <span><strong>Categoría:</strong> ${product.category}</span>
              <span><strong>Marca:</strong> ${product.brand || 'N/A'}</span>
            </div>
            <div class="product-pricing">
              <span class="price-info"><strong>Público:</strong> ${UI.formatPrice(product.pricePublico)}</span>
              <span class="price-info"><strong>Distribuidor:</strong> ${UI.formatPrice(product.priceDistribuidor)}</span>
              <span class="stock-badge" style="background:${stockBg};color:${stockColor};">
                ${stockText}: ${product.stock}
              </span>
            </div>
          </div>
          <div class="product-actions">
            <button class="btn btn-action" onclick="viewProduct('${product.id}')">
              Ver Detalles
            </button>
            <button class="btn btn-action" onclick="editProduct('${product.id}')">
              Editar
            </button>
            <button class="btn btn-action btn-featured" onclick="toggleFeatured('${product.id}')" style="background:${product.featured ? '#8b5cf6' : '#6b7280'};border-color:${product.featured ? '#7c3aed' : '#4b5563'};color:white;">
              ${product.featured ? 'Quitar' : 'Destacar'}
            </button>
            <button class="btn btn-action btn-danger" onclick="deleteProduct('${product.id}')">
              Eliminar
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  /**
   * Renderiza las estadísticas de productos
   */
  function renderStats() {
    const totalProducts = allProducts.length;
    const inStock = allProducts.filter(p => p.stock > LOW_STOCK_THRESHOLD).length;
    const lowStock = allProducts.filter(p => p.stock <= LOW_STOCK_THRESHOLD && p.stock > 0).length;
    const featured = allProducts.filter(p => p.featured).length;

    document.getElementById('total-products-count').textContent = totalProducts;
    document.getElementById('in-stock-count').textContent = inStock;
    document.getElementById('low-stock-count').textContent = lowStock;
    document.getElementById('featured-count').textContent = featured;
  }

  /**
   * Carga las categorías en los selectores
   */
  function loadCategories() {
    // Obtener categorías desde los datos
    const categoryFilter = document.getElementById('category-filter');
    const productCategory = document.getElementById('product-category');
    
    // Limpiar opciones existentes
    if (categoryFilter) {
      categoryFilter.innerHTML = '<option value="">Todas las categorías</option>';
      categories.forEach(cat => {
        categoryFilter.innerHTML += `<option value="${cat.name}">${cat.name}</option>`;
      });
    }
    
    if (productCategory) {
      productCategory.innerHTML = '<option value="">Seleccionar categoría</option>';
      categories.forEach(cat => {
        productCategory.innerHTML += `<option value="${cat.name}">${cat.name}</option>`;
      });
    }
  }

  /**
   * Filtra productos por búsqueda, categoría, stock y destacados
   */
  function filterProducts() {
    const searchTerm = document.getElementById('product-search').value.toLowerCase().trim();
    const categoryFilter = document.getElementById('category-filter').value;
    const stockFilter = document.getElementById('stock-filter').value;
    const featuredFilter = document.getElementById('featured-filter').value;
    
    filteredProducts = allProducts.filter(product => {
      const matchesSearch = !searchTerm || 
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.sku.toLowerCase().includes(searchTerm) ||
        product.brand.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm) ||
        product.id.toLowerCase().includes(searchTerm);
      
      const matchesCategory = !categoryFilter || product.category === categoryFilter;
      
      const matchesStock = !stockFilter || 
        (stockFilter === 'in-stock' && product.stock > LOW_STOCK_THRESHOLD) ||
        (stockFilter === 'low-stock' && product.stock <= LOW_STOCK_THRESHOLD && product.stock > 0) ||
        (stockFilter === 'out-of-stock' && product.stock === 0);
      
      const matchesFeatured = !featuredFilter ||
        (featuredFilter === 'featured' && product.featured) ||
        (featuredFilter === 'not-featured' && !product.featured);
      
      return matchesSearch && matchesCategory && matchesStock && matchesFeatured;
    });

    renderProducts();
  }

  /**
   * Carga y actualiza la lista de productos
   */
  function loadProducts() {
    allProducts = StorageAPI.getProducts().sort((a, b) => {
      const dateA = new Date(a.createdAt || '2024-01-01');
      const dateB = new Date(b.createdAt || '2024-01-01');
      return dateB - dateA;
    });
    filteredProducts = [...allProducts];
    renderProducts();
    renderStats();
  }

  /**
   * Alterna el estado destacado de un producto
   */
  function toggleFeatured(productId) {
    const products = StorageAPI.getProducts();
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    product.featured = !product.featured;
    StorageAPI.setProducts(products);
    loadProducts();
    filterProducts();
    alert(`Producto ${product.featured ? 'marcado como destacado' : 'removido de destacados'}`);
  }

  /**
   * Elimina un producto
   */
  function deleteProduct(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;
    
    if (!confirm(`¿Estás seguro de que quieres eliminar el producto "${product.name}"?`)) return;
    
    const products = StorageAPI.getProducts();
    const updatedProducts = products.filter(p => p.id !== productId);
    StorageAPI.setProducts(updatedProducts);
    loadProducts();
    filterProducts();
    alert('Producto eliminado exitosamente');
  }

  /**
   * Abre el modal para crear un nuevo producto
   */
  function addProduct() {
    editingProductId = null;
    document.getElementById('product-modal-title').textContent = 'Nuevo Producto';
    clearProductForm();
    document.getElementById('product-modal').style.display = 'block';
  }

  /**
   * Abre el modal para editar un producto existente
   */
  function editProduct(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;
    
    editingProductId = productId;
    document.getElementById('product-modal-title').textContent = 'Editar Producto';
    fillProductForm(product);
    document.getElementById('product-modal').style.display = 'block';
  }

  /**
   * Muestra los detalles de un producto en modal
   */
  function viewProduct(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;

    const isLowStock = product.stock <= LOW_STOCK_THRESHOLD && product.stock > 0;
    const isOutOfStock = product.stock === 0;
    const stockColor = isOutOfStock ? '#dc2626' : isLowStock ? '#f59e0b' : '#059669';
    const stockBg = isOutOfStock ? '#fef2f2' : isLowStock ? '#fef3c7' : '#dcfce7';
    const stockText = isOutOfStock ? 'Sin Stock' : isLowStock ? 'Stock Bajo' : 'En Stock';
    
    const modalBody = document.getElementById('product-details-body');
    modalBody.innerHTML = `
      <div style="text-align:center;margin-bottom:20px;">
        <div style="width:120px;height:120px;background:#f3f4f6;border-radius:8px;margin:0 auto 12px;display:flex;align-items:center;justify-content:center;overflow:hidden;">
          ${product.image ? 
            `<img src="${product.image}" alt="${product.name}" style="width:100%;height:100%;object-fit:cover;">` :
            `<span data-icon="package" style="width:48px;height:48px;color:#6b7280"></span>`
          }
        </div>
        <h3 style="margin:0;color:#374151;">${product.name}</h3>
        ${product.featured ? '<div style="margin-top:8px;"><span style="padding:4px 8px;border-radius:4px;font-size:12px;font-weight:500;background:#fef3c7;color:#92400e;">PRODUCTO DESTACADO</span></div>' : ''}
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
        <div>
          <label style="font-weight:600;color:#6b7280;font-size:12px;text-transform:uppercase;">SKU</label>
          <div style="color:#374151;">${product.sku}</div>
        </div>
        <div>
          <label style="font-weight:600;color:#6b7280;font-size:12px;text-transform:uppercase;">Categoría</label>
          <div style="color:#374151;">${product.category}</div>
        </div>
        <div>
          <label style="font-weight:600;color:#6b7280;font-size:12px;text-transform:uppercase;">Marca</label>
          <div style="color:#374151;">${product.brand || 'No especificada'}</div>
        </div>
        <div>
          <label style="font-weight:600;color:#6b7280;font-size:12px;text-transform:uppercase;">Stock</label>
          <div>
            <span style="padding:4px 8px;border-radius:4px;font-weight:500;background:${stockBg};color:${stockColor};">
              ${stockText}: ${product.stock} unidades
            </span>
          </div>
        </div>
      </div>

      ${product.description ? `
        <div style="margin-bottom:16px;">
          <label style="font-weight:600;color:#6b7280;font-size:12px;text-transform:uppercase;">Descripción</label>
          <div style="color:#374151;margin-top:4px;">${product.description}</div>
        </div>
      ` : ''}

      <div style="margin-bottom:16px;">
        <label style="font-weight:600;color:#6b7280;font-size:12px;text-transform:uppercase;">Precios</label>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:8px;">
          <div style="padding:12px;border:1px solid #e5e7eb;border-radius:8px;background:#f9fafb;">
            <div style="font-size:12px;color:#6b7280;margin-bottom:4px;">Precio Público</div>
            <div style="font-weight:600;color:#374151;font-size:18px;">${UI.formatPrice(product.pricePublico)}</div>
          </div>
          <div style="padding:12px;border:1px solid #e5e7eb;border-radius:8px;background:#f9fafb;">
            <div style="font-size:12px;color:#6b7280;margin-bottom:4px;">Precio Distribuidor</div>
            <div style="font-weight:600;color:#374151;font-size:18px;">${UI.formatPrice(product.priceDistribuidor)}</div>
          </div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;font-size:12px;color:#6b7280;">
        <div>
          <label style="font-weight:600;color:#6b7280;font-size:12px;text-transform:uppercase;">Fecha de Creación</label>
          <div style="color:#374151;">${product.createdAt ? new Date(product.createdAt).toLocaleDateString('es-CO') : 'No disponible'}</div>
        </div>
        <div>
          <label style="font-weight:600;color:#6b7280;font-size:12px;text-transform:uppercase;">Ventas</label>
          <div style="color:#374151;">${product.sales || 0} unidades vendidas</div>
        </div>
      </div>
    `;

    document.getElementById('product-details-modal').style.display = 'block';
  }

  /**
   * Limpia el formulario de producto
   */
  function clearProductForm() {
    document.getElementById('product-name').value = '';
    document.getElementById('product-sku').value = '';
    document.getElementById('product-description').value = '';
    document.getElementById('product-category').value = '';
    document.getElementById('product-brand').value = '';
    document.getElementById('product-price-public').value = '';
    document.getElementById('product-price-distributor').value = '';
    document.getElementById('product-stock').value = '';
    document.getElementById('product-image').value = '';
    document.getElementById('product-featured').checked = false;
  }

  /**
   * Llena el formulario con datos del producto
   */
  function fillProductForm(product) {
    document.getElementById('product-name').value = product.name || '';
    document.getElementById('product-sku').value = product.sku || '';
    document.getElementById('product-description').value = product.description || '';
    document.getElementById('product-category').value = product.category || '';
    document.getElementById('product-brand').value = product.brand || '';
    document.getElementById('product-price-public').value = product.pricePublico || '';
    document.getElementById('product-price-distributor').value = product.priceDistribuidor || '';
    document.getElementById('product-stock').value = product.stock || 0;
    document.getElementById('product-image').value = product.image || '';
    document.getElementById('product-featured').checked = product.featured || false;
  }

  /**
   * Guarda el producto (crear o editar)
   */
  function saveProduct() {
    const name = document.getElementById('product-name').value.trim();
    const sku = document.getElementById('product-sku').value.trim();
    const description = document.getElementById('product-description').value.trim();
    const category = document.getElementById('product-category').value;
    const brand = document.getElementById('product-brand').value.trim();
    const pricePublico = parseInt(document.getElementById('product-price-public').value) || 0;
    const priceDistribuidor = parseInt(document.getElementById('product-price-distributor').value) || 0;
    const stock = parseInt(document.getElementById('product-stock').value) || 0;
    const image = document.getElementById('product-image').value.trim();
    const featured = document.getElementById('product-featured').checked;

    // Validaciones
    if (!name || !sku || !category) {
      alert('Por favor completa todos los campos obligatorios (Nombre, SKU, Categoría)');
      return;
    }

    if (pricePublico <= 0 || priceDistribuidor <= 0) {
      alert('Los precios deben ser mayores a cero');
      return;
    }

    if (priceDistribuidor >= pricePublico) {
      alert('El precio distribuidor debe ser menor al precio público');
      return;
    }

    const products = StorageAPI.getProducts();
    
    // Verificar SKU duplicado (excepto si estamos editando el mismo producto)
    const existingProduct = products.find(p => p.sku.toLowerCase() === sku.toLowerCase());
    if (existingProduct && existingProduct.id !== editingProductId) {
      alert('Este SKU ya está registrado');
      return;
    }

    if (editingProductId) {
      // Editar producto existente
      const productIndex = products.findIndex(p => p.id === editingProductId);
      if (productIndex !== -1) {
        products[productIndex] = {
          ...products[productIndex],
          name,
          sku,
          description,
          category,
          brand,
          pricePublico,
          priceDistribuidor,
          stock,
          image,
          featured,
          updatedAt: new Date().toISOString()
        };
      }
    } else {
      // Crear nuevo producto
      const id = 'p' + Math.random().toString(36).slice(2, 9);
      const newProduct = {
        id,
        owner: 'd1', // Asignar a distribuidor por defecto
        name,
        sku,
        description,
        category,
        brand,
        pricePublico,
        priceDistribuidor,
        stock,
        image,
        featured,
        sales: 0,
        createdAt: new Date().toISOString()
      };
      
      products.push(newProduct);
    }

    StorageAPI.setProducts(products);
    loadProducts();
    filterProducts();
    closeProductModal();
    alert(editingProductId ? 'Producto actualizado exitosamente' : 'Producto creado exitosamente');
  }

  /**
   * Cierra el modal de producto
   */
  function closeProductModal() {
    document.getElementById('product-modal').style.display = 'none';
    editingProductId = null;
  }

  /**
   * Cierra el modal de detalles del producto
   */
  function closeProductDetailsModal() {
    document.getElementById('product-details-modal').style.display = 'none';
  }

  /**
   * Actualiza el mensaje de bienvenida
   */
  function updateWelcomeMessage() {
    const session = StorageAPI.getSession();
    const welcomeEl = document.getElementById('admin-welcome');
    if (welcomeEl && session) {
      welcomeEl.textContent = `Bienvenido, ${session.name}`;
    }
  }

  // Hacer funciones globales para los botones
  window.toggleFeatured = toggleFeatured;
  window.deleteProduct = deleteProduct;
  window.editProduct = editProduct;
  window.viewProduct = viewProduct;
  window.saveProduct = saveProduct;
  window.closeProductModal = closeProductModal;
  window.closeProductDetailsModal = closeProductDetailsModal;

  // Inicialización cuando el DOM esté listo
  document.addEventListener('DOMContentLoaded', () => {
    // Verificar sesión de admin
    const session = StorageAPI.getSession();
    if (!session || session.role !== 'admin') {
      window.location.href = '../auth/login.html';
      return;
    }

    // Cargar categorías y productos
    categories = StorageAPI.getCategories();
    loadCategories();
    loadProducts();
    updateWelcomeMessage();
    
    // Inicializar botón de logout
    const logoutContainer = document.getElementById('logout-container');
    if (logoutContainer) {
      const logoutBtn = UI.createLogoutButton();
      logoutContainer.appendChild(logoutBtn);
    }
    
    // Event listeners
    document.getElementById('add-product-btn').addEventListener('click', addProduct);
    document.getElementById('product-search').addEventListener('input', filterProducts);
    document.getElementById('category-filter').addEventListener('change', filterProducts);
    document.getElementById('stock-filter').addEventListener('change', filterProducts);
    document.getElementById('featured-filter').addEventListener('change', filterProducts);

    // Cerrar modales al hacer clic fuera
    document.getElementById('product-modal').addEventListener('click', (e) => {
      if (e.target.id === 'product-modal') {
        closeProductModal();
      }
    });

    document.getElementById('product-details-modal').addEventListener('click', (e) => {
      if (e.target.id === 'product-details-modal') {
        closeProductDetailsModal();
      }
    });

    // Cerrar modales con tecla Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const productModal = document.getElementById('product-modal');
        const detailsModal = document.getElementById('product-details-modal');
        
        if (productModal && productModal.style.display === 'block') {
          closeProductModal();
        }
        if (detailsModal && detailsModal.style.display === 'block') {
          closeProductDetailsModal();
        }
      }
    });

    // Prevenir envío del formulario
    document.getElementById('product-form').addEventListener('submit', (e) => {
      e.preventDefault();
      saveProduct();
    });
  });
})();
