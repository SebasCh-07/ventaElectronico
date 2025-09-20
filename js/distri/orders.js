/**
 * Sistema de gestión de pedidos para Distribuidores - H&B Importaciones
 * Permite ver, filtrar, buscar y gestionar pedidos relacionados con productos del distribuidor
 */
(function(){
  'use strict';

  let allOrders = [];
  let filteredOrders = [];
  let currentDistributorId = null;

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
      
      // Filtrar solo productos de este distribuidor
      const distributorItems = order.items.filter(item => {
        const product = StorageAPI.getProductById(item.productId);
        return product && product.owner === currentDistributorId;
      });
      
      const distributorTotal = distributorItems.reduce((total, item) => total + (item.price * item.quantity), 0);
      
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
              ${orderDate} a las ${orderTime} • ${distributorItems.length} producto${distributorItems.length > 1 ? 's' : ''} de mis productos
            </div>
          </div>
          <div style="text-align:right;">
            <div style="font-weight:600;color:#374151;margin-bottom:4px;">
              ${UI.formatPrice(distributorTotal)}
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
    // Filtrar solo pedidos que contienen productos de este distribuidor
    const distributorOrders = allOrders.filter(order => 
      order.items.some(item => {
        const product = StorageAPI.getProductById(item.productId);
        return product && product.owner === currentDistributorId;
      })
    );

    const pendingCount = distributorOrders.filter(o => o.status === 'pending').length;
    const processingCount = distributorOrders.filter(o => o.status === 'processing').length;
    const shippedCount = distributorOrders.filter(o => o.status === 'shipped').length;
    const completedCount = distributorOrders.filter(o => o.status === 'completed').length;

    document.getElementById('pending-orders-count').textContent = pendingCount;
    document.getElementById('processing-orders-count').textContent = processingCount;
    document.getElementById('shipped-orders-count').textContent = shippedCount;
    document.getElementById('completed-orders-count').textContent = completedCount;
  }

  /**
   * Filtra pedidos por búsqueda, estado y tiempo
   */
  function filterOrders() {
    const searchTerm = document.getElementById('order-search').value.toLowerCase().trim();
    const statusFilter = document.getElementById('status-filter').value;
    const timeFilter = document.getElementById('time-filter').value;
    
    // Filtrar solo pedidos que contienen productos de este distribuidor
    const distributorOrders = allOrders.filter(order => 
      order.items.some(item => {
        const product = StorageAPI.getProductById(item.productId);
        return product && product.owner === currentDistributorId;
      })
    );
    
    filteredOrders = distributorOrders.filter(order => {
      const customer = getCustomerInfo(order.customerId);
      const matchesSearch = !searchTerm || 
        order.id.toLowerCase().includes(searchTerm) ||
        customer.name.toLowerCase().includes(searchTerm) ||
        customer.email.toLowerCase().includes(searchTerm);
      
      const matchesStatus = !statusFilter || order.status === statusFilter;
      
      let matchesTime = true;
      if (timeFilter) {
        const orderDate = new Date(order.createdAt);
        const now = new Date();
        
        switch (timeFilter) {
          case 'today':
            matchesTime = orderDate.toDateString() === now.toDateString();
            break;
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            matchesTime = orderDate >= weekAgo;
            break;
          case 'month':
            const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1);
            matchesTime = orderDate >= monthAgo;
            break;
        }
      }
      
      return matchesSearch && matchesStatus && matchesTime;
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
    filterOrders();
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

    const status = ORDER_STATUSES[order.status] || ORDER_STATUSES.pending;
    const customer = getCustomerInfo(order.customerId);
    const orderDate = new Date(order.createdAt).toLocaleDateString('es-CO');
    const orderTime = new Date(order.createdAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
    
    // Filtrar solo productos de este distribuidor
    const distributorItems = order.items.filter(item => {
      const product = StorageAPI.getProductById(item.productId);
      return product && product.owner === currentDistributorId;
    });
    
    const distributorTotal = distributorItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    const modalBody = document.getElementById('order-modal-body');
    modalBody.innerHTML = `
      <div style="margin-bottom: 20px;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          <div style="width: 48px; height: 48px; background: ${status.bg}; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: ${status.color}; font-weight: 600; font-size: 16px;">
            #${order.id.slice(-3).toUpperCase()}
          </div>
          <div>
            <h3 style="margin: 0; color: #1e293b;">Pedido #${order.id}</h3>
            <span style="padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; background: ${status.bg}; color: ${status.color};">
              ${status.label}
            </span>
          </div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
        <div>
          <label style="font-weight: 600; color: #6b7280; font-size: 12px; text-transform: uppercase;">Cliente</label>
          <div style="color: #1e293b; margin-top: 4px;">${customer.name}</div>
          <div style="color: #64748b; font-size: 14px;">${customer.email}</div>
        </div>
        <div>
          <label style="font-weight: 600; color: #6b7280; font-size: 12px; text-transform: uppercase;">Fecha</label>
          <div style="color: #1e293b; margin-top: 4px;">${orderDate}</div>
          <div style="color: #64748b; font-size: 14px;">${orderTime}</div>
        </div>
      </div>

      <div style="margin-bottom: 20px;">
        <label style="font-weight: 600; color: #6b7280; font-size: 12px; text-transform: uppercase; margin-bottom: 8px; display: block;">Mis Productos en este Pedido</label>
        <div style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
          ${distributorItems.map(item => {
            const product = StorageAPI.getProductById(item.productId);
            return `
              <div style="display: flex; align-items: center; gap: 12px; padding: 12px; border-bottom: 1px solid #f3f4f6;">
                <div style="width: 48px; height: 48px; background: #f8fafc; border-radius: 6px; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                  ${product && product.image ? 
                    `<img src="${product.image}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover;">` :
                    `<span data-icon="package" style="width: 24px; height: 24px; color: #6b7280;"></span>`
                  }
                </div>
                <div style="flex: 1;">
                  <div style="font-weight: 500; color: #1e293b;">${product ? product.name : 'Producto no encontrado'}</div>
                  <div style="color: #64748b; font-size: 12px;">Cantidad: ${item.quantity}</div>
                </div>
                <div style="text-align: right;">
                  <div style="font-weight: 600; color: #1e293b;">${UI.formatPrice(item.price)}</div>
                  <div style="color: #64748b; font-size: 12px;">Subtotal: ${UI.formatPrice(item.price * item.quantity)}</div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px; background: #f8fafc; border-radius: 8px; margin-bottom: 20px;">
        <div style="font-weight: 600; color: #1e293b; font-size: 18px;">Total de Mis Productos</div>
        <div style="font-weight: 700; color: #1e293b; font-size: 20px;">${UI.formatPrice(distributorTotal)}</div>
      </div>

      ${order.shippingAddress ? `
        <div style="margin-bottom: 20px;">
          <label style="font-weight: 600; color: #6b7280; font-size: 12px; text-transform: uppercase; margin-bottom: 8px; display: block;">Dirección de Envío</label>
          <div style="color: #1e293b; padding: 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #e5e7eb;">
            ${order.shippingAddress}
          </div>
        </div>
      ` : ''}

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; font-size: 12px; color: #6b7280;">
        <div>
          <label style="font-weight: 600; color: #6b7280; font-size: 12px; text-transform: uppercase;">Método de Pago</label>
          <div style="color: #1e293b;">${order.paymentMethod || 'No especificado'}</div>
        </div>
        <div>
          <label style="font-weight: 600; color: #6b7280; font-size: 12px; text-transform: uppercase;">Notas</label>
          <div style="color: #1e293b;">${order.notes || 'Sin notas adicionales'}</div>
        </div>
      </div>
    `;

    document.getElementById('order-modal').style.display = 'block';
  }

  /**
   * Cierra el modal de detalles del pedido
   */
  function closeOrderModal() {
    document.getElementById('order-modal').style.display = 'none';
  }

  /**
   * Actualiza el mensaje de bienvenida
   */
  function updateWelcomeMessage() {
    const session = StorageAPI.getSession();
    const welcomeEl = document.getElementById('distri-welcome');
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
    // Verificar sesión de distribuidor
    const session = StorageAPI.getSession();
    if (!session || session.role !== 'distributor') {
      window.location.href = '../auth/login.html';
      return;
    }

    currentDistributorId = session.id;

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
    document.getElementById('time-filter').addEventListener('change', filterOrders);

    // Cerrar modal al hacer clic fuera
    document.getElementById('order-modal').addEventListener('click', (e) => {
      if (e.target.id === 'order-modal') {
        closeOrderModal();
      }
    });

    // Cerrar modal con tecla Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const orderModal = document.getElementById('order-modal');
        if (orderModal && orderModal.style.display === 'block') {
          closeOrderModal();
        }
      }
    });
  });
})();
