/**
 * Utilidades UI para H&B Importaciones
 * Componentes, navegación y funciones de interfaz
 */
(function(){
  'use strict';

  /**
   * Formatea un precio en pesos colombianos
   * @param {number} cents - Precio en centavos
   * @returns {string} Precio formateado
   */
  function formatPrice(cents){
    if (typeof cents !== 'number' || isNaN(cents)) {
      return '$0';
    }
    return new Intl.NumberFormat('es-CO',{ 
      style:'currency', 
      currency:'COP', 
      maximumFractionDigits:0 
    }).format(cents);
  }

  /**
   * Obtiene el precio correcto según el rol del usuario
   * @param {Object} product - Producto
   * @param {string} userRole - Rol del usuario
   * @returns {number} Precio a mostrar
   */
  function getProductPrice(product, userRole) {
    if (userRole === 'distributor' && product.priceDistribuidor) {
      return product.priceDistribuidor;
    }
    return product.pricePublico || product.price || 0;
  }

  /**
   * Crea un botón de logout
   * @returns {HTMLButtonElement} Botón de logout
   */
  function createLogoutButton(){
    const btn = document.createElement('button');
    btn.className = 'btn icon logout';
    btn.title = 'Cerrar sesión';
    btn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M10 6H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M14 16l4-4-4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M18 12H10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`;
    btn.addEventListener('click', ()=>{
      StorageAPI.clearSession();
      // Redirigir a la página principal según la ubicación actual
      const currentPath = window.location.pathname;
      if (currentPath.includes('/admin/') || currentPath.includes('/distri/') || currentPath.includes('/user/')) {
        window.location.href = '../../index.html';
      } else if (currentPath.includes('/auth/')) {
        window.location.href = '../../index.html';
      } else {
        window.location.href = 'index.html';
      }
    });
    return btn;
  }

  /**
   * Crea un botón de WhatsApp flotante
   * @returns {HTMLAnchorElement} Botón de WhatsApp
   */
  function createWhatsAppButton(){
    const btn = document.createElement('a');
    btn.href = 'https://wa.me/573001112233?text=Hola, me interesa conocer más sobre sus productos';
    btn.target = '_blank';
    btn.className = 'whatsapp-float';
    btn.title = 'Contactar por WhatsApp';
    btn.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.131-1.44l-.365-.214-3.74.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
      </svg>
    `;
    return btn;
  }

  /**
   * Monta la navegación de autenticación
   */
  function mountAuthNav(){
    const session = StorageAPI.getSession();
    const loginLink = document.getElementById('login-link');
    const logoutContainer = document.getElementById('logout-container');
    
    if(!loginLink || !logoutContainer) return;
    
    if(session){
      loginLink.style.display = 'none';
      logoutContainer.innerHTML = '';
      logoutContainer.appendChild(createLogoutButton());
      
      // Actualizar mensaje de bienvenida si existe
      const welcomeEl = document.getElementById('admin-welcome') || 
                       document.getElementById('distri-welcome') || 
                       document.getElementById('user-welcome');
      if(welcomeEl) {
        welcomeEl.textContent = `Bienvenido, ${session.name}`;
      }
    } else {
      loginLink.style.display = '';
      logoutContainer.innerHTML = '';
    }
  }

  /**
   * Monta el botón flotante de WhatsApp
   */
  function mountWhatsAppButton(){
    // Verificar si ya existe
    if(document.querySelector('.whatsapp-float')) return;
    
    const btn = createWhatsAppButton();
    document.body.appendChild(btn);
  }

  /**
   * Actualiza el contador del carrito en el header
   */
  function updateCartHeader(){
    const cart = StorageAPI.getCart();
    const count = StorageAPI.getCartItemCount();
    const total = StorageAPI.getCartTotal();
    
    const countEl = document.getElementById('cart-count');
    const totalEl = document.getElementById('cart-total');
    
    if(countEl) countEl.textContent = count;
    if(totalEl) totalEl.textContent = formatPrice(total);
  }

  /**
   * Crea un spinner de carga
   * @param {string} text - Texto a mostrar
   * @returns {HTMLDivElement} Elemento spinner
   */
  function createSpinner(text = 'Cargando...'){
    const spinner = document.createElement('div');
    spinner.className = 'spinner-container';
    spinner.innerHTML = `
      <div class="spinner"></div>
      <div class="spinner-text">${text}</div>
    `;
    return spinner;
  }

  /**
   * Muestra/oculta un spinner
   * @param {boolean} show - Mostrar u ocultar
   * @param {string} text - Texto del spinner
   */
  function toggleSpinner(show, text = 'Cargando...'){
    let spinner = document.querySelector('.spinner-container');
    
    if(show && !spinner){
      spinner = createSpinner(text);
      document.body.appendChild(spinner);
    } else if(!show && spinner){
      spinner.remove();
    } else if(show && spinner){
      spinner.querySelector('.spinner-text').textContent = text;
    }
  }

  /**
   * Crea un modal
   * @param {string} title - Título del modal
   * @param {string} content - Contenido HTML
   * @param {Array} buttons - Botones del modal
   * @returns {HTMLDivElement} Modal
   */
  function createModal(title, content, buttons = []){
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">${title}</h3>
          <button class="modal-close" type="button">&times;</button>
        </div>
        <div class="modal-body">
          ${content}
        </div>
        <div class="modal-footer">
          ${buttons.map(btn => `
            <button class="btn ${btn.class || 'secondary'}" data-action="${btn.action}">
              ${btn.text}
            </button>
          `).join('')}
        </div>
      </div>
    `;

    // Event listeners
    modal.querySelector('.modal-close').addEventListener('click', () => {
      modal.remove();
    });

    modal.addEventListener('click', (e) => {
      if(e.target === modal){
        modal.remove();
      }
    });

    // Botones del footer
    modal.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.target.getAttribute('data-action');
        if(action === 'close'){
          modal.remove();
        }
      });
    });

    return modal;
  }

  /**
   * Muestra un modal de confirmación
   * @param {string} message - Mensaje a mostrar
   * @param {Function} onConfirm - Callback de confirmación
   * @param {Function} onCancel - Callback de cancelación
   */
  function showConfirmModal(message, onConfirm, onCancel){
    const modal = createModal('Confirmar', message, [
      { text: 'Cancelar', action: 'close', class: 'secondary' },
      { text: 'Confirmar', action: 'confirm', class: 'brand' }
    ]);

    modal.querySelector('[data-action="confirm"]').addEventListener('click', () => {
      if(onConfirm) onConfirm();
      modal.remove();
    });

    modal.querySelector('[data-action="close"]').addEventListener('click', () => {
      if(onCancel) onCancel();
    });

    document.body.appendChild(modal);
  }

  /**
   * Crea un dropdown
   * @param {Array} options - Opciones del dropdown
   * @param {Function} onSelect - Callback de selección
   * @returns {HTMLDivElement} Dropdown
   */
  function createDropdown(options, onSelect){
    const dropdown = document.createElement('div');
    dropdown.className = 'dropdown';
    dropdown.innerHTML = `
      <button class="dropdown-toggle" type="button">
        <span class="dropdown-text">Seleccionar</span>
        <span class="dropdown-arrow">▼</span>
      </button>
      <div class="dropdown-menu">
        ${options.map(option => `
          <div class="dropdown-item" data-value="${option.value}">
            ${option.text}
          </div>
        `).join('')}
      </div>
    `;

    const toggle = dropdown.querySelector('.dropdown-toggle');
    const menu = dropdown.querySelector('.dropdown-menu');
    const text = dropdown.querySelector('.dropdown-text');

    toggle.addEventListener('click', () => {
      menu.classList.toggle('show');
    });

    dropdown.querySelectorAll('.dropdown-item').forEach(item => {
      item.addEventListener('click', () => {
        const value = item.getAttribute('data-value');
        const option = options.find(opt => opt.value === value);
        text.textContent = option.text;
        menu.classList.remove('show');
        if(onSelect) onSelect(option);
      });
    });

    // Cerrar al hacer click fuera
    document.addEventListener('click', (e) => {
      if(!dropdown.contains(e.target)){
        menu.classList.remove('show');
      }
    });

    return dropdown;
  }

  /**
   * Crea un tooltip
   * @param {string} text - Texto del tooltip
   * @param {string} position - Posición (top, bottom, left, right)
   * @returns {HTMLDivElement} Tooltip
   */
  function createTooltip(text, position = 'top'){
    const tooltip = document.createElement('div');
    tooltip.className = `tooltip tooltip-${position}`;
    tooltip.textContent = text;
    return tooltip;
  }

  /**
   * Inicializa tooltips en elementos con data-tooltip
   */
  function initTooltips(){
    document.querySelectorAll('[data-tooltip]').forEach(element => {
      const text = element.getAttribute('data-tooltip');
      const position = element.getAttribute('data-tooltip-position') || 'top';
      
      element.addEventListener('mouseenter', () => {
        const tooltip = createTooltip(text, position);
        element.appendChild(tooltip);
      });
      
      element.addEventListener('mouseleave', () => {
        const tooltip = element.querySelector('.tooltip');
        if(tooltip) tooltip.remove();
      });
    });
  }

  /**
   * Crea un toast de notificación
   * @param {string} message - Mensaje
   * @param {string} type - Tipo (success, error, warning, info)
   * @param {number} duration - Duración en ms
   */
  function showToast(message, type = 'info', duration = 3000){
    if(window.Helpers && window.Helpers.showToast){
      window.Helpers.showToast(message, type, duration);
    } else {
      // Fallback básico
      alert(message);
    }
  }

  /**
   * Inicializa todos los componentes UI
   */
  function initUI(){
    mountAuthNav();
    mountWhatsAppButton();
    updateCartHeader();
    initTooltips();
  }

  // API pública
  window.UI = { 
    formatPrice,
    getProductPrice,
    createLogoutButton,
    createWhatsAppButton,
    mountAuthNav,
    mountWhatsAppButton,
    updateCartHeader,
    createSpinner,
    toggleSpinner,
    createModal,
    showConfirmModal,
    createDropdown,
    createTooltip,
    initTooltips,
    showToast,
    initUI
  };

  // Inicializar al cargar el DOM
  document.addEventListener('DOMContentLoaded', initUI);
})();


