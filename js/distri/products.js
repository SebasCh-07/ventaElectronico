(function(){
  function renderProducts(products = null){
    const allProducts = products || StorageAPI.getProducts();
    const container = document.getElementById('products-list');
    
    if(allProducts.length === 0){
      container.innerHTML = '<p style="color:#6b7280;text-align:center;padding:20px;">No tienes productos registrados</p>';
      return;
    }
    
    container.innerHTML = allProducts.map(product => `
      <div style="display:flex;align-items:center;gap:16px;padding:16px;border:1px solid #e5e7eb;border-radius:8px;margin-bottom:12px;background:#f9fafb;">
        <div style="width:60px;height:60px;background:#3b82f6;border-radius:8px;display:flex;align-items:center;justify-content:center;color:white;font-weight:600;font-size:18px;">
          ${product.name.charAt(0).toUpperCase()}
        </div>
        <div style="flex:1;">
          <div style="font-weight:600;color:#374151;margin-bottom:4px;">${product.name}</div>
          <div style="color:#6b7280;font-size:14px;margin-bottom:2px;">${product.category || 'Sin categoría'}</div>
          <div style="color:#6b7280;font-size:12px;">${product.description || 'Sin descripción'}</div>
        </div>
        <div style="text-align:right;">
          <div style="font-weight:600;color:#374151;margin-bottom:4px;">${UI.formatPrice(product.price)}</div>
          <div style="color:#6b7280;font-size:12px;">Stock: ${product.stock}</div>
        </div>
        <div style="display:flex;align-items:center;gap:8px;">
          <button class="btn" onclick="editProduct('${product.id}')" style="padding:6px 12px;font-size:12px;">
            Editar
          </button>
          <button class="btn" onclick="deleteProduct('${product.id}')" style="padding:6px 12px;font-size:12px;background:#ef4444;border-color:#dc2626;color:white;">
            Eliminar
          </button>
        </div>
      </div>
    `).join('');
  }

  function searchProducts(){
    const searchInput = document.getElementById('product-search');
    const allProducts = StorageAPI.getProducts();
    const query = searchInput.value.toLowerCase().trim();
    
    if(query === ''){
      renderProducts(allProducts);
      return;
    }
    
    const filteredProducts = allProducts.filter(product => 
      product.name.toLowerCase().includes(query) || 
      (product.description && product.description.toLowerCase().includes(query)) ||
      (product.category && product.category.toLowerCase().includes(query))
    );
    
    renderProducts(filteredProducts);
  }

  function editProduct(productId){
    const products = StorageAPI.getProducts();
    const product = products.find(p => p.id === productId);
    if(!product) return;
    
    const name = prompt('Nombre del producto:', product.name);
    if(!name) return;
    
    const price = prompt('Precio:', product.price);
    if(!price || isNaN(price)) return;
    
    const stock = prompt('Stock:', product.stock);
    if(!stock || isNaN(stock)) return;
    
    const category = prompt('Categoría:', product.category || '');
    const description = prompt('Descripción:', product.description || '');
    
    product.name = name;
    product.price = parseFloat(price);
    product.stock = parseInt(stock);
    product.category = category;
    product.description = description;
    
    StorageAPI.setProducts(products);
    renderProducts();
    alert('Producto actualizado exitosamente');
  }

  function deleteProduct(productId){
    if(!confirm('¿Estás seguro de que quieres eliminar este producto?')) return;
    
    const products = StorageAPI.getProducts();
    const filteredProducts = products.filter(p => p.id !== productId);
    StorageAPI.setProducts(filteredProducts);
    renderProducts();
  }

  function updateWelcomeMessage(){
    const session = StorageAPI.getSession();
    const welcomeEl = document.getElementById('distri-welcome');
    if(welcomeEl && session){
      welcomeEl.textContent = `Bienvenido, ${session.name}`;
    }
  }

  // Hacer funciones globales para los botones
  window.editProduct = editProduct;
  window.deleteProduct = deleteProduct;

  document.addEventListener('DOMContentLoaded', ()=>{
    renderProducts();
    updateWelcomeMessage();
    
    document.getElementById('product-search').addEventListener('input', searchProducts);
  });
})();
