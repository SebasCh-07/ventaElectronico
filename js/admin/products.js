/**
 * Sistema de gestión de productos para Administradores - H&B Importaciones
 * Permite ver, crear, editar, eliminar y gestionar productos del sistema
 */
(function(){
  'use strict';

  let allProducts = [];
  let filteredProducts = [];
  let currentProduct = null;
  let isEditing = false;

  /**
   * Estados de stock
   */
  const STOCK_STATUS = {
    'in-stock': { label: 'En Stock', color: '#059669', bg: '#d1fae5' },
    'low-stock': { label: 'Stock Bajo', color: '#f59e0b', bg: '#fef3c7' },
    'out-of-stock': { label: 'Sin Stock', color: '#dc2626', bg: '#fee2e2' }
  };

  /**
   * Renderiza la lista de productos
   */
  function renderProducts(products = null) {
    const productsToRender = products || filteredProducts;
    const container = document.getElementById('products-list');
    
    if (productsToRender.length === 0) {
      container.innerHTML = `
        <div style="text-align:center;padding:40px;color:#6b7280;">
          <span data-icon="package" style="width:48px;height:48px;display:block;margin:0 auto 16px;color:#d1d5db;"></span>
          <h3>No hay productos que mostrar</h3>
          <p>Agrega tu primer producto para comenzar</p>
          <button class="btn brand" onclick="openProductModal()" style="margin-top:16px;">
            <span data-icon="plus" style="width:16px;height:16px;margin-right:6px;"></span>
            Agregar Producto
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = productsToRender.map(product => {
      const stockStatus = getStockStatus(product.stock);
      const discount = product.pricePublico && product.priceDistribuidor ? 
        Math.round(((product.pricePublico - product.priceDistribuidor) / product.pricePublico) * 100) : 0;
      
      return `
        <div class="product-item" style="display:flex;align-items:center;gap:16px;padding:16px;border:1px solid #e5e7eb;border-radius:8px;margin-bottom:12px;background:white;">
          <div style="width:80px;height:80px;background:#f8fafc;border-radius:8px;display:flex;align-items:center;justify-content:center;overflow:hidden;border:1px solid #e5e7eb;">
            ${product.image ? 
              `<img src="${product.image}" alt="${product.name}" style="width:100%;height:100%;object-fit:cover;">` :
              `<span data-icon="package" style="width:32px;height:32px;color:#6b7280;"></span>`
            }
          </div>
          <div style="flex:1;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
              <div style="font-weight:600;color:#374151;font-size:16px;">${product.name}</div>
              ${product.featured ? '<span style="background:#8b5cf6;color:white;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:500;">DESTACADO</span>' : ''}
              ${discount > 0 ? `<span style="background:#ef4444;color:white;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:500;">-${discount}%</span>` : ''}
            </div>
            <div style="color:#6b7280;font-size:14px;margin-bottom:2px;">
              ${product.brand || 'Sin marca'} • ${product.category || 'Sin categoría'} • SKU: ${product.sku || product.id}
            </div>
            <div style="display:flex;align-items:center;gap:16px;font-size:14px;">
              <div style="display:flex;gap:8px;">
                <span style="color:#6b7280;">Público:</span>
                <span style="font-weight:600;color:#374151;">${UI.formatPrice(product.pricePublico || product.price || 0)}</span>
              </div>
              <div style="display:flex;gap:8px;">
                <span style="color:#6b7280;">Distribuidor:</span>
                <span style="font-weight:600;color:#3b82f6;">${UI.formatPrice(product.priceDistribuidor || product.price || 0)}</span>
              </div>
              <div style="display:flex;gap:8px;">
                <span style="color:#6b7280;">Stock:</span>
                <span style="font-weight:600;color:${stockStatus.color};">${product.stock || 0}</span>
              </div>
            </div>
          </div>
          <div style="text-align:right;">
            <div style="display:flex;gap:8px;margin-bottom:8px;">
              <span style="padding:4px 8px;border-radius:4px;font-size:12px;font-weight:500;background:${stockStatus.bg};color:${stockStatus.color};">
                ${stockStatus.label}
              </span>
            </div>
            <div style="display:flex;gap:8px;">
              <button class="btn" onclick="viewProduct('${product.id}')" style="padding:6px 12px;font-size:12px;">
                <span data-icon="eye" style="width:14px;height:14px;margin-right:4px;"></span>
                Ver
              </button>
              <button class="btn secondary" onclick="editProduct('${product.id}')" style="padding:6px 12px;font-size:12px;">
                <span data-icon="edit" style="width:14px;height:14px;margin-right:4px;"></span>
                Editar
              </button>
              <button class="btn" onclick="deleteProduct('${product.id}')" style="padding:6px 12px;font-size:12px;background:#dc2626;color:white;border:none;">
                <span data-icon="trash-2" style="width:14px;height:14px;margin-right:4px;"></span>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  /**
   * Obtiene el estado del stock
   */
  function getStockStatus(stock) {
    if (stock <= 0) return STOCK_STATUS['out-of-stock'];
    if (stock <= 5) return STOCK_STATUS['low-stock'];
    return STOCK_STATUS['in-stock'];
  }

  /**
   * Renderiza las estadísticas de productos
   */
  function renderStats() {
    const totalProducts = allProducts.length;
    const inStockCount = allProducts.filter(p => p.stock > 5).length;
    const lowStockCount = allProducts.filter(p => p.stock > 0 && p.stock <= 5).length;
    const featuredCount = allProducts.filter(p => p.featured).length;

    document.getElementById('total-products-count').textContent = totalProducts;
    document.getElementById('in-stock-count').textContent = inStockCount;
    document.getElementById('low-stock-count').textContent = lowStockCount;
    document.getElementById('featured-count').textContent = featuredCount;
  }

  /**
   * Carga las categorías en el filtro
   */
  function loadCategories() {
    const categories = [...new Set(allProducts.map(p => p.category).filter(Boolean))];
    const categorySelect = document.getElementById('category-filter');
    const productCategorySelect = document.getElementById('product-category');
    
    const categoryOptions = categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
    
    if (categorySelect) {
      categorySelect.innerHTML = '<option value="">Todas las categorías</option>' + categoryOptions;
    }
    
    if (productCategorySelect) {
      productCategorySelect.innerHTML = '<option value="">Seleccionar categoría</option>' + categoryOptions;
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
        product.sku?.toLowerCase().includes(searchTerm) ||
        product.brand?.toLowerCase().includes(searchTerm) ||
        product.id.toLowerCase().includes(searchTerm);
      
      const matchesCategory = !categoryFilter || product.category === categoryFilter;
      
      let matchesStock = true;
      if (stockFilter) {
        switch (stockFilter) {
          case 'in-stock':
            matchesStock = product.stock > 5;
            break;
          case 'low-stock':
            matchesStock = product.stock > 0 && product.stock <= 5;
            break;
          case 'out-of-stock':
            matchesStock = product.stock <= 0;
            break;
        }
      }
      
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
    allProducts = StorageAPI.getProducts().sort((a, b) => 
      new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    );
    filteredProducts = [...allProducts];
    filterProducts();
    renderStats();
    loadCategories();
  }

  /**
   * Abre el modal para crear/editar producto
   */
  function openProductModal(productId = null) {
    isEditing = !!productId;
    currentProduct = productId ? allProducts.find(p => p.id === productId) : null;
    
    const modal = document.getElementById('product-modal');
    const title = document.getElementById('product-modal-title');
    const form = document.getElementById('product-form');
    
    if (isEditing && currentProduct) {
      title.textContent = 'Editar Producto';
      populateForm(currentProduct);
    } else {
      title.textContent = 'Nuevo Producto';
      form.reset();
    }
    
    modal.style.display = 'block';
  }

  /**
   * Cierra el modal de producto
   */
  function closeProductModal() {
    document.getElementById('product-modal').style.display = 'none';
    currentProduct = null;
    isEditing = false;
  }

  /**
   * Pobla el formulario con datos del producto
   */
  function populateForm(product) {
    document.getElementById('product-name').value = product.name || '';
    document.getElementById('product-sku').value = product.sku || product.id || '';
    document.getElementById('product-description').value = product.description || '';
    document.getElementById('product-category').value = product.category || '';
    document.getElementById('product-brand').value = product.brand || '';
    document.getElementById('product-price-public').value = product.pricePublico || product.price || '';
    document.getElementById('product-price-distributor').value = product.priceDistribuidor || product.price || '';
    document.getElementById('product-stock').value = product.stock || '';
    document.getElementById('product-image').value = product.image || '';
    document.getElementById('product-featured').checked = product.featured || false;
  }

  /**
   * Guarda el producto
   */
  function saveProduct() {
    const form = document.getElementById('product-form');
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const productData = {
      name: document.getElementById('product-name').value.trim(),
      sku: document.getElementById('product-sku').value.trim(),
      description: document.getElementById('product-description').value.trim(),
      category: document.getElementById('product-category').value,
      brand: document.getElementById('product-brand').value.trim(),
      pricePublico: parseFloat(document.getElementById('product-price-public').value) || 0,
      priceDistribuidor: parseFloat(document.getElementById('product-price-distributor').value) || 0,
      price: parseFloat(document.getElementById('product-price-public').value) || 0, // Fallback
      stock: parseInt(document.getElementById('product-stock').value) || 0,
      image: document.getElementById('product-image').value.trim(),
      featured: document.getElementById('product-featured').checked,
      updatedAt: new Date().toISOString()
    };

    if (isEditing && currentProduct) {
      // Actualizar producto existente
      const updatedProduct = { ...currentProduct, ...productData };
      StorageAPI.updateProduct(updatedProduct);
      alert('Producto actualizado correctamente');
    } else {
      // Crear nuevo producto
      const newProduct = {
        id: 'prod_' + Date.now(),
        ...productData,
        createdAt: new Date().toISOString()
      };
      StorageAPI.addProduct(newProduct);
      alert('Producto creado correctamente');
    }

    closeProductModal();
    loadProducts();
  }

  /**
   * Muestra los detalles de un producto
   */
  function viewProduct(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;

    const stockStatus = getStockStatus(product.stock);
    const discount = product.pricePublico && product.priceDistribuidor ? 
      Math.round(((product.pricePublico - product.priceDistribuidor) / product.pricePublico) * 100) : 0;

    const modalBody = document.getElementById('product-details-body');
    modalBody.innerHTML = `
      <div style="margin-bottom: 20px;">
        <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
          <div style="width: 80px; height: 80px; background: #f8fafc; border-radius: 8px; display: flex; align-items: center; justify-content: center; overflow: hidden; border: 1px solid #e5e7eb;">
            ${product.image ? 
              `<img src="${product.image}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover;">` :
              `<span data-icon="package" style="width: 32px; height: 32px; color: #6b7280;"></span>`
            }
          </div>
          <div>
            <h3 style="margin: 0; color: #1e293b; font-size: 20px;">${product.name}</h3>
            <div style="display: flex; gap: 8px; margin-top: 4px;">
              ${product.featured ? '<span style="background: #8b5cf6; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 500;">DESTACADO</span>' : ''}
              ${discount > 0 ? `<span style="background: #ef4444; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 500;">-${discount}%</span>` : ''}
              <span style="padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; background: ${stockStatus.bg}; color: ${stockStatus.color};">
                ${stockStatus.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
        <div>
          <label style="font-weight: 600; color: #6b7280; font-size: 12px; text-transform: uppercase;">SKU</label>
          <div style="color: #1e293b; margin-top: 4px;">${product.sku || product.id}</div>
        </div>
        <div>
          <label style="font-weight: 600; color: #6b7280; font-size: 12px; text-transform: uppercase;">Categoría</label>
          <div style="color: #1e293b; margin-top: 4px;">${product.category || 'Sin categoría'}</div>
        </div>
        <div>
          <label style="font-weight: 600; color: #6b7280; font-size: 12px; text-transform: uppercase;">Marca</label>
          <div style="color: #1e293b; margin-top: 4px;">${product.brand || 'Sin marca'}</div>
        </div>
        <div>
          <label style="font-weight: 600; color: #6b7280; font-size: 12px; text-transform: uppercase;">Stock</label>
          <div style="color: ${stockStatus.color}; margin-top: 4px; font-weight: 600;">${product.stock || 0} unidades</div>
        </div>
      </div>

      <div style="margin-bottom: 20px;">
        <label style="font-weight: 600; color: #6b7280; font-size: 12px; text-transform: uppercase; margin-bottom: 8px; display: block;">Descripción</label>
        <div style="color: #1e293b; padding: 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #e5e7eb;">
          ${product.description || 'Sin descripción'}
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
        <div>
          <label style="font-weight: 600; color: #6b7280; font-size: 12px; text-transform: uppercase;">Precio Público</label>
          <div style="color: #1e293b; margin-top: 4px; font-size: 18px; font-weight: 700;">${UI.formatPrice(product.pricePublico || product.price || 0)}</div>
        </div>
        <div>
          <label style="font-weight: 600; color: #6b7280; font-size: 12px; text-transform: uppercase;">Precio Distribuidor</label>
          <div style="color: #3b82f6; margin-top: 4px; font-size: 18px; font-weight: 700;">${UI.formatPrice(product.priceDistribuidor || product.price || 0)}</div>
        </div>
      </div>

      ${product.image ? `
        <div style="margin-bottom: 20px;">
          <label style="font-weight: 600; color: #6b7280; font-size: 12px; text-transform: uppercase; margin-bottom: 8px; display: block;">Imagen</label>
          <div style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
            <img src="${product.image}" alt="${product.name}" style="width: 100%; height: 200px; object-fit: cover;">
          </div>
        </div>
      ` : ''}

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; font-size: 12px; color: #6b7280;">
        <div>
          <label style="font-weight: 600; color: #6b7280; font-size: 12px; text-transform: uppercase;">Creado</label>
          <div style="color: #1e293b;">${product.createdAt ? new Date(product.createdAt).toLocaleDateString('es-CO') : 'N/A'}</div>
        </div>
        <div>
          <label style="font-weight: 600; color: #6b7280; font-size: 12px; text-transform: uppercase;">Actualizado</label>
          <div style="color: #1e293b;">${product.updatedAt ? new Date(product.updatedAt).toLocaleDateString('es-CO') : 'N/A'}</div>
        </div>
      </div>
    `;

    document.getElementById('product-details-modal').style.display = 'block';
  }

  /**
   * Cierra el modal de detalles del producto
   */
  function closeProductDetailsModal() {
    document.getElementById('product-details-modal').style.display = 'none';
  }

  /**
   * Edita un producto
   */
  function editProduct(productId) {
    openProductModal(productId);
  }

  /**
   * Elimina un producto
   */
  function deleteProduct(productId) {
    if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      StorageAPI.deleteProduct(productId);
      alert('Producto eliminado correctamente');
      loadProducts();
    }
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
  window.openProductModal = openProductModal;
  window.closeProductModal = closeProductModal;
  window.saveProduct = saveProduct;
  window.viewProduct = viewProduct;
  window.editProduct = editProduct;
  window.deleteProduct = deleteProduct;
  window.closeProductDetailsModal = closeProductDetailsModal;

  // Inicialización cuando el DOM esté listo
  document.addEventListener('DOMContentLoaded', () => {
    // Verificar sesión de administrador
    const session = StorageAPI.getSession();
    if (!session || session.role !== 'admin') {
      window.location.href = '../auth/login.html';
      return;
    }

    // Cargar productos iniciales
    loadProducts();
    updateWelcomeMessage();
    
    // Inicializar botón de logout
    const logoutContainer = document.getElementById('logout-container');
    if (logoutContainer) {
      const logoutBtn = UI.createLogoutButton();
      logoutContainer.appendChild(logoutBtn);
    }
    
    // Event listeners
    document.getElementById('product-search').addEventListener('input', filterProducts);
    document.getElementById('category-filter').addEventListener('change', filterProducts);
    document.getElementById('stock-filter').addEventListener('change', filterProducts);
    document.getElementById('featured-filter').addEventListener('change', filterProducts);
    document.getElementById('add-product-btn').addEventListener('click', () => openProductModal());

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
        closeProductModal();
        closeProductDetailsModal();
      }
    });
  });
})();




