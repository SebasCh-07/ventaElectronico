/**
 * Sistema de gestión de pedidos para H&B Importaciones - Panel Admin
 * Permite ver, filtrar, buscar y gestionar pedidos de clientes
 */
(function(){
  'use strict';

  let allOrders = [];
  let filteredOrders = [];

  /**
   * Estados posibles de un pedido
   */
  const ORDER_STATUSES = {
    pending: { label: 'Pendiente', color: '#f59e0b', bg: '#fef3c7' },
    processing: { label: 'En Proceso', color: '#3b82f6', bg: '#dbeafe' },
    shipped: { label: 'Enviado', color: '#8b5cf6', bg: '#ede9fe' },
    completed: { label: 'Completado', color: '#059669', bg: '#d1fae5' },
    cancelled: { label: 'Cancelado', color: '#dc2626', bg: '#fee2e2' }
  };

  /**
   * Renderiza la lista de pedidos
   */
  function renderOrders(orders = null) {
    const ordersToRender = orders || filteredOrders;
    const container = document.getElementById('orders-list');
    
    if (ordersToRender.length === 0) {
      container.innerHTML = '<p style="color:#6b7280;text-align:center;padding:40px;">No hay pedidos que mostrar</p>';
      return;
    }

    container.innerHTML = ordersToRender.map(order => {
      const status = ORDER_STATUSES[order.status] || ORDER_STATUSES.pending;
      const customer = getCustomerInfo(order.customerId);
      const orderDate = new Date(order.createdAt).toLocaleDateString('es-CO');
      const orderTime = new Date(order.createdAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
      
      return `
        <div class="order-item" style="display:flex;align-items:center;gap:16px;padding:16px;border:1px solid #e5e7eb;border-radius:8px;margin-bottom:12px;background:white;">
          <div style="width:48px;height:48px;background:${status.bg};border-radius:50%;display:flex;align-items:center;justify-content:center;color:${status.color};font-weight:600;font-size:14px;">
            #${order.id.slice(-3).toUpperCase()}
          </div>
          <div style="flex:1;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
              <div style="font-weight:600;color:#374151;">Pedido #${order.id}</div>
              <span style="padding:4px 8px;border-radius:4px;font-size:12px;font-weight:500;background:${status.bg};color:${status.color};">
                ${status.label}
              </span>
            </div>
            <div style="color:#6b7280;font-size:14px;margin-bottom:2px;">
              Cliente: ${customer.name} (${customer.email})
            </div>
            <div style="color:#6b7280;font-size:12px;">
              ${orderDate} a las ${orderTime} • ${order.items.length} producto${order.items.length > 1 ? 's' : ''}
            </div>
          </div>
          <div style="text-align:right;">
            <div style="font-weight:600;color:#374151;margin-bottom:4px;">
              ${UI.formatPrice(order.total)}
            </div>
            <div style="display:flex;gap:8px;">
              <button class="btn" onclick="viewOrder('${order.id}')" style="padding:6px 12px;font-size:12px;">
                Ver Detalles
              </button>
              <select onchange="updateOrderStatus('${order.id}', this.value)" style="padding:4px 8px;font-size:12px;border:1px solid #d1d5db;border-radius:4px;">
                ${Object.keys(ORDER_STATUSES).map(statusKey => 
                  `<option value="${statusKey}" ${order.status === statusKey ? 'selected' : ''}>${ORDER_STATUSES[statusKey].label}</option>`
                ).join('')}
              </select>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  /**
   * Obtiene información del cliente
   */
  function getCustomerInfo(customerId) {
    if (!customerId) return { name: 'Cliente anónimo', email: '' };
    
    const users = StorageAPI.getUsers();
    const customer = users.find(u => u.id === customerId);
    return customer || { name: 'Cliente no encontrado', email: '' };
  }

  /**
   * Renderiza las estadísticas de pedidos
   */
  function renderStats() {
    const pendingCount = allOrders.filter(o => o.status === 'pending').length;
    const processingCount = allOrders.filter(o => o.status === 'processing').length;
    const completedCount = allOrders.filter(o => o.status === 'completed').length;
    const totalSales = allOrders
      .filter(o => o.status === 'completed')
      .reduce((sum, order) => sum + order.total, 0);

    document.getElementById('pending-orders-count').textContent = pendingCount;
    document.getElementById('processing-orders-count').textContent = processingCount;
    document.getElementById('completed-orders-count').textContent = completedCount;
    document.getElementById('total-sales').textContent = UI.formatPrice(totalSales);
  }

  /**
   * Filtra pedidos por búsqueda y estado
   */
  function filterOrders() {
    const searchTerm = document.getElementById('order-search').value.toLowerCase().trim();
    const statusFilter = document.getElementById('status-filter').value;
    
    filteredOrders = allOrders.filter(order => {
      const customer = getCustomerInfo(order.customerId);
      const matchesSearch = !searchTerm || 
        order.id.toLowerCase().includes(searchTerm) ||
        customer.name.toLowerCase().includes(searchTerm) ||
        customer.email.toLowerCase().includes(searchTerm);
      
      const matchesStatus = !statusFilter || order.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });

    renderOrders();
  }

  /**
   * Carga y actualiza la lista de pedidos
   */
  function loadOrders() {
    allOrders = StorageAPI.getOrders().sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
    filteredOrders = [...allOrders];
    renderOrders();
    renderStats();
  }

  /**
   * Actualiza el estado de un pedido
   */
  function updateOrderStatus(orderId, newStatus) {
    const result = StorageAPI.updateOrderStatus(orderId, newStatus);
    if (result) {
      loadOrders();
      filterOrders();
      alert(`Pedido actualizado a: ${ORDER_STATUSES[newStatus].label}`);
    } else {
      alert('Error al actualizar el pedido');
    }
  }

  /**
   * Muestra los detalles de un pedido en modal
   */
  function viewOrder(orderId) {
    const order = allOrders.find(o => o.id === orderId);
    if (!order) return;

    const customer = getCustomerInfo(order.customerId);
    const status = ORDER_STATUSES[order.status] || ORDER_STATUSES.pending;
    const products = StorageAPI.getProducts();
    
    const modalBody = document.getElementById('order-modal-body');
    modalBody.innerHTML = `
      <div style="margin-bottom:20px;">
        <h3 style="margin:0 0 12px 0;color:#374151;">Información del Pedido</h3>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
          <div>
            <label style="font-weight:600;color:#6b7280;font-size:12px;text-transform:uppercase;">ID del Pedido</label>
            <div style="color:#374151;">#${order.id}</div>
          </div>
          <div>
            <label style="font-weight:600;color:#6b7280;font-size:12px;text-transform:uppercase;">Estado</label>
            <div>
              <span style="padding:4px 8px;border-radius:4px;font-size:12px;font-weight:500;background:${status.bg};color:${status.color};">
                ${status.label}
              </span>
            </div>
          </div>
          <div>
            <label style="font-weight:600;color:#6b7280;font-size:12px;text-transform:uppercase;">Fecha</label>
            <div style="color:#374151;">${new Date(order.createdAt).toLocaleDateString('es-CO')}</div>
          </div>
          <div>
            <label style="font-weight:600;color:#6b7280;font-size:12px;text-transform:uppercase;">Hora</label>
            <div style="color:#374151;">${new Date(order.createdAt).toLocaleTimeString('es-CO')}</div>
          </div>
        </div>
      </div>

      <div style="margin-bottom:20px;">
        <h3 style="margin:0 0 12px 0;color:#374151;">Cliente</h3>
        <div style="padding:12px;border:1px solid #e5e7eb;border-radius:8px;background:#f9fafb;">
          <div style="font-weight:600;color:#374151;margin-bottom:4px;">${customer.name}</div>
          <div style="color:#6b7280;font-size:14px;">${customer.email}</div>
        </div>
      </div>

      <div style="margin-bottom:20px;">
        <h3 style="margin:0 0 12px 0;color:#374151;">Productos (${order.items.length})</h3>
        <div style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
          ${order.items.map(item => {
            const product = products.find(p => p.id === item.productId);
            const productName = product ? product.name : 'Producto no encontrado';
            const subtotal = item.price * item.quantity;
            
            return `
              <div style="padding:12px;border-bottom:1px solid #e5e7eb;background:white;">
                <div style="display:flex;justify-content:space-between;align-items:start;">
                  <div style="flex:1;">
                    <div style="font-weight:600;color:#374151;margin-bottom:4px;">${productName}</div>
                    <div style="color:#6b7280;font-size:14px;">
                      ${item.quantity} × ${UI.formatPrice(item.price)}
                    </div>
                  </div>
                  <div style="font-weight:600;color:#374151;">
                    ${UI.formatPrice(subtotal)}
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <div style="padding:16px;border:1px solid #e5e7eb;border-radius:8px;background:#f9fafb;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span style="font-weight:600;color:#374151;font-size:18px;">Total:</span>
          <span style="font-weight:700;color:#374151;font-size:20px;">${UI.formatPrice(order.total)}</span>
        </div>
      </div>
    `;

    document.getElementById('order-modal').style.display = 'flex';
  }

  /**
   * Cierra el modal de detalles
   */
  function closeOrderModal() {
    document.getElementById('order-modal').style.display = 'none';
  }

  /**
   * Crea un pedido de demostración
   */
  function createDemoOrder() {
    const products = StorageAPI.getProducts();
    const users = StorageAPI.getUsers();
    const clients = users.filter(u => u.role === 'client' && u.active !== false);
    
    if (clients.length === 0) {
      alert('No hay clientes registrados para crear un pedido demo');
      return;
    }

    if (products.length === 0) {
      alert('No hay productos disponibles para crear un pedido demo');
      return;
    }

    // Seleccionar cliente aleatorio
    const randomClient = clients[Math.floor(Math.random() * clients.length)];
    
    // Seleccionar productos aleatorios (1-3 productos)
    const numProducts = Math.floor(Math.random() * 3) + 1;
    const selectedProducts = [];
    
    for (let i = 0; i < numProducts; i++) {
      const randomProduct = products[Math.floor(Math.random() * products.length)];
      const quantity = Math.floor(Math.random() * 3) + 1;
      const price = randomClient.role === 'distributor' ? 
        (randomProduct.priceDistribuidor || randomProduct.pricePublico) : 
        randomProduct.pricePublico;
      
      selectedProducts.push({
        productId: randomProduct.id,
        quantity: quantity,
        price: price
      });
    }

    const total = selectedProducts.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const demoOrder = {
      customerId: randomClient.id,
      items: selectedProducts,
      total: total,
      status: 'pending',
      notes: 'Pedido de demostración generado automáticamente'
    };

    StorageAPI.addOrder(demoOrder);
    loadOrders();
    filterOrders();
    alert('Pedido de demostración creado exitosamente');
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
  window.updateOrderStatus = updateOrderStatus;
  window.viewOrder = viewOrder;
  window.closeOrderModal = closeOrderModal;

  // Inicialización cuando el DOM esté listo
  document.addEventListener('DOMContentLoaded', () => {
    // Verificar sesión de admin
    const session = StorageAPI.getSession();
    if (!session || session.role !== 'admin') {
      window.location.href = '../auth/login.html';
      return;
    }

    // Cargar pedidos iniciales
    loadOrders();
    updateWelcomeMessage();
    
    // Inicializar botón de logout
    const logoutContainer = document.getElementById('logout-container');
    if (logoutContainer) {
      const logoutBtn = UI.createLogoutButton();
      logoutContainer.appendChild(logoutBtn);
    }
    
    // Event listeners
    document.getElementById('order-search').addEventListener('input', filterOrders);
    document.getElementById('status-filter').addEventListener('change', filterOrders);
    document.getElementById('create-demo-order-btn').addEventListener('click', createDemoOrder);

    // Cerrar modal al hacer clic fuera
    document.getElementById('order-modal').addEventListener('click', (e) => {
      if (e.target.id === 'order-modal') {
        closeOrderModal();
      }
    });
  });
})();
