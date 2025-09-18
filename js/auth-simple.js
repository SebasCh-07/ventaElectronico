/**
 * Sistema de autenticación simplificado para H&B Importaciones
 */
(function(){
  'use strict';

  const form = document.getElementById('login-form');
  if(!form) return;

  // Usuarios demo
  const demoUsers = {
    admin: { email: 'admin@hb.local', password: 'admin123', name: 'Administrador', role: 'admin' },
    distributor: { email: 'distri@hb.local', password: 'distri123', name: 'Distribuidora', role: 'distributor' },
    client: { email: 'cliente@hb.local', password: 'cliente123', name: 'Cliente', role: 'client' }
  };

  /**
   * Valida las credenciales del usuario
   */
  function validateCredentials(email, password) {
    return Object.values(demoUsers).find(user => 
      user.email.toLowerCase() === email.toLowerCase() && 
      user.password === password
    );
  }

  /**
   * Redirige al usuario según su rol
   */
  function redirectByRole(user) {
    const currentPath = window.location.pathname;
    let redirectUrl = '../../index.html'; // Default

    switch(user.role) {
      case 'admin':
        redirectUrl = '../admin/index.html';
        break;
      case 'distributor':
        redirectUrl = '../distri/index.html';
        break;
      case 'client':
        redirectUrl = '../user/index.html';
        break;
    }

    // Ajustar ruta según ubicación actual
    if (currentPath.includes('/auth/')) {
      // Ya estamos en auth, usar ruta relativa
    } else if (currentPath.includes('/admin/') || 
               currentPath.includes('/distri/') || 
               currentPath.includes('/user/')) {
      // Estamos en una subcarpeta, ajustar ruta
      redirectUrl = redirectUrl.replace('../', '../../');
    }

    // Mostrar mensaje de bienvenida
    alert(`¡Bienvenido, ${user.name}! Redirigiendo...`);

    // Redirigir después de un breve delay
    setTimeout(() => {
      window.location.href = redirectUrl;
    }, 1000);
  }

  /**
   * Maneja el proceso de login
   */
  function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim().toLowerCase();
    const password = document.getElementById('password').value;

    // Validaciones básicas
    if (!email || !password) {
      alert('Por favor completa todos los campos');
      return;
    }

    // Validar credenciales
    const user = validateCredentials(email, password);
    
    if (!user) {
      alert('Credenciales inválidas. Usa los botones de demo para autocompletar.');
      return;
    }

    // Guardar sesión en localStorage
    const session = { 
      id: user.role + '_' + Date.now(),
      role: user.role, 
      name: user.name,
      email: user.email,
      loginTime: new Date().toISOString()
    };
    
    localStorage.setItem('hb_session', JSON.stringify(session));

    // Redirigir según rol
    redirectByRole(user);
  }

  /**
   * Configura el formulario de login
   */
  function setupLoginForm() {
    form.addEventListener('submit', handleLogin);
  }

  /**
   * Configura los botones de autocompletado
   */
  function setupDemoButtons() {
    document.querySelectorAll('[data-fill-user]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const key = btn.getAttribute('data-fill-user');
        const user = demoUsers[key];
        
        if (!user) return;

        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');

        if (emailInput) emailInput.value = user.email;
        if (passwordInput) passwordInput.value = user.password;

        // Mostrar información del usuario demo
        alert(`Datos de ${user.name} cargados`);

        // Enfocar en el botón de login
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.focus();
      });
    });
  }

  /**
   * Verifica si hay una sesión activa y redirige
   */
  function checkExistingSession() {
    const sessionData = localStorage.getItem('hb_session');
    if (sessionData) {
      try {
        const session = JSON.parse(sessionData);
        redirectByRole(session);
      } catch (e) {
        // Sesión inválida, continuar con login
      }
    }
  }

  /**
   * Inicializa el sistema de autenticación
   */
  function initAuth() {
    checkExistingSession();
    setupLoginForm();
    setupDemoButtons();
  }

  // Inicializar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuth);
  } else {
    initAuth();
  }
})();
