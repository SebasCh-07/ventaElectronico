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
   * Filtra productos por búsqueda, categoría y stock
   */
  function filterProducts() {
    const searchTerm = document.getElementById('product-search').value.toLowerCase().trim();
    const categoryFilter = document.getElementById('category-filter').value;
    const stockFilter = document.getElementById('stock-filter').value;
    
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
      
      return matchesSearch && matchesCategory && matchesStock;
    });

    renderProducts();
  }

  /**
   * Carga y actualiza la lista de productos
   */
  function loadProducts() {
    // Asegurar que los datos se carguen desde HBDATA
    StorageAPI.reloadFromHBDATA();
    
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
    document.getElementById('add-product-btn').addEventListener('click', () => openProductModal());
    document.getElementById('import-products-btn').addEventListener('click', () => openImportModal());
    document.getElementById('add-category-btn').addEventListener('click', () => openCategoryModal());

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

    document.getElementById('category-modal').addEventListener('click', (e) => {
      if (e.target.id === 'category-modal') {
        closeCategoryModal();
      }
    });

    // Cerrar modales con tecla Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeProductModal();
        closeProductDetailsModal();
        closeCategoryModal();
      }
    });
  });

  // === FUNCIONES DE CATEGORÍAS ===
  
  /**
   * Abre el modal para agregar/editar categoría
   */
  function openCategoryModal(categoryId = null) {
    const modal = document.getElementById('category-modal');
    const title = document.getElementById('category-modal-title');
    const form = document.getElementById('category-form');
    
    if (categoryId) {
      // Editar categoría existente
      const category = StorageAPI.getCategoryById(categoryId);
      if (category) {
        title.textContent = 'Editar Categoría';
        document.getElementById('category-name').value = category.name || '';
        document.getElementById('category-icon').value = category.icon || '';
        document.getElementById('category-description').value = category.description || '';
      }
    } else {
      // Nueva categoría
      title.textContent = 'Nueva Categoría';
      form.reset();
    }
    
    modal.style.display = 'block';
  }

  /**
   * Cierra el modal de categorías
   */
  function closeCategoryModal() {
    const modal = document.getElementById('category-modal');
    const form = document.getElementById('category-form');
    
    modal.style.display = 'none';
    form.reset();
  }

  /**
   * Guarda una nueva categoría o actualiza una existente
   */
  function saveCategory() {
    const name = document.getElementById('category-name').value.trim();
    const icon = document.getElementById('category-icon').value;
    const description = document.getElementById('category-description').value.trim();
    
    if (!name) {
      alert('Por favor ingresa el nombre de la categoría');
      return;
    }
    
    if (!icon) {
      alert('Por favor selecciona un icono para la categoría');
      return;
    }
    
    // Verificar si la categoría ya existe
    const existingCategories = StorageAPI.getCategories();
    const categoryExists = existingCategories.some(cat => 
      cat.name.toLowerCase() === name.toLowerCase()
    );
    
    if (categoryExists) {
      alert('Ya existe una categoría con ese nombre');
      return;
    }
    
    const categoryData = {
      id: 'cat' + Date.now(),
      name: name,
      icon: icon,
      description: description || ''
    };
    
    try {
      // Agregar la nueva categoría
      const categories = StorageAPI.getCategories();
      categories.push(categoryData);
      StorageAPI.setCategories(categories);
      
      // Actualizar los selects de categorías
      loadCategories();
      
      // Cerrar el modal
      closeCategoryModal();
      
      alert('✅ Categoría agregada exitosamente!');
      
    } catch (error) {
      console.error('Error al guardar la categoría:', error);
      alert('Error al guardar la categoría');
    }
  }

  // === FUNCIONES DE IMPORTACIÓN MASIVA ===
  
  /**
   * Abre el modal de importación masiva
   */
  function openImportModal() {
    const modal = document.getElementById('import-modal');
    const categorySelect = document.getElementById('import-category');
    
    // Cargar categorías
    loadCategoriesForImport();
    
    modal.style.display = 'block';
  }

  /**
   * Cierra el modal de importación masiva
   */
  function closeImportModal() {
    const modal = document.getElementById('import-modal');
    const fileInput = document.getElementById('excel-file');
    const previewSection = document.getElementById('preview-section');
    const previewBtn = document.getElementById('preview-btn');
    const importBtn = document.getElementById('import-btn');
    
    modal.style.display = 'none';
    fileInput.value = '';
    previewSection.style.display = 'none';
    previewBtn.style.display = 'none';
    importBtn.style.display = 'none';
    document.getElementById('preview-content').innerHTML = '';
    document.getElementById('total-products-count').textContent = '0';
  }

  /**
   * Carga las categorías en el select de importación
   */
  function loadCategoriesForImport() {
    const categorySelect = document.getElementById('import-category');
    const categories = StorageAPI.getCategories();
    
    categorySelect.innerHTML = '<option value="">Seleccionar categoría</option>';
    categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category.name;
      option.textContent = category.name;
      categorySelect.appendChild(option);
    });
  }

  /**
   * Muestra la vista previa de los productos del Excel
   */
  function previewProducts() {
    const fileInput = document.getElementById('excel-file');
    const categorySelect = document.getElementById('import-category');
    
    if (!fileInput.files[0]) {
      alert('Por favor selecciona un archivo Excel');
      return;
    }
    
    if (!categorySelect.value) {
      alert('Por favor selecciona una categoría');
      return;
    }
    
    const file = fileInput.files[0];
    const reader = new FileReader();
    
    reader.onload = function(e) {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        if (jsonData.length === 0) {
          alert('El archivo Excel está vacío');
          return;
        }
        
        // Validar y procesar los datos
        const processedProducts = processExcelData(jsonData, categorySelect.value);
        
        if (processedProducts.length === 0) {
          alert('No se encontraron productos válidos en el archivo Excel');
          return;
        }
        
        // Mostrar vista previa
        showProductsPreview(processedProducts);
        
        // Mostrar botones
        document.getElementById('preview-btn').style.display = 'none';
        document.getElementById('import-btn').style.display = 'inline-block';
        
      } catch (error) {
        console.error('Error al leer el archivo Excel:', error);
        alert('Error al leer el archivo Excel. Asegúrate de que tenga el formato correcto.');
      }
    };
    
    reader.readAsArrayBuffer(file);
  }

  /**
   * Procesa los datos del Excel y los convierte en productos
   */
  function processExcelData(excelData, category) {
    const products = [];
    const requiredFields = ['nombre', 'descripcion', 'precio_publico', 'precio_distribuidor', 'stock', 'sku', 'marca'];
    
    excelData.forEach((row, index) => {
      // Verificar que tenga los campos requeridos
      const hasRequiredFields = requiredFields.every(field => 
        row[field] !== undefined && row[field] !== null && row[field] !== ''
      );
      
      if (!hasRequiredFields) {
        console.warn(`Fila ${index + 2} omitida: faltan campos requeridos`);
        return;
      }
      
      // Crear el producto
      const product = {
        id: 'p' + Date.now() + '_' + index,
        owner: 'd1', // Por defecto al distribuidor principal
        name: String(row.nombre).trim(),
        description: String(row.descripcion).trim(),
        pricePublico: parseFloat(row.precio_publico) || 0,
        priceDistribuidor: parseFloat(row.precio_distribuidor) || 0,
        category: category,
        stock: parseInt(row.stock) || 0,
        image: '',
        sku: String(row.sku).trim(),
        brand: String(row.marca).trim(),
        featured: row.destacado === 'TRUE' || row.destacado === true || row.destacado === 1,
        sales: 0,
        createdAt: new Date().toISOString()
      };
      
      products.push(product);
    });
    
    return products;
  }

  /**
   * Muestra la vista previa de los productos
   */
  function showProductsPreview(products) {
    const previewContent = document.getElementById('preview-content');
    const totalCount = document.getElementById('total-products-count');
    
    totalCount.textContent = products.length;
    
    const previewHTML = products.map((product, index) => `
      <div style="border:1px solid #e5e7eb;border-radius:6px;padding:12px;margin-bottom:8px;background:#f9fafb;">
        <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:8px;">
          <div>
            <strong>${product.name}</strong>
            <span style="color:#6b7280;font-size:12px;margin-left:8px;">#${index + 1}</span>
          </div>
          <span style="background:#3b82f6;color:white;padding:2px 8px;border-radius:4px;font-size:12px;">
            ${product.category}
          </span>
        </div>
        <div style="font-size:14px;color:#6b7280;margin-bottom:8px;">
          ${product.description}
        </div>
        <div style="display:flex;gap:16px;font-size:14px;">
          <span><strong>SKU:</strong> ${product.sku}</span>
          <span><strong>Marca:</strong> ${product.brand}</span>
          <span><strong>Stock:</strong> ${product.stock}</span>
          <span><strong>Precio:</strong> $${product.pricePublico.toLocaleString()} COP</span>
          ${product.featured ? '<span style="color:#8b5cf6;"><strong>⭐ Destacado</strong></span>' : ''}
        </div>
      </div>
    `).join('');
    
    previewContent.innerHTML = previewHTML;
    document.getElementById('preview-section').style.display = 'block';
  }

  /**
   * Importa los productos a la plataforma
   */
  function importProducts() {
    const fileInput = document.getElementById('excel-file');
    const categorySelect = document.getElementById('import-category');
    
    if (!fileInput.files[0] || !categorySelect.value) {
      alert('Por favor completa todos los campos');
      return;
    }
    
    const file = fileInput.files[0];
    const reader = new FileReader();
    
    reader.onload = function(e) {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        const processedProducts = processExcelData(jsonData, categorySelect.value);
        
        if (processedProducts.length === 0) {
          alert('No se encontraron productos válidos para importar');
          return;
        }
        
        // Importar productos uno por uno
        let importedCount = 0;
        let errorCount = 0;
        
        processedProducts.forEach(product => {
          try {
            StorageAPI.addProduct(product);
            importedCount++;
          } catch (error) {
            console.error('Error al importar producto:', product.name, error);
            errorCount++;
          }
        });
        
        // Mostrar resultado
        if (importedCount > 0) {
          alert(`✅ Importación completada!\n\n📊 Resultados:\n• Productos importados: ${importedCount}\n• Errores: ${errorCount}\n\nLos productos han sido agregados a la plataforma.`);
          
          // Recargar la lista de productos
          loadProducts();
          closeImportModal();
        } else {
          alert('❌ No se pudo importar ningún producto. Verifica el formato del archivo Excel.');
        }
        
      } catch (error) {
        console.error('Error durante la importación:', error);
        alert('Error durante la importación. Verifica el formato del archivo Excel.');
      }
    };
    
    reader.readAsArrayBuffer(file);
  }

  /**
   * Maneja la selección de archivo Excel
   */
  function handleFileSelection() {
    const fileInput = document.getElementById('excel-file');
    const previewBtn = document.getElementById('preview-btn');
    
    if (fileInput.files[0]) {
      previewBtn.style.display = 'inline-block';
    } else {
      previewBtn.style.display = 'none';
    }
  }

  // Hacer las funciones disponibles globalmente
  window.openImportModal = openImportModal;
  window.closeImportModal = closeImportModal;
  window.previewProducts = previewProducts;
  window.importProducts = importProducts;
  window.handleFileSelection = handleFileSelection;
  window.openCategoryModal = openCategoryModal;
  window.closeCategoryModal = closeCategoryModal;
  window.saveCategory = saveCategory;

})();




