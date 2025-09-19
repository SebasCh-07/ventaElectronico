// Gestión de usuarios con pestañas
document.addEventListener('DOMContentLoaded', function() {
    // Verificar sesión
    const sessionData = localStorage.getItem('hb_session');
    if (!sessionData) {
        window.location.href = '../auth/login.html';
        return;
    }

    try {
        const session = JSON.parse(sessionData);
        if (session.role !== 'admin') {
            window.location.href = '../auth/login.html';
            return;
        }
    } catch (e) {
        window.location.href = '../auth/login.html';
      return;
    }
    
    // Inicializar pestañas
    initTabs();
    
    // Inicializar botón de logout
    const logoutContainer = document.getElementById('logout-container');
    if (logoutContainer) {
        const logoutBtn = UI.createLogoutButton();
        logoutContainer.appendChild(logoutBtn);
    }
    
    // Cargar datos
    loadWorkers();
    loadRecentClients();
    
    // Event listeners
    setupEventListeners();
});

function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            // Remover clase active de todos los botones y contenidos
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Agregar clase active al botón clickeado y su contenido
            button.classList.add('active');
            document.getElementById(`${targetTab}-tab`).classList.add('active');
        });
    });
}

function setupEventListeners() {
    // Búsqueda de clientes
    const clientSearch = document.getElementById('client-search');
    if (clientSearch) {
        clientSearch.addEventListener('input', debounce(handleClientSearch, 300));
    }
    
    // Limpiar búsqueda
    const clearSearch = document.getElementById('clear-search');
    if (clearSearch) {
        clearSearch.addEventListener('click', clearClientSearch);
    }
    
    // Actualizar lista de clientes
    const refreshClients = document.getElementById('refresh-clients');
    if (refreshClients) {
        refreshClients.addEventListener('click', loadRecentClients);
    }
    
    // Agregar trabajador
    const addWorkerBtn = document.getElementById('add-worker-btn');
    if (addWorkerBtn) {
        addWorkerBtn.addEventListener('click', () => openUserModal('worker'));
    }
}

function loadWorkers() {
    const workersList = document.getElementById('workers-list');
    if (!workersList) return;
    
    const users = StorageAPI.getUsers();
    const workers = users.filter(user => user.role === 'admin' || user.role === 'distributor');
    
    if (workers.length === 0) {
        workersList.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
                <span data-icon="users" style="width:48px;height:48px;display:block;margin:0 auto 1rem;color:var(--text-muted);"></span>
                <p>No hay trabajadores registrados</p>
            </div>
        `;
        return;
    }
    
    workersList.innerHTML = workers.map(worker => createUserCard(worker, 'worker')).join('');
}

function loadRecentClients() {
    const recentClientsList = document.getElementById('recent-clients-list');
    if (!recentClientsList) return;
    
    const users = StorageAPI.getUsers();
    const clients = users.filter(user => user.role === 'client')
                         .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
                         .slice(0, 10);
    
    if (clients.length === 0) {
        recentClientsList.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
                <span data-icon="user" style="width:48px;height:48px;display:block;margin:0 auto 1rem;color:var(--text-muted);"></span>
                <p>No hay clientes registrados</p>
            </div>
        `;
        return;
    }
    
    recentClientsList.innerHTML = clients.map(client => createUserCard(client, 'client')).join('');
}

function handleClientSearch(event) {
    const query = event.target.value.trim().toLowerCase();
    
    if (query.length < 2) {
        clearClientSearch();
        return;
    }
    
    const users = StorageAPI.getUsers();
    const clients = users.filter(user => 
        user.role === 'client' && (
            user.name.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query) ||
            (user.whatsapp && user.whatsapp.toLowerCase().includes(query))
        )
    );
    
    displaySearchResults(clients);
}

function displaySearchResults(clients) {
    const searchResults = document.getElementById('search-results');
    const searchClientsList = document.getElementById('search-clients-list');
    const recentClientsCard = document.querySelector('#recent-clients-list').closest('.card');
    
    if (clients.length === 0) {
        searchClientsList.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
                <span data-icon="search" style="width:48px;height:48px;display:block;margin:0 auto 1rem;color:var(--text-muted);"></span>
                <p>No se encontraron clientes con ese criterio</p>
            </div>
        `;
    } else {
        searchClientsList.innerHTML = clients.map(client => createUserCard(client, 'client')).join('');
    }
    
    // Mostrar resultados de búsqueda y ocultar últimos clientes
    searchResults.style.display = 'block';
    recentClientsCard.style.display = 'none';
}

function clearClientSearch() {
    const clientSearch = document.getElementById('client-search');
    const searchResults = document.getElementById('search-results');
    const recentClientsCard = document.querySelector('#recent-clients-list').closest('.card');
    
    clientSearch.value = '';
    searchResults.style.display = 'none';
    recentClientsCard.style.display = 'block';
}

function createUserCard(user, type) {
    const avatar = user.name ? user.name.charAt(0).toUpperCase() : 'U';
    const roleText = getRoleText(user.role);
    const statusClass = user.active ? 'active' : 'inactive';
    const statusText = user.active ? 'Activo' : 'Inactivo';
    const createdAt = user.createdAt ? new Date(user.createdAt).toLocaleDateString('es-ES') : 'N/A';
    
    return `
        <div class="user-card">
            <div class="user-header">
                <div class="user-avatar">${avatar}</div>
                <div class="user-info">
                    <h4>${user.name || 'Sin nombre'}</h4>
                    <p>${roleText}</p>
                </div>
                <div class="user-status ${statusClass}">
                    <span data-icon="circle" style="width:8px;height:8px"></span>
                    ${statusText}
                </div>
            </div>
            
            <div class="user-details">
                <div class="user-detail">
                    <strong>Email:</strong>
                    <span>${user.email}</span>
                </div>
                ${user.whatsapp ? `
                <div class="user-detail">
                    <strong>WhatsApp:</strong>
                    <span>${user.whatsapp}</span>
                </div>
                ` : ''}
                <div class="user-detail">
                    <strong>Registrado:</strong>
                    <span>${createdAt}</span>
                </div>
            </div>
            
            <div class="user-actions">
                <button class="btn secondary" onclick="editUser('${user.id}')">
                    <span data-icon="edit" style="width:14px;height:14px;margin-right:4px"></span>
                    Editar
                </button>
                <button class="btn ${user.active ? 'danger' : 'success'}" onclick="toggleUserStatus('${user.id}')">
                    <span data-icon="${user.active ? 'user-x' : 'user-check'}" style="width:14px;height:14px;margin-right:4px"></span>
                    ${user.active ? 'Desactivar' : 'Activar'}
                </button>
            </div>
        </div>
    `;
}

function getRoleText(role) {
    const roles = {
        'admin': 'Administrador',
        'distributor': 'Distribuidor',
        'client': 'Cliente'
    };
    return roles[role] || 'Usuario';
}

function openUserModal(type, userId = null) {
    const modal = document.getElementById('user-modal');
    const title = document.getElementById('user-modal-title');
    const form = document.getElementById('user-form');
    
    if (userId) {
        const user = StorageAPI.getUserById(userId);
        title.textContent = 'Editar Usuario';
    document.getElementById('user-name').value = user.name || '';
    document.getElementById('user-email').value = user.email || '';
        document.getElementById('user-password').value = '';
        document.getElementById('user-password').required = false;
    document.getElementById('user-role').value = user.role || '';
    document.getElementById('user-whatsapp').value = user.whatsapp || '';
    document.getElementById('user-active').checked = user.active !== false;
    } else {
        title.textContent = type === 'worker' ? 'Nuevo Trabajador' : 'Nuevo Usuario';
        form.reset();
        document.getElementById('user-password').required = true;
        document.getElementById('user-role').value = type === 'worker' ? 'distributor' : 'client';
    }
    
    // Mostrar/ocultar campo WhatsApp según el rol
    const roleSelect = document.getElementById('user-role');
    const whatsappField = document.getElementById('whatsapp-field');
    
    function toggleWhatsappField() {
        const role = roleSelect.value;
        if (role === 'client' || role === 'distributor') {
            whatsappField.style.display = 'block';
        } else {
            whatsappField.style.display = 'none';
        }
    }
    
    roleSelect.addEventListener('change', toggleWhatsappField);
    toggleWhatsappField();
    
    modal.style.display = 'block';
}

function closeUserModal() {
    document.getElementById('user-modal').style.display = 'none';
}

// Cerrar modal al hacer clic fuera de él
document.addEventListener('click', (e) => {
    const modal = document.getElementById('user-modal');
    if (e.target === modal) {
        closeUserModal();
    }
});

// Cerrar modal con tecla Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const modal = document.getElementById('user-modal');
        if (modal && modal.style.display === 'block') {
            closeUserModal();
        }
    }
});

function saveUser() {
    const form = document.getElementById('user-form');
    const formData = new FormData(form);
    
    const userData = {
        name: document.getElementById('user-name').value,
        email: document.getElementById('user-email').value,
        password: document.getElementById('user-password').value,
        role: document.getElementById('user-role').value,
        whatsapp: document.getElementById('user-whatsapp').value,
        active: document.getElementById('user-active').checked,
        createdAt: new Date().toISOString()
      };
      
    if (!userData.name || !userData.email || !userData.role) {
        alert('Por favor, completa todos los campos requeridos');
        return;
      }
      
    if (!userData.password && !document.getElementById('user-password').hasAttribute('data-edit')) {
        alert('La contraseña es requerida');
        return;
    }

    try {
        StorageAPI.addUser(userData);
    closeUserModal();
        
        // Recargar las listas
        loadWorkers();
        loadRecentClients();
        
        alert('Usuario guardado exitosamente');
    } catch (error) {
        alert('Error al guardar el usuario: ' + error.message);
    }
}

function editUser(userId) {
    openUserModal(null, userId);
}

function toggleUserStatus(userId) {
    const user = StorageAPI.getUser(userId);
    const newStatus = !user.active;
    
    if (confirm(`¿Estás seguro de que quieres ${newStatus ? 'activar' : 'desactivar'} este usuario?`)) {
        user.active = newStatus;
        StorageAPI.updateUser(userId, user);
        
        // Recargar las listas
        loadWorkers();
        loadRecentClients();
        
        alert(`Usuario ${newStatus ? 'activado' : 'desactivado'} exitosamente`);
    }
}

// Función de debounce para la búsqueda
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}