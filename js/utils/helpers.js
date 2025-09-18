/**
 * Funciones auxiliares para H&B Importaciones
 * Formateo, validaciones y utilidades comunes
 */
(function(){
  'use strict';

  /**
   * Formatea un número como precio en pesos colombianos
   * @param {number} amount - Cantidad a formatear
   * @param {string} currency - Símbolo de moneda (default: '$')
   * @returns {string} Precio formateado
   */
  function formatPrice(amount, currency = '$') {
    if (typeof amount !== 'number' || isNaN(amount)) {
      return currency + '0,00';
    }
    
    return currency + amount.toLocaleString('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  }

  /**
   * Formatea un número con separadores de miles
   * @param {number} number - Número a formatear
   * @returns {string} Número formateado
   */
  function formatNumber(number) {
    if (typeof number !== 'number' || isNaN(number)) {
      return '0';
    }
    
    return number.toLocaleString('es-CO');
  }

  /**
   * Formatea una fecha en formato legible
   * @param {string|Date} date - Fecha a formatear
   * @param {boolean} includeTime - Incluir hora (default: false)
   * @returns {string} Fecha formateada
   */
  function formatDate(date, includeTime = false) {
    if (!date) return '';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return 'Fecha inválida';
    }
    
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    
    if (includeTime) {
      options.hour = '2-digit';
      options.minute = '2-digit';
    }
    
    return dateObj.toLocaleDateString('es-CO', options);
  }

  /**
   * Formatea una fecha relativa (hace X tiempo)
   * @param {string|Date} date - Fecha a formatear
   * @returns {string} Fecha relativa
   */
  function formatRelativeDate(date) {
    if (!date) return '';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now - dateObj;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Hace un momento';
    if (diffMins < 60) return `Hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    if (diffDays < 7) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    
    return formatDate(date);
  }

  /**
   * Valida un email
   * @param {string} email - Email a validar
   * @returns {boolean} Es válido
   */
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Valida un teléfono colombiano
   * @param {string} phone - Teléfono a validar
   * @returns {boolean} Es válido
   */
  function isValidPhone(phone) {
    const phoneRegex = /^(\+57|57)?[1-9]\d{9}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  /**
   * Valida una contraseña (mínimo 6 caracteres)
   * @param {string} password - Contraseña a validar
   * @returns {boolean} Es válida
   */
  function isValidPassword(password) {
    return typeof password === 'string' && password.length >= 6;
  }

  /**
   * Valida que un campo no esté vacío
   * @param {string} value - Valor a validar
   * @returns {boolean} No está vacío
   */
  function isNotEmpty(value) {
    return typeof value === 'string' && value.trim().length > 0;
  }

  /**
   * Valida que un número sea positivo
   * @param {number} number - Número a validar
   * @returns {boolean} Es positivo
   */
  function isPositiveNumber(number) {
    return typeof number === 'number' && !isNaN(number) && number > 0;
  }

  /**
   * Valida que un número sea entero positivo
   * @param {number} number - Número a validar
   * @returns {boolean} Es entero positivo
   */
  function isPositiveInteger(number) {
    return isPositiveNumber(number) && Number.isInteger(number);
  }

  /**
   * Sanitiza un string removiendo caracteres peligrosos
   * @param {string} str - String a sanitizar
   * @returns {string} String sanitizado
   */
  function sanitizeString(str) {
    if (typeof str !== 'string') return '';
    
    return str
      .trim()
      .replace(/[<>]/g, '') // Remover < y >
      .replace(/javascript:/gi, '') // Remover javascript:
      .replace(/on\w+=/gi, ''); // Remover event handlers
  }

  /**
   * Capitaliza la primera letra de cada palabra
   * @param {string} str - String a capitalizar
   * @returns {string} String capitalizado
   */
  function capitalizeWords(str) {
    if (typeof str !== 'string') return '';
    
    return str
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Genera un ID único basado en timestamp
   * @param {string} prefix - Prefijo para el ID
   * @returns {string} ID único
   */
  function generateId(prefix = '') {
    return prefix + Date.now() + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Debounce function para limitar llamadas de función
   * @param {Function} func - Función a ejecutar
   * @param {number} wait - Tiempo de espera en ms
   * @returns {Function} Función con debounce
   */
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

  /**
   * Throttle function para limitar llamadas de función
   * @param {Function} func - Función a ejecutar
   * @param {number} limit - Límite de tiempo en ms
   * @returns {Function} Función con throttle
   */
  function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /**
   * Copia texto al portapapeles
   * @param {string} text - Texto a copiar
   * @returns {Promise<boolean>} Éxito de la operación
   */
  async function copyToClipboard(text) {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        return true;
      } else {
        // Fallback para navegadores antiguos
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        return true;
      }
    } catch (err) {
      console.error('Error copiando al portapapeles:', err);
      return false;
    }
  }

  /**
   * Descarga un archivo JSON
   * @param {Object} data - Datos a descargar
   * @param {string} filename - Nombre del archivo
   */
  function downloadJSON(data, filename = 'data.json') {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Muestra una notificación toast
   * @param {string} message - Mensaje a mostrar
   * @param {string} type - Tipo de notificación (success, error, warning, info)
   * @param {number} duration - Duración en ms (default: 3000)
   */
  function showToast(message, type = 'info', duration = 3000) {
    // Crear contenedor si no existe
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        gap: 10px;
      `;
      document.body.appendChild(container);
    }

    // Crear toast
    const toast = document.createElement('div');
    toast.style.cssText = `
      background: ${getToastColor(type)};
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      max-width: 300px;
      word-wrap: break-word;
      animation: slideIn 0.3s ease-out;
    `;
    toast.textContent = message;

    // Agregar estilos de animación si no existen
    if (!document.getElementById('toast-styles')) {
      const style = document.createElement('style');
      style.id = 'toast-styles';
      style.textContent = `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }

    container.appendChild(toast);

    // Remover después del tiempo especificado
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, duration);
  }

  /**
   * Obtiene el color del toast según el tipo
   * @param {string} type - Tipo de toast
   * @returns {string} Color CSS
   */
  function getToastColor(type) {
    const colors = {
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6'
    };
    return colors[type] || colors.info;
  }

  /**
   * Confirma una acción con el usuario
   * @param {string} message - Mensaje de confirmación
   * @param {string} title - Título del diálogo
   * @returns {Promise<boolean>} Usuario confirmó
   */
  function confirmAction(message, title = 'Confirmar') {
    return new Promise((resolve) => {
      const result = window.confirm(`${title}\n\n${message}`);
      resolve(result);
    });
  }

  /**
   * Obtiene parámetros de URL
   * @param {string} name - Nombre del parámetro
   * @returns {string|null} Valor del parámetro
   */
  function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
  }

  /**
   * Establece parámetros de URL
   * @param {string} name - Nombre del parámetro
   * @param {string} value - Valor del parámetro
   */
  function setUrlParameter(name, value) {
    const url = new URL(window.location);
    url.searchParams.set(name, value);
    window.history.replaceState({}, '', url);
  }

  /**
   * Remueve parámetros de URL
   * @param {string} name - Nombre del parámetro
   */
  function removeUrlParameter(name) {
    const url = new URL(window.location);
    url.searchParams.delete(name);
    window.history.replaceState({}, '', url);
  }

  /**
   * Valida formulario completo
   * @param {HTMLFormElement} form - Formulario a validar
   * @param {Object} rules - Reglas de validación
   * @returns {Object} Resultado de validación
   */
  function validateForm(form, rules) {
    const errors = {};
    const formData = new FormData(form);
    
    Object.entries(rules).forEach(([fieldName, fieldRules]) => {
      const value = formData.get(fieldName);
      const fieldErrors = [];
      
      fieldRules.forEach(rule => {
        if (rule.required && !isNotEmpty(value)) {
          fieldErrors.push(`${rule.message || 'Este campo es requerido'}`);
        } else if (rule.email && !isValidEmail(value)) {
          fieldErrors.push(`${rule.message || 'Email inválido'}`);
        } else if (rule.phone && !isValidPhone(value)) {
          fieldErrors.push(`${rule.message || 'Teléfono inválido'}`);
        } else if (rule.password && !isValidPassword(value)) {
          fieldErrors.push(`${rule.message || 'Contraseña debe tener al menos 6 caracteres'}`);
        } else if (rule.minLength && value && value.length < rule.minLength) {
          fieldErrors.push(`${rule.message || `Mínimo ${rule.minLength} caracteres`}`);
        } else if (rule.maxLength && value && value.length > rule.maxLength) {
          fieldErrors.push(`${rule.message || `Máximo ${rule.maxLength} caracteres`}`);
        } else if (rule.pattern && value && !rule.pattern.test(value)) {
          fieldErrors.push(`${rule.message || 'Formato inválido'}`);
        }
      });
      
      if (fieldErrors.length > 0) {
        errors[fieldName] = fieldErrors;
      }
    });
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // API pública
  window.Helpers = {
    // Formateo
    formatPrice,
    formatNumber,
    formatDate,
    formatRelativeDate,
    
    // Validaciones
    isValidEmail,
    isValidPhone,
    isValidPassword,
    isNotEmpty,
    isPositiveNumber,
    isPositiveInteger,
    
    // Utilidades de string
    sanitizeString,
    capitalizeWords,
    
    // Utilidades generales
    generateId,
    debounce,
    throttle,
    copyToClipboard,
    downloadJSON,
    
    // UI
    showToast,
    confirmAction,
    
    // URL
    getUrlParameter,
    setUrlParameter,
    removeUrlParameter,
    
    // Formularios
    validateForm
  };
})();
