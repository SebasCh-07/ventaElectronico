/**
 * Sistema de gestión de usuarios para H&B Importaciones - Panel Admin
 * Permite ver, filtrar, buscar, crear, editar y gestionar usuarios
 */
(function(){
  'use strict';

  let allUsers = [];
  let filteredUsers = [];
  let editingUserId = null;

  /**
   * Colores por rol de usuario
   */
  const ROLE_COLORS = {
    admin: { bg: '#fef3c7', color: '#92400e' },
    distributor: { bg: '#dbeafe', color: '#1e40af' },
    client: { bg: '#e5e7eb', color: '#374151' }
  };

  /**
   * Renderiza la lista de usuarios
   */
  function renderUsers(users = null) {
    const usersToRender = users || filteredUsers;
    const container = document.getElementById('users-list');
    
    if (usersToRender.length === 0) {
      container.innerHTML = '<p style="color:#6b7280;text-align:center;padding:40px;">No hay usuarios que mostrar</p>';
      return;
    }
    
    container.innerHTML = usersToRender.map(user => {
      const roleColor = ROLE_COLORS[user.role] || ROLE_COLORS.client;
      const createdDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString('es-CO') : 'N/A';
      
      return `
        <div style="display:flex;align-items:center;gap:16px;padding:16px;border:1px solid #e5e7eb;border-radius:8px;margin-bottom:12px;background:white;">
          <div style="width:48px;height:48px;background:#f3f4f6;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#6b7280;font-weight:600;font-size:18px;">
            ${user.name.charAt(0).toUpperCase()}
          </div>
          <div style="flex:1;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
              <div style="font-weight:600;color:#374151;">${user.name}</div>
              <span style="padding:4px 8px;border-radius:4px;font-size:12px;font-weight:500;text-transform:capitalize;background:${roleColor.bg};color:${roleColor.color};">
                ${getRoleDisplayName(user.role)}
              </span>
            </div>
            <div style="color:#6b7280;font-size:14px;margin-bottom:2px;">${user.email}</div>
            <div style="color:#6b7280;font-size:12px;">
              Registrado: ${createdDate}
              ${user.whatsapp ? ` • WhatsApp: ${user.whatsapp}` : ''}
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:8px;">
            <span style="padding:4px 8px;border-radius:4px;font-size:12px;font-weight:500;text-transform:capitalize;${user.active !== false ? 'background:#dcfce7;color:#166534;' : 'background:#fef2f2;color:#dc2626;'}">
              ${user.active !== false ? 'Activo' : 'Inactivo'}
            </span>
            <button class="btn" onclick="editUser('${user.id}')" style="padding:6px 12px;font-size:12px;">
              Editar
            </button>
            <button class="btn" onclick="toggleUser('${user.id}')" style="padding:6px 12px;font-size:12px;">
              ${user.active !== false ? 'Desactivar' : 'Activar'}
            </button>
            <button class="btn" onclick="deleteUser('${user.id}')" style="padding:6px 12px;font-size:12px;background:#ef4444;border-color:#dc2626;color:white;">
              Eliminar
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  /**
   * Obtiene el nombre de visualización del rol
   */
  function getRoleDisplayName(role) {
    const roleNames = {
      admin: 'Administrador',
      distributor: 'Distribuidor', 
      client: 'Cliente'
    };
    return roleNames[role] || role;
  }

  /**
   * Renderiza las estadísticas de usuarios
   */
  function renderStats() {
    const totalUsers = allUsers.length;
    const activeUsers = allUsers.filter(u => u.active !== false).length;
    const clients = allUsers.filter(u => u.role === 'client').length;
    const distributors = allUsers.filter(u => u.role === 'distributor').length;

    document.getElementById('total-users-count').textContent = totalUsers;
    document.getElementById('active-users-count').textContent = activeUsers;
    document.getElementById('clients-count').textContent = clients;
    document.getElementById('distributors-count').textContent = distributors;
  }

  /**
   * Filtra usuarios por búsqueda, rol y estado
   */
  function filterUsers() {
    const searchTerm = document.getElementById('user-search').value.toLowerCase().trim();
    const roleFilter = document.getElementById('role-filter').value;
    const statusFilter = document.getElementById('status-filter').value;
    
    filteredUsers = allUsers.filter(user => {
      const matchesSearch = !searchTerm || 
        user.name.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm) ||
        user.role.toLowerCase().includes(searchTerm);
      
      const matchesRole = !roleFilter || user.role === roleFilter;
      
      const matchesStatus = !statusFilter || 
        (statusFilter === 'active' && user.active !== false) ||
        (statusFilter === 'inactive' && user.active === false);
      
      return matchesSearch && matchesRole && matchesStatus;
    });

    renderUsers();
  }

  /**
   * Carga y actualiza la lista de usuarios
   */
  function loadUsers() {
    allUsers = StorageAPI.getUsers().sort((a, b) => {
      const dateA = new Date(a.createdAt || '2024-01-01');
      const dateB = new Date(b.createdAt || '2024-01-01');
      return dateB - dateA;
    });
    filteredUsers = [...allUsers];
    renderUsers();
    renderStats();
  }

  /**
   * Activa/desactiva un usuario
   */
  function toggleUser(userId) {
    const users = StorageAPI.getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    user.active = user.active === false ? true : false;
    StorageAPI.setUsers(users);
    loadUsers();
    filterUsers();
    alert(`Usuario ${user.active ? 'activado' : 'desactivado'} exitosamente`);
  }

  /**
   * Elimina un usuario
   */
  function deleteUser(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;
    
    if (!confirm(`¿Estás seguro de que quieres eliminar al usuario "${user.name}"?`)) return;
    
    const users = StorageAPI.getUsers();
    const updatedUsers = users.filter(u => u.id !== userId);
    StorageAPI.setUsers(updatedUsers);
    loadUsers();
    filterUsers();
    alert('Usuario eliminado exitosamente');
  }

  /**
   * Abre el modal para crear un nuevo usuario
   */
  function addUser() {
    editingUserId = null;
    document.getElementById('user-modal-title').textContent = 'Nuevo Usuario';
    clearUserForm();
    document.getElementById('user-modal').style.display = 'flex';
  }

  /**
   * Abre el modal para editar un usuario existente
   */
  function editUser(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;
    
    editingUserId = userId;
    document.getElementById('user-modal-title').textContent = 'Editar Usuario';
    fillUserForm(user);
    document.getElementById('user-modal').style.display = 'flex';
  }

  /**
   * Limpia el formulario de usuario
   */
  function clearUserForm() {
    document.getElementById('user-name').value = '';
    document.getElementById('user-email').value = '';
    document.getElementById('user-password').value = '';
    document.getElementById('user-role').value = '';
    document.getElementById('user-whatsapp').value = '';
    document.getElementById('user-active').checked = true;
    document.getElementById('whatsapp-field').style.display = 'none';
  }

  /**
   * Llena el formulario con datos del usuario
   */
  function fillUserForm(user) {
    document.getElementById('user-name').value = user.name || '';
    document.getElementById('user-email').value = user.email || '';
    document.getElementById('user-password').value = user.password || '';
    document.getElementById('user-role').value = user.role || '';
    document.getElementById('user-whatsapp').value = user.whatsapp || '';
    document.getElementById('user-active').checked = user.active !== false;
    
    // Mostrar campo WhatsApp si es distribuidor
    const isDistributor = user.role === 'distributor';
    document.getElementById('whatsapp-field').style.display = isDistributor ? 'block' : 'none';
  }

  /**
   * Guarda el usuario (crear o editar)
   */
  function saveUser() {
    const name = document.getElementById('user-name').value.trim();
    const email = document.getElementById('user-email').value.trim().toLowerCase();
    const password = document.getElementById('user-password').value;
    const role = document.getElementById('user-role').value;
    const whatsapp = document.getElementById('user-whatsapp').value.trim();
    const active = document.getElementById('user-active').checked;

    // Validaciones
    if (!name || !email || !password || !role) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    if (!['admin', 'distributor', 'client'].includes(role)) {
      alert('Rol inválido');
      return;
    }

    const users = StorageAPI.getUsers();
    
    // Verificar email duplicado (excepto si estamos editando el mismo usuario)
    const existingUser = users.find(u => u.email.toLowerCase() === email);
    if (existingUser && existingUser.id !== editingUserId) {
      alert('Este correo electrónico ya está registrado');
      return;
    }

    if (editingUserId) {
      // Editar usuario existente
      const userIndex = users.findIndex(u => u.id === editingUserId);
      if (userIndex !== -1) {
        users[userIndex] = {
          ...users[userIndex],
          name,
          email,
          password,
          role,
          active,
          whatsapp: role === 'distributor' ? whatsapp : undefined,
          updatedAt: new Date().toISOString()
        };
      }
    } else {
      // Crear nuevo usuario
      const id = 'u' + Math.random().toString(36).slice(2, 9);
      const newUser = {
        id,
        role,
        name,
        email,
        password,
        active,
        createdAt: new Date().toISOString()
      };
      
      if (role === 'distributor') {
        newUser.whatsapp = whatsapp || '';
      }
      
      users.push(newUser);
    }

    StorageAPI.setUsers(users);
    loadUsers();
    filterUsers();
    closeUserModal();
    alert(editingUserId ? 'Usuario actualizado exitosamente' : 'Usuario creado exitosamente');
  }

  /**
   * Cierra el modal de usuario
   */
  function closeUserModal() {
    document.getElementById('user-modal').style.display = 'none';
    editingUserId = null;
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
  window.toggleUser = toggleUser;
  window.deleteUser = deleteUser;
  window.editUser = editUser;
  window.saveUser = saveUser;
  window.closeUserModal = closeUserModal;

  // Inicialización cuando el DOM esté listo
  document.addEventListener('DOMContentLoaded', () => {
    // Verificar sesión de admin
    const session = StorageAPI.getSession();
    if (!session || session.role !== 'admin') {
      window.location.href = '../auth/login.html';
      return;
    }

    // Cargar usuarios iniciales
    loadUsers();
    updateWelcomeMessage();
    
    // Inicializar botón de logout
    const logoutContainer = document.getElementById('logout-container');
    if (logoutContainer) {
      const logoutBtn = UI.createLogoutButton();
      logoutContainer.appendChild(logoutBtn);
    }
    
    // Event listeners
    document.getElementById('add-user-btn').addEventListener('click', addUser);
    document.getElementById('user-search').addEventListener('input', filterUsers);
    document.getElementById('role-filter').addEventListener('change', filterUsers);
    document.getElementById('status-filter').addEventListener('change', filterUsers);

    // Mostrar/ocultar campo WhatsApp según el rol seleccionado
    document.getElementById('user-role').addEventListener('change', (e) => {
      const isDistributor = e.target.value === 'distributor';
      document.getElementById('whatsapp-field').style.display = isDistributor ? 'block' : 'none';
    });

    // Cerrar modal al hacer clic fuera
    document.getElementById('user-modal').addEventListener('click', (e) => {
      if (e.target.id === 'user-modal') {
        closeUserModal();
      }
    });

    // Prevenir envío del formulario
    document.getElementById('user-form').addEventListener('submit', (e) => {
      e.preventDefault();
      saveUser();
    });
  });
})();
