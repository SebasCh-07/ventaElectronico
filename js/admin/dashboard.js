(function(){
  function updateStats(){
    const users = StorageAPI.getUsers();
    const products = StorageAPI.getProducts();
    
    // Contar usuarios activos
    const activeUsers = users.filter(u => u.active !== false).length;
    document.getElementById('total-users').textContent = activeUsers;
    
    // Contar productos
    document.getElementById('total-products').textContent = products.length;
    
    // Simular pedidos pendientes (por ahora 0, se puede implementar después)
    document.getElementById('pending-orders').textContent = '0';
  }

  function renderRecentUsers(){
    const users = StorageAPI.getUsers().filter(u => u.active !== false).slice(-5);
    const container = document.getElementById('recent-users');
    
    if(users.length === 0){
      container.innerHTML = '<p style="color:#6b7280;text-align:center;padding:20px;">No hay usuarios registrados</p>';
      return;
    }
    
    container.innerHTML = users.map(user => `
      <div style="display:flex;align-items:center;gap:12px;padding:12px;border:1px solid #e5e7eb;border-radius:8px;margin-bottom:8px;background:#f9fafb;">
        <div style="width:40px;height:40px;background:#3b82f6;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-weight:600;">
          ${user.name.charAt(0).toUpperCase()}
        </div>
        <div style="flex:1;">
          <div style="font-weight:600;color:#374151;">${user.name}</div>
          <div style="color:#6b7280;font-size:14px;">${user.email}</div>
        </div>
        <div style="color:#6b7280;font-size:12px;text-transform:capitalize;padding:4px 8px;background:#e5e7eb;border-radius:4px;">${user.role}</div>
      </div>
    `).join('');
  }

  function renderLowStockProducts(){
    const products = StorageAPI.getProducts().filter(p => p.stock <= 5 && p.stock > 0);
    const container = document.getElementById('low-stock-products');
    
    if(products.length === 0){
      container.innerHTML = '<p style="color:#6b7280;text-align:center;padding:20px;">Todos los productos tienen stock suficiente</p>';
      return;
    }
    
    container.innerHTML = products.map(product => `
      <div style="display:flex;align-items:center;gap:12px;padding:12px;border:1px solid #fef3c7;background:#fffbeb;border-radius:8px;margin-bottom:8px;">
        <div style="width:40px;height:40px;background:#f59e0b;border-radius:8px;display:flex;align-items:center;justify-content:center;color:white;font-weight:600;">
          ${product.name.charAt(0).toUpperCase()}
        </div>
        <div style="flex:1;">
          <div style="font-weight:600;color:#374151;">${product.name}</div>
          <div style="color:#6b7280;font-size:14px;">${product.category || 'Sin categoría'}</div>
        </div>
        <div style="color:#f59e0b;font-weight:600;font-size:14px;padding:4px 8px;background:#fef3c7;border-radius:4px;">Stock: ${product.stock}</div>
      </div>
    `).join('');
  }

  function updateWelcomeMessage(){
    const session = StorageAPI.getSession();
    const welcomeEl = document.getElementById('admin-welcome');
    if(welcomeEl && session){
      welcomeEl.textContent = `Bienvenido, ${session.name}`;
    }
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    updateStats();
    renderRecentUsers();
    renderLowStockProducts();
    updateWelcomeMessage();
    
    // Inicializar botón de logout
    const logoutContainer = document.getElementById('logout-container');
    if(logoutContainer){
      const logoutBtn = UI.createLogoutButton();
      logoutContainer.appendChild(logoutBtn);
    }
  });
})();
