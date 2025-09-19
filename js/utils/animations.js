/**
 * Sistema de animaciones para H&B Importaciones
 * Aplica animaciones automáticamente a elementos cuando aparecen en pantalla
 */
(function() {
  'use strict';

  /**
   * Observador de intersección para animaciones
   */
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target;
        
        // Aplicar animación según el tipo
        if (element.classList.contains('animate-on-scroll')) {
          element.classList.add('fade-in');
        }
        
        if (element.classList.contains('slide-on-scroll')) {
          element.classList.add('slide-up');
        }
        
        if (element.classList.contains('scale-on-scroll')) {
          element.classList.add('scale-in');
        }
        
        // Agregar clase de animado
        element.classList.add('animated');
        
        // Dejar de observar el elemento
        observer.unobserve(element);
      }
    });
  }, observerOptions);

  /**
   * Inicializar animaciones cuando el DOM esté listo
   */
  function initAnimations() {
    // Animar cards de productos automáticamente
    const productCards = document.querySelectorAll('.card, .product-card');
    productCards.forEach((card, index) => {
      card.classList.add('animate-on-scroll');
      card.style.animationDelay = `${index * 0.1}s`;
      observer.observe(card);
    });

    // Animar elementos con clase especial
    const animateElements = document.querySelectorAll('[data-animate]');
    animateElements.forEach((element, index) => {
      const animationType = element.dataset.animate;
      element.classList.add(`${animationType}-on-scroll`);
      element.style.animationDelay = `${index * 0.1}s`;
      observer.observe(element);
    });

    // Animar chips con delay escalonado
    const chips = document.querySelectorAll('.chip');
    chips.forEach((chip, index) => {
      chip.style.animationDelay = `${index * 0.05}s`;
      chip.classList.add('scale-on-scroll');
      observer.observe(chip);
    });
  }

  /**
   * Agregar efectos de hover mejorados
   */
  function enhanceHoverEffects() {
    // Efecto de seguimiento del mouse en cards
    const cards = document.querySelectorAll('.card, .product-card');
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
      });
      
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });

    // Efecto de onda en botones
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
      button.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
          position: absolute;
          width: ${size}px;
          height: ${size}px;
          left: ${x}px;
          top: ${y}px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          transform: scale(0);
          animation: ripple 0.6s ease-out;
          pointer-events: none;
        `;
        
        this.appendChild(ripple);
        
        // Limpiar el elemento después de la animación
        setTimeout(() => {
          ripple.remove();
        }, 600);
      });
    });
  }

  /**
   * Agregar animaciones de loading a elementos que lo necesiten
   */
  function addLoadingAnimations() {
    const loadingElements = document.querySelectorAll('.loading');
    loadingElements.forEach(element => {
      // Agregar clase de animación automáticamente
      if (!element.querySelector('.loading-spinner')) {
        element.style.position = 'relative';
      }
    });
  }

  /**
   * Inicializar todas las animaciones
   */
  function init() {
    // Esperar a que el DOM esté listo
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        initAnimations();
        enhanceHoverEffects();
        addLoadingAnimations();
      });
    } else {
      initAnimations();
      enhanceHoverEffects();
      addLoadingAnimations();
    }

    // Agregar estilos CSS para el efecto de onda
    if (!document.querySelector('#ripple-styles')) {
      const style = document.createElement('style');
      style.id = 'ripple-styles';
      style.textContent = `
        @keyframes ripple {
          to {
            transform: scale(2);
            opacity: 0;
          }
        }
        
        .btn {
          position: relative;
          overflow: hidden;
        }
      `;
      document.head.appendChild(style);
    }
  }

  // Exportar funciones para uso global
  window.HBAnimations = {
    init: init,
    observer: observer,
    initAnimations: initAnimations,
    enhanceHoverEffects: enhanceHoverEffects
  };

  // Auto-inicializar
  init();
})();
