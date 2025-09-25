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
        addWorkerBtn.addEventListener('click', () => openWorkerModal());
    }
}

function loadWorkers() {
    const workersList = document.getElementById('workers-list');
    if (!workersList) return;
    
    const users = StorageAPI.getUsers();
    const asesores = StorageAPI.getAsesores();
    
    // Obtener solo administradores de usuarios
    const admins = users.filter(user => user.role === 'admin');
    
    // Combinar administradores y asesores
    const workers = [...admins, ...asesores];
    
    if (workers.length === 0) {
        workersList.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
                <span data-icon="users" style="width:48px;height:48px;display:block;margin:0 auto 1rem;color:var(--text-muted);"></span>
                <p>No hay trabajadores registrados</p>
            </div>
        `;
        return;
    }
    
    workersList.innerHTML = workers.map(worker => createWorkerCard(worker, 'worker')).join('');
}

function loadRecentClients() {
    const recentClientsList = document.getElementById('recent-clients-list');
    if (!recentClientsList) return;
    
    const users = StorageAPI.getUsers();
    const clients = users.filter(user => user.role === 'client' || user.role === 'distributor')
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
    
    recentClientsList.innerHTML = clients.map(client => createClientCard(client, 'client')).join('');
}

function handleClientSearch(event) {
    const query = event.target.value.trim().toLowerCase();
    
    if (query.length < 2) {
        clearClientSearch();
        return;
    }
    
    const users = StorageAPI.getUsers();
    const clients = users.filter(user => 
        (user.role === 'client' || user.role === 'distributor') && (
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
        searchClientsList.innerHTML = clients.map(client => createClientCard(client, 'client')).join('');
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

function createWorkerCard(worker, type) {
    const avatar = worker.name ? worker.name.charAt(0).toUpperCase() : 'W';
    const roleText = worker.type === 'asesor' ? getAsesorRoleText(worker) : getRoleText(worker.role);
    const statusClass = worker.active ? 'active' : 'inactive';
    const statusText = worker.active ? 'Activo' : 'Inactivo';
    const createdAt = worker.createdAt ? new Date(worker.createdAt).toLocaleDateString('es-ES') : 'N/A';
    
    return `
        <div class="user-card">
            <div class="user-header">
                <div class="user-avatar">${avatar}</div>
                <div class="user-info">
                    <h4>${worker.name || 'Sin nombre'}</h4>
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
                    <span>${worker.email}</span>
                </div>
                ${worker.whatsapp ? `
                <div class="user-detail">
                    <strong>WhatsApp:</strong>
                    <span>${worker.whatsapp}</span>
                </div>
                ` : ''}
                ${worker.type === 'asesor' && worker.department ? `
                <div class="user-detail">
                    <strong>Departamento:</strong>
                    <span>${worker.department}</span>
                </div>
                ` : ''}
                ${worker.type === 'asesor' && worker.position ? `
                <div class="user-detail">
                    <strong>Cargo:</strong>
                    <span>${worker.position}</span>
                </div>
                ` : ''}
                <div class="user-detail">
                    <strong>${worker.type === 'asesor' ? 'Ingreso:' : 'Registrado:'}</strong>
                    <span>${worker.hireDate ? new Date(worker.hireDate).toLocaleDateString('es-ES') : createdAt}</span>
                </div>
            </div>
            
            <div class="user-actions">
                <button class="btn secondary" onclick="${worker.type === 'asesor' ? 'editAsesor' : 'editUser'}('${worker.id}')">
                    <span data-icon="edit" style="width:14px;height:14px;margin-right:4px"></span>
                    Editar
                </button>
                <button class="btn ${worker.active ? 'danger' : 'success'}" onclick="${worker.type === 'asesor' ? 'toggleAsesorStatus' : 'toggleUserStatus'}('${worker.id}')">
                    <span data-icon="${worker.active ? 'user-x' : 'user-check'}" style="width:14px;height:14px;margin-right:4px"></span>
                    ${worker.active ? 'Desactivar' : 'Activar'}
                </button>
            </div>
        </div>
    `;
}

function getRoleText(role) {
    const roles = {
        'admin': 'Administrador',
        'accesor': 'Accesor',
        'distributor': 'Distribuidor',
        'client': 'Cliente'
    };
    return roles[role] || 'Usuario';
}

function getAsesorRoleText(asesor) {
    return `${asesor.position || 'Asesor'} - ${asesor.department || 'Sin departamento'}`;
}

function createClientCard(client, type) {
    const avatar = client.name ? client.name.charAt(0).toUpperCase() : 'C';
    const roleText = getRoleText(client.role);
    const statusClass = client.active ? 'active' : 'inactive';
    const statusText = client.active ? 'Activo' : 'Inactivo';
    const createdAt = client.createdAt ? new Date(client.createdAt).toLocaleDateString('es-ES') : 'N/A';
    
    return `
        <div class="user-card">
            <div class="user-header">
                <div class="user-avatar">${avatar}</div>
                <div class="user-info">
                    <h4>${client.name || 'Sin nombre'}</h4>
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
                    <span>${client.email}</span>
                </div>
                ${client.whatsapp ? `
                <div class="user-detail">
                    <strong>WhatsApp:</strong>
                    <span>${client.whatsapp}</span>
                </div>
                ` : ''}
                ${client.phone ? `
                <div class="user-detail">
                    <strong>Teléfono:</strong>
                    <span>${client.phone}</span>
                </div>
                ` : ''}
                <div class="user-detail">
                    <strong>Registrado:</strong>
                    <span>${createdAt}</span>
                </div>
            </div>
            
            <div class="user-actions">
                <button class="btn secondary" onclick="editClient('${client.id}')">
                    <span data-icon="edit" style="width:14px;height:14px;margin-right:4px"></span>
                    Editar
                </button>
                <button class="btn ${client.active ? 'danger' : 'success'}" onclick="toggleClientStatus('${client.id}')">
                    <span data-icon="${client.active ? 'user-x' : 'user-check'}" style="width:14px;height:14px;margin-right:4px"></span>
                    ${client.active ? 'Desactivar' : 'Activar'}
                </button>
            </div>
        </div>
    `;
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
        document.getElementById('user-role').value = type === 'worker' ? 'accesor' : 'client';
    }
    
    // Mostrar/ocultar campos según el rol
    const roleSelect = document.getElementById('user-role');
    const whatsappField = document.getElementById('whatsapp-field');
    const asesorFields = document.getElementById('asesor-fields');
    
    function toggleFieldsByRole() {
        const role = roleSelect.value;
        
        // Campo WhatsApp
        if (role === 'client' || role === 'distributor' || role === 'accesor') {
            whatsappField.style.display = 'block';
        } else {
            whatsappField.style.display = 'none';
        }
        
        // Campos de asesor
        if (role === 'accesor') {
            asesorFields.style.display = 'block';
        } else {
            asesorFields.style.display = 'none';
        }
    }
    
    roleSelect.addEventListener('change', toggleFieldsByRole);
    toggleFieldsByRole();
    
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

function editClient(clientId) {
    openUserModal('client', clientId);
}

function toggleClientStatus(clientId) {
    const user = StorageAPI.getUser(clientId);
    const newStatus = !user.active;
    
    if (confirm(`¿Estás seguro de que quieres ${newStatus ? 'activar' : 'desactivar'} este cliente?`)) {
        user.active = newStatus;
        StorageAPI.updateUser(clientId, user);
        
        // Recargar la lista de clientes
        loadRecentClients();
        
        alert(`Cliente ${newStatus ? 'activado' : 'desactivado'} exitosamente`);
    }
}

// Funciones para manejar asesores
function openWorkerModal(workerId = null) {
    const modal = document.getElementById('user-modal');
    const title = document.getElementById('user-modal-title');
    const form = document.getElementById('user-form');
    
    if (workerId) {
        // Verificar si es un asesor o admin
        const asesor = StorageAPI.getAsesorById(workerId);
        const user = StorageAPI.getUserById(workerId);
        
        if (asesor) {
            title.textContent = 'Editar Asesor';
            document.getElementById('user-name').value = asesor.name || '';
            document.getElementById('user-email').value = asesor.email || '';
            document.getElementById('user-password').value = '';
            document.getElementById('user-password').required = false;
            document.getElementById('user-role').value = 'accesor';
            document.getElementById('user-whatsapp').value = asesor.whatsapp || '';
            document.getElementById('user-department').value = asesor.department || 'Ventas';
            document.getElementById('user-position').value = asesor.position || '';
            document.getElementById('user-active').checked = asesor.active !== false;
        } else if (user && user.role === 'admin') {
            title.textContent = 'Editar Administrador';
            document.getElementById('user-name').value = user.name || '';
            document.getElementById('user-email').value = user.email || '';
            document.getElementById('user-password').value = '';
            document.getElementById('user-password').required = false;
            document.getElementById('user-role').value = user.role;
            document.getElementById('user-whatsapp').value = '';
            document.getElementById('user-active').checked = user.active !== false;
        }
    } else {
        title.textContent = 'Nuevo Trabajador';
        form.reset();
        document.getElementById('user-password').required = true;
        document.getElementById('user-role').value = 'accesor';
    }
    
    modal.style.display = 'block';
}

function editAsesor(asesorId) {
    openWorkerModal(asesorId);
}

function editUser(userId) {
    openWorkerModal(userId);
}

function toggleAsesorStatus(asesorId) {
    const asesor = StorageAPI.getAsesorById(asesorId);
    const newStatus = !asesor.active;
    
    if (confirm(`¿Estás seguro de que quieres ${newStatus ? 'activar' : 'desactivar'} este asesor?`)) {
        StorageAPI.updateAsesor(asesorId, { active: newStatus });
        loadWorkers();
        alert(`Asesor ${newStatus ? 'activado' : 'desactivado'} exitosamente`);
    }
}

function saveWorker() {
    const form = document.getElementById('user-form');
    const role = document.getElementById('user-role').value;
    
    const workerData = {
        name: document.getElementById('user-name').value,
        email: document.getElementById('user-email').value,
        password: document.getElementById('user-password').value,
        whatsapp: document.getElementById('user-whatsapp').value,
        department: document.getElementById('user-department').value,
        position: document.getElementById('user-position').value,
        active: document.getElementById('user-active').checked,
        createdAt: new Date().toISOString()
    };
    
    if (!workerData.name || !workerData.email) {
        alert('Por favor, completa todos los campos requeridos');
        return;
    }
    
    if (role === 'accesor') {
        // Es un asesor
        workerData.type = 'asesor';
        workerData.hireDate = new Date().toISOString().split('T')[0];
        
        if (!workerData.password) {
            alert('La contraseña es requerida para nuevos asesores');
            return;
        }
        
        StorageAPI.addAsesor(workerData);
    } else if (role === 'admin') {
        // Es un administrador
        workerData.role = 'admin';
        
        if (!workerData.password) {
            alert('La contraseña es requerida para nuevos administradores');
            return;
        }
        
        StorageAPI.addUser(workerData);
    }
    
    closeUserModal();
    loadWorkers();
    alert('Trabajador guardado exitosamente');
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