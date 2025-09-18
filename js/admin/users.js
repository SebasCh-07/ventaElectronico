(function(){
  function renderUsers(users = null){
    const allUsers = users || StorageAPI.getUsers();
    const container = document.getElementById('users-list');
    
    if(allUsers.length === 0){
      container.innerHTML = '<p style="color:#6b7280;text-align:center;padding:20px;">No hay usuarios registrados</p>';
      return;
    }
    
    container.innerHTML = allUsers.map(user => `
      <div style="display:flex;align-items:center;gap:16px;padding:16px;border:1px solid #e5e7eb;border-radius:8px;margin-bottom:12px;">
        <div style="width:48px;height:48px;background:#f3f4f6;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#6b7280;font-weight:600;font-size:18px;">
          ${user.name.charAt(0).toUpperCase()}
        </div>
        <div style="flex:1;">
          <div style="font-weight:600;color:#374151;margin-bottom:4px;">${user.name}</div>
          <div style="color:#6b7280;font-size:14px;margin-bottom:2px;">${user.email}</div>
          <div style="color:#6b7280;font-size:12px;text-transform:capitalize;">${user.role}</div>
        </div>
        <div style="display:flex;align-items:center;gap:8px;">
          <span style="padding:4px 8px;border-radius:4px;font-size:12px;font-weight:500;text-transform:capitalize;${user.active !== false ? 'background:#dcfce7;color:#166534;' : 'background:#fef2f2;color:#dc2626;'}">
            ${user.active !== false ? 'Activo' : 'Inactivo'}
          </span>
          <button class="btn" onclick="toggleUser('${user.id}')" style="padding:6px 12px;font-size:12px;">
            ${user.active !== false ? 'Desactivar' : 'Activar'}
          </button>
          <button class="btn" onclick="deleteUser('${user.id}')" style="padding:6px 12px;font-size:12px;background:#ef4444;border-color:#dc2626;color:white;">
            Eliminar
          </button>
        </div>
      </div>
    `).join('');
  }

  function searchUsers(){
    const searchInput = document.getElementById('user-search');
    const allUsers = StorageAPI.getUsers();
    const query = searchInput.value.toLowerCase().trim();
    
    if(query === ''){
      renderUsers(allUsers);
      return;
    }
    
    const filteredUsers = allUsers.filter(user => 
      user.name.toLowerCase().includes(query) || 
      user.email.toLowerCase().includes(query) ||
      user.role.toLowerCase().includes(query)
    );
    
    renderUsers(filteredUsers);
  }

  function toggleUser(userId){
    const users = StorageAPI.getUsers();
    const user = users.find(u => u.id === userId);
    if(!user) return;
    
    user.active = user.active === false ? true : false;
    StorageAPI.setUsers(users);
    renderUsers();
  }

  function deleteUser(userId){
    if(!confirm('¿Estás seguro de que quieres eliminar este usuario?')) return;
    
    const users = StorageAPI.getUsers();
    const filteredUsers = users.filter(u => u.id !== userId);
    StorageAPI.setUsers(filteredUsers);
    renderUsers();
  }

  function addUser(){
    const name = prompt('Nombre del usuario:');
    if(!name) return;
    
    const email = prompt('Correo electrónico:');
    if(!email) return;
    
    const password = prompt('Contraseña:');
    if(!password) return;
    
    const role = prompt('Rol (admin/distributor/client):');
    if(!['admin', 'distributor', 'client'].includes(role)) return;
    
    const users = StorageAPI.getUsers();
    const id = 'u' + Math.random().toString(36).slice(2,9);
    const newUser = { id, role, name, email, password, active: true };
    
    if(role === 'distributor'){
      const whatsapp = prompt('WhatsApp (opcional):');
      newUser.whatsapp = whatsapp || '';
    }
    
    users.push(newUser);
    StorageAPI.setUsers(users);
    renderUsers();
    alert('Usuario creado exitosamente');
  }

  function updateWelcomeMessage(){
    const session = StorageAPI.getSession();
    const welcomeEl = document.getElementById('admin-welcome');
    if(welcomeEl && session){
      welcomeEl.textContent = `Bienvenido, ${session.name}`;
    }
  }

  // Hacer funciones globales para los botones
  window.toggleUser = toggleUser;
  window.deleteUser = deleteUser;

  document.addEventListener('DOMContentLoaded', ()=>{
    renderUsers();
    updateWelcomeMessage();
    
    // Inicializar botón de logout
    const logoutContainer = document.getElementById('logout-container');
    if(logoutContainer){
      const logoutBtn = UI.createLogoutButton();
      logoutContainer.appendChild(logoutBtn);
    }
    
    document.getElementById('add-user-btn').addEventListener('click', addUser);
    document.getElementById('user-search').addEventListener('input', searchUsers);
  });
})();
