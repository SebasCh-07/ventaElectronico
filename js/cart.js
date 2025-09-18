/**
 * Sistema de carrito de compras para H&B Importaciones
 * Maneja productos, cantidades, precios diferenciados y confirmación
 */
(function(){
  'use strict';

  const listEl = document.getElementById('cart-list');
  const clearBtn = document.getElementById('clear-cart');
  const confirmBtn = document.getElementById('confirm-order');
  const saveBtn = document.getElementById('save-cart');
  const loadBtn = document.getElementById('load-cart');

  if(!listEl) return;

  /**
   * Expande el carrito con información completa de productos
   * @param {Array} cart - Carrito actual
   * @param {Array} products - Lista de productos
   * @returns {Array} Carrito expandido con datos de productos
   */
  function expandCart(cart, products){
    return cart.map(item => {
      const product = products.find(p => p.id === item.productId);
      return { ...item, product };
    }).filter(x => !!x.product);
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
   * Calcula el total del carrito
   * @param {Array} rows - Filas del carrito expandido
   * @param {string} userRole - Rol del usuario
   * @returns {number} Total calculado
   */
  function calculateTotal(rows, userRole) {
    return rows.reduce((sum, row) => {
      const price = getProductPrice(row.product, userRole);
      return sum + (price * row.quantity);
    }, 0);
  }

  /**
   * Renderiza el carrito de compras
   */
  function render(){
    const products = StorageAPI.getProducts();
    const cart = StorageAPI.getCart();
    const session = StorageAPI.getSession();
    const userRole = session ? session.role : 'client';
    
    const rows = expandCart(cart, products);
    
    if(rows.length === 0){
      listEl.innerHTML = `
        <div style="text-align:center;padding:40px;color:#6b7280;">
          <div style="font-size:48px;margin-bottom:16px;">🛒</div>
          <h3 style="margin:0 0 8px 0;color:#374151;">Tu carrito está vacío</h3>
          <p style="margin:0;">Agrega algunos productos para comenzar tu compra</p>
          <a href="../user/store.html" class="btn brand" style="margin-top:16px;display:inline-block;">
            Ver Productos
          </a>
        </div>
      `;
      if(confirmBtn) confirmBtn.disabled = true;
      if(saveBtn) saveBtn.disabled = true;
      return;
    }

    if(confirmBtn) confirmBtn.disabled = false;
    if(saveBtn) saveBtn.disabled = false;

    const total = calculateTotal(rows, userRole);
    const subtotal = total;
    const discount = 0; // Se puede implementar descuentos
    const finalTotal = subtotal - discount;

    listEl.innerHTML = rows.map(row => {
      const price = getProductPrice(row.product, userRole);
      const itemTotal = price * row.quantity;
      const isDistributor = userRole === 'distributor';
      const originalPrice = row.product.pricePublico || row.product.price || 0;
      const hasDiscount = isDistributor && originalPrice > price;

      return `
        <div class="cart-item" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;gap:12px;padding:16px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;transition:all 0.2s;">
          <div style="flex:1;">
            <div style="font-weight:600;color:#374151;margin-bottom:4px;">${row.product.name}</div>
            <div style="color:#6b7280;font-size:12px;margin-bottom:4px;">
              ${row.product.category || 'Sin categoría'} • SKU: ${row.product.sku || 'N/A'}
            </div>
            <div style="color:#6b7280;font-size:14px;">
              ${UI.formatPrice(price)} × 
              <input data-id="${row.product.id}" class="qty" type="number" min="1" max="${row.product.stock}" value="${row.quantity}" 
                     style="width:60px;background:white;border:1px solid #d1d5db;border-radius:6px;color:#374151;padding:4px 6px;margin-left:6px;text-align:center;">
              ${row.product.stock <= 5 ? `<span style="color:#f59e0b;font-size:11px;">(Stock bajo)</span>` : ''}
            </div>
            ${hasDiscount ? `
              <div style="font-size:12px;color:#059669;">
                <span style="text-decoration:line-through;color:#6b7280;">${UI.formatPrice(originalPrice)}</span>
                <span style="margin-left:8px;">Ahorro: ${UI.formatPrice(originalPrice - price)}</span>
              </div>
            ` : ''}
          </div>
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="min-width:100px;text-align:right;">
              <div style="color:#374151;font-weight:600;font-size:16px;">${UI.formatPrice(itemTotal)}</div>
              ${isDistributor ? '<div style="color:#059669;font-size:11px;">Precio distribuidor</div>' : ''}
            </div>
            <button class="btn icon" title="Eliminar" data-remove="${row.product.id}" 
                    style="background:#ef4444;border-color:#dc2626;color:white;width:32px;height:32px;transition:all 0.2s;">
              ✕
            </button>
          </div>
        </div>
      `;
    }).join('') + `
      <div class="cart-summary" style="margin-top:20px;padding:20px;background:white;border:1px solid #e5e7eb;border-radius:8px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <span style="color:#6b7280;">Subtotal</span>
          <span style="color:#374151;font-weight:600;">${UI.formatPrice(subtotal)}</span>
        </div>
        ${discount > 0 ? `
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <span style="color:#6b7280;">Descuento</span>
            <span style="color:#059669;font-weight:600;">-${UI.formatPrice(discount)}</span>
          </div>
        ` : ''}
        <div style="display:flex;justify-content:space-between;align-items:center;padding-top:12px;border-top:1px solid #e5e7eb;margin-top:12px;">
          <span style="color:#374151;font-size:18px;font-weight:700;">Total</span>
          <span style="color:#374151;font-size:20px;font-weight:700;">${UI.formatPrice(finalTotal)}</span>
        </div>
        ${userRole === 'distributor' ? `
          <div style="margin-top:8px;padding:8px;background:#f0f9ff;border:1px solid #0ea5e9;border-radius:6px;font-size:12px;color:#0c4a6e;">
            💡 Precios especiales de distribuidor aplicados
          </div>
        ` : ''}
      </div>
    `;

    // Event listeners para controles de cantidad
    listEl.querySelectorAll('.qty').forEach(input => {
      input.addEventListener('change', () => {
        const id = input.getAttribute('data-id');
        const qty = Math.max(1, Math.min(parseInt(input.value || '1', 10), parseInt(input.max || 999, 10)));
        
        if(qty !== parseInt(input.value, 10)) {
          input.value = qty;
        }
        
        StorageAPI.updateCartQuantity(id, qty);
        render();
        updateCartHeader();
      });

      input.addEventListener('blur', () => {
        const id = input.getAttribute('data-id');
        const qty = Math.max(1, parseInt(input.value || '1', 10));
        input.value = qty;
        StorageAPI.updateCartQuantity(id, qty);
        render();
        updateCartHeader();
      });
    });

    // Event listeners para botones de eliminar
    listEl.querySelectorAll('[data-remove]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-remove');
        const product = StorageAPI.getProductById(id);
        
        if(window.UI && window.UI.showConfirmModal) {
          window.UI.showConfirmModal(
            `¿Estás seguro de que quieres eliminar "${product.name}" del carrito?`,
            () => {
              StorageAPI.removeFromCart(id);
              render();
              updateCartHeader();
              if(window.UI && window.UI.showToast) {
                window.UI.showToast('Producto eliminado del carrito', 'info');
              }
            }
          );
        } else {
          if(confirm(`¿Eliminar "${product.name}" del carrito?`)) {
            StorageAPI.removeFromCart(id);
            render();
            updateCartHeader();
          }
        }
      });
    });
  }

  /**
   * Actualiza el header del carrito
   */
  function updateCartHeader(){
    if(window.UI && window.UI.updateCartHeader) {
      window.UI.updateCartHeader();
    }
  }

  /**
   * Construye el mensaje de WhatsApp para el pedido
   * @returns {string} URL de WhatsApp
   */
  function buildWhatsAppMessage(){
    const session = StorageAPI.getSession();
    const users = StorageAPI.getUsers();
    const distributor = users.find(u => u.role === 'distributor' && u.active !== false);
    const products = StorageAPI.getProducts();
    const rows = expandCart(StorageAPI.getCart(), products);
    
    if(rows.length === 0) return '';

    const lines = [];
    lines.push('🛒 *PEDIDO H&B IMPORTACIONES*');
    lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    lines.push('');
    
    rows.forEach(row => {
      const price = getProductPrice(row.product, session ? session.role : 'client');
      const itemTotal = price * row.quantity;
      lines.push(`• *${row.product.name}*`);
      lines.push(`  Cantidad: ${row.quantity}`);
      lines.push(`  Precio unitario: ${UI.formatPrice(price)}`);
      lines.push(`  Subtotal: ${UI.formatPrice(itemTotal)}`);
      lines.push('');
    });
    
    const total = calculateTotal(rows, session ? session.role : 'client');
    lines.push(`💰 *TOTAL: ${UI.formatPrice(total)}*`);
    lines.push('');
    
    if(session) {
      lines.push(`👤 Cliente: ${session.name}`);
      lines.push(`📧 Email: ${session.email}`);
    }
    
    lines.push('📅 Fecha: ' + new Date().toLocaleDateString('es-CO'));
    lines.push('');
    lines.push('Por favor confirma la disponibilidad y el tiempo de entrega. ¡Gracias!');

    const text = encodeURIComponent(lines.join('\n'));
    const phone = distributor?.whatsapp ? distributor.whatsapp.replace(/[^+\d]/g,'') : '573001112233';
    return `https://wa.me/${phone}?text=${text}`;
  }

  /**
   * Guarda el carrito actual
   */
  function saveCart(){
    const cart = StorageAPI.getCart();
    if(cart.length === 0) {
      if(window.UI && window.UI.showToast) {
        window.UI.showToast('El carrito está vacío', 'warning');
      } else {
        alert('El carrito está vacío');
      }
      return;
    }

    const cartData = {
      items: cart,
      savedAt: new Date().toISOString(),
      total: StorageAPI.getCartTotal()
    };

    localStorage.setItem('hb_cart_backup', JSON.stringify(cartData));
    
    if(window.UI && window.UI.showToast) {
      window.UI.showToast('Carrito guardado exitosamente', 'success');
    } else {
      alert('Carrito guardado exitosamente');
    }
  }

  /**
   * Carga un carrito guardado
   */
  function loadCart(){
    const savedCart = localStorage.getItem('hb_cart_backup');
    if(!savedCart) {
      if(window.UI && window.UI.showToast) {
        window.UI.showToast('No hay carrito guardado', 'warning');
      } else {
        alert('No hay carrito guardado');
      }
      return;
    }

    try {
      const cartData = JSON.parse(savedCart);
      StorageAPI.setCart(cartData.items);
      render();
      updateCartHeader();
      
      if(window.UI && window.UI.showToast) {
        window.UI.showToast('Carrito cargado exitosamente', 'success');
      } else {
        alert('Carrito cargado exitosamente');
      }
    } catch(error) {
      console.error('Error cargando carrito:', error);
      if(window.UI && window.UI.showToast) {
        window.UI.showToast('Error cargando el carrito guardado', 'error');
      } else {
        alert('Error cargando el carrito guardado');
      }
    }
  }

  /**
   * Exporta el carrito como JSON
   */
  function exportCart(){
    const cart = StorageAPI.getCart();
    if(cart.length === 0) {
      if(window.UI && window.UI.showToast) {
        window.UI.showToast('El carrito está vacío', 'warning');
      }
      return;
    }

    const cartData = {
      items: cart,
      exportedAt: new Date().toISOString(),
      total: StorageAPI.getCartTotal()
    };

    if(window.Helpers && window.Helpers.downloadJSON) {
      window.Helpers.downloadJSON(cartData, 'carrito-hb-importaciones.json');
    } else {
      // Fallback básico
      const blob = new Blob([JSON.stringify(cartData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'carrito-hb-importaciones.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }

  // Event listeners
  if(clearBtn) {
    clearBtn.addEventListener('click', () => {
      if(window.UI && window.UI.showConfirmModal) {
        window.UI.showConfirmModal(
          '¿Estás seguro de que quieres vaciar el carrito?',
          () => {
            StorageAPI.clearCart();
            render();
            updateCartHeader();
            if(window.UI && window.UI.showToast) {
              window.UI.showToast('Carrito vaciado', 'info');
            }
          }
        );
      } else {
        if(confirm('¿Vaciar el carrito?')) {
          StorageAPI.clearCart();
          render();
          updateCartHeader();
        }
      }
    });
  }

  if(confirmBtn) {
    confirmBtn.addEventListener('click', () => {
      const cart = StorageAPI.getCart();
      if(cart.length === 0) {
        if(window.UI && window.UI.showToast) {
          window.UI.showToast('Tu carrito está vacío', 'warning');
        } else {
          alert('Tu carrito está vacío');
        }
        return;
      }
      
      const url = buildWhatsAppMessage();
      window.open(url, '_blank');
    });
  }

  if(saveBtn) {
    saveBtn.addEventListener('click', saveCart);
  }

  if(loadBtn) {
    loadBtn.addEventListener('click', loadCart);
  }

  // Inicializar
  render();
  updateCartHeader();

  // API pública para uso externo
  window.CartAPI = {
    render,
    updateCartHeader,
    buildWhatsAppMessage,
    saveCart,
    loadCart,
    exportCart
  };
})();


